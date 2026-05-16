import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { CreateRatingDto } from '@guruapp/shared';

export function useGuruRatings(guruId: string) {
  return useQuery({
    queryKey: ['ratings', guruId],
    queryFn: () => api.get(`/gurus/${guruId}/ratings`).then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useCreateRating(bookingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRatingDto) =>
      api.post(`/bookings/${bookingId}/rating`, dto).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
}
