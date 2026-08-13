import prisma from '../prisma';
import bcrypt from 'bcrypt';

async function upsertUser(email: string, password: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, passwordHash, role: role as any } });
}

async function main() {
  console.log('Seeding users...');
  const admin = await upsertUser('admin@example.com', 'password123', 'ADMIN');
  const doctor = await upsertUser('doctor@example.com', 'password123', 'DOCTOR');
  const pharm = await upsertUser('pharm@example.com', 'password123', 'PHARMACIST');
  const patientUser = await upsertUser('patient@example.com', 'password123', 'PATIENT');

  console.log('Seeding domain data...');

  // Medications
  const medsData = [
    { name: 'Amoxicillin', ndc: '0002-0800-01', strength: '500 mg', form: 'capsule' },
    { name: 'Lisinopril', ndc: '0003-0200-01', strength: '10 mg', form: 'tablet' },
    { name: 'Atorvastatin', ndc: '0004-0500-01', strength: '20 mg', form: 'tablet' },
  ];

  const medications: any[] = [];
  for (const m of medsData) {
    const existing = await prisma.medication.findUnique({ where: { ndc: m.ndc } });
    if (existing) {
      medications.push(existing);
      continue;
    }
    const created = await prisma.medication.create({ data: m });
    medications.push(created);
  }

  // Patients
  const patientsData = [
    { firstName: 'John', lastName: 'Doe', dob: new Date('1980-01-01'), mrn: 'MRN-001', phone: '555-0101', email: 'john.doe@example.com' },
    { firstName: 'Jane', lastName: 'Smith', dob: new Date('1990-05-12'), mrn: 'MRN-002', phone: '555-0202', email: 'jane.smith@example.com' },
  ];

  const patients: any[] = [];
  for (const p of patientsData) {
    const existing = await prisma.patient.findUnique({ where: { mrn: p.mrn } });
    if (existing) {
      patients.push(existing);
      continue;
    }
    const created = await prisma.patient.create({ data: p });
    patients.push(created);
  }

  // Sample prescriptions
  console.log('Seeding prescriptions...');

  const presc1 = await prisma.prescription.create({
    data: {
      patientId: patients[0].id,
      prescriberId: doctor.id,
      medicationId: medications[0].id,
      dosage: '500 mg',
      frequency: 'TID',
      quantity: 21,
      refills: 0,
      status: 'ISSUED',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      notes: 'Take with food',
    },
  });

  await prisma.prescriptionEvent.create({
    data: {
      prescriptionId: presc1.id,
      actorId: doctor.id,
      action: 'ISSUED',
      detail: `Issued by ${doctor.email}`,
    },
  });

  const presc2 = await prisma.prescription.create({
    data: {
      patientId: patients[1].id,
      prescriberId: doctor.id,
      medicationId: medications[1].id,
      dosage: '10 mg',
      frequency: 'QD',
      quantity: 30,
      refills: 1,
      status: 'DISPENSED',
      issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      notes: 'Monitor blood pressure',
    },
  });

  await prisma.prescriptionEvent.create({
    data: {
      prescriptionId: presc2.id,
      actorId: doctor.id,
      action: 'ISSUED',
      detail: `Issued by ${doctor.email}`,
    },
  });

  await prisma.prescriptionEvent.create({
    data: {
      prescriptionId: presc2.id,
      actorId: pharm.id,
      action: 'DISPENSED',
      detail: `Dispensed by ${pharm.email}`,
    },
  });

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
