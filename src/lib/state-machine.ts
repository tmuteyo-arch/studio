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
  'Under Review': ['Approved', 'Rejected', 'Pending Documents'], // Can be approved, rejected, or sent back for docs
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
    case 'Pending Documents': return 'Pending Documents';
    case 'Under Review': return 'Under Review';
    case 'Approved': return 'Approved';
    case 'Rejected': return 'Rejected';
    case 'Dispatched': return 'Account Dispatched';
    case 'Locked': return 'Record Locked';
    default: return status;
  }
}
