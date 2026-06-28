/**
 * @fileoverview File Manager for the Bookmark Manager.
 * @description Encapsulates all Obsidian Vault file-system operations.
 * This module is the only place that directly touches the vault adapter.
 *
 * Responsibilities:
 *   - Creating folders
 *   - Creating files
 *   - Reading file contents
 *   - Writing / overwriting file contents
 *   - Replacing sections within a file
 *   - Appending to a file
 *
 * Nothing else (no markdown, no API, no sorting) belongs here.
 * @module fileManager
 */

const logger = require('./logger');

/**
 * Create a FileManager bound to a specific Obsidian App instance.
 *
 * @param {object} app - The Obsidian `app` object provided by QuickAdd.
 * @returns {object} FileManager API.
 */
function createFileManager(app) {
    const vault = app.vault;

    return {
        /**
         * Ensure a folder exists, creating it (and parents) if necessary.
         * @param {string} folderPath - Vault-relative folder path.
         */
        async ensureFolder(folderPath) {
            const existing = vault.getAbstractFileByPath(folderPath);
            if (existing) return;

            logger.file('CREATE FOLDER', folderPath);
            await vault.createFolder(folderPath);
        },

        /**
         * Check whether a file exists in the vault.
         * @param {string} filePath - Vault-relative file path.
         * @returns {boolean}
         */
        fileExists(filePath) {
            return vault.getAbstractFileByPath(filePath) != null;
        },

        /**
         * Read the full contents of a file.
         * @param {string} filePath - Vault-relative file path.
         * @returns {Promise<string>} File contents.
         * @throws {Error} If the file does not exist.
         */
        async readFile(filePath) {
            const file = vault.getAbstractFileByPath(filePath);
            if (!file) {
                throw new Error(`File not found: ${filePath}`);
            }
            logger.file('READ', filePath);
            return await vault.read(file);
        },

        /**
         * Write content to a file, creating it if it does not exist,
         * or overwriting it entirely if it does.
         * @param {string} filePath - Vault-relative file path.
         * @param {string} content  - Full file content.
         */
        async writeFile(filePath, content) {
            const file = vault.getAbstractFileByPath(filePath);
            if (file) {
                logger.file('WRITE', filePath);
                await vault.modify(file, content);
            } else {
                logger.file('CREATE', filePath);
                await vault.create(filePath, content);
            }
        },

        /**
         * Append content to the end of an existing file.
         * If the file does not exist it is created with the given content.
         * @param {string} filePath - Vault-relative file path.
         * @param {string} content  - Content to append.
         */
        async appendToFile(filePath, content) {
            const file = vault.getAbstractFileByPath(filePath);
            if (file) {
                logger.file('APPEND', filePath);
                const existing = await vault.read(file);
                const separator = existing.endsWith('\n') ? '\n' : '\n\n';
                await vault.modify(file, existing + separator + content);
            } else {
                logger.file('CREATE (append)', filePath);
                await vault.create(filePath, content);
            }
        },

        /**
         * Replace a specific substring within a file's content.
         * @param {string} filePath   - Vault-relative file path.
         * @param {string} oldContent - Exact substring to find.
         * @param {string} newContent - Replacement substring.
         * @returns {Promise<boolean>} True if a replacement was made.
         */
        async replaceInFile(filePath, oldContent, newContent) {
            const file = vault.getAbstractFileByPath(filePath);
            if (!file) {
                throw new Error(`File not found: ${filePath}`);
            }

            const existing = await vault.read(file);
            if (!existing.includes(oldContent)) {
                logger.debug(`Replace target not found in ${filePath}`);
                return false;
            }

            logger.file('REPLACE', filePath);
            const updated = existing.replace(oldContent, newContent);
            await vault.modify(file, updated);
            return true;
        },

        /**
         * Get a TFile reference for a vault-relative path.
         * @param {string} filePath - Vault-relative file path.
         * @returns {object|null} Obsidian TFile or null.
         */
        getFile(filePath) {
            return vault.getAbstractFileByPath(filePath);
        },
    };
}

module.exports = { createFileManager };
