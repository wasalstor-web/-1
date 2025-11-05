import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="page-settings">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات الحساب والتطبيق</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الحساب</CardTitle>
          <CardDescription>قم بتحديث معلومات حسابك الشخصية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input id="name" placeholder="أدخل اسمك" data-testid="input-name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" placeholder="your@email.com" data-testid="input-email" />
          </div>
          <Button data-testid="button-save-profile">حفظ التغييرات</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات AI</CardTitle>
          <CardDescription>تخصيص تفضيلات الذكاء الاصطناعي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save">حفظ تلقائي للمحادثات</Label>
              <p className="text-sm text-muted-foreground">احفظ جميع المحادثات تلقائياً</p>
            </div>
            <Switch id="auto-save" defaultChecked data-testid="switch-auto-save" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="context-memory">ذاكرة السياق</Label>
              <p className="text-sm text-muted-foreground">تذكر المحادثات السابقة</p>
            </div>
            <Switch id="context-memory" defaultChecked data-testid="switch-context-memory" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="default-model">النموذج الافتراضي</Label>
            <Input id="default-model" value="GPT-4" readOnly data-testid="input-default-model" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مفاتيح API</CardTitle>
          <CardDescription>إدارة مفاتيح الوصول لنماذج AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input id="openai-key" type="password" placeholder="sk-..." data-testid="input-openai-key" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anthropic-key">Anthropic API Key</Label>
            <Input id="anthropic-key" type="password" placeholder="sk-ant-..." data-testid="input-anthropic-key" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Google Gemini API Key</Label>
            <Input id="gemini-key" type="password" placeholder="AIza..." data-testid="input-gemini-key" />
          </div>
          <Button variant="outline" data-testid="button-update-keys">تحديث المفاتيح</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">منطقة الخطر</CardTitle>
          <CardDescription>إجراءات لا يمكن التراجع عنها</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" data-testid="button-delete-account">
            حذف الحساب نهائياً
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
