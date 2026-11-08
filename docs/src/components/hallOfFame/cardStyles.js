/** Shared looks for the Hall of Fame and the contributor event pages. */

export const cardBase = {
  backgroundColor: "var(--ifm-card-background-color)",
  border: "1px solid var(--ifm-toc-border-color)",
  borderRadius: "12px",
  boxShadow: "var(--ifm-global-shadow-lw)",
};

export const sectionHeadingStyle = {
  fontSize: "1.75rem",
  borderBottom: "2px solid var(--ifm-toc-border-color)",
  paddingBottom: "0.5rem",
  marginBottom: "1.5rem",
};

export const pageMainStyle = {
  // Docusaurus renders pages inside a flex column wrapper. Without an
  // explicit width, `margin: auto` makes <main> shrink to its content
  // instead of filling the screen.
  width: "100%",
  boxSizing: "border-box",
  padding: "3rem clamp(1rem, 4vw, 4rem)",
  maxWidth: "2400px", // use wide screens instead of a narrow column
  margin: "0 auto",
};
