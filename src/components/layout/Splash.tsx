"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "nk-splash-seen";
const TOTAL_MS = 2600; // keep in sync with the CSS timeline in globals.css (.splash)

/**
 * Home-page loading screen: the Nükleon atom symbol, its orbits spinning around the nucleus, then the whole screen scrolls up and away.
 * Pure CSS timeline (so it can never get stuck if JS is slow), shown once per browser session.
 */
export default function Splash() {
  const pathname = usePathname();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    // decided once per page load (React runs effects twice in dev; client-side navigations back to "/" must not replay it)
    const w = window as unknown as { __nkSplashSeen?: boolean };
    if (w.__nkSplashSeen === undefined) {
      let seen = false;
      try {
        seen = sessionStorage.getItem(KEY) === "1";
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* storage blocked: just play it */
      }
      w.__nkSplashSeen = seen;
    }
    const t = setTimeout(() => {
      w.__nkSplashSeen = true;
      setGone(true);
    }, w.__nkSplashSeen ? 0 : TOTAL_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  if (pathname !== "/" || gone) return null;

  return (
    <>
      {/* runs before first paint on repeat visits so the splash never flashes */}
      <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem("${KEY}")==="1")document.documentElement.setAttribute("data-splash","seen")}catch(e){}` }} />
      <div className="splash" aria-hidden="true">
        <div className="splash-atom">
          <div className="splash-glow" />
          <Image src="/img/site/atom-orbits.png" alt="" width={380} height={380} priority className="splash-orbits" />
          <Image src="/img/site/atom-nucleus.png" alt="" width={96} height={96} priority className="splash-nucleus" />
        </div>
        <div className="splash-edge" />
      </div>
    </>
  );
}
