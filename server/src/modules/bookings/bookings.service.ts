import { CreateBookingDto } from '@guruapp/shared';
import { bookingRepository } from '../../repositories/booking.repository';
import { guruRepository } from '../../repositories/guru.repository';
import { AppError } from '../../utils/appError';

export const bookingsService = {
  async getMyBookings(studentId: string, status?: string) {
    return bookingRepository.findByStudent(studentId, status);
  },

  async getGuruBookings(guruId: string, filter?: 'upcoming' | 'past') {
    return bookingRepository.findByGuru(guruId, filter);
  },

  async create(studentId: string, dto: CreateBookingDto) {
    // dto.guruId may be a GuruProfile.id (from the public profile URL) or a User.id.
    // Resolve to User.id either way before checking for self-booking.
    const guruProfile = await guruRepository.findById(dto.guruId);
    const guruUserId = guruProfile?.userId ?? dto.guruId;
    if (studentId === guruUserId)
      throw new AppError('You cannot book a session with yourself.', 400, 'SELF_BOOKING');
    const recurrenceRule = dto.recurrenceRule ? JSON.stringify(dto.recurrenceRule) : undefined;
    return bookingRepository.create({
      studentId,
      guruId: dto.guruId,
      slotId: dto.slotId,
      type: dto.type,
      scheduledAt: new Date(dto.scheduledAt),
      recurrenceRule,
    });
  },

  async cancel(studentId: string, bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');
    if (booking.studentId !== studentId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new AppError('Cannot cancel this booking', 400, 'INVALID_STATUS');
    }
    return bookingRepository.updateStatus(bookingId, 'CANCELLED');
  },
};
