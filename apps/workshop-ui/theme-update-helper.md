# REFORGE Professional Theme Update Helper

## Common Pattern Replacements

### Background Colors
- `bg-white` → `backgroundColor: 'var(--surface-secondary)'`
- `bg-gray-800` → `backgroundColor: 'var(--surface-primary)'` or `'var(--surface-secondary)'`
- `bg-gray-700` → `backgroundColor: 'var(--surface-tertiary)'`
- `bg-gray-50` → `backgroundColor: 'var(--surface-tertiary)'`
- `bg-blue-50`, `bg-yellow-50`, `bg-red-50` → Use state colors with opacity: `backgroundColor: 'var(--state-*)', opacity: 0.1`

### Text Colors
- `text-gray-400` → `color: 'var(--ink-muted)'`
- `text-gray-600` → `color: 'var(--ink-secondary)'`
- `text-gray-500` → `color: 'var(--ink-muted)'`
- `text-gray-700` → `color: 'var(--ink-secondary)'`
- `text-gray-800`, `text-gray-900` → `color: 'var(--ink-primary)'`

### Border Colors
- `border-gray-700`, `border-gray-600`, `border-gray-200` → `borderColor: 'var(--border-primary)'`
- `border-yellow-200`, `border-blue-200`, `border-red-200` → Use state colors with opacity

### Buttons
- `bg-blue-600` → `backgroundColor: 'var(--accent-gold)'`
- `hover:bg-blue-700` → `onMouseEnter` with `var(--accent-gold-light)`
- Add `boxShadow: 'var(--glow-gold)'`
- Add `color: 'var(--ink-inverse)'`

### Headers
- Headers use `color: 'var(--accent-gold)'`
- Subheaders use `color: 'var(--ink-primary)'`

### Hover States
- Replace `hover:bg-gray-50` with `onMouseEnter`/`onMouseLeave` handlers using `var(--surface-tertiary)` or `var(--surface-elevated)`
