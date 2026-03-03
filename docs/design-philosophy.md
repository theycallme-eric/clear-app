# CLEAR Design Philosophy

> The north star for how CLEAR should look, feel, and behave.
> Consult this when making judgment calls, designing new surfaces, or breaking ties between valid options.
> For concrete implementation rules (tokens, spacing, components), see the UI Rules doc.

---

## The Metaphor

CLEAR is a **low-tech sci-fi operating system for your body.**

Not a social fitness app. Not a gamified coach. Not a companion with personality. It's the interface you sit down at before a mission — it tells you what to do, tracks your execution, logs the debrief, and gets out of the way.

The aesthetic lives in the space where these references overlap:

| Reference | What CLEAR takes from it |
|-----------|------------------------|
| **Star Wars** (original trilogy) | Sparse, confident displays. Green vectors on black. Physical panels with no labels — the system is felt, not read. Information density is low; each screen does one thing. |
| **Alien** (1979) | The MU-TH-UR terminal. Monochrome phosphor on black. Character-by-character text reveal. Maximum contrast. The system is reluctant — it gives you what you need, nothing more. |
| **Blade Runner** (1982) | Amber/blue warmth. Stepped, mechanical zoom. Grid overlays. Equipment that works but isn't new. Voice-command cadence — beeps and clicks, not smooth transitions. |
| **Cyberpunk 2077** | Chamfered/clipped corners (the signature shape). Rajdhani typography. Cyan + red + yellow signal hierarchy. Glitch-on-interact. Scan line textures. Dense data when needed. |
| **Neon Genesis Evangelion** | Angular trapezoidal frames. Traffic-light color logic (green/orange/red). Cascading urgency. The UI reflects system state — calm when idle, tense under load. |

**The unified principle:** These are all emissive interfaces — light on dark, machine-generated displays built for operators, not consumers. They're functional, angular, and alive. They hum.

---

## The Feel

### Composed but alive

At rest, CLEAR is clean and structured. But it's not static — there's a subtle sense that the system is running underneath. A slow pulse on an accent bar. A faint scan line texture. A glow that suggests the display is generating its own light rather than painting pixels.

### Lived-in, not pristine

The system works, but you can feel the machinery. This isn't a showroom demo — it's a tool that's been used. Subtle texture, slight imperfection, atmospheric artifacts. Not broken or glitchy by default, but not sterile either.

### Tense under load

The baseline is calm. But when something demands attention — a timer counting down, a warning state, a critical action — the environment responds. The atmosphere shifts. Scan lines might intensify. Glow might bloom. The system communicates urgency through its environment changing, not just a color swap.

### Never precious about itself

CLEAR doesn't draw attention to its own design. The atmosphere serves the function. If a decorative element competes with usability, the decoration loses. The goal is immersion, not showcase.

---

## Voice

**Terse. Confident. Gym-literate. Trusts the user.**

CLEAR speaks like a knowledgeable training partner who doesn't waste words. It uses real gym language without apology — "hinge," "AMRAP," "time under tension" — because the user speaks this language too.

### Principles

- **Imperative, not inviting.** "Initiate Workout" not "Let's get started!" "Abandon & Start Fresh" not "Give up?"
- **Factual, not motivational.** "Strength training, simplified." not "Your fitness journey starts here!"
- **Abbreviated when possible.** "Int. 7" not "Intensity Level: 7." Labels are stenciled, not sentences.
- **Earned celebration only.** "Nice Work!" — two words, then straight to the debrief. No confetti, no exclamation stacking, no "You're amazing!" The work speaks for itself.
- **No guilt, no pressure.** The abandonment modal asks a factual question with two clear options. The rest day button says "Mark Rest Day" not "Take a break, you deserve it."
- **Real voice in placeholders.** "Bad left shoulder from years ago. Overhead press feels sketchy sometimes." — written like a person talks, not like a form asks.

### The user

Competent but not necessarily expert. Knows their way around a gym, understands the terminology, but appreciates coaching cues being available when they want them. The app doesn't over-explain, but it also doesn't gatekeep. Cues are there — you expand them if you want them.

---

## Color Logic

### Structure vs. Interaction

Color in CLEAR is not decorative — it's a signal system.

- **Theme color** (orange by default) = **structure.** Frames, borders, accent bars, surfaces, labels. The scaffolding of the interface. Things that *are.*
- **Complement color** (blue in orange mode, orange in blue mode) = **interaction.** CTAs, buttons, links, tappable icons. Things that *act.* Anything you can do something with announces itself in the complement.
- **Green** = **selection/confirmation.** Radio buttons, checkmarks, "you chose this." Mode-independent — green means selected in both themes.
- **Red** = **urgency, not danger.** Reserved almost exclusively for low-time timer warnings. Not used for destructive actions or error states in the primary UI.
- **Theme swap** flips structure and interaction roles entirely. It's not a "dark mode" toggle — it's a personality shift of the same system.

### Emissive, not flat

Almost every colored element uses alpha transparency — 10-60% opacity ranges against the dark background. Nothing is a flat, opaque color field. This creates translucent, glassy surfaces — light glowing through frosted panels. Content looks like it's being *emitted*, not *painted*.

### High saturation, limited palette

At any given moment, 2-3 colors maximum are in play. They're high-saturation and high-contrast against the dark background. No pastels, no muted tones. Color is a signal, not decoration.

---

## Motion

### Philosophy: Mechanical, not organic

Motion in CLEAR should feel machine-generated. Stepped, not eased. Linear, not springy. Like a display system cycling through states, not an app trying to feel "smooth."

| Do | Don't |
|----|-------|
| Linear or stepped timing | Bounce, spring, elastic easing |
| Staggered sequential reveals | Everything appearing at once |
| Hard cuts between states (for speed) | Slow crossfades (for "smoothness") |
| Ratcheting, discrete steps | Continuous fluid interpolation |
| Brief mechanical transitions (150-200ms) | Long cinematic transitions (500ms+) |

### The one exception

ChamferedFrame color transitions use a **1-second ease** — this is the single atmospheric, slow animation in the app. When a card's surface shifts (timer green-to-red, selection state change), it *breathes* rather than snaps. This is intentional and should be preserved. It's the heartbeat of the system.

### Reserved for meaning

Nothing animates for decoration. Every motion communicates a state change:
- Data arriving (progressive reveal)
- Section changing (mechanical transition)
- Timer urgency building (environment shift)
- Element becoming interactive (glow/pulse)
- System loading (boot sequence)

If you can't name what state change the animation communicates, it shouldn't animate.

---

## Atmosphere Toolkit

These are the atmospheric elements that make CLEAR feel like a living system rather than a static layout. They should be applied as **seasoning, not the main course** — subtle enough that you'd only notice if they were removed.

### Scan lines
Faint horizontal lines overlaid on surfaces via `repeating-linear-gradient`. Very low opacity. Creates the "this is a display, not a window" feeling. Reference: Alien CRTs, Cyberpunk 2077 panel overlays.

### Glow / bloom
Subtle light emission on key elements — timer displays, the CLEAR logo, streak numbers, active accent bars. Achieved via `box-shadow` or `text-shadow` with theme-colored transparency. Makes elements feel emissive. Reference: Alien phosphor persistence, Eva active-status indicators.

### Grid scaffolding
A very faint grid pattern as a background layer behind content. Not on every surface — just the base layer. Suggests the interface is built on measured, systematic coordinates. Reference: Blade Runner Esper grid overlay, Eva tactical maps.

### Micro-flicker / pulse
Barely perceptible brightness oscillation on structural elements (accent bars, borders). Not enough to register consciously — just enough to make the system feel powered on. Reference: Star Wars indicator lights, Eva nominal-status pulses.

### Progressive reveal
Data and UI elements that materialize in sequence rather than appearing all at once. Numbers that count up. Sections that stagger in. Text that arrives. Mechanical timing — not smooth fades but stepped, deliberate materialization. Reference: Alien character-by-character text, Blade Runner stepped enhancement.

### Urgency escalation
As system state becomes critical (timer low, warning conditions), the atmosphere itself shifts — not just the element in question. Scan line intensity could increase slightly. Glow could intensify. The environment communicates the state, not just the widget. Reference: Eva cascading warnings, CP2077 damage states.

---

## Typography Identity

Three fonts, three jobs. No exceptions.

| Font | Role | Treatment | Feels like |
|------|------|-----------|------------|
| **Rajdhani** | Headings, titles, screen names | Bold, uppercase, wide tracking | HUD display, spec sheet header |
| **Oxanium** | Labels, CTAs, timers, data readouts | Bold, uppercase, widest tracking | Circuit board, digital clock |
| **Space Grotesk** | Body text, descriptions, form content | Medium weight, normal case | Clean instrument panel readout |

- **Bold is the default voice.** Headings and labels are always bold. The app speaks with confidence.
- **Uppercase is structural.** Everything except body paragraph text is uppercase. It's stenciled, not typed.
- **Italics are asides.** Only coaching cues use italic — it marks them as instructional whispers, distinct from the system's voice.

---

## What CLEAR Never Is

- **Bubbly or playful.** No rounded containers, no bounce animations, no friendly blob shapes.
- **Pastel or muted.** Colors are saturated signals on dark backgrounds. No soft tones.
- **Over-animated.** Motion is earned and meaningful. The system doesn't fidget.
- **Patronizing.** No "You can do it!" No guilt trips. No gamification badges.
- **Social.** No sharing, no leaderboards, no profiles visible to others.
- **Decorative for its own sake.** Every visual element serves function or atmosphere. Nothing is there just to look cool.
- **Smooth and slick.** The aesthetic is mechanical and angular, not polished and fluid. Edges, not curves. Steps, not slides.

---

## The Emotional Arc of a Session

1. **Home** — Status report. Calm, composed. The system is at rest but visibly powered on.
2. **Generation** — Configuration. Methodical. Setting parameters before a mission.
3. **Review** — Briefing. Here's what you're about to do. Clear, scannable, no surprises.
4. **Workout** — Execution. Focused tunnel vision. One section at a time. Timer drives the tension.
5. **Summary** — Debrief. Muted acknowledgment. How do you feel? Streak updated. Done.

The app respects your time at every stage. It doesn't pad the experience or stretch moments for emotional effect. Get in, do the work, get out.

---

## References

Visual references can be added to `.claude/inbox/` as screenshots. Pair a CLEAR screen with a reference to communicate "this should feel like that."

Priority reference material:
- Interface closeups from the five core references (Star Wars, Alien, Blade Runner, CP2077, Eva)
- FUI (Fantasy UI) concept art that captures the right zone
- Video clips for animation timing references (YouTube timestamps work)

*This is a living document. Update it as the vision evolves.*
