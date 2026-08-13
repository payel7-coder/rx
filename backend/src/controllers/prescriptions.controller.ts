import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  patientId: z.string().uuid(),
  medicationId: z.string().uuid(),
  dosage: z.string(),
  frequency: z.string(),
  quantity: z.number().int().positive(),
  refills: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  expiresAt: z.string().optional(),
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const prescriberId = (req as any).user?.id;
  if (!prescriberId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const p = await prisma.prescription.create({
      data: {
        patientId: parsed.data.patientId,
        prescriberId,
        medicationId: parsed.data.medicationId,
        dosage: parsed.data.dosage,
        frequency: parsed.data.frequency,
        quantity: parsed.data.quantity,
        refills: parsed.data.refills ?? 0,
        notes: parsed.data.notes,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      },
    });

    await prisma.prescriptionEvent.create({
      data: {
        prescriptionId: p.id,
        actorId: prescriberId,
        action: 'ISSUED',
        detail: `Issued by ${prescriberId}`,
      },
    });

    return res.status(201).json(p);
  } catch (err:any) {
    console.error(err);
    return res.status(500).json({ error: 'DB error' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const list = await prisma.prescription.findMany({ take: 50 });
    res.json(list);
  } catch (err:any) {
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;
