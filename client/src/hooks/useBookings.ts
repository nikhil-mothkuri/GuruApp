import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { CreateBookingDto } from '@guruapp/shared';

export function useMyBookings(status?: string) {
  return useQuery({
    queryKey: ['bookings', 'student', status],
    queryFn: () =>
      api.get('/bookings', { params: status ? { status } : {} }).then((r) => r.data.data),
  });
}

export function useGuruBookings(filter?: 'upcoming' | 'past') {
  return useQuery({
    queryKey: ['bookings', 'guru', filter],
    queryFn: () =>
      api.get('/bookings/guru', { params: filter ? { filter } : {} }).then((r) => r.data.data),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBookingDto) => api.post('/bookings', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
