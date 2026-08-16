import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Env vars (set in Supabase dashboard > Edge Functions > Secrets) ──────────
const ISSUER_ID    = Deno.env.get('GOOGLE_WALLET_ISSUER_ID')!
const SA_EMAIL     = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')!
const SA_KEY_RAW   = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')!
const APP_URL      = Deno.env.get('APP_URL') ?? 'https://lealtad.dulcetentaciongt.com'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const WALLET_BASE = 'https://walletobjects.googleapis.com/walletobjects/v1'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

// ── Crypto helpers ────────────────────────────────────────────────────────────

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  bytes.forEach(b => (s += String.fromCharCode(b)))
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

const b64urlStr = (s: string) => b64url(new TextEncoder().encode(s))

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Handle escaped \n from env vars
  const normalized = pem.replace(/\\n/g, '\n')
  const content = normalized.replace(/-----.*?-----/g, '').replace(/\s/g, '')
  const bytes = Uint8Array.from(atob(content), c => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

async function signJwt(header: object, payload: object, key: CryptoKey): Promise<string> {
  const h = b64urlStr(JSON.stringify(header))
  const p = b64urlStr(JSON.stringify(payload))
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${h}.${p}`),
  )
  return `${h}.${p}.${b64url(sig)}`
}

// ── Google OAuth2 ─────────────────────────────────────────────────────────────

async function getAccessToken(key: CryptoKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const jwt = await signJwt(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: SA_EMAIL,
      scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    },
    key,
  )
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Google auth failed: ${JSON.stringify(data)}`)
  return data.access_token
}

// ── Wallet API helpers ────────────────────────────────────────────────────────

async function walletReq(token: string, method: string, path: string, body?: object) {
  const res = await fetch(`${WALLET_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  return { status: res.status, data: text ? JSON.parse(text) : null }
}

function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function ensureHex(color: string): string {
  if (!color) return '#ffffff'
  return color.startsWith('#') ? color : `#${color}`
}

// ── Build Google Wallet objects ───────────────────────────────────────────

interface CampaignInfo {
  name: string
  rewardName: string
  logoImage?: string
  totalStamps: number
  colors: { background?: string; text?: string }
}

function buildClass(campaignId: string, c: CampaignInfo) {
  const bg = ensureHex(c.colors?.background ?? '#1a1a2e')

  const obj: Record<string, unknown> = {
    id: `${ISSUER_ID}.${safeId(campaignId)}`,
    issuerName: c.name,
    programName: c.name,

    // Labels for predefined loyalty fields
    loyaltyPointsLabel: 'Sellos',
    rewardsTierLabel: 'Premio',
    rewardsTier: c.rewardName,

    hexBackgroundColor: bg,

    // ── CARD LAYOUT (front of pass) ────────────────────────────────
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          // Row 1: customer name (full width)
          {
            oneItem: {
              item: {
                firstValue: {
                  fields: [{ fieldPath: 'object.accountName' }],
                },
              },
            },
          },
          // Row 2: Sellos | Premio | Meta  (3 columns)
          {
            threeItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: 'object.loyaltyPoints.balance' }],
                },
              },
              middleItem: {
                firstValue: {
                  fields: [{ fieldPath: 'class.rewardsTier' }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: 'object.secondaryLoyaltyPoints.balance' }],
                },
              },
            },
          },
          // Row 3: progress text | status  (2 columns)
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['progress']" }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['status']" }],
                },
              },
            },
          },
        ],
      },

      // ── LIST VIEW (wallet home screen row) ────────────────────────
      listTemplateOverride: {
        firstRowOption: {
          fieldOption: {
            fields: [{ fieldPath: 'object.loyaltyPoints.balance' }],
          },
        },
        secondRowOption: {
          fields: [{ fieldPath: "object.textModulesData['progress']" }],
        },
        thirdRowOption: {
          fields: [{ fieldPath: 'object.accountName' }],
        },
      },
    },

    // ── BACK OF PASS (details view) ──────────────────────────────
    textModulesData: [
      {
        id: 'how_it_works',
        header: 'Cómo funciona',
        body: `Acumula ${c.totalStamps} sellos y canjea tu premio: ${c.rewardName}.`,
      },
      {
        id: 'instructions',
        header: 'Cómo sellar',
        body: 'Presenta esta tarjeta en caja. El personal agrega el sello directamente.',
      },
    ],

    multipleDevicesAndHoldersAllowedStatus: 'ONE_USER_ONE_DEVICE',
    viewUnlockRequirement: 'UNLOCK_NOT_REQUIRED',
    reviewStatus: 'UNDER_REVIEW',
  }

  if (c.logoImage) {
    obj.programLogo = {
      sourceUri: { uri: c.logoImage },
      contentDescription: { defaultValue: { language: 'es', value: c.name } },
    }
    obj.heroImage = {
      sourceUri: { uri: c.logoImage },
      contentDescription: { defaultValue: { language: 'es', value: c.name } },
    }
  }

  return obj
}

function buildObject(
  uniqueId: string,
  campaignId: string,
  customerName: string,
  stamps: number,
  totalStamps: number,
  rewardName: string,
  slug: string,
  status: string,
) {
  const isCompleted = status === 'Redeemed' || stamps >= totalStamps
  const remaining   = Math.max(totalStamps - stamps, 0)
  const cardUrl     = `${APP_URL}/${slug}/${uniqueId}`

  return {
    id: `${ISSUER_ID}.${safeId(uniqueId)}`,
    classId: `${ISSUER_ID}.${safeId(campaignId)}`,
    state: status === 'Redeemed' ? 'COMPLETED' : 'ACTIVE',

    // Customer name shown on the pass
    accountName: customerName,

    // Main counter — current stamps (shown large in Row 2)
    loyaltyPoints: {
      balance: { int: stamps },
      label: 'Sellos',
    },

    // Secondary counter — total stamps goal (shown in Row 2 right column)
    secondaryLoyaltyPoints: {
      balance: { int: totalStamps },
      label: 'Meta',
    },

    // ── Text modules referenced by cardTemplateOverride (front rows) ──
    textModulesData: [
      {
        // Referenced in Row 3 left — shown on the FRONT of the pass
        id: 'progress',
        header: 'Progreso',
        body: isCompleted
          ? `¡Completado! Canjea tu premio`
          : `${stamps} de ${totalStamps} sellos`,
      },
      {
        // Referenced in Row 3 right — shown on the FRONT of the pass
        id: 'status',
        header: 'Estado',
        body: isCompleted ? '✅ Listo para canjear' : `⏳ ${remaining} sellos más`,
      },
      {
        // Shown only on the BACK (details view) — not in cardTemplateOverride
        id: 'reward_detail',
        header: 'Tu premio',
        body: rewardName,
      },
    ],

    // QR code — opens the web card for scanning
    barcode: {
      type: 'QR_CODE',
      value: cardUrl,
      alternateText: 'Ver mi tarjeta digital',
    },

    // Link shown in the details view (back of pass)
    linksModuleData: {
      uris: [
        {
          id: 'card_link',
          uri: cardUrl,
          description: 'Ver mi tarjeta digital',
        },
      ],
    },
  }
}

async function upsertClass(token: string, classId: string, body: object) {
  const { status } = await walletReq(token, 'GET', `/loyaltyClass/${classId}`)
  if (status === 404) {
    await walletReq(token, 'POST', '/loyaltyClass', body)
  } else {
    await walletReq(token, 'PUT', `/loyaltyClass/${classId}`, body)
  }
}

async function upsertObject(token: string, objectId: string, body: object) {
  const { status } = await walletReq(token, 'GET', `/loyaltyObject/${objectId}`)
  if (status === 404) {
    await walletReq(token, 'POST', '/loyaltyObject', body)
  } else {
    await walletReq(token, 'PATCH', `/loyaltyObject/${objectId}`, body)
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  // Verify required env vars are present before doing any work
  const missingVars = (['GOOGLE_WALLET_ISSUER_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const)
    .filter(k => !Deno.env.get(k))
  if (missingVars.length > 0) {
    console.error('Missing env vars:', missingVars.join(', '))
    return new Response(
      JSON.stringify({ error: `Variables de entorno faltantes: ${missingVars.join(', ')}` }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const { slug, uniqueId } = (await req.json()) as { slug: string; uniqueId: string }

    if (!slug || !uniqueId) {
      return new Response(JSON.stringify({ error: 'slug y uniqueId son requeridos' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // 1. Fetch card data via the existing security-definer RPC
    const db = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { data, error } = await db.rpc('get_public_card', {
      slug_input: slug,
      card_unique_id: uniqueId,
    })
    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Tarjeta no encontrada' }), {
        status: 404,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const card     = data.card
    const customer = data.customer
    // templateSnapshot is the source of truth; fall back to live campaign
    const snap     = card.templateSnapshot ?? data.campaign ?? {}
    const campaignId = card.campaignId ?? snap.id ?? 'unknown'

    const campaign: CampaignInfo = {
      name: snap.name ?? card.campaignName ?? 'Programa de fidelidad',
      rewardName: snap.rewardName ?? snap.reward_name ?? 'Premio',
      logoImage: snap.logoImage ?? snap.logo_image,
      totalStamps: snap.totalStamps ?? snap.total_stamps ?? 10,
      colors: snap.colors ?? {},
    }

    // 2. Import service account key & get access token
    const cryptoKey   = await importPrivateKey(SA_KEY_RAW)
    const accessToken = await getAccessToken(cryptoKey)

    // 3. Upsert LoyaltyClass (one per campaign)
    const classId   = `${ISSUER_ID}.${safeId(campaignId)}`
    const classBody = buildClass(campaignId, campaign)
    await upsertClass(accessToken, classId, classBody)

    // 4. Upsert LoyaltyObject (one per issued card)
    const objectId   = `${ISSUER_ID}.${safeId(uniqueId)}`
    const objectBody = buildObject(
      uniqueId,
      campaignId,
      customer.name,
      card.stamps,
      campaign.totalStamps,
      campaign.rewardName,
      slug,
      card.status,
    )
    await upsertObject(accessToken, objectId, objectBody)

    // 5. Build "Save to Google Wallet" JWT referencing the existing object
    const saveJwt = await signJwt(
      { alg: 'RS256', typ: 'JWT' },
      {
        iss: SA_EMAIL,
        aud: 'google',
        origins: [APP_URL],
        typ: 'savetowallet',
        iat: Math.floor(Date.now() / 1000),
        payload: { loyaltyObjects: [{ id: objectId }] },
      },
      cryptoKey,
    )

    return new Response(JSON.stringify({ url: `https://pay.google.com/gp/v/save/${saveJwt}` }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('wallet-pass error:', err)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
