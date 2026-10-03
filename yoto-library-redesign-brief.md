# Yoto Backup Library UI Redesign Brief

## Project context

This application is a personal audio library and backup system for Yoto cards.

The core use case is:

- Keep a digital backup/archive of children's Yoto card content.
- Browse the collection like a children's library.
- Search and filter stories.
- See useful metadata such as title, author, category and duration.
- Quickly identify whether a card/content item has been backed up.
- Keep the interface primarily useful for parents managing the collection.
- The content itself should still feel appropriate and enjoyable for children.

The existing application already has a useful library structure. Do not rebuild the information architecture unnecessarily. Focus on a visual and UX redesign.

## Current UI

The current UI has:

- Dark/black application background.
- Header with "Yoto Library".
- Library, Add cards and Settings navigation.
- Search field.
- Author filter.
- Category filter.
- Book-cover grid.
- Title and author displayed below each cover.

The current layout and functionality are good foundations. The redesign should retain the library/catalog concept while making the application warmer, lighter and more polished.

## Primary design direction

Use a **Modern Children's Library** aesthetic.

The target feeling is:

> A beautiful physical children's bookshelf translated into a modern web application.

The UI should feel:

- Warm
- Bright
- Calm
- Friendly
- Modern
- Clean
- Parent-friendly
- Slightly playful

Avoid making the application look like:

- A generic SaaS dashboard
- A dark media-management application
- A heavily cartoonish children's game
- An e-commerce store

The book artwork should provide most of the visual colour. The application chrome should remain restrained.

## Important design principle

The users are primarily parents managing a children's audio collection.

Design the interface for parents while keeping the content visually appealing to children.

Do not make every UI element colourful. Use colour selectively.

---

# Colour system

Replace the current dark visual language with a warm light palette.

## Core colours

```css
:root {
  --background: #FFF9F0;
  --surface: #FFFFFF;
  --surface-soft: #FFF3DF;

  --text-primary: #263238;
  --text-secondary: #667078;
  --border: #E8DED0;

  --primary: #F4A340;
  --primary-hover: #E88B24;

  --blue: #8CCFE8;
  --green: #9BCB9A;
  --purple: #B9A7D9;
  --coral: #F29B8F;
  --yellow: #F7D774;
  --peach: #F6C09A;
}
```

## Colour usage

### `#FFF9F0`
Primary application background.

Use this as the main page background instead of black.

### `#FFFFFF`
Primary surface colour.

Use for:

- Book cards
- Search fields
- Dropdowns
- Dialogs
- Interactive surfaces

### `#FFF3DF`
Secondary warm surface.

Use for:

- Highlighted sections
- Empty states
- Secondary panels
- Subtle library sections

### `#263238`
Primary text.

Use for:

- Page headings
- Story titles
- Important labels

### `#667078`
Secondary text.

Use for:

- Author names
- Metadata
- Supporting descriptions

### `#E8DED0`
Borders and dividers.

Keep borders subtle.

### `#F4A340`
Primary action colour.

Use for:

- Primary buttons
- Add card
- Play controls
- Active navigation
- Selected filters
- Important interactive states

Do not use orange everywhere.

### `#E88B24`
Hover/active variation of the primary orange.

### Supporting colours

Use these sparingly for categories, badges and metadata.

- Blue `#8CCFE8`
- Green `#9BCB9A`
- Purple `#B9A7D9`
- Coral `#F29B8F`
- Yellow `#F7D774`
- Peach `#F6C09A`

Do not assign a colour to every card. Let the book artwork remain dominant.

---

# Typography

Recommended:

- Headings: `Nunito`
- Body/UI: `Inter`

Alternative:

- Headings: `Nunito`
- Body/UI: `Nunito Sans`

Use friendly rounded typography for headings.

Keep navigation, metadata and controls clean and highly readable.

Avoid handwriting fonts for application UI.

The book covers already provide enough personality.

---

# Page structure

Keep the existing high-level structure:

```text
Header
  ├── Yoto Library
  ├── Library
  ├── Add cards
  └── Settings

Library
  ├── Search
  ├── Author filter
  ├── Category filter
  └── Book/card grid
```

Improve the presentation rather than replacing this structure.

## Suggested header

Use a light header rather than a dark header.

Example:

```text
Yoto Library                                  8 stories

Library       Add cards       Settings
```

Keep navigation simple.

Avoid excessive borders and heavy shadows.

---

# Library page

Suggested hierarchy:

```text
Your Library

[ Search your stories... ]

[ All stories ] [ Bedtime ] [ Adventure ] [ Animals ] [ Funny ]

Your collection

[ Card ] [ Card ] [ Card ] [ Card ]
[ Card ] [ Card ] [ Card ] [ Card ]
```

The exact labels should use the application's existing data/categories where possible.

Do not invent categories if the existing application already has a category system.

---

# Search

Use a large, clean search field.

Example:

```text
┌───────────────────────────────────────────────────────┐
│  Search your stories...                         🔍    │
└───────────────────────────────────────────────────────┘
```

The search control should:

- Have a white background.
- Have a subtle sand-coloured border.
- Have rounded corners.
- Have a clear focus state using the primary orange.
- Remain easy to use on mobile.
- Retain existing search functionality.

Do not change backend/search behaviour unless required.

---

# Filters

Keep author and category filtering.

Make filters visually lighter.

Possible design:

```text
[ All stories ] [ Bedtime ] [ Adventure ] [ Animals ]
```

For dropdown filters, use white surfaces with subtle borders.

Selected filters should use the primary orange.

Avoid large dark dropdowns.

---

# Book/card design

The existing book covers should remain the visual focus.

Move from the current flat dark-grid presentation toward:

```text
╭────────────────╮
│                │
│                │
│     COVER      │
│                │
│                │
╰────────────────╯

The Gruffalo
Julia Donaldson

● 12 min    Bedtime
```

## Card requirements

- White card/surface.
- Rounded corners.
- Subtle shadow or border.
- Preserve original book cover aspect ratio.
- Do not crop important cover artwork.
- Maintain consistent card dimensions.
- Title should have strong hierarchy.
- Author should use secondary text.
- Metadata should be subtle.

Avoid excessive card decoration.

## Hover interaction

On desktop:

- Slightly raise the card.
- Increase shadow subtly.
- Show a small play action if the item is playable.
- Keep the animation short and subtle.

Do not create large transforms or distracting animations.

## Mobile

The cards must remain touch-friendly.

Avoid hover-only functionality as the only way to access important actions.

---

# Audio-first interaction

Although this looks like a library, the actual content is audio.

Make the audio nature of the application more obvious.

A card could expose:

```text
The Gruffalo
Julia Donaldson

12 min · Bedtime

▶ Play
```

Or use a circular play button over the cover on hover/tap.

The play action should feel like a natural part of the library rather than a separate media player.

---

# Story detail / player

If the application already has a story/player view, visually align it with the new library.

Suggested structure:

```text
┌──────────────────────────────────────────────┐
│                                              │
│               [ BOOK COVER ]                 │
│                                              │
│                 The Gruffalo                 │
│                 Julia Donaldson              │
│                                              │
│              04:32 / 12:18                   │
│              ───────●────────                 │
│                                              │
│                 ◀   ▶   ▶                    │
│                                              │
│              Bedtime · 12 min                │
│                                              │
└──────────────────────────────────────────────┘
```

Keep the player visually simple.

Use the orange primary colour for the main play control.

---

# Backup status

This is important because the application's real purpose is Yoto card backup.

Expose backup status without making the UI feel like an admin dashboard.

Examples:

```text
● Backed up
```

Use:

- Green `#9BCB9A` for backed-up state.

Potential additional states:

```text
○ Not backed up
```

```text
! Needs attention
```

Use muted supporting colours rather than harsh red unless there is a genuine error.

If a library summary is appropriate, consider:

```text
Your Library

8 cards
8 backed up
0 need attention
```

Keep this secondary to the actual library content.

---

# Empty states

Use the warm visual language.

Example:

```text
Your library is empty

Add your first card to start building your backup library.

[ Add card ]
```

Use a simple illustration or subtle supporting colour if desired.

Do not use large cartoon graphics that dominate the page.

---

# Shadows and borders

Keep both subtle.

Recommended approach:

- Prefer soft borders and light shadows.
- Avoid strong black shadows.
- Avoid excessive glassmorphism.
- Avoid heavy gradients.
- Avoid dark containers.

Example:

```css
box-shadow: 0 4px 16px rgba(38, 50, 56, 0.06);
```

Use shadows sparingly.

The page should feel light.

---

# Border radius

Use a consistent rounded system.

Suggested starting points:

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

Use larger radii for:

- Book cards
- Search fields
- Primary controls
- Dialogs

Do not round every tiny element excessively.

---

# Layout

Use generous whitespace.

The existing grid concept is good.

Suggested desktop behaviour:

- 4 to 7 cards depending on viewport width.
- Responsive grid.
- Consistent card width.
- Comfortable horizontal and vertical gaps.

Suggested mobile behaviour:

- 2 columns.
- Large enough covers for easy recognition.
- Touch-friendly controls.

Do not force a fixed number of columns.

Use responsive CSS grid.

---

# Responsive behaviour

The redesign must work at:

- Desktop
- Laptop
- Tablet
- Mobile

Prioritise the library browsing experience.

On mobile:

- Keep the header compact.
- Keep search prominent.
- Move filters into a horizontally scrollable row or filter control.
- Use a two-column card grid.
- Keep titles readable.
- Ensure play actions are touch accessible.

---

# Accessibility

Maintain or improve accessibility.

Requirements:

- WCAG-conscious contrast.
- Keyboard navigation.
- Visible focus states.
- Semantic buttons and links.
- Accessible labels for icon-only controls.
- Do not rely on colour alone for backup status.
- Touch targets should be comfortably sized.
- Respect reduced-motion preferences.

The light palette must still maintain sufficient text contrast.

---

# Icons

Use a consistent icon set.

Lucide Icons would be a good choice if the project already uses an icon library or has no strong existing choice.

Suggested icons:

- Search
- Settings
- Plus
- Play
- Pause
- Filter
- Check
- Alert
- Music/audio
- Book/library

Avoid mixing icon styles.

---

# Animation

Use subtle transitions.

Recommended:

- Card hover: 150-200ms
- Button hover: 150ms
- Filter changes: 150-200ms

Avoid:

- Bouncy UI
- Large scale animations
- Excessive page transitions
- Constant animated decorations

The application should feel polished rather than game-like.

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# Visual hierarchy

Prioritise elements in this order:

1. Book artwork
2. Story title
3. Play/audio action
4. Author
5. Backup status
6. Category/duration metadata
7. Secondary controls

Do not let filters, settings or administrative information dominate the page.

---

# Design language

Use:

- Warm ivory backgrounds
- White surfaces
- Colourful book artwork
- Rounded cards
- Rounded controls
- Friendly typography
- Subtle shadows
- Soft borders
- Small colour accents
- Clean spacing

Avoid:

- Black backgrounds
- Dark grey panels
- Neon colours
- Heavy gradients
- Excessive glassmorphism
- Large cartoon illustrations
- Excessive rounded-pill UI
- Dense dashboard layouts
- Excessive decorative elements

---

# Important implementation guidance

Before changing code:

1. Inspect the existing project structure.
2. Identify the current framework and styling system.
3. Identify existing reusable components.
4. Identify the current routing and library data model.
5. Identify existing search/filter/player functionality.
6. Preserve working functionality.
7. Reuse existing components where sensible.
8. Do not rewrite backend functionality for a visual redesign.
9. Do not introduce a large new dependency unless there is a clear benefit.
10. Keep the redesign maintainable and component-driven.

Do not blindly replace the current implementation.

First understand how the existing application works.

---

# Suggested component structure

If the current architecture supports componentisation, aim toward something similar to:

```text
LibraryPage
├── Header
├── LibraryToolbar
│   ├── SearchInput
│   ├── AuthorFilter
│   └── CategoryFilter
├── LibraryStats
├── StoryGrid
│   └── StoryCard
│       ├── Cover
│       ├── PlayButton
│       ├── Title
│       ├── Author
│       ├── Metadata
│       └── BackupStatus
└── EmptyState
```

Adapt this to the existing architecture rather than forcing a new structure.

---

# Design acceptance criteria

The redesign is successful when:

- The application no longer feels like a dark SaaS/media dashboard.
- The main background is warm and light.
- Book covers remain visually dominant.
- The library remains easy to scan.
- Parents can quickly find stories.
- The audio nature of the content is obvious.
- Backup status is easy to understand.
- The interface feels appropriate for a children's library without becoming childish.
- Existing library/search/filter functionality remains intact.
- The UI works well on desktop and mobile.
- Accessibility remains strong.
- The visual system uses the defined palette consistently.
- The design feels cohesive across Library, Add Cards, Settings and Player views.

---

# Recommended design direction

Use this as the primary direction:

**Modern Children's Library + Audio Library**

Core visual formula:

```text
Warm ivory background
        +
White surfaces
        +
Colourful book covers
        +
Orange primary actions
        +
Soft category colours
        +
Rounded cards
        +
Friendly typography
        +
Subtle audio interactions
        +
Clear backup status
```

The interface should feel like a **personal children's bookshelf with an audio player built into it**.

Do not make the application dark.

Do not overuse colour.

Let the content artwork provide the personality.

---

# Suggested first implementation pass

Implement the redesign in this order:

1. Global colour/theme tokens.
2. Typography.
3. Application background and surfaces.
4. Header/navigation.
5. Search and filters.
6. Story card/grid.
7. Play interaction.
8. Backup status.
9. Empty/loading/error states.
10. Player/detail view.
11. Responsive behaviour.
12. Accessibility and focus states.
13. Final spacing, borders and shadows.

After each stage, verify existing functionality still works.

Do not change data handling or backend behaviour unless the visual redesign requires it.

