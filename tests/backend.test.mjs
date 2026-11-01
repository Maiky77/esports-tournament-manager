import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

let db
const captain = randomUUID(), other = randomUUID(), organizer = randomUUID()
let first, second, matchId
const request = () => randomUUID()
async function postgres() { await db.exec('reset role') }
async function actor(id) {
  await db.exec('reset role; set role authenticated;')
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id])
}
async function visitor() {
  await db.exec('reset role; set role anon;')
  await db.query("select set_config('request.jwt.claim.sub','',false)")
}
async function file(owner, id, filename = 'receipt.pdf', mime = 'application/pdf') {
  const path = `${owner}/${id}/${filename}`
  await db.query("insert into storage.objects(bucket_id,name,metadata) values('registration-files',$1,$2)", [path, { mimetype: mime, size: 200 }])
  return path
}
function payload(id, owner, name = 'Equipo Norte', game = 'mlbb', offset = 0) {
  return { game, team_name: name, captain_name: 'Capitan de prueba', captain_whatsapp: '+51999123456', institution: 'UNAP', professional_school: 'Ingenieria de Sistemas', receipt_path: `${owner}/${id}/receipt.pdf`, terms_accepted: true,
    players: Array.from({ length: game === 'mlbb' ? 5 : 4 }, (_, i) => ({ nickname: `Jugador ${i}`, id: String(100000 + offset + i), server: game === 'mlbb' ? '1234' : '' })),
    status: 'approved', fee_amount: 0, owner_id: organizer,
  }
}
async function submit(id, data) {
  return (await db.query('select public.submit_registration($1,$2) result', [id, data])).rows[0].result
}
async function review(id, status, note = '') { return db.query('select public.review_registration($1,$2,$3)', [id, status, note]) }
async function teams(game = 'mlbb') { return (await db.query('select public.get_confirmed_teams($1) teams', [game])).rows[0].teams }
async function save(id, data) { return (await db.query('select public.save_tournament_match($1,$2) id', [id, data])).rows[0].id }

before(async () => {
  db = new PGlite()
  await db.exec(`create role anon nologin; create role authenticated nologin;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
    create schema storage;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,metadata jsonb,unique(bucket_id,name));
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon,authenticated; grant select,insert,update,delete on storage.objects to anon,authenticated;`)
  for (const id of [captain, other, organizer]) await db.query('insert into auth.users values($1)', [id])
  try { await db.exec(await readFile(new URL('../supabase/migrations/202611010001_event_backend.sql', import.meta.url), 'utf8')) } catch (e) { throw new Error(`${e.message}; position=${e.position}; ${e.where || ''}`) }
  await db.query('insert into private.event_admins(user_id) values($1)', [organizer])
  await db.exec("update public.tournament_divisions set registration_closes_at=now()+interval '1 year'")
})
after(async () => { await db?.close() })

test('Visitors cannot submit or read private tables; public lists start empty', async () => {
  await visitor()
  assert.deepEqual(await teams(), [])
  await assert.rejects(submit(request(), {}), /permission denied/)
  await assert.rejects(db.query('select * from public.registrations'), /permission denied/)
  await assert.rejects(db.query('select * from private.event_admins'), /permission denied/)
})
test('Registration is atomic, pending and uses the server price and owner', async () => {
  await actor(captain)
  const id = request(); await file(captain, id)
  const bad = payload(id, captain); bad.players[4].server = 'abc'
  await assert.rejects(submit(id, bad), /INVALID_ROSTER/)
  assert.equal((await db.query('select count(*)::int n from public.registrations')).rows[0].n, 0)
  const data = payload(id, captain)
  data.logo_path = await file(captain, id, 'logo.png', 'image/png')
  first = { ...(await submit(id, data)), request: id, data }
  assert.equal(first.status, 'pending')
  const row = (await db.query('select * from public.registrations')).rows[0]
  assert.equal(row.owner_id, captain); assert.equal(Number(row.fee_amount), 20); assert.equal(row.status, 'pending')
  assert.equal((await db.query('select count(*)::int n from public.registration_players')).rows[0].n, 5)
  assert.deepEqual(await teams(), [])
})
test('A retry returns the same reference without adding a second roster', async () => {
  await actor(captain)
  const retried = await submit(first.request, first.data)
  assert.equal(retried.id, first.id); assert.equal(retried.reference_code, first.reference_code)
  assert.equal((await db.query('select count(*)::int n from public.registration_players')).rows[0].n, 5)
  await actor(other)
  await assert.rejects(submit(first.request, first.data), /INVALID_REQUEST/)
  assert.equal((await db.query('select count(*)::int n from public.registrations')).rows[0].n, 0)
  assert.equal((await db.query('select count(*)::int n from public.registration_players')).rows[0].n, 0)
  assert.equal((await db.query("select count(*)::int n from storage.objects where name=$1", [first.data.receipt_path])).rows[0].n, 0)
})
test('File policies prevent cross-owner uploads and edits to a finalized submission', async () => {
  await actor(other)
  await assert.rejects(file(captain, request()), /row-level security/)
  await actor(captain)
  await assert.rejects(file(captain, first.request, 'logo.jpg', 'image/jpeg'), /row-level security/)
  const changed = await db.query("update storage.objects set metadata='{}' where name=$1 returning id", [first.data.receipt_path])
  assert.equal(changed.rows.length, 0)
  const removed = await db.query('delete from storage.objects where name=$1 returning id', [first.data.receipt_path])
  assert.equal(removed.rows.length, 0)
})
test('Team names, duplicate accounts, consent and partial substitutes are validated', async () => {
  await actor(other)
  const id = request(); await file(other, id)
  await assert.rejects(submit(id, payload(id, other, 'equipo norte', 'mlbb', 100)), /TEAM_NAME_TAKEN/)
  await assert.rejects(submit(id, payload(id, other, 'Otro equipo')), /PLAYER_ALREADY_REGISTERED/)
  const data = payload(id, other, 'Equipo Sur', 'mlbb', 100)
  data.players[4] = data.players[0]
  await assert.rejects(submit(id, data), /DUPLICATE_PLAYER/)
  data.players = payload(id, other, 'x', 'mlbb', 100).players
  data.terms_accepted = false
  await assert.rejects(submit(id, data), /INVALID_TEAM_DATA/)
  data.terms_accepted = true
  data.players.push({ nickname: 'Suplente', id: '', server: '' })
  await assert.rejects(submit(id, data), /INVALID_ROSTER/)
  data.players.pop()
  second = await submit(id, data)
})
test('Only organizers can approve; public projection excludes contacts and game IDs', async () => {
  await actor(captain)
  assert.equal((await db.query('select public.is_event_admin() yes')).rows[0].yes, false)
  await assert.rejects(review(first.id, 'approved'), /ADMIN_REQUIRED/)
  await assert.rejects(db.query("update public.registrations set status='approved'"), /permission denied/)
  await actor(organizer)
  assert.equal((await db.query('select public.registrations.* from public.registrations')).rows.length, 2)
  await review(first.id, 'approved'); await review(second.id, 'approved')
  await visitor()
  const publicTeams = await teams()
  assert.equal(publicTeams.length, 2)
  for (const team of publicTeams) {
    assert.deepEqual(Object.keys(team).sort(), ['id','team_name','game_code','institution','professional_school','logo_path','players'].sort())
    assert.deepEqual(Object.keys(team.players[0]).sort(), ['nickname','slot'])
  }
  assert.equal((await db.query('select name from storage.objects')).rows.length, 1)
  assert.equal((await db.query('select name from storage.objects')).rows[0].name, first.data.logo_path)
})
test('Draft fixtures stay private and writes require organizer rights', async () => {
  const fixture = { game_code:'mlbb',title:'Serie 01',round_name:'Semifinal',status:'scheduled',published:false, entries:[{registration_id:first.id},{registration_id:second.id}] }
  await actor(captain)
  await assert.rejects(save(null, fixture), /ADMIN_REQUIRED/)
  await actor(organizer)
  matchId = await save(null, fixture)
  assert.equal((await db.query('select * from public.tournament_matches')).rows.length, 1)
  await visitor()
  assert.equal((await db.query('select * from public.tournament_matches')).rows.length, 0)
  assert.equal((await db.query('select * from public.match_entries')).rows.length, 0)
  await actor(organizer)
  fixture.published=true
  await save(matchId, fixture)
  await visitor()
  assert.equal((await db.query('select * from public.tournament_matches')).rows.length, 1)
  assert.equal((await db.query('select * from public.match_entries')).rows.length, 2)
})
test('Fixture checks prevent duplicate teams and unfinished or tied results', async () => {
  await actor(organizer)
  const fixture = { game_code:'mlbb',title:'Serie 01',round_name:'Final',status:'finished',published:true, entries:[{registration_id:first.id},{registration_id:second.id}] }
  await assert.rejects(save(matchId, fixture), /MATCH_RESULT_REQUIRED/)
  fixture.entries[0].score=1;fixture.entries[1].score=1
  await assert.rejects(save(matchId, fixture), /MATCH_TIE_NOT_ALLOWED/)
  fixture.entries[1].score=2
  await save(matchId, fixture)
  await assert.rejects(review(first.id, 'rejected','Pago duplicado'), /TEAM_HAS_MATCHES/)
  fixture.entries[1].registration_id=first.id
  await assert.rejects(save(matchId, fixture), /INVALID_MATCH_TEAMS/)
  assert.equal((await db.query('select count(*)::int n from public.match_entries')).rows[0].n, 2)
})
test('FF roster and price differ; rejection requires a reason and frees player accounts', async () => {
  await actor(other)
  let id=request();await file(other,id)
  const data=payload(id,other,'Squad Oeste','ff',500)
  const ff=await submit(id,data)
  assert.equal(Number((await db.query('select fee_amount from public.registrations where id=$1',[ff.id])).rows[0].fee_amount),15)
  await actor(organizer)
  await assert.rejects(review(ff.id,'rejected'),/REVIEW_NOTE_REQUIRED/)
  await review(ff.id,'rejected','Comprobante incorrecto')
  await assert.rejects(review(ff.id,'approved'),/REGISTRATION_ALREADY_REJECTED/)
  await actor(other)
  id=request();await file(other,id)
  await submit(id,{...data,receipt_path:`${other}/${id}/receipt.pdf`})
})
test('A closed division rejects submissions on the server', async () => {
  await postgres();await db.exec("update public.tournament_divisions set registration_open=false where game_code='ff'")
  await actor(captain)
  const id=request();await file(captain,id)
  await assert.rejects(submit(id,payload(id,captain,'Cerrado FF','ff',800)),/REGISTRATION_CLOSED/)
})
