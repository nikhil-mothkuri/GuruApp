import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Download,
  Tag,
  Weight,
  Ruler,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useProductDetail } from '@/hooks/useProducts';
import { usePlaceOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { CreateOrderDto, ProductImage } from '@guruapp/shared';
import { useTranslation } from 'react-i18next';

function OrderModal({
  productId,
  productName,
  price,
  currency,
  isDigital,
  onClose,
  onSuccess,
}: {
  productId: string;
  productName: string;
  price: number;
  currency: string;
  isDigital: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const placeOrder = usePlaceOrder();
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    buyerName: user?.name ?? '',
    buyerEmail: user?.email ?? '',
    buyerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingCountry: '',
    shippingZip: '',
    notes: '',
  });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreateOrderDto = { ...form, items: [{ productId, quantity: qty }] };
    const order = await placeOrder.mutateAsync(dto);
    onSuccess(order.id);
  };

  const inputCls =
    'w-full border border-[#e8eaed] rounded-lg px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8] placeholder:text-[#9aa0a6]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#e8eaed]">
          <SectionHeader title={t('order.title')} />
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f1f3f4]">
            <X className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#202124]">{productName}</p>
              <p className="text-xs text-[#5f6368]">{t('order.qty', { qty })}</p>
            </div>
            <p className="text-base font-semibold text-[#202124]">
              {currency} {(price * qty).toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">
              {t('order.quantity')}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-[#e8eaed] flex items-center justify-center hover:bg-[#f1f3f4] text-[#202124]"
              >
                −
              </button>
              <span className="text-sm font-medium w-6 text-center">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-full border border-[#e8eaed] flex items-center justify-center hover:bg-[#f1f3f4] text-[#202124]"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                {t('order.fullName')}
              </label>
              <input
                required
                value={form.buyerName}
                onChange={set('buyerName')}
                placeholder="Jane Doe"
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                {t('order.email')}
              </label>
              <input
                required
                type="email"
                value={form.buyerEmail}
                onChange={set('buyerEmail')}
                placeholder="jane@example.com"
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                {t('order.phone')}
              </label>
              <input
                value={form.buyerPhone}
                onChange={set('buyerPhone')}
                placeholder="+1 555 000 0000"
                className={inputCls}
              />
            </div>
          </div>

          {!isDigital && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wide">
                {t('order.shippingAddress')}
              </p>
              <input
                value={form.shippingAddress}
                onChange={set('shippingAddress')}
                placeholder={t('order.street')}
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.shippingCity}
                  onChange={set('shippingCity')}
                  placeholder={t('order.city')}
                  className={inputCls}
                />
                <input
                  value={form.shippingState}
                  onChange={set('shippingState')}
                  placeholder={t('order.state')}
                  className={inputCls}
                />
                <input
                  value={form.shippingCountry}
                  onChange={set('shippingCountry')}
                  placeholder={t('order.country')}
                  className={inputCls}
                />
                <input
                  value={form.shippingZip}
                  onChange={set('shippingZip')}
                  placeholder={t('order.zip')}
                  className={inputCls}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">
              {t('order.notes')}
            </label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder={t('order.notesPlaceholder')}
              className={`${inputCls} resize-none`}
            />
          </div>

          {placeOrder.error && (
            <p className="text-sm text-[#ea4335]">
              {(placeOrder.error as { response?: { data?: { error?: { message?: string } } } })
                ?.response?.data?.error?.message ?? t('order.error')}
            </p>
          )}

          <Button type="submit" disabled={placeOrder.isPending} className="w-full justify-center">
            {placeOrder.isPending ? (
              t('order.placing')
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> {t('order.confirm')}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: product, isLoading } = useProductDetail(id!);
  const [imgIndex, setImgIndex] = useState(0);
  const [showOrder, setShowOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (isLoading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-5 bg-[#f1f3f4] rounded w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-[#f1f3f4] rounded-2xl" />
          <div className="space-y-4">
            {[3, 5, 2, 4].map((w, i) => (
              <div key={i} className={`h-4 bg-[#f1f3f4] rounded w-${w}/6`} />
            ))}
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-[#5f6368]">
        <p className="text-lg">{t('product.notFound')}</p>
        <Link to="/shop" className="text-sm text-[#1a73e8] hover:underline mt-2 block">
          {t('product.backToShopLink')}
        </Link>
      </div>
    );

  const images: ProductImage[] = product.images;
  const hasPrev = imgIndex > 0;
  const hasNext = imgIndex < images.length - 1;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-[#5f6368] hover:text-[#202124] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t('product.backToShop')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="space-y-3 p-4">
          <div className="relative aspect-square bg-[#f8f9fa] rounded-3xl overflow-hidden border border-[#e8eaed]">
            {images.length > 0 ? (
              <img
                src={images[imgIndex].url}
                alt={images[imgIndex].altText ?? product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#bdc1c6]">
                <Package className="w-16 h-16" />
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  disabled={!hasPrev}
                  onClick={() => setImgIndex((i) => i - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow disabled:opacity-30 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!hasNext}
                  onClick={() => setImgIndex((i) => i + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow disabled:opacity-30 hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setImgIndex(i)}
                  className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIndex ? 'border-[#1a73e8]' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          {product.category && (
            <span className="text-xs font-medium text-[#1a73e8] uppercase tracking-wide">
              {product.category}
            </span>
          )}

          <h1 className="text-2xl font-normal text-[#202124] leading-snug">{product.name}</h1>

          <Link
            to={`/guru/${product.guru.id}`}
            className="flex items-center gap-2 text-sm text-[#5f6368] hover:text-[#202124]"
          >
            {product.guru.user.avatarUrl ? (
              <img
                src={product.guru.user.avatarUrl}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-xs font-medium">
                {product.guru.user.name.charAt(0)}
              </div>
            )}
            {t('product.by', { name: product.guru.user.name })}
          </Link>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-medium text-[#202124]">
              {product.currency} {product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-[#5f6368] line-through">
                  {product.compareAtPrice!.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-[#34a853]">
                  {t('product.save', { pct: discountPct })}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {product.isDigital && (
              <span className="flex items-center gap-1 px-3 py-1 bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium rounded-full">
                <Download className="w-3 h-3" /> {t('product.digitalDownload')}
              </span>
            )}
            {(product.tags as string[]).map((tag: string) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 bg-[#f1f3f4] text-[#5f6368] text-xs rounded-full"
              >
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>

          {product.shortDescription && (
            <p className="text-sm text-[#5f6368] leading-relaxed">{product.shortDescription}</p>
          )}

          {orderId ? (
            <div className="flex items-center gap-2 p-4 bg-[#e6f4ea] rounded-2xl text-[#137333] text-sm font-medium">
              <Check className="w-5 h-5" />
              {t('product.orderPlaced', { id: orderId.slice(-8).toUpperCase() })}
            </div>
          ) : (
            <Button
              onClick={() => setShowOrder(true)}
              disabled={product.status === 'OUT_OF_STOCK'}
              className="w-full justify-center"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.status === 'OUT_OF_STOCK' ? t('product.outOfStock') : t('product.buyNow')}
            </Button>
          )}

          {!product.isDigital && (product.weight || product.shippingRequired) && (
            <div className="border-t border-[#e8eaed] pt-4 space-y-2">
              {product.weight && (
                <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                  <Weight className="w-4 h-4" />{' '}
                  {t('product.weight', { weight: product.weight, unit: product.weightUnit })}
                </div>
              )}
              {(product.length || product.width || product.height) && (
                <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                  <Ruler className="w-4 h-4" />
                  {t('product.dimensions', {
                    l: product.length,
                    w: product.width,
                    h: product.height,
                    unit: product.dimensionUnit,
                  })}
                </div>
              )}
            </div>
          )}

          {product.sku && (
            <p className="text-xs text-[#9aa0a6]">{t('product.sku', { sku: product.sku })}</p>
          )}
        </Card>
      </div>

      {product.description && (
        <div className="mt-10 border-t border-[#e8eaed] pt-8">
          <SectionHeader
            title={t('product.details.title')}
            subtitle={t('product.details.subtitle')}
            className="mb-4"
          />
          <div className="text-sm text-[#3c4043] leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>
        </div>
      )}

      {showOrder && (
        <OrderModal
          productId={product.id}
          productName={product.name}
          price={product.price}
          currency={product.currency}
          isDigital={product.isDigital}
          onClose={() => setShowOrder(false)}
          onSuccess={(oid) => {
            setOrderId(oid);
            setShowOrder(false);
          }}
        />
      )}
    </div>
  );
}
