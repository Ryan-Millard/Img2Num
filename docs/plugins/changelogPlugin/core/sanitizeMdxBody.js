/**
 * Escape MDX-hostile characters in changelog bodies.
 * Braces become JSX expressions and stray `<` becomes a JSX tag open,
 * both of which crash SSG. Code spans/fences are left untouched.
 */
export default function sanitizeMdxBody(body) {
  return body
    .split(/(```[\s\S]*?```|`[^`\n]+`)/g)
    .map((seg, i) => {
      if (i % 2 === 1) return seg; // inside code — MDX already ignores these
      return seg
        .replace(/\\/g, "\\\\")
        .replace(/([{}])/g, "\\$1")
        .replace(/</g, "\\<");
    })
    .join("");
}
