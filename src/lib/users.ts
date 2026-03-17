'use client';

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type Role = 'asl' | 'back-office' | 'supervisor' | 'management' | 'admin' | 'compliance';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  initials: string;
  status: 'active' | 'disabled';
  password?: string;
  team?: string[]; // Names of people this manager looks after
}

export const initialUsers: User[] = [
  { id: 'admin-1', name: 'IT ADMIN', role: 'admin', email: 'admin@inbucks.app', initials: 'AD', status: 'active', password: 'AdminPassword123!' },
  { id: 'asl-1', name: 'CHIDO', role: 'asl', email: 'chido@inbucks.app', initials: 'CH', status: 'active', password: 'DemoPassword123!' },
  { id: 'asl-2', name: 'COLLETOR', role: 'asl', email: 'colletor@inbucks.app', initials: 'CO', status: 'active', password: 'DemoPassword123!' },
  { id: 'bo-1', name: 'TENDAI', role: 'back-office', email: 'tendai@inbucks.app', initials: 'TE', status: 'active', password: 'DemoPassword123!' },
  { id: 'bo-2', name: 'TASHINGA', role: 'back-office', email: 'tashinga@inbucks.app', initials: 'TS', status: 'active', password: 'DemoPassword123!' },
  { 
    id: 'sup-1', 
    name: 'Blessing Zulu', 
    role: 'supervisor', 
    email: 'supervisor1@inbucks.app',
    initials: 'BZ',
    status: 'active',
    password: 'DemoPassword123!',
    team: ['CHIDO', 'COLLETOR']
  },
  {
    id: 'mgmt-1',
    name: 'Tafadzwa Chihota',
    role: 'management',
    email: 'exec@inbucks.app',
    initials: 'TC',
    status: 'active',
    password: 'DemoPassword123!',
  },
  {
    id: 'compliance-1',
    name: 'Compliance Chief',
    role: 'compliance',
    email: 'risk@inbucks.app',
    initials: 'CC',
    status: 'active',
    password: 'DemoPassword123!',
  }
];

export const usersAtom = atomWithStorage<User[]>('innbucks_system_users_v1', initialUsers);
