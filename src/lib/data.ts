import type { Student, Role } from './types';

const defaultStudents: Student[] = [
  {
    id: 'STU001',
    fullName: 'አበበ ከበደ',
    christianName: 'ዮሐንስ',
    educationLevel: 'መዋለ ህፃናት',
    dob: new Date('2015-04-12'),
    address: '123 ዋና መንገድ, አዲስ አበባ',
    fatherPhone: '123-456-7890',
    motherPhone: '098-765-4321',
    joiningDate: new Date('2022-09-01'),
    role: 'children',
    photoUrl: 'https://placehold.co/100x100.png'
  },
  {
    id: 'STU002',
    fullName: 'አለሚቱ ጫላ',
    christianName: 'አለሚቱ',
    educationLevel: 'ቅድመ-መዋለ ህፃናት',
    dob: new Date('2016-08-22'),
    address: '456 ኦክ ጎዳና, አዲስ አበባ',
    fatherPhone: '111-222-3333',
    motherPhone: '444-555-6666',
    joiningDate: new Date('2022-09-01'),
    role: 'children',
    photoUrl: 'https://placehold.co/100x100.png'
  },
  {
    id: 'STU003',
    fullName: 'ጴጥሮስ ዮሐንስ',
    christianName: 'ጴጥሮስ',
    educationLevel: '3ኛ ክፍል',
    dob: new Date('2012-01-30'),
    address: '789 ፓይን መንገድ, አዲስ አበባ',
    fatherPhone: '777-888-9999',
    motherPhone: '000-111-2222',
    joiningDate: new Date('2023-01-15'),
    role: 'juniors'
  },
  {
    id: 'STU004',
    fullName: 'ማርያም ጌታቸው',
    christianName: 'ማርያም',
    educationLevel: '6ኛ ክፍል',
    dob: new Date('2009-03-15'),
    address: '321 ኤልም መንገድ, አዲስ አበባ',
    fatherPhone: '321-654-9870',
    motherPhone: '654-321-0987',
    joiningDate: new Date('2023-02-20'),
    role: 'seniors'
  },
];

const isServer = typeof window === 'undefined';

const studentReviver = (key: string, value: any) => {
    if ((key === 'dob' || key === 'joiningDate') && value) {
        return new Date(value);
    }
    return value;
};

const getRawStudents = (): Student[] => {
    if (isServer) return [...defaultStudents];
    try {
        const item = window.localStorage.getItem('students');
        if (item) {
            return JSON.parse(item, studentReviver);
        } else {
            const students = [...defaultStudents];
            window.localStorage.setItem('students', JSON.stringify(students));
            return students;
        }
    } catch (error) {
        console.error("Error with localStorage 'students'", error);
        return [...defaultStudents];
    }
}

const saveStudents = (students: Student[]) => {
    if (isServer) return;
    try {
        window.localStorage.setItem('students', JSON.stringify(students));
        window.dispatchEvent(new Event("local-storage-update"));
    } catch (error) {
        console.error("Error writing students to localStorage", error);
    }
}

export const getStudents = (): Student[] => {
    return getRawStudents();
}

export const addStudent = (student: Student): boolean => {
    const students = getRawStudents();
    const studentExists = students.some(s => s.id.toLowerCase() === student.id.toLowerCase());
    if (studentExists) {
        console.warn(`Student with ID ${student.id} already exists.`);
        return false;
    }
    students.push(student);
    saveStudents(students);
    return true;
}

export const getStudentById = (id: string): Student | undefined => {
    const students = getRawStudents();
    return students.find(s => s.id === id);
}

export const updateStudent = (updatedStudent: Student) => {
    let students = getRawStudents();
    students = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    saveStudents(students);
}

export const deleteStudent = (studentId: string) => {
    let students = getRawStudents();
    students = students.filter(s => s.id !== studentId);
    saveStudents(students);
}

export const transferStudents = (studentIds: string[], newRole: Role) => {
    let students = getRawStudents();
    students = students.map(student => {
        if (studentIds.includes(student.id)) {
            return { ...student, role: newRole };
        }
        return student;
    });
    saveStudents(students);
}
