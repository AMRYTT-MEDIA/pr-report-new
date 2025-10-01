# ESLint Fix Plan - Systematic Approach

## Summary

- **Total Errors**: 177
- **Total Warnings**: 15
- **Strategy**: Fix critical errors first, then warnings

---

## Categories of Errors

### 1. **Unused Variables/Imports** (Most Common - ~80 errors)

**Impact**: Low (won't break functionality)
**Fix**: Remove or prefix with `_` if needed

Files:

- app/api/websites/upload-logo/route.js
- components/auth/\* (multiple files)
- components/NavBar.jsx
- And many more...

### 2. **Missing Radix Parameter** (~10 errors)

**Impact**: Medium (can cause parsing bugs)
**Fix**: Add `, 10` to parseInt calls

Files:

- components/Pagination.jsx
- components/pr-reports-list/PRReportsListClient.jsx
- components/website/WebsiteReOrderDialog.jsx
- components/ui/dialog.jsx

### 3. **React Hook Dependencies** (~20 errors)

**Impact**: High (can cause bugs/infinite loops)
**Fix**: Add missing dependencies or use useCallback/useMemo

Files:

- Multiple components with useEffect/useCallback issues

### 4. **Use Before Define** (~15 errors)

**Impact**: Medium (runtime errors possible)
**Fix**: Move function declarations or use function declarations instead of arrow functions

Files:

- components/ProfileOverlay.jsx
- components/PRReport.jsx
- components/PRReportViewer.jsx
- lib/auth.jsx
- And more...

### 5. **Empty Block Statements** (~8 errors)

**Impact**: Low
**Fix**: Add `// TODO` comment or implement functionality

Files:

- components/NavBar.jsx
- components/Sidebar.jsx
- components/profile/AvatarSelectionPopup.jsx

### 6. **Complexity Warnings** (15 warnings)

**Impact**: Low (code quality)
**Fix**: Refactor later (not breaking)

### 7. **Critical Issues**

- `no-alert` in components/PRReport.jsx
- `no-undef` for `globalThis` in lib/axiosConfig.js
- `no-new` for side effects

---

## Fixing Order (Priority)

1. ✅ Critical issues (alert, globalThis)
2. ✅ Missing radix parameters
3. ✅ React Hook dependencies
4. ✅ Use before define
5. ✅ Unused variables (safe to remove)
6. ✅ Empty blocks
7. ⏭️ Complexity warnings (skip for now)

---

## Status: READY TO FIX

Next: Start with critical issues
