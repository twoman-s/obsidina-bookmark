/**
 * utils.ts – Shared helper functions for the Scrapbook plugin.
 *
 * These utilities are intentionally pure functions (no Obsidian API dependency
 * except `resolveImagePath`) so they can be unit-tested independently.
 */

import { App, TFile, Vault, normalizePath, Notice } from "obsidian";
import { PolaroidImage, ScrapbookBlock, ScrapbookSettings, createDefaultImage } from "./types";

// ─────────────────────────────────────────────
// Numeric helpers
// ─────────────────────────────────────────────

/**
 * Returns a random rotation angle within ±range degrees.
 * Example: randomRotation(6) → value in [-6, 6]
 */
export function randomRotation(range: number): number {
	return Math.round((Math.random() * 2 - 1) * range * 100) / 100;
}

/** Clamps a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

// ─────────────────────────────────────────────
// YAML-like block parser
// ─────────────────────────────────────────────

/**
 * Parses the content of a ```scrapbook``` code block into a ScrapbookBlock.
 *
 * The format is a simple YAML-like syntax where each image starts with `- image:`:
 *
 * ```
 * background: notebook
 * paper-texture: true
 *
 * - image: Photos/sunset.png
 *   caption: Golden hour
 *   rotation: -3
 *   width: 280px
 *   shadow: true
 *   tape: true
 *
 * - image: Photos/beach.png
 *   caption: Summer vibes
 * ```
 *
 * Returns a ScrapbookBlock with up to 3 images (extras are silently dropped).
 */
export function parseScrapbookBlock(source: string, settings: ScrapbookSettings): ScrapbookBlock {
	const lines = source.split("\n");

	const block: ScrapbookBlock = {
		images: [],
		background: undefined,
		paperTexture: settings.enablePaperTexture,
		notebookLines: settings.notebookBackground,
		removeContainerBackground: settings.removeContainerBackground,
	};

	let currentImage: PolaroidImage | null = null;

	for (const rawLine of lines) {
		const line = rawLine.trim();

		// Skip empty lines and comments
		if (line === "" || line.startsWith("#")) continue;

		// ── Container-level properties ──────────────
		if (!line.startsWith("-") && currentImage === null) {
			const colonIdx = line.indexOf(":");
			if (colonIdx === -1) continue;

			const key = line.substring(0, colonIdx).trim().toLowerCase();
			const val = line.substring(colonIdx + 1).trim();

			switch (key) {
				case "background":
					block.background = val;
					break;
				case "paper-texture":
					block.paperTexture = parseBool(val, settings.enablePaperTexture);
					break;
				case "notebook-lines":
					block.notebookLines = parseBool(val, settings.notebookBackground);
					break;
				case "transparent-background":
				case "remove-background":
					block.removeContainerBackground = parseBool(val, settings.removeContainerBackground);
					break;
			}
			continue;
		}

		// ── New image entry ─────────────────────────
		if (line.startsWith("- image:") || line.startsWith("-image:")) {
			// Push the previous image if there was one
			if (currentImage !== null && currentImage.path) {
				block.images.push(currentImage);
			}

			const path = line.replace(/^-\s*image:\s*/, "").trim();
			const cleaned = cleanImagePath(path);

			// Skip entries with empty image paths — they'd crash the resolver
			if (!cleaned) {
				currentImage = null;
				continue;
			}

			currentImage = createDefaultImage(cleaned);

			// Apply settings-level defaults
			currentImage.width = settings.defaultWidth;
			currentImage.shadow = settings.defaultShadow;
			currentImage.tape = settings.enableTape;
			continue;
		}

		// ── Image-level properties ──────────────────
		if (currentImage !== null && line.includes(":")) {
			const colonIdx = line.indexOf(":");
			const key = line.substring(0, colonIdx).trim().toLowerCase();
			const val = line.substring(colonIdx + 1).trim();

			switch (key) {
				case "caption":
					currentImage.caption = val;
					break;
				case "rotation":
					currentImage.rotation = parseFloat(val) || 0;
					break;
				case "width":
					currentImage.width = val;
					break;
				case "height":
					currentImage.height = val;
					break;
				case "offset-x":
				case "offsetx":
					currentImage.offsetX = parseInt(val, 10) || 0;
					break;
				case "offset-y":
				case "offsety":
					currentImage.offsetY = parseInt(val, 10) || 0;
					break;
				case "z-index":
				case "zindex":
					currentImage.zIndex = parseInt(val, 10) || 1;
					break;
				case "border-color":
				case "bordercolor":
					currentImage.borderColor = val;
					break;
				case "shadow":
					currentImage.shadow = parseBool(val, settings.defaultShadow);
					break;
				case "rounded":
					currentImage.rounded = parseBool(val, false);
					break;
				case "tape":
					currentImage.tape = parseBool(val, settings.enableTape);
					break;
			}
		}
	}

	// Don't forget the last image (only if it has a valid path)
	if (currentImage !== null && currentImage.path) {
		block.images.push(currentImage);
	}

	return block;
}

// ─────────────────────────────────────────────
// Image path resolution
// ─────────────────────────────────────────────

/**
 * Strips wiki-link syntax from an image path.
 * "![[Photos/sunset.png]]" → "Photos/sunset.png"
 * "[[Photos/sunset.png]]"  → "Photos/sunset.png"
 */
export function cleanImagePath(raw: string): string {
	let cleaned = raw.trim();
	// Remove ![[...]] or [[...]]
	cleaned = cleaned.replace(/^!\[\[/, "").replace(/^\[\[/, "").replace(/\]\]$/, "");
	// Remove leading/trailing quotes
	cleaned = cleaned.replace(/^["']|["']$/g, "");
	return cleaned.trim();
}

/**
 * Resolves a vault-relative image path to a resource URI that Obsidian can render.
 * 
 * Handles two scenarios:
 * 1. Normal vault files → uses Vault.getResourcePath()
 * 2. Files inside .obsidian/ (adapter-level) → reads binary and creates blob URL
 * 
 * Returns a Promise because adapter-level reads are async.
 */
export async function resolveImagePath(path: string, app: App): Promise<string | null> {
	const cleanedPath = cleanImagePath(path);

	// Guard: empty or whitespace-only paths would crash vault API calls
	if (!cleanedPath) {
		return null;
	}

	// Try to find the file in the vault index
	const file = app.metadataCache.getFirstLinkpathDest(cleanedPath, "");
	if (file instanceof TFile) {
		return app.vault.getResourcePath(file);
	}

	// Fallback: try as absolute vault path
	const vaultFile = app.vault.getAbstractFileByPath(cleanedPath);
	if (vaultFile instanceof TFile) {
		return app.vault.getResourcePath(vaultFile);
	}

	// Fallback: try adapter-level read (for .obsidian/ files not in the vault index)
	try {
		const normalized = normalizePath(cleanedPath);
		if (await app.vault.adapter.exists(normalized)) {
			const data = await app.vault.adapter.readBinary(normalized);
			const ext = normalized.split(".").pop()?.toLowerCase() || "png";
			const mimeMap: Record<string, string> = {
				png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
				gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
				bmp: "image/bmp", avif: "image/avif",
			};
			const mime = mimeMap[ext] || "image/png";
			const blob = new Blob([data], { type: mime });
			return URL.createObjectURL(blob);
		}
	} catch {
		// Adapter read failed — fall through to null
	}

	return null;
}

// ─────────────────────────────────────────────
// Image upload helpers
// ─────────────────────────────────────────────

/**
 * Saves an uploaded image file into the configured storage directory.
 * Creates the directory if it doesn't exist.
 * Returns the vault-relative path to the saved image.
 */
export async function saveUploadedImage(
	file: File,
	app: App,
	storagePath: string
): Promise<string> {
	const dir = normalizePath(storagePath);

	// Ensure the storage directory exists
	if (!(await app.vault.adapter.exists(dir))) {
		await app.vault.adapter.mkdir(dir);
	}

	// Generate a unique filename to avoid collisions
	const timestamp = Date.now();
	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const finalName = `${timestamp}-${safeName}`;
	const fullPath = normalizePath(`${dir}/${finalName}`);

	// Read the file as ArrayBuffer and write via adapter
	const buffer = await file.arrayBuffer();
	await app.vault.adapter.writeBinary(fullPath, buffer);

	new Notice(`📷 Image saved: ${finalName}`);
	return fullPath;
}

/**
 * Injects a new `- image:` entry into the source file's scrapbook code block.
 * Uses the MarkdownPostProcessorContext section info to locate the block.
 */
export async function injectImageIntoBlock(
	imagePath: string,
	sourcePath: string,
	blockLineStart: number,
	blockLineEnd: number,
	app: App,
	settings: ScrapbookSettings
): Promise<void> {
	const file = app.vault.getAbstractFileByPath(sourcePath);
	if (!(file instanceof TFile)) return;

	const content = await app.vault.read(file);
	const lines = content.split("\n");

	// Build the new image entry
	const entry = [
		"",
		`- image: ${imagePath}`,
		"  caption: ",
		`  rotation: ${randomRotation(settings.randomRotationRange)}`,
		`  width: ${settings.defaultWidth}`,
		`  shadow: ${settings.defaultShadow}`,
		`  tape: ${settings.enableTape}`,
	];

	// Insert just before the closing ``` line
	lines.splice(blockLineEnd, 0, ...entry);

	await app.vault.modify(file, lines.join("\n"));
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/** Parses a string as a boolean, falling back to a default. */
function parseBool(val: string, fallback: boolean): boolean {
	const lower = val.toLowerCase().trim();
	if (lower === "true" || lower === "yes" || lower === "1") return true;
	if (lower === "false" || lower === "no" || lower === "0") return false;
	return fallback;
}
