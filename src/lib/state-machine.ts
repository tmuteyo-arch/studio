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
  'Under Review': ['Safe to Continue', 'Not Safe to Proceed', 'Needs Review', 'Pending Documents'],
  'Needs Review': ['Under Review', 'Pending Documents'],
  'Safe to Continue': ['Management Review', 'Not Safe to Proceed', 'Under Review'],
  'Management Review': ['Approved by Management', 'Not Safe to Proceed'],
  'Approved by Management': ['Approved', 'Not Safe to Proceed'],
  'Approved': ['Dispatched'],
  'Rejected': ['In Progress'],
  'Not Safe to Proceed': ['In Progress'],
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
 * Gets the display label for a state using simple English.
 */
export function getStateLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'Draft': return 'Draft';
    case 'In Progress': return 'In Progress';
    case 'Pending Documents': return 'Waiting for Files';
    case 'Under Review': return 'Waiting for Review';
    case 'Needs Review': return 'Needs Changes';
    case 'Safe to Continue': return 'Ready for Manager';
    case 'Not Safe to Proceed': return 'Stopped';
    case 'Management Review': return 'At Management';
    case 'Approved by Management': return 'Final Check: Supervisor';
    case 'Approved': return 'Ready to Finish';
    case 'Rejected': return 'Stopped';
    case 'Dispatched': return 'Account Finished';
    case 'Locked': return 'Record Saved';
    default: return status;
  }
}
