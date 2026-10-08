import { notFound } from "next/navigation";
import RenderShot from "./RenderShot";

/** Dev-only: renders a GLB on a transparent background and saves it as /img/renders/<name>.png */
export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { m = "nsf-60" } = await searchParams;
  return <RenderShot name={m} />;
}
