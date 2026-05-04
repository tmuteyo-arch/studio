'use client';

import { ApplicationStatus } from './mock-data';

/**
 * Defines the valid transitions for the application lifecycle.
 * The system enforces that states cannot be skipped.
 */
export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  'Draft': ['In Progress'],
  'In Progress': ['Pending Documents'],
  'Pending Documents': ['Under Review'],
  'Under Review': ['Pending Supervisor', 'Rejected', 'Pending Documents'],
  'Pending Supervisor': ['Pending Executive Signature', 'Rejected', 'Under Review'],
  'Pending Executive Signature': ['Approved by Management', 'Rejected'],
  'Approved by Management': ['Approved', 'Rejected'],
  'Approved': ['Dispatched'],
  'Rejected': ['In Progress'], // Allow re-opening from rejection
  'Dispatched': ['Locked'],
  'Locked': [], // Final state
};

/**
 * Validates if a transition from currentStatus to nextStatus is allowed.
 */
export function isValidTransition(currentStatus: ApplicationStatus, nextStatus: ApplicationStatus): boolean {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

/**
 * Gets the display label for a state.
 */
export function getStateLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'Draft': return 'Draft';
    case 'In Progress': return 'In Progress';
    case 'Pending Documents': return 'Waiting for Files';
    case 'Under Review': return 'Waiting for Review';
    case 'Pending Supervisor': return 'Checking: Supervisor';
    case 'Pending Executive Signature': return 'Checking: Manager';
    case 'Approved by Management': return 'Final Check: Supervisor';
    case 'Approved': return 'Ready to Finish';
    case 'Rejected': return 'Returned/Rejected';
    case 'Dispatched': return 'Account Finished';
    case 'Locked': return 'Record Saved';
    default: return status;
  }
}
