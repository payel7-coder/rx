# Minimal README for rx scaffold

This repository contains a starter scaffold for Prescription Management Software.

Structure:
- backend/ - Node.js + Express + TypeScript + Prisma
- frontend/ - React + Vite + TypeScript + Tailwind
- docker-compose.yml - local dev stack (Postgres, Redis, backend, frontend)

Branch: scaffold/initial — initial scaffold commit

Next steps:
1. Set environment variables in backend/.env
2. Run docker-compose up --build
3. Inside backend, run `npx prisma migrate dev --name init` to apply DB schema

