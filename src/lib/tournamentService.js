import { requireSupabase } from '../supabaseClient.js'
import { buildRegistrationPayload, validateRoster, validateTeam, validateUpload } from './registrationValidation.js'

export const REGISTRATION_BUCKET = 'registration-files'
const errors = {
  TEAM_NAME_TAKEN: 'Ya existe una inscripción activa con ese nombre en esta disciplina.',
  PLAYER_ALREADY_REGISTERED: 'Uno de los jugadores ya está inscrito en otro equipo de esta disciplina.',
  DUPLICATE_PLAYER: 'Un jugador aparece más de una vez en el roster.',
  REGISTRATION_CLOSED: 'Las inscripciones de esta disciplina están cerradas.',
  REGISTRATION_LIMIT: 'Alcanzaste el límite de inscripciones de esta sesión.',
  ADMIN_REQUIRED: 'Tu cuenta no tiene acceso a la organización del evento.',
  INVALID_ROSTER: 'Revisa los nicknames, IDs y servidores del roster.',
  INVALID_TEAM_DATA: 'Revisa los datos del equipo y la aceptación del reglamento.',
  RECEIPT_REQUIRED: 'No se encontró el comprobante. Vuelve a enviarlo.',
  INVALID_LOGO: 'No se pudo validar el logo del equipo.',
  TEAM_HAS_MATCHES: 'Retira primero al equipo de sus encuentros antes de rechazarlo.',
  REGISTRATION_ALREADY_REJECTED: 'Esta solicitud ya fue rechazada. El equipo deberá enviar una nueva.',
  REVIEW_NOTE_REQUIRED: 'Escribe el motivo del rechazo.',
  INVALID_MATCH_TEAMS: 'Selecciona equipos confirmados de la misma disciplina, sin repetirlos. Para publicar se requieren al menos dos.',
  MATCH_RESULT_REQUIRED: 'Completa el resultado de todos los participantes para finalizar.',
  MATCH_TIE_NOT_ALLOWED: 'Una serie de MLBB finalizada debe tener un ganador.',
  DUPLICATE_PLACEMENT: 'Dos equipos no pueden tener la misma posición en una sala.',
  INVALID_MATCH: 'Revisa el título, la ronda y el estado del encuentro.',
}
export function backendMessage(error) {
  const known = Object.keys(errors).find(code => error?.message?.includes(code))
  if (known) return errors[known]
  if (error?.code === 'anonymous_provider_disabled') return 'Las inscripciones todavía no están habilitadas. La organización debe activar el acceso de participantes.'
  if (error?.code === 'captcha_failed' || /captcha/i.test(error?.message || '')) return 'Completa de nuevo la verificación de seguridad e inténtalo otra vez.'
  return 'No se pudo completar la operación. Conservamos los datos del formulario; revisa tu conexión e inténtalo otra vez.'
}
function unwrap(result) {
  if (result.error) throw new Error(backendMessage(result.error))
  return result.data
}
const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' }

export function createTournamentService(getClient = requireSupabase) {
  let signingIn
  async function participant(client, captchaToken) {
    const session = unwrap(await client.auth.getSession())?.session
    if (session) return session.user
    if (!signingIn) signingIn = client.auth.signInAnonymously({ options: { captchaToken } }).finally(() => { signingIn = null })
    return unwrap(await signingIn).user
  }
  async function withLogos(client, teams) {
    const paths = teams.map(team => team.logo_path).filter(Boolean)
    if (!paths.length) return teams
    const { data } = await client.storage.from(REGISTRATION_BUCKET).createSignedUrls(paths, 3600)
    const urls = new Map((data || []).map(item => [item.path, item.signedUrl]))
    return teams.map(team => ({ ...team, logo_url: urls.get(team.logo_path) || null }))
  }
  return {
    async submit(data, requestId, captchaToken) {
      const validation = validateTeam(data) || validateRoster(data.game, data.players) || validateUpload(data.paymentReceipt, true) || (!data.termsAccepted && 'Debes aceptar el reglamento.')
      if (validation) throw new Error(validation)
      const client = getClient()
      const user = await participant(client, captchaToken)
      // Recover a committed request after a lost response before trying to upload again.
      const previous = unwrap(await client.from('registrations').select('id,reference_code,status,team_name').eq('request_id', requestId).maybeSingle())
      if (previous) return previous
      const prefix = `${user.id}/${requestId}`
      const receiptPath = `${prefix}/receipt.${extension[data.paymentReceipt.type]}`
      const logoPath = data.teamLogo ? `${prefix}/logo.${extension[data.teamLogo.type]}` : null
      const bucket = client.storage.from(REGISTRATION_BUCKET)
      unwrap(await bucket.upload(receiptPath, data.paymentReceipt, { upsert: true, contentType: data.paymentReceipt.type }))
      if (logoPath) unwrap(await bucket.upload(logoPath, data.teamLogo, { upsert: true, contentType: data.teamLogo.type }))
      // Intentionally retain uploads on an uncertain RPC response: a retry uses the same request ID.
      return unwrap(await client.rpc('submit_registration', { p_request_id: requestId, p_data: buildRegistrationPayload(data, receiptPath, logoPath) }))
    },
    async confirmedTeams(game) {
      const client = getClient()
      return withLogos(client, unwrap(await client.rpc('get_confirmed_teams', { p_game: game })) || [])
    },
    async matches(game, admin = false) {
      const client = getClient()
      let query = client.from('tournament_matches').select('*,match_entries(*)').eq('game_code', game).order('starts_at', { nullsFirst: false }).order('created_at')
      if (!admin) query = query.eq('published', true)
      return unwrap(await query) || []
    },
    async registrations() {
      const client = getClient()
      return withLogos(client, unwrap(await client.from('registrations').select('*,registration_players(*)').order('created_at', { ascending: false }).limit(500)) || [])
    },
    async review(id, status, note) {
      unwrap(await getClient().rpc('review_registration', { p_id: id, p_status: status, p_note: note }))
    },
    async receipt(path) {
      return unwrap(await getClient().storage.from(REGISTRATION_BUCKET).createSignedUrl(path, 300)).signedUrl
    },
    async saveMatch(id, data) {
      return unwrap(await getClient().rpc('save_tournament_match', { p_id: id || null, p_data: data }))
    },
  }
}
export const tournament = createTournamentService()
