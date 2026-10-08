"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Rotate3d } from "lucide-react";
import { useRef } from "react";

/** Hero device with pointer-driven parallax: photo tilts, glow and callouts drift at different depths. */
export default function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.6 });

  const rotY = useTransform(sx, [-1, 1], [-9, 9]);
  const rotX = useTransform(sy, [-1, 1], [6, -6]);
  const devX = useTransform(sx, [-1, 1], [-10, 10]);
  const glowX = useTransform(sx, [-1, 1], [28, -28]);
  const glowY = useTransform(sy, [-1, 1], [18, -18]);
  const tagX = useTransform(sx, [-1, 1], [-22, 22]);
  const tagY = useTransform(sy, [-1, 1], [-12, 12]);

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const tag = "absolute rounded-xl border border-line bg-white/90 px-3.5 py-2.5 shadow-[var(--shadow-soft)] backdrop-blur";

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className="relative mx-auto aspect-[4/5] w-full max-w-[560px]">
      {/* controlled red light */}
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY }}
        className="absolute left-1/2 top-[56%] h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,27,59,0.20),rgba(227,27,59,0.06)_55%,transparent_75%)] blur-2xl"
      />
      <div aria-hidden className="absolute inset-x-[8%] bottom-[5%] h-[7%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(23,23,23,0.28),transparent)] blur-md" />

      <motion.div style={{ rotateY: rotY, rotateX: rotX, x: devX, transformPerspective: 1400 }} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }} className="packshot absolute inset-0">
        <Image
          src="/img/products/Inkubator--NIN--resim-230.jpg"
          alt="Nükleon NIN-110 laboratuvar tipi inkübatör"
          fill
          priority
          sizes="(min-width:1024px) 540px, 90vw"
          className="object-contain"
        />
      </motion.div>

      <motion.div style={{ x: tagX, y: tagY }} className="absolute inset-0">
        <div className={`${tag} left-[-2%] top-[18%]`}>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-body">Hacim</p>
          <p className="text-[17px] font-semibold text-ink">110 L</p>
        </div>
        <div className={`${tag} right-[-3%] top-[38%]`}>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-body">Sıcaklık</p>
          <p className="text-[17px] font-semibold text-ink">25 – 80 °C</p>
        </div>
        <div className={`${tag} bottom-[16%] left-[2%]`}>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-body">Kontrol</p>
          <p className="text-[17px] font-semibold text-ink">PID · ±0,1 °C</p>
        </div>
      </motion.div>

      <Link
        href="/urunler/nin-110#3d"
        className="absolute bottom-[1%] left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-red px-5 py-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_14px_30px_-10px_rgba(200,16,46,0.8)] transition hover:bg-red-dark active:scale-95"
      >
        <Rotate3d size={15} /> NIN-110 · 360° 3D incele
      </Link>
    </div>
  );
}
