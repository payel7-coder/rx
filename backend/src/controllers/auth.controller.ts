import { Router, Request, Response } from 'express';
import * as authService from '../services/auth.service';
import prisma from '../prisma';

const router = Router();

router.get('/health', (req: Request, res: Response) => res.json({ ok: true }));

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'email,password,role required' });
  try {
    const user = await authService.registerUser(email, password, role);
    // create tokens
    const accessToken = authService.generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = authService.generateRefreshToken({ id: user.id, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    return res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken });
  } catch (err:any) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email,password required' });
  try {
    const user = await authService.verifyCredentials(email, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken = authService.generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = authService.generateRefreshToken({ id: user.id, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    return res.json({ user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken });
  } catch (err:any) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  try {
    // verify the token to get subject
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret';
    const payload = (await import('jsonwebtoken')).verify(refreshToken, secret) as any;
    const userId = payload.sub as string;
    const tokens = await authService.rotateRefreshToken(userId, refreshToken);
    return res.json(tokens);
  } catch (err:any) {
    return res.status(401).json({ error: err.message || 'Invalid token' });
  }
});

export default router;
