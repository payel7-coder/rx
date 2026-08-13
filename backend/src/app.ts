import express from 'express';
import cors from 'cors';
import prescriptionsRouter from './controllers/prescriptions.controller';
import authRouter from './controllers/auth.controller';
import { authenticateJWT } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.post('/auth/health', (req, res) => res.send({ ok: true }));

// protect prescriptions
app.use('/prescriptions', authenticateJWT, prescriptionsRouter);

app.use((err:any, req:any, res:any, next:any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
