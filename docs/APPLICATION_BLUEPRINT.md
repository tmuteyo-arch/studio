# Application Blueprint: InnBucks Agent Onboarding

This document provides a comprehensive technical blueprint for the InnBucks Agent Onboarding application.

## 1. High-Level Overview
**InnBucks** is a digital platform for onboarding financial agents in Zimbabwe. It features a tiered workflow involving sales, clerical verification, and executive management.

### Core Features:
- **Role-Based Hierarchy**: 
  - **Area Sales Leaders (ASL)**: Originate applications and claim customer leads.
  - **Back Office Clerks**: Verify documents and perform FCB checks.
  - **Back Office Supervisors**: Audit clerical work and provide first-level approval.
  - **MANAGEMENT**: Unified oversight, bulk approvals, and regional analytics.
- **AI-Powered Verification**: Document extraction and cross-validation using Gemini.
- **Digital Archiving**: Camera-based scanning for legacy paper records.
- **PDF Generation**: Automated agency agreements with digital signatures.

## 2. Technical Stack
- **Framework**: Next.js 15 (App Router)
- **AI**: Genkit with Google Gemini
- **Database/Auth**: Firebase (Client SDK)
- **State**: Jotai (with local persistence)
- **UI**: ShadCN UI + Tailwind CSS
- **PDF**: jsPDF + html2canvas

## 3. Key Workflows
### 3.1. ASL Onboarding
- Distinction between **"New Application"** (manual) and **"New Sign Up"** (customer lead).
- Dynamic requirements based on 11+ account types (Personal, Trust, Company, etc.).

### 3.2. Verification & Archival
- Clerks perform "Safety Checks" and can return files to ASLs.
- Physical documents can be digitized using the integrated camera scanner.

### 3.3. Management Oversight
- Combined Finance and Executive dashboard.
- Bulk approval functionality for multiple applications.
- Regional trend analytics using Recharts.
