import { tournament } from './tournamentService.js'
import { submitRegistration, validateUpload } from './tournamentApi.js'
import { ROSTER_LIMITS } from './registrationValidation.js'

// Choose the confirmed API contract before uploading. Never retry a failed write using another contract.
export async function submitForBackend(data, requestId, captchaToken, options = {}, dependencies = {}) {
  if (!options.legacy) return (dependencies.primary || tournament.submit)(data, requestId, captchaToken)
  const validate = dependencies.validateFile || validateUpload
  for (const [file, allowPdf] of [[data.paymentReceipt, true], [data.teamLogo, false]]) {
    if (file) { const error = await validate(file, { allowPdf }); if (error) throw new Error(error) }
  }
  const saved = await (dependencies.legacy || submitRegistration)({
    gameKey: data.game, team: data.teamName.trim(), captain: data.captainName.trim(),
    whatsapp: data.captainWhatsapp.replace(/[^0-9]/g, ''), institution: data.institution,
    school: data.professionalSchool, otherInstitution: data.otherInstitution.trim(),
    players: data.players.slice(0, options.maxPlayers || ROSTER_LIMITS[data.game].max).map(player => ({
      nickname: player.nickname.trim(), game_player_id: player.id.trim(), server_id: data.game === 'mlbb' ? player.server.trim() : '',
    })),
    receipt: data.paymentReceipt, logo: data.teamLogo, honeypot: data.honeypot || '',
  })
  return { ...(saved && typeof saved === 'object' ? saved : {}), team_name: data.teamName.trim(), status: 'pending' }
}
