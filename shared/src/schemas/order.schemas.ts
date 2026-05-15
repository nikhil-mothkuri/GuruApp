import { z } from 'zod';

export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const;

export const createOrderSchema = z.object({
  buyerName: z.string().min(1).max(200),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().max(30).optional(),
  shippingAddress: z.string().max(500).optional(),
  shippingCity: z.string().max(100).optional(),
  shippingState: z.string().max(100).optional(),
  shippingCountry: z.string().max(100).optional(),
  shippingZip: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

export const orderSearchSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type OrderSearchQuery = z.infer<typeof orderSearchSchema>;

export const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
  totalPrice: z.number(),
});

export const orderSchema = z.object({
  id: z.string(),
  guruId: z.string(),
  userId: z.string().nullable(),
  buyerName: z.string(),
  buyerEmail: z.string(),
  buyerPhone: z.string().nullable(),
  status: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  shippingAddress: z.string().nullable(),
  shippingCity: z.string().nullable(),
  shippingState: z.string().nullable(),
  shippingCountry: z.string().nullable(),
  shippingZip: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(orderItemSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
