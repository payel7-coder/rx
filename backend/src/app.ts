import express from 'express';
import cors from 'cors';
import prescriptionsRouter from './controllers/prescriptions.controller';
import { authenticateJWT } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/auth/health', (req, res) => res.send({ ok: true }));

app.use('/prescriptions', authenticateJWT, prescriptionsRouter);

app.use((err:any, req:any, res:any, next:any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
