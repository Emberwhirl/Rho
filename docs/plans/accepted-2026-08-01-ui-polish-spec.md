# UI Polish Spec

Status: accepted
Date: 2026-08-01
Baseline: `0.4.0-dev.0`

## Scope

CSS-only polish pass. The final refinement round before manual acceptance
testing. Focus: micro-interactions, visual feedback, and consistency.

## Requirements

### R1: Toast animation

Add slide-up + fade-in animation for toast notifications. Existing toasts
appear instantly with no transition.

### R2: Dialog/menu transitions

- Dialog scrim: fade in/out (opacity transition)
- Dialog surface: scale(0.95)→scale(1) with fade
- Menu popover: fade in/out via opacity transition (remove instant hidden/visible)

### R3: Custom scrollbar

Add minimal WebKit scrollbar styles matching the Rho palette:
- thumb: `var(--border)` 
- track: transparent
- width: 6px
- subtle hover state

### R4: Button active state

Add `:active` state with slight scale(0.97) and darker background.

### R5: Text selection color

`::selection` with accent-tinted background.

### R6: Smooth focus ring

Add `transition: outline-offset 100ms` for smoother focus appearance.

### R7: Menu hover transitions

Add `transition` to menu-popover buttons for smooth hover.

## Non-Goals

- NO JS changes
- NO layout changes
- NO color palette changes

## Verification

- `node --check desktop/dist/app.js` passes

## Task Decomposition

1. [ ] Toast slide-up animation
2. [ ] Dialog scrim/surface transitions
3. [ ] Menu popover fade transition
4. [ ] Custom scrollbar
5. [ ] Button :active + ::selection + focus ring polish
6. [ ] Commit
