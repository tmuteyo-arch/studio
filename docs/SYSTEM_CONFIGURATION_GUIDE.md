# System Configuration Guide: InnBucks Agent Onboarding

This document outlines the data schema for the InnBucks Agent Onboarding application. Use this guide to configure downstream systems that will receive data from this application.

## 1. Onboarding Data Fields

The following is a comprehensive list of all data fields collected during the onboarding process. Not all fields are required for every account type.

### 1.1. Account & Applicant Information

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `clientType` | String | The type of account being opened. See "Account Types" section for possible values. |
| `fullName` | String | The full name of the individual applicant or the primary contact person for a corporate entity. |
| `dateOfBirth` | String (Date) | The applicant's date of birth (YYYY-MM-DD). |
| `address` | String | The primary home or business address. |

### 1.2. Corporate Information

These fields are only applicable when `clientType` is a corporate entity (e.g., 'Company (Private / Public Limited)', 'Partnership', etc.).

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `organisationLegalName` | String | The full registered legal name of the organization. |
| `tradeName` | String | The trading name of the business, if different from the legal name. |
`physicalAddress` | String | The physical operating address of the company. |
| `postalAddress` | String | The postal address of the company. |
| `webAddress` | String (URL) | The company's official website address. |
| `businessTelNumber` | String | The primary contact telephone number for the business. |
| `email` | String (Email) | The official contact email for the business. |
| `natureOfBusiness` | String | A description of the company's primary business activities. |
| `dateOfIncorporation` | String (Date) | The date the company was incorporated (YYYY-MM-DD). |
| `countryOfIncorporation` | String | The country where the company was incorporated. |
| `certificateOfIncorporationNumber` | String | The official registration or incorporation number. |
| `sourceOfWealth` | String | Description of the primary source of the company's funds or wealth. |
| `noOfEmployees` | Number | The number of employees in the organization. |
| `economicSector` | String | The economic sector in which the business operates. |

### 1.3. Directors & Signatories

For corporate accounts, information for one or more directors/signatories can be collected.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `fullName` | String | The full name of the director or signatory. |
| `idNumber` | String | The director's National ID or Passport number. |
| `dateOfBirth` | String (Date) | The director's date of birth (YYYY-MM-DD). |
| `address` | String | The director's residential address. |
| `designation` | String | The director's title or role (e.g., CEO, Finance Director). |
| `phoneNumber` | String | The director's personal phone number. |
| `gender` | String | The director's gender. |

### 1.4. Document Upload Information

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `document1Type` | String | The type of the first document uploaded (e.g., 'Passport'). |
| `document2Type` | String | The type of the second document uploaded (e.g., 'Utility Bill'). |

---

## 2. Account Types

The `clientType` field will contain one of the following values:

- Personal Account
- Proprietorship / Sole Trader
- Partnership
- Company (Private / Public Limited)
- PBC Account
- Trust
- NGO / Non-Profit / Embassy
- Society / Association / Club
- Government / Local Authority
- Minors
- Professional Intermediaries

---

## 3. Document Requirements

The system requires different documents based on the `clientType`. The following table lists the possible document types that can be uploaded.

| Document Type |
| :--- |
| Passport |
| Driver's License |
| National ID Card |
| Utility Bill |
| Bank Statement |
| Tax Clearance Certificate |
| Trading License |
| Board Resolution |
| Certificate of Incorporation |
| Memorandum and Articles of Association |
| CR6/CR5 |
| CR14 |
| CR11 |
| Partnership Agreement |

Please refer to the application's internal logic for the specific combination of documents required for each account type. This document serves as a master list of all possible data points.
