// Generated placeholder images for stories: flat SVG shapes as data URIs, so no story
// loads a remote image or shows a real person.

function svg(width: number, height: number, body: string) {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}

// A square avatar placeholder: two-tone background with a circle and a shape.
export function avatarImage(from: string, to: string) {
  return svg(
    64,
    64,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="22" cy="24" r="10" fill="#ffffff" fill-opacity="0.55"/><path d="M8 64 L32 34 L56 64 Z" fill="#ffffff" fill-opacity="0.35"/>`,
  );
}

// A wide cover placeholder: gradient with hills.
export const coverImage = svg(
  640,
  320,
  `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ba7c7"/><stop offset="1" stop-color="#d8e2ec"/></linearGradient></defs><rect width="640" height="320" fill="url(#g)"/><circle cx="500" cy="90" r="40" fill="#f5efe0"/><path d="M0 320 L0 220 Q160 140 320 220 T640 200 L640 320 Z" fill="#5f7f6a"/><path d="M0 320 L0 260 Q200 200 400 260 T640 250 L640 320 Z" fill="#46604f"/>`,
);

// A data URI that cannot decode, so the image fails and the fallback stays.
export const brokenImage = "data:image/png;base64,AAAA";
