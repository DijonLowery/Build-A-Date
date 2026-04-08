import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 512,
  height: 512
};
export const contentType = "image/png";

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
        height: 220,
        justifyContent: "flex-end",
        position: "relative",
        width: 150
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.22)",
          borderRadius: "50%",
          bottom: 6,
          display: "flex",
          filter: "blur(8px)",
          height: 18,
          position: "absolute",
          width: 94
        }}
      />
      <div
        style={{
          alignItems: "center",
          background: skin,
          borderRadius: 999,
          display: "flex",
          height: 74,
          justifyContent: "center",
          marginBottom: -4,
          position: "relative",
          width: 74,
          zIndex: 3
        }}
      >
        <div
          style={{
            background: hair,
            borderRadius: dress ? 26 : 20,
            height: dress ? 58 : 48,
            left: dress ? 5 : 8,
            position: "absolute",
            top: dress ? 2 : 4,
            width: dress ? 64 : 58
          }}
        />
        <div
          style={{
            background: skin,
            borderRadius: 999,
            height: 48,
            position: "absolute",
            top: 16,
            width: 48
          }}
        />
        <div
          style={{
            background: "#23171c",
            borderRadius: 999,
            height: 7,
            left: 20,
            position: "absolute",
            top: 38,
            width: 7
          }}
        />
        <div
          style={{
            background: "#23171c",
            borderRadius: 999,
            height: 7,
            position: "absolute",
            right: 20,
            top: 38,
            width: 7
          }}
        />
        <div
          style={{
            borderBottom: "3px solid #6f2f34",
            borderRadius: 999,
            bottom: 12,
            height: 8,
            position: "absolute",
            width: 22
          }}
        />
      </div>
      <div
        style={{
          alignItems: "center",
          background: dress
            ? "linear-gradient(180deg, #18151b 0%, #050507 100%)"
            : `linear-gradient(180deg, ${suit} 0%, #e7dfd8 100%)`,
          borderRadius: dress ? "30px 30px 18px 18px" : "30px",
          display: "flex",
          height: dress ? 106 : 114,
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: dress ? 82 : 92,
          zIndex: 2
        }}
      >
        {!dress ? (
          <>
            <div
              style={{
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderTop: "18px solid #111116",
                left: 34,
                position: "absolute",
                top: 22
              }}
            />
            <div
              style={{
                background: "#111116",
                borderRadius: 999,
                height: 28,
                position: "absolute",
                top: 32,
                width: 10
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at top, rgba(255,215,173,0.22), transparent 40%), linear-gradient(180deg, #261c2a 0%, #120d18 100%)",
          borderRadius: 108,
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
            background: "rgba(255, 236, 210, 0.08)",
            border: "1px solid rgba(255, 226, 188, 0.18)",
            borderRadius: 999,
            bottom: 62,
            filter: "blur(2px)",
            height: 120,
            position: "absolute",
            width: 312
          }}
        />
        <div
          style={{
            alignItems: "flex-end",
            display: "flex",
            gap: 8,
            justifyContent: "center",
            position: "relative"
          }}
        >
          <Avatar hair="#101117" skin="#704531" suit="#f5f2ef" />
          <Avatar dress hair="#17131b" skin="#b67d59" />
        </div>
      </div>
    ),
    size
  );
}
