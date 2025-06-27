export type Role = 'children' | 'children2' | 'juniors' | 'seniors';
export type UserRole = Role | 'superadmin';

export interface Student {
  id: string;
  fullName: string;
  christianName: string;
  educationLevel: string;
  dob: Date;
  address: string;
  fatherPhone: string;
  motherPhone: string;
  joiningDate: Date;
  role: Role;
  photoUrl?: string;
}
