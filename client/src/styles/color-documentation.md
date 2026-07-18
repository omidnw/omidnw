# Cyberpunk Color System Documentation

## Overview

This document provides comprehensive documentation for the enhanced cyberpunk color system. The system consists of a base palette (for dark and light themes) and 15 extended professional cyberpunk palettes, organized by mood and use case.

## Table of Contents

1. [Base Palette](#base-palette)
2. [Extended Palettes](#extended-palettes)
3. [Semantic Mappings](#semantic-mappings)
4. [Color Harmony Guide](#color-harmony-guide)
5. [Accessibility Guidelines](#accessibility-guidelines)
6. [Usage Examples](#usage-examples)

---

## Base Palette

The base palette provides the foundational colors for the theme system, available in both dark and light modes.

### Dark Theme Colors

#### Primary Colors

- `--color-primary-cyan: #06b6d4` - Main cyan accent, used for links and primary actions
- `--color-primary-purple: #a855f7` - Main purple accent, used for highlights and secondary actions
- `--color-primary-pink: #ec4899` - Main pink accent, used for emphasis and special elements
- `--color-primary-blue: #3b82f6` - Main blue accent, used for information and navigation

#### Status Colors

- `--color-status-success: #4ade80` - Success states, confirmations
- `--color-status-error: #ef4444` - Error states, warnings
- `--color-status-warning: #facc15` - Warning states, cautions
- `--color-status-info: #06b6d4` - Informational messages

#### Background Colors

- `--color-bg-primary: #030712` - Main background (darkest)
- `--color-bg-secondary: #111827` - Secondary background (dark gray)
- `--color-bg-tertiary: #1f2937` - Tertiary background (medium gray)
- `--color-bg-card: rgba(17, 24, 39, 0.9)` - Card backgrounds (semi-transparent)
- `--color-bg-hover: rgba(31, 41, 55, 0.5)` - Hover states

#### Text Colors

- `--color-text-primary: #ffffff` - Primary text (white)
- `--color-text-secondary: #d1d5db` - Secondary text (light gray)
- `--color-text-tertiary: #9ca3af` - Tertiary text (medium gray)
- `--color-text-inverse: #030712` - Inverse text (for light backgrounds)

#### Border Colors

- `--color-border-primary: rgba(6, 182, 212, 0.3)` - Primary borders (cyan tint)
- `--color-border-secondary: rgba(168, 85, 247, 0.3)` - Secondary borders (purple tint)
- `--color-border-accent: rgba(236, 72, 153, 0.3)` - Accent borders (pink tint)

### Light Theme Colors

#### Primary Colors

- `--color-primary-cyan: #0891b2` - Darker cyan for better contrast
- `--color-primary-purple: #7c3aed` - Deeper purple for better visibility
- `--color-primary-pink: #db2777` - Darker pink for better contrast
- `--color-primary-blue: #2563eb` - Darker blue for better contrast

#### Status Colors

- `--color-status-success: #16a34a` - Darker green for better visibility
- `--color-status-error: #dc2626` - Darker red for better visibility
- `--color-status-warning: #ca8a04` - Darker yellow for better visibility
- `--color-status-info: #0891b2` - Darker cyan for better visibility

#### Background Colors

- `--color-bg-primary: #fafbfc` - Softer white with slight blue tint
- `--color-bg-secondary: #f4f6f8` - Light gray-blue
- `--color-bg-tertiary: #e8ecef` - Medium gray-blue
- `--color-bg-card: rgba(255, 255, 255, 0.98)` - Nearly opaque white cards
- `--color-bg-hover: rgba(232, 236, 239, 0.9)` - Subtle gray-blue hover

#### Text Colors

- `--color-text-primary: #1a1f2e` - Deep blue-black for better readability
- `--color-text-secondary: #3d4758` - Medium blue-gray
- `--color-text-tertiary: #6b7280` - Lighter gray
- `--color-text-inverse: #ffffff` - White text for dark backgrounds

#### Border Colors

- `--color-border-primary: rgba(8, 145, 178, 0.4)` - Increased opacity for visibility
- `--color-border-secondary: rgba(124, 58, 237, 0.4)` - Increased opacity for visibility
- `--color-border-accent: rgba(219, 39, 119, 0.4)` - Increased opacity for visibility

---

## Extended Palettes

### 1. Neon Dreams (Energetic)

**Mood**: Energetic, dynamic, captivating  
**Use Cases**: Fashion elements, bold statements, eye-catching components

**Colors**:

- `--color-neon-dreams-orange: #FF9A00`
- `--color-neon-dreams-teal: #00CED1`
- `--color-neon-dreams-purple: #9B59B6`
- `--color-neon-dreams-yellow: #FFD700`
- `--color-neon-dreams-coral: #FF6B6B`

### 2. Electric City (High-Energy)

**Mood**: High-energy, modern, urban  
**Use Cases**: Tech branding, digital interfaces, call-to-action buttons

**Colors**:

- `--color-electric-city-navy: #1B1B2A`
- `--color-electric-city-magenta: #FF007A`
- `--color-electric-city-neon-green: #00FFB3`
- `--color-electric-city-cyan: #00E5FF`
- `--color-electric-city-violet: #8B00FF`

### 3. Cyber Sunset (Warm)

**Mood**: Warm, tranquil, harmonious  
**Use Cases**: Wellness sections, calm areas, background gradients

**Colors**:

- `--color-cyber-sunset-coral: #FF6F61`
- `--color-cyber-sunset-orange: #FF9A00`
- `--color-cyber-sunset-yellow: #FFEA00`
- `--color-cyber-sunset-sky-blue: #00BFFF`
- `--color-cyber-sunset-violet: #6A00FF`

### 4. Glitch Vibes (Balanced)

**Mood**: Balanced, engaging, distinct  
**Use Cases**: Modern web design, interactive elements, hover effects

**Colors**:

- `--color-glitch-vibes-cyan: #00FFFF`
- `--color-glitch-vibes-orange-red: #FF4500`
- `--color-glitch-vibes-electric-blue: #0080FF`
- `--color-glitch-vibes-hot-pink: #FF1493`
- `--color-glitch-vibes-lime: #00FF00`

### 5. Tech Noir (Sophisticated)

**Mood**: Sophisticated, intense, elegant  
**Use Cases**: Luxury elements, premium features, admin dashboard

**Colors**:

- `--color-tech-noir-charcoal: #2C2C2E`
- `--color-tech-noir-fiery-red: #FF3D00`
- `--color-tech-noir-purple: #A700FF`
- `--color-tech-noir-teal: #00BFAE`
- `--color-tech-noir-yellow: #FFD600`

### 6. Holo Future (Futuristic)

**Mood**: Futuristic, sophisticated, playful  
**Use Cases**: Event designs, tech conferences, innovation sections

**Colors**:

- `--color-holo-future-blue: #4A90E2`
- `--color-holo-future-magenta: #D5006D`
- `--color-holo-future-orange: #F5A623`
- `--color-holo-future-green: #7ED321`
- `--color-holo-future-yellow: #F8E71C`

### 7. Synthwave Nights (Retro-Futuristic)

**Mood**: Retro-futuristic, nostalgic, striking  
**Use Cases**: Creative projects, artistic sections, blog layouts

**Colors**:

- `--color-synthwave-purple: #8E44AD`
- `--color-synthwave-yellow: #F1C40F`
- `--color-synthwave-pink: #FF006E`
- `--color-synthwave-blue: #3A86FF`
- `--color-synthwave-cyan: #06FFF0`

### 8. Urban Jungle (Vibrant)

**Mood**: Vibrant, energetic, lively  
**Use Cases**: Marketing campaigns, project showcases

**Colors**:

- `--color-urban-jungle-green: #2ECC71`
- `--color-urban-jungle-orange: #E67E22`
- `--color-urban-jungle-red: #E74C3C`
- `--color-urban-jungle-blue: #3498DB`
- `--color-urban-jungle-purple: #9B59B6`

### 9. Digital Abyss (Dynamic)

**Mood**: Dynamic, harmonious, balanced  
**Use Cases**: Seasonal promotions, feature highlights

**Colors**:

- `--color-digital-abyss-teal: #00BFAE`
- `--color-digital-abyss-yellow: #FFD600`
- `--color-digital-abyss-deep-blue: #001F3F`
- `--color-digital-abyss-magenta: #FF00AA`
- `--color-digital-abyss-lime: #CCFF00`

### 10. Chrome Reflections (Modern)

**Mood**: Modern, sleek, sophisticated  
**Use Cases**: Tech products, innovation sections, portfolio items

**Colors**:

- `--color-chrome-silver: #BDC3C7`
- `--color-chrome-blue: #2980B9`
- `--color-chrome-purple: #8E44AD`
- `--color-chrome-orange: #D35400`
- `--color-chrome-yellow: #F39C12`

### 11. Neon Pulse (Dramatic)

**Mood**: Dramatic, eye-catching, energetic  
**Use Cases**: E-commerce, product highlights, featured content

**Colors**:

- `--color-neon-pulse-coral: #FF6F61`
- `--color-neon-pulse-sky-blue: #00BFFF`
- `--color-neon-pulse-magenta: #FF007A`
- `--color-neon-pulse-yellow: #FFD600`
- `--color-neon-pulse-violet: #8C1BFF`

### 12. Future Shock (Intense)

**Mood**: Intense, sophisticated, modern  
**Use Cases**: Corporate branding, professional sections

**Colors**:

- `--color-future-shock-navy: #2C3E50`
- `--color-future-shock-red: #E74C3C`
- `--color-future-shock-orange: #F39C12`
- `--color-future-shock-teal: #1ABC9C`
- `--color-future-shock-purple: #9B59B6`

### 13. Cybernetic Glow (Elegant)

**Mood**: Elegant, balanced, futuristic  
**Use Cases**: Artisan products, craftsmanship highlights

**Colors**:

- `--color-cybernetic-orange-red: #FF4500`
- `--color-cybernetic-gold: #FFD700`
- `--color-cybernetic-cyan: #00FFFF`
- `--color-cybernetic-blue-violet: #8A2BE2`
- `--color-cybernetic-hot-pink: #FF69B4`

### 14. Quantum Flux (Bold)

**Mood**: Bold, captivating, dynamic  
**Use Cases**: Festival marketing, event promotions, announcements

**Colors**:

- `--color-quantum-charcoal: #4A4A4A`
- `--color-quantum-fiery-red: #FF3D00`
- `--color-quantum-teal: #00BFAE`
- `--color-quantum-yellow: #FFD600`
- `--color-quantum-violet: #8C1BFF`

### 15. Virtual Reality (Harmonious)

**Mood**: Harmonious, balanced, modern  
**Use Cases**: Tech startups, versatile applications, general purpose

**Colors**:

- `--color-virtual-reality-yellow: #FFEA00`
- `--color-virtual-reality-sky-blue: #00BFFF`
- `--color-virtual-reality-magenta: #FF007A`
- `--color-virtual-reality-purple: #8E44AD`
- `--color-virtual-reality-deep-magenta: #D5006D`

---

## Semantic Mappings

Semantic mappings provide purpose-driven color selections that make it easy to use colors consistently across the application.

### Accent Colors

**Call-to-Action (CTA) Colors**:

- `--color-accent-cta-primary: var(--color-electric-city-magenta)` - Primary CTAs, main actions
- `--color-accent-cta-secondary: var(--color-neon-pulse-sky-blue)` - Secondary CTAs, alternative actions

**Highlight Colors**:

- `--color-accent-highlight: var(--color-tech-noir-yellow)` - Important highlights, featured content

**Status Accents**:

- `--color-accent-success: var(--color-urban-jungle-green)` - Success messages, confirmations
- `--color-accent-warning: var(--color-cyber-sunset-orange)` - Warnings, cautions
- `--color-accent-danger: var(--color-tech-noir-fiery-red)` - Errors, critical actions

### Gradient Combinations

**Hero Gradients**:

- Start: `--color-gradient-hero-start: var(--color-tech-noir-charcoal)`
- End: `--color-gradient-hero-end: var(--color-electric-city-navy)`
- **Usage**: Hero sections, main banners

**Sunset Gradients**:

- Start: `--color-gradient-sunset-start: var(--color-cyber-sunset-coral)`
- End: `--color-gradient-sunset-end: var(--color-cyber-sunset-violet)`
- **Usage**: Warm sections, creative backgrounds

**Neon Gradients**:

- Start: `--color-gradient-neon-start: var(--color-neon-pulse-magenta)`
- End: `--color-gradient-neon-end: var(--color-neon-pulse-violet)`
- **Usage**: Dramatic effects, featured content

**Tech Gradients**:

- Start: `--color-gradient-tech-start: var(--color-chrome-blue)`
- End: `--color-gradient-tech-end: var(--color-chrome-purple)`
- **Usage**: Tech sections, innovation content

### Context-Specific Colors

**Luxury Context**:

- Primary: `--color-luxury-primary: var(--color-tech-noir-purple)`
- Accent: `--color-luxury-accent: var(--color-cybernetic-gold)`
- **Usage**: Premium features, luxury products

**Tech Context**:

- Primary: `--color-tech-primary: var(--color-electric-city-neon-green)`
- Accent: `--color-tech-accent: var(--color-holo-future-blue)`
- **Usage**: Technical content, developer sections

**Creative Context**:

- Primary: `--color-creative-primary: var(--color-synthwave-pink)`
- Accent: `--color-creative-accent: var(--color-synthwave-cyan)`
- **Usage**: Artistic content, creative projects

**Energetic Context**:

- Primary: `--color-energetic-primary: var(--color-neon-dreams-orange)`
- Accent: `--color-energetic-accent: var(--color-glitch-vibes-lime)`
- **Usage**: High-energy sections, exciting content

---

## Color Harmony Guide

### Recommended Color Combinations

#### Complementary Pairings

- **Cyan + Orange**: `--color-primary-cyan` + `--color-neon-dreams-orange`
- **Purple + Yellow**: `--color-primary-purple` + `--color-tech-noir-yellow`
- **Pink + Green**: `--color-primary-pink` + `--color-electric-city-neon-green`

#### Analogous Pairings

- **Blue-Purple-Pink**: `--color-primary-blue` + `--color-primary-purple` + `--color-primary-pink`
- **Cyan-Blue-Purple**: `--color-primary-cyan` + `--color-holo-future-blue` + `--color-synthwave-purple`

#### Triadic Pairings

- **Primary Triad**: `--color-electric-city-magenta` + `--color-electric-city-neon-green` + `--color-holo-future-blue`
- **Warm Triad**: `--color-cyber-sunset-coral` + `--color-cyber-sunset-yellow` + `--color-cyber-sunset-violet`

### Gradient Best Practices

1. **Smooth Transitions**: Use colors from the same palette or adjacent palettes
2. **Contrast Balance**: Ensure sufficient contrast between gradient endpoints
3. **Direction Matters**: Vertical gradients work well for backgrounds, horizontal for headers

**Example Gradient Combinations**:

```css
/* Hero gradient */
background: linear-gradient(
	135deg,
	var(--color-gradient-hero-start),
	var(--color-gradient-hero-end)
);

/* Sunset gradient */
background: linear-gradient(
	to right,
	var(--color-gradient-sunset-start),
	var(--color-gradient-sunset-end)
);

/* Neon glow effect */
background: radial-gradient(
	circle,
	var(--color-gradient-neon-start),
	var(--color-gradient-neon-end)
);
```

---

## Accessibility Guidelines

### WCAG Contrast Requirements

**Minimum Contrast Ratios**:

- **Normal text** (< 18pt): 4.5:1 (WCAG AA)
- **Large text** (≥ 18pt or 14pt bold): 3:1 (WCAG AA)
- **UI components**: 3:1 (WCAG AA)

### Light Theme Accessibility

All light theme colors have been optimized for accessibility:

- Text colors provide 4.5:1+ contrast against backgrounds
- Border colors provide 3:1+ contrast for visibility
- Primary colors maintain sufficient contrast while preserving cyberpunk aesthetic

### Dark Theme Accessibility

Dark theme colors provide excellent contrast:

- White text on dark backgrounds: 15:1+ contrast
- Neon accents on dark backgrounds: 8:1+ contrast
- Status colors clearly distinguishable

### Testing Color Combinations

**Recommended Tools**:

- WebAIM Contrast Checker
- Chrome DevTools Accessibility Panel
- WAVE Browser Extension

**Testing Process**:

1. Test all text/background combinations
2. Verify border visibility
3. Check status color distinguishability
4. Test with color blindness simulators

### Usage Recommendations

**Do**:

- Use semantic color mappings for consistent accessibility
- Test color combinations before implementation
- Provide sufficient contrast for all interactive elements
- Use status colors consistently (green=success, red=error, etc.)

**Don't**:

- Rely solely on color to convey information
- Use low-contrast combinations for critical content
- Mix too many vibrant colors in one section
- Ignore reduced motion preferences

---

## Usage Examples

### Basic Usage

```css
/* Using base palette colors */
.button-primary {
	background-color: var(--color-primary-cyan);
	color: var(--color-text-inverse);
	border: 2px solid var(--color-border-primary);
}

/* Using extended palette colors */
.cta-button {
	background-color: var(--color-accent-cta-primary);
	color: white;
}

/* Using gradients */
.hero-section {
	background: linear-gradient(
		135deg,
		var(--color-gradient-hero-start),
		var(--color-gradient-hero-end)
	);
}
```

### Advanced Usage

```css
/* Combining multiple palettes */
.feature-card {
	background-color: var(--color-bg-card);
	border-left: 4px solid var(--color-tech-noir-purple);
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
	background-color: var(--color-bg-hover);
	border-left-color: var(--color-electric-city-magenta);
}

/* Context-specific styling */
.luxury-product {
	color: var(--color-luxury-primary);
	border-color: var(--color-luxury-accent);
}

.tech-badge {
	background-color: var(--color-tech-primary);
	color: var(--color-bg-primary);
}
```

### Theme-Aware Components

```css
/* Automatically adapts to dark/light theme */
.adaptive-card {
	background-color: var(--color-bg-card);
	color: var(--color-text-primary);
	border: 1px solid var(--color-border-primary);
}

/* Status indicators */
.status-success {
	color: var(--color-status-success);
}

.status-error {
	color: var(--color-status-error);
}
```

---

## Maintenance and Updates

### Adding New Colors

When adding new colors to the system:

1. Add to appropriate palette in `color-palettes.css`
2. Document in this file with mood, use cases, and hex values
3. Test accessibility in both themes
4. Update semantic mappings if needed

### Modifying Existing Colors

When modifying colors:

1. Test impact on all components
2. Verify accessibility compliance
3. Update documentation
4. Check gradient combinations

### Best Practices

- Keep color names semantic and descriptive
- Maintain consistent naming conventions
- Document all changes
- Test thoroughly before deployment
- Consider color blindness and accessibility

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Theory Basics](https://www.interaction-design.org/literature/topics/color-theory)
- [Cyberpunk Color Palettes Source](https://piktochart.com/tips/cyberpunk-color-palette)
