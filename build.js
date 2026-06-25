const esbuild = require("esbuild");

esbuild.build({
    // Entry file
    entryPoints: ["Scripts/BookmarkManager/addBookmark.js"],

    // Bundle everything into one file
    bundle: true,

    // QuickAdd runs in Electron/Node
    platform: "node",
    format: "cjs",
    target: "node18",

    // 👇 THIS IS THE OUTPUT FILE
    outfile: "Scripts/addBookmark.bundle.js",

    sourcemap: false,
    minify: false,

    external: ["obsidian"]
}).then(() => {
    console.log("✅ Bundle created successfully.");
}).catch((err) => {
    console.error(err);
    process.exit(1);
});