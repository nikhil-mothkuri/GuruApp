import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { ProductSearchQuery, CreateProductDto, UpdateProductDto } from '@guruapp/shared';

export function useProductSearch(params: Partial<ProductSearchQuery>) {
  return useQuery({
    queryKey: ['products', 'search', params],
    queryFn: () => api.get('/products', { params }).then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['products', 'slug', slug],
    queryFn: () => api.get(`/products/slug/${slug}`).then((r) => r.data.data),
    enabled: !!slug,
    staleTime: 30_000,
  });
}

export function useGuruProducts(guruId: string) {
  return useQuery({
    queryKey: ['products', 'guru', guruId],
    queryFn: () =>
      api.get('/products', { params: { guruId, status: 'ACTIVE', limit: 20 } }).then((r) => r.data),
    enabled: !!guruId,
    staleTime: 60_000,
  });
}

export function useMyProducts(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['products', 'me', { page, limit }],
    queryFn: () =>
      api.get('/products/me/products', { params: { page, limit } }).then((r) => r.data),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => api.post('/products', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', 'me'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      api.put(`/products/${id}`, dto).then((r) => r.data.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['products', 'me'] });
      qc.invalidateQueries({ queryKey: ['products', id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', 'me'] }),
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      file,
      altText,
    }: {
      productId: string;
      file: File;
      altText?: string;
    }) => {
      const form = new FormData();
      form.append('image', file);
      if (altText) form.append('altText', altText);
      return api
        .post(`/products/${productId}/images`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data.data);
    },
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: ['products', 'me'] });
      qc.invalidateQueries({ queryKey: ['products', productId] });
    },
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      api.delete(`/products/${productId}/images/${imageId}`),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: ['products', 'me'] });
      qc.invalidateQueries({ queryKey: ['products', productId] });
    },
  });
}
