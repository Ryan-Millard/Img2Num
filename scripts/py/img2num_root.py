from pathlib import Path

_EXPECTED_AT_ROOT = (
    ".git",
    "core",
    "bindings",
    "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md",
    "README.md",
    "LICENSE",
)


def _find_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if all((parent / name).exists() for name in _EXPECTED_AT_ROOT):
            return parent
    raise RuntimeError(
        "Could not locate the Img2Num repository root "
        f"(searched upward from {Path(__file__).resolve()})"
    )


IMG2NUM_ROOT = _find_root()
