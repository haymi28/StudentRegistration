'use server';

import prisma from './prisma';
import type { Student, Role, StudentCreateInput, UserRole } from './types';

export const getStudents = async (): Promise<Student[]> => {
    return prisma.student.findMany({
        orderBy: {
            fullName: 'asc'
        }
    });
}

export const addStudent = async (student: StudentCreateInput): Promise<{ data: Student | null; error: { code?: string; message: string } | null }> => {
    try {
        const newStudent = await prisma.student.create({
            data: student,
        });
        return { data: newStudent, error: null };
    } catch (error: any) {
        // Log the actual error on the server for debugging
        console.error("Error adding student:", error);
        
        // If it's a known Prisma error, pass the code.
        if (error.code) {
             return { data: null, error: { code: error.code, message: error.message } };
        }
        // Otherwise, return a generic error.
        return { data: null, error: { message: "An unexpected error occurred." } };
    }
}

export const getStudentById = async (id: string): Promise<Student | null> => {
    return prisma.student.findUnique({
        where: { id },
    });
}

export const updateStudent = async (updatedStudent: Student): Promise<Student> => {
    const { id, ...dataToUpdate } = updatedStudent;
    return prisma.student.update({
        where: { id: id },
        data: dataToUpdate,
    });
}

export const deleteStudent = async (studentId: string): Promise<void> => {
    await prisma.student.delete({
        where: { id: studentId },
    });
}

export const transferStudents = async (studentIds: string[], newRole: Role): Promise<void> => {
    await prisma.student.updateMany({
        where: {
            id: { in: studentIds },
        },
        data: {
            role: newRole,
        },
    });
}

// Admin Credential Functions
export const verifyAdminPassword = async (role: UserRole, password: string): Promise<boolean> => {
    try {
        const credential = await prisma.adminCredential.findUnique({
            where: { role },
        });

        // If a credential is found in the database, use it
        if (credential) {
            return credential.password === password;
        }
    } catch (error) {
        console.error("DB Error during password verification. Falling back to defaults.", error);
    }
    
    // Fallback to hardcoded passwords if DB check fails or no credential exists
    console.warn(`No database credential found for role '${role}'. Using hardcoded fallback passwords. Please run 'npx prisma db seed' to set passwords in the database.`);
    const fallbackPasswords: Record<UserRole, string> = {
        superadmin: 'superpassword',
        children: 'childrenpassword',
        children2: 'children2password',
        juniors: 'juniorspassword',
        seniors: 'seniorspassword',
    };
    
    return fallbackPasswords[role] === password;
}

export const updateAdminPassword = async (role: UserRole, password: string) => {
    return prisma.adminCredential.update({
        where: { role },
        data: { password },
    });
}
