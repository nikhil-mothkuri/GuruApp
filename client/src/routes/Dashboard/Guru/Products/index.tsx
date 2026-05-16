import { useState, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Package,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useMyProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUploadProductImage,
  useDeleteProductImage,
} from '@/hooks/useProducts';
import { useMyOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from '@guruapp/shared';
import type { Product, CreateProductDto, UpdateProductDto } from '@guruapp/shared';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-[#e6f4ea] text-[#137333]',
  DRAFT: 'bg-[#f1f3f4] text-[#5f6368]',
  OUT_OF_STOCK: 'bg-[#fce8e6] text-[#c5221f]',
  ARCHIVED: 'bg-[#f1f3f4] text-[#9aa0a6]',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-[#fef7e0] text-[#b06000]',
  CONFIRMED: 'bg-[#e8f0fe] text-[#1a73e8]',
  SHIPPED: 'bg-[#e6f4ea] text-[#137333]',
  DELIVERED: 'bg-[#e6f4ea] text-[#137333]',
  CANCELLED: 'bg-[#fce8e6] text-[#c5221f]',
  REFUNDED: 'bg-[#f1f3f4] text-[#5f6368]',
};

const emptyForm: CreateProductDto = {
  name: '',
  shortDescription: '',
  description: '',
  price: 0,
  compareAtPrice: undefined,
  currency: 'USD',
  sku: '',
  stock: 0,
  lowStockThreshold: 5,
  isDigital: false,
  downloadUrl: undefined,
  category: '',
  tags: [],
  status: 'DRAFT',
  weight: undefined,
  weightUnit: 'kg',
  length: undefined,
  width: undefined,
  height: undefined,
  dimensionUnit: 'cm',
  shippingRequired: true,
  metaTitle: '',
  metaDescription: '',
};

// Strip empty-string fields that carry format-level validation (e.g. url()) so
// they're sent as absent rather than '' which Zod rejects.
function sanitizeProductDto(form: CreateProductDto): CreateProductDto {
  const dto = { ...form };
  if (!dto.downloadUrl?.trim()) delete dto.downloadUrl;
  return dto;
}

function ProductForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: CreateProductDto;
  onSave: (dto: CreateProductDto) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set =
    <K extends keyof CreateProductDto>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val =
        (e.target as HTMLInputElement).type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((f) => ({ ...f, [k]: val }));
    };

  const setNum = (k: keyof CreateProductDto) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value === '' ? undefined : Number(e.target.value) }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !(form.tags ?? []).includes(t)) {
      setForm((f) => ({ ...f, tags: [...(f.tags ?? []), t] }));
    }
    setTagInput('');
  };

  const removeTag = (t: string) =>
    setForm((f) => ({ ...f, tags: (f.tags ?? []).filter((x) => x !== t) }));

  const inputCls =
    'w-full border border-[#e8eaed] rounded-lg px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8] placeholder:text-[#9aa0a6]';
  const labelCls = 'block text-xs font-medium text-[#5f6368] mb-1';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(sanitizeProductDto(form));
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Product name *</label>
          <input
            required
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Advanced React Course"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Short description</label>
          <input
            value={form.shortDescription ?? ''}
            onChange={set('shortDescription')}
            placeholder="One-line summary"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea
            value={form.description ?? ''}
            onChange={set('description')}
            rows={4}
            placeholder="Full product details…"
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className={labelCls}>Price *</label>
          <div className="flex gap-2">
            <select
              value={form.currency}
              onChange={set('currency')}
              className="border border-[#e8eaed] rounded-lg px-2 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8]"
            >
              {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={setNum('price')}
              className={`${inputCls} flex-1`}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Compare-at price (original)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.compareAtPrice ?? ''}
            onChange={setNum('compareAtPrice')}
            placeholder="For showing discount"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category ?? ''} onChange={set('category')} className={inputCls}>
            <option value="">— select —</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <select value={form.status} onChange={set('status')} className={inputCls}>
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Stock quantity</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={setNum('stock')}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>SKU</label>
          <input
            value={form.sku ?? ''}
            onChange={set('sku')}
            placeholder="Optional identifier"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <input
            type="checkbox"
            id="isDigital"
            checked={form.isDigital}
            onChange={(e) => setForm((f) => ({ ...f, isDigital: e.target.checked }))}
            className="w-4 h-4 accent-[#1a73e8]"
          />
          <label htmlFor="isDigital" className="text-sm text-[#202124]">
            This is a digital product
          </label>
        </div>

        {form.isDigital && (
          <div className="sm:col-span-2">
            <label className={labelCls}>Download URL</label>
            <input
              value={form.downloadUrl ?? ''}
              onChange={set('downloadUrl')}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
        )}

        {/* Tags */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Tags</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {(form.tags ?? []).map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#e8f0fe] text-[#1a73e8] text-xs rounded-full"
              >
                {t}
                <button type="button" onClick={() => removeTag(t)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag and press Enter"
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 border border-[#e8eaed] rounded-lg text-sm text-[#5f6368] hover:bg-[#f1f3f4]"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Advanced */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-1 text-xs text-[#5f6368] hover:text-[#202124]"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showAdvanced ? 'Hide' : 'Show'} shipping & SEO options
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#f8f9fa] rounded-xl">
          <div className="col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="shippingRequired"
              checked={form.shippingRequired}
              onChange={(e) => setForm((f) => ({ ...f, shippingRequired: e.target.checked }))}
              className="w-4 h-4 accent-[#1a73e8]"
            />
            <label htmlFor="shippingRequired" className="text-sm text-[#202124]">
              Shipping required
            </label>
          </div>
          <div>
            <label className={labelCls}>Weight</label>
            <div className="flex gap-1">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.weight ?? ''}
                onChange={setNum('weight')}
                className={`${inputCls} flex-1`}
              />
              <select
                value={form.weightUnit}
                onChange={set('weightUnit')}
                className="border border-[#e8eaed] rounded-lg px-2 py-2 text-xs outline-none focus:border-[#1a73e8]"
              >
                <option>kg</option>
                <option>lb</option>
                <option>g</option>
                <option>oz</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Low stock alert</label>
            <input
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={setNum('lowStockThreshold')}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Length</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.length ?? ''}
              onChange={setNum('length')}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Width</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.width ?? ''}
              onChange={setNum('width')}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Height</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.height ?? ''}
              onChange={setNum('height')}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Dimension unit</label>
            <select value={form.dimensionUnit} onChange={set('dimensionUnit')} className={inputCls}>
              <option>cm</option>
              <option>in</option>
              <option>mm</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-4">
            <label className={labelCls}>SEO title (max 70 chars)</label>
            <input
              value={form.metaTitle ?? ''}
              onChange={set('metaTitle')}
              maxLength={70}
              className={inputCls}
            />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <label className={labelCls}>SEO description (max 160 chars)</label>
            <input
              value={form.metaDescription ?? ''}
              onChange={set('metaDescription')}
              maxLength={160}
              className={inputCls}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-full bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1557b0] disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving…' : 'Save Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-full border border-[#e8eaed] text-sm text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ImageManager({ product }: { product: Product }) {
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage.mutateAsync({ productId: product.id, file });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {product.images.map((img) => (
          <div
            key={img.id}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#e8eaed] group"
          >
            <img src={img.url} alt={img.altText ?? ''} className="w-full h-full object-cover" />
            <button
              onClick={() => deleteImage.mutate({ productId: product.id, imageId: img.id })}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploadImage.isPending}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-[#e8eaed] flex flex-col items-center justify-center gap-1 text-[#9aa0a6] hover:border-[#1a73e8] hover:text-[#1a73e8] transition-colors disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs">Upload</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

export default function GuruProducts() {
  const { data: productsData, isLoading } = useMyProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const { data: ordersData } = useMyOrders();
  const updateOrderStatus = useUpdateOrderStatus();

  const [view, setView] = useState<'products' | 'orders'>('products');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedImages, setExpandedImages] = useState<Set<string>>(new Set());

  const products: Product[] = productsData?.data ?? [];
  const orders = ordersData?.data ?? [];

  const toggleImages = (id: string) =>
    setExpandedImages((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleCreate = async (dto: CreateProductDto) => {
    const created = await createProduct.mutateAsync(dto);
    setShowForm(false);
    // Auto-open the image panel so the guru can add photos immediately
    setExpandedImages((s) => new Set(s).add(created.id));
  };

  const handleUpdate = async (dto: UpdateProductDto) => {
    if (!editingProduct) return;
    await updateProduct.mutateAsync({ id: editingProduct.id, dto });
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await deleteProduct.mutateAsync(id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-normal text-[#202124]">My Shop</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#f1f3f4] rounded-full p-1">
            <button
              onClick={() => setView('products')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === 'products' ? 'bg-white text-[#202124] shadow-sm' : 'text-[#5f6368]'}`}
            >
              Products
            </button>
            <button
              onClick={() => setView('orders')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === 'orders' ? 'bg-white text-[#202124] shadow-sm' : 'text-[#5f6368]'}`}
            >
              Orders{' '}
              {orders.length > 0 && (
                <span className="ml-1 bg-[#ea4335] text-white text-xs rounded-full px-1.5 py-0.5">
                  {orders.length}
                </span>
              )}
            </button>
          </div>
          {view === 'products' && !showForm && !editingProduct && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1557b0] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* ── Products view ── */}
      {view === 'products' && (
        <>
          {/* Create form */}
          {showForm && (
            <div className="bg-white border border-[#e8eaed] rounded-2xl p-6 mb-6">
              <h2 className="text-base font-medium text-[#202124] mb-5">New Product</h2>
              <ProductForm
                initial={emptyForm}
                onSave={handleCreate}
                onCancel={() => setShowForm(false)}
                isPending={createProduct.isPending}
              />
              {createProduct.error && (
                <p className="text-sm text-[#ea4335] mt-2">
                  {(
                    createProduct.error as {
                      response?: { data?: { error?: { message?: string } } };
                    }
                  )?.response?.data?.error?.message ?? 'Failed to create product'}
                </p>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-[#f1f3f4] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 && !showForm ? (
            <div className="text-center py-20 text-[#5f6368]">
              <Package className="w-12 h-12 mx-auto mb-3 text-[#bdc1c6]" />
              <p className="text-base mb-1">No products yet</p>
              <p className="text-sm mb-4">Add your first product to start selling</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 rounded-full bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1557b0] transition-colors"
              >
                Add Product
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p) =>
                editingProduct?.id === p.id ? (
                  <div key={p.id} className="bg-white border border-[#1a73e8] rounded-2xl p-6">
                    <h2 className="text-base font-medium text-[#202124] mb-5">Edit: {p.name}</h2>
                    <ProductForm
                      initial={{
                        ...p,
                        tags: p.tags,
                        status: p.status as 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED',
                        shortDescription: p.shortDescription ?? undefined,
                        description: p.description ?? undefined,
                        compareAtPrice: p.compareAtPrice ?? undefined,
                        weight: p.weight ?? undefined,
                        length: p.length ?? undefined,
                        width: p.width ?? undefined,
                        height: p.height ?? undefined,
                        sku: p.sku ?? undefined,
                        downloadUrl: p.downloadUrl ?? undefined,
                        category: p.category ?? undefined,
                        metaTitle: p.metaTitle ?? undefined,
                        metaDescription: p.metaDescription ?? undefined,
                      }}
                      onSave={handleUpdate}
                      onCancel={() => setEditingProduct(null)}
                      isPending={updateProduct.isPending}
                    />
                  </div>
                ) : (
                  <div
                    key={p.id}
                    className="bg-white border border-[#e8eaed] rounded-2xl overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-[#f8f9fa] shrink-0 overflow-hidden border border-[#e8eaed] flex items-center justify-center">
                        {p.images[0] ? (
                          <img
                            src={p.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-[#bdc1c6]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-[#202124] truncate">{p.name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] ?? 'bg-[#f1f3f4] text-[#5f6368]'}`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#5f6368] mt-0.5">
                          {p.currency} {p.price.toFixed(2)} · Stock: {p.stock} ·{' '}
                          {p.category || 'Uncategorised'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleImages(p.id)}
                          title="Manage images"
                          className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/shop/${p.id}`, '_blank')}
                          title="Preview"
                          className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors"
                        >
                          {p.status === 'ACTIVE' ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingProduct(p)}
                          title="Edit"
                          className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#1a73e8] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Delete"
                          className="p-2 rounded-full hover:bg-[#fce8e6] text-[#ea4335] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {expandedImages.has(p.id) && (
                      <div className="border-t border-[#f1f3f4] px-4 pb-4 pt-3">
                        <p className="text-xs font-medium text-[#5f6368] mb-2">Product Images</p>
                        <ImageManager product={p} />
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </>
      )}

      {/* ── Orders view ── */}
      {view === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-20 text-[#5f6368]">
              <p className="text-base">No orders yet</p>
              <p className="text-sm mt-1">
                Orders will appear here once customers purchase your products
              </p>
            </div>
          ) : (
            orders.map(
              (order: {
                id: string;
                buyerName: string;
                buyerEmail: string;
                status: string;
                totalAmount: number;
                currency: string;
                createdAt: string;
                items: { productName: string; quantity: number; unitPrice: number }[];
              }) => (
                <div key={order.id} className="bg-white border border-[#e8eaed] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[#202124]">{order.buyerName}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status] ?? 'bg-[#f1f3f4] text-[#5f6368]'}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#5f6368]">
                        {order.buyerEmail} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-xs text-[#3c4043]">
                            {item.productName} × {item.quantity} — {order.currency}{' '}
                            {(item.unitPrice * item.quantity).toFixed(2)}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-semibold text-[#202124]">
                        {order.currency} {order.totalAmount.toFixed(2)}
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus.mutate({ id: order.id, status: e.target.value })
                        }
                        className="mt-2 border border-[#e8eaed] rounded-lg px-2 py-1 text-xs text-[#202124] outline-none focus:border-[#1a73e8]"
                      >
                        {[
                          'PENDING',
                          'CONFIRMED',
                          'SHIPPED',
                          'DELIVERED',
                          'CANCELLED',
                          'REFUNDED',
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ),
            )
          )}
        </div>
      )}
    </div>
  );
}
