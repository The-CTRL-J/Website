import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const websiteRoot = resolve(rootDir, "../website/src");
const websitePublic = resolve(rootDir, "../website/public");
const websiteDist = resolve(rootDir, "../website/dist");

export default defineConfig(({ command }) => ({
  root: websiteRoot,
  publicDir: websitePublic,
  base: command === "build" ? "/Website/" : "/",
  build: {
    outDir: websiteDist,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(rootDir, "../website/src/index.html"),
        resources: resolve(rootDir, "../website/src/resources/index.html"),
        credit: resolve(rootDir, "../website/src/credit/index.html"),
        ninconvert: resolve(rootDir, "../website/src/ninconvert/index.html"),
        placeholder: resolve(rootDir, "../website/src/placeholder/index.html")
      }
    }
  }
}));
