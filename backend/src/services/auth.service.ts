import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';

export async function registerUser(email: string, password: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('User already exists');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, role: role as any } });
  return user;
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export function generateAccessToken(user: { id: string; role: string }) {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign({ role: user.role }, secret, { subject: user.id, expiresIn: ACCESS_EXPIRES });
}

export function generateRefreshToken(user: { id: string; role: string }) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret';
  return jwt.sign({ role: user.role }, secret, { subject: user.id, expiresIn: REFRESH_EXPIRES });
}

export async function rotateRefreshToken(userId: string, providedRefreshToken: string) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret';
  try {
    const payload = jwt.verify(providedRefreshToken, secret) as any;
    if (payload.sub !== userId) throw new Error('Invalid token subject');
  } catch (err) {
    throw new Error('Invalid refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  // Ensure the stored refresh token matches (simple revoke-on-rotation)
  if (!user.refreshToken || user.refreshToken !== providedRefreshToken) {
    throw new Error('Refresh token revoked');
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  return { accessToken, refreshToken };
}
