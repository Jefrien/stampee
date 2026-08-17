/**
 * wallet-stamp-image
 * Returns a 1032×336 PNG showing the loyalty stamp grid for a card.
 * Used as the heroImage on the LoyaltyObject in Google Wallet.
 *
 * Query params:
 *   s  = current stamp count   (default 0)
 *   t  = total stamps needed   (default 10)
 *   bg = background hex color  (without #, default 1a1a2e)
 *   ac = active/filled color   (without #, default d4bf9a)
 *   ic = inactive/empty color  (without #, default 888888)
 *
 * Deploy with --no-verify-jwt so Google Wallet can fetch it unauthenticated:
 *   supabase functions deploy wallet-stamp-image --no-verify-jwt
 */

// Pure-Deno image library — no native bindings needed
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts'

// ── helpers ───────────────────────────────────────────────────────────────────

/** Convert a #rrggbb hex string + alpha (0–1) to imagescript's RGBA uint32 */
function rgba(hex: string, alpha = 1): number {
  const h = hex.replace('#', '').padEnd(6, '0').slice(0, 6)
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  const a = Math.min(255, Math.round(alpha * 255))
  // imagescript uses RGBA big-endian uint32
  return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0
}

/** Filled circle (anti-aliased using sub-pixel coverage) */
function fillCircle(img: Image, cx: number, cy: number, r: number, color: number) {
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= r) {
        const px = cx + dx
        const py = cy + dy
        if (px >= 1 && px <= img.width && py >= 1 && py <= img.height) {
          // Soft edge: reduce alpha within the last pixel
          const coverage = Math.max(0, Math.min(1, r - dist + 0.5))
          if (coverage >= 1) {
            img.setPixelAt(px, py, color)
          } else {
            // blend with existing pixel for smooth edge
            const orig = img.getPixelAt(px, py)
            const or = (orig >>> 24) & 0xff
            const og = (orig >>> 16) & 0xff
            const ob = (orig >>> 8)  & 0xff
            const cr = (color >>> 24) & 0xff
            const cg = (color >>> 16) & 0xff
            const cb = (color >>> 8)  & 0xff
            const ca = ((color & 0xff) / 255) * coverage
            const blended = rgba(
              `${Math.round(or + (cr - or) * ca).toString(16).padStart(2, '0')}${Math.round(og + (cg - og) * ca).toString(16).padStart(2, '0')}${Math.round(ob + (cb - ob) * ca).toString(16).padStart(2, '0')}`,
              1,
            )
            img.setPixelAt(px, py, blended)
          }
        }
      }
    }
  }
}

/** Filled rectangle */
function fillRect(img: Image, x: number, y: number, w: number, h: number, color: number) {
  for (let px = x; px < x + w; px++) {
    for (let py = y; py < y + h; py++) {
      if (px >= 1 && px <= img.width && py >= 1 && py <= img.height) {
        img.setPixelAt(px, py, color)
      }
    }
  }
}

/** Rounded rectangle (corner radius rr) */
function fillRoundRect(img: Image, x: number, y: number, w: number, h: number, rr: number, color: number) {
  // Fill body
  fillRect(img, x + rr, y, w - rr * 2, h, color)
  fillRect(img, x, y + rr, w, h - rr * 2, color)
  // Fill corners
  for (const [cx, cy] of [[x + rr, y + rr], [x + w - rr, y + rr], [x + rr, y + h - rr], [x + w - rr, y + h - rr]]) {
    fillCircle(img, cx, cy, rr, color)
  }
}

// ── main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const p       = new URL(req.url).searchParams
  const stamps  = Math.max(0, parseInt(p.get('s') ?? '0', 10))
  const total   = Math.max(1, Math.min(16, parseInt(p.get('t') ?? '10', 10)))
  const bgColor = '#' + (p.get('bg') ?? '1a1a2e')
  const acColor = '#' + (p.get('ac') ?? 'd4bf9a')
  const icColor = '#' + (p.get('ic') ?? '888888')

  const W = 1032
  const H = 336

  const img = new Image(W, H)
  img.fill(rgba(bgColor))

  // ── Stamp grid layout ──────────────────────────────────────────────────────
  // Determine rows/cols based on total count
  const cols   = total <= 5 ? total : total <= 10 ? Math.ceil(total / 2) : Math.ceil(total / 3)
  const rows   = Math.ceil(total / cols)
  // Shrink radius as grid grows
  const stampR = rows === 1 ? 42 : rows === 2 ? 30 : 22
  const gap    = rows === 1 ? 28 : rows === 2 ? 20 : 14

  const gridW  = cols * (stampR * 2 + gap) - gap
  const gridH  = rows * (stampR * 2 + gap) - gap

  // Centre the grid vertically with a slight upward offset to leave space for bar
  const startX = Math.round((W - gridW) / 2) + stampR
  const startY = Math.round((H - gridH) / 2) + stampR - 12

  for (let i = 0; i < total; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const cx  = startX + col * (stampR * 2 + gap)
    const cy  = startY + row * (stampR * 2 + gap)

    if (i < stamps) {
      // ── Filled stamp ─────────────────────────────────────────────────────
      fillCircle(img, cx, cy, stampR, rgba(acColor))
      // Inner highlight ring for a "coin" depth effect
      fillCircle(img, cx - 3, cy - 3, Math.round(stampR * 0.35), rgba(acColor.slice(0, 7), 0.25))
      // Small dark inner circle
      fillCircle(img, cx, cy, Math.round(stampR * 0.28), rgba(bgColor, 0.30))
    } else {
      // ── Empty stamp ──────────────────────────────────────────────────────
      // Faint filled background
      fillCircle(img, cx, cy, stampR, rgba(acColor, 0.12))
      // Dashed outline effect: 2-px ring
      fillCircle(img, cx, cy, stampR, rgba(acColor, 0.30))
      fillCircle(img, cx, cy, stampR - 3, rgba(bgColor))
      fillCircle(img, cx, cy, stampR - 3, rgba(acColor, 0.08))
    }
  }

  // ── Progress bar at bottom ─────────────────────────────────────────────────
  const barH  = 6
  const barY  = H - 24
  const barX  = 56
  const barW  = W - 112
  const fillW = Math.round(barW * Math.min(1, stamps / total))

  fillRoundRect(img, barX, barY, barW, barH, 3, rgba(acColor, 0.20))
  if (fillW > 0) {
    fillRoundRect(img, barX, barY, fillW, barH, 3, rgba(acColor, 0.90))
  }

  const png = await img.encode()

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=60',
    },
  })
})
