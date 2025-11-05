import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ShoppingCart, 
  Star, 
  Download, 
  Sparkles, 
  Bot, 
  FileText, 
  Image as ImageIcon, 
  BarChart, 
  Mic, 
  Mail,
  ArrowLeft
} from "lucide-react";
import type { Product, Category } from "@shared/schema";

const categoryIcons: Record<string, React.ReactNode> = {
  "chatbots": <Bot className="w-6 h-6" />,
  "content-generation": <FileText className="w-6 h-6" />,
  "image-ai": <ImageIcon className="w-6 h-6" />,
  "data-analysis": <BarChart className="w-6 h-6" />,
  "voice-ai": <Mic className="w-6 h-6" />,
  "email-automation": <Mail className="w-6 h-6" />,
};

export default function Marketplace() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts = [], isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?featured=true"],
  });

  const { data: allProducts = [], isLoading: allProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="relative px-6 py-24 overflow-hidden">
        {/* Animated Neon Grid Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-destructive/10" />
          <div className="absolute inset-0 opacity-30" 
               style={{
                 backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
                 backgroundSize: '50px 50px'
               }} 
          />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 neon-glow-cyan">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">منصة AI المتكاملة</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-6 neon-text-gradient">
            اكتشف أفضل حلول الذكاء الاصطناعي
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            أنظمة AI جاهزة للاستخدام، من بوتات الدردشة الذكية إلى أدوات تحليل البيانات المتقدمة
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg font-bold neon-glow-cyan"
              data-testid="button-explore-products"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              استكشف المنتجات
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg font-bold neon-border-glow"
              asChild
              data-testid="button-try-ai-tools"
            >
              <Link href="/workspace">
                <Sparkles className="w-5 h-5 ml-2" />
                جرّب أدوات AI مجاناً
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">المنتجات المميزة</h2>
                <p className="text-muted-foreground">أفضل الحلول الذكية المختارة لك</p>
              </div>
              <Badge className="neon-glow-purple" data-testid="badge-featured-count">
                {featuredProducts.length} منتج
              </Badge>
            </div>

            {featuredLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-96 animate-pulse neon-border-glow" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-6 py-16 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">تصفح حسب الفئة</h2>

            {categoriesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-32 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="p-6 hover:-translate-y-2 transition-all cursor-pointer neon-border-glow hover:neon-glow-cyan group"
                    data-testid={`category-card-${category.slug}`}
                  >
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform neon-glow-cyan">
                        {categoryIcons[category.slug] || <Sparkles className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Products (excluding featured to avoid duplication) */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">منتجات أخرى</h2>
            <Badge variant="secondary" data-testid="badge-total-products">
              {allProducts.filter(p => !p.isFeatured).length} منتج متاح
            </Badge>
          </div>

          {allProductsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-96 animate-pulse" />
              ))}
            </div>
          ) : allProducts.filter(p => !p.isFeatured).length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">لا توجد منتجات أخرى حالياً</h3>
              <p className="text-muted-foreground">سيتم إضافة منتجات جديدة قريباً</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProducts.filter(p => !p.isFeatured).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(0)}`;
  };

  return (
    <Card 
      className="overflow-hidden hover:-translate-y-2 transition-all group neon-border-glow hover:neon-glow-purple"
      data-testid={`product-card-${product.slug}`}
    >
      {/* Product Image/Preview */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="w-16 h-16 text-primary/40" />
          )}
        </div>
        {product.isFeatured && (
          <Badge className="absolute top-4 left-4 neon-glow-pink" data-testid={`badge-featured-${product.slug}`}>
            <Star className="w-3 h-3 ml-1" />
            مميز
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors" data-testid={`text-product-name-${product.slug}`}>
          {product.name}
        </h3>
        
        {product.shortDescription && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span data-testid={`text-downloads-${product.slug}`}>{product.totalSales || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span data-testid={`text-rating-${product.slug}`}>{product.rating || "0"}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-3xl font-black neon-text-gradient" data-testid={`text-price-${product.slug}`}>
              {formatPrice(product.price)}
            </span>
          </div>
          <Link href={`/products/${product.slug}`}>
            <Button 
              className="neon-glow-cyan"
              data-testid={`button-view-product-${product.slug}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              عرض التفاصيل
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
