/**
 * markdownProcessor.ts – Registers the `scrapbook` code-block processor with Obsidian.
 *
 * Architecture note:
 * This module is the bridge between Obsidian's Markdown pipeline and our
 * rendering system. It receives raw code-block text, delegates parsing to
 * utils.ts, and hands the result to renderer.ts for DOM construction.
 *
 * The processor works in both Reading Mode and Live Preview because
 * Obsidian's `registerMarkdownCodeBlockProcessor` handles both contexts.
 */

import { App, MarkdownPostProcessorContext, Plugin } from "obsidian";
import { ScrapbookSettings } from "./types";
import { parseScrapbookBlock } from "./utils";
import { renderScrapbookContainer } from "./renderer";

/**
 * Registers the `scrapbook` Markdown code-block processor.
 *
 * Usage in a note:
 * ````markdown
 * ```scrapbook
 * - image: Photos/sunset.png
 *   caption: Golden hour
 *   rotation: -3
 * ```
 * ````
 *
 * @param plugin   – The Scrapbook plugin instance (used for registration lifecycle).
 * @param app      – Obsidian App instance for vault access.
 * @param settings – A function that returns the current settings (so we always read fresh values).
 */
export function registerScrapbookProcessor(
	plugin: Plugin,
	app: App,
	getSettings: () => ScrapbookSettings
): void {
	plugin.registerMarkdownCodeBlockProcessor(
		"scrapbook",
		(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			// Clear any default content Obsidian may insert
			el.empty();

			// Parse the YAML-like block content
			const settings = getSettings();
			const block = parseScrapbookBlock(source, settings);

			// Build the visual DOM (ctx is passed for upload zone's source-file injection)
			renderScrapbookContainer(el, block, settings, app, ctx);
		}
	);
}
