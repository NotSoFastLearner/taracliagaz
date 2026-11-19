import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const srcPath = path.resolve("src/api/uploadApi.ts");
const code = fs.readFileSync(srcPath, "utf8").replace(/^import\s+.*from\s+["']\.\/http["'];\r?\n/m, "");
const { outputText } = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

const moduleObj = { exports: {} };
const posted = [];
const http = {
    post: async (p, body) => {
        posted.push({ p, body });
        return { url: "/uploads/images/ok.webp", filename: "ok.webp", size: 10 };
    },
};

vm.runInNewContext(outputText, {
    module: moduleObj,
    exports: moduleObj.exports,
    File,
    Blob,
    FormData,
    Set,
    Math,
    Promise,
    http,
    createImageBitmap: globalThis.createImageBitmap,
    document: globalThis.document,
});

const { getTargetDimensions, replaceImageExtension, compressImage, uploadImage } = moduleObj.exports;

// 1. Dimensions: upscale prevented, long edge capped at 2000px keeping aspect ratio
const norm = (o) => ({ width: o.width, height: o.height });
assert.deepEqual(norm(getTargetDimensions(1200, 800)), { width: 1200, height: 800 });
assert.deepEqual(norm(getTargetDimensions(4000, 3000)), { width: 2000, height: 1500 });
assert.deepEqual(norm(getTargetDimensions(2500, 5000)), { width: 1000, height: 2000 });

// 2. Filename extension matches output MIME
assert.equal(replaceImageExtension("scan.2026.PNG", "image/webp"), "scan.2026.webp");
assert.equal(replaceImageExtension("photo.heic", "image/jpeg"), "photo.jpg");
assert.equal(replaceImageExtension("noext", "image/webp"), "noext.webp");

// 3. Animated GIF passes through untouched
const gif = new File([new Uint8Array(5000)], "anim.gif", { type: "image/gif" });
assert.equal(await compressImage(gif), gif);

// 4. WebP canvas compression shrinks file and preserves extension, plus keeps smaller original
let forceWebpMime = "image/webp";
let nextBlobSize = 120;
let closedCount = 0;
const ctxStub = { drawImage() {}, fillRect() {}, globalCompositeOperation: "", fillStyle: "" };
const canvasStub = {
    width: 0,
    height: 0,
    getContext: () => ctxStub,
    toBlob: (cb, mime) => cb(new Blob([new Uint8Array(nextBlobSize)], { type: mime === "image/webp" ? forceWebpMime : mime })),
};
vm.runInNewContext(outputText, {
    module: moduleObj,
    exports: moduleObj.exports,
    File,
    Blob,
    FormData,
    Set,
    Math,
    Promise,
    http,
    createImageBitmap: async () => ({ width: 4000, height: 2000, close: () => { closedCount++; } }),
    document: { createElement: () => canvasStub },
});

const c2 = moduleObj.exports;
const bigJpg = new File([new Uint8Array(5000)], "camera.JPG", { type: "image/jpeg" });
const outWebp = await c2.compressImage(bigJpg);
assert.equal(canvasStub.width, 2000);
assert.equal(canvasStub.height, 1000);
assert.equal(outWebp.name, "camera.webp");
assert.equal(outWebp.type, "image/webp");
assert.equal(outWebp.size, 120);
assert.equal(closedCount, 1);

// 5. Fallback to JPEG if browser falls back to image/png on WebP request
forceWebpMime = "image/png";
nextBlobSize = 150;
const bigPng = new File([new Uint8Array(5000)], "doc.png", { type: "image/png" });
const outJpg = await c2.compressImage(bigPng);
assert.equal(outJpg.name, "doc.jpg");
assert.equal(outJpg.type, "image/jpeg");

// 6. Native image kept if compressed isn't smaller; non-native (.bmp) still converted
forceWebpMime = "image/webp";
nextBlobSize = 8000;
assert.equal(await c2.compressImage(bigJpg), bigJpg);
const bmp = new File([new Uint8Array(200)], "scan.bmp", { type: "image/bmp" });
const outBmp = await c2.compressImage(bmp);
assert.equal(outBmp.name, "scan.webp");

// 7. uploadImage posts compressed File in FormData
nextBlobSize = 100;
await c2.uploadImage(bigJpg);
assert.equal(posted.length, 1);
assert.equal(posted[0].p, "/uploads/image");
assert.equal(posted[0].body.get("file").name, "camera.webp");

console.log("uploadApi compression checks OK");
