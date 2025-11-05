import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { Link } from 'wouter';

export default function ProductDetails() {
  const { slug } = useParams();
  
  const { data: product, isLoading } = useQuery({
    queryKey: ['/api/products', slug],
    queryFn: () => productsApi.getBySlug(slug!),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
        <Link href="/marketplace">
          <Button variant="outline">العودة للسوق</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8" dir="rtl" data-testid="page-product-details">
      <Link href="/marketplace">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للسوق
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image || '/api/placeholder/600/400'}
            alt={product.name}
            className="w-full rounded-2xl shadow-2xl neon-border-glow"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4 neon-text-gradient">{product.name}</h1>
            <p className="text-xl text-white/60">{product.shortDescription}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-5xl font-bold neon-text-gradient">
              ${product.price}
            </span>
          </div>

          <Card className="p-6 bg-[#16161D] border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4">الميزات الرئيسية:</h3>
            <ul className="space-y-3">
              {product.features?.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex gap-4">
            <Button
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover-elevate active-elevate-2 neon-glow-cyan h-14 text-lg font-bold"
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              إضافة للسلة
            </Button>
          </div>

          <Card className="p-6 bg-[#0F0F14] border-white/10">
            <h3 className="text-lg font-bold mb-3">الوصف الكامل:</h3>
            <p className="text-white/70 leading-relaxed">{product.description}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
