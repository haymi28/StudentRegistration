export type Role = 'children' | 'juniors' | 'seniors';
export type UserRole = Role | 'superadmin';

export interface Student {
  id: string;
  fullName: string;
  christianName: string;
  dob: Date;
  address: string;
  fatherPhone: string;
  motherPhone: string;
  joiningDate: Date;
  role: Role;
}
