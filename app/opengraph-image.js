import { ImageResponse } from "next/og";
import { defaultSettings } from "@/lib/content";

/**
 * The picture that appears when someone pastes a link to this site into
 * Facebook, LinkedIn, Messenger, Zalo, Slack or iMessage.
 *
 * Without one of these, a shared link shows as a bare line of text — which is
 * exactly the wrong first impression when the person you sent it to is a
 * recruiter. Next.js renders this file to a 1200×630 PNG at build time, so it
 * costs nothing at runtime and there is no image file to keep in the repo.
 *
 * The text is deliberately taken from lib/content.js rather than from the
 * database: a preview card is fetched by Facebook's crawler, not by a visitor,
 * and it should render even if the database is unreachable. If the name or the
 * line ever changes for good, change it here too.
 */
export const alt = "Tran Thi Thuy Vy — Financial Technology Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { profile, home } = defaultSettings;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 84px",
          background: "linear-gradient(150deg, #0F2947 0%, #16365F 55%, #1D3E6B 100%)",
          color: "#FFFFFF",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* the small line at the top */}
        <div
          style={{
            display: "flex",
            fontSize: 21,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#8FBBF9",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          {profile.field} · Class of 2027
        </div>

        {/* the name, and the one line the whole site is built around */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, lineHeight: 1.04, letterSpacing: -1 }}>
            {profile.signature}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 36,
              lineHeight: 1.35,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.86)",
              maxWidth: 900,
            }}
          >
            {home.hook}
          </div>
        </div>

        {/* a rule, then the address — so the card is useful even as a screenshot */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, width: 150, background: "#8FBBF9" }} />
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 23,
              letterSpacing: 2,
              color: "rgba(255,255,255,0.72)",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            tranvy.vercel.app
          </div>
        </div>
      </div>
    ),
    size
  );
}
