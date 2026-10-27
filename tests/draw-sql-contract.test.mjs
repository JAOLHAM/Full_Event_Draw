import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const schema = fs.readFileSync(new URL('../sql/schema.sql', import.meta.url), 'utf8');
const drawSection = schema.split(/create or replace function public\.draw_winner\(/i)[1]?.split(/end \$\$;/i)[0] ?? '';

test('draw_winner SQL contract enforces authenticated owner and locks the prize', () => {
  assert.ok(drawSection, 'draw_winner function not found');
  assert.match(drawSection, /auth\.uid\(\)/i);
  assert.match(drawSection, /owner_id\s*=\s*v_user\s+for update/i);
});

test('draw_winner SQL contract checks remaining prize stock and repeat eligibility', () => {
  assert.match(drawSection, /v_taken\s*>=\s*v_prize\.quantity/i);
  assert.match(drawSection, /p_allow_repeat\s+or\s+not exists/i);
  assert.match(drawSection, /order by random\(\) limit 1/i);
});

test('draw_winner SQL contract records draw result, live event and history', () => {
  for (const table of ['draws', 'live_events', 'activity_logs'])
    assert.match(drawSection, new RegExp('insert into public\\.' + table + '\\b', 'i'));
  assert.match(schema, /grant execute on function public\.draw_winner\(uuid,boolean,jsonb\) to authenticated/i);
});
