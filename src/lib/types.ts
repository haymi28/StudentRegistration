import type { Student as PrismaStudent, Role as PrismaRole, Prisma } from '@prisma/client';

export type Role = PrismaRole;
export type UserRole = Role | 'superadmin';
export type Gender = 'ወንድ' | 'ሴት';

// Re-export Prisma's generated Student type.
// This ensures our application types are always in sync with the database schema.
export type Student = PrismaStudent;
export type StudentCreateInput = Prisma.StudentCreateInput;
