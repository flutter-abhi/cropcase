import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, name?: string) {
  // Password hashing removed for demo purposes

  return prisma.user.create({
    data: {
      email,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function updateUserLastLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { updatedAt: new Date() },
  });
}

export async function createRefreshToken(token: string, userId: string, expiresAt: Date) {
  return prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
}

export async function deleteRefreshToken(token: string) {
  return prisma.refreshToken.delete({
    where: { token },
  });
}

export async function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function cleanupExpiredTokens() {
  return prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}