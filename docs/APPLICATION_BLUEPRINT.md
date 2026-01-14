# Application Blueprint: SwiftAccount Agent Onboarding

This document provides a comprehensive technical blueprint for the SwiftAccount Agent Onboarding application. It outlines the architecture, data structures, key components, and core workflows.

---

## 1. High-Level Overview

**SwiftAccount** is a web application designed to streamline and digitize the agent onboarding process for a financial institution. It provides a role-based system for submitting, reviewing, validating, and approving new account applications, with integrated AI capabilities to assist in data extraction and risk assessment.

### Core Features:
- **Role-Based Dashboards**: Separate interfaces for Account Taking Leaders (ATL), Back Office staff, and Supervisors.
- **Multi-Step Onboarding Form**: A guided flow for creating new personal and corporate account applications.
- **Application Review Workflow**: A system for moving applications through states (e.g., Submitted, In Review, Pending Supervisor, Approved, Rejected).
- **AI-Powered Document Verification**: Uses Gemini to extract data from uploaded documents and validate it against user input.
- **AI-Powered Summarization**: Generates concise summaries and risk assessments for applications.
- **Digital Archiving**: A workflow for digitizing existing paper-based applications.
- **Performance Analytics**: Visual charts for supervisors to track team productivity.

---

## 2. Architecture & Tech Stack

The application is built on a modern, server-centric web stack.

- **Framework**: **Next.js 14+** (using the App Router)
- **Language**: **TypeScript**
- **UI Components**: **ShadCN UI** (a collection of reusable components built with Radix UI and Tailwind CSS)
- **Styling**: **Tailwind CSS**
- **State Management**: **Jotai** (for managing global client-side state like the active user and application data)
- **Generative AI**: **Genkit** with the **Google Gemini** models.
- **Forms**: **React Hook Form** with **Zod** for schema validation.
- **Charting**: **Recharts**

### Architectural Patterns:
- **Server Components by Default**: Most components are rendered on the server to improve performance and reduce the client-side JavaScript bundle.
- **Client Components ('use client')**: Components requiring interactivity, state, or browser-only APIs (like `useState`, `useEffect`, `useAtom`) are explicitly marked as Client Components.
- **Server Actions**: Asynchronous functions executed on the server, used for handling form submissions and AI-related tasks (`/lib/actions.ts`).

---

## 3. Project File Structure

The project is organized into the following key directories within `/src`:

- **/app/**: Contains the application's routes and pages, following the Next.js App Router convention.
  - `page.tsx`: The main entry point of the application, handling role selection and rendering the appropriate dashboard.
  - `globals.css`: Global styles and Tailwind CSS layers, including the application's color theme variables.
  - `layout.tsx`: The root layout for the entire application.

- **/components/**: Contains all reusable React components.
  - **/ui/**: Core UI elements provided by ShadCN (e.g., `Button`, `Card`, `Input`).
  - **/onboarding/**: Components specific to the application onboarding workflow (e.g., `OnboardingFlow`, `ApplicationReview`, `DigitizeApplicationFlow`).
  - **/roles/**: Top-level dashboard components for each user role (e.g., `AtlDashboard`, `SupervisorDashboard`).
  - `logo.tsx`: The application's SVG logo component.

- **/lib/**: Contains application logic, type definitions, and utilities.
  - `actions.ts`: Server Actions that are called from client components to perform server-side logic (e.g., calling AI flows).
  - `mock-data.ts`: Contains the in-memory "database" using Jotai atoms. This is where all application data is stored for the demo.
  - `types.ts`: Central location for all TypeScript type definitions and Zod schemas (e.g., `OnboardingFormData`, `Application`).
  - `users.ts`: Defines the user data and roles.
  - `document-requirements.ts`: A utility function that defines the required documents for each account type.

- **/ai/**: Contains all Generative AI logic, managed by Genkit.
  - `genkit.ts`: Initializes and configures the Genkit `ai` instance with the Google AI provider.
  - **/flows/**: Contains the Genkit flows.
    - `extract-and-validate-data.ts`: The flow that uses Gemini to read documents and extract data.
    - `summarize-application-flow.ts`: The flow that uses Gemini to generate a summary and risk assessment.

---

## 4. Core Data Schemas

These data structures are defined in `/src/lib/types.ts` and `/src/lib/mock-data.ts`.

### Application
Represents a single onboarding application.
```typescript
type Application = {
  id: string;
  clientName: string;
  clientType: string;
  status: 'Submitted' | 'In Review' | 'Pending Supervisor' | 'Approved' | 'Rejected' | 'Returned to ATL' | 'Archived';
  submittedDate: string;
  lastUpdated: string;
  submittedBy: string;
  fcbStatus: 'Inclusive' | 'Good' | 'Adverse' | 'PEP' | 'Prior Adverse';
  details: OnboardingFormData; // Form data
  directors: Director[];
  documents: Document[];
  history: HistoryLog[];
  comments: Comment[];
};
```

### OnboardingFormData (Zod Schema)
Defines the structure and validation rules for the multi-step form. It includes fields for personal info, corporate info, documents, and terms agreement.

### User
Represents a user in the system.
```typescript
interface User {
  id: string;
  name: string;
  role: 'atl' | 'back-office' | 'supervisor';
  email: string;
  initials: string;
  team?: string[]; // For supervisors
}
```

---

## 5. Key Workflows & Components

### 5.1. New Application Onboarding (`OnboardingFlow.tsx`)
- **Purpose**: A multi-step wizard for creating a new application.
- **Structure**: Uses `react-hook-form` and a `FormProvider` to manage state across multiple steps.
- **Steps**:
  1.  `StepAccountType`: Select the account type.
  2.  `StepPersonalInfo`: Enter basic applicant details.
  3.  `StepCorporateInfo` / `StepDirectors`: (Conditional) Enter detailed corporate and director information.
  4.  `StepDocumentUpload`: Upload documents and trigger AI verification.
  5.  `StepReview`: Review all information and submit.

### 5.2. Application Review (`ApplicationReview.tsx`)
- **Purpose**: A detailed view for Back Office and Supervisors to review, edit, and action an application.
- **Features**:
  - Tabbed interface (`Details`, `Documents`, `History`, `Comments`).
  - Role-specific action buttons (e.g., "Send to Supervisor", "Approve", "Reject").
  - Commenting system.
  - FCB Status check.
  - AI Summary generation button.
  - PDF download functionality using `jspdf` and `html2canvas`.

### 5.3. Paper Application Digitization (`DigitizeApplicationFlow.tsx`)
- **Purpose**: A streamlined workflow for archiving paper documents.
- **Features**:
  - Simple interface to enter a client name.
  - Uses the browser's `getUserMedia` API to allow scanning pages with a device camera.
  - Allows uploading of existing image/PDF files.
  - Saves all pages as a single "Archived" application record.
