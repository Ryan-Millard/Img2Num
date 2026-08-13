#!/usr/bin/env python3
"""Generate the Python API reference for the Docusaurus site, grouped into folders
by kind.

Layout:
    api-reference/
        index.md                    overview page with one table per kind
        functions/_category_.json
        functions/<name>.md         one page per public function in img2num.api
        classes/_category_.json
        classes/<name>.md           one page per public class, including native
                                    classes documented via _img2num.pyi

Markdown is rendered directly from the docspec tree (not pydoc-markdown's
MarkdownRenderer) so pages use Docusaurus-native constructs: parameter and
property tables, admonitions for Notes/Warnings/See Also, and titled
signature code blocks.

Native (compiled) members such as ImageToSvgConfig cannot be seen by the
source-based PythonLoader, so they are documented via the stub file
packages/py/img2num/_img2num.pyi, which this script regenerates automatically
(with pybind11-stubgen) from the *installed* extension before every run.

NOTE: uv does not rebuild the wheel when only C++ sources change, so after
editing bindings run `uv sync --reinstall-package img2num` first — otherwise
the stub (and therefore the docs) reflect the previously installed bindings.

Usage:      ./img2num sh
            uv run python docs/scripts/pydoc-markdown/generate_py_api.py
Output:     docs/docs/py/api-reference/
"""
from __future__ import annotations

import json
import logging
import re
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

import docspec
import docspec_python
from pybind11_stubgen import Printer, Writer, arg_parser, run, stub_parser_from_args
from pydoc_markdown import PydocMarkdown
from pydoc_markdown.contrib.loaders.python import PythonLoader
from pydoc_markdown.contrib.processors.filter import FilterProcessor

REPO_ROOT = Path(__file__).resolve().parents[3]
PKG_DIR = REPO_ROOT / "packages" / "py"
OUT_DIR = REPO_ROOT / "docs" / "docs" / "py" / "api-reference"
NATIVE_STUB = PKG_DIR / "img2num" / "_img2num.pyi"

HIDDEN_ARGS = {"width", "height"}  # injected by _inject_dimensions, not public API

# Native names re-exported through img2num.api that should appear in the docs.
NATIVE_EXPORTS = {"ImageToSvgConfig"}

# (sidebar label, output subdirectory, docspec type), in sidebar order.
KINDS = [
    ("Functions", "functions", docspec.Function),
    ("Classes", "classes", docspec.Class),
]

# Site-wide keywords prepended to every page's keyword list.
BASE_KEYWORDS = ["img2num", "python", "api", "svg", "image vectorization"]

_SECTION_UNDERLINE = re.compile(r"^\s*-{3,}\s*$")
_PARAM_LINE = re.compile(r"^(?P<name>\S[^:]*?)\s*:\s*(?P<type>.+)$")
_DEFAULT_RE = re.compile(r"\bDefaults?\s*:\s*(?P<val>.+?)\.?\s*$", re.IGNORECASE)

# Docstring sections whose entries follow the "name : type" + indented
# description item shape (rendered as tables).
ITEM_SECTIONS = {
    "parameters", "other parameters", "returns", "yields", "receives",
    "raises", "warns", "attributes",
}


# --------------------------------------------------------------------------
# Docstring parsing (numpy style -> structured sections)
# --------------------------------------------------------------------------

@dataclass
class Section:
    title: str
    items: list[tuple[str | None, str | None, str]] = field(default_factory=list)
    text_lines: list[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        return "\n".join(self.text_lines).strip()


def parse_docstring(text: str) -> tuple[str, list[Section]]:
    """Split a numpy-style docstring into leading prose + structured sections."""
    text = text.replace("``", "`")  # RST double backticks -> markdown
    lines = text.splitlines()
    lead: list[str] = []
    sections: list[Section] = []
    current: Section | None = None
    i = 0
    while i < len(lines):
        line = lines[i]
        # Section header: a line whose next line is a ---- underline
        if i + 1 < len(lines) and line.strip() and _SECTION_UNDERLINE.match(lines[i + 1]):
            current = Section(title=line.strip())
            sections.append(current)
            i += 2
            continue
        if current is None:
            lead.append(line)
        elif current.title.lower() in ITEM_SECTIONS:
            if not line.strip():
                pass  # blank lines between items
            elif line.startswith(" "):
                # Indented description line -> extend the previous item
                if current.items:
                    name, typ, desc = current.items[-1]
                    current.items[-1] = (name, typ, f"{desc} {line.strip()}".strip())
                else:
                    current.text_lines.append(line.strip())
            else:
                m = _PARAM_LINE.match(line)
                if m:
                    current.items.append((m.group("name").strip(), m.group("type").strip(), ""))
                else:
                    current.items.append((None, line.strip(), ""))
        else:
            current.text_lines.append(line)
        i += 1
    return "\n".join(lead).strip(), sections


# --------------------------------------------------------------------------
# Markdown building blocks (Docusaurus-flavoured)
# --------------------------------------------------------------------------

def cell(text: str) -> str:
    """Make text safe inside a markdown table cell."""
    return text.replace("|", "\\|").replace("\n", " ").strip()


def table(headers: list[str], rows: list[list[str]]) -> str:
    head = "| " + " | ".join(headers) + " |"
    rule = "| " + " | ".join(":---" for _ in headers) + " |"
    body = "\n".join("| " + " | ".join(cell(c) for c in row) + " |" for row in rows)
    return f"{head}\n{rule}\n{body}"


def admonition(kind: str, title: str | None, text: str) -> str:
    header = f":::{kind}[{title}]" if title else f":::{kind}"
    return f"{header}\n\n{text}\n\n:::"


def code_block(code: str, title: str | None = None) -> str:
    fence = f'```python title="{title}"' if title else "```python"
    return f"{fence}\n{code}\n```"


def signature_of(fn: docspec.Function, drop_self: bool = False) -> str:
    """Format a def signature from docspec args, with correct * markers."""
    ArgType = docspec.Argument.Type
    args = list(fn.args)
    if drop_self and args and args[0].name in ("self", "cls"):
        args = args[1:]

    has_var_positional = any(a.type == ArgType.POSITIONAL_REMAINDER for a in args)
    star_emitted = False
    pieces: list[str] = []
    for a in args:
        if a.type == ArgType.KEYWORD_ONLY and not has_var_positional and not star_emitted:
            pieces.append("*")
            star_emitted = True
        prefix = ""
        if a.type == ArgType.POSITIONAL_REMAINDER:
            prefix = "*"
        elif a.type == ArgType.KEYWORD_REMAINDER:
            prefix = "**"
        piece = f"{prefix}{a.name}"
        if a.datatype:
            piece += f": {a.datatype}"
        if a.default_value is not None:
            piece += f" = {a.default_value}" if a.datatype else f"={a.default_value}"
        pieces.append(piece)

    ret = f" -> {fn.return_type}" if fn.return_type else ""
    one_line = f"def {fn.name}({', '.join(pieces)}){ret}"
    if len(one_line) <= 88:
        return one_line
    inner = ",\n    ".join(pieces)
    return f"def {fn.name}(\n    {inner},\n){ret}"


def render_sections(sections: list[Section], level: int) -> list[str]:
    """Render parsed docstring sections as Docusaurus-friendly markdown."""
    h = "#" * level
    parts: list[str] = []
    for sec in sections:
        key = sec.title.lower()
        if key in ("parameters", "other parameters", "attributes"):
            rows = [
                [f"`{name}`" if name else "—", f"`{typ}`" if typ else "—", desc]
                for name, typ, desc in sec.items
            ]
            parts.append(f"{h} {sec.title}")
            parts.append(table(["Name", "Type", "Description"], rows))
        elif key in ("returns", "yields", "receives"):
            rows = [
                [f"`{name or typ}`" if (name or typ) else "—", desc]
                for name, typ, desc in sec.items
            ]
            parts.append(f"{h} {sec.title}")
            parts.append(table(["Type", "Description"], rows))
        elif key in ("raises", "warns"):
            rows = [
                [f"`{name or typ}`" if (name or typ) else "—", desc]
                for name, typ, desc in sec.items
            ]
            parts.append(f"{h} {sec.title}")
            parts.append(table(["Exception", "Description"], rows))
        elif key in ("notes", "note"):
            parts.append(admonition("note", None, sec.text))
        elif key in ("warnings", "warning"):
            parts.append(admonition("warning", None, sec.text))
        elif key == "see also":
            parts.append(admonition("tip", "See also", sec.text))
        elif key == "examples":
            parts.append(f"{h} Examples")
            text = sec.text
            # doctest-style examples get a code fence; prose stays prose
            parts.append(code_block(text) if ">>>" in text else text)
        else:
            parts.append(f"{h} {sec.title}")
            parts.append(sec.text)
    return parts


def is_property(m: docspec.ApiObject) -> bool:
    if not isinstance(m, docspec.Function):
        return False
    return any(
        getattr(d, "name", "") in ("property", "builtins.property")
        for d in (m.decorations or [])
    )


def split_default(desc: str) -> tuple[str, str]:
    """Extract a trailing 'Default: X' from a description -> (desc, default)."""
    m = _DEFAULT_RE.search(desc)
    if not m:
        return desc, "—"
    return desc[: m.start()].rstrip(" .;,"), f"`{m.group('val').strip()}`"


def render_function_body(fn: docspec.Function, level: int = 2) -> str:
    parts = [code_block(signature_of(fn), title="Signature")]
    if fn.docstring:
        lead, sections = parse_docstring(fn.docstring.content)
        if lead:
            parts.append(lead)
        parts += render_sections(sections, level)
    return "\n\n".join(p for p in parts if p)


def render_class_body(cls: docspec.Class, level: int = 2) -> str:
    h = "#" * level
    parts: list[str] = []

    if cls.docstring:
        lead, sections = parse_docstring(cls.docstring.content)
        if lead:
            parts.append(lead)
        parts += render_sections(sections, level)

    members = list(cls.members or [])
    props = [m for m in members if isinstance(m, docspec.Variable) or is_property(m)]
    methods = [
        m for m in members
        if isinstance(m, docspec.Function) and not is_property(m)
    ]
    nested = [m for m in members if isinstance(m, docspec.Class)]

    if props:
        rows = []
        for p in props:
            typ = p.datatype if isinstance(p, docspec.Variable) else p.return_type
            desc = p.docstring.content.strip() if p.docstring else ""
            desc, default = split_default(desc)
            rows.append([f"`{p.name}`", f"`{typ}`" if typ else "—", default, desc])
        parts.append(f"{h} Properties")
        parts.append(table(["Property", "Type", "Default", "Description"], rows))

    if methods:
        parts.append(f"{h} Methods")
        for m in methods:
            parts.append(f"{h}# {m.name}")
            parts.append(render_function_body(m, level + 2))

    for n in nested:
        parts.append(f"{h} {n.name}")
        parts.append(render_class_body(n, level + 1))

    return "\n\n".join(p for p in parts if p)


def render_member_body(member: docspec.ApiObject) -> str:
    if isinstance(member, docspec.Class):
        return render_class_body(member, level=2)
    return render_function_body(member, level=2)


# --------------------------------------------------------------------------
# Page metadata
# --------------------------------------------------------------------------

def summary(obj: docspec.ApiObject) -> str:
    if not obj.docstring:
        return ""
    return obj.docstring.content.strip().splitlines()[0]


def meta_description(obj: docspec.ApiObject) -> str:
    """First docstring line, de-markdowned and clamped to snippet length."""
    text = summary(obj).replace("`", "").strip()
    return (text[:157] + "...") if len(text) > 160 else text


def frontmatter(**fields) -> str:
    """Build a YAML frontmatter block. json.dumps produces valid YAML scalars,
    so titles/descriptions containing ':' or '"' cannot break the block."""
    lines = ["---"]
    for key, value in fields.items():
        if isinstance(value, list):
            lines.append(f"{key}: [{', '.join(json.dumps(v) for v in value)}]")
        else:
            lines.append(f"{key}: {json.dumps(value)}")
    lines.append("---")
    return "\n".join(lines) + "\n\n"


def strip_hidden_args(obj: docspec.ApiObject) -> None:
    """Recursively remove injected width/height kwargs from signatures."""
    if isinstance(obj, docspec.Function):
        obj.args = [a for a in obj.args if a.name not in HIDDEN_ARGS]
    for child in getattr(obj, "members", None) or []:
        strip_hidden_args(child)


# --------------------------------------------------------------------------
# Loading
# --------------------------------------------------------------------------

def regenerate_native_stub() -> None:
    """Refresh _img2num.pyi from the installed extension so native classes
    (e.g. ImageToSvgConfig) are documented from the current bindings."""
    # stubgen reports problems through the logging module; give it a handler
    # so they reach stderr (which the Node wrapper always surfaces).
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)

    # Reuse stubgen's own arg wiring so parser/printer/writer are configured
    # exactly as the CLI would configure them.
    args = arg_parser().parse_args(["-o", str(PKG_DIR), "img2num._img2num"])
    run(
        parser=stub_parser_from_args(args),
        printer=Printer(invalid_expr_as_ellipses=not args.print_invalid_expressions_as_is),
        module_name=args.module_name,
        out_dir=Path(args.output_dir),
        sub_dir=None,
        dry_run=False,
        writer=Writer(stub_ext=args.stub_extension),
    )
    if not NATIVE_STUB.exists():
        raise FileNotFoundError(f"stubgen ran but did not produce {NATIVE_STUB}")


def load_native_module(session: PydocMarkdown) -> docspec.Module:
    """Parse the compiled extension's .pyi stub so native classes get documented."""
    if not NATIVE_STUB.exists():
        raise FileNotFoundError(
            f"{NATIVE_STUB} not found — regenerate_native_stub() should have created it"
        )
    with NATIVE_STUB.open() as fp:
        module = docspec_python.parse_python_module(
            fp, filename=str(NATIVE_STUB), module_name="img2num._img2num"
        )
    session.process([module])  # apply the same private-name filtering
    return module


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main() -> None:
    regenerate_native_stub()

    session = PydocMarkdown()
    session.loaders = [
        PythonLoader(
            search_path=[str(PKG_DIR)],
            modules=["img2num.api"],
        )
    ]
    session.processors = [
        FilterProcessor(expression="not name.startswith('_') and default()"),
    ]

    modules = session.load_modules()
    session.process(modules)
    api = modules[0]

    # Collect members. Source-level members come from img2num.api;
    # whitelisted native re-exports come from the parsed stub.
    members: list[docspec.ApiObject] = list(api.members)
    native = load_native_module(session)
    members += [m for m in native.members if m.name in NATIVE_EXPORTS]

    # Partition by kind, preserving source order within each kind.
    groups: dict[str, list[docspec.ApiObject]] = {subdir: [] for _, subdir, _ in KINDS}
    for member in members:
        for _, subdir, kind_type in KINDS:
            if isinstance(member, kind_type):
                groups[subdir].append(member)
                break  # first matching kind wins

    STAGING_DIR = OUT_DIR.with_name(OUT_DIR.name + "_staging")

    # Ensure a clean staging directory
    if STAGING_DIR.exists():
        shutil.rmtree(STAGING_DIR)
    STAGING_DIR.mkdir(parents=True)

    try:
        total_pages = 0
        index_sections: list[str] = []

        for category_position, (label, subdir, _) in enumerate(KINDS, start=2):
            entries = groups[subdir]
            if not entries:
                continue

            cat_dir = STAGING_DIR / subdir
            cat_dir.mkdir()
            (cat_dir / "_category_.json").write_text(
                json.dumps(
                    {
                        "label": label,
                        "position": category_position,
                        "collapsible": True,
                        "collapsed": False,
                        "link": {
                            "type": "generated-index",
                            "slug": f"/py/api-reference/{subdir}",
                            "title": f"Python API — {label}",
                            "description": (
                                f"All public {label.lower()} in the img2num "
                                "Python package."
                            ),
                            "keywords": BASE_KEYWORDS,
                        },
                    },
                    indent=2,
                )
                + "\n"
            )

            rows: list[str] = []
            for member in entries:
                rows.append(f"| [`{member.name}`](./{subdir}/{member.name}) | {summary(member)} |")
                strip_hidden_args(member)
                page = (
                    frontmatter(
                        title=member.name,
                        description=meta_description(member)
                        or f"API reference for img2num.{member.name} (Python).",
                        keywords=BASE_KEYWORDS + [member.name],
                    )
                    + render_member_body(member)
                    + "\n"
                )
                (cat_dir / f"{member.name}.md").write_text(page)
                total_pages += 1

            index_sections.append(
                f"## {label}\n\n"
                f"| {label[:-1] if label.endswith('s') else label} | Description |\n"
                "| :--- | :--- |\n" + "\n".join(rows)
            )

        index = (
            frontmatter(
                title="Python API Reference",
                description=(
                    "Complete API reference for the img2num Python package: "
                    "image filtering, k-means clustering, and raster-to-SVG conversion."
                ),
                keywords=BASE_KEYWORDS + ["api reference", "reference"],
            )
            + "# Python API Reference\n\n"
            "Auto-generated from the docstrings in `packages/py/img2num/api.py`\n"
            "and `packages/py/img2num/_img2num.pyi` by\n"
            "`docs/scripts/pydoc-markdown/generate_py_api.py` — do not edit these\n"
            "pages by hand.\n\n" + "\n\n".join(index_sections) + "\n"
        )
        (STAGING_DIR / "index.md").write_text(index)

        # If all writes succeed, replace the original directory atomically-ish
        if OUT_DIR.exists():
            shutil.rmtree(OUT_DIR)
        STAGING_DIR.rename(OUT_DIR)

    except Exception:
        # On failure, clean up staging and preserve the existing OUT_DIR
        if STAGING_DIR.exists():
            shutil.rmtree(STAGING_DIR)
        raise

    print(f"Wrote {total_pages} member pages + index to {OUT_DIR}")


if __name__ == "__main__":
    main()
