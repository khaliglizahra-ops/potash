import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface Base { label: string; error?: string; hint?: string; className?: string }

export const Input = forwardRef<HTMLInputElement, Base & InputHTMLAttributes<HTMLInputElement>>(function Input({ label, error, hint, className = "", id, ...rest }, ref) {
  const fid = id ?? `f-${rest.name}`;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">{label}{rest.required && <span className="text-red"> *</span>}</label>
      <input ref={ref} id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : undefined} className={`field ${error ? "!border-red" : ""}`} {...rest} />
      {hint && !error && <p className="mt-1.5 text-[12px] text-body/80">{hint}</p>}
      {error && <p id={`${fid}-e`} role="alert" className="mt-1.5 text-[12px] font-medium text-red">{error}</p>}
    </div>
  );
});

export function Textarea({ label, error, hint, className = "", id, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fid = id ?? `f-${rest.name}`;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">{label}{rest.required && <span className="text-red"> *</span>}</label>
      <textarea id={fid} rows={5} aria-invalid={!!error} className={`field ${error ? "!border-red" : ""}`} {...rest} />
      {hint && !error && <p className="mt-1.5 text-[12px] text-body/80">{hint}</p>}
      {error && <p role="alert" className="mt-1.5 text-[12px] font-medium text-red">{error}</p>}
    </div>
  );
}
