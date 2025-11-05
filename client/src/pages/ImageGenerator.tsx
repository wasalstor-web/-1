import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Image as ImageIcon, Palette, Sparkles, Download } from "lucide-react";

interface ImageResponse {
  imageUrl: string;
  revisedPrompt?: string;
}

interface LogoResponse {
  imageUrl: string;
}

interface BrandIdentityResponse {
  logoDescription: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  visualStyle: string;
  applications: string[];
}

export default function ImageGenerator() {
  const { toast } = useToast();
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSize, setImageSize] = useState<"1024x1024" | "1792x1024" | "1024x1792">("1024x1024");
  const [imageQuality, setImageQuality] = useState<"standard" | "hd">("standard");
  const [imageStyle, setImageStyle] = useState<"vivid" | "natural">("vivid");
  const [generatedImage, setGeneratedImage] = useState<ImageResponse | null>(null);

  const [logoBusinessName, setLogoBusinessName] = useState("");
  const [logoIndustry, setLogoIndustry] = useState("");
  const [logoStyle, setLogoStyle] = useState("");
  const [generatedLogo, setGeneratedLogo] = useState<LogoResponse | null>(null);

  const [brandBusinessName, setBrandBusinessName] = useState("");
  const [brandIndustry, setBrandIndustry] = useState("");
  const [brandValues, setBrandValues] = useState("");
  const [generatedBrand, setGeneratedBrand] = useState<BrandIdentityResponse | null>(null);

  // Image generation mutation
  const generateImageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/ai/generate-image", "POST", {
        prompt: imagePrompt,
        size: imageSize,
        quality: imageQuality,
        style: imageStyle,
      });
      return response as unknown as ImageResponse;
    },
    onSuccess: (data) => {
      setGeneratedImage(data);
      toast({
        title: "✅ نجح توليد الصورة",
        description: "تم إنشاء الصورة بنجاح!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ فشل توليد الصورة",
        description: error.message || "حدث خطأ أثناء توليد الصورة",
        variant: "destructive",
      });
    },
  });

  // Logo generation mutation
  const generateLogoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/ai/generate-logo", "POST", {
        businessName: logoBusinessName,
        industry: logoIndustry,
        style: logoStyle,
      });
      return response as unknown as LogoResponse;
    },
    onSuccess: (data) => {
      setGeneratedLogo(data);
      toast({
        title: "✅ نجح توليد الشعار",
        description: "تم إنشاء الشعار بنجاح!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ فشل توليد الشعار",
        description: error.message || "حدث خطأ أثناء توليد الشعار",
        variant: "destructive",
      });
    },
  });

  // Brand identity generation mutation
  const generateBrandMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/ai/generate-brand-identity", "POST", {
        businessName: brandBusinessName,
        industry: brandIndustry,
        values: brandValues,
      });
      return response as unknown as BrandIdentityResponse;
    },
    onSuccess: (data) => {
      setGeneratedBrand(data);
      toast({
        title: "✅ نجح توليد الهوية",
        description: "تم إنشاء الهوية التجارية بنجاح!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ فشل توليد الهوية",
        description: error.message || "حدث خطأ أثناء توليد الهوية",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          استوديو التصميم بالذكاء الاصطناعي
        </h1>
        <p className="text-muted-foreground text-lg">
          ولّد صور احترافية، شعارات، وهويات تجارية كاملة باستخدام DALL-E 3
        </p>
      </div>

      <Tabs defaultValue="image" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image" data-testid="tab-image">
            <ImageIcon className="ml-2 h-4 w-4" />
            توليد صور
          </TabsTrigger>
          <TabsTrigger value="logo" data-testid="tab-logo">
            <Palette className="ml-2 h-4 w-4" />
            توليد شعار
          </TabsTrigger>
          <TabsTrigger value="brand" data-testid="tab-brand">
            <Sparkles className="ml-2 h-4 w-4" />
            هوية تجارية
          </TabsTrigger>
        </TabsList>

        {/* Image Generation Tab */}
        <TabsContent value="image" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الصورة</CardTitle>
                <CardDescription>
                  صِف الصورة التي تريد توليدها بالتفصيل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-prompt">وصف الصورة</Label>
                  <Textarea
                    id="image-prompt"
                    data-testid="input-image-prompt"
                    placeholder="مثال: قطة لطيفة تلعب بالكرة في حديقة مشمسة، أسلوب رسوم متحركة"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-size">الحجم</Label>
                    <Select value={imageSize} onValueChange={(value: any) => setImageSize(value)}>
                      <SelectTrigger id="image-size" data-testid="select-image-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">مربع (1024×1024)</SelectItem>
                        <SelectItem value="1792x1024">عرضي (1792×1024)</SelectItem>
                        <SelectItem value="1024x1792">طولي (1024×1792)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-quality">الجودة</Label>
                    <Select value={imageQuality} onValueChange={(value: any) => setImageQuality(value)}>
                      <SelectTrigger id="image-quality" data-testid="select-image-quality">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">عادي</SelectItem>
                        <SelectItem value="hd">عالي الدقة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-style">الأسلوب</Label>
                    <Select value={imageStyle} onValueChange={(value: any) => setImageStyle(value)}>
                      <SelectTrigger id="image-style" data-testid="select-image-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vivid">حيوي</SelectItem>
                        <SelectItem value="natural">طبيعي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => generateImageMutation.mutate()}
                  disabled={!imagePrompt || generateImageMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-image"
                >
                  {generateImageMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="ml-2 h-4 w-4" />
                      ولّد الصورة
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>الصورة المولدة</CardTitle>
                  {generatedImage.revisedPrompt && (
                    <CardDescription className="text-sm">
                      الوصف المحسّن: {generatedImage.revisedPrompt}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={generatedImage.imageUrl}
                      alt="Generated"
                      className="w-full h-full object-cover"
                      data-testid="img-generated-image"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(generatedImage.imageUrl, '_blank')}
                    data-testid="button-download-image"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تحميل الصورة
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Logo Generation Tab */}
        <TabsContent value="logo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الشعار</CardTitle>
                <CardDescription>
                  أخبرنا عن مشروعك لنصمم شعاراً احترافياً
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-business">اسم المشروع/الشركة</Label>
                  <Input
                    id="logo-business"
                    data-testid="input-logo-business"
                    placeholder="مثال: شركة التقنية المتقدمة"
                    value={logoBusinessName}
                    onChange={(e) => setLogoBusinessName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-industry">المجال</Label>
                  <Input
                    id="logo-industry"
                    data-testid="input-logo-industry"
                    placeholder="مثال: تقنية المعلومات"
                    value={logoIndustry}
                    onChange={(e) => setLogoIndustry(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-style">الأسلوب المفضل</Label>
                  <Input
                    id="logo-style"
                    data-testid="input-logo-style"
                    placeholder="مثال: عصري، بسيط، احترافي"
                    value={logoStyle}
                    onChange={(e) => setLogoStyle(e.target.value)}
                  />
                </div>

                <Button
                  onClick={() => generateLogoMutation.mutate()}
                  disabled={!logoBusinessName || generateLogoMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-logo"
                >
                  {generateLogoMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Palette className="ml-2 h-4 w-4" />
                      ولّد الشعار
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedLogo && (
              <Card>
                <CardHeader>
                  <CardTitle>الشعار المولد</CardTitle>
                  <CardDescription>
                    يمكنك تحميل الشعار واستخدامه مباشرة
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                    <img
                      src={generatedLogo.imageUrl}
                      alt="Generated Logo"
                      className="w-full h-full object-contain p-8"
                      data-testid="img-generated-logo"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(generatedLogo.imageUrl, '_blank')}
                    data-testid="button-download-logo"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تحميل الشعار
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Brand Identity Tab */}
        <TabsContent value="brand" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الهوية</CardTitle>
                <CardDescription>
                  أنشئ هوية تجارية كاملة بألوان، خطوط، ونمط بصري
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand-business">اسم المشروع</Label>
                  <Input
                    id="brand-business"
                    data-testid="input-brand-business"
                    placeholder="مثال: مقهى الورد"
                    value={brandBusinessName}
                    onChange={(e) => setBrandBusinessName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-industry">المجال</Label>
                  <Input
                    id="brand-industry"
                    data-testid="input-brand-industry"
                    placeholder="مثال: مطاعم ومقاهي"
                    value={brandIndustry}
                    onChange={(e) => setBrandIndustry(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-values">القيم والرسالة</Label>
                  <Textarea
                    id="brand-values"
                    data-testid="input-brand-values"
                    placeholder="مثال: نقدم أفضل أنواع القهوة في بيئة مريحة وهادئة"
                    value={brandValues}
                    onChange={(e) => setBrandValues(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => generateBrandMutation.mutate()}
                  disabled={!brandBusinessName || !brandIndustry || generateBrandMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-brand"
                >
                  {generateBrandMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles className="ml-2 h-4 w-4" />
                      ولّد الهوية التجارية
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedBrand && (
              <Card>
                <CardHeader>
                  <CardTitle>الهوية التجارية</CardTitle>
                  <CardDescription>
                    دليل هوية العلامة التجارية الكامل
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Description */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">وصف الشعار</h3>
                    <p className="text-sm text-muted-foreground" data-testid="text-logo-description">
                      {generatedBrand.logoDescription}
                    </p>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">الألوان</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div
                          className="h-12 rounded-md"
                          style={{ backgroundColor: generatedBrand.colorPalette.primary }}
                          data-testid="color-primary"
                        />
                        <p className="text-xs text-muted-foreground">أساسي: {generatedBrand.colorPalette.primary}</p>
                      </div>
                      <div className="space-y-1">
                        <div
                          className="h-12 rounded-md"
                          style={{ backgroundColor: generatedBrand.colorPalette.secondary }}
                          data-testid="color-secondary"
                        />
                        <p className="text-xs text-muted-foreground">ثانوي: {generatedBrand.colorPalette.secondary}</p>
                      </div>
                      <div className="space-y-1">
                        <div
                          className="h-12 rounded-md"
                          style={{ backgroundColor: generatedBrand.colorPalette.accent }}
                          data-testid="color-accent"
                        />
                        <p className="text-xs text-muted-foreground">مميز: {generatedBrand.colorPalette.accent}</p>
                      </div>
                      <div className="space-y-1">
                        <div
                          className="h-12 rounded-md border"
                          style={{ backgroundColor: generatedBrand.colorPalette.neutral }}
                          data-testid="color-neutral"
                        />
                        <p className="text-xs text-muted-foreground">محايد: {generatedBrand.colorPalette.neutral}</p>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">الخطوط</h3>
                    <div className="space-y-1">
                      <p className="text-sm" data-testid="text-heading-font">
                        <span className="text-muted-foreground">العناوين:</span> {generatedBrand.typography.headingFont}
                      </p>
                      <p className="text-sm" data-testid="text-body-font">
                        <span className="text-muted-foreground">النص:</span> {generatedBrand.typography.bodyFont}
                      </p>
                    </div>
                  </div>

                  {/* Visual Style */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">النمط البصري</h3>
                    <p className="text-sm text-muted-foreground" data-testid="text-visual-style">
                      {generatedBrand.visualStyle}
                    </p>
                  </div>

                  {/* Applications */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">التطبيقات</h3>
                    <ul className="text-sm text-muted-foreground space-y-1" data-testid="list-applications">
                      {generatedBrand.applications.map((app, idx) => (
                        <li key={idx}>• {app}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
