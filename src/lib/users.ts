'use client';

export type Role = 'atl' | 'back-office' | 'supervisor';

export interface User {
  id: string;
  name: string;
  role: Role;
  initials: string;
}

export const users: User[] = [
  { id: 'user-1', name: 'Tashinga Muteyo', role: 'atl', initials: 'TM' },
  { id: 'user-2', name: 'Tendai Moyo', role: 'atl', initials: 'TM' },
  { id: 'user-3', name: 'Fadzai Zesa', role: 'back-office', initials: 'FZ' },
  { id: 'user-4', name: 'Blessing Zulu', role: 'supervisor', initials: 'BZ' },
];
