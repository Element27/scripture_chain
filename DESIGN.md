# Design System — Scripture Chain

## Typography

- **Scripture Display**: Lora (serif) — elegant, reverent, feels like scripture
- **UI Text**: DM Sans (sans-serif) — clean, warm, readable

## Color Palette

```css
--bg-deep: #1a0f0a;       /* Deep dark warm brown — primary background */
--bg-surface: #261610;   /* Cards and surfaces */
--bg-elevated: #331d13;  /* Elevated surfaces */
--gold: #c9933a;         /* Primary accent — gold */
--gold-light: #e8b86d;   /* Light gold — text accents */
--cream: #f5e6c8;        /* Primary text on dark */
--cream-muted: #c4a882;  /* Secondary text */
--vine: #4a7c59;         /* Vine green — connecting elements */
--ember: #8b2635;        /* Deep red — for emphasis */
```

## Motion

- `fadeUp`: Opacity 0→1, translateY 16px→0 (page load)
- `bloom`: scale 0.95→1 with fade (scripture reveal)
- `pulseGlow`: Subtle pulse on current node
- `bounceIn`: Small bounce on reaction tap

## Icons

Minimal usage — small cross motif, vine/branch patterns as subtle backgrounds.

## Scripture Card Design

- Large opening quotation mark (decorative, gold)
- Scripture text in Lora, generous size (1.25rem minimum)
- Reference (Book Chapter:Verse) in DM Sans, small caps, gold-light
- Subtle warm glow or border — never a harsh box

## Chain View Design

- Cards connected by thin gold vertical line with small cross/dot connector
- Root node has seed/leaf icon
- Current node has subtle pulse glow
- Depth number shown subtly on each card

## Aesthetics

Sacred warmth — illuminated manuscript meets modern mobile app. Not church-bulletin stiff. Feels alive, warm, and reverent — like holding something precious.