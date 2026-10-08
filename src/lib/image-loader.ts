/** Static export has no image optimizer: serve files as they are (prepare-demo downsizes the big ones), honouring the basePath. */
export default function loader({ src }: { src: string; width: number; quality?: number }) {
  return src.startsWith("/") ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}` : src;
}
