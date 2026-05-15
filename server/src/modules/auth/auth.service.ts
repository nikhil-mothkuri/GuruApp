import { SignupDto, LoginDto, GoogleAuthDto } from '@guruapp/shared';
import { env } from '../../config/env';
import { userRepository } from '../../repositories/user.repository';
import { tokenRepository } from '../../repositories/token.repository';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../utils/appError';
import { prisma } from '../../config/prisma';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function toUserDto(user: { id: string; email: string; name: string; avatarUrl: string | null; isGuru: boolean; isStudent: boolean; isAdmin: boolean }) {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, isGuru: user.isGuru, isStudent: user.isStudent, isAdmin: user.isAdmin };
}

function makeTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, email });
  return { accessToken, refreshToken };
}

export const authService = {
  async signup(dto: SignupDto) {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');

    const passwordHash = await hashPassword(dto.password);
    const user = await userRepository.create({ email: dto.email, passwordHash, name: dto.name, isGuru: dto.isGuru, isStudent: dto.isStudent });
    const { accessToken, refreshToken } = makeTokens(user.id, user.email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepository.save(user.id, refreshToken, expiresAt);

    return { user: toUserDto(user), accessToken, refreshToken };
  },

  async login(dto: LoginDto) {
    const user = await userRepository.findByEmail(dto.email);
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    // Enforce account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError('Account temporarily locked. Try again later.', 423, 'ACCOUNT_LOCKED');
    }

    if (!user.passwordHash) throw new AppError('This account uses Google sign-in', 401, 'INVALID_CREDENTIALS');

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      const newCount = user.failedLoginCount + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: newCount,
          lockedUntil: newCount >= MAX_FAILED_ATTEMPTS
            ? new Date(Date.now() + LOCK_DURATION_MS)
            : null,
        },
      });
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Reset lockout on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });

    const { accessToken, refreshToken } = makeTokens(user.id, user.email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepository.save(user.id, refreshToken, expiresAt);

    return { user: toUserDto(user), accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new AppError('No refresh token provided', 401, 'UNAUTHORIZED');
    const payload = verifyRefreshToken(refreshToken);
    const record = await tokenRepository.findAndDelete(refreshToken);
    if (!record || record.expiresAt < new Date()) {
      throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
    }
    const newAccess = signAccessToken({ userId: payload.userId, email: payload.email });
    const newRefresh = signRefreshToken({ userId: payload.userId, email: payload.email });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepository.save(payload.userId, newRefresh, expiresAt);
    return { accessToken: newAccess, refreshToken: newRefresh };
  },

  async logout(userId: string) {
    await tokenRepository.deleteAllForUser(userId);
  },

  async googleAuth(dto: GoogleAuthDto) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { OAuth2Client } = require('google-auth-library');
    const oauthClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    let ticket;
    try {
      ticket = await oauthClient.verifyIdToken({ idToken: dto.idToken, audience: env.GOOGLE_CLIENT_ID });
    } catch {
      throw new AppError('Invalid Google ID token', 401, 'INVALID_GOOGLE_TOKEN');
    }
    const payload = ticket.getPayload();
    if (!payload) throw new AppError('Invalid Google ID token', 401, 'INVALID_GOOGLE_TOKEN');

    const { sub: googleId, email, name, picture } = payload;
    if (!email) throw new AppError('Google account has no email', 400, 'GOOGLE_NO_EMAIL');

    let user = await userRepository.findByGoogleId(googleId);

    if (!user) {
      const existingByEmail = await userRepository.findByEmail(email);
      if (existingByEmail) {
        if (!existingByEmail.isActive) throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
        user = await userRepository.linkGoogleId(existingByEmail.id, googleId, picture);
      } else {
        user = await userRepository.create({
          email,
          name: name ?? email.split('@')[0],
          googleId,
          avatarUrl: picture,
          isStudent: true,
          isGuru: false,
        });
      }
    } else if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
    }

    const { accessToken, refreshToken } = makeTokens(user.id, user.email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepository.save(user.id, refreshToken, expiresAt);
    return { user: toUserDto(user), accessToken, refreshToken };
  },
};
