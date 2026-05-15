import { prisma } from '../config/prisma';

const orderInclude = {
  items: true,
  guru: { select: { id: true, name: true, email: true } },
};

export const orderRepository = {
  findById: (id: string) =>
    prisma.order.findUnique({ where: { id }, include: orderInclude }),

  findByGuruId: (guruId: string, status: string | undefined, skip: number, take: number) => {
    const where = { guruId, ...(status ? { status } : {}) };
    return Promise.all([
      prisma.order.findMany({ where, skip, take, include: orderInclude, orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  },

  create: (data: {
    guruId: string;
    userId?: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingCountry?: string;
    shippingZip?: string;
    notes?: string;
    totalAmount: number;
    currency: string;
    items: { productId: string; productName: string; unitPrice: number; quantity: number; totalPrice: number }[];
  }) => {
    const { items, ...orderData } = data;
    return prisma.order.create({
      data: {
        ...orderData,
        items: { create: items },
      },
      include: orderInclude,
    });
  },

  updateStatus: (id: string, guruId: string, status: string) =>
    prisma.order.update({ where: { id, guruId }, data: { status }, include: orderInclude }),
};
