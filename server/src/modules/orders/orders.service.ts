import { CreateOrderDto, UpdateOrderStatusDto, OrderSearchQuery } from '@guruapp/shared';
import { orderRepository } from '../../repositories/order.repository';
import { productRepository } from '../../repositories/product.repository';
import { guruRepository } from '../../repositories/guru.repository';
import { AppError } from '../../utils/appError';

export const ordersService = {
  async placeOrder(dto: CreateOrderDto, userId?: string) {
    // Resolve products and group by guru (all items must be from the same guru for now)
    const resolvedItems: {
      productId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      guruId: string;
      currency: string;
    }[] = [];

    for (const item of dto.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404, 'NOT_FOUND');
      if (product.status !== 'ACTIVE') throw new AppError(`Product "${product.name}" is not available`, 400, 'PRODUCT_UNAVAILABLE');
      if (!product.isDigital && product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.name}"`, 400, 'INSUFFICIENT_STOCK');
      }
      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        totalPrice: product.price * item.quantity,
        guruId: product.guruId,
        currency: product.currency,
      });
    }

    const guruIds = [...new Set(resolvedItems.map((i) => i.guruId))];
    if (guruIds.length !== 1) throw new AppError('All items must be from the same guru', 400, 'MIXED_GURU_ORDER');

    const guruProfileId = guruIds[0];
    const guruProfile = await guruRepository.findById(guruProfileId);
    if (!guruProfile) throw new AppError('Guru not found', 404, 'NOT_FOUND');

    const currency = resolvedItems[0].currency;
    const totalAmount = resolvedItems.reduce((sum, i) => sum + i.totalPrice, 0);

    const order = await orderRepository.create({
      guruId: guruProfile.user.id,
      userId,
      buyerName: dto.buyerName,
      buyerEmail: dto.buyerEmail,
      buyerPhone: dto.buyerPhone,
      shippingAddress: dto.shippingAddress,
      shippingCity: dto.shippingCity,
      shippingState: dto.shippingState,
      shippingCountry: dto.shippingCountry,
      shippingZip: dto.shippingZip,
      notes: dto.notes,
      totalAmount,
      currency,
      items: resolvedItems.map(({ guruId: _g, currency: _c, ...rest }) => rest),
    });

    return order;
  },

  async getMyOrders(userId: string, query: OrderSearchQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await orderRepository.findByGuruId(userId, query.status, skip, query.limit);
    return {
      data: items,
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getOrderById(userId: string, orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.guruId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
    return order;
  },

  async updateStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.guruId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
    return orderRepository.updateStatus(orderId, userId, dto.status);
  },
};
