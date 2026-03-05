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
  { id: 'atl-1', name: 'CHIDO', role: 'atl', email: 'chido@inbucks.app', initials: 'CH' },
  { id: 'atl-2', name: 'COLLETOR', role: 'atl', email: 'colletor@inbucks.app', initials: 'CO' },
  { id: 'atl-3', name: 'CONCILLIA', role: 'atl', email: 'concillia@inbucks.app', initials: 'CN' },
  { id: 'atl-4', name: 'HEYZREST', role: 'atl', email: 'heyzrest@inbucks.app', initials: 'HE' },
  { id: 'atl-5', name: 'LIBERTY', role: 'atl', email: 'liberty@inbucks.app', initials: 'LI' },
  { id: 'atl-6', name: 'MERCY', role: 'atl', email: 'mercy@inbucks.app', initials: 'ME' },
  { id: 'atl-7', name: 'PAMELA', role: 'atl', email: 'pamela@inbucks.app', initials: 'PA' },
  { id: 'atl-8', name: 'PARADZAI', role: 'atl', email: 'paradzai@inbucks.app', initials: 'PR' },
  { id: 'atl-9', name: 'PRIDE', role: 'atl', email: 'pride@inbucks.app', initials: 'PD' },
  { id: 'atl-10', name: 'TARIRO', role: 'atl', email: 'tariro@inbucks.app', initials: 'TA' },
  { id: 'atl-11', name: 'TATENDA', role: 'atl', email: 'tatenda@inbucks.app', initials: 'TT' },
  { id: 'atl-12', name: 'TERENCE', role: 'atl', email: 'terence@inbucks.app', initials: 'TE' },
  { id: 'bo-1', name: 'Fadzai Zesa', role: 'back-office', email: 'bo1@inbucks.app', initials: 'FZ' },
  { 
    id: 'sup-1', 
    name: 'Blessing Zulu', 
    role: 'supervisor', 
    email: 'supervisor1@inbucks.app',
    initials: 'BZ',
    team: ['CHIDO', 'COLLETOR', 'CONCILLIA', 'HEYZREST', 'LIBERTY', 'MERCY', 'PAMELA', 'PARADZAI', 'PRIDE', 'TARIRO', 'TATENDA', 'TERENCE']
  },
  {
    id: 'exec-1',
    name: 'Tafadzwa Chihota',
    role: 'retail-executive',
    email: 'exec@inbucks.app',
    initials: 'TC',
  },
];
