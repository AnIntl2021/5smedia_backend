import { Router } from 'express';
import { getContent, updateContent } from '../controllers/content.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getContent);
router.put('/', requireAuth, updateContent);

export default router;
