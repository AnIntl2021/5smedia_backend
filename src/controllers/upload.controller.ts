import { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.middleware';

export async function uploadImage(req: AuthedRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded (expected field name "image")' });
  }

  const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;

  res.status(201).json({ url });
}
