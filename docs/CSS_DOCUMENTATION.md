# Clockworks Production CSS Documentation (main.css)

**Version:** 4.3.0  
**Author:** Clockworks Production & Gemini  

## Introduction

This document provides a detailed breakdown of the `main.css` stylesheet for the Clockworks Production website. The CSS architecture is designed to be:

*   **Token-Based:** Core design properties (colors, fonts, spacing) are controlled by CSS variables (design tokens) for consistency and easy theming.
*   **Component-Driven:** Styles are organized into reusable components (like cards, navbars, footers).
*   **Theme-Aware:** A robust light/dark theme system is implemented using a `[data-theme]` attribute on the `<html>` element.

---

## Table of Contents

1.  **File Structure**
2.  **Design Tokens (`:root`)**
    *   Light & Dark Themes
    *   Font System
3.  **Base & Typography**
    *   Global Styles
    *   Headings & Text
4.  **Components**
    *   Navbar (`.nav`)
    *   Sidebar (`#mySidebar`)
    *   Cards (`.w3-card`)
    *   Footer (`.footer`)
    *   Theme Toggle (`.switch`)
5.  **Animations & Effects**
6.  **Google Translate Theming**

---

## 1. File Structure

The CSS is organized into logical sections for readability and maintainability.

| Section | Purpose                                                                                             |
| :------ | :-------------------------------------------------------------------------------------------------- |
| **1. Imports**          | Imports external stylesheets: FontAwesome for icons and the base W3.CSS framework.                  |
| **2. Design Tokens**    | Defines all CSS variables for colors, fonts, shadows, etc., for both Light and Dark themes.       |
| **3. Base & Typography**| Sets global styles for `html`, `body`, and defines the default typographic scale (`h1`-`h6`, `p`).   |
| **4. Components**       | Contains styles for reusable UI elements like the navbar, cards, and footer.                      |
| **5. Animations**       | Includes keyframe animations for background effects.                                                |
| **6. Google Translate** | Provides custom styling to override the default appearance of the Google Translate widget.        |

---

## 2. Design Tokens (CSS Variables)

All theme-related values are stored as CSS variables under the `:root` selector for the default **Light Theme (Industrial)**. The `[data-theme="dark"]` selector overrides these variables for the **Dark Theme (Arcane)**.

### Core Palette & Shadow Tokens

*   `--cw-bg`, `--cw-bg-alt`: Background colors.
*   `--cw-surface`, `--cw-surface-alt`: Colors for component surfaces like cards and navbars.
*   `--cw-text`, `--cw-text-dim`: Text colors.
*   `--cw-accent`, `--cw-accent-alt`: Primary and secondary accent colors (links, borders).
*   `--cw-radius`: The standard border-radius for components.
*   `--cw-shadow-1`, `--cw-shadow-2`: Standard box-shadow values.

### Font System Tokens

The stylesheet defines a complete, theme-aware font system. Different fonts are assigned for headings, paragraphs, and components, and these assignments change between the light and dark themes.

*   `--font-h1` to `--font-h6`: Font families for global headings.
*   `--font-p`: The primary font for body text.
*   `--font-card-h1` to `--font-card-p`: Component-specific font overrides for cards.
*   `--font-nav`, `--font-footer`: Component-specific fonts for navigation and the footer.

---

## 3. Base & Typography

*   **`html`, `*`:** Establishes `box-sizing: border-box` for predictable layout and sets base font size and line height.
*   **`body`:** Sets the base background and text color using design tokens.
*   **`h1`-`h6`, `.w3-h1`-`.w3-h6`:** Applies the font family, weight, and size for each heading level from the design tokens.
*   **`a`:** Styles links with the accent color.

---

## 4. Components

### Navbar (`.nav`)

*   **.nav:** The main header container. Sets font, background, border, and shadow.
*   **.nav .w3-bar:** A specific override to fix a W3.CSS issue where the dropdown menu was being cut off. **It is set to `overflow: visible !important;` to ensure functionality.**
*   **.w3-dropdown-content:** Has its `z-index` set to `99 !important;` to ensure the dropdown menu appears above all other page content.

### Sidebar (`#mySidebar`)

*   **#mySidebar:** The mobile navigation menu. Sets background, border, and shadow.

### Cards (`.w3-card`, `.w3-card-4`)

*   **.w3-card, .w3-card-4:** Overrides the default W3.CSS card style to use our theme's background color, shadow, radius, and border. Includes a hover effect.
*   **.w3-card h1-h6, p:** Applies the custom card-specific fonts defined in the design tokens.

### Footer (`.footer`)

*   **.footer:** Styles the site footer with the appropriate font, background, border, and padding.

### Theme Toggle (`.switch`)

*   **.switch:** The container for the theme toggle slider.
*   **.slider:** The visual part of the toggle.
*   **.slider:before:** The circular knob of the slider.
*   **input:checked + .slider:** Handles the state change for the dark theme.

---

## 5. Animations & Effects

*   **`body::before`:** A pseudo-element used to create the animated particle background. It is fixed to the viewport and sits behind all content (`z-index: -1`).
*   **`@keyframes`:**
    *   `darkParticleParallax` / `lightParticleParallax`: Creates a subtle, slow-moving parallax effect for the background.
    *   `glowDark` / `glowLight`: Creates a gentle pulsing glow effect.

---

## 6. Google Translate Theming

This section completely overrides the default, un-themed Google Translate widget to match the site's aesthetic.

*   **.goog-te-banner-frame:** Hides the intrusive "Original text" banner that Google injects at the top of the page.
*   **body:** The `top: 0 !important;` rule prevents the page from shifting down when the banner is hidden.
*   **.goog-te-gadget-simple:** The main widget container. We make it transparent and remove its borders.
*   **.VIpgJd-ZVi9od-l4eHX-hSRGPd:** This is the obscure class name Google uses for its logo within the widget. We set it to `display: none !important;`.
*   **.goog-te-combo:** The dropdown `<select>` element itself. We apply our theme's navigation font and text color.
*   **.goog-te-gadget-simple::before:** A pseudo-element that adds a FontAwesome "language" icon (`\f1ab`) before the dropdown text.
*   **.goog-te-gadget-simple::after:** A pseudo-element that adds a custom dropdown arrow (`▾`) to match the site's other dropdowns.
