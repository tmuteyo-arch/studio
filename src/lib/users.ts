'use client';

export type Role = 'atl' | 'back-office' | 'supervisor' | 'retail-executive';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  initials: string;
  team?: string[]; // Names of ATLs this supervisor manages
}

export const users: User[] = [
  { id: 'user-1', name: 'Tashinga Muteyo', role: 'atl', email: 'atl1@inbucks.app', initials: 'TM' },
  { id: 'user-2', name: 'Tendai Moyo', role: 'atl', email: 'atl2@inbucks.app', initials: 'TM' },
  { id: 'user-3', name: 'Fadzai Zesa', role: 'back-office', email: 'bo1@inbucks.app', initials: 'FZ' },
  { 
    id: 'user-4', 
    name: 'Blessing Zulu', 
    role: 'supervisor', 
    email: 'supervisor1@inbucks.app',
    initials: 'BZ',
    team: ['Tashinga Muteyo', 'Tendai Moyo']
  },
  {
    id: 'user-5',
    name: 'Tafadzwa Chihota',
    role: 'retail-executive',
    email: 'exec@inbucks.app',
    initials: 'TC',
  },
];
