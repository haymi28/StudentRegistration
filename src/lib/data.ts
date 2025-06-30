'use server';

import prisma from './prisma';
import type { Student, Role } from './types';

export const getStudents = async (): Promise<Student[]> => {
    return prisma.student.findMany({
        orderBy: {
            fullName: 'asc'
        }
    });
}

export const addStudent = async (student: Student): Promise<boolean> => {
    try {
        const existingStudent = await prisma.student.findUnique({
            where: { id: student.id },
        });
        if (existingStudent) {
            console.warn(`Student with ID ${student.id} already exists.`);
            return false;
        }
        await prisma.student.create({
            data: student,
        });
        return true;
    } catch (error) {
        console.error("Error adding student:", error);
        return false;
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
