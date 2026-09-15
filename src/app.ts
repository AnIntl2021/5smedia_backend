import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import authRoutes from './routes/auth.routes';
import contentRoutes from './routes/content.routes';
import uploadRoutes from './routes/upload.routes';
import { notFound, errorHandler } from './middleware/error.middleware';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((o) => o.trim()).filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
