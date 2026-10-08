import Image from "next/image";

/** Nükleon corporate logo (kurumsal kimlik, "Laboratuvar Cihazları" lock-up). On dark backgrounds it sits on a white chip. */
export function LogoWordmark({ tone = "dark", size = "md" }: { tone?: "dark" | "light"; size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-11" : size === "sm" ? "h-8" : "h-11 sm:h-[60px]";
  const logo = (
    <Image src="/img/site/nukleon-logo.png" alt="Nükleon Laboratuvar Cihazları" width={908} height={302} priority={size === "md"} className={`${h} w-auto max-w-none`} />
  );
  if (tone === "light") return <span className="inline-block rounded-lg bg-white px-3 py-2">{logo}</span>;
  return logo;
}
