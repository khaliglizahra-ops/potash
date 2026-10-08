"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Rotate3d } from "lucide-react";
import ProductViewer from "@/components/viewer/ProductViewer";

interface Props {
  name: string;
  images: string[];
  modelUrl: string | null;
}

function ZoomImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <div
      className="relative h-full w-full cursor-zoom-in overflow-hidden"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onPointerLeave={() => setPos(null)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width:1024px) 56vw, 100vw"
        className="packshot object-contain p-[7%] transition-transform duration-200 ease-out"
        style={pos ? { transform: "scale(2.1)", transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
      />
    </div>
  );
}

export default function ProductMedia({ name, images, modelUrl }: Props) {
  const has3d = !!modelUrl;
  const [mode, setMode] = useState<"3d" | number>(has3d ? "3d" : 0);
  const box = useRef<HTMLDivElement>(null);

  // deep link: /urunler/slug#3d
  useEffect(() => {
    const sync = () => {
      if (location.hash === "#3d" && has3d) {
        setMode("3d");
        box.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    const open = () => {
      setMode("3d");
      box.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    window.addEventListener("open-3d", open);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("open-3d", open);
    };
  }, [has3d]);

  const stage = "h-[min(92vw,520px)] sm:h-[560px] lg:h-[620px]";
  const showThumbs = has3d || images.length > 1;

  return (
    <div ref={box} id="3d" className="scroll-mt-28">
      <div className={`relative overflow-hidden rounded-[18px] border border-line bg-[radial-gradient(ellipse_at_50%_35%,#fff_0%,#f3f4f5_70%,#eceef0_100%)] ${mode === "3d" ? "" : stage}`}>
        <AnimatePresence mode="wait" initial={false}>
          {mode === "3d" && modelUrl ? (
            <motion.div key="3d" initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <ProductViewer modelUrl={modelUrl} poster={images[0]} alt={`${name} 3D model`} priority className={`!rounded-none !border-0 ${stage}`} />
            </motion.div>
          ) : (
            <motion.div key={`img-${mode}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full w-full">
              <ZoomImage src={images[typeof mode === "number" ? mode : 0]} alt={`${name} – görsel ${typeof mode === "number" ? mode + 1 : 1}`} priority={!has3d} />
            </motion.div>
          )}
        </AnimatePresence>
        {mode !== "3d" && (
          <p className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-white/85 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-widest text-body backdrop-blur sm:block">Yakınlaştırmak için üzerine gelin</p>
        )}
      </div>

      {showThumbs && (
        <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {has3d && (
            <li>
              <button
                onClick={() => setMode("3d")}
                aria-label="3D modeli göster"
                aria-pressed={mode === "3d"}
                className={`grid h-[76px] w-[76px] place-items-center rounded-xl border bg-white text-center transition ${mode === "3d" ? "border-red text-red shadow-[0_0_0_3px_rgba(200,16,46,0.12)]" : "border-line text-ink hover:border-red"}`}
              >
                <span>
                  <Rotate3d size={22} className="mx-auto" />
                  <span className="mt-1 block font-mono text-[10px] font-semibold tracking-wider">360° 3D</span>
                </span>
              </button>
            </li>
          )}
          {images.map((src, i) => (
            <li key={src}>
              <button
                onClick={() => setMode(i)}
                aria-label={`Görsel ${i + 1}`}
                aria-pressed={mode === i}
                className={`relative block h-[76px] w-[76px] overflow-hidden rounded-xl border bg-gray-50 transition ${mode === i ? "border-red shadow-[0_0_0_3px_rgba(200,16,46,0.12)]" : "border-line hover:border-red"}`}
              >
                <Image src={src} alt="" fill sizes="76px" className="packshot object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
