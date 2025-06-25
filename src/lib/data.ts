import type { Student, AttendanceRecord } from './types';

export const students: Student[] = [
  {
    id: 'STU001',
    fullName: 'John Doe',
    christianName: 'John',
    dob: new Date('2005-04-12'),
    address: '123 Main St, Anytown, USA',
    fatherPhone: '123-456-7890',
    motherPhone: '098-765-4321',
    joiningDate: new Date('2022-09-01'),
  },
  {
    id: 'STU002',
    fullName: 'Jane Smith',
    christianName: 'Jane',
    dob: new Date('2006-08-22'),
    address: '456 Oak Ave, Anytown, USA',
    fatherPhone: '111-222-3333',
    motherPhone: '444-555-6666',
    joiningDate: new Date('2022-09-01'),
  },
  {
    id: 'STU003',
    fullName: 'Peter Jones',
    christianName: 'Peter',
    dob: new Date('2005-01-30'),
    address: '789 Pine Ln, Anytown, USA',
    fatherPhone: '777-888-9999',
    motherPhone: '000-111-2222',
    joiningDate: new Date('2023-01-15'),
  },
  {
    id: 'STU004',
    fullName: 'Mary Johnson',
    christianName: 'Mary',
    dob: new Date('2007-03-15'),
    address: '321 Elm St, Anytown, USA',
    fatherPhone: '321-654-9870',
    motherPhone: '654-321-0987',
    joiningDate: new Date('2023-02-20'),
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: 'ATT001',
    studentId: 'STU001',
    studentName: 'John Doe',
    checkInTime: new Date('2024-07-21T09:02:15'),
  },
  {
    id: 'ATT002',
    studentId: 'STU002',
    studentName: 'Jane Smith',
    checkInTime: new Date('2024-07-21T09:03:42'),
  },
  {
    id: 'ATT003',
    studentId: 'STU001',
    studentName: 'John Doe',
    checkInTime: new Date('2024-07-20T08:59:55'),
  },
  {
    id: 'ATT004',
    studentId: 'STU003',
    studentName: 'Peter Jones',
    checkInTime: new Date('2024-07-21T09:05:11'),
  },
    {
    id: 'ATT005',
    studentId: 'STU004',
    studentName: 'Mary Johnson',
    checkInTime: new Date('2024-07-20T09:01:30'),
  },
];
