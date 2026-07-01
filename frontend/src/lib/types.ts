// File: src/lib/types.ts
export interface User {
  id: number;
  username: string;
  full_name?: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface AboutPage {
  id: number;
  sejarah: string;
  visi: string;
  misi: string;
  fasilitas: string;
  kontak: string;
  image_url: string | null;
  status: 'active' | 'inactive';
}

export interface SchoolInfo {
  id?: number;
  school_name: string;
  school_moto: string;
  logo_url?: string | null;
}