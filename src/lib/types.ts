export type Role = 'children' | 'children2' | 'juniors' | 'seniors';
export type UserRole = Role | 'superadmin';
export type Gender = 'ወንድ' | 'ሴት';

export interface Student {
  id: string;
  fullName: string;
  christianName: string;
  gender: Gender;
  educationLevel: string;
  dob: Date;
  subcity: string;
  kebele: string;
  houseNumber: string;
  houseAddressDetail: string;
  fatherPhone: string;
  motherPhone?: string;
  joiningDate: Date;
  role: Role;
  photoUrl?: string;
}
