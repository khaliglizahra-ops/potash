"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Minus, Plus, RotateCcw, Rotate3d } from "lucide-react";
import type { SceneHandle } from "./ModelScene";

const ModelScene = dynamic(() => import("./ModelScene").then((m) => m.ModelScene), { ssr: false });

interface Props {
  modelUrl: string;
  poster: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export default function ProductViewer({ modelUrl, poster, alt, priority, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const scene = useRef<SceneHandle>(null);
  const [armed, setArmed] = useState(false); // canvas mounted
  const [ready, setReady] = useState(false);
  const [auto, setAuto] = useState(true);
  const [full, setFull] = useState(false);
  const [hint, setHint] = useState(true);

  // Lazy-load: mount the canvas only once the viewer is near the viewport and the browser is idle.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          const go = () => setArmed(true);
          if ("requestIdleCallback" in window) window.requestIdleCallback(go, { timeout: 800 });
          else setTimeout(go, 200);
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Fullscreen: native API where available, plus a CSS overlay (iOS Safari has no element fullscreen).
  const toggleFull = useCallback(() => {
    setFull((f) => {
      const next = !f;
      document.body.classList.toggle("lock-scroll", next);
      if (next && wrap.current?.requestFullscreen) wrap.current.requestFullscreen().catch(() => {});
      if (!next && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      return next;
    });
  }, []);

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) {
        setFull(false);
        document.body.classList.remove("lock-scroll");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && full) toggleFull();
    };
    document.addEventListener("fullscreenchange", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, [full, toggleFull]);

  useEffect(() => () => document.body.classList.remove("lock-scroll"), []);

  const onReady = useCallback(() => setReady(true), []);
  const onInteract = useCallback(() => {
    setAuto(false);
    setHint(false);
  }, []);

  const tool =
    "grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-ink transition hover:bg-red hover:text-white active:scale-95";

  return (
    <div
      ref={wrap}
      data-viewer
      className={`relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#fff_0%,#f3f4f5_62%,#e9ebed_100%)] ${
        full ? "fixed inset-0 z-[100]" : "rounded-[18px] border border-line"
      } ${className}`}
    >
      {/* poster: LCP element, no-JS state and loading state */}
      <AnimatePresence>
        {!ready && (
          <motion.div key="poster" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Image src={poster} alt={alt} fill sizes="(min-width:1024px) 56vw, 100vw" priority={priority} className="packshot object-contain p-[8%]" />
            <div className="absolute inset-x-0 bottom-20 grid place-items-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ink shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />
                3D model yükleniyor
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {armed && (
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.6 }}>
          <ModelScene ref={scene} url={modelUrl} autoRotate={auto} onReady={onReady} onInteract={onInteract} />
        </motion.div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
        <span className="rounded-lg bg-red px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-white">3D</span>
        <span className="rounded-lg bg-white/90 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-ink">360°</span>
      </div>

      <AnimatePresence>
        {hint && ready && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 top-16 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-body"
          >
            <span className="hidden sm:inline">Sürükleyin · Kaydırarak yakınlaştırın</span>
            <span className="sm:hidden">Döndürmek için sürükleyin</span>
          </motion.p>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center px-3">
        <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-white/80 p-1.5 shadow-[var(--shadow-soft)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            aria-pressed={auto}
            aria-label="360 derece otomatik döndür"
            className={`flex h-10 items-center gap-2 rounded-xl px-3.5 font-mono text-[12px] font-semibold tracking-wider transition active:scale-95 ${
              auto ? "bg-red text-white" : "bg-white/90 text-ink hover:bg-red hover:text-white"
            }`}
          >
            <Rotate3d size={16} /> 360°
          </button>
          <button type="button" className={tool} aria-label="Uzaklaştır" onClick={() => scene.current?.zoom(1.2)}>
            <Minus size={16} />
          </button>
          <button type="button" className={tool} aria-label="Yakınlaştır" onClick={() => scene.current?.zoom(0.8)}>
            <Plus size={16} />
          </button>
          <button
            type="button"
            className={tool}
            aria-label="Görünümü sıfırla"
            onClick={() => {
              scene.current?.reset();
              setAuto(true);
            }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={toggleFull}
            aria-label={full ? "Tam ekrandan çık" : "Tam ekran"}
            className="flex h-10 items-center gap-2 rounded-xl bg-ink px-3.5 font-mono text-[12px] font-semibold tracking-wider text-white transition hover:bg-red active:scale-95"
          >
            {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span className="hidden sm:inline">{full ? "KAPAT" : "FULLSCREEN"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
