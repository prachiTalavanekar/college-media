# Collapsible Event Details Feature

## Overview
Implemented a collapsible event details section that shows a compact preview by default with a "See More" button to expand the full event card. This improves the feed experience by reducing visual clutter while keeping important information accessible.

## Changes Made

### PostCard Component (`client/src/components/Posts/PostCard.js`)

Added state management and conditional rendering for event details:

```javascript
const [showFullEvent, setShowFullEvent] = useState(false);
```

## Features

### 1. Compact Event Preview (Default State)

Shows essential information in a condensed format:
- Event title (truncated if too long)
- Date in short format (e.g., "Mar 4, 2026")
- Time (if available)
- EVENT badge
- "See More" button

**Layout:**
```
┌─────────────────────────────────────────┐
│  Post Content...                        │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📅  Tech Innovators Workshop      │  │
│  │     Mar 4, 2026 • 13:30   [EVENT]│  │
│  └───────────────────────────────────┘  │
│                                         │
│           See More                      │
└─────────────────────────────────────────┘
```

### 2. Full Event Card (Expanded State)

Shows complete event information:
- Full event title
- Complete date format (e.g., "Wednesday, March 4, 2026")
- Time with label
- Location with icon and label
- Registration button (if link provided)
- "Show Less" button to collapse

**Layout:**
```
┌─────────────────────────────────────────┐
│  Post Content...                        │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Tech Innovators Workshop  [EVENT] │  │
│  │                                   │  │
│  │ 📅 DATE & TIME                    │  │
│  │    Wednesday, March 4, 2026       │  │
│  │    13:30                          │  │
│  │                                   │  │
│  │ 📍 LOCATION                       │  │
│  │    Main Auditorium, Block A       │  │
│  │                                   │  │
│  │    [  Register Now  →  ]          │  │
│  │                                   │  │
│  │         Show Less                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## User Interaction Flow

1. **Initial View**: User sees post content with compact event preview
2. **Click "See More"**: Event card expands to show full details
3. **View Details**: User can see all event information and register
4. **Click "Show Less"**: Event card collapses back to compact view

## Benefits

### 1. Improved Feed Experience
- Less visual clutter in the feed
- Users can quickly scan multiple posts
- Important info still visible at a glance

### 2. Better Content Hierarchy
- Post content remains the primary focus
- Event details are secondary but accessible
- Progressive disclosure pattern

### 3. Mobile-Friendly
- Compact view saves vertical space
- Reduces scrolling on mobile devices
- Easier to navigate through feed

### 4. User Control
- Users decide when to see full details
- Toggle between views as needed
- Smooth transition between states

## Design Details

### Compact Preview
- **Background**: Light purple (purple-50)
- **Border**: Purple border (border-purple-200)
- **Height**: Single row (~60px)
- **Text**: Truncated title, short date format
- **Button**: "See More" in purple text

### Full Card
- **Background**: Gradient purple to pink
- **Border**: 2px purple border
- **Padding**: Generous spacing (p-5)
- **Icons**: Calendar and MapPin with purple backgrounds
- **Button**: Gradient purple-to-pink "Register Now"
- **Collapse**: "Show Less" button at bottom

## Technical Implementation

### State Management
```javascript
const [showFullEvent, setShowFullEvent] = useState(false);
```

### Conditional Rendering
```javascript
{!showFullEvent ? (
  // Compact preview
) : (
  // Full card
)}
```

### Toggle Functions
- `onClick={() => setShowFullEvent(true)}` - Expand
- `onClick={() => setShowFullEvent(false)}` - Collapse

## Accessibility

- Buttons have clear labels ("See More", "Show Less")
- Keyboard accessible (can tab to buttons)
- Screen reader friendly
- Visual feedback on hover

## Responsive Behavior

- Works on all screen sizes
- Compact view especially beneficial on mobile
- Full card adapts to container width
- Text truncation prevents overflow

## Future Enhancements

Potential improvements:
- Add animation for expand/collapse
- Remember user's preference per post
- Add "Quick Register" button in compact view
- Show countdown timer in compact view for upcoming events
- Add calendar icon animation on expand

## Testing Checklist

- [ ] Compact view displays correctly
- [ ] "See More" button expands the card
- [ ] Full details show all event information
- [ ] "Show Less" button collapses the card
- [ ] Registration link works in expanded view
- [ ] Layout works on mobile devices
- [ ] Multiple event posts work independently
- [ ] State persists during scrolling
