# Concept Blueprint: Spatial Interaction Debounce Pipeline & Keyboard Polling Mitigation

## Core Problem Statement
During typical RPG map traversal, players interface with `MapEngine` interaction windows by pressing standard activation keys (`Space` / `Enter`). Because legacy continuous polling cycles evaluate input frames natively via `MapInput.isKey(' ')`, dismissing the terminal node of an active dialogue overlay instantly frees the interaction loop. If the mechanical un-press finger transient overlaps sub-sequent animation frames while the player silhouette remains directly adjacent to the target NPC tile, a recursive re-triggering trap forces an inescapable secondary dialogue overlay.

## Architectural Resolution
To ensure premium, interruption-free user pacing without introducing UI focus side-effects, an absolute time-domain debounce buffer is injected straight into the core spatial input interface:

1. **Cooldown State Tracking**:
   - Establish a global timestamp pointer `_lastInteractTime` inside `MapEngine` memory structures.

2. **Window Dismissal Hook Synchronization**:
   - Upon completing the final sentence array within `_closeNPCDialogue()`, forcefully update `_lastInteractTime = Date.now()` immediately prior to resuming runtime ticker loops.

3. **Input Frame Filtering**:
   - Gate initial spatial evaluation calls inside `interact()` with an absolute **500ms** latency threshold:
     ```javascript
     if (Date.now() - _lastInteractTime < 500) return;
     ```
   - This provides total input security, dampening any physical multi-tap keyboard transients while maintaining absolute input crispness during fresh movement approaches.
