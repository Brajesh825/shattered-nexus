# Shattered Nexus: Unisheet Character Layout Specification (unisheet v1.4)

> [!WARNING]
> **NOT IN USE**: This specification/skill is not currently active or integrated into the live production builds of the game.

This skill defines the grid structures, coordinates, and rendering parameters for the unified character sheets (`unisheet`).


---

## 📐 I. GRID SPECIFICATION
| Metric | Value | Description |
| :--- | :--- | :--- |
| **Cell Width** | 128 px | Width of each individual animation cell. |
| **Cell Height** | 128 px | Height of each individual animation cell. |
| **Columns** | 8 | 8 columns (Indices 0 to 7). |
| **Rows** | 8 | 8 rows (Indices 0 to 7). |
| **Total Width** | 1024 px | 8 columns × 128 px. |
| **Total Height** | 1024 px | 8 rows × 128 px. |
| **Anchor Point** | `{ x: 64, y: 120 }` | Pivot point aligning the bottom-center of the sprite to tiles. |

---

## 🗂️ II. CELL COORDINATE MAP
Frames are accessed by column and row coordinates `[col, row]` (0-indexed):

| Row | Col 0 | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 | Col 7 (Utility) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0: Front & Emotes** | `idle_front` | `happy` 😊 | `sad` 😢 | `angry` 😠 | `surprised` 😲 | *(reserved)* | *(reserved)* | `talk_front` 🗣️ |
| **1: Right Walk** | `idle_right` | `walk_right_1` | `walk_right_2` | `walk_right_3` | `walk_right_4` | *(reserved)* | *(reserved)* | `talk_right` 🗣️ |
| **2: Down Walk** | `idle_down` | `walk_down_1` | `walk_down_2` | `walk_down_3` | `walk_down_4` | *(reserved)* | *(reserved)* | `guard` 🛡️ |
| **3: Up Walk** | `idle_up` | `walk_up_1` | `walk_up_2` | `walk_up_3` | `walk_up_4` | *(reserved)* | *(reserved)* | `dead` 💀 |
| **4: Attack** | `combat_ready` | `atk_1` | `atk_2` | `atk_3` | `atk_4` | `atk_5` | `atk_6` | `hurt` 💥 |
| **5: Magic Cast** | `cast_ready` | `cast_1` | `cast_2` | `cast_3` | `cast_4` | `cast_5` | `cast_6` | `victory` 🎉 |
| **6: Ultimate** | `ult_1` | `ult_2` | `ult_3` | `ult_4` | `ult_5` | `ult_6` | `ult_7` | *(reserved)* |
| **7: Misc / Future** | `misc_0` | `misc_1` | `misc_2` | `misc_3` | `misc_4` | `misc_5` | `misc_6` | `misc_7` |

*Left-facing frames are rendered dynamically in code using Row 1 (Right Walk) with a horizontal scale mirror (`scaleX(-1)`).*

---

## 🔄 III. ANIMATION ENGINE ASSIGNMENTS

### 1. Exploration Traversal Loops (Map)
*   **Move North (Up Walk)**: Cycle Column `[1, 2, 3, 4]` on Row 3.
*   **Move South (Down Walk)**: Cycle Column `[1, 2, 3, 4]` on Row 2.
*   **Move East (Right Walk)**: Cycle Column `[1, 2, 3, 4]` on Row 1.
*   **Move West (Left Walk)**: Cycle Column `[1, 2, 3, 4]` on Row 1 with `scaleX(-1)`.
*   **Interval**: 160 ms per frame.

### 2. Dialogue Talk Loops (Staged Cutscenes)
*   **Front Speaker**: Alternate between `[0, 0]` (`idle_front`) and `[7, 0]` (`talk_front`).
*   **Side Speaker (Right)**: Alternate between `[0, 1]` (`idle_right`) and `[7, 1]` (`talk_right`).
*   **Side Speaker (Left)**: Alternate between `[0, 1]` and `[7, 1]` with `scaleX(-1)`.
*   **Interval**: 200 ms per frame.

### 3. Battle Action States (Combat Engine)
*   **Bracing (Guard)**: Render cell `[7, 2]`.
*   **Defeated (KO)**: Render cell `[7, 3]`.
*   **Struck (Hurt)**: Render cell `[7, 4]` for 300 ms.
*   **Victory Pose**: Render cell `[7, 5]`.

---

## 🎨 IV. CSS RENDERING METHODOLOGY
To select sprite cell `[col, row]` in a standard element:

```css
.sprite-unisheet {
  background-image: url('images/characters/sheets/char_id.png');
  background-size: 800% 800%; /* 8 columns wide, 8 rows tall */
  image-rendering: pixelated;
  width: 128px;
  height: 128px;
}

/* Example: Column 7, Row 3 (dead) */
.sprite-unisheet.dead {
  background-position: 100.00% 42.86%; /* (col * 100/7)% (row * 100/7)% */
}
```
