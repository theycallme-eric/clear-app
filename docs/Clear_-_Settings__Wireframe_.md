# Clear - Settings (Wireframe)
**Created:** December 22, 2025  
**Status:** Locked for MVP  
**Phase:** 2E Complete

---

## Purpose

Manage app preferences and workout configuration. Reuses UI patterns from onboarding for consistency.

**Context:** User wants to change their gym setup, adjust workout structure, or update limitations.

---

## Settings Hub Screen

```
┌─────────────────────────────────────┐
│  ← SETTINGS                         │
├─────────────────────────────────────┤
│                                     │
│  WORKOUT SETUP                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Locations / Equipment      ▶  │ │
│  │ Building Gym                  │ │  ← Current default
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Experience Level           ▶  │ │
│  │ Confident                     │ │  ← Current selection
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Workout Structure          ▶  │ │
│  │ Balanced • 6 sections         │ │  ← Current preset
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Limitations                ▶  │ │
│  │ "Bad left shoulder..."        │ │  ← Preview of text
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ABOUT                              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Send Feedback              ▶  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ About Clear                ▶  │ │
│  │ Version 1.0.0                 │ │
│  └───────────────────────────────┘ │
│                                     │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Sub-Screens

Each settings row opens a dedicated screen. All reuse UI patterns from onboarding.

---

### Locations / Equipment

```
┌─────────────────────────────────────┐
│  ← LOCATIONS                        │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ● Building Gym            [✎] │ │  ← Default (radio)
│  │   Barbell, Dumbbells, Rack,   │ │
│  │   Cables, Bench               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ○ Home                    [✎] │ │  ← Other location
│  │   Dumbbells, Bands, Mat       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         + Add Location        │ │  ← Opens equipment setup
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Interactions:**
- Tap radio (●/○) → Sets default location for workout generation
- Tap [✎] → Edit that location's equipment (same UI as onboarding Step 1)
- "+ Add Location" → New location setup flow (tier select + equipment toggles)

---

### Edit Location (Sub-screen of Locations)

```
┌─────────────────────────────────────┐
│  ← EDIT LOCATION                    │
├─────────────────────────────────────┤
│                                     │
│  LOCATION NAME                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Building Gym                  │ │  ← Editable text
│  └───────────────────────────────┘ │
│                                     │
│  EQUIPMENT TYPE                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○  MINIMAL                  │   │
│  ├─────────────────────────────┤   │
│  │ ○  HOME GYM                 │   │
│  ├─────────────────────────────┤   │
│  │ ●  BUILDING GYM             │   │  ← Selected
│  ├─────────────────────────────┤   │
│  │ ○  FULL GYM                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ CUSTOMIZE EQUIPMENT      ▼  │   │
│  │                             │   │
│  │ ┌─────┐┌─────┐┌─────┐┌─────┐│   │
│  │ │✓Barb││✓Dumb││✓Rack││✓Cabl││   │
│  │ └─────┘└─────┘└─────┘└─────┘│   │
│  │ ┌─────┐┌─────┐┌─────┐┌─────┐│   │
│  │ │✓Benc││○ KBs││○Band││○Pull││   │
│  │ └─────┘└─────┘└─────┘└─────┘│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        Delete Location        │ │  ← Destructive action
│  └───────────────────────────────┘ │
│                                     │
│         [ Save ]                    │
│                                     │
└─────────────────────────────────────┘
```

**Interactions:**
- Edit location name
- Change tier → Updates equipment toggles
- Toggle individual equipment on/off
- Delete Location → Confirmation prompt → Removes location
- Save → Returns to Locations list

**Note:** Cannot delete last/only location.

---

### Experience Level

```
┌─────────────────────────────────────┐
│  ← EXPERIENCE LEVEL                 │
├─────────────────────────────────────┤
│                                     │
│  HOW FAMILIAR ARE YOU               │
│  WITH THE GYM?                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ○  NEW TO THIS                │ │
│  │                               │ │
│  │    Still learning the         │ │
│  │    movements. More            │ │
│  │    guidance is helpful.       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ○  SOME EXPERIENCE            │ │
│  │                               │ │
│  │    Know the basics.           │ │
│  │    Comfortable with           │ │
│  │    common exercises.          │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ●  CONFIDENT                  │ │  ← Current
│  │                               │ │
│  │    Just tell me what to do.   │ │
│  │    I'll figure it out.        │ │
│  └───────────────────────────────┘ │
│                                     │
│         [ Save ]                    │
│                                     │
└─────────────────────────────────────┘
```

**Interactions:**
- Tap option → Selects it (single select)
- Save → Returns to Settings hub

**Reuses:** Onboarding Step 2 UI

---

### Workout Structure

```
┌─────────────────────────────────────┐
│  ← WORKOUT STRUCTURE                │
├─────────────────────────────────────┤
│                                     │
│  GOAL                               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○  STRENGTH                 │   │
│  │    Heavy lifts, longer rest │   │
│  ├─────────────────────────────┤   │
│  │ ●  BALANCED                 │   │  ← Current
│  │    A little of everything   │   │
│  ├─────────────────────────────┤   │
│  │ ○  CONDITIONING             │   │
│  │    Circuits, shorter rest   │   │
│  ├─────────────────────────────┤   │
│  │ ○  QUICK & EFFECTIVE        │   │
│  │    Fewer sections, get done │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ CUSTOMIZE SECTIONS       ▼  │   │  ← Accordion open
│  │                             │   │
│  │ ┌─────┐┌─────┐┌─────┐┌─────┐│   │
│  │ │✓Warm││✓Mobi││✓Prim││✓Accs││   │
│  │ └─────┘└─────┘└─────┘└─────┘│   │
│  │ ┌─────┐┌─────┐┌─────┐┌─────┐│   │
│  │ │○Skil││○Carr││✓Core││○Stab││   │
│  │ └─────┘└─────┘└─────┘└─────┘│   │
│  │ ┌─────┐┌─────┐              │   │
│  │ │✓Cond││✓Cool│              │   │
│  │ └─────┘└─────┘              │   │
│  │                             │   │
│  │ What do these mean?      ▶  │   │  ← Expandable legend
│  └─────────────────────────────┘   │
│                                     │
│         [ Save ]                    │
│                                     │
└─────────────────────────────────────┘
```

**Interactions:**
- Tap goal → Selects it, updates recommended sections
- Toggle section chips on/off
- "What do these mean?" → Expands legend with descriptions
- Save → Returns to Settings hub

**Reuses:** Onboarding Step 3 UI

**Note:** Changing goal preset resets section toggles to that preset's defaults. User can then customize.

---

### Limitations

```
┌─────────────────────────────────────┐
│  ← LIMITATIONS                      │
├─────────────────────────────────────┤
│                                     │
│  ANYTHING WE SHOULD                 │
│  WORK AROUND?                       │
│                                     │
│  Old injuries, problem areas,       │
│  or movements you want to avoid.    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │ Bad left shoulder from      │   │
│  │ years ago. Overhead press   │   │
│  │ feels sketchy sometimes.    │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│         [ Clear All ]               │  ← Secondary action
│                                     │
│         [ Save ]                    │
│                                     │
└─────────────────────────────────────┘
```

**Interactions:**
- Edit text freely in textarea
- "Clear All" → Empties the field (confirmation prompt)
- Save → Returns to Settings hub

**Reuses:** Onboarding Step 4 UI

---

## Navigation

| Action | Destination |
|--------|-------------|
| Tap ← (from Settings hub) | Home / Dashboard |
| Tap any settings row | Opens sub-screen |
| Tap ← (from sub-screen) | Returns to Settings hub |
| Save (on sub-screen) | Returns to Settings hub |
| Tap "Send Feedback" | Opens email client or feedback form |
| Tap "About Clear" | Shows version info, credits, links |

---

## Future Enhancements

1. **Account** — Login, cloud sync, data export
2. **Notifications** — Workout reminders, streak alerts
3. **Integrations** — Apple Health, wearables, fitness APIs
4. **Data Management** — Export workout history, delete account

---

*Settings wireframe locked: December 22, 2025*
