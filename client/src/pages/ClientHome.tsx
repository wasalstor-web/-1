import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  BarChart3,
  Plug,
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Mail,
  Phone,
  MapPin,
  Code,
  Database,
  Cloud,
  Building2,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema, type ContactForm } from '@shared/schema';

export default function ClientHome() {
  const { toast } = useToast();
  
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      message: '',
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'تم إرسال رسالتك بنجاح',
        description: 'سنتواصل معك في أقرب وقت ممكن',
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل الإرسال',
        description: error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    contactMutation.mutate(data);
  };

  const solutions = [
    {
      icon: Bot,
      title: 'AI Automation',
      titleAr: 'أتمتة الذكاء الاصطناعي',
      description: 'Automate repetitive tasks and workflows with intelligent AI agents',
      descriptionAr: 'أتمتة المهام المتكررة والعمليات باستخدام وكلاء ذكاء اصطناعي',
    },
    {
      icon: BarChart3,
      title: 'AI Analytics',
      titleAr: 'تحليلات الذكاء الاصطناعي',
      description: 'Extract insights from data with advanced AI-powered analytics',
      descriptionAr: 'استخراج رؤى من البيانات باستخدام تحليلات متقدمة مدعومة بالذكاء الاصطناعي',
    },
    {
      icon: Plug,
      title: 'API Integration',
      titleAr: 'تكامل API',
      description: 'Seamlessly integrate AI capabilities into your existing systems',
      descriptionAr: 'دمج قدرات الذكاء الاصطناعي بسلاسة في أنظمتك الحالية',
    },
  ];

  const features = [
    {
      title: 'Enterprise-Grade Security',
      titleAr: 'أمان على مستوى المؤسسات',
      description: 'Bank-level encryption and compliance with international standards',
      descriptionAr: 'تشفير على مستوى البنوك والامتثال للمعايير الدولية',
      icon: Shield,
    },
    {
      title: 'Lightning Fast Performance',
      titleAr: 'أداء سريع للغاية',
      description: 'Optimized infrastructure for real-time AI processing',
      descriptionAr: 'بنية تحتية محسّنة لمعالجة الذكاء الاصطناعي في الوقت الفعلي',
      icon: Zap,
    },
    {
      title: 'Smart Automation',
      titleAr: 'أتمتة ذكية',
      description: 'Reduce manual work by up to 80% with AI-powered workflows',
      descriptionAr: 'تقليل العمل اليدوي بنسبة تصل إلى 80٪ مع سير عمل مدعوم بالذكاء الاصطناعي',
      icon: Sparkles,
    },
  ];

  const integrations = [
    { name: 'OpenAI', icon: Code },
    { name: 'Google AI', icon: Database },
    { name: 'Microsoft Azure', icon: Cloud },
    { name: 'AWS', icon: Building2 },
    { name: 'Anthropic', icon: Code },
    { name: 'Hugging Face', icon: Database },
    { name: 'IBM Watson', icon: Cloud },
    { name: 'Salesforce', icon: Building2 },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      nameAr: 'المبتدئ',
      price: '$299',
      period: '/month',
      periodAr: '/شهرياً',
      description: 'Perfect for small teams getting started with AI',
      descriptionAr: 'مثالي للفرق الصغيرة التي تبدأ مع الذكاء الاصطناعي',
      features: [
        '5 AI Projects',
        '10,000 API Calls/month',
        'Email Support',
        'Basic Analytics',
      ],
      featuresAr: [
        '5 مشاريع AI',
        '10,000 استدعاء API شهرياً',
        'دعم عبر البريد الإلكتروني',
        'تحليلات أساسية',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      nameAr: 'المحترف',
      price: '$899',
      period: '/month',
      periodAr: '/شهرياً',
      description: 'Advanced features for growing businesses',
      descriptionAr: 'ميزات متقدمة للشركات النامية',
      features: [
        '25 AI Projects',
        '100,000 API Calls/month',
        'Priority Support',
        'Advanced Analytics',
        'Custom Integrations',
      ],
      featuresAr: [
        '25 مشروع AI',
        '100,000 استدعاء API شهرياً',
        'دعم ذو أولوية',
        'تحليلات متقدمة',
        'تكاملات مخصصة',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      nameAr: 'المؤسسات',
      price: 'Custom',
      priceAr: 'مخصص',
      period: '',
      periodAr: '',
      description: 'Tailored solutions for large organizations',
      descriptionAr: 'حلول مخصصة للمؤسسات الكبيرة',
      features: [
        'Unlimited Projects',
        'Unlimited API Calls',
        'Dedicated Support',
        'Enterprise Analytics',
        'White-label Options',
        'SLA Guarantee',
      ],
      featuresAr: [
        'مشاريع غير محدودة',
        'استدعاءات API غير محدودة',
        'دعم مخصص',
        'تحليلات المؤسسات',
        'خيارات White-label',
        'ضمان SLA',
      ],
      highlighted: false,
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', labelAr: 'مستخدم نشط', icon: Users },
    { value: '99.9%', label: 'Uptime', labelAr: 'وقت التشغيل', icon: TrendingUp },
    { value: '500+', label: 'Enterprise Clients', labelAr: 'عميل مؤسسي', icon: Building2 },
    { value: '4.9/5', label: 'Customer Rating', labelAr: 'تقييم العملاء', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">Mubsat AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#solutions" className="transition-colors hover:text-primary" data-testid="link-solutions">
              Solutions
            </a>
            <a href="#products" className="transition-colors hover:text-primary" data-testid="link-products">
              Products
            </a>
            <a href="#pricing" className="transition-colors hover:text-primary" data-testid="link-pricing">
              Pricing
            </a>
            <a href="#contact" className="transition-colors hover:text-primary" data-testid="link-contact">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" data-testid="button-login">Admin Panel</Button>
            </Link>
            <Button data-testid="button-get-started">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold leading-tight" data-testid="text-hero-title">
                AI Made Simple
                <br />
                <span className="text-primary">للشركات</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-hero-subtitle">
                Transform your business with enterprise-grade AI solutions. Simple to use, powerful to deploy.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8" data-testid="button-start-now">
                Start Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" data-testid="button-book-demo">
                Book a Demo
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2" data-testid={`stat-${index}`}>
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-8 shadow-2xl">
              <div className="aspect-video bg-card rounded-xl flex items-center justify-center border-2">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="container py-24 bg-muted/50">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold" data-testid="text-solutions-title">
            Our Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI solutions tailored for enterprise needs
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <Card key={index} className="p-8 hover-elevate active-elevate-2 transition-all" data-testid={`solution-card-${index}`}>
              <CardHeader className="p-0 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <solution.icon className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">{solution.title}</CardTitle>
                <CardDescription className="text-base">{solution.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Button variant="ghost" className="p-0 h-auto font-medium" data-testid={`button-learn-more-${index}`}>
                  Learn More <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="products" className="container py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold" data-testid="text-products-title">
            Why Choose Mubsat AI
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for enterprises, designed for simplicity
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-16">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-6" data-testid={`feature-${index}`}>
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* API Integrations */}
      <section className="container py-24 bg-muted/50">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold" data-testid="text-integrations-title">
            Trusted Integrations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with leading AI providers
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {integrations.map((integration, index) => (
            <Card key={index} className="aspect-square flex flex-col items-center justify-center gap-4 hover-elevate active-elevate-2 transition-all" data-testid={`integration-${index}`}>
              <integration.icon className="w-20 h-20 text-muted-foreground" />
              <span className="text-sm font-medium">{integration.name}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold" data-testid="text-dashboard-title">
            Powerful Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage all your AI projects from one place
          </p>
        </div>
        <div className="relative rounded-2xl shadow-2xl overflow-hidden border">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-primary" />
              </div>
              <p className="text-lg font-medium">Dashboard Screenshot Placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-24 bg-muted/50">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold" data-testid="text-pricing-title">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 ${plan.highlighted ? 'border-primary border-2 shadow-lg relative' : ''}`}
              data-testid={`pricing-plan-${index}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              )}
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="text-base mt-4">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full h-12" variant={plan.highlighted ? 'default' : 'outline'} data-testid={`button-choose-plan-${index}`}>
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="container py-24">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4" data-testid="text-contact-title">
                Get in Touch
              </h2>
              <p className="text-xl text-muted-foreground">
                Ready to transform your business with AI? Contact us for a personalized demo.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">sales@mubsat.ai</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Office</div>
                  <div className="text-sm text-muted-foreground">San Francisco, CA</div>
                </div>
              </div>
            </div>
          </div>
          <Card className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} data-testid="input-message" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={contactMutation.isPending}
                  data-testid="button-submit-contact"
                >
                  {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">Mubsat AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise AI solutions made simple
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#solutions" className="hover:text-primary transition-colors">Solutions</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2025 Mubsat AI Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
