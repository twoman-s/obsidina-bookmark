const esbuild = require("esbuild");

const target = process.argv[2];

if (!target || (target !== 'bookmark' && target !== 'bucketlist')) {
    console.error("❌ Please specify a valid target: 'bookmark' or 'bucketlist'");
    console.log("Usage: node build.js <target>");
    process.exit(1);
}

const entryPoint = target === 'bookmark' 
    ? "Scripts/BookmarkManager/addBookmark.js" 
    : "Scripts/BucketlistManager/addBucketlist.js";

const outFile = target === 'bookmark'
    ? "Scripts/addBookmark.bundle.js"
    : "Scripts/addBucketlist.bundle.js";

esbuild.build({
    // Entry file
    entryPoints: [entryPoint],

    // Bundle everything into one file
    bundle: true,

    // QuickAdd runs in Electron/Node
    platform: "node",
    format: "cjs",
    target: "node18",

    // 👇 THIS IS THE OUTPUT FILE
    outfile: outFile,

    sourcemap: false,
    minify: false,

    external: ["obsidian"]
}).then(() => {
    console.log(`✅ Bundle for '${target}' created successfully at ${outFile}`);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});