import { notFound } from "next/navigation";
import { readdirSync } from "node:fs";
import Gallery from "./Gallery";

/** Dev-only contact sheet: every GLB in one WebGL canvas. */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  const names = readdirSync("public/models").filter((f) => f.endsWith(".glb")).map((f) => f.slice(0, -4)).sort();
  return <Gallery names={names} />;
}
