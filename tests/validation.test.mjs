import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateRoster, validateTeam, validateUpload, buildRegistrationPayload } from '../src/lib/registrationValidation.js'
const players = Array.from({ length:7 },(_,i) => ({ nickname:i<5?`Jugador ${i}`:'',id:i<5?String(123456+i):'',server:i<5?'1234':'' }))
const data={game:'mlbb',teamName:' Equipo ',captainName:'Capitan Apellido',captainWhatsapp:'+51 999 123 456',institution:'UNAP',professionalSchool:'Sistemas',otherInstitution:'',teamLogo:null,players,termsAccepted:true}
test('Phone, optional substitutes, server IDs and repeated accounts',()=>{
 assert.equal(validateTeam(data),null)
 assert.ok(validateTeam({...data,captainWhatsapp:'12345678'}))
 assert.equal(validateRoster('mlbb',players),null)
 assert.ok(validateRoster('mlbb',[...players.slice(0,5),{nickname:'Solo nombre',id:'',server:''}]))
 assert.ok(validateRoster('mlbb',[players[0],players[0],...players.slice(2)]))
 assert.ok(validateRoster('mlbb',players.map(p=>({...p,server:'123'}))))
 assert.equal(validateRoster('ff',players.slice(0,4).map(p=>({...p,server:''}))),null)
})
test('Uploads reject unsupported content, empty files and oversized receipts',()=>{
 assert.ok(validateUpload({type:'image/svg+xml',size:10}))
 assert.ok(validateUpload({type:'image/png',size:0}))
 assert.ok(validateUpload({type:'application/pdf',size:6*1024*1024},true))
 assert.equal(validateUpload({type:'application/pdf',size:50},true),null)
 assert.ok(validateUpload(null,true));assert.equal(validateUpload(null),null)
})
test('Payload keeps only the current game roster, normalizes phone and excludes client pricing',()=>{
 const payload=buildRegistrationPayload({...data,game:'ff'},'receipt.pdf',null)
 assert.equal(payload.players.length,5)
 assert.equal(payload.captain_whatsapp,'+51999123456')
 assert.ok(payload.players.every(p=>p.server===''))
 assert.equal(payload.fee_amount,undefined);assert.equal(payload.status,undefined)
 assert.equal(payload.team_name,'Equipo')
})
