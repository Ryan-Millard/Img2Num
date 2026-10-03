function openDetailsForHash(hash) {
  if (!hash) return;

  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;

  // Collect every enclosing <details>, outermost first, so nested ones open too
  const ancestors = [];
  for (let el = target.closest('details'); el; el = el.parentElement?.closest('details')) {
    ancestors.unshift(el);
  }

  for (const details of ancestors) {
    if (!details.open) {
      // Click the summary so Docusaurus's Details component updates its own state
      details.querySelector(':scope > summary')?.click();
    }
  }

  requestAnimationFrame(() => {
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 1.5*margin });
  });
}

export function onRouteDidUpdate({ location }) {
  openDetailsForHash(location.hash);
}
