import { useState } from 'react'
import { YAPE } from '../data/payment'
import { useTournament } from '../context/TournamentContext'
import { formatSoles } from '../lib/money'
import { publicUrl } from '../lib/tournamentApi'
import Icon from './Icon'

export default function YapePayment({ amount }) {
  const { games, settings } = useTournament()
  const qrImage = YAPE.qrImage || publicUrl('public-assets', settings.yape_qr_path)
  const [copyStatus, setCopyStatus] = useState('')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(YAPE.number)
      setCopyStatus('Número copiado')
    } catch {
      setCopyStatus('Selecciona el número y cópialo manualmente.')
    }
  }
  return <aside className="yape-payment" aria-label="Datos oficiales para pagar con Yape">
    <div className="yape-payment-heading"><span className="yape-wordmark">yape</span><span>PAGO DE INSCRIPCIÓN</span><Icon name="wallet" size={22} /></div>
    <div className="yape-recipient"><span>YAPEA A ESTE NÚMERO</span><strong className="yape-number">{YAPE.formattedNumber}</strong><p>A nombre de <b>{YAPE.holder}</b></p></div>
    <button type="button" className="yape-copy" onClick={copy}><Icon name={copyStatus === 'Número copiado' ? 'check' : 'copy'} size={16} />{copyStatus === 'Número copiado' ? 'NÚMERO COPIADO' : 'COPIAR NÚMERO'}</button>
    <span className="yape-copy-status" role="status">{copyStatus}</span>
    {amount ? <div className="yape-amount"><span>IMPORTE DE TU EQUIPO</span><strong>{amount}</strong></div> : <div className="yape-fees"><span>MLBB <b>{formatSoles(games.mlbb.price)}</b></span><span>FREE FIRE <b>{formatSoles(games.ff.price)}</b></span></div>}
    <div className="yape-verification"><Icon name="shield" size={16} /><p>Verifica que aparezca <strong>{YAPE.holder}</strong> antes de confirmar. Adjunta la captura en tu inscripción.</p></div>
    {qrImage ? <img className="yape-qr" src={qrImage} alt={`QR de Yape de ${YAPE.holder}`} width="200" height="200" /> : <p className="yape-qr-note">QR próximamente. Ya puedes pagar con el número.</p>}
  </aside>
}
