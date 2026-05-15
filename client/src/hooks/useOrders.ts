import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { CreateOrderDto, OrderSearchQuery } from '@guruapp/shared';

export function usePlaceOrder() {
  return useMutation({
    mutationFn: (dto: CreateOrderDto) => api.post('/orders', dto).then((r) => r.data.data),
  });
}

export function useMyOrders(params: Partial<OrderSearchQuery> = {}) {
  return useQuery({
    queryKey: ['orders', 'me', params],
    queryFn: () => api.get('/orders/me', { params }).then((r) => r.data),
  });
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['orders', 'me', id],
    queryFn: () => api.get(`/orders/me/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/me/${id}/status`, { status }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders', 'me'] }),
  });
}
