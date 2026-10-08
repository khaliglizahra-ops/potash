"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x grid min-h-[60dvh] place-items-center py-20 text-center">
      <div>
        <h1 className="text-[clamp(30px,4vw,52px)] font-semibold tracking-tight">Bir şeyler ters gitti.</h1>
        <p className="mx-auto mt-4 max-w-md text-body">Sayfayı yenilemeyi deneyin. Sorun sürerse +90 312 395 66 13 numarasından bize ulaşın.</p>
        <button onClick={reset} className="btn btn-primary mt-8">Tekrar dene</button>
      </div>
    </div>
  );
}
