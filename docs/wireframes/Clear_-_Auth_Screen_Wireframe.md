# Clear - Auth Screen (Wireframe)
**Created:** January 21, 2026  
**Status:** For Implementation  
**Phase:** Frontend Build

---

## Purpose

Entry point for all users. Handles both sign-in (returning users) and sign-up (new users).

**Context:** User launches app. If not authenticated, show this screen. After auth, route to either:
- **New user** → Onboarding Step 1
- **Returning user** → Home Dashboard

---

## Screen 1: Welcome / Entry

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│              CLEAR                  │  ← Logo, large
│                                     │
│       Your workout, generated.      │  ← Tagline
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        SIGN IN               │ │  ← Primary button
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        CREATE ACCOUNT         │ │  ← Secondary button (outline)
│  └───────────────────────────────┘ │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Design Notes:**
- Background: Use gradient image with grain texture (`Mobile_-_grain.png` for mobile, `Desktop_-_grain.png` for desktop) — located in `docs/design/`
- Logo in Rajdhani font, bold, centered
- Tagline in Inter, muted color
- Primary button: filled orange (#F17B14)
- Secondary button: outline only, same orange border

---

## Screen 2A: Sign In

```
┌─────────────────────────────────────┐
│  ←                                  │  ← Back to Welcome
├─────────────────────────────────────┤
│                                     │
│  WELCOME BACK                       │
│                                     │
│  EMAIL                              │
│  ┌─────────────────────────────┐   │
│  │ you@email.com               │   │
│  └─────────────────────────────┘   │
│                                     │
│  PASSWORD                           │
│  ┌─────────────────────────────┐   │
│  │ ••••••••••                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Forgot password?                   │  ← Link, muted
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │          SIGN IN              │ │  ← Primary CTA
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Interactions:**
- Back arrow → Return to Welcome
- Email field → Keyboard appears, email type
- Password field → Secure entry, show/hide toggle
- "Forgot password?" → Trigger password reset flow
- "Sign In" → Authenticate, route to Home Dashboard

**Error States:**
- Invalid email format → "Please enter a valid email"
- Wrong credentials → "Invalid email or password"
- Show errors below respective field, red text

---

## Screen 2B: Create Account

```
┌─────────────────────────────────────┐
│  ←                                  │  ← Back to Welcome
├─────────────────────────────────────┤
│                                     │
│  LET'S GET STARTED                  │
│                                     │
│  EMAIL                              │
│  ┌─────────────────────────────┐   │
│  │ you@email.com               │   │
│  └─────────────────────────────┘   │
│                                     │
│  PASSWORD                           │
│  ┌─────────────────────────────┐   │
│  │ ••••••••••                  │   │
│  └─────────────────────────────┘   │
│  At least 8 characters              │  ← Helper text, muted
│                                     │
│  CONFIRM PASSWORD                   │
│  ┌─────────────────────────────┐   │
│  │ ••••••••••                  │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │       CREATE ACCOUNT          │ │  ← Primary CTA
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Interactions:**
- Back arrow → Return to Welcome
- Email field → Keyboard appears, email type
- Password fields → Secure entry
- "Create Account" → Create user in Supabase Auth, route to Onboarding Step 1

**Validation:**
- Email: Must be valid format
- Password: Minimum 8 characters
- Confirm: Must match password

**Error States:**
- Invalid email → "Please enter a valid email"
- Password too short → "Password must be at least 8 characters"
- Passwords don't match → "Passwords don't match"
- Email already exists → "An account with this email already exists"

---

## Screen 3: Forgot Password

```
┌─────────────────────────────────────┐
│  ←                                  │  ← Back to Sign In
├─────────────────────────────────────┤
│                                     │
│  RESET PASSWORD                     │
│                                     │
│  Enter your email and we'll send    │
│  you a link to reset your password. │
│                                     │
│  EMAIL                              │
│  ┌─────────────────────────────┐   │
│  │ you@email.com               │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │        SEND RESET LINK        │ │  ← Primary CTA
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Success State:**
After sending, show confirmation:
```
│                                     │
│  CHECK YOUR EMAIL                   │
│                                     │
│  We sent a reset link to            │
│  you@email.com                      │
│                                     │
│  Didn't receive it?                 │
│  [Resend]  [Try different email]    │
│                                     │
```

---

## Auth Flow Summary

```
App Launch
    │
    ▼
┌─────────────┐
│ Check Auth  │
└─────────────┘
    │
    ├─── Authenticated ──→ Home Dashboard
    │
    └─── Not Authenticated
            │
            ▼
      ┌───────────┐
      │  Welcome  │
      └───────────┘
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
  Sign In    Create Account
      │           │
      │           ▼
      │      Onboarding (5 steps)
      │           │
      ▼           ▼
   Home Dashboard
```

---

## Design System References

**Colors:**
- Background: Gradient image with grain texture (`docs/design/Mobile_-_grain.png` / `Desktop_-_grain.png`)
- Primary text: #FFFEFB (off-white)
- Muted text: #9CA3AF (gray)
- Primary button: #F17B14 (orange)
- Error text: #EF4444 (red)
- Input background: rgba(31, 31, 31, 0.8) (dark gray, semi-transparent for glassmorphism)
- Input border: #374151 (medium gray)
- Input border focus: #F17B14 (orange)

**Typography:**
- Headers ("WELCOME BACK"): Rajdhani, bold, uppercase
- Labels ("EMAIL"): JetBrains Mono, small, uppercase, muted
- Body text: Inter, regular
- Button text: Rajdhani, bold, uppercase

**Inputs:**
- Height: 48px minimum (touch-friendly)
- Border radius: 4px (slight, not rounded)
- Padding: 12px horizontal

**Buttons:**
- Height: 52px
- Border radius: 4px
- Primary: Filled background, white text
- Secondary: Outline only, orange border, orange text

---

## Implementation Notes for Claude Code

### Supabase Auth Integration

**Sign Up:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
})
```

**Sign In:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})
```

**Password Reset:**
```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail(email)
```

**Check Session:**
```typescript
const { data: { session } } = await supabase.auth.getSession()
```

### Routing Logic

```typescript
// On app load
const session = await supabase.auth.getSession()

if (session) {
  // Check if onboarding completed
  const { data: user } = await supabase
    .from('users')
    .select('onboarding_completed')
    .single()
  
  if (user?.onboarding_completed) {
    navigate('/dashboard')
  } else {
    navigate('/onboarding')
  }
} else {
  navigate('/auth')
}
```

---

*Auth wireframe created: January 21, 2026*
