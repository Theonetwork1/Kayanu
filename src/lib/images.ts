// Responsive images for the supplier photos hosted on alicdn: the CDN serves resized,
// recompressed copies when "_<w>x<h>q80.jpg" is appended (e.g. 390 kB → 20 kB at 480 px).
// Only these widths are really resized (320 is not), so the srcset sticks to them.
const WIDTHS = [480, 640, 960, 1200] as const;

const resized = (url: string, w: number) =>
  url.includes("alicdn.com") ? `${url}_${w}x${w}q80.jpg` : url;

/** src / srcSet / sizes props for an <img>; `sizes` describes the rendered width. */
export function responsiveImage(url: string, sizes: string) {
  if (!url.includes("alicdn.com")) return { src: url };
  return {
    src: resized(url, 960),
    srcSet: WIDTHS.map((w) => `${resized(url, w)} ${w}w`).join(", "),
    sizes,
  };
}

/** A single resized copy, e.g. for og:image or structured data. */
export const imageAt = (url: string, w: (typeof WIDTHS)[number]) => resized(url, w);
