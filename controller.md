# 🎮 Controller & Accessibility Reference

This document serves as the master reference for all controller mappings and accessibility flows within the RPG+ Engine.

---

## 1. Universal Control Mappings

The engine (`js/systems/input-manager.js`) handles raw hardware inputs and translates them into "Intents". These work seamlessly across keyboards and standard XInput/DirectInput gamepads.

| Intent | Keyboard | Gamepad (Xbox/PS) | Action |
| :--- | :--- | :--- | :--- |
| **Move / Navigate** | `W, A, S, D` / `Arrows` | `Left Stick` / `D-pad` | Moves character on map. Navigates menus spatially. |
| **Confirm / Interact** | `Enter` / `Space` | `Button 0` (A / Cross) | Interacts with NPCs/objects. Selects focused menu item. |
| **Back / Cancel** | `Escape` / `Backspace` | `Button 1` (B / Circle) | Closes active menu. Cancels targeting in battle. |
| **Menu / Pause** | `M` | `Button 9` (Start) | Opens the System Pause Menu while exploring. |
| **Cycle Party** | `Tab` | `Button 5` (R1 / RB) | Cycles the active controlled party member. |
| **Toggle UI Focus** | `` ` `` (Backquote) | `Button 8` (Select) | Switches focus from character movement to the on-screen UI buttons (Header). |

---

## 2. Spatial Navigation Flow (`FocusManager`)

Because the game features custom UI layouts, we don't rely on the browser's default `Tab` index navigation. Instead, we use a custom **Spatial Navigation** engine (`js/systems/focus-manager.js`).

1. **How it works**: When a player presses `D-pad Right`, the engine calculates the physical geometry of all focusable buttons on the screen and moves the `.kb-focus` highlight to the nearest element in that direction.
2. **Context Switching**: Menus must call `Focus.setContext('container-id')` to lock the player's navigation to that specific overlay (preventing them from moving map elements or background menus).
3. **Visual Cues**: All active elements receive a `.kb-focus` CSS class, which usually adds a glowing border or changes the background color to indicate selection.

---

## 3. Major Accessibility Flows

### A. Exploring the Overworld
- The player moves using the Left Stick.
- Approaching an NPC/Signpost triggers an interaction zone. Pressing `Confirm (A)` fires the interaction.
- The player can press `Select` to jump the cursor to the top header buttons (Settings, Mute, Menu).

### B. Battle System & Targeting
- The command grid (Attack, Ability, Item, Run) is navigated via the D-pad.
- **Targeting Mode**: When selecting an Ability/Item, the focus automatically shifts to the characters/enemies on the battlefield. 
- The cursor bounces from the UI directly onto the 3D/sprite models, applying a pulsing glow to the selected target.

### C. Menu Navigation
- Opening a menu stops map movement.
- `Confirm` activates a tab or uses an item.
- `Cancel (B)` always acts as a universal "Go Back" or "Close Menu" failsafe to prevent the player from getting trapped.

---

## 4. Current Missing Accessibility Targets
*To achieve a modern gold standard for accessibility, the following should be implemented in future milestones:*
1. **Key Rebinding**: Allowing players to remap keyboard and controller buttons.
2. **Pathfinding "Tap-to-Move"**: A mobile-friendly accessibility option to move without the virtual joystick.
3. **Menu Screen-Reading**: Expanding the `TTS` system to read out currently focused buttons and inventory items, rather than just NPC dialogue.
4. **Dynamic Button Prompts**: UI graphics that auto-swap between Xbox (A/B/X/Y) and PlayStation (Cross/Circle/Square/Triangle) icons depending on the detected hardware.
