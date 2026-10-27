import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWinnerRows, csvCell, winnersCsv } from '../src/lib/legacy/winners.ts';

test('latest prize time determines winner sorting while preserving per-person grouping', () => {
  const participants = [{id:'1',first_name:'กานต์'}, {id:'2',first_name:'บี'}];
  const prizes = [{id:'p',name:'คูปอง'}];
  const draws = [
    {participant_id:'1',prize_id:'p',created_at:'2026-10-01T10:00:00Z'},
    {participant_id:'2',prize_id:'p',created_at:'2026-10-03T10:00:00Z'},
    {participant_id:'1',prize_id:'p',created_at:'2026-10-04T10:00:00Z'}
  ];
  const rows=buildWinnerRows(participants,prizes,draws);
  assert.deepEqual(rows.map(r=>r.id),['1','2']);
  assert.deepEqual(rows.map(r=>r.count),[2,1]);
});

test('deleted prize is represented rather than dropping the winner', () => {
  const rows=buildWinnerRows([{id:'1',first_name:'แก้ว'}],[],[{participant_id:'1',prize_id:'deleted'}]);
  assert.equal(rows.length,1);
  assert.match(rows[0].prizes[0],/ไม่พบข้อมูล/);
});

test('CSV cell injection prefixes dangerous spreadsheet formulas', () => {
  for (const formula of ['=1+1', '+1+1', '@SUM(A1)', '-1+1', '\t=1+1']) {
    const safe=csvCell(formula);
    assert.ok(safe.startsWith('"\''), `not escaped: ${JSON.stringify(formula)}`);
  }
  assert.ok(winnersCsv([]).startsWith('\uFEFF'));
});
