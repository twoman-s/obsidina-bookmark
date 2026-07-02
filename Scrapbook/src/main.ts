/**
 * main.ts – Entry point for the Scrapbook Obsidian plugin.
 *
 * This file wires together all modules:
 * - Loads/saves plugin settings
 * - Registers the `scrapbook` Markdown code-block processor
 * - Registers all commands (available to Command Palette, Templater, QuickAdd)
 * - Adds a ribbon icon for quick access
 * - Adds the settings tab
 *
 * Architecture:
 * ┌───────────┐     ┌────────────────────┐     ┌──────────────┐
 * │  main.ts  │────▶│ markdownProcessor  │────▶│  renderer.ts │
 * │ (Plugin)  │     │  (code block reg)  │     │  (DOM build) │
 * └─────┬─────┘     └────────────────────┘     └──────────────┘
 *       │           ┌────────────────────┐     ┌──────────────┐
 *       ├──────────▶│   commands.ts      │────▶│   utils.ts   │
 *       │           │ (5 editor cmds)    │     │  (helpers)   │
 *       │           └────────────────────┘     └──────────────┘
 *       │           ┌────────────────────┐     ┌──────────────┐
 *       └──────────▶│   settings.ts      │────▶│   types.ts   │
 *                   │ (settings tab)     │     │ (interfaces) │
 *                   └────────────────────┘     └──────────────┘
 */

import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, ScrapbookSettings } from "./types";
import { registerScrapbookProcessor } from "./markdownProcessor";
import { registerScrapbookCommands } from "./commands";
import { ScrapbookSettingTab } from "./settings";

export default class ScrapbookPlugin extends Plugin {
	settings: ScrapbookSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		console.log("Scrapbook: loading plugin");

		// ── Load persisted settings ─────────────
		await this.loadSettings();

		// ── Register the code-block processor ───
		// Works in both Reading Mode and Live Preview
		registerScrapbookProcessor(this, this.app, () => this.settings);

		// ── Register commands ───────────────────
		// All commands are automatically available to Templater and QuickAdd
		// via tp.app.commands.executeCommandById("scrapbook:command-id")
		registerScrapbookCommands(this, this.app, () => this.settings);

		// ── Ribbon icon ─────────────────────────
		this.addRibbonIcon("image-plus", "Scrapbook: Insert Container", () => {
			// Execute the insert container command programmatically
			(this.app as any).commands.executeCommandById(
				"scrapbook:insert-scrapbook-container"
			);
		});

		// ── Settings tab ────────────────────────
		this.addSettingTab(new ScrapbookSettingTab(this.app, this));

		console.log("Scrapbook: plugin loaded successfully");
	}

	onunload(): void {
		console.log("Scrapbook: plugin unloaded");
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
