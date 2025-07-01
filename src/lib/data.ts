
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

        // If a credential is not found, or if the password doesn't match, return false.
        if (!credential) {
            return false;
        }
        
        return credential.password === password;
        
    } catch (error) {
        console.error("DB Error during password verification. Assuming failure.", error);
        return false;
    }
}

export const updateAdminPassword = async (role: UserRole, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const credential = await prisma.adminCredential.findUnique({
        where: { role },
    });

    if (!credential) {
        // This case should ideally not be reached if the user is logged in.
        return { success: false, message: "የአስተዳዳሪ መረጃ አልተገኘም። እባክዎ እንደገና ይግቡ።" };
    }

    if (credential.password !== currentPassword) {
        return { success: false, message: "የአሁኑ የይለፍ ቃል የተሳሳተ ነው።" };
    }

    try {
        await prisma.adminCredential.update({
            where: { role: role },
            data: { password: newPassword },
        });
        return { success: true, message: "የይለፍ ቃል በተሳካ ሁኔታ ተዘምኗል።" };
    } catch (error) {
        console.error("Error updating password:", error);
        return { success: false, message: "የይለፍ ቃሉን ማዘመን አልተቻለም። እባክዎ እንደገና ይሞክሩ።" };
    }
}
