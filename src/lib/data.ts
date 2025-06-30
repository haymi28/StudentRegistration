'use server';

import prisma from './prisma';
import type { Student, Role, StudentCreateInput } from './types';

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
