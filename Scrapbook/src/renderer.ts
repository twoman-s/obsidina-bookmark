/**
 * renderer.ts – DOM builder for scrapbook containers and Polaroid cards.
 *
 * Architecture note:
 * The renderer is intentionally decoupled from the parser so that a future
 * drag-and-drop editor can call `renderPolaroid()` directly without going
 * through the code-block pipeline. All DOM construction happens here;
 * the parser only produces data objects.
 *
 * Extension points:
 * - `renderPolaroid()` can be called standalone for drag-and-drop previews.
 * - CSS classes are stable and documented for theme authors.
 * - Each card gets a `data-scrapbook-index` attribute for programmatic access.
 *
 * Container grouping:
 * - Images are grouped into pairs (max 2 per container).
 * - If > 2 images exist, additional containers are rendered automatically.
 *
 * Image upload:
 * - When the last container has < 2 images, a clickable upload zone is shown.
 * - The file input is created on document.body to avoid Obsidian's event
 *   blocking within code-block DOM.
 */

import { App, MarkdownPostProcessorContext, Notice } from "obsidian";
import { PolaroidImage, ScrapbookBlock, ScrapbookSettings } from "./types";
import { resolveImagePath, saveUploadedImage, injectImageIntoBlock } from "./utils";

/** Maximum images per visual container */
const IMAGES_PER_CONTAINER = 2;

// ─────────────────────────────────────────────
// Container renderer
// ─────────────────────────────────────────────

/**
 * Renders one or more scrapbook containers from a parsed block.
 * Images are grouped into pairs — each pair gets its own container.
 *
 * @param el        – The HTMLElement to render into (provided by Obsidian's code-block processor).
 * @param block     – Parsed scrapbook block data.
 * @param settings  – Current plugin settings.
 * @param app       – Obsidian App instance for vault access.
 * @param ctx       – Markdown post-processor context (for source file info and section position).
 */
export function renderScrapbookContainer(
	el: HTMLElement,
	block: ScrapbookBlock,
	settings: ScrapbookSettings,
	app: App,
	ctx: MarkdownPostProcessorContext
): void {
	// Group images into chunks of IMAGES_PER_CONTAINER
	const groups: PolaroidImage[][] = [];
	for (let i = 0; i < block.images.length; i += IMAGES_PER_CONTAINER) {
		groups.push(block.images.slice(i, i + IMAGES_PER_CONTAINER));
	}

	// If there are no images at all, create one empty container with the upload zone
	if (groups.length === 0) {
		const container = createContainer(el, block, settings);
		renderUploadZone(container, 0, settings, app, ctx, el);
		return;
	}

	// Render each group as its own container
	groups.forEach((group, groupIndex) => {
		const container = createContainer(el, block, settings);

		// Render the Polaroid cards in this group
		group.forEach((image, indexInGroup) => {
			const globalIndex = groupIndex * IMAGES_PER_CONTAINER + indexInGroup;
			renderPolaroid(container, image, settings, app, globalIndex);
		});

		// Show upload zone in the last container (it will float in the corner if images exist)
		const isLastGroup = groupIndex === groups.length - 1;
		if (isLastGroup) {
			renderUploadZone(container, block.images.length, settings, app, ctx, el);
		}
	});
}

/**
 * Creates a styled scrapbook container div with all the appropriate classes.
 */
function createContainer(
	parent: HTMLElement,
	block: ScrapbookBlock,
	settings: ScrapbookSettings
): HTMLElement {
	const container = parent.createDiv({ cls: "scrapbook-container" });

	// Apply container-level CSS variables from settings
	container.style.setProperty("--scrap-caption", settings.captionFont);

	// Apply optional background classes
	if (block.paperTexture) {
		container.classList.add("scrapbook-paper-texture");
	}
	if (block.notebookLines) {
		container.classList.add("scrapbook-notebook");
	}
	if (block.background) {
		container.classList.add(`scrapbook-bg-${block.background}`);
	}
	if (block.removeContainerBackground) {
		container.classList.add("scrapbook-transparent-bg");
	}

	return container;
}

// ─────────────────────────────────────────────
// Polaroid card renderer
// ─────────────────────────────────────────────

/**
 * Renders a single Polaroid photo card inside a container.
 *
 * @param container – Parent element to append the card to.
 * @param image     – Image configuration from the parsed block.
 * @param settings  – Current plugin settings.
 * @param app       – Obsidian App instance for vault access.
 * @param index     – Zero-based index for data attributes and z-index fallback.
 */
export function renderPolaroid(
	container: HTMLElement,
	image: PolaroidImage,
	settings: ScrapbookSettings,
	app: App,
	index: number
): void {
	// ── Card wrapper ──────────────────────────
	const card = container.createDiv({ cls: "scrapbook-polaroid" });
	card.setAttribute("data-scrapbook-index", String(index));

	// ── Per-card CSS custom properties ────────
	const borderColor = image.borderColor || settings.defaultBorderColor;
	card.style.setProperty("--scrap-border-color", borderColor);
	card.style.setProperty("--scrap-width", image.width);

	if (image.height) {
		card.style.setProperty("--scrap-height", image.height);
	}

	// ── Transform: rotation + offset ──────────
	// We use individual CSS properties (translate, rotate) so they don't
	// get overwritten by the transform property used in hover states and animations.
	card.style.setProperty("translate", `${image.offsetX}px ${image.offsetY}px`);
	card.style.setProperty("rotate", `${image.rotation}deg`);
	card.style.zIndex = String(image.zIndex);

	// ── Conditional classes ───────────────────
	if (image.shadow) {
		card.classList.add("scrapbook-shadow");
	}
	if (image.rounded) {
		card.classList.add("scrapbook-rounded");
	}

	// ── Tape decoration ──────────────────────
	if (image.tape) {
		const tape = card.createDiv({ cls: "scrapbook-tape" });
		// Slight random rotation for the tape to look natural
		const tapeRotation = (Math.random() * 10 - 5).toFixed(1);
		tape.style.transform = `rotate(${tapeRotation}deg)`;
	}

	// ── Image frame ──────────────────────────
	const frame = card.createDiv({ cls: "scrapbook-frame" });

	// Resolve the image path through Obsidian's vault API (async for adapter-level files)
	resolveImagePath(image.path, app).then((resolvedSrc) => {
		if (resolvedSrc) {
			const img = frame.createEl("img", {
				cls: "scrapbook-image",
				attr: {
					src: resolvedSrc,
					alt: image.caption || image.path,
					loading: "lazy",
					draggable: "false",
				},
			});

			// Handle load errors gracefully
			img.addEventListener("error", () => {
				img.style.display = "none";
				const errorDiv = frame.createDiv({ cls: "scrapbook-image-error" });
				errorDiv.createEl("span", { text: "📷" });
				errorDiv.createEl("p", { text: `Could not load: ${image.path}` });
			});
		} else {
			// Image not found in vault – show friendly error
			const errorDiv = frame.createDiv({ cls: "scrapbook-image-error" });
			errorDiv.createEl("span", { text: "📷" });
			errorDiv.createEl("p", { text: `Not found: ${image.path}` });
		}
	});

	// ── Caption ──────────────────────────────
	if (image.caption) {
		const captionEl = card.createDiv({ cls: "scrapbook-caption" });
		captionEl.createEl("p", { text: image.caption });
	}
}

// ─────────────────────────────────────────────
// Image upload zone
// ─────────────────────────────────────────────

/**
 * Renders a clickable upload zone that lets users add images from their device.
 * - When the scrapbook is empty, this is a large prominent zone.
 * - When images exist but < 2 in the last container, this is a smaller "add more" button.
 *
 * IMPORTANT: The <input type="file"> is created on document.body (not inside
 * the code-block DOM) because Obsidian intercepts/blocks click events within
 * rendered code blocks. By placing the input outside, programmatic .click()
 * reliably opens the native file picker.
 *
 * The upload flow:
 * 1. User clicks the zone → hidden <input type="file"> on body is triggered.
 * 2. User selects an image.
 * 3. Image is saved to the configured storage folder via the adapter.
 * 4. A `- image:` entry is injected into the source Markdown code block.
 * 5. Obsidian re-renders the block automatically.
 */
function renderUploadZone(
	container: HTMLElement,
	currentImageCount: number,
	settings: ScrapbookSettings,
	app: App,
	ctx: MarkdownPostProcessorContext,
	codeBlockEl: HTMLElement
): void {
	const isEmpty = currentImageCount === 0;
	const cls = isEmpty
		? "scrapbook-upload-zone scrapbook-upload-empty"
		: "scrapbook-upload-zone scrapbook-upload-floating";

	const zone = container.createDiv({ cls });

	// Icon
	const icon = zone.createDiv({ cls: "scrapbook-upload-icon" });
	icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/></svg>`;

	// Text
	if (isEmpty) {
		zone.createEl("p", {
			text: "Click here to add images",
			cls: "scrapbook-upload-text",
		});
		zone.createEl("p", {
			text: "Upload from your device — or type image paths in the code block",
			cls: "scrapbook-upload-hint",
		});
	}

	// ── File input on document.body ──────────
	// Created OUTSIDE the code-block DOM to avoid Obsidian blocking the click
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = "image/*";
	fileInput.style.display = "none";
	document.body.appendChild(fileInput);

	// Clean up the detached input when the zone is removed from DOM
	const observer = new MutationObserver(() => {
		if (!zone.isConnected) {
			fileInput.remove();
			observer.disconnect();
		}
	});
	observer.observe(container, { childList: true });

	// Click handler — opens the native file picker
	zone.addEventListener("click", () => {
		fileInput.click();
	});

	// File selection handler
	fileInput.addEventListener("change", async () => {
		const selectedFile = fileInput.files?.[0];
		if (!selectedFile) return;

		try {
			// Show loading state
			zone.classList.add("scrapbook-upload-loading");

			// Save the image to the storage folder
			const savedPath = await saveUploadedImage(
				selectedFile,
				app,
				settings.imageStoragePath
			);

			// Get the code block's position in the source file
			const sectionInfo = ctx.getSectionInfo(codeBlockEl);
			if (sectionInfo) {
				await injectImageIntoBlock(
					savedPath,
					ctx.sourcePath,
					sectionInfo.lineStart,
					sectionInfo.lineEnd,
					app,
					settings
				);
			} else {
				// Fallback: copy path to clipboard so user can paste it
				await navigator.clipboard.writeText(`- image: ${savedPath}`);
				new Notice("📋 Image saved! Path copied to clipboard — paste it into your scrapbook block.");
			}
		} catch (err) {
			console.error("Scrapbook: upload failed", err);
			new Notice("❌ Failed to upload image. Check the console for details.");
		} finally {
			zone.classList.remove("scrapbook-upload-loading");
			// Reset file input so the same file can be re-selected
			fileInput.value = "";
		}
	});
}
