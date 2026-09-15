import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import type { AuthedRequest } from '../middleware/auth.middleware';

function toPublicAdmin(admin: { id: string; email: string; name: string | null; phone: string | null; avatarUrl: string | null }) {
  return { id: admin.id, email: admin.email, name: admin.name, phone: admin.phone, avatarUrl: admin.avatarUrl };
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  res.json({ token, admin: toPublicAdmin(admin) });
}

export async function me(req: AuthedRequest, res: Response) {
  const admin = await prisma.admin.findUnique({ where: { id: req.admin!.id } });
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json({ admin: toPublicAdmin(admin) });
}

export async function updateProfile(req: AuthedRequest, res: Response) {
  const { name, phone, avatarUrl } = req.body as { name?: string; phone?: string; avatarUrl?: string };

  const admin = await prisma.admin.update({
    where: { id: req.admin!.id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  });

  res.json({ admin: toPublicAdmin(admin) });
}

export async function changePassword(req: AuthedRequest, res: Response) {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const admin = await prisma.admin.findUnique({ where: { id: req.admin!.id } });
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

  res.json({ ok: true });
}
