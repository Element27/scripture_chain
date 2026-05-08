import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Scripture Chain - A verse from the chain";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const text = "For God so loved the world, that he gave his one and only Son...";
  const reference = "John 3:16";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a0f0a 0%, #261610 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "40px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#c9933a">
            <path d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z" />
          </svg>
          <span
            style={{
              color: "#e8b86d",
              fontSize: "18px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "system-ui",
            }}
          >
            Scripture Chain
          </span>
        </div>

        <div
          style={{
            background: "#261610",
            border: "1px solid rgba(201, 147, 58, 0.2)",
            borderRadius: "16px",
            padding: "48px",
            maxWidth: "900px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "rgba(201, 147, 58, 0.4)",
              fontSize: "72px",
              fontFamily: "Georgia, serif",
              lineHeight: 0.8,
            }}
          >
            "
          </span>
          <p
            style={{
              color: "#f5e6c8",
              fontSize: "36px",
              lineHeight: "1.5",
              fontFamily: "Georgia, serif",
              marginTop: "16px",
            }}
          >
            {text}
          </p>
          <p
            style={{
              color: "#e8b86d",
              fontSize: "20px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginTop: "24px",
              fontFamily: "system-ui",
            }}
          >
            {reference}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}