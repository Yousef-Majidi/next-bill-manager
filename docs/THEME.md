# Theme Configuration Guide

## Theme Location

The theme colors are defined in **`src/app/globals.css`** using CSS custom properties (CSS variables) in the `:root` selector.

## Color System

The app uses **OKLCH color space** for better color consistency and perceptual uniformity. The format is:

```css
oklch(lightness chroma hue)
```

### Current Theme (Dark - Neutral Gray)

The default theme is a **neutral dark theme** with minimal color saturation:

- **Background**: `oklch(0.12 0.01 0)` - Very dark gray/charcoal
- **Foreground**: `oklch(0.98 0.005 0)` - Almost white text
- **Card**: `oklch(0.18 0.01 0)` - Slightly lighter dark gray
- **Primary**: `oklch(0.75 0.08 180)` - Teal/cyan accent (hue 180)
- **Muted**: `oklch(0.25 0.01 0)` - Medium gray
- **Border**: `oklch(1 0 0 / 12%)` - Semi-transparent white

## Theme Variables

All theme colors are available as CSS variables:

- `--background` - Main background color
- `--foreground` - Main text color
- `--card` - Card background
- `--card-foreground` - Card text
- `--primary` - Primary accent color
- `--primary-foreground` - Text on primary
- `--secondary` - Secondary color
- `--muted` - Muted background
- `--muted-foreground` - Muted text
- `--accent` - Accent color
- `--accent-foreground` - Accent text
- `--destructive` - Error/destructive color
- `--border` - Border color
- `--input` - Input background
- `--ring` - Focus ring color

## Changing the Theme

### Option 1: Modify Existing Theme

Edit the `:root` selector in `src/app/globals.css`:

```css
:root {
	--primary: oklch(0.75 0.08 180); /* Change hue (180) to change color */
	/* 0 = red, 60 = yellow, 120 = green, 180 = cyan, 240 = blue, 300 = magenta */
}
```

**Hue Guide:**

- `0-30`: Red/Orange
- `60-90`: Yellow/Green
- `120-150`: Green/Cyan
- `180-210`: Cyan/Blue
- `240-270`: Blue/Purple
- `300-330`: Magenta/Pink

### Option 2: Use a Different Color Scheme

**Warm Dark Theme:**

```css
--background: oklch(0.12 0.02 30);
--primary: oklch(0.7 0.12 45);
```

**Cool Dark Theme:**

```css
--background: oklch(0.12 0.01 240);
--primary: oklch(0.75 0.1 200);
```

**Neutral Dark (Current):**

```css
--background: oklch(0.12 0.01 0);
--primary: oklch(0.75 0.08 180);
```

## Using Theme Colors in Components

**Always use theme variables instead of hardcoded colors:**

✅ **Good:**

```tsx
<div className="bg-card text-card-foreground">
<div className="text-primary">
<div className="border-border">
```

❌ **Bad:**

```tsx
<div className="bg-blue-600 text-white">
<div className="text-gray-900">
<div className="border-gray-200">
```

## Available Tailwind Classes

The theme variables are mapped to Tailwind classes:

- `bg-background`, `text-foreground`
- `bg-card`, `text-card-foreground`
- `bg-primary`, `text-primary-foreground`
- `bg-secondary`, `text-secondary-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-accent`, `text-accent-foreground`
- `bg-destructive`
- `border-border`
- `bg-input`

## Light Theme

The light theme is available under the `.light` class. To switch themes, modify `src/app/layout.tsx`:

```tsx
<ThemeProvider defaultTheme="light" ...>
```

Or change the `defaultTheme` prop in the ThemeProvider component.
