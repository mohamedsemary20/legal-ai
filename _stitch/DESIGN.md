---
name: Modern Heritage
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1b1b'
  on-surface-variant: '#444650'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#757682'
  outline-variant: '#c5c6d2'
  surface-tint: '#435b9f'
  primary: '#00113a'
  on-primary: '#ffffff'
  primary-container: '#002366'
  on-primary-container: '#758dd5'
  inverse-primary: '#b3c5ff'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#141510'
  on-tertiary: '#ffffff'
  tertiary-container: '#292923'
  on-tertiary-container: '#919088'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#00174a'
  on-primary-fixed-variant: '#2a4386'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e5e2da'
  tertiary-fixed-dim: '#c9c6be'
  on-tertiary-fixed: '#1c1c17'
  on-tertiary-fixed-variant: '#474741'
  background: '#fcf9f8'
  on-background: '#1b1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  sidebar-width: 280px
---

## Brand & Style

The design system is built on the philosophy of **Modern Heritage**. It balances the weight of legal authority with the timeless elegance of Egyptian aesthetics. The target audience includes legal professionals and corporate clients who require a tool that feels as established as a physical law firm but as efficient as modern software.

The visual style is **Corporate / Modern** with a bespoke twist. It utilizes expansive whitespace (referencing the clarity of ancient architectural layouts) and precision-engineered geometric patterns. The emotional goal is to evoke trust, wisdom, and "Ma'at"—the ancient Egyptian concept of truth, balance, and order. All UI elements are designed to support a Right-to-Left (RTL) Arabic interface by default, ensuring natural flow for the localized experience.

## Colors

The palette is rooted in historical significance while maintaining high digital accessibility:
- **Lapis Blue (#002366):** The primary color, used for high-importance actions, navigation headers, and authoritative UI elements. It represents the depth of knowledge and the cosmos.
- **Gold (#C5A059):** An accent color used sparingly for active states, highlights, and subtle borders. It provides a premium feel and guides the user's eye to primary calls to action.
- **Parchment (#F5F2E9):** The foundational background color. It is a warm, sophisticated alternative to pure white, reducing eye strain during long drafting sessions and subtly referencing papyrus.
- **Charcoal (#1C1C1C):** The primary ink for typography, ensuring maximum legibility and professional rigor.

Surface levels are achieved by layering light tints of Parchment or semi-transparent Gold overlays to create a sense of structure without relying on heavy shadows.

## Typography

The typography strategy focuses on "Authoritative Versatility." 
- **Manrope** is used for headlines to provide a modern, geometric structural feel that complements the Egyptian visual motifs.
- **Be Vietnam Pro** handles body copy with its friendly yet clean proportions, ensuring that dense legal text remains readable over long periods.
- **IBM Plex Sans** is utilized for labels and metadata to inject a systematic, professional quality into the data-heavy aspects of document management.

For Arabic localization, weights should be adjusted +100 (e.g., Medium becomes Semi-Bold) to maintain visual parity with the Latin counterparts, as Arabic script often appears lighter at the same weight. Line heights are purposefully generous to accommodate the vertical height of Arabic characters.

## Layout & Spacing

This design system uses a **Fluid Grid** model with high-density margins to create a "sanctuary" for text-based work. 
- **Desktop:** 12-column grid with a fixed sidebar for primary navigation. The main content area uses a maximum width of 1440px to prevent line lengths from becoming unreadable.
- **Tablet:** 8-column grid. The sidebar collapses into a drawer.
- **Mobile:** 4-column grid with reduced margins.

Spacing follows an 8px base unit. Generous internal padding (32px+) is used within document "cards" to mimic the margins of a physical legal brief. The layout is mirrored for Arabic (RTL), where the primary navigation resides on the right side of the screen.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** rather than heavy shadows. 
- **Base Layer:** Parchment (#F5F2E9) serves as the desk surface.
- **Mid Layer:** Document cards and chat bubbles use pure white or a very light Lapis tint to sit slightly above the base.
- **Top Layer:** Modals and tooltips utilize a very fine, low-opacity Charcoal shadow (8% opacity, 16px blur) to provide separation without breaking the clean aesthetic.

Low-contrast outlines in Gold (#C5A059) at 20% opacity are used to define interactive zones, creating a "ghost border" effect that feels high-end and precise.

## Shapes

The shape language is **Soft (Level 1)**. 
While ancient Egyptian art is highly geometric and structured, we use subtle rounding (4px - 12px) to ensure the interface feels modern and approachable. 
- **Small Components (Buttons, Chips):** 4px radius (Soft).
- **Medium Components (Input Fields, Chat Bubbles):** 8px radius.
- **Large Components (Cards, Sidebars):** 12px radius.

A specific "Chiseled" accent is applied to primary buttons where one corner (Top-Right in RTL) is slightly more angular, referencing the cut of a reed pen or stone carving.

## Components

### Chat Interface
- **Bubbles:** User messages use a Lapis Blue background with White text. The Assistant (AI) uses a light Gold-tinted background with Charcoal text.
- **Input:** A clean, wide field with a Lapis Blue 'Send' icon. The 'Attach' icon is styled as a stylized lotus clip.

### Document Management
- **Cards:** List items for documents feature a vertical Gold accent line on the leading edge (right side in RTL).
- **Status Chips:** Use desaturated historical tones (Oxide Red for 'Pending', Verdigris Green for 'Signed').

### Contract Drafting
- **Split-Pane:** A "Source vs. Draft" view with a vertical central divider. 
- **Geometric Accents:** Subtle, low-opacity geometric patterns (diamond-mesh or lotus-inspired) appear in the background of empty states to maintain the brand narrative.

### Controls
- **Buttons:** Primary buttons are Lapis Blue with Gold text. Secondary buttons are outlined in Gold with Charcoal text.
- **Checkboxes/Radios:** Custom styled using the "Scales of Justice" symmetry—perfectly square or circular with high-contrast fills.