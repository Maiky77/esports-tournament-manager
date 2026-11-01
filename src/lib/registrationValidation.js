export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const RECEIPT_TYPES = [...IMAGE_TYPES, 'application/pdf']
export const ROSTER_LIMITS = { mlbb: { required: 5, max: 7 }, ff: { required: 4, max: 5 } }

export function validateUpload(file, receipt = false) {
  if (!file) return receipt ? 'Adjunta el comprobante de pago.' : null
  if (!(receipt ? RECEIPT_TYPES : IMAGE_TYPES).includes(file.type)) return 'Formato no permitido. Usa PNG, JPG, WEBP' + (receipt ? ' o PDF.' : '.')
  if (file.size <= 0 || file.size > MAX_UPLOAD_SIZE) return 'Cada archivo debe pesar entre 1 byte y 5 MB.'
  return null
}

export function validateTeam(data) {
  if (!ROSTER_LIMITS[data.game]) return 'Selecciona una disciplina válida.'
  if (data.teamName.trim().length < 3 || data.teamName.trim().length > 60) return 'El nombre del equipo debe tener entre 3 y 60 caracteres.'
  if (data.captainName.trim().length < 3 || data.captainName.trim().length > 100) return 'Ingresa el nombre completo del capitán (3 a 100 caracteres).'
  if (!/^\+?[0-9]{9,15}$/.test(data.captainWhatsapp.replace(/[\s()-]/g, ''))) return 'Ingresa un WhatsApp válido de 9 a 15 dígitos; puedes incluir el prefijo internacional.'
  if (data.institution === 'UNAP' && !data.professionalSchool.trim()) return 'Selecciona tu escuela profesional.'
  if (data.institution === 'Otra' && (data.otherInstitution.trim().length < 2 || data.otherInstitution.trim().length > 120)) return 'Ingresa tu institución (2 a 120 caracteres).'
  return validateUpload(data.teamLogo)
}

export function validateRoster(game, players, limit = ROSTER_LIMITS[game]) {
  if (!limit) return 'Selecciona una disciplina válida.'
  const seen = new Set()
  for (let i = 0; i < limit.max; i++) {
    const p = players[i] || {}
    const any = [p.nickname, p.id, game === 'mlbb' ? p.server : ''].some(v => v?.trim())
    if (i >= limit.required && !any) continue
    if (!p.nickname?.trim() || p.nickname.trim().length > 40 || !/^[0-9]{4,20}$/.test(p.id || '')) return `Completa el jugador ${i + 1}: nickname (hasta 40 caracteres) e ID numérico de 4 a 20 dígitos.`
    if (game === 'mlbb' && !/^[0-9]{4}$/.test(p.server || '')) return `El Server ID del jugador ${i + 1} debe tener 4 dígitos.`
    const account = p.id + ':' + (game === 'mlbb' ? p.server : '')
    if (seen.has(account)) return 'Un jugador no puede ocupar dos lugares en el roster.'
    seen.add(account)
  }
  return null
}

export function buildRegistrationPayload(data, receiptPath, logoPath) {
  return {
    game: data.game, team_name: data.teamName.trim(), captain_name: data.captainName.trim(),
    captain_whatsapp: data.captainWhatsapp.replace(/[\s()-]/g, ''),
    institution: data.institution === 'UNAP' ? 'UNAP' : data.otherInstitution.trim(),
    professional_school: data.institution === 'UNAP' ? data.professionalSchool : null,
    receipt_path: receiptPath, logo_path: logoPath || null, terms_accepted: data.termsAccepted,
    players: data.players.slice(0, ROSTER_LIMITS[data.game].max)
      .filter(p => p.nickname.trim() || p.id.trim() || (data.game === 'mlbb' && p.server.trim()))
      .map(p => ({ nickname: p.nickname.trim(), id: p.id.trim(), server: data.game === 'mlbb' ? p.server.trim() : '' })),
  }
}
