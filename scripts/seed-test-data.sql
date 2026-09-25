-- Test data for No Way Back: fake raiders, their characters and one upcoming raid.
-- Every fake user has an email ending in @nwb.test; scripts/clear-test-data.sql removes them all.
-- Role changes are guarded by a trigger that requires an officer, so this runs as the Guild Master.

do $$
declare
  gm uuid := (select id from profiles where guild_role = 'guild_master' order by created_at limit 1);
  server uuid := (select s.server_id from guild_settings g join seasons s on s.id = g.active_season_id);
  raid uuid;
  p record;
  uid uuid;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', gm, 'role', 'authenticated')::text, true);

  for p in
    select * from (values
      ('Brakka',      'warrior',      'Protection',    'tank',   5980, 'Brakkadin',  'paladin', 'Protection', 'tank',   5100),
      ('Morthul',     'death_knight', 'Blood',         'tank',   5890, null, null, null, null, null),
      ('Ursakar',     'druid',        'Feral (Tank)',  'tank',   5720, null, null, null, null, null),
      ('Lightveil',   'paladin',      'Holy',          'healer', 5850, null, null, null, null, null),
      ('Seraphine',   'priest',       'Discipline',    'healer', 5760, 'Serashade',  'priest',  'Shadow',     'dps',    4900),
      ('Tidecaller',  'shaman',       'Restoration',   'healer', 5690, null, null, null, null, null),
      ('Elunara',     'druid',        'Restoration',   'healer', 5610, null, null, null, null, null),
      ('Aurelion',    'priest',       'Holy',          'healer', 5540, null, null, null, null, null),
      ('Vexmora',     'warlock',      'Affliction',    'dps',    6010, 'Vexfrost',   'mage',    'Frost',      'dps',    5050),
      ('Frostfang',   'mage',         'Fire',          'dps',    5950, null, null, null, null, null),
      ('Shadowkiss',  'rogue',        'Combat',        'dps',    5880, null, null, null, null, null),
      ('Bloodreaver', 'death_knight', 'Unholy',        'dps',    5820, null, null, null, null, null),
      ('Grimtusk',    'warrior',      'Fury',          'dps',    5790, 'Grimholy',   'paladin', 'Holy',       'healer', 4800),
      ('Stormhowl',   'shaman',       'Enhancement',   'dps',    5710, null, null, null, null, null),
      ('Arrowind',    'hunter',       'Marksmanship',  'dps',    5690, null, null, null, null, null),
      ('Nightsong',   'druid',        'Balance',       'dps',    5650, null, null, null, null, null),
      ('Emberlyn',    'mage',         'Arcane',        'dps',    5600, null, null, null, null, null),
      ('Hexbolt',     'warlock',      'Destruction',   'dps',    5530, null, null, null, null, null),
      ('Duskblade',   'rogue',        'Assassination', 'dps',    5470, null, null, null, null, null),
      ('Rimeborn',    'death_knight', 'Frost',         'dps',    5390, null, null, null, null, null),
      ('Voidwhisper', 'priest',       'Shadow',        'dps',    5310, null, null, null, null, null),
      ('Thornpaw',    'hunter',       'Survival',      'dps',    5200, null, null, null, null, null),
      ('Sunreaver',   'paladin',      'Retribution',   'dps',    5120, null, null, null, null, null)
    ) as t(name, class, spec, role, gs, alt, alt_class, alt_spec, alt_role, alt_gs)
  loop
    uid := gen_random_uuid();
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
    values (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            lower(p.name) || '@nwb.test', json_build_object('full_name', lower(p.name), 'seed', true),
            '{"provider":"seed"}', now(), now());

    update profiles set known_as = p.name, guild_role = 'raider' where id = uid;

    insert into characters (owner_id, server_id, name, class, spec_primary, role, gearscore, is_main)
    values (uid, server, p.name, p.class::wow_class, p.spec, p.role::character_role, p.gs, true);

    if p.alt is not null then
      insert into characters (owner_id, server_id, name, class, spec_primary, role, gearscore, is_main)
      values (uid, server, p.alt, p.alt_class::wow_class, p.alt_spec, p.alt_role::character_role, p.alt_gs, false);
    end if;
  end loop;

  -- Wednesday 30 Sep 2026, 21:00 Bolivia (UTC-4).
  insert into raid_events (title, scheduled_at, raid_size, notes, created_by)
  values ('Naxxramas 25 mítico', '2026-10-01T01:00:00Z', 25, 'Raid de prueba con personajes simulados.', gm)
  returning id into raid;

  -- 20 of 25 slots filled, grouped 5 per party; the Guild Master's and the first officer's mains included.
  insert into raid_signups (raid_event_id, character_id, slot_index, status)
  select raid, c.id, x.slot, 'tentative'
  from (values
    ('Brakka', 0), ('Morthul', 1), ('Lightveil', 2), ('Vexmora', 3), ('Frostfang', 4),
    ('Minerva', 5), ('Seraphine', 6), ('Shadowkiss', 7), ('Bloodreaver', 8), ('Grimtusk', 9),
    ('Tidecaller', 10), ('Stormhowl', 11), ('Arrowind', 12), ('Merwyn', 13), ('Emberlyn', 14),
    ('Elunara', 15), ('Hexbolt', 16), ('Duskblade', 17), ('Rimeborn', 18), ('Nightsong', 19)
  ) as x(name, slot)
  join characters c on c.name = x.name and c.server_id = server;
end $$;
