import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

async function loadAsDataUri(relativePath: string) {
  const filePath = path.join(process.cwd(), "public", relativePath);
  const buffer = await readFile(filePath);
  const ext = path.extname(filePath).slice(1) || "png";
  return `data:image/${ext};base64,${buffer.toString("base64")}`;
}

function Avatar({
  dress = false,
  hair = "#161218",
  skin = "#8f5d45",
  suit = "#f4f1ee"
}: {
  dress?: boolean;
  hair?: string;
  skin?: string;
  suit?: string;
}) {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        height: 250,
        justifyContent: "flex-end",
        position: "relative",
        width: 180
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.22)",
          borderRadius: "50%",
          bottom: 4,
          display: "flex",
          filter: "blur(8px)",
          height: 20,
          position: "absolute",
          width: 112
        }}
      />
      <div
        style={{
          alignItems: "center",
          background: skin,
          borderRadius: 999,
          display: "flex",
          height: 84,
          justifyContent: "center",
          marginBottom: -4,
          position: "relative",
          width: 84,
          zIndex: 3
        }}
      >
        <div
          style={{
            background: hair,
            borderRadius: dress ? 28 : 22,
            height: dress ? 64 : 54,
            left: dress ? 5 : 8,
            position: "absolute",
            top: dress ? 2 : 4,
            width: dress ? 74 : 68
          }}
        />
        <div
          style={{
            background: skin,
            borderRadius: 999,
            height: 54,
            position: "absolute",
            top: 18,
            width: 54
          }}
        />
        <div
          style={{
            background: "#23171c",
            borderRadius: 999,
            height: 8,
            left: 22,
            position: "absolute",
            top: 42,
            width: 8
          }}
        />
        <div
          style={{
            background: "#23171c",
            borderRadius: 999,
            height: 8,
            position: "absolute",
            right: 22,
            top: 42,
            width: 8
          }}
        />
        <div
          style={{
            borderBottom: "3px solid #6f2f34",
            borderRadius: 999,
            bottom: 12,
            height: 8,
            position: "absolute",
            width: 24
          }}
        />
      </div>
      <div
        style={{
          alignItems: "center",
          background: dress
            ? "linear-gradient(180deg, #18151b 0%, #050507 100%)"
            : `linear-gradient(180deg, ${suit} 0%, #e7dfd8 100%)`,
          borderRadius: dress ? "34px 34px 20px 20px" : "34px",
          display: "flex",
          height: dress ? 118 : 128,
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: dress ? 92 : 102,
          zIndex: 2
        }}
      >
        {!dress ? (
          <>
            <div
              style={{
                borderLeft: "13px solid transparent",
                borderRight: "13px solid transparent",
                borderTop: "20px solid #111116",
                left: 38,
                position: "absolute",
                top: 24
              }}
            />
            <div
              style={{
                background: "#111116",
                borderRadius: 999,
                height: 30,
                position: "absolute",
                top: 34,
                width: 12
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default async function OpenGraphImage() {
  const background = await loadAsDataUri("title-prologue/reference.png");

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#120d18",
          color: "#fff6eb",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%"
        }}
      >
        <div
          style={{
            backgroundImage: `url(${background})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            inset: 0,
            position: "absolute"
          }}
        />
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(17,12,22,0.22) 0%, rgba(17,12,22,0.42) 46%, rgba(17,12,22,0.84) 100%)",
            inset: 0,
            position: "absolute"
          }}
        />

        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            justifyContent: "center",
            padding: "54px 80px 42px",
            position: "relative",
            textAlign: "center",
            width: "100%"
          }}
        >
          <div
            style={{
              color: "#fff1de",
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1
            }}
          >
            Build-A-Date
          </div>
          <div
            style={{
              color: "#fff6eb",
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 0.96
            }}
          >
            Madison...
          </div>
          <div
            style={{
              color: "rgba(255,244,232,0.92)",
              display: "flex",
              flexDirection: "column",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: 28,
              gap: 10,
              lineHeight: 1.25,
              maxWidth: 700
            }}
          >
            <span>I know life stays busy, so I planned this with intention.</span>
            <span>Tap to step into a romantic Kansas City night with us.</span>
          </div>

          <div
            style={{
              alignItems: "center",
              background: "rgba(12,15,22,0.74)",
              border: "2px solid rgba(255,223,181,0.42)",
              borderRadius: 999,
              boxShadow: "0 14px 30px rgba(0,0,0,0.28)",
              color: "#f6d8a7",
              display: "flex",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 3,
              marginTop: 8,
              padding: "18px 42px",
              textTransform: "uppercase"
            }}
          >
            Begin the Night
          </div>

          <div
            style={{
              alignItems: "flex-end",
              display: "flex",
              gap: 18,
              justifyContent: "center",
              marginTop: 8
            }}
          >
            <Avatar hair="#101117" skin="#704531" suit="#f5f2ef" />
            <Avatar dress hair="#17131b" skin="#b67d59" />
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
