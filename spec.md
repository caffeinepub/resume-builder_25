# Resume Builder

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- Resume creation with multiple sections: personal info, work experience, education, skills, summary
- Live preview of the resume as the user fills in the form
- Multiple resume templates (Classic, Modern, Minimal)
- Ability to save resumes to the backend (per user session)
- Ability to load and edit previously saved resumes
- Stripe payment to unlock PDF export / premium templates
- Resume list dashboard to manage saved resumes

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: store resumes (title, sections data, template choice) per user principal. CRUD operations: create, read, update, delete resume.
2. Frontend: multi-step form editor with sections for personal info, summary, work experience, education, skills.
3. Live preview panel alongside the form showing rendered resume.
4. Template selector (Classic, Modern, Minimal).
5. Dashboard page listing saved resumes with edit/delete actions.
6. Stripe paywall for PDF export and premium templates.
