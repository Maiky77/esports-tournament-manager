import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createTournamentService } from '../src/lib/tournamentService.js'

function fixture() {
 const stats={uploads:[],rpc:0,auth:0,previous:null,payload:null}
 const owner='11111111-1111-4111-8111-111111111111'
 const client={auth:{getSession:async()=>({data:{session:null}}),signInAnonymously:async()=>{stats.auth++;return {data:{user:{id:owner}}}}},
  from:()=>({select(){return this},eq(){return this},async maybeSingle(){return {data:stats.previous}}}),
  storage:{from:()=>({upload:async(path,file,options)=>{stats.uploads.push({path,file,options});return {data:{path}}}})},
  rpc:async(_name,payload)=>{stats.rpc++;stats.payload=payload;stats.previous={id:'saved-id',reference_code:'R26-SAVED',status:'pending',team_name:'Equipo'};return {error:{message:'Network request failed after the transaction committed'}}},
 }
 const data={game:'ff',teamName:'Equipo',captainName:'Capitan Apellido',captainWhatsapp:'999123456',institution:'Otra',otherInstitution:'Universidad',professionalSchool:'',teamLogo:null,termsAccepted:true,paymentReceipt:{type:'application/pdf',size:100},players:Array.from({length:4},(_,i)=>({nickname:`Jugador ${i}`,id:String(123456+i),server:''}))}
 return {stats,client,data,service:createTournamentService(()=>client)}
}
test('Retry after a lost response recovers the committed registration before uploading',async()=>{
 const {stats,data,service}=fixture()
 await assert.rejects(service.submit(data,'request-uuid'),/conexión/)
 assert.equal(stats.uploads.length,1);assert.equal(stats.rpc,1)
 const result=await service.submit(data,'request-uuid')
 assert.equal(result.reference_code,'R26-SAVED')
 assert.equal(stats.uploads.length,1);assert.equal(stats.rpc,1)
 assert.equal(stats.uploads[0].path,'11111111-1111-4111-8111-111111111111/request-uuid/receipt.pdf')
 assert.equal(stats.payload.p_data.fee_amount,undefined)
})
test('Invalid file or roster never starts a session or uploads personal data',async()=>{
 const {stats,data,service}=fixture()
 data.paymentReceipt={type:'image/svg+xml',size:100}
 await assert.rejects(service.submit(data,'request-uuid'),/Formato/)
 assert.equal(stats.auth,0);assert.equal(stats.uploads.length,0);assert.equal(stats.rpc,0)
})
