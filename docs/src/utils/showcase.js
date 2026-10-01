/** Check that a link uses HTTP or HTTPS. */
export function isWebUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Require an image stored under the site's showcase asset directory. */
function isLocalImage(value) {
  return typeof value === "string" && /^\/img\/showcase\/(?:[\w-]+\/)*[\w-]+\.(png|jpe?g|webp|svg)$/i.test(value);
}

/** Fail early with an actionable error instead of rendering incomplete cards. */
export function validateShowcaseProjects(projects) {
  if (!Array.isArray(projects)) throw new Error("Showcase projects must be an array.");
  const names = new Set();
  for (const [index, project] of projects.entries()) {
    const fail = (field) => {
      throw new Error(`Showcase project ${index + 1}: invalid or missing ${field}.`);
    };
    if (!project || typeof project !== "object" || Array.isArray(project)) fail("project object");
    for (const field of ["name", "description", "binding"]) {
      if (typeof project[field] !== "string" || !project[field].trim()) fail(field);
    }
    if (names.has(project.name.trim())) fail("unique name");
    names.add(project.name.trim());
    if (!isWebUrl(project.liveUrl)) fail("liveUrl (HTTP/HTTPS URL)");
    if (!isLocalImage(project.screenshot)) fail("screenshot (local /img/showcase/ image)");
    if (project.logo !== undefined && !isLocalImage(project.logo)) fail("logo (local /img/showcase/ image)");
    if (project.sourceUrl !== undefined && !isWebUrl(project.sourceUrl)) fail("sourceUrl (HTTP/HTTPS URL)");
    if (project.links !== undefined) {
      if (!Array.isArray(project.links)) fail("links array");
      for (const link of project.links) {
        if (!link || typeof link.label !== "string" || !link.label.trim() || !isWebUrl(link.url)) fail("link label and HTTP/HTTPS URL");
      }
    }
  }
  return projects;
}

/** Build a prefilled Showcase discussion; images are attached on GitHub. */
export function createShowcaseDiscussionUrl(formData) {
  const value = (name) => String(formData.get(name) ?? "").trim();
  for (const field of ["project_name", "description", "binding"]) {
    if (!value(field)) throw new Error("Enter a project name, description, and binding.");
  }
  if (!isWebUrl(value("project_url")) || (value("repository_url") && !isWebUrl(value("repository_url")))) {
    throw new Error("Use an HTTP or HTTPS URL for the project and source repository.");
  }
  const binding = value("binding") === "Other" ? value("other_binding") : value("binding");
  if (!binding) throw new Error("Specify the language or binding used.");
  if (!formData.get("criteria")) throw new Error("Confirm that the project meets the listing criteria.");
  const body = [
    "### Project name",
    value("project_name"),
    "### Live project URL",
    value("project_url"),
    "### Source repository",
    value("repository_url") || "Not provided",
    "### Description",
    value("description"),
    "### Img2Num binding used",
    binding,
    "### Additional links",
    value("additional_links") || "None",
    "### Screenshot",
    "Attach a screenshot here before posting (recommended: 1200 × 675 px, 16:9). Maintainers will store accepted images in the repository.",
    "### Logo (optional)",
    "Attach a square project logo here, or leave this section empty to use the default code icon.",
    "### Listing criteria",
    "I confirm that this project uses Img2Num, is publicly reachable, and is not unlawful, NSFW, or spammy. I understand that maintainers may decline or remove entries at their discretion.",
  ].join("\n\n");
  const params = new URLSearchParams({ category: "showcase", title: `[Showcase]: ${value("project_name")}`, body });
  const url = `https://github.com/Ryan-Millard/Img2Num/discussions/new?${params}`;
  if (url.length > 8000) throw new Error("This submission is too long to open as a pre-filled GitHub discussion. Shorten the description or URLs and try again.");
  return url;
}
