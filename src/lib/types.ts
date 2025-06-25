export interface Student {
  id: string;
  fullName: string;
  christianName: string;
  dob: Date;
  address: string;
  fatherPhone: string;
  motherPhone: string;
  joiningDate: Date;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  checkInTime: Date;
}
