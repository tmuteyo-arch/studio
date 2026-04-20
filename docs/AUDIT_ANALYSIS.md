# InnBucks Onboarding System: Senior Auditor Analysis

## 1. Compliance Audit
**Status: COMPLETED**

### Issues
- **Static Verification Loophole**: System validates file existence/quality but not legal content or validity.
- **Stale Document Acceptance**: No expiry tracking for ZIMRA or Trading Licenses.
- **Manual PEP/Sanctions Override**: Reliance on manual dropdowns for FCB/PEP status.
- **Institutional Hierarchy Opacity**: Weak verification of authority for complex "Other" entities.

### How they happen
- Submission of expired but clear scans.
- Human error in manual status selection.
- Lack of recursive UBO (Ultimate Beneficial Owner) capturing for tiered entities.

### Impact
- High risk of RBZ regulatory penalties.
- Exposure to AML (Anti-Money Laundering) "Placement" risks.
- Material deficiencies in the registry during formal audits.

### Recommended Solutions
- **Expiry Metadata**: Force "Expiry Date" capture for all regulatory docs.
- **OCR Validation**: Cross-reference image text with form data.
- **Bureau Integration**: Automate sanctions screening via API tokens.
- **EDD Triggers**: Mandatory secondary sign-off for high-risk entity types.

---
*Next Category: Security*
