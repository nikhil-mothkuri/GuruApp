import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { CreateSlotDto, UpdateSlotDto } from '@guruapp/shared';

export function useMySlots() {
  return useQuery({
    queryKey: ['slots', 'me'],
    queryFn: () => api.get('/gurus/me/slots').then((r) => r.data.data),
  });
}

export function useCreateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSlotDto) => api.post('/gurus/me/slots', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots', 'me'] }),
  });
}

export function useUpdateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, dto }: { slotId: string; dto: UpdateSlotDto }) =>
      api.put(`/gurus/me/slots/${slotId}`, dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots', 'me'] }),
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => api.delete(`/gurus/me/slots/${slotId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots', 'me'] }),
  });
}
