# Frontend Implementation: Generate Trust Badge Feature

## Overview

Implement a "Generate Trust Badge" feature that allows users to create embeddable trust badges showcasing selected websites from their PR report.

## UI Components

### 1. Trust Badge Button

- **Location**: View Report page, near the Share Report button
- **Style**: Primary button with badge icon
- **Label**: "Generate Trust Badge"

### 2. Trust Badge Modal

- **Trigger**: Clicking the Generate Trust Badge button
- **Content**: Website selection interface
- **Size**: Medium to large modal (600px+ width)

### 3. Website Selection Interface

- **Layout**: Grid or list of website cards
- **Per Website**:
  - Logo (if available) or fallback icon
  - Website name
  - Checkbox for selection
  - Published URL (if available)

### 4. Selection Controls

- **Counter**: "Selected: X of 6" (minimum 3, maximum 6)
- **Validation**: Disable Save button until 3+ websites selected
- **Clear All**: Button to reset selections

### 5. Badge Preview

- **Live Preview**: Show how the badge will look
- **Responsive Design**: Display on different screen sizes
- **Logo Grid**: Selected websites displayed in a clean grid

### 6. Embed Code Section

- **JavaScript Snippet**: Copyable code block
- **Copy Button**: One-click copy functionality
- **Format**: `<script src="https://example.com/badges/xyz123.js"></script>`

## Component Structure

### Main Components

1. **TrustBadgeButton** - Main trigger button
2. **TrustBadgeModal** - Modal container
3. **WebsiteSelector** - Website selection interface
4. **BadgePreview** - Live preview of the badge
5. **EmbedCodeSection** - Copyable embed code

### State Management

```javascript
const [selectedWebsites, setSelectedWebsites] = useState([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [badgeId, setBadgeId] = useState(null);
```

### Website Selection Logic

```javascript
const handleWebsiteToggle = (website) => {
  if (selectedWebsites.find((w) => w.id === website.id)) {
    setSelectedWebsites(selectedWebsites.filter((w) => w.id !== website.id));
  } else if (selectedWebsites.length < 6) {
    setSelectedWebsites([...selectedWebsites, website]);
  }
};
```

## Styling & Design

### Color Scheme

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Responsive Design

- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid

### Badge Design

- **Layout**: Horizontal logo grid
- **Spacing**: Consistent margins and padding
- **Hover Effects**: Subtle animations on logos
- **Links**: Each logo links to corresponding PR article

## User Experience Flow

1. **Discovery**: User sees "Generate Trust Badge" button
2. **Selection**: User selects 3-6 websites from their report
3. **Preview**: User sees live preview of the badge
4. **Generation**: User clicks Save to generate the badge
5. **Embedding**: User copies the embed code
6. **Usage**: User pastes code into their website

## Technical Implementation

### Modal State Management

```javascript
const openTrustBadgeModal = () => {
  setIsModalOpen(true);
  setSelectedWebsites([]);
};
```

### Website Filtering

```javascript
const availableWebsites = report.outlets.filter(
  (outlet) => outlet.published_url && outlet.website_name
);
```

### Badge Generation

```javascript
const generateBadge = async () => {
  if (selectedWebsites.length < 3) return;

  const response = await fetch("/api/trust-badges", {
    method: "POST",
    body: JSON.stringify({
      websites: selectedWebsites,
      reportId: report.id,
    }),
  });

  const { badgeId } = await response.json();
  setBadgeId(badgeId);
};
```

### Copy to Clipboard

```javascript
const copyEmbedCode = () => {
  const embedCode = `<script src="https://example.com/badges/${badgeId}.js"></script>`;
  navigator.clipboard.writeText(embedCode);
  // Show success toast
};
```

## Error Handling

### Validation Errors

- **Too Few**: "Please select at least 3 websites"
- **Too Many**: "Maximum 6 websites allowed"
- **No Selection**: "Please select websites to continue"

### API Errors

- **Generation Failed**: "Failed to generate badge. Please try again."
- **Network Error**: "Connection error. Please check your internet."

## Accessibility

### ARIA Labels

- **Modal**: `aria-labelledby="trust-badge-modal-title"`
- **Checkboxes**: `aria-label="Select {website name}"`
- **Buttons**: Clear, descriptive labels

### Keyboard Navigation

- **Tab Order**: Logical flow through modal
- **Escape Key**: Closes modal
- **Enter Key**: Activates buttons and checkboxes

## Testing Scenarios

### Selection Validation

- [ ] Can select minimum 3 websites
- [ ] Cannot select more than 6 websites
- [ ] Can deselect websites
- [ ] Clear all button works correctly

### Badge Generation

- [ ] Generates badge with selected websites
- [ ] Shows loading state during generation
- [ ] Displays success message
- [ ] Shows embed code correctly

### User Experience

- [ ] Modal opens and closes smoothly
- [ ] Preview updates in real-time
- [ ] Copy button works correctly
- [ ] Responsive on all screen sizes
