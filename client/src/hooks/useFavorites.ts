import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/students/me/favorites').then((r) => r.data.data),
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guruId: string) => api.post(`/students/me/favorites/${guruId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guruId: string) => api.delete(`/students/me/favorites/${guruId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}
