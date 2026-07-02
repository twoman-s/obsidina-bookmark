/**
 * types.ts – Core interfaces and type definitions for the Scrapbook plugin.
 *
 * Architecture note:
 * All data flows through these interfaces. The code-block parser produces
 * `ScrapbookBlock` objects, the renderer consumes them, and settings provide
 * defaults that fill in any gaps. This strict typing makes it safe to extend
 * the plugin later (e.g. drag-and-drop editing) without breaking existing code.
 */

// ─────────────────────────────────────────────
// Per-image configuration
// ─────────────────────────────────────────────

/** Represents a single Polaroid image entry inside a scrapbook code block. */
export interface PolaroidImage {
	/** Vault-relative path or wiki-link target, e.g. "Photos/sunset.png" */
	path: string;

	/** Rotation angle in degrees (positive = clockwise) */
	rotation: number;

	/** CSS width value, e.g. "250px" or "45%" */
	width: string;

	/** Optional CSS height value; omit to preserve aspect ratio */
	height?: string;

	/** Horizontal offset in pixels (positive = right) */
	offsetX: number;

	/** Vertical offset in pixels (positive = down) */
	offsetY: number;

	/** CSS z-index for layering control */
	zIndex: number;

	/** Caption text displayed below the image */
	caption: string;

	/** Per-image border color override (CSS color string) */
	borderColor?: string;

	/** Whether to render a drop shadow */
	shadow: boolean;

	/** Whether to apply rounded corners to the Polaroid */
	rounded: boolean;

	/** Whether to render a decorative tape strip on this card */
	tape: boolean;
}

// ─────────────────────────────────────────────
// Container-level block definition
// ─────────────────────────────────────────────

/** Represents a complete ```scrapbook``` code block with up to 3 images. */
export interface ScrapbookBlock {
	/** Array of Polaroid image definitions (max 3) */
	images: PolaroidImage[];

	/** Optional CSS class for the container background */
	background?: string;

	/** Whether to show the paper-texture background */
	paperTexture: boolean;

	/** Whether to show notebook ruled lines */
	notebookLines: boolean;

	/** Whether to remove the background color/styling from the container */
	removeContainerBackground: boolean;
}

// ─────────────────────────────────────────────
// Plugin settings
// ─────────────────────────────────────────────

/** Global plugin settings, surfaced in the settings tab. */
export interface ScrapbookSettings {
	/** Default Polaroid border color */
	defaultBorderColor: string;

	/** Default Polaroid width (CSS value) */
	defaultWidth: string;

	/** Whether shadow is enabled by default */
	defaultShadow: boolean;

	/** Max random rotation range in degrees (0 = no rotation) */
	randomRotationRange: number;

	/** Whether to show paper-grain texture on containers */
	enablePaperTexture: boolean;

	/** Whether to show tape decoration by default */
	enableTape: boolean;

	/** Caption font family */
	captionFont: string;

	/** Whether to show notebook-paper background */
	notebookBackground: boolean;

	/** Folder path for uploaded images (vault-relative or .obsidian path) */
	imageStoragePath: string;

	/** Whether to remove the background color/styling from the container by default */
	removeContainerBackground: boolean;
}

/** Sensible defaults for a fresh install. */
export const DEFAULT_SETTINGS: ScrapbookSettings = {
	defaultBorderColor: "#fffef5",
	defaultWidth: "260px",
	defaultShadow: true,
	randomRotationRange: 6,
	enablePaperTexture: true,
	enableTape: true,
	notebookBackground: false,
	captionFont: "'Caveat', 'Segoe Print', 'Patrick Hand', 'Comic Sans MS', cursive",
	imageStoragePath: ".obsidian/plugins/scrapbook/.assets",
	removeContainerBackground: false,
};

// ─────────────────────────────────────────────
// Defaults for individual images
// ─────────────────────────────────────────────

/**
 * Returns a PolaroidImage with all defaults filled in.
 * Used by the parser when the user omits optional YAML keys.
 */
export function createDefaultImage(path: string): PolaroidImage {
	return {
		path,
		rotation: 0,
		width: "260px",
		height: undefined,
		offsetX: 0,
		offsetY: 0,
		zIndex: 1,
		caption: "",
		borderColor: undefined,
		shadow: true,
		rounded: false,
		tape: true,
	};
}
