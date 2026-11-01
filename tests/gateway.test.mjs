import { test } from 'node:test'
import assert from 'node:assert/strict'
import { submitForBackend } from '../src/lib/registrationGateway.js'
const data = { game:'mlbb', teamName:' Equipo ', captainName:' Capitan ', captainWhatsapp:'+51 999 123 456', institution:'UNAP', professionalSchool:'Sistemas', otherInstitution:'', paymentReceipt:{type:'application/pdf'}, teamLogo:null, players:Array.from({length:7},(_,i)=>({nickname:i<5?`Jugador ${i}`:'',id:i<5?String(123456+i):'',server:i<5?'1234':''})) }
test('Primary backend keeps its idempotency key and never invokes the alternate API',async()=>{
 let legacyCalls=0
 const saved=await submitForBackend(data,'request-id','captcha',{legacy:false},{primary:async(payload,id,captcha)=>{assert.equal(payload,data);assert.equal(id,'request-id');assert.equal(captcha,'captcha');return {reference_code:'R26-PRIMARY'}},legacy:async()=>legacyCalls++})
 assert.equal(saved.reference_code,'R26-PRIMARY');assert.equal(legacyCalls,0)
})
test('Alternate backend preserves its game/roster contract and does not fabricate a reference',async()=>{
 let primaryCalls=0
 const saved=await submitForBackend(data,'request-id','',{legacy:true,maxPlayers:7},{validateFile:async()=>null,primary:async()=>primaryCalls++,legacy:async(payload)=>{assert.equal(payload.gameKey,'mlbb');assert.equal(payload.whatsapp,'51999123456');assert.equal(payload.players.length,7);assert.equal(payload.players[0].game_player_id,'123456');assert.equal(payload.players[0].server_id,'1234');assert.equal(payload.school,'Sistemas');return {id:'legacy-id'}}})
 assert.equal(saved.id,'legacy-id');assert.equal(saved.team_name,'Equipo');assert.equal(saved.reference_code,undefined);assert.equal(primaryCalls,0)
})
test('A rejected alternate write never retries against a different contract',async()=>{
 let primaryCalls=0
 await assert.rejects(submitForBackend(data,'request-id','',{legacy:true},{validateFile:async()=>null,primary:async()=>primaryCalls++,legacy:async()=>{throw new Error('Cupos agotados')}}),/Cupos agotados/)
 assert.equal(primaryCalls,0)
})
