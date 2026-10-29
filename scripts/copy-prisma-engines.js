const fs = require("fs");
const path = require("path");

const srcDir = path.join(process.cwd(), "node_modules", ".prisma", "client");
const destDirs = [
  path.join(process.cwd(), ".next", "standalone", "node_modules", ".prisma", "client"),
  path.join(process.cwd(), ".next", "standalone", ".prisma", "client"),
];

if (fs.existsSync(srcDir)) {
  for (const destDir of destDirs) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    if (file.includes("query_engine") || file.endsWith(".wasm") || file.endsWith(".js") || file.endsWith(".d.ts")) {
      const srcFile = path.join(srcDir, file);
      if (fs.statSync(srcFile).isFile()) {
        for (const destDir of destDirs) {
          const destFile = path.join(destDir, file);
          fs.copyFileSync(srcFile, destFile);
        }
        console.log("Copied Prisma file to standalone:", file);
      }
    }
  }
} else {
  console.warn("Source directory for Prisma client does not exist:", srcDir);
}
