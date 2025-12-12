# INFAKT Design System & Style Guide

This document serves as the single source of truth for the visual language of INFAKT and related future applications. The design philosophy focuses on **trust, clarity, and modern aesthetics**, utilizing a clean glassmorphism approach with vibrant but controlled data visualization colors.

---

## 1. Brand Philosophy
*   **Keywords**: Analytical, Transparent, Futuristic, Clean.
*   **Visual Metaphor**: "The Lens of Truth" – achieved through glass effects, sharp borders, and high-contrast data points against soft backgrounds.

---

## 2. Typography

**Font Family**: `Plus Jakarta Sans`  
**Weights**: 
*   300 (Light) - Captions
*   400 (Regular) - Body text
*   500 (Medium) - Subtitles / UI Elements
*   600 (SemiBold) - Buttons / Highlights
*   700 (Bold) - Headings
*   800 (ExtraBold) - Hero Text / Scores

### Usage Examples (Tailwind)
*   **Hero Heading**: `text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900`
*   **Section Heading**: `text-2xl font-extrabold text-slate-900`
*   **Body Text**: `text-slate-600 text-lg leading-relaxed`
*   **Micro Copy**: `text-xs font-bold text-slate-400 uppercase tracking-widest`

---

## 3. Color Palette

### Primary (Indigo / Trust)
Used for branding, primary actions, and high-confidence metrics.
| Name | Tailwind Class | Hex | Usage |
| :--- | :--- | :--- | :--- |
| Primary 50 | `bg-primary-50` | `#eef2ff` | Background highlights |
| Primary 100 | `bg-primary-100` | `#e0e7ff` | Icons backgrounds, chips |
| Primary 500 | `bg-primary-500` | `#6366f1` | Gradients, focus rings |
| Primary 600 | `bg-primary-600` | `#4f46e5` | Buttons, active states |
| Primary 900 | `text-primary-900` | `#312e81` | Deep branding text |

### Accent (Pink / Energy)
Used sparingly for gradients and ambient background blobs.
| Name | Tailwind Class | Hex | Usage |
| :--- | :--- | :--- | :--- |
| Accent 500 | `text-accent-500` | `#ec4899` | Gradient stops, ambient glows |

### Surface & Neutrals (Slate / Cleanliness)
| Name | Tailwind Class | Hex | Usage |
| :--- | :--- | :--- | :--- |
| Surface 50 | `bg-slate-50` | `#f8fafc` | App Background |
| Border | `border-slate-100` | `#f1f5f9` | Card borders, dividers |
| Border Strong | `border-slate-200` | `#e2e8f0` | Inputs, active borders |
| Text Main | `text-slate-900` | `#0f172a` | Headings |
| Text Muted | `text-slate-600` | `#475569` | Body |
| Text Subtle | `text-slate-400` | `#94a3b8` | Metadata, icons |

### Data Visualization / Semantic Colors
*   **Positive/True**: Emerald (`text-emerald-500`, `bg-emerald-100`)
*   **Warning/Mixed**: Amber/Orange (`text-amber-500`, `bg-orange-100`)
*   **Negative/False/Polarized**: Red (`text-red-500`, `bg-red-100`)
*   **Discourse/Emotion**: Purple (`text-purple-700`, `bg-purple-50`)

---

## 4. UI Components

### Cards & Surfaces
*   **Standard Card**: 
    *   `bg-white`
    *   `rounded-3xl`
    *   `shadow-xl shadow-slate-200/40`
    *   `border border-slate-100`
*   **Glass Panel**: 
    *   `bg-white/80 backdrop-blur-xl`
    *   `border border-white`
    *   `shadow-xl`

### Buttons
*   **Primary Action**:
    *   Gradient: `bg-gradient-to-r from-primary-600 to-primary-500`
    *   Hover: `hover:from-primary-700 hover:to-primary-600`
    *   Shape: `rounded-2xl`
    *   Shadow: `shadow-xl shadow-primary-500/30`
    *   Typography: `font-bold text-white`
    *   Interaction: `active:scale-[0.98] transition-all`

### Inputs
*   **Search/URL Input**:
    *   `bg-slate-50 focus:bg-white`
    *   `border-slate-200`
    *   `rounded-2xl`
    *   `shadow-inner`
    *   Focus State: `focus:ring-4 focus:ring-primary-100 focus:border-primary-500`

### Tooltips
*   **Style**: Dark slate popover with arrow.
*   **Classes**: `bg-slate-800/95 text-slate-100 text-xs rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700`

---

## 5. Effects & Animation

### Shadows
The system uses soft, colored shadows to create depth without harshness.
*   **Glow**: `shadow-primary-500/20` (20% opacity of primary color)
*   **Ambient**: `shadow-slate-200/40` (40% opacity of slate)

### Animations
*   **`animate-fade-in-up`**: Used for dashboard elements entering the screen.
    ```css
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
    ```
*   **`animate-blob`**: Used for the ambient background colors.
    ```css
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
    ```
*   **`animate-gradient-x`**: Used for the hero text.

---

## 6. Layout Principles

1.  **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
2.  **Grid System**: 
    *   Top level: `grid-cols-1 md:grid-cols-3`
    *   Split views: `grid-cols-1 lg:grid-cols-2`
3.  **Spacing**: Generous whitespace.
    *   Section gaps: `gap-8` or `space-y-12`
    *   Internal card padding: `p-6` or `p-8`

---

## 7. Implementation Checklist (New Project)

1.  [ ] Install Tailwind CSS.
2.  [ ] Import `Plus Jakarta Sans` via Google Fonts.
3.  [ ] Configure `tailwind.config.js` with the custom colors (Primary/Surface) and animations defined above.
4.  [ ] Set global body background to `bg-surface-50` (#f8fafc).
5.  [ ] Use `recharts` for data visualization to match the gauge styles.