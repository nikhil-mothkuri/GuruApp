import { UpdateGuruProfileDto, AddSkillDto, AddVideoDto, GuruSearchQuery } from '@guruapp/shared';
import { guruRepository } from '../../repositories/guru.repository';
import { savePhoto, deleteFile } from '../../utils/storage';
import { AppError } from '../../utils/appError';

export const gurusService = {
  async search(query: GuruSearchQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await guruRepository.search(query.q, query.skill, skip, query.limit);
    return {
      data: items,
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getById(id: string) {
    const profile = await guruRepository.findById(id);
    if (!profile) throw new AppError('Guru not found', 404, 'NOT_FOUND');
    return profile;
  },

  async getMyProfile(userId: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    return profile;
  },

  async upsertMyProfile(userId: string, dto: UpdateGuruProfileDto) {
    return guruRepository.upsert(userId, dto);
  },

  async addSkill(userId: string, dto: AddSkillDto) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    return guruRepository.addSkill(profile.id, dto.skillName);
  },

  async deleteSkill(userId: string, skillId: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    await guruRepository.deleteSkill(skillId, profile.id);
  },

  async addPhoto(userId: string, buffer: Buffer, originalname: string, caption?: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const { url } = await savePhoto(buffer, originalname);
    return guruRepository.addPhoto(profile.id, url, caption);
  },

  async deletePhoto(userId: string, photoId: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const photo = await guruRepository.deletePhoto(photoId, profile.id);
    await deleteFile(photo.url);
  },

  async addVideo(userId: string, dto: AddVideoDto) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const thumbId = dto.youtubeUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    const thumbnailUrl = thumbId ? `https://img.youtube.com/vi/${thumbId}/hqdefault.jpg` : undefined;
    return guruRepository.addVideo(profile.id, dto.youtubeUrl, dto.title, thumbnailUrl);
  },

  async deleteVideo(userId: string, videoId: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    await guruRepository.deleteVideo(videoId, profile.id);
  },

  async suggestions(q: string) {
    if (!q) return { names: [], skills: [] };
    return guruRepository.suggestions(q, 5);
  },
};
