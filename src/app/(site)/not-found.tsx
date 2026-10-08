import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60dvh] place-items-center py-20 text-center">
      <div>
        <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-red">404</p>
        <h1 className="mt-4 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-tight">Aradığınız sayfa bulunamadı.</h1>
        <p className="mx-auto mt-5 max-w-md text-body">Adres değişmiş ya da ürün kataloğdan kaldırılmış olabilir.</p>
        <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn btn-primary">Ana sayfa</Link><Link href="/urunler" className="btn btn-ghost">Ürünler</Link></div>
      </div>
    </div>
  );
}
