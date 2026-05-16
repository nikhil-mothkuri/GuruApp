import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  GuruSearchQuery,
  UpdateGuruProfileDto,
  AddSkillDto,
  AddVideoDto,
} from '@guruapp/shared';

export function useGuruSearch(params: Partial<GuruSearchQuery>) {
  return useQuery({
    queryKey: ['gurus', 'search', params],
    queryFn: () => api.get('/gurus', { params }).then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useGuruDetail(id: string) {
  return useQuery({
    queryKey: ['gurus', id],
    queryFn: () => api.get(`/gurus/${id}`).then((r) => r.data.data),
    staleTime: 60_000,
  });
}

export function useMyGuruProfile() {
  return useQuery({
    queryKey: ['gurus', 'me'],
    queryFn: () => api.get('/gurus/me/profile').then((r) => r.data.data),
  });
}

export function useUpdateGuruProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateGuruProfileDto) =>
      api.put('/gurus/me/profile', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gurus', 'me'] }),
  });
}

export function useAddSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddSkillDto) => api.post('/gurus/me/skills', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gurus', 'me'] }),
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => api.delete(`/gurus/me/skills/${skillId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gurus', 'me'] }),
  });
}

export function useAddVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddVideoDto) => api.post('/gurus/me/videos', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gurus', 'me'] }),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => api.delete(`/gurus/me/videos/${videoId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gurus', 'me'] }),
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => api.delete(`/gurus/me/photos/${photoId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gurus', 'me'] }),
  });
}

export function useUploadSkillImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, file }: { skillId: string; file: File }) => {
      const fd = new FormData();
      fd.append('image', file);
      return api.post(`/gurus/me/skills/${skillId}/image`, fd).then((r) => r.data.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gurus', 'me'] }),
  });
}

export function useUploadBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('banner', file);
      return api.post('/gurus/me/banner', fd).then((r) => r.data.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gurus', 'me'] }),
  });
}

export function useSubmitInquiry(guruId: string) {
  return useMutation({
    mutationFn: (dto: { name: string; email: string; phone?: string; message: string }) =>
      api.post(`/gurus/${guruId}/inquire`, dto).then((r) => r.data.data),
  });
}

export function useGuruSuggestions(q: string) {
  return useQuery({
    queryKey: ['gurus', 'suggestions', q],
    queryFn: () =>
      api.get('/gurus/suggestions', { params: { q } }).then(
        (r) =>
          r.data.data as {
            names: { id: string; user: { name: string; avatarUrl: string | null } }[];
            skills: string[];
          },
      ),
    enabled: q.length >= 1,
    staleTime: 30_000,
  });
}

export function useGuruSlots(guruId: string) {
  return useQuery({
    queryKey: ['slots', guruId],
    queryFn: () => api.get(`/gurus/${guruId}/slots`).then((r) => r.data.data),
    staleTime: 60_000,
  });
}
