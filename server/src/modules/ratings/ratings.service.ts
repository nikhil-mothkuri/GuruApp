import { CreateRatingDto } from '@guruapp/shared';
import { ratingRepository } from '../../repositories/rating.repository';
import { bookingRepository } from '../../repositories/booking.repository';
import { guruRepository } from '../../repositories/guru.repository';
import { AppError } from '../../utils/appError';
import { prisma } from '../../config/prisma';

export const ratingsService = {
  async create(studentId: string, bookingId: string, dto: CreateRatingDto) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');
    if (booking.studentId !== studentId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
    if (booking.status !== 'COMPLETED') throw new AppError('Can only rate completed bookings', 400, 'INVALID_STATUS');

    const existing = await ratingRepository.findByBookingId(bookingId);
    if (existing) throw new AppError('Already rated this booking', 409, 'ALREADY_RATED');

    const guruProfile = await prisma.guruProfile.findUnique({ where: { userId: booking.guruId } });
    if (!guruProfile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');

    // Store guruId as the GuruProfile.id for consistency with updateRating and getByGuruId
    const rating = await ratingRepository.create({ bookingId, studentId, guruId: guruProfile.id, ...dto });
    await guruRepository.updateRating(guruProfile.id);

    return rating;
  },

  async getByGuruId(guruId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await ratingRepository.findByGuruId(guruId, skip, limit);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  },
};
