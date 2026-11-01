-- RAGNAROK U-Series. Apply once with Supabase migrations or SQL Editor.
begin;
create schema if not exists private;
revoke all on schema private from public;

create table private.event_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.event_admins enable row level security;

create function public.is_event_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.event_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_event_admin() from public;
grant execute on function public.is_event_admin() to authenticated;

create table public.tournament_divisions (
  game_code text primary key check(game_code in ('mlbb', 'ff')),
  name text not null,
  required_players integer not null,
  max_players integer not null,
  fee_amount numeric(8,2) not null check(fee_amount >= 0),
  registration_open boolean not null default true,
  registration_closes_at timestamptz not null,
  check(required_players > 0 and max_players >= required_players)
);
insert into public.tournament_divisions values
 ('mlbb','Mobile Legends: Bang Bang',5,7,20,true,'2026-12-15 23:59:59-05'),
 ('ff','Free Fire',4,5,15,true,'2026-12-15 23:59:59-05');
alter table public.tournament_divisions enable row level security;
create policy divisions_read on public.tournament_divisions for select to anon, authenticated using(true);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  reference_code text not null unique default ('R26-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  owner_id uuid not null references auth.users(id),
  game_code text not null references public.tournament_divisions(game_code),
  team_name text not null check(length(btrim(team_name)) between 3 and 60),
  captain_name text not null check(length(btrim(captain_name)) between 3 and 100),
  captain_whatsapp text not null check(captain_whatsapp ~ '^\+?[0-9]{9,15}$'),
  institution text not null check(length(btrim(institution)) between 2 and 120),
  professional_school text check(length(professional_school) <= 160),
  logo_path text,
  receipt_path text not null,
  fee_amount numeric(8,2) not null,
  terms_version text not null default '2026-01',
  terms_accepted_at timestamptz not null default now(),
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  review_note text not null default '',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index registrations_active_team_name on public.registrations(game_code,lower(btrim(team_name))) where status <> 'rejected';
create index registrations_owner on public.registrations(owner_id);
create index registrations_game_status on public.registrations(game_code,status,created_at);
alter table public.registrations enable row level security;
create policy registrations_private_read on public.registrations for select to authenticated
 using(owner_id = (select auth.uid()) or (select public.is_event_admin()));

create table public.registration_players (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  slot integer not null check(slot between 1 and 7),
  nickname text not null check(length(btrim(nickname)) between 1 and 40),
  player_id text not null check(player_id ~ '^[0-9]{4,20}$'),
  server_id text not null default '' check(server_id = '' or server_id ~ '^[0-9]{4}$'),
  unique(registration_id,slot),
  unique(registration_id,player_id,server_id)
);
create index players_account on public.registration_players(player_id,server_id);
alter table public.registration_players enable row level security;
create policy players_private_read on public.registration_players for select to authenticated
 using(exists(select 1 from public.registrations r where r.id = registration_id));

create table public.tournament_matches (
 id uuid primary key default gen_random_uuid(),
 game_code text not null references public.tournament_divisions(game_code),
 title text not null check(length(btrim(title)) between 3 and 100),
 round_name text not null check(length(btrim(round_name)) between 1 and 80),
 starts_at timestamptz,
 status text not null default 'scheduled' check(status in ('scheduled','live','finished')),
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create index matches_game_date on public.tournament_matches(game_code,starts_at);
alter table public.tournament_matches enable row level security;
create policy matches_read on public.tournament_matches for select to anon using(published);
create policy matches_authenticated_read on public.tournament_matches for select to authenticated using(published or (select public.is_event_admin()));
create table public.match_entries (
 match_id uuid not null references public.tournament_matches(id) on delete cascade,
 registration_id uuid not null references public.registrations(id),
 slot integer not null check(slot between 1 and 48),
 score integer check(score between 0 and 10000),
 placement integer check(placement between 1 and 48),
 kills integer check(kills between 0 and 1000),
 primary key(match_id,registration_id),
 unique(match_id,slot)
);
create index match_entries_registration on public.match_entries(registration_id);
alter table public.match_entries enable row level security;
create policy match_entries_read on public.match_entries for select to anon,authenticated
 using(exists(select 1 from public.tournament_matches m where m.id = match_id));

grant select on public.tournament_divisions,public.tournament_matches,public.match_entries to anon,authenticated;
grant select on public.registrations,public.registration_players to authenticated;
-- No direct writes from the browser. All writes go through validated RPCs.
revoke insert,update,delete on public.tournament_divisions,public.registrations,public.registration_players,public.tournament_matches,public.match_entries from anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('registration-files','registration-files',false,5242880,array['image/png','image/jpeg','image/webp','application/pdf']);

create function public.can_edit_registration_file(object_path text) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null
  and split_part(object_path,'/',1) = auth.uid()::text
  and object_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/(receipt[.](png|jpg|webp|pdf)|logo[.](png|jpg|webp))$'
  and not exists(select 1 from public.registrations r where r.request_id::text = split_part(object_path,'/',2));
$$;
create function public.is_approved_team_logo(object_path text) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.registrations r where r.status='approved' and r.logo_path=object_path);
$$;
revoke all on function public.can_edit_registration_file(text),public.is_approved_team_logo(text) from public;
grant execute on function public.can_edit_registration_file(text) to authenticated;
grant execute on function public.is_approved_team_logo(text) to anon,authenticated;
create policy registration_files_insert on storage.objects for insert to authenticated
 with check(bucket_id='registration-files' and public.can_edit_registration_file(name));
create policy registration_files_update on storage.objects for update to authenticated
 using(bucket_id='registration-files' and public.can_edit_registration_file(name))
 with check(bucket_id='registration-files' and public.can_edit_registration_file(name));
create policy registration_files_delete on storage.objects for delete to authenticated
 using(bucket_id='registration-files' and public.can_edit_registration_file(name));
create policy registration_files_private_read on storage.objects for select to authenticated
 using(bucket_id='registration-files' and (split_part(name,'/',1)=(select auth.uid())::text or (select public.is_event_admin())));
create policy approved_logos_read on storage.objects for select to anon,authenticated
 using(bucket_id='registration-files' and public.is_approved_team_logo(name));

create function public.submit_registration(p_request_id uuid,p_data jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
 v_owner uuid := auth.uid();
 v_existing public.registrations%rowtype;
 v_div public.tournament_divisions%rowtype;
 v_id uuid;
 v_ref text;
 v_player jsonb;
 v_index integer := 0;
 v_prefix text;
 v_receipt text := p_data->>'receipt_path';
 v_logo text := nullif(p_data->>'logo_path','');
begin
 if v_owner is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_request_id is null then raise exception 'INVALID_REQUEST'; end if;
 -- Serialize retries for the same request, then serialize a division's roster checks.
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 select * into v_existing from public.registrations where request_id=p_request_id;
 if found then
  if v_existing.owner_id <> v_owner then raise exception 'INVALID_REQUEST'; end if;
  return jsonb_build_object('id',v_existing.id,'reference_code',v_existing.reference_code,'status',v_existing.status,'team_name',v_existing.team_name);
 end if;
 select * into v_div from public.tournament_divisions where game_code=p_data->>'game';
 if not found then raise exception 'INVALID_GAME'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_div.game_code,0));
 if not v_div.registration_open or now() > v_div.registration_closes_at then raise exception 'REGISTRATION_CLOSED'; end if;
 if (select count(*) from public.registrations where owner_id=v_owner and game_code=v_div.game_code and status <> 'rejected') >= 3 then raise exception 'REGISTRATION_LIMIT'; end if;
 if coalesce(length(btrim(p_data->>'team_name')),0) not between 3 and 60
  or coalesce(length(btrim(p_data->>'captain_name')),0) not between 3 and 100
  or coalesce(p_data->>'captain_whatsapp','') !~ '^\+?[0-9]{9,15}$'
  or coalesce(length(btrim(p_data->>'institution')),0) not between 2 and 120
  or coalesce(length(p_data->>'professional_school'),0) > 160
  or (p_data->>'institution'='UNAP' and coalesce(length(btrim(p_data->>'professional_school')),0)=0)
  or coalesce(p_data->>'terms_accepted','false') <> 'true'
 then raise exception 'INVALID_TEAM_DATA'; end if;
 if jsonb_typeof(p_data->'players') is distinct from 'array' then raise exception 'INVALID_ROSTER'; end if;
 if jsonb_array_length(p_data->'players') not between v_div.required_players and v_div.max_players then raise exception 'INVALID_ROSTER'; end if;
 if exists(select 1 from public.registrations where game_code=v_div.game_code and lower(btrim(team_name))=lower(btrim(p_data->>'team_name')) and status<>'rejected') then raise exception 'TEAM_NAME_TAKEN'; end if;
 v_prefix := v_owner::text || '/' || p_request_id::text || '/';
 if v_receipt is null or v_receipt !~ ('^' || v_prefix || 'receipt[.](png|jpg|webp|pdf)$')
  or not exists(select 1 from storage.objects where bucket_id='registration-files' and name=v_receipt and metadata->>'mimetype' in ('image/png','image/jpeg','image/webp','application/pdf') and (metadata->>'size')::bigint between 1 and 5242880)
 then raise exception 'RECEIPT_REQUIRED'; end if;
 if v_logo is not null and (v_logo !~ ('^' || v_prefix || 'logo[.](png|jpg|webp)$')
  or not exists(select 1 from storage.objects where bucket_id='registration-files' and name=v_logo and metadata->>'mimetype' in ('image/png','image/jpeg','image/webp') and (metadata->>'size')::bigint between 1 and 5242880))
 then raise exception 'INVALID_LOGO'; end if;
 for v_player in select value from jsonb_array_elements(p_data->'players') loop
  if coalesce(length(btrim(v_player->>'nickname')),0) not between 1 and 40
   or coalesce(v_player->>'id','') !~ '^[0-9]{4,20}$'
   or (v_div.game_code='mlbb' and coalesce(v_player->>'server','') !~ '^[0-9]{4}$')
  then raise exception 'INVALID_ROSTER'; end if;
  if exists(select 1 from public.registration_players p join public.registrations r on r.id=p.registration_id
   where r.game_code=v_div.game_code and r.status<>'rejected'
   and p.player_id=v_player->>'id' and p.server_id=case when v_div.game_code='mlbb' then v_player->>'server' else '' end)
  then raise exception 'PLAYER_ALREADY_REGISTERED'; end if;
 end loop;
 if (select count(distinct (value->>'id',case when v_div.game_code='mlbb' then value->>'server' else '' end)) from jsonb_array_elements(p_data->'players')) <> jsonb_array_length(p_data->'players') then raise exception 'DUPLICATE_PLAYER'; end if;
 insert into public.registrations(request_id,owner_id,game_code,team_name,captain_name,captain_whatsapp,institution,professional_school,logo_path,receipt_path,fee_amount)
 values(p_request_id,v_owner,v_div.game_code,btrim(p_data->>'team_name'),btrim(p_data->>'captain_name'),p_data->>'captain_whatsapp',btrim(p_data->>'institution'),nullif(btrim(p_data->>'professional_school'),''),v_logo,v_receipt,v_div.fee_amount)
 returning id,reference_code into v_id,v_ref;
 for v_player in select value from jsonb_array_elements(p_data->'players') loop
  v_index := v_index+1;
  insert into public.registration_players(registration_id,slot,nickname,player_id,server_id)
  values(v_id,v_index,btrim(v_player->>'nickname'),v_player->>'id',case when v_div.game_code='mlbb' then v_player->>'server' else '' end);
 end loop;
 return jsonb_build_object('id',v_id,'reference_code',v_ref,'status','pending','team_name',btrim(p_data->>'team_name'));
end; $$;
revoke all on function public.submit_registration(uuid,jsonb) from public;
grant execute on function public.submit_registration(uuid,jsonb) to authenticated;

-- Deliberately small public projection: no contact info, game IDs or receipt paths.
create function public.get_confirmed_teams(p_game text) returns jsonb
language sql stable security definer set search_path = '' as $$
 select coalesce(jsonb_agg(team order by team->>'team_name'),'[]'::jsonb) from (
  select jsonb_build_object('id',r.id,'team_name',r.team_name,'game_code',r.game_code,
   'institution',r.institution,'professional_school',r.professional_school,'logo_path',r.logo_path,
   'players',(select coalesce(jsonb_agg(jsonb_build_object('nickname',p.nickname,'slot',p.slot) order by p.slot),'[]'::jsonb) from public.registration_players p where p.registration_id=r.id)) team
  from public.registrations r where r.status='approved' and r.game_code=p_game limit 500
 ) t;
$$;
revoke all on function public.get_confirmed_teams(text) from public;
grant execute on function public.get_confirmed_teams(text) to anon,authenticated;

create function public.review_registration(p_id uuid,p_status text,p_note text default '') returns void
language plpgsql security definer set search_path = '' as $$
declare v_game text;
begin
 if not public.is_event_admin() then raise exception 'ADMIN_REQUIRED'; end if;
 if p_status not in ('approved','rejected') or p_status is null or coalesce(length(p_note),0)>1000 then raise exception 'INVALID_REVIEW'; end if;
 if p_status='rejected' and coalesce(length(btrim(p_note)),0)<3 then raise exception 'REVIEW_NOTE_REQUIRED'; end if;
 select game_code into v_game from public.registrations where id=p_id;
 if not found then raise exception 'REGISTRATION_NOT_FOUND'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_game,0));
 if p_status='rejected' and exists(select 1 from public.match_entries where registration_id=p_id) then raise exception 'TEAM_HAS_MATCHES'; end if;
 -- A rejected roster may have been replaced by a later application; never revive it silently.
 update public.registrations set status=p_status,review_note=coalesce(btrim(p_note),''),reviewed_by=auth.uid(),reviewed_at=now()
 where id=p_id and status <> 'rejected';
 if not found then raise exception 'REGISTRATION_ALREADY_REJECTED'; end if;
end; $$;
revoke all on function public.review_registration(uuid,text,text) from public;
grant execute on function public.review_registration(uuid,text,text) to authenticated;

create function public.save_tournament_match(p_id uuid,p_data jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
 v_id uuid := coalesce(p_id,gen_random_uuid());
 v_game text := p_data->>'game_code';
 v_entries jsonb := p_data->'entries';
 v_published boolean := coalesce((p_data->>'published')::boolean,false);
 v_status text := p_data->>'status';
 v_entry jsonb;
 v_slot integer := 0;
begin
 if not public.is_event_admin() then raise exception 'ADMIN_REQUIRED'; end if;
 if v_game not in ('mlbb','ff') or v_game is null
  or coalesce(length(btrim(p_data->>'title')),0) not between 3 and 100
  or coalesce(length(btrim(p_data->>'round_name')),0) not between 1 and 80
  or v_status is null or v_status not in ('scheduled','live','finished')
  or jsonb_typeof(v_entries) is distinct from 'array'
 then raise exception 'INVALID_MATCH'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_game,0));
 if jsonb_array_length(v_entries)>(case when v_game='mlbb' then 2 else 48 end)
  or (v_published and jsonb_array_length(v_entries)<2)
  or (v_status='finished' and jsonb_array_length(v_entries)<2)
 then raise exception 'INVALID_MATCH_TEAMS'; end if;
 if (select count(distinct value->>'registration_id') from jsonb_array_elements(v_entries)) <> jsonb_array_length(v_entries) then raise exception 'INVALID_MATCH_TEAMS'; end if;
 for v_entry in select value from jsonb_array_elements(v_entries) loop
  if not exists(select 1 from public.registrations where id=(v_entry->>'registration_id')::uuid and status='approved' and game_code=v_game) then raise exception 'INVALID_MATCH_TEAMS'; end if;
  if v_status='finished' and (
   (v_game='mlbb' and (v_entry->>'score') is null) or
   (v_game='ff' and ((v_entry->>'placement') is null or (v_entry->>'kills') is null))
  ) then raise exception 'MATCH_RESULT_REQUIRED'; end if;
 end loop;
 if v_status='finished' and v_game='mlbb' then
  if (v_entries->0->>'score')::integer=(v_entries->1->>'score')::integer then raise exception 'MATCH_TIE_NOT_ALLOWED'; end if;
 end if;
 if v_game='ff' and exists(select 1 from jsonb_array_elements(v_entries) e where e->>'placement' is not null group by e->>'placement' having count(*)>1) then raise exception 'DUPLICATE_PLACEMENT'; end if;
 if p_id is not null and not exists(select 1 from public.tournament_matches where id=p_id and game_code=v_game) then raise exception 'MATCH_NOT_FOUND'; end if;
 insert into public.tournament_matches(id,game_code,title,round_name,starts_at,status,published)
 values(v_id,v_game,btrim(p_data->>'title'),btrim(p_data->>'round_name'),nullif(p_data->>'starts_at','')::timestamptz,v_status,v_published)
 on conflict(id) do update set title=excluded.title,round_name=excluded.round_name,starts_at=excluded.starts_at,status=excluded.status,published=excluded.published;
 delete from public.match_entries where match_id=v_id;
 for v_entry in select value from jsonb_array_elements(v_entries) loop
  v_slot := v_slot+1;
  insert into public.match_entries(match_id,registration_id,slot,score,placement,kills)
  values(v_id,(v_entry->>'registration_id')::uuid,v_slot,
   case when v_game='mlbb' then (v_entry->>'score')::integer else null end,
   case when v_game='ff' then (v_entry->>'placement')::integer else null end,
   case when v_game='ff' then (v_entry->>'kills')::integer else null end);
 end loop;
 return v_id;
end; $$;
revoke all on function public.save_tournament_match(uuid,jsonb) from public;
grant execute on function public.save_tournament_match(uuid,jsonb) to authenticated;
commit;
