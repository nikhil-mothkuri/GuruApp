import { Link } from 'react-router-dom';
import { ShoppingCart, Download, Package } from 'lucide-react';
import type { Product } from '@guruapp/shared';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const primaryImage = product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <Link
      to={`/shop/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-[#e8eaed] overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#f8f9fa] overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#bdc1c6]">
            <Package className="w-12 h-12" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-[#ea4335] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.isDigital && (
            <span className="bg-[#1a73e8] text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <Download className="w-3 h-3" /> Digital
            </span>
          )}
        </div>

        {product.status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-medium text-[#5f6368]">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {product.category && (
          <span className="text-xs text-[#1a73e8] font-medium uppercase tracking-wide">{product.category}</span>
        )}

        <p className="text-sm font-medium text-[#202124] line-clamp-2 leading-snug">{product.name}</p>

        {product.shortDescription && (
          <p className="text-xs text-[#5f6368] line-clamp-2">{product.shortDescription}</p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-[#202124]">
              {product.currency} {product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#5f6368] line-through">
                {product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8] group-hover:bg-[#1a73e8] group-hover:text-white transition-colors">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </div>

        {/* Guru attribution */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-[#f1f3f4]">
          {product.guru.user.avatarUrl ? (
            <img src={product.guru.user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-[9px] font-medium">
              {product.guru.user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs text-[#5f6368] truncate">{product.guru.user.name}</span>
        </div>
      </div>
    </Link>
  );
}
