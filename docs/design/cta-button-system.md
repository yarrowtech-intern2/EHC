# CTA Button System

## Purpose

This document defines the reusable CTA button style currently used across the EHC project and formalizes it into a portable design pattern.

The goal is not only to copy colors and spacing, but to preserve the exact **interaction feeling**:

- soft rounded pill silhouette
- warm, premium primary surface
- light neumorphic depth
- subtle upward lift on hover
- glossy moving highlight that creates the **liquid hover feeling**

This spec is intended for:

- reuse in other parts of this project
- reuse in future projects
- handoff to developers or designers without needing to inspect old JSX

---

## Design Identity

The EHC CTA button style feels:

- warm instead of corporate-cold
- soft instead of sharp
- premium without looking metallic
- responsive without becoming flashy
- tactile, with a light “liquid” sweep instead of a hard shine

The button should feel like a soft surface catching light as the pointer passes over it.

This is the key interaction principle behind the hover.

---

## Core Characteristics

### 1. Shape

- Radius: fully rounded pill for major CTAs
- Height target: `44px` to `52px`
- Horizontal padding target: `20px` to `28px`
- No hard corners for primary call-to-action buttons

### 2. Typography

- Font family: `Onest, sans-serif`
- Weight: `600`
- Size:
  - compact CTA: `14px`
  - default CTA: `14px` to `15px`
- Tracking: normal
- Text should remain stable during hover, with no letter-spacing animation

### 3. Motion

- Hover lift: `translateY(-2px)`
- Hover duration: `180ms` to `220ms`
- Easing: smooth ease-out, not springy
- Liquid sweep duration: about `420ms`
- Active state: button settles back toward `translateY(0)`

### 4. Surface Behavior

- Primary button uses a warm amber gradient, not a flat color
- Secondary button uses a milky white glass surface with a soft border
- Both rely on a moving highlight overlay for the “liquid” feeling

---

## Tokens

These are the practical tokens behind the current EHC CTA direction.

### Base colors

- Page background: `#eeedfa`
- Primary brand blue: `#194898`
- Accent blue: `#5084D9`
- Soft wash: `#9BC0E8`
- Primary CTA top: `#dbb28f`
- Primary CTA bottom: `#d4a17a`
- Primary CTA hover top: `#e0ba99`
- Primary CTA hover bottom: `#cf9a73`
- Primary text on CTA: `#10233f`

### Shadow tokens

#### Primary CTA default

```css
box-shadow:
  0 14px 30px rgba(164, 118, 84, 0.22),
  0 4px 10px rgba(16, 35, 63, 0.08);
```

#### Primary CTA hover

```css
box-shadow:
  0 18px 36px rgba(164, 118, 84, 0.28),
  0 6px 14px rgba(16, 35, 63, 0.1);
```

#### Secondary CTA default

```css
box-shadow:
  0 10px 24px rgba(125, 148, 171, 0.14),
  inset 0 1px 0 rgba(255, 255, 255, 0.48);
```

---

## The Liquid Hover Feeling

This is the part that should not be lost when reusing the design.

### What it is

The liquid feeling is created by a translucent highlight shape that glides diagonally across the button during hover or focus.

It should feel like:

- light moving over a curved surface
- not like a glossy plastic streak
- not like a fast shimmer animation
- not like a neon effect

### What creates it

The effect comes from:

1. a pseudo-element highlight
2. a soft radial-to-transparent gradient
3. diagonal travel across the button
4. low opacity
5. combined with a slight vertical lift

### Behavior rules

- Start with the highlight off-canvas and mostly invisible
- Reveal it only on `:hover` and `:focus-visible`
- Move it across the button in one clean pass
- Do not loop the animation infinitely
- Keep opacity subtle
- The button should still look good with motion reduced

---

## Canonical CSS Recipe

This is the reusable base implementation.

```css
.cta-button {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transform: translateZ(0);
  transition:
    transform 180ms ease,
    box-shadow 220ms ease,
    background-color 220ms ease,
    border-color 220ms ease,
    color 220ms ease;
}

.cta-button::before {
  content: "";
  position: absolute;
  inset: -32% auto auto -18%;
  width: 58%;
  height: 180%;
  border-radius: 999px;
  pointer-events: none;
  background:
    radial-gradient(circle at center,
      rgba(255, 255, 255, 0.34) 0%,
      rgba(255, 255, 255, 0.12) 42%,
      rgba(255, 255, 255, 0) 72%);
  opacity: 0;
  transform: translate3d(-28%, 0, 0) rotate(18deg) scale(0.92);
  transition:
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 260ms ease;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.cta-button:hover::before,
.cta-button:focus-visible::before {
  opacity: 1;
  transform: translate3d(138%, 0, 0) rotate(18deg) scale(1.02);
}

.cta-button:active {
  transform: translateY(0);
}
```

---

## Canonical Variants

### Primary CTA

Use for:

- main hero action
- submit button for high-intent flow
- major conversion action

```css
.cta-button-primary {
  background: linear-gradient(180deg, #dbb28f 0%, #d4a17a 100%);
  color: #10233f;
  box-shadow:
    0 14px 30px rgba(164, 118, 84, 0.22),
    0 4px 10px rgba(16, 35, 63, 0.08);
}
```

### Secondary CTA

Use for:

- alternate action beside primary
- supporting navigation action
- admin action that should feel polished but lower priority

```css
.cta-button-secondary {
  background: rgba(255, 255, 255, 0.76);
  color: #194898;
  border: 1px solid rgba(25, 72, 152, 0.18);
}
```

### Ghost CTA

Use for:

- tertiary action
- soft inline action
- “learn more” style action near stronger CTAs

Ghost should keep the same motion language but with reduced visual weight.

---

## Current EHC Reusable Source

The project now has the reusable CTA base in:

- [globals.css](/e:/s15/Projects/EHC/apps/web/src/app/globals.css)
- [ui-button.tsx](/e:/s15/Projects/EHC/apps/web/src/components/ui-button.tsx)

### Current mapping

- `primary` -> amber premium CTA with liquid hover
- `secondary` -> white elevated CTA with liquid hover
- `ghost` -> tertiary CTA with the same motion language

Use `UIButton` when possible inside this project before writing local button classes.

---

## Usage Inside This Project

### Preferred usage

```tsx
<UIButton>Primary action</UIButton>
<UIButton variant="secondary">Secondary action</UIButton>
<UIButton variant="ghost">Tertiary action</UIButton>
```

### When to use local classes

Use local classes only when:

- the button is inside a very custom landing composition
- spacing needs are unique
- the button is not behaving like a normal UI action

Even then, reuse the same `cta-button` recipe and token values.

---

## Porting To Another Project

To recreate this style elsewhere, move these pieces together:

1. `Onest` font or a similar clean humanist sans
2. the CTA CSS recipe
3. the warm amber gradient
4. the lift + liquid sweep motion
5. the shadow scale

### Minimum portable bundle

- `.cta-button`
- `.cta-button::before`
- `.cta-button-primary`
- `.cta-button-secondary`

If the destination project does not use Tailwind, this button style still ports cleanly as plain CSS.

---

## Motion Guardrails

Do:

- keep hover elegant and brief
- keep the sweep soft
- keep the lift small
- allow keyboard focus to trigger the same highlight behavior

Do not:

- add bouncing
- add infinite shimmer
- add large scale-up on hover
- increase contrast so much that the button looks metallic
- stack too many effects at once

---

## Accessibility Rules

- Keep visible text contrast strong enough against the amber surface
- Preserve `focus-visible` ring
- Ensure hover-only information is never required
- Respect reduced motion preferences
- Use the same CTA style for keyboard interaction, not just mouse hover

---

## Recommended Future Cleanup

Some CTAs in the landing pages still use hand-written class strings instead of the shared `UIButton`.

If you want this to become a true internal library, the next cleanup step is:

1. replace repeated CTA class strings in landing and admin screens with `UIButton`
2. add size tokens such as `sm`, `md`, `lg`
3. add icon-spacing rules
4. optionally extract a dedicated `CTAButton` component for marketing pages

---

## Short Design Summary

If you need to explain this style quickly to another developer or designer:

> “It’s a soft pill CTA with premium amber depth, small upward lift, and a single moving highlight sweep that creates a liquid surface feeling.”

That sentence captures the essence of the system and should remain true even if the implementation is ported to another stack.
