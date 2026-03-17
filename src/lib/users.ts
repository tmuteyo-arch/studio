'use client';

export type Role = 'asl' | 'back-office' | 'supervisor' | 'management' | 'admin';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  initials: string;
  team?: string[]; // Names of people this manager looks after
}

export const users: User[] = [
  { id: 'admin-1', name: 'IT ADMIN', role: 'admin', email: 'admin@inbucks.app', initials: 'AD' },
  { id: 'asl-1', name: 'CHIDO', role: 'asl', email: 'chido@inbucks.app', initials: 'CH' },
  { id: 'asl-2', name: 'COLLETOR', role: 'asl', email: 'colletor@inbucks.app', initials: 'CO' },
  { id: 'asl-3', name: 'CONCILLIA', role: 'asl', email: 'concillia@inbucks.app', initials: 'CN' },
  { id: 'asl-4', name: 'HEYZREST', role: 'asl', email: 'heyzrest@inbucks.app', initials: 'HE' },
  { id: 'asl-5', name: 'LIBERTY', role: 'asl', email: 'liberty@inbucks.app', initials: 'LI' },
  { id: 'asl-6', name: 'MERCY', role: 'asl', email: 'mercy@inbucks.app', initials: 'ME' },
  { id: 'asl-7', name: 'PAMELA', role: 'asl', email: 'pamela@inbucks.app', initials: 'PA' },
  { id: 'asl-8', name: 'PARADZAI', role: 'asl', email: 'paradzai@inbucks.app', initials: 'PR' },
  { id: 'asl-9', name: 'PRIDE', role: 'asl', email: 'pride@inbucks.app', initials: 'PD' },
  { id: 'asl-10', name: 'TARIRO', role: 'asl', email: 'tariro@inbucks.app', initials: 'TA' },
  { id: 'asl-11', name: 'TATENDA', role: 'asl', email: 'tatenda@inbucks.app', initials: 'TT' },
  { id: 'asl-12', name: 'TERENCE', role: 'asl', email: 'terence@inbucks.app', initials: 'TE' },
  { id: 'bo-1', name: 'TENDAI', role: 'back-office', email: 'tendai@inbucks.app', initials: 'TE' },
  { id: 'bo-2', name: 'TASHINGA', role: 'back-office', email: 'tashinga@inbucks.app', initials: 'TS' },
  { id: 'bo-3', name: 'RICHARD', role: 'back-office', email: 'richard@inbucks.app', initials: 'RI' },
  { id: 'bo-4', name: 'NYARADZO', role: 'back-office', email: 'nyaradzo@inbucks.app', initials: 'NY' },
  { 
    id: 'sup-1', 
    name: 'Blessing Zulu', 
    role: 'supervisor', 
    email: 'supervisor1@inbucks.app',
    initials: 'BZ',
    team: ['CHIDO', 'COLLETOR', 'CONCILLIA', 'HEYZREST', 'LIBERTY', 'MERCY', 'PAMELA', 'PARADZAI', 'PRIDE', 'TARIRO', 'TATENDA', 'TERENCE']
  },
  {
    id: 'mgmt-1',
    name: 'Tafadzwa Chihota',
    role: 'management',
    email: 'exec@inbucks.app',
    initials: 'TC',
  },
  {
    id: 'mgmt-2',
    name: 'Farai Mukarati',
    role: 'management',
    email: 'fd@inbucks.app',
    initials: 'FM',
  },
];
