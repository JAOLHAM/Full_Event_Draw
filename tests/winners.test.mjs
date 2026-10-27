import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWinnerRows, csvCell, winnersCsv } from '../src/lib/legacy/winners.ts';

test('คนเดิมรับรางวัลหลายชิ้นต้องรวมเป็นบรรทัดเดียวและจำนวนถูกต้อง', () => {
  const people=[{id:'p1',staff_code:'001',first_name:'มะลิ',last_name:'ทดสอบ',department:'IT'}, {id:'p2',staff_code:'002',first_name:'ดี',last_name:'มาก'}];
  const prizes=[{id:'r1',name:'บัตรของขวัญ'},{id:'r2',name:'โทรศัพท์'}];
  const draws=[
    {participant_id:'p1',prize_id:'r1',created_at:'2026-10-01T10:00:00Z'},
    {participant_id:'p2',prize_id:'r2',created_at:'2026-10-02T10:00:00Z'},
    {participant_id:'p1',prize_id:'r1',created_at:'2026-10-03T10:00:00Z'},
  ];
  const rows=buildWinnerRows(people,prizes,draws);
  assert.equal(rows.length,2);
  assert.equal(rows[0].id,'p1');
  assert.deepEqual(rows[0].prizes,['บัตรของขวัญ','บัตรของขวัญ']);
  assert.equal(rows[0].count,2);
  assert.equal(rows[1].count,1);
});

test('ผลสุ่มที่ไม่มีผู้เข้าร่วมเหลือไม่ถูกนำมารวมเป็นผู้ชนะ', () => {
  const rows=buildWinnerRows([], [{id:'r1',name:'ของรางวัล'}], [{participant_id:'deleted',prize_id:'r1'}]);
  assert.deepEqual(rows, []);
});

test('CSV escapes Thai/quotes and basic spreadsheet formula injection', () => {
  assert.equal(csvCell('a"b'),'"a""b"');
  assert.equal(csvCell('=SUM(A1:A2)'), '"\'=SUM(A1:A2)"');
  assert.ok(winnersCsv([]).startsWith('\uFEFF'));
  assert.ok(winnersCsv([]).includes('รหัสประจำตัว'));
});
