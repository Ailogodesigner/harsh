const fs = require("fs");
const path = require("path");

const srcDir = path.join(process.cwd(), "node_modules", ".prisma", "client");
const destDirs = [
  path.join(process.cwd(), ".next", "standalone", "node_modules", ".prisma", "client"),
  path.join(process.cwd(), ".next", "standalone", ".prisma", "client"),
  path.join(process.cwd(), ".open-next", "server-functions", "default", "node_modules", ".prisma", "client"),
  path.join(process.cwd(), ".open-next", "server-functions", "default", ".prisma", "client"),
];

if (fs.existsSync(srcDir)) {
  for (const destDir of destDirs) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    if (fs.statSync(srcFile).isFile()) {
      for (const destDir of destDirs) {
        const destFile = path.join(destDir, file);
        try {
          fs.copyFileSync(srcFile, destFile);
        } catch (e) {
          // ignore copy error if dir not ready yet
        }
      }
    }
  }
  console.log("Successfully ensured Prisma client & engines in all standalone & OpenNext bundles.");
} else {
  console.warn("Source directory for Prisma client does not exist:", srcDir);
}
