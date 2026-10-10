// Generates favicon / app icons from the logo.
//   npm run icons
// Source priority: public/logo-mark.png (square mark) → public/logo.png.
// If public/logo.png does not exist, a placeholder LYCHEE logo is created first.
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const app = join(root, "src", "app");
mkdirSync(join(pub, "icons"), { recursive: true });

const fruit = (cx, cy, r) => `
  <g>
    <path d="M${cx - r * 0.15} ${cy - r * 0.95} C ${cx - r * 1.1} ${cy - r * 1.9}, ${cx - r * 1.9} ${cy - r * 1.1}, ${cx - r * 1.55} ${cy - r * 0.55} C ${cx - r * 1.0} ${cy - r * 0.75}, ${cx - r * 0.55} ${cy - r * 0.8}, ${cx - r * 0.15} ${cy - r * 0.95} Z" fill="#5CC91A"/>
    <path d="M${cx + r * 0.1} ${cy - r * 0.95} C ${cx + r * 0.6} ${cy - r * 2.0}, ${cx + r * 1.6} ${cy - r * 1.7}, ${cx + r * 1.5} ${cy - r * 1.0} C ${cx + r * 1.0} ${cy - r * 0.85}, ${cx + r * 0.5} ${cy - r * 0.85}, ${cx + r * 0.1} ${cy - r * 0.95} Z" fill="#4BB012"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#g)"/>
    ${Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const rr = i % 2 ? r * 0.55 : r * 0.78;
      return `<circle cx="${cx + Math.cos(a) * rr}" cy="${cy + Math.sin(a) * rr}" r="${r * 0.09}" fill="#FF4F86" opacity="0.55"/>`;
    }).join("")}
    <ellipse cx="${cx - r * 0.35}" cy="${cy - r * 0.4}" rx="${r * 0.22}" ry="${r * 0.13}" fill="#fff" opacity="0.45" transform="rotate(-30 ${cx - r * 0.35} ${cy - r * 0.4})"/>
  </g>`;

const defs = `<defs><radialGradient id="g" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#FF2E6E"/><stop offset="100%" stop-color="#D4083F"/></radialGradient></defs>`;

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240" viewBox="0 0 720 240">
  ${defs}
  ${fruit(120, 140, 70)}
  <text x="225" y="150" font-family="Rockwell, 'Roboto Slab', 'Zilla Slab', Georgia, serif" font-weight="800" font-size="104" fill="#E8004C" letter-spacing="4">LYCHEE</text>
  <text x="230" y="200" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#1A1A1A" letter-spacing="2">Fashion for Kids and Ladies</text>
</svg>`;

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${defs}
  ${fruit(256, 300, 150)}
</svg>`;

const logoPath = join(pub, "logo.png");
const markPath = join(pub, "logo-mark.png");

if (!existsSync(logoPath)) {
  await sharp(Buffer.from(logoSvg)).png().toFile(logoPath);
  await sharp(Buffer.from(markSvg)).png().toFile(markPath);
  console.log("Created placeholder public/logo.png and public/logo-mark.png — replace with the real logo and re-run.");
}

const source = existsSync(markPath) ? markPath : logoPath;
const white = { r: 255, g: 255, b: 255, alpha: 1 };

async function square(size, out, { padding = 0.08, background = white } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const img = await sharp(source).resize(inner, inner, { fit: "contain", background: { ...white, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: img, gravity: "center" }])
    .png()
    .toFile(out);
  console.log("✓", out.replace(root, "."));
}

await square(512, join(app, "icon.png"), { background: { r: 0, g: 0, b: 0, alpha: 0 } });
await square(180, join(app, "apple-icon.png"));
await square(192, join(pub, "icons", "icon-192.png"));
await square(512, join(pub, "icons", "icon-512.png"));
await square(512, join(pub, "icons", "maskable-512.png"), { padding: 0.2 });
