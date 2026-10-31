import { isSupabaseConfigured, supabase } from '../supabaseClient'

// Valores actuales del sitio: se usan si Supabase no responde o no está configurado.
export const FALLBACK_CONFIG = {
  settings: {
    registration_open: true,
    registration_deadline: '2026-12-15T23:59:59-05:00',
    yape_number: '',
    yape_holder: '',
    yape_qr_path: null,
    contact_whatsapp: '',
  },
  games: {
    mlbb: { key: 'mlbb', price: 20, max_teams: 32, starters: 5, substitutes: 2, is_open: true, rules_pdf_path: null },
    ff: { key: 'ff', price: 15, max_teams: 24, starters: 4, substitutes: 1, is_open: true, rules_pdf_path: null },
  },
  prizes: [
    { place: 1, label: 'CAMPEÓN', amount: 1500, description: 'Trofeo y reconocimiento oficial' },
    { place: 2, label: 'SUBCAMPEÓN', amount: 800, description: 'Medallas y reconocimiento oficial' },
    { place: 3, label: 'TERCER LUGAR', amount: 400, description: 'Reconocimiento oficial' },
  ],
}

export async function fetchConfig() {
  if (!isSupabaseConfigured) return FALLBACK_CONFIG
  const [s, g, p] = await Promise.all([
    supabase.from('tournament_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('games').select('*'),
    supabase.from('prizes').select('*').order('place'),
  ])
  if (s.error || g.error || p.error || !s.data) throw new Error('No se pudo cargar la configuración')
  return {
    settings: s.data,
    games: Object.fromEntries(g.data.map((row) => [row.key, { ...row, price: Number(row.price) }])),
    prizes: p.data.map((row) => ({ ...row, amount: Number(row.amount) })),
  }
}

export const publicUrl = (bucket, path) =>
  path && isSupabaseConfigured ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null

const MAX_BYTES = 5 * 1024 * 1024
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' }

// Firma real del archivo (los primeros bytes), no solo lo que declara el navegador.
async function sniffType(file) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const startsWith = (...sig) => sig.every((byte, i) => bytes[i] === byte)
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png'
  if (startsWith(0xff, 0xd8, 0xff)) return 'image/jpeg'
  if (startsWith(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp'
  if (startsWith(0x25, 0x50, 0x44, 0x46, 0x2d)) return 'application/pdf'
  return null
}

export async function validateUpload(file, { allowPdf }) {
  const ext = EXT[file.type]
  if (!ext || (ext === 'pdf' && !allowPdf)) return `Formato no permitido (PNG, JPG, WEBP${allowPdf ? ' o PDF' : ''}).`
  if (file.size === 0 || file.size > MAX_BYTES) return 'El archivo debe pesar entre 1 byte y 5 MB.'
  if ((await sniffType(file)) !== file.type) return 'El contenido del archivo no coincide con su formato. Sube una imagen o PDF válido.'
  return null
}

// Si el envío falla después de subir el archivo, un reintento reutiliza la subida.
const uploaded = new WeakMap()

async function upload(bucket, file) {
  if (uploaded.has(file)) return uploaded.get(file)
  const path = `${crypto.randomUUID()}.${EXT[file.type]}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error('No se pudo subir el archivo. Revisa tu conexión e intenta nuevamente.')
  uploaded.set(file, path)
  return path
}

// Sube comprobante (+ logo opcional) y registra el equipo mediante la RPC segura.
// El precio, el cupo y la fecha los valida el servidor; aquí solo se envían datos del formulario.
export async function submitRegistration({ gameKey, team, captain, whatsapp, institution, school, otherInstitution, players, receipt, logo, honeypot = '' }) {
  if (!isSupabaseConfigured) throw new Error('El sistema de inscripciones aún no está habilitado.')
  const receiptPath = await upload('receipts', receipt)
  const logoPath = logo ? await upload('team-logos', logo) : null
  const { data, error } = await supabase.rpc('submit_registration', {
    payload: {
      game_key: gameKey,
      team_name: team,
      captain_name: captain,
      captain_whatsapp: whatsapp,
      institution,
      professional_school: school,
      other_institution: institution === 'Otra' ? otherInstitution : null,
      receipt_path: receiptPath,
      logo_path: logoPath,
      players,
      website: honeypot,
    },
  })
  if (error) {
    // Solo se muestran los mensajes de validación propios; cualquier otro error se oculta.
    throw new Error(error.code === 'P0001' && error.message ? error.message : 'No se pudo registrar la inscripción. Intenta nuevamente en unos minutos.')
  }
  return data
}

// Cupos ocupados por juego (solo conteos, sin datos personales). null si no está disponible.
export async function fetchAvailability() {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.from('public_availability').select('*')
  if (error || !data) return null
  return Object.fromEntries(data.map((row) => [row.game_key, { max: row.max_teams, taken: row.taken }]))
}

export async function fetchPublicTeams() {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase.from('public_teams').select('*').order('team_name')
  if (error) throw new Error(error.message)
  return data
}

export async function fetchPublishedStages() {
  if (!isSupabaseConfigured) return { stages: [], groups: [], groupTeams: [], matches: [], results: [] }
  const [s, g, gt, m, r] = await Promise.all([
    supabase.from('public_stages').select('*').order('position'),
    supabase.from('public_groups').select('*').order('name'),
    supabase.from('public_group_teams').select('*'),
    supabase.from('public_matches').select('*').order('round').order('position'),
    supabase.from('public_match_results').select('*'),
  ])
  const err = s.error || g.error || gt.error || m.error || r.error
  if (err) throw new Error(err.message)
  return { stages: s.data, groups: g.data, groupTeams: gt.data, matches: m.data, results: r.data }
}

// Contenido editable (reglamento por juego y pasos). Si la migración aún no existe, devuelve null.
export async function fetchContent() {
  if (!isSupabaseConfigured) return null
  const [r, st] = await Promise.all([
    supabase.from('rules_sections').select('*').order('position'),
    supabase.from('participation_steps').select('*').order('position'),
  ])
  if (r.error || st.error) return null
  const rules = {}
  r.data.forEach((row) => {
    (rules[row.game_key] ??= []).push({ title: row.title, highlight: row.highlight, points: row.points })
  })
  return { rules, steps: st.data.map((row) => ({ title: row.title, text: row.body, detail: row.detail })) }
}
