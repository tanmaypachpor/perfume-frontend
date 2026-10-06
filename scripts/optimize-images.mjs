import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(projectRoot, "src", "assets", "images");
const outputDirectory = path.join(sourceDirectory, "optimized");
const sources = [
  "dakhoonimages.png",
  "gifts.png",
  "attar.png",
  "perfume.png",
  "Banner02.jpg",
  "story2.jpg",
];

await mkdir(outputDirectory, { recursive: true });

for (const sourceName of sources) {
  const sourcePath = path.join(sourceDirectory, sourceName);
  const outputName = `${path.parse(sourceName).name}.webp`;
  const outputPath = path.join(outputDirectory, outputName);

  await sharp(sourcePath)
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath);

  const [source, optimized] = await Promise.all([
    stat(sourcePath),
    stat(outputPath),
  ]);
  const reduction = ((1 - optimized.size / source.size) * 100).toFixed(1);
  console.log(
    `${sourceName}: ${(source.size / 1024).toFixed(0)} KB -> ${(optimized.size / 1024).toFixed(0)} KB (${reduction}% smaller)`
  );
}
