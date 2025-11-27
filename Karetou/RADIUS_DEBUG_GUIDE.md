# 📐 Radius Adjustment Guide for Debugging

## Current Setup

- **Default radius**: 1000m (1km)
- **Location**: Line 402 in `Navigate.tsx`
- **State variable**: `circleRadius`

```typescript
const [circleRadius, setCircleRadius] = useState(1000); // Default 1000m
```

---

## How to Adjust for Debugging

### 1. Change Default Radius

**Location**: Line 402 in `Navigate.tsx`

```typescript
// Current default:
const [circleRadius, setCircleRadius] = useState(1000);

// For debugging - change to:
const [circleRadius, setCircleRadius] = useState(500);   // 500m - small area
const [circleRadius, setCircleRadius] = useState(2000);  // 2km - medium area
const [circleRadius, setCircleRadius] = useState(5000);  // 5km - large area
```

### 2. Adjust Min/Max Limits

**Location**: Find the radius control buttons (usually around line 2800-3000)

```typescript
// Minimum radius (when decreasing)
setCircleRadius(r => Math.max(500, r - 100));  // Can't go below 500m

// Maximum radius (when increasing)
setCircleRadius(r => Math.min(2000, r + 100));  // Can't go above 2000m

// To allow wider range:
setCircleRadius(r => Math.max(100, r - 100));   // Min: 100m
setCircleRadius(r => Math.min(10000, r + 100)); // Max: 10km
```

### 3. Change Step Size

**Location**: Same as above (radius control buttons)

```typescript
// Current: changes by 100m per click
setCircleRadius(r => r - 100);  // Decrease
setCircleRadius(r => r + 100);   // Increase

// For finer control (smaller steps):
setCircleRadius(r => r - 50);    // Decrease by 50m
setCircleRadius(r => r + 50);    // Increase by 50m

// For larger steps:
setCircleRadius(r => r - 500);   // Decrease by 500m
setCircleRadius(r => r + 500);    // Increase by 500m
```

---

## Common Debug Values

| Radius | Use Case |
|--------|----------|
| **500m** | Small area - Testing nearby detection sensitivity |
| **1000m** | Default - Normal operation (1km) |
| **2000m** | Medium area - Testing with more businesses (2km) |
| **5000m** | Large area - Testing maximum range (5km) |

---

## Quick Testing Tips

### For Panelists/Debugging:

1. **Quick Change**: Modify line 402 to set a specific default radius
   ```typescript
   const [circleRadius, setCircleRadius] = useState(2000); // Start at 2km
   ```

2. **Real-time Adjustment**: Use the on-screen +/- buttons to adjust during testing
   - The controls are visible on the map screen
   - Click + to increase, - to decrease

3. **Test Different Scenarios**:
   - **Small radius (500m)**: Test if nearby detection works correctly
   - **Large radius (5000m)**: Test if too many businesses are detected
   - **Default (1000m)**: Normal operation

---

## Example: Testing Specific Radius

If panelists ask you to test with a 2km radius:

1. Open `Navigate.tsx`
2. Find line 402
3. Change to:
   ```typescript
   const [circleRadius, setCircleRadius] = useState(2000);
   ```
4. Save and reload the app
5. The map will now show a 2km radius circle by default

---

## Notes

- The radius is measured in **meters**
- The circle is displayed on the map around the user's location
- Businesses within this radius are considered "nearby"
- The radius affects the "nearby businesses" modal trigger

---

## Troubleshooting

**Issue**: Radius controls not visible
- Check if `showRadiusControl` state is set to `true`
- Look for the radius control container in the UI

**Issue**: Radius not updating
- Make sure `setCircleRadius` is being called correctly
- Check if the state is being used in the Circle component

**Issue**: Too many/few businesses detected
- Adjust the default radius value
- Check the nearby business detection logic uses `circleRadius`



