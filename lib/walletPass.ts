const WALLET_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-pass`
const ANON_KEY      = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Creates/updates the Google Wallet pass for a card and returns the
 * "Add to Google Wallet" redirect URL.
 * Returns null if the Edge Function is not configured or the call fails.
 */
export async function getWalletPassUrl(
  slug: string,
  uniqueId: string,
): Promise<string | null> {
  try {
    const res = await fetch(WALLET_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ slug, uniqueId }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data.url as string) ?? null
  } catch {
    return null
  }
}

/**
 * Silently syncs the stamp count on the existing Google Wallet pass.
 * Call this after every stamp add / remove / redeem in the kiosk.
 * Errors are intentionally swallowed — wallet sync is best-effort.
 */
export async function syncWalletPass(slug: string, uniqueId: string): Promise<void> {
  try {
    await fetch(WALLET_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ slug, uniqueId }),
    })
  } catch {
    /* best-effort */
  }
}
