import { UpdateUserDto } from '@guruapp/shared';
import { userRepository } from '../../repositories/user.repository';
import { savePhoto } from '../../utils/storage';
import { AppError } from '../../utils/appError';

export const usersService = {
  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return user;
  },

  async updateMe(userId: string, dto: UpdateUserDto) {
    return userRepository.update(userId, dto);
  },

  async updateAvatar(userId: string, buffer: Buffer, originalname: string) {
    const { url } = await savePhoto(buffer, originalname);
    await userRepository.update(userId, { avatarUrl: url });
    return { avatarUrl: url };
  },
};
