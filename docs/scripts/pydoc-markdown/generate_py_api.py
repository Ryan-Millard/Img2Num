#!/usr/bin/env python3
"""Generate per-function Python API reference pages for the Docusaurus site.

- One page per public function in img2num.api, plus an index page.
- Strips the @_inject_dimensions decorator and the injected width/height
  kwargs from signatures (they are not part of the public API).
- Converts numpy-style docstring sections (Parameters/Returns/...) into
  proper markdown lists.

Usage (from repo root):  uv run python docs/generate_py_api.py
Output:                  docs/docs/py/api-reference/
"""
from __future__ import annotations

import copy
import re
import shutil
from pathlib import Path

import docspec
from pydoc_markdown import PydocMarkdown
from pydoc_markdown.contrib.loaders.python import PythonLoader
from pydoc_markdown.contrib.processors.filter import FilterProcessor

REPO_ROOT = Path(__file__).resolve().parents[3]
OUT_DIR = REPO_ROOT / "docs" / "docs" / "py" / "api-reference"
HIDDEN_ARGS = {"width", "height"}  # injected by _inject_dimensions, not public API

_SECTION_UNDERLINE = re.compile(r"^\s*-{3,}\s*$")
_PARAM_LINE = re.compile(r"^(?P<name>\S[^:]*?)\s*:\s*(?P<type>.+)$")


def numpy_docstring_to_markdown(text: str) -> str:
    """Convert numpy-style sections into markdown headings + lists."""
    text = text.replace("``", "`")  # RST double backticks -> markdown
    lines = text.splitlines()
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Section header: a line whose next line is a ---- underline
        if i + 1 < len(lines) and line.strip() and _SECTION_UNDERLINE.match(lines[i + 1]):
            out.append(f"\n#### {line.strip()}\n")
            i += 2
            # Consume items: "name : type" (or bare type) + indented description
            while i < len(lines):
                item = lines[i]
                if not item.strip():
                    i += 1
                    continue
                if i + 1 < len(lines) and _SECTION_UNDERLINE.match(lines[i + 1]):
                    break  # next section header
                if item.startswith(" "):
                    # Indented description line -> append to previous bullet
                    if out and out[-1].startswith("- "):
                        out[-1] += " " + item.strip()
                    else:
                        out.append(item.strip())
                else:
                    m = _PARAM_LINE.match(item)
                    if m:
                        out.append(f"- **{m.group('name').strip()}** (`{m.group('type').strip()}`) —")
                    else:
                        out.append(f"- `{item.strip()}` —")
                i += 1
        else:
            out.append(line)
            i += 1
    # Tidy dangling em-dashes on items that had no description
    return "\n".join(s.rstrip(" —") if s.startswith("- ") and s.endswith("—") else s for s in out)


def summary(fn: docspec.Function) -> str:
    if not fn.docstring:
        return ""
    return fn.docstring.content.strip().splitlines()[0]


def main() -> None:
    session = PydocMarkdown()
    session.loaders = [
        PythonLoader(
            search_path=[str(REPO_ROOT / "packages" / "py")],
            modules=["img2num.api"],
        )
    ]
    session.processors = [
        FilterProcessor(expression="not name.startswith('_') and default()"),
    ]

    modules = session.load_modules()
    session.process(modules)
    api = modules[0]

    renderer = session.renderer  # default MarkdownRenderer
    renderer.render_module_header = False
    renderer.insert_header_anchors = False
    renderer.signature_with_decorators = False
    renderer.descriptive_class_title = False

    functions = [m for m in api.members if isinstance(m, docspec.Function)]

    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)

    summaries = {fn.name: summary(fn) for fn in functions}

    for position, fn in enumerate(functions, start=2):  # index.md is position 1
        # Strip injected-only kwargs from the rendered signature
        fn.args = [a for a in fn.args if a.name not in HIDDEN_ARGS]
        if fn.docstring:
            fn.docstring.content = numpy_docstring_to_markdown(fn.docstring.content)

        shell = copy.copy(api)
        shell.members = [fn]
        body = renderer.render_to_string([shell]).strip()

        # Drop the "#### function_name" heading; frontmatter title is the H1
        if body.startswith("#"):
            body = body.split("\n", 1)[1].lstrip()

        page = (
            "---\n"
            f"title: {fn.name}\n"
            f"sidebar_position: {position}\n"
            "---\n\n"
            f"{body}\n"
        )
        (OUT_DIR / f"{fn.name}.md").write_text(page)

    rows = "\n".join(
        f"| [`{fn.name}`](./{fn.name}) | {summaries[fn.name]} |" for fn in functions
    )
    index = (
        "---\n"
        "title: Python API Reference\n"
        "sidebar_position: 1\n"
        "---\n\n"
        "# Python API Reference\n\n"
        "Auto-generated from the docstrings in `packages/py/img2num/api.py`\n"
        "by `docs/generate_py_api.py` — do not edit these pages by hand.\n\n"
        "| Function | Description |\n"
        "| :--- | :--- |\n"
        f"{rows}\n"
    )
    (OUT_DIR / "index.md").write_text(index)

    print(f"Wrote {len(functions)} function pages + index to {OUT_DIR}")


if __name__ == "__main__":
    main()
