/**
 * settings.ts – Plugin settings tab for the Scrapbook plugin.
 *
 * Provides a UI in Obsidian's settings panel where users can configure
 * default values for border color, width, shadow, rotation range, textures,
 * tape decoration, caption font, and notebook background.
 */

import { App, PluginSettingTab, Setting } from "obsidian";
import type ScrapbookPlugin from "./main";

export class ScrapbookSettingTab extends PluginSettingTab {
	plugin: ScrapbookPlugin;

	constructor(app: App, plugin: ScrapbookPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Scrapbook Settings" });
		containerEl.createEl("p", {
			text: "Configure default appearance for scrapbook Polaroid cards.",
			cls: "setting-item-description",
		});

		// ── Appearance ──────────────────────────

		new Setting(containerEl)
			.setName("Default border color")
			.setDesc("Default Polaroid card border color (CSS color value).")
			.addText((text) =>
				text
					.setPlaceholder("#fffef5")
					.setValue(this.plugin.settings.defaultBorderColor)
					.onChange(async (value) => {
						this.plugin.settings.defaultBorderColor = value || "#fffef5";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Default width")
			.setDesc("Default card width (e.g. 260px, 45%).")
			.addText((text) =>
				text
					.setPlaceholder("260px")
					.setValue(this.plugin.settings.defaultWidth)
					.onChange(async (value) => {
						this.plugin.settings.defaultWidth = value || "260px";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Default shadow")
			.setDesc("Enable drop shadow on cards by default.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.defaultShadow)
					.onChange(async (value) => {
						this.plugin.settings.defaultShadow = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Random rotation range")
			.setDesc("Maximum random rotation angle in degrees (0–15). Used by the 'Randomize Rotations' command.")
			.addSlider((slider) =>
				slider
					.setLimits(0, 15, 1)
					.setValue(this.plugin.settings.randomRotationRange)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.randomRotationRange = value;
						await this.plugin.saveSettings();
					})
			);

		// ── Textures & Decorations ──────────────

		containerEl.createEl("h3", { text: "Textures & Decorations" });

		new Setting(containerEl)
			.setName("Paper texture")
			.setDesc("Show a subtle paper-grain texture on scrapbook containers.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enablePaperTexture)
					.onChange(async (value) => {
						this.plugin.settings.enablePaperTexture = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Tape decoration")
			.setDesc("Show decorative masking tape on Polaroid cards by default.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableTape)
					.onChange(async (value) => {
						this.plugin.settings.enableTape = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Notebook background")
			.setDesc("Show faint ruled lines behind the scrapbook container.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.notebookBackground)
					.onChange(async (value) => {
						this.plugin.settings.notebookBackground = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Transparent background")
			.setDesc("Remove the default background color and styling from the scrapbook container.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.removeContainerBackground)
					.onChange(async (value) => {
						this.plugin.settings.removeContainerBackground = value;
						await this.plugin.saveSettings();
					})
			);

		// ── Image Storage ────────────────────────

		containerEl.createEl("h3", { text: "Image Storage" });

		new Setting(containerEl)
			.setName("Image upload folder")
			.setDesc(
				"Folder where uploaded images are saved. " +
				"Default: .obsidian/plugins/scrapbook/.assets — " +
				"or use a vault folder like 'Scrapbook Assets' for wiki-link compatibility."
			)
			.addText((text) =>
				text
					.setPlaceholder(".obsidian/plugins/scrapbook/.assets")
					.setValue(this.plugin.settings.imageStoragePath)
					.onChange(async (value) => {
						this.plugin.settings.imageStoragePath =
							value || ".obsidian/plugins/scrapbook/.assets";
						await this.plugin.saveSettings();
					})
			);

		// ── Typography ──────────────────────────

		containerEl.createEl("h3", { text: "Typography" });

		new Setting(containerEl)
			.setName("Caption font")
			.setDesc("Font family for Polaroid captions (CSS font-family value).")
			.addText((text) =>
				text
					.setPlaceholder("'Caveat', cursive")
					.setValue(this.plugin.settings.captionFont)
					.onChange(async (value) => {
						this.plugin.settings.captionFont =
							value || "'Caveat', 'Segoe Print', 'Comic Sans MS', cursive";
						await this.plugin.saveSettings();
					})
			);
	}
}
