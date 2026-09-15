import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { deepMerge } from '../lib/deepMerge';
import defaultContent from '../../prisma/defaultContent.json';
import type { AuthedRequest } from '../middleware/auth.middleware';

const CONTENT_ROW_ID = 1;

async function loadContent(): Promise<Record<string, unknown>> {
  const row = await prisma.content.findUnique({ where: { id: CONTENT_ROW_ID } });
  if (!row) return defaultContent as Record<string, unknown>;
  try {
    return deepMerge(defaultContent as Record<string, unknown>, JSON.parse(row.data));
  } catch {
    return defaultContent as Record<string, unknown>;
  }
}

export async function getContent(req: AuthedRequest, res: Response) {
  const content = await loadContent();
  res.json(content);
}

export async function updateContent(req: AuthedRequest, res: Response) {
  const patch = req.body;
  if (typeof patch !== 'object' || patch === null || Array.isArray(patch)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  const current = await loadContent();
  const merged = deepMerge(current, patch);

  const saved = await prisma.content.upsert({
    where: { id: CONTENT_ROW_ID },
    update: { data: JSON.stringify(merged) },
    create: { id: CONTENT_ROW_ID, data: JSON.stringify(merged) },
  });

  res.json(JSON.parse(saved.data));
}
