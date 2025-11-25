# Roadmapper Implementation Plan

## Overview
Build a lightweight, client-side web application for creating simple, visually appealing timelines and roadmaps.

## Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast, modern bundler)
- **Styling**: Tailwind CSS (utility-first, easy theming)
- **Drag & Drop**: @dnd-kit/core (modern, accessible)
- **State Management**: React Context + useReducer (simple, no external deps)
- **Storage**: localStorage API
- **Export**: html2canvas + jsPDF for PNG/PDF export

## Project Structure
```
roadmapper/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── context/
│   │   └── RoadmapContext.tsx    # Global state management
│   ├── hooks/
│   │   ├── useLocalStorage.ts    # Persist/load from localStorage
│   │   └── useRoadmap.ts         # Roadmap operations hook
│   ├── components/
│   │   ├── InputPanel/
│   │   │   ├── InputPanel.tsx    # Container for entry boxes
│   │   │   ├── EntryBox.tsx      # Individual timeline entry form
│   │   │   └── DragHandle.tsx    # Drag handle component
│   │   ├── PreviewPanel/
│   │   │   ├── PreviewPanel.tsx  # Container for preview
│   │   │   ├── Timeline.tsx      # Main timeline renderer
│   │   │   ├── TimelineItem.tsx  # Individual rendered item
│   │   │   └── ExportButton.tsx  # Export/print controls
│   │   ├── StylePanel/
│   │   │   ├── StylePanel.tsx    # Collapsible styling options
│   │   │   ├── ThemeSelector.tsx # Color theme picker
│   │   │   └── LayoutOptions.tsx # Orientation, font, shape
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Select.tsx
│   ├── themes/
│   │   └── index.ts              # Predefined color palettes
│   └── utils/
│       ├── dateParser.ts         # Parse flexible date formats
│       ├── exportUtils.ts        # PNG/PDF export logic
│       └── printStyles.ts        # A4 print stylesheet generator
```

## Implementation Phases

### Phase 1: Project Setup & Core Types
1. Initialize Vite + React + TypeScript project
2. Install dependencies (Tailwind, dnd-kit, html2canvas, jsPDF)
3. Configure Tailwind with custom theme tokens
4. Define TypeScript interfaces:
   - `TimelineEntry` (id, title, description?, date?)
   - `RoadmapConfig` (entries, theme, orientation, fontSize, entryShape)
   - `Theme` (name, colors)

### Phase 2: State Management & Data Layer
1. Create RoadmapContext with useReducer
2. Implement actions: ADD_ENTRY, DELETE_ENTRY, UPDATE_ENTRY, REORDER_ENTRIES, UPDATE_STYLE
3. Build useLocalStorage hook for persistence
4. Build useRoadmap hook wrapping context operations

### Phase 3: Input Panel (FR-01 to FR-05)
1. Build EntryBox component with Title, Description, Date fields
2. Add date format validation and hint/helper
3. Implement Add (+) button functionality
4. Implement Delete (×) button functionality
5. Integrate @dnd-kit for drag-and-drop reordering
6. Ensure real-time state updates

### Phase 4: Preview Panel (FR-06, FR-07)
1. Build Timeline component with horizontal layout (default)
2. Build TimelineItem component
3. Implement conditional rendering (hide empty description/date)
4. Implement responsive auto-scaling using CSS viewport units
5. Add CSS clamp() for text sizing
6. Ensure live preview updates on input change

### Phase 5: Styling Options (FR-08, FR-09)
1. Define 5-6 predefined color themes
2. Build ThemeSelector with visual swatches
3. Build orientation toggle (horizontal/vertical)
4. Build font size selector (small/medium/large)
5. Build entry shape selector (rounded/square/minimal)
6. Apply theme via CSS custom properties

### Phase 6: Export & Print (FR-10)
1. Implement @media print stylesheet for A4
2. Build PNG export using html2canvas
3. Build PDF export using jsPDF
4. Add print button with browser print dialog
5. Test print output at 300dpi

### Phase 7: Save/Load (FR-11)
1. Auto-save to localStorage on every change
2. Add "New Roadmap" button with confirmation
3. Optional: Multiple saved roadmaps with names

### Phase 8: Polish & Accessibility
1. Add keyboard navigation for reordering
2. Add ARIA labels and roles
3. Add focus indicators
4. Test with screen reader
5. Performance optimization (memoization)
6. Cross-browser testing

## Predefined Color Themes
1. **Ocean** - Blues and teals
2. **Sunset** - Oranges and purples
3. **Forest** - Greens and browns
4. **Monochrome** - Grays and blacks
5. **Candy** - Pinks and light blues
6. **Corporate** - Navy and gold

## Date Parsing Logic
```typescript
// Supported formats:
// "2025" → { year: 2025 }
// "March 2025" or "Mar 2025" → { month: 3, year: 2025 }
// "15 March 2025" or "15/03/2025" → { day: 15, month: 3, year: 2025 }
```

## Responsive Scaling Strategy
- Container max-width: 1200px for web
- CSS `clamp()` for responsive font sizes
- Flexbox with `flex-wrap` for horizontal overflow prevention
- `@media print` with fixed A4 dimensions (210mm × 297mm)
- Scale transform for fitting many entries

## Success Criteria Alignment
| Metric | Implementation |
|--------|----------------|
| < 2 min to first roadmap | Minimal UI, clear affordances, pre-filled example |
| Print success > 95% | Dedicated print stylesheet, A4 testing |
| No data loss bugs | Auto-save to localStorage, confirmation on clear |
| 100ms render | React.memo, virtualization if needed |

---

## Future Enhancements (Post-MVP)

### Phase 9: Roadmap Title
- [x] Add `title` field to RoadmapConfig state
- [x] Add editable title input in InputPanel header
- [x] Display title above timeline in PreviewPanel
- [x] Include title in exports (PNG/PDF)

### Phase 10: Multiple Saved Roadmaps
- [x] Change localStorage to store array of roadmaps with IDs and names
- [x] Add roadmap selector dropdown in header
- [x] Add "Save As" functionality to create copies
- [x] Add "Delete Roadmap" with confirmation
- [x] Show last modified date for each saved roadmap

### Phase 11: Undo/Redo
- [x] Implement history stack in context (past/present/future pattern)
- [x] Add UNDO and REDO actions to reducer
- [x] Add Undo/Redo buttons in header
- [x] Support Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
- [x] Limit history to last 50 states to manage memory

### Phase 12: Shareable Link
- [x] Compress roadmap state to JSON
- [x] Encode with base64 or LZ-string compression
- [x] Generate URL with hash fragment (e.g., #share=...)
- [x] Add "Copy Link" button to export menu
- [x] On load, check URL hash and hydrate state if present

### Phase 13: Visual Enhancements
- [ ] **Dark Mode**: Add dark theme option, respect system preference
- [ ] **Entry Colors**: Add optional color picker per entry for categorization
- [ ] **Icons/Emojis**: Add optional emoji selector for each entry
- [ ] **Section Dividers**: Allow grouping entries with labeled dividers

### Phase 14: Export Improvements
- [ ] **SVG Export**: Generate scalable vector output
- [ ] **Copy to Clipboard**: One-click copy as image (using Clipboard API)
- [ ] **Embed Code**: Generate HTML/iframe snippet for websites

### Phase 15: Quality of Life
- [ ] **Duplicate Entry**: Add clone button on each EntryBox
- [ ] **Bulk Import**: Parse CSV or markdown list to create entries
- [ ] **Keyboard Shortcuts**:
  - Ctrl+N: New roadmap
  - Ctrl+E: Export menu
  - Ctrl+P: Print
  - Del: Delete focused entry

---

## Completed Phases

- [x] Phase 1: Project Setup & Core Types
- [x] Phase 2: State Management & Data Layer
- [x] Phase 3: Input Panel
- [x] Phase 4: Preview Panel
- [x] Phase 5: Styling Options
- [x] Phase 6: Export & Print
- [x] Phase 7: Save/Load
- [x] Phase 8: Polish & Accessibility
- [x] Phase 9: Roadmap Title
- [x] Phase 10: Multiple Saved Roadmaps
- [x] Phase 11: Undo/Redo
- [x] Phase 12: Shareable Link
