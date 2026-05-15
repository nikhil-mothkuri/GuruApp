import { CreateBookingDto } from '@guruapp/shared';
import { bookingRepository } from '../../repositories/booking.repository';
import { AppError } from '../../utils/appError';

export const bookingsService = {
  async getMyBookings(studentId: string, status?: string) {
    return bookingRepository.findByStudent(studentId, status);
  },

  async getGuruBookings(guruId: string, filter?: 'upcoming' | 'past') {
    return bookingRepository.findByGuru(guruId, filter);
  },

  async create(studentId: string, dto: CreateBookingDto) {
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
