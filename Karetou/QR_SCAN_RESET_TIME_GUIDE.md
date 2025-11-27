# ⏰ QR Scanner Reward Points Reset Time Adjustment Guide

## Current Setup

- **Reset Time**: 24 hours
- **Location**: `services/PointsService.ts`
- **Function**: `isWithinLast24Hours()` and `resetDailyScans()`

---

## How to Adjust the Reset Time

### 1. Change the Time Check Function

**Location**: Line 43-47 in `PointsService.ts`

```typescript
// Current: 24 hours
private isWithinLast24Hours(scanTimestamp: string): boolean {
  const scanTime = new Date(scanTimestamp).getTime();
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
  return scanTime > twentyFourHoursAgo;
}

// To change to different time periods:
// 1 hour: Date.now() - (1 * 60 * 60 * 1000)
// 12 hours: Date.now() - (12 * 60 * 60 * 1000)
// 24 hours: Date.now() - (24 * 60 * 60 * 1000) (current)
// 48 hours: Date.now() - (48 * 60 * 60 * 1000)
// 1 week: Date.now() - (7 * 24 * 60 * 60 * 1000)
```

### 2. Update the Reset Function

**Location**: Line 50-58 in `PointsService.ts`

```typescript
// Current: 24 hours
private async resetDailyScans(userId: string, userPoints: UserPoints): Promise<UserPoints> {
  const now = this.getCurrentTimestamp();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000); // 24 hours ago
  
  // Filter out scans older than 24 hours
  const recentScans = userPoints.scanHistory.filter(scan => {
    const scanTime = new Date(scan.scannedAt).getTime();
    return scanTime > twentyFourHoursAgo;
  });
  // ... rest of function
}

// To change, update the time calculation:
// 1 hour: now - (1 * 60 * 60 * 1000)
// 12 hours: now - (12 * 60 * 60 * 1000)
// 24 hours: now - (24 * 60 * 60 * 1000) (current)
// 48 hours: now - (48 * 60 * 60 * 1000)
```

### 3. Update the User Message

**Location**: Line 164-171 in `PointsService.ts`

```typescript
// Current message:
message: 'You have already scanned this business today. You can scan again in 24 hours!',

// Update to match your reset time:
// 1 hour: 'You have already scanned this business recently. Wait 1 hour to scan again!'
// 12 hours: 'You have already scanned this business today. You can scan again in 12 hours!'
// 24 hours: 'You have already scanned this business today. You can scan again in 24 hours!' (current)
// 48 hours: 'You have already scanned this business. You can scan again in 48 hours!'
```

### 4. Update Function Name (Optional but Recommended)

**Location**: Line 117 in `PointsService.ts`

```typescript
// Current function name:
async hasScannedToday(userId: string, businessId: string): Promise<boolean>

// If changing to different time, consider renaming:
// hasScannedInLastHour()
// hasScannedInLast12Hours()
// hasScannedInLast24Hours()
// hasScannedInLast48Hours()
```

---

## Common Time Periods

| Time Period | Milliseconds | Code |
|-------------|--------------|------|
| **1 minute** | 60,000 | `60 * 1000` |
| **1 hour** | 3,600,000 | `1 * 60 * 60 * 1000` |
| **12 hours** | 43,200,000 | `12 * 60 * 60 * 1000` |
| **24 hours** | 86,400,000 | `24 * 60 * 60 * 1000` (current) |
| **48 hours** | 172,800,000 | `48 * 60 * 60 * 1000` |
| **1 week** | 604,800,000 | `7 * 24 * 60 * 60 * 1000` |

---

## Step-by-Step: Change to 24 Hours (Already Done)

✅ **Completed Changes:**

1. ✅ Changed `isWithinLastMinute()` → `isWithinLast24Hours()`
2. ✅ Updated time calculation from `60 * 1000` → `24 * 60 * 60 * 1000`
3. ✅ Updated `resetDailyScans()` to filter 24-hour scans
4. ✅ Updated user message to reflect 24-hour reset
5. ✅ Updated comments to remove "1-minute testing" references

---

## Example: Change to 12 Hours

If you want to change to 12 hours instead:

### Step 1: Update `isWithinLast24Hours()` function
```typescript
private isWithinLast12Hours(scanTimestamp: string): boolean {
  const scanTime = new Date(scanTimestamp).getTime();
  const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000); // 12 hours
  return scanTime > twelveHoursAgo;
}
```

### Step 2: Update `resetDailyScans()` function
```typescript
const twelveHoursAgo = now - (12 * 60 * 60 * 1000); // 12 hours ago
// Filter out scans older than 12 hours
const recentScans = userPoints.scanHistory.filter(scan => {
  const scanTime = new Date(scan.scannedAt).getTime();
  return scanTime > twelveHoursAgo;
});
```

### Step 3: Update `hasScannedToday()` function
```typescript
return userPoints.scanHistory.some(scan => {
  return scan.businessId === businessId && this.isWithinLast12Hours(scan.scannedAt);
});
```

### Step 4: Update user message
```typescript
message: 'You have already scanned this business today. You can scan again in 12 hours!',
```

---

## Example: Change to 1 Hour (For Testing)

If you want to test with 1 hour:

### Step 1: Update function
```typescript
private isWithinLastHour(scanTimestamp: string): boolean {
  const scanTime = new Date(scanTimestamp).getTime();
  const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000); // 1 hour
  return scanTime > oneHourAgo;
}
```

### Step 2: Update reset function
```typescript
const oneHourAgo = now - (1 * 60 * 60 * 1000); // 1 hour ago
```

### Step 3: Update message
```typescript
message: 'You have already scanned this business recently. Wait 1 hour to scan again!',
```

---

## Quick Reference: Time Calculations

```typescript
// Milliseconds calculations:
const oneMinute = 60 * 1000;                    // 60,000 ms
const oneHour = 1 * 60 * 60 * 1000;            // 3,600,000 ms
const twelveHours = 12 * 60 * 60 * 1000;      // 43,200,000 ms
const twentyFourHours = 24 * 60 * 60 * 1000;   // 86,400,000 ms (current)
const fortyEightHours = 48 * 60 * 60 * 1000;  // 172,800,000 ms
const oneWeek = 7 * 24 * 60 * 60 * 1000;      // 604,800,000 ms
```

---

## Files Modified

- ✅ `services/PointsService.ts` - Main points service file
  - Line 43-47: `isWithinLast24Hours()` function
  - Line 50-76: `resetDailyScans()` function
  - Line 117-128: `hasScannedToday()` function
  - Line 164-171: User message in `awardPointsForScan()`

---

## Testing

After changing the reset time:

1. **Test the reset**: Scan a QR code, wait for the reset period, then scan again
2. **Check the message**: Verify the user message matches the new reset time
3. **Verify points**: Ensure points are only awarded once per reset period
4. **Check history**: Verify old scans are removed after the reset period

---

## Notes

- The reset time is measured in **milliseconds**
- The system checks if a scan is within the reset period before awarding points
- Old scans are automatically cleaned up when they exceed the reset period
- The reset period applies **per business** (users can scan different businesses immediately)

---

## Troubleshooting

**Issue**: Points not resetting after 24 hours
- Check if the time calculation is correct
- Verify the function names match (e.g., `isWithinLast24Hours`)
- Check if `resetDailyScans()` is being called

**Issue**: Users can scan multiple times immediately
- Verify `hasScannedToday()` is checking the correct time period
- Check if the scan history is being properly stored

**Issue**: Message doesn't match reset time
- Update the message in `awardPointsForScan()` function
- Ensure the message clearly states when they can scan again


