/**
 * commands.ts – Obsidian commands for the Scrapbook plugin.
 *
 * All commands operate by modifying the Markdown text in the active editor,
 * preserving the "source as single source of truth" principle. They insert
 * or transform text within ```scrapbook``` code blocks.
 *
 * These commands are registered with `addCommand()`, which makes them
 * automatically available to:
 * - Obsidian Command Palette
 * - Templater (tp.app.commands.executeCommandById)
 * - QuickAdd (command macros)
 * - Hotkey assignments
 */

import { App, Editor, MarkdownView, Plugin } from "obsidian";
import { ScrapbookSettings } from "./types";
import { randomRotation } from "./utils";

/**
 * Registers all Scrapbook commands on the plugin instance.
 *
 * @param plugin      – The Scrapbook plugin instance.
 * @param app         – Obsidian App instance.
 * @param getSettings – Returns the current settings snapshot.
 */
export function registerScrapbookCommands(
	plugin: Plugin,
	app: App,
	getSettings: () => ScrapbookSettings
): void {
	// ─────────────────────────────────────────
	// 1. Insert Scrapbook Container
	// ─────────────────────────────────────────
	plugin.addCommand({
		id: "insert-scrapbook-container",
		name: "Insert Scrapbook Container",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const settings = getSettings();
			const template = [
				"```scrapbook",
				`paper-texture: ${settings.enablePaperTexture}`,
				`notebook-lines: ${settings.notebookBackground}`,
				"",
				"- image: path/to/your-image.png",
				"  caption: Your caption here",
				`  rotation: ${randomRotation(settings.randomRotationRange)}`,
				`  width: ${settings.defaultWidth}`,
				`  shadow: ${settings.defaultShadow}`,
				`  tape: ${settings.enableTape}`,
				"```",
			].join("\n");

			const cursor = editor.getCursor();
			editor.replaceRange(template, cursor);
		},
	});

	// ─────────────────────────────────────────
	// 2. Insert Polaroid
	// ─────────────────────────────────────────
	plugin.addCommand({
		id: "insert-polaroid",
		name: "Insert Polaroid",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const settings = getSettings();
			const entry = [
				"",
				"- image: path/to/your-image.png",
				"  caption: Caption",
				`  rotation: ${randomRotation(settings.randomRotationRange)}`,
				`  width: ${settings.defaultWidth}`,
				`  shadow: ${settings.defaultShadow}`,
				`  tape: ${settings.enableTape}`,
			].join("\n");

			const cursor = editor.getCursor();
			editor.replaceRange(entry, cursor);
		},
	});

	// ─────────────────────────────────────────
	// 3. Randomize Rotations
	// ─────────────────────────────────────────
	plugin.addCommand({
		id: "randomize-rotations",
		name: "Randomize Rotations",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const settings = getSettings();
			const content = editor.getValue();

			// Find all rotation: lines within scrapbook blocks and randomize them
			const updated = content.replace(
				/^(\s*rotation:\s*)(-?[\d.]+)/gm,
				(_match, prefix) => {
					const newRot = randomRotation(settings.randomRotationRange);
					return `${prefix}${newRot}`;
				}
			);

			if (updated !== content) {
				const cursor = editor.getCursor();
				editor.setValue(updated);
				editor.setCursor(cursor);
			}
		},
	});

	// ─────────────────────────────────────────
	// 4. Normalize Layout
	// ─────────────────────────────────────────
	plugin.addCommand({
		id: "normalize-layout",
		name: "Normalize Layout",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const content = editor.getValue();
			let updated = content;

			// Reset rotations to 0
			updated = updated.replace(
				/^(\s*rotation:\s*)(-?[\d.]+)/gm,
				"$10"
			);

			// Reset offsets to 0
			updated = updated.replace(
				/^(\s*offset-?[xy]:\s*)(-?[\d.]+)/gm,
				"$10"
			);

			if (updated !== content) {
				const cursor = editor.getCursor();
				editor.setValue(updated);
				editor.setCursor(cursor);
			}
		},
	});

	// ─────────────────────────────────────────
	// 5. Shuffle Photos
	// ─────────────────────────────────────────
	plugin.addCommand({
		id: "shuffle-photos",
		name: "Shuffle Photos",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const content = editor.getValue();

			// Match scrapbook code blocks
			const blockRegex = /```scrapbook\n([\s\S]*?)```/g;

			const updated = content.replace(blockRegex, (match, inner: string) => {
				// Split into container-level lines and image entries
				const lines = inner.split("\n");
				const headerLines: string[] = [];
				const imageEntries: string[][] = [];
				let currentEntry: string[] = [];

				for (const line of lines) {
					if (line.trim().startsWith("- image:")) {
						if (currentEntry.length > 0) {
							imageEntries.push(currentEntry);
						}
						currentEntry = [line];
					} else if (currentEntry.length > 0) {
						currentEntry.push(line);
					} else {
						headerLines.push(line);
					}
				}
				if (currentEntry.length > 0) {
					imageEntries.push(currentEntry);
				}

				// Fisher-Yates shuffle
				for (let i = imageEntries.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[imageEntries[i], imageEntries[j]] = [imageEntries[j], imageEntries[i]];
				}

				// Reassemble
				const reassembled = [
					...headerLines,
					...imageEntries.map((entry) => entry.join("\n")),
				].join("\n");

				return "```scrapbook\n" + reassembled + "```";
			});

			if (updated !== content) {
				const cursor = editor.getCursor();
				editor.setValue(updated);
				editor.setCursor(cursor);
			}
		},
	});
}
