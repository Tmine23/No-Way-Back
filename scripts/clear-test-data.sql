-- Removes everything created by scripts/seed-test-data.sql.
-- Deleting the fake auth users cascades to their profiles, characters, signups and loot.
delete from raid_events where notes = 'Raid de prueba con personajes simulados.';
delete from auth.users where email like '%@nwb.test';
