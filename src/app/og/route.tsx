import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

// Rendered once at build time (reads public/logo.png from disk), then served statically.
export const dynamic = "force-static";

/** Default share image at /og. Product pages override it with their own first photo. */
export async function GET() {
  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E8004C 0%, #D4083F 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            left: -40,
            width: 260,
            height: 260,
            borderRadius: "0 100% 0 100%",
            background: "#5CC91A",
            opacity: 0.9,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -70,
            right: -40,
            width: 240,
            height: 240,
            borderRadius: "100% 0 100% 0",
            background: "#5CC91A",
            opacity: 0.8,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            background: "white",
            borderRadius: 32,
            padding: "36px 56px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={logoSrc} height={180} />
        </div>
        <div style={{ marginTop: 44, color: "white", fontSize: 40, fontWeight: 700, display: "flex" }}>
          Browse online · Order on WhatsApp
        </div>
      </div>
    ),
    size,
  );
}
