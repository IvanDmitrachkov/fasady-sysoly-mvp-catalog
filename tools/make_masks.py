#!/usr/bin/env python3
"""
Собирает файлы сцены для примерочной кухни из JSON с полигонами.

    python3 tools/make_masks.py tools/scenes/straight-1.json

Результат в public/scenes/<id>/:
  base.jpg   — исходное фото (увеличенное)
  masks.png  — R: фасады, G: столешница, B: фартук (яркость = степень принадлежности)
  masks2.png — R: акцентные зоны (если в сцене есть регион accent)

Нужны: pip install opencv-python-headless numpy pillow
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent


def polygon_mask(shape, include, exclude):
    m = np.zeros(shape, np.uint8)
    for poly in include:
        cv2.fillPoly(m, [np.array(poly, np.int32)], 255)
    for poly in exclude:
        cv2.fillPoly(m, [np.array(poly, np.int32)], 0)
    return m


def refine(img, mask, band):
    """GrabCut только в узкой полосе у границы полигона: уточняет край по цвету."""
    if band <= 0:
        return mask
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (band * 2 + 1, band * 2 + 1))
    sure_fg = cv2.erode(mask, k)
    maybe = cv2.dilate(mask, k)
    gc = np.full(mask.shape, cv2.GC_BGD, np.uint8)
    gc[maybe > 0] = cv2.GC_PR_BGD
    gc[mask > 0] = cv2.GC_PR_FGD
    gc[sure_fg > 0] = cv2.GC_FGD
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, gc, None, bgd, fgd, 3, cv2.GC_INIT_WITH_MASK)
    out = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    # не выходим за пределы исходного полигона, расширенного на band
    return cv2.bitwise_and(out, maybe)


def main(cfg_path):
    cfg = json.loads(Path(cfg_path).read_text())
    src = cv2.imread(str(ROOT / cfg["source"]))
    s = cfg["upscale"]
    img = cv2.resize(src, None, fx=s, fy=s, interpolation=cv2.INTER_LANCZOS4)
    h, w = img.shape[:2]
    # координаты можно задавать в пикселях исходника ("coords": "source") или уже увеличенного фото
    k = s if cfg.get("coords") == "source" else 1

    channels = []
    for name in ("facade", "worktop", "backsplash", "accent"):
        if name not in cfg["regions"]:
            channels.append(np.zeros((h, w), np.uint8))
            continue
        r = cfg["regions"][name]
        scale = lambda polys: [[[x * k, y * k] for x, y in poly] for poly in polys]
        m = polygon_mask((h, w), scale(r["include"]), scale(r.get("exclude", [])))
        m = refine(img, m, r.get("refine", 0))
        # убираем острова и дыры, чуть сглаживаем край
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
        m = cv2.GaussianBlur(m, (0, 0), 0.9)
        channels.append(m)

    # BGR порядок для cv2.imwrite: B=фартук, G=столешница, R=фасады
    masks = cv2.merge([channels[2], channels[1], channels[0]])
    accent = cv2.merge([np.zeros((h, w), np.uint8), np.zeros((h, w), np.uint8), channels[3]])
    out = ROOT / "public" / "scenes" / cfg["id"]
    out.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out / "base.jpg"), img, [cv2.IMWRITE_JPEG_QUALITY, 88])
    cv2.imwrite(str(out / "masks.png"), masks)
    if "accent" in cfg["regions"]:
        cv2.imwrite(str(out / "masks2.png"), accent)

    # проверочная картинка для глаз: маски поверх фото
    overlay = img.copy().astype(np.float32)
    for m, col in zip(channels, [(0, 0, 255), (0, 255, 0), (255, 0, 0), (0, 200, 255)]):
        a = (m.astype(np.float32) / 255.0)[..., None] * 0.55
        overlay = overlay * (1 - a) + np.array(col, np.float32) * a
    cv2.imwrite(str(ROOT / "tools" / "scenes" / f"{cfg['id']}.check.jpg"), overlay.astype(np.uint8))
    print("ok", w, h, out)


if __name__ == "__main__":
    main(sys.argv[1])
