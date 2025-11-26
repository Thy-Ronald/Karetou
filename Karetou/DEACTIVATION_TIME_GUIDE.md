# ⏰ Account Deactivation Time Adjustment Guide

## Current Setup

- **Deactivation Time**: 1 month (30 days)
- **Location**: Admin panel management screens
- **Files**: 
  - `admin-panel/src/pages/AdminManagement.tsx`
  - `admin-panel/src/pages/UserManagement.tsx`
  - `admin-panel/src/pages/SuperAdminDashboard.tsx`

---

## How to Adjust the Deactivation Time

### 1. Admin Management Screen

**Location**: Line 87-95 in `admin-panel/src/pages/AdminManagement.tsx`

```typescript
const needsDeactivation = (admin: AdminUser): boolean => {
  if (!admin.lastLogin) {
    return false;
  }
  const lastLogoutDate = new Date(admin.lastLogin);
  const minutesSinceLogout = (new Date().getTime() - lastLogoutDate.getTime()) / (1000 * 60);
  const oneMonthInMinutes = 30 * 24 * 60; // 30 days * 24 hours * 60 minutes = 43,200 minutes
  return minutesSinceLogout > oneMonthInMinutes;
};
```

### 2. User Management Screen

**Location**: Line 59-67 in `admin-panel/src/pages/UserManagement.tsx`

```typescript
const needsDeactivation = (user: User): boolean => {
  if (!user.lastLogin) {
    return false;
  }
  const lastLogoutDate = new Date(user.lastLogin);
  const minutesSinceLogout = (new Date().getTime() - lastLogoutDate.getTime()) / (1000 * 60);
  const oneMonthInMinutes = 30 * 24 * 60; // 30 days * 24 hours * 60 minutes = 43,200 minutes
  return minutesSinceLogout > oneMonthInMinutes;
};
```

### 3. Super Admin Dashboard

**Location**: Line 167-174 in `admin-panel/src/pages/SuperAdminDashboard.tsx`

```typescript
const needsDeactivation = (lastLogin: string | undefined): boolean => {
  if (!lastLogin) {
    return false;
  }
  const lastLogoutDate = new Date(lastLogin);
  const minutesSinceLogout = (new Date().getTime() - lastLogoutDate.getTime()) / (1000 * 60);
  const oneMonthInMinutes = 30 * 24 * 60; // 30 days * 24 hours * 60 minutes = 43,200 minutes
  return minutesSinceLogout > oneMonthInMinutes;
};
```

---

## Common Time Periods

| Time Period | Minutes | Code |
|-------------|---------|------|
| **1 day** | 1,440 | `1 * 24 * 60` |
| **1 week** | 10,080 | `7 * 24 * 60` |
| **2 weeks** | 20,160 | `14 * 24 * 60` |
| **1 month (30 days)** | 43,200 | `30 * 24 * 60` (current) |
| **2 months (60 days)** | 86,400 | `60 * 24 * 60` |
| **3 months (90 days)** | 129,600 | `90 * 24 * 60` |
| **6 months (180 days)** | 259,200 | `180 * 24 * 60` |
| **1 year (365 days)** | 525,600 | `365 * 24 * 60` |

---

## Step-by-Step: Change to Different Time Period

### Example: Change to 2 Months

1. **Update AdminManagement.tsx** (Line 94):
   ```typescript
   const twoMonthsInMinutes = 60 * 24 * 60; // 60 days
   return minutesSinceLogout > twoMonthsInMinutes;
   ```

2. **Update UserManagement.tsx** (Line 66):
   ```typescript
   const twoMonthsInMinutes = 60 * 24 * 60; // 60 days
   return minutesSinceLogout > twoMonthsInMinutes;
   ```

3. **Update SuperAdminDashboard.tsx** (Line 173):
   ```typescript
   const twoMonthsInMinutes = 60 * 24 * 60; // 60 days
   return minutesSinceLogout > twoMonthsInMinutes;
   ```

### Example: Change to 1 Week

1. **Update all three files**:
   ```typescript
   const oneWeekInMinutes = 7 * 24 * 60; // 7 days
   return minutesSinceLogout > oneWeekInMinutes;
   ```

### Example: Change to 3 Months

1. **Update all three files**:
   ```typescript
   const threeMonthsInMinutes = 90 * 24 * 60; // 90 days
   return minutesSinceLogout > threeMonthsInMinutes;
   ```

---

## Quick Reference: Time Calculations

```typescript
// Minutes calculations:
const oneDay = 1 * 24 * 60;                    // 1,440 minutes
const oneWeek = 7 * 24 * 60;                    // 10,080 minutes
const twoWeeks = 14 * 24 * 60;                  // 20,160 minutes
const oneMonth = 30 * 24 * 60;                  // 43,200 minutes (current)
const twoMonths = 60 * 24 * 60;                 // 86,400 minutes
const threeMonths = 90 * 24 * 60;               // 129,600 minutes
const sixMonths = 180 * 24 * 60;                // 259,200 minutes
const oneYear = 365 * 24 * 60;                  // 525,600 minutes
```

---

## How It Works

1. **`needsDeactivation()` function** checks if an account should be flagged for deactivation
2. It calculates the time since the user's last logout (`lastLogin` field)
3. If the time exceeds the threshold (currently 1 month), it returns `true`
4. Accounts that return `true` are shown in the "needs deactivation" list
5. Super admins can then manually deactivate these accounts

---

## Important Notes

- The `lastLogin` field stores the **logout time** (not login time)
- The function calculates time in **minutes** for precision
- All three files must be updated to maintain consistency
- The deactivation is **suggested** - super admins still need to manually deactivate
- Accounts without `lastLogin` are not flagged (return `false`)

---

## Files Modified

- ✅ `admin-panel/src/pages/AdminManagement.tsx` - Line 94
- ✅ `admin-panel/src/pages/UserManagement.tsx` - Line 66
- ✅ `admin-panel/src/pages/SuperAdminDashboard.tsx` - Line 173

---

## Testing

After changing the deactivation time:

1. **Test with old accounts**: Check if accounts inactive for the new time period are flagged
2. **Test with recent accounts**: Verify active accounts are not flagged
3. **Test edge cases**: Accounts without `lastLogin` should not be flagged
4. **Verify dashboard**: Check SuperAdminDashboard shows correct counts

---

## Troubleshooting

**Issue**: Accounts not showing as needing deactivation
- Check if `lastLogin` field exists in Firestore
- Verify the time calculation is correct
- Check if the threshold value matches in all three files

**Issue**: Too many accounts flagged
- The time period might be too short
- Increase the threshold (e.g., from 1 month to 3 months)

**Issue**: No accounts flagged
- The time period might be too long
- Decrease the threshold (e.g., from 1 month to 1 week)
- Check if `lastLogin` field is being updated on logout

---

## Current Status

✅ **Updated to 1 Month (30 days)**
- Admin Management: ✅ Updated
- User Management: ✅ Updated
- Super Admin Dashboard: ✅ Updated

Accounts will now be flagged for deactivation after **30 days** of inactivity (no logout recorded).

