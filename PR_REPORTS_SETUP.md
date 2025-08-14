# PR Reports System Setup Guide

## Overview

This system provides a complete PR distribution reporting solution with CSV upload, report management, and access control features.

## Features Implemented

### Route A: CSV Upload (`/pr-reports`)

- CSV file picker with validation
- Report title input (optional)
- Upload to backend API
- Redirect to reports list on success
- Error handling with toast notifications

### Route B: Reports List (`/pr-reports-list`)

- Search functionality
- Pagination (10, 25, 50 items per page)
- Sorting by various fields
- Table view with all required columns
- Empty state with CTA to upload
- URL state preservation

### Route C: Report Detail (`/pr-reports/[id]`)

- Public/private access control
- Email verification flow for private reports
- OTP verification system
- Report data display
- CSV export functionality
- Access token management

## API Integration

### Backend Routes Used

- `POST /pr-distribution/uploadPR` - Upload CSV
- `GET /pr-distribution/getPRReportGroups` - List reports
- `GET /pr-distribution/getPRReportGroupByGridId/:grid_id` - Get report group
- `GET /pr-distribution/getPRReportByBatchId/:batch_id` - Get report details
- `POST /pr-distribution/getPRReportData` - Get report data
- `GET /pr-distribution/exportPRReportCsv/:grid_id` - Export CSV

### Missing Backend Routes (Simulated for now)

- `POST /pr-distribution/:id/request-access` - Request access
- `POST /pr-distribution/:id/verify-otp` - Verify OTP

## Environment Configuration

Create a `.env.local` file with:

```bash
# API Configuration
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Firebase Configuration (if using Firebase auth)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## Installation & Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (see above)

3. Run the development server:

```bash
npm run dev
```

4. Access the application at `http://localhost:3000`

## File Structure

```
app/
├── pr-reports/           # CSV upload page
├── pr-reports-list/      # Reports listing page
├── pr-reports/[id]/      # Report detail page
└── layout.jsx            # Main layout with navigation

components/
├── EmailAccessDialog.jsx # Private report access dialog
└── Navigation.jsx        # Main navigation component

lib/
├── api.js               # API helper functions
└── axios.js             # Axios configuration

services/
└── prReports.js         # PR reports API service
```

## Usage Flow

1. **Upload CSV**: Navigate to `/pr-reports`, select CSV file, add title (optional), upload
2. **View Reports**: Go to `/pr-reports-list` to see all uploaded reports
3. **View Details**: Click "View" on any report to see full details
4. **Private Access**: If report is private, enter email and verify OTP
5. **Export**: Download report data as CSV from detail page

## CSV Format Requirements

The system expects CSV files with these columns:

- Exchange Symbol
- Recipient
- URL
- Potential Reach
- About
- Value

## State Management

- **No localStorage usage** for PR reports (as requested)
- **sessionStorage** for access tokens only
- All data fetched from API
- URL state for list filters and pagination

## Error Handling

- Toast notifications for user feedback
- Inline error messages
- Loading states with skeletons
- Graceful fallbacks for missing data

## Security Features

- Private report access control
- Email verification for sensitive data
- Access token management
- No client-side data persistence

## Testing Checklist

- [ ] Upload: Valid CSV redirects to list, invalid shows error
- [ ] List: Search, pagination, and sorting work correctly
- [ ] Detail (Public): API call succeeds, data displays
- [ ] Detail (Private): Email dialog opens, verification flow works
- [ ] No localStorage usage anywhere for PR reports
- [ ] URL state preservation on refresh
- [ ] Error handling and loading states
- [ ] Responsive design on mobile/desktop

## Next Steps

1. Implement missing backend routes for access control
2. Add authentication middleware if required
3. Implement real OTP system
4. Add report editing capabilities
5. Implement advanced filtering and analytics
6. Add user management and permissions
7. Implement real-time updates
8. Add data validation and sanitization
