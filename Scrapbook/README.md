# 📸 Scrapbook – Obsidian Plugin

Transform ordinary Markdown notes into beautiful scrapbook/journal pages with Polaroid-style photo cards.

> **100% Markdown-compatible** — your notes remain plain Markdown. Scrapbook only adds visual rendering in Live Preview and Reading Mode.

![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-7c3aed?logo=obsidian&logoColor=white)
![Status](https://img.shields.io/badge/Status-Beta-orange)

---

## ✨ Features

- 📷 **Polaroid photo cards** with thick white borders and handwritten captions
- 📤 **Click-to-upload** — add images from your device directly into the scrapbook
- 🎨 **Per-image customization** — rotation, width, offset, z-index, border color, shadow, tape
- 📄 **Paper textures** — grain, notebook lines, coffee stains, torn edges
- 🌙 **Light & Dark mode** support
- 📱 **Mobile-friendly** — stacks vertically on small screens
- 🔄 **Commands** — insert, randomize, normalize, shuffle (works with Templater & QuickAdd)
- 🎀 **Masking tape** decoration with realistic irregular edges
- ⚡ **Lightweight** — CSS animations, no heavy dependencies

---

## 📥 Installation

### Manual Installation

1. Download the latest release (`main.js`, `manifest.json`, `styles.css`).
2. Create a folder: `<your-vault>/.obsidian/plugins/scrapbook/`
3. Copy the three files into that folder.
4. Open Obsidian → Settings → Community Plugins → Enable "Scrapbook".

### BRAT (Beta Reviewer's Auto-update Tester)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat).
2. In BRAT settings, click "Add Beta Plugin".
3. Enter the repository URL.
4. Enable "Scrapbook" in Community Plugins.

### Build from Source

```bash
cd Scrapbook
npm install
npm run build
```

This produces `main.js` in the project root. Copy `main.js`, `manifest.json`, and `styles.css` into your vault's plugin folder.

---

## 🚀 Quick Start

Create a new note and add a `scrapbook` code block:

````markdown
```scrapbook
paper-texture: true
notebook-lines: false

- image: Photos/sunset.png
  caption: Golden hour at the beach
  rotation: -3
  width: 280px
  shadow: true
  tape: true

- image: Photos/coffee.png
  caption: Morning ritual ☕
  rotation: 4
  width: 240px

- image: Photos/mountains.png
  caption: Weekend escape
  rotation: -2
```
````

Switch to **Reading Mode** or **Live Preview** to see your scrapbook!

---

## 📖 YAML Property Reference

### Container-Level Properties

These go at the **top** of the code block, before any `- image:` entries.

| Property                 | Type    | Default                | Description                          |
| ------------------------ | ------- | ---------------------- | ------------------------------------ |
| `background`             | string  | —                      | CSS class suffix for container bg    |
| `paper-texture`          | boolean | `true` (from settings) | Show paper grain texture             |
| `notebook-lines`         | boolean | `false` (from settings)| Show faint ruled lines               |
| `transparent-background` | boolean | `false` (from settings)| Remove container bg and border       |

### Image-Level Properties

Each image entry starts with `- image:` followed by indented properties.

| Property       | Type    | Default          | Description                             |
| -------------- | ------- | ---------------- | --------------------------------------- |
| `image`        | string  | —                | **Required.** Vault path or `![[link]]` |
| `caption`      | string  | `""`             | Text below the photo                    |
| `rotation`     | number  | `0`              | Rotation in degrees (± for direction)   |
| `width`        | string  | `260px`          | CSS width (px, %, em)                   |
| `height`       | string  | auto             | CSS height (omit for aspect ratio)      |
| `offset-x`     | number  | `0`              | Horizontal offset in pixels             |
| `offset-y`     | number  | `0`              | Vertical offset in pixels               |
| `z-index`      | number  | `1`              | Layering order                          |
| `border-color` | string  | `#fffef5`        | CSS color for card border               |
| `shadow`       | boolean | `true`           | Enable drop shadow                      |
| `rounded`      | boolean | `false`          | Round the card corners                  |
| `tape`         | boolean | `true`           | Show tape decoration                    |

### Image Path Formats

All of these are valid:

```yaml
- image: Photos/sunset.png
- image: ![[Photos/sunset.png]]
- image: [[Photos/sunset.png]]
- image: "subfolder/my photo.jpg"
```

---

## ⚙️ Plugin Settings

Open **Settings → Scrapbook** to configure defaults:

| Setting                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| Default border color     | Polaroid card border color                       |
| Default width            | Default card width (e.g. `260px`)                |
| Default shadow           | Enable shadow by default                         |
| Random rotation range    | Max ± degrees for the randomize command (0–15°)  |
| Paper texture            | Show paper grain on containers                   |
| Tape decoration          | Show tape by default                             |
| Notebook background      | Show ruled lines by default                      |
| Transparent background   | Remove the default background color/styling      |
| **Image upload folder**  | Where uploaded images are saved (see below)       |
| Caption font             | Font family for captions                         |

---

## 📤 Image Upload

You can add images without typing paths manually!

### How it works

1. Create an empty scrapbook block (or one with fewer than 2 images).
2. A **"Click here to add images"** zone appears in the rendered view.
3. Click it → a file picker opens.
4. Select an image from your device.
5. The image is saved to your configured storage folder and the code block is updated automatically.

### Storage Location

By default, uploaded images are saved to:

```
<vault>/.obsidian/plugins/scrapbook/.assets/
```

You can change this in **Settings → Scrapbook → Image upload folder**.

> **Tip:** If you want uploaded images to be accessible via wiki-links (`![[image.png]]`), set the folder to a vault-level path like `Scrapbook Assets` instead of a `.obsidian` path.

### Example: Empty Scrapbook

````markdown
```scrapbook
paper-texture: true
```
````

This renders a scrapbook with a large "Click here to add images" zone. Click it to upload your first photo!

---

## 🎯 Commands

All commands are available in the **Command Palette** (`Ctrl/Cmd + P`):

| Command                              | Description                                       |
| ------------------------------------- | ------------------------------------------------- |
| **Scrapbook: Insert Scrapbook Container** | Inserts a complete `scrapbook` code block template |
| **Scrapbook: Insert Polaroid**            | Adds a single image entry at the cursor            |
| **Scrapbook: Randomize Rotations**        | Randomizes all `rotation:` values in the note      |
| **Scrapbook: Normalize Layout**           | Resets all rotations and offsets to 0              |
| **Scrapbook: Shuffle Photos**             | Randomly reorders images within scrapbook blocks   |

### Ribbon Icon

Click the 📷 **camera icon** in the left ribbon to quickly insert a scrapbook container.

---

## 🔌 Templater & QuickAdd Integration

### Templater

Execute Scrapbook commands from Templater templates:

```markdown
<%*
app.commands.executeCommandById("scrapbook:insert-scrapbook-container");
%>
```

### QuickAdd

1. Open **QuickAdd Settings** → **Add Choice** → **Macro**.
2. Add an **Obsidian Command** step.
3. Search for "Scrapbook" and select any command.

---

## 📱 Mobile Considerations

- On screens ≤ 480px, cards **stack vertically** automatically.
- Slight rotations are preserved for visual interest.
- Offsets (`offset-x`/`offset-y`) are ignored on mobile to prevent overlap.
- Tape decorations are slightly smaller.

---

## 🎨 Customization with CSS Snippets

You can override Scrapbook's CSS variables in a custom snippet:

```css
/* .obsidian/snippets/my-scrapbook.css */
:root {
  --scrap-border-color: #fff8dc;   /* Warm white border */
  --scrap-bg: #f0e6d3;             /* Warmer paper bg */
  --scrap-caption: 'Dancing Script', cursive;
  --scrap-tape-opacity: 0.7;
}
```

### Available CSS Variables

| Variable               | Description                |
| ---------------------- | -------------------------- |
| `--scrap-border-color` | Polaroid border color      |
| `--scrap-shadow`       | Card shadow value          |
| `--scrap-radius`       | Card border radius         |
| `--scrap-bg`           | Container background       |
| `--scrap-caption`      | Caption font family        |
| `--scrap-paper`        | Paper texture color        |
| `--scrap-width`        | Default card width         |
| `--scrap-tape-opacity` | Tape transparency          |
| `--scrap-tape-color`   | Tape color                 |
| `--scrap-line-color`   | Notebook line color        |
| `--scrap-margin-color` | Notebook margin line color |

### Optional CSS Classes

Add these to the container element via the `background` property:

| Class                      | Effect                         |
| -------------------------- | ------------------------------ |
| `.scrapbook-grain`         | Paper grain overlay            |
| `.scrapbook-coffee-stain`  | Decorative coffee ring stain   |
| `.scrapbook-torn-edge`     | Torn paper bottom edge         |
| `.scrapbook-no-tape`       | Hide tape on all cards         |
| `.scrapbook-no-rotate`     | Remove rotation from a card    |

---

## 🔧 Troubleshooting

### Images not showing?
- Make sure the image exists in your vault.
- Check the path is relative to your vault root.
- Wiki-link syntax (`![[image.png]]`) is automatically cleaned.

### Scrapbook block not rendering?
- Ensure the code block language is exactly `scrapbook` (lowercase).
- Switch to **Reading Mode** or **Live Preview**.
- Make sure the plugin is enabled.

### Cards overlapping on mobile?
- This is expected on desktop for the scrapbook aesthetic.
- On mobile (≤ 480px), cards automatically stack.
- Reduce `offset-x`/`offset-y` values if needed.

### Uploaded image not showing?
- Images stored in `.obsidian/` are loaded via the adapter (blob URLs). This works on both desktop and mobile.
- If you prefer wiki-link compatibility, change the upload folder to a vault-level path (e.g. `Scrapbook Assets`).
- Make sure the storage folder path in settings is correct.

### Upload button not appearing?
- The upload zone only shows when there are fewer than 2 images in the last container of the block.
- It appears in **Reading Mode** and **Live Preview**, not in Source Mode.

---

## 🏗️ Architecture (for developers)

```
src/
├── main.ts              – Plugin lifecycle (load/unload)
├── markdownProcessor.ts – Code-block registration & parsing bridge
├── renderer.ts          – DOM construction (container + Polaroid cards)
├── commands.ts          – 5 editor commands
├── settings.ts          – Settings tab UI
├── types.ts             – TypeScript interfaces & defaults
└── utils.ts             – Pure helpers (parser, rotation, paths)
```

**Extension points for future drag-and-drop:**
- `renderer.ts` → `renderPolaroid()` is callable standalone
- Each card has `data-scrapbook-index` for programmatic access
- CSS classes are stable for theme authors
- Transform values can be updated via DOM manipulation

---

## 📄 License

MIT License — use freely in your vaults and share with the community.
