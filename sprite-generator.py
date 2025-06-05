#!/usr/bin/env python3
"""
Sprite generator for a top-down tower-defence game.

* Primary model:  miike-ai/flux-sprites        (sprite-tuned)

Requires:
  pip install --upgrade "replicate>=1.0.0" requests pyyaml
  export REPLICATE_API_TOKEN=<your-token>
"""

from __future__ import annotations
import argparse
import os
import sys
from pathlib import Path
import yaml
import replicate
import requests
from replicate.exceptions import ReplicateError

# Models to try in order - will attempt each one until one succeeds
DEFAULT_MODELS = [
#  "google/imagen-4",
   # "minimax/image-01",
   "black-forest-labs/flux-1.1-pro",
 "recraft-ai/recraft-v3",
   # "bytedance/sdxl-lightning-4step",
   # "miike-ai/flux-sprites"
]

SPRITE_DEFAULTS = dict(
    aspect_ratio="1:1",
    width=256,
    height=256,
    output_format="png",
    num_inference_steps=40,
    guidance_scale=10,
    seed=6557,
    model="dev",                        # dev | schnell
    negative_prompt=(
        "3d shading, drop shadow, perspective tilt, text, logo, watermark"
    ),
)

def _latest_version(client: replicate.Client, slug: str) -> str:
    """Return 'owner/model:<latest-version-id>' so old SDKs don't 404."""
    model = client.models.get(slug)
    return f"{slug}:{model.latest_version.id}"

def _download(output, path: Path) -> None:
    """Handle FileOutput vs plain URL transparently."""
    if hasattr(output, "read"):
        data = output.read()
    else:
        # Older behaviour (list of URLs)
        url = output if isinstance(output, str) else output[0]
        data = requests.get(url, timeout=30).content
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)

def generate(prompt: str, negative_prompt: str, out_path: Path, client: replicate.Client, models: list[str] = None) -> None:
    """Generate image using a list of models, trying each in order until one succeeds."""
    if models is None:
        models = DEFAULT_MODELS
    
    last_error = None
    for i, model in enumerate(models):
        try:
            print(f"[info] Trying model {i+1}/{len(models)}: {model}")
            versioned = _latest_version(client, model)
            out = client.run(versioned, input={**SPRITE_DEFAULTS, "prompt": prompt, "negative_prompt": negative_prompt})
            _download(out[0] if isinstance(out, list) else out, out_path)
            print(f"[success] Generated with {model}")
            return
        except ReplicateError as e:
            last_error = e
            print(f"[warn] Model {model} failed ({e.status_code}): {e}", file=sys.stderr)
            if i < len(models) - 1:
                print(f"[info] Trying next model...", file=sys.stderr)
    
    # If we get here, all models failed
    raise RuntimeError(f"All {len(models)} models failed. Last error: {last_error}")

def process_yaml(cfg_path: Path, client: replicate.Client, models: list[str] = None) -> None:
    cfg = yaml.safe_load(cfg_path.read_text())

    # --- logo ---
    #logo_prompt = (
    #    f"top-down 2D game sprite of {cfg.get('name', cfg['key'])} logo, "
    #    f"{cfg.get('description','')}, centered, clear silhouette, "
    #    "crisp pixel-art shading, transparent background, video-game asset"
    #)
    #generate(logo_prompt,
   #          Path("web/client/public/assets/network") / f"{cfg['key']}.png",
   #          client, models)

    # --- towers ---
    #for t in cfg.get("towerTypes", []):
    #    prompt = (
    #        f"top-down 2D game sprite of {t['name']} tower, "
    #        f"{t.get('description','')}, orthographic view, centered, "
    #        "clear silhouette, crisp pixel-art shading, transparent background, video-game asset"
    #    )
   #     generate(prompt,
   #              Path("web/client/public/assets/towerSprites") / f"{t['key']}.png",
   #              client, models)

    # --- mobs ---
    for m in cfg.get("mobTypes", []):
        prompt = (
            f"{m['name']} – top-down RPG spritesheet, {m.get('description','')}. "
            "Crisp 32-pixel SNES-style pixel-art, orthographic 3⁄4 view, even top-left light. "
            "Transparent background, 4 × 4 grid; 4-px gutter; each cell 32×32 and centered. "
            "Row-order: walk-left, walk-right, walk-up, walk-down. "
            "Column-order per row: idle • step-A • idle-return • step-B. "
            "Consistent palette (≤16 colours), clear silhouette, no cropping, no text."
        )

        negative_prompt = (
            "duplicate rows, missing frames, inconsistent direction, stray pixels, "
            "extra characters, gradients, JPEG artefacts, background scenery"
        )

        print(f"[info] Generating {m.get('name')}")
        model_name = (models[0] if models else DEFAULT_MODELS[0]).replace('/', '-')
        generate(prompt, negative_prompt,
                 Path("web/client/public/assets/mobSprites/3/") / f"{model_name}_{m['key']}.png",
                 client, models)

def main() -> None:
    if not os.getenv("REPLICATE_API_TOKEN"):
        sys.exit("✖  REPLICATE_API_TOKEN not set")

    cli = argparse.ArgumentParser(description="Generate TD sprites via Replicate")
    cli.add_argument("configs", nargs="*", help="YAML config files or network names")
    cli.add_argument("--models", "-m", nargs="*", help="Models to try in order (default: google/imagen-3-fast, stability-ai/sdxl, black-forest-labs/flux-schnell)")
    args = cli.parse_args()

    # Use custom models if provided, otherwise use defaults
    models = args.models if args.models else DEFAULT_MODELS
    print(f"[info] Using models in order: {', '.join(models)}")

    root = Path("cmd/server/networkconfigs")
    files = (
        [*root.glob("*.yaml")]
        if not args.configs
        else [
            (Path(p) if Path(p).exists() else root / f"{p}.yaml")
            for p in args.configs
        ]
    )

    client = replicate.Client(api_token=os.environ["REPLICATE_API_TOKEN"])
    for cfg in files:
        print(f"[info] Processing {cfg}")
        process_yaml(cfg, client, models)

if __name__ == "__main__":
    main()
