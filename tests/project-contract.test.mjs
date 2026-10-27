import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
test('หน้า Dashboard และ Live Screen ยังคง DOM ID ทั้งหมดจากรุ่น v1.8.0',()=>{
  const main=read('../src/components/LuckyDrawDashboard.tsx');
  const live=read('../src/components/LuckyDrawLive.tsx');
  assert.equal((main.match(/ id=\{/g)||[]).length,120);
  assert.equal((live.match(/ id=\{/g)||[]).length,6);
  for(const token of ['authForm','themeToggle','importBtn','peopleBody','winnersBody','openPrizeDialog','liveSettingsForm','resetDialog'])
    assert.ok(main.includes(`id={"${token}"}`),`missing ${token}`);
  for(const token of ['confetti','liveName','liveStatus','liveCaption'])
    assert.ok(live.includes(`id={"${token}"}`),`missing ${token}`);
});

test('การสุ่มยังเรียก Supabase RPC เดิมและหน้า Live ยังเปิด URL เดิม',()=>{
  const app=read('../src/lib/legacy/app.ts');
  const live=read('../src/lib/legacy/live.ts');
  assert.ok(app.includes("db.rpc('draw_winner'"));
  assert.ok(app.includes("db.rpc('reset_event_data'"));
  assert.ok(app.includes("window.open('live.html'"));
  assert.ok(live.includes("table:'live_events'"));
});

test('ไม่มีไฟล์ EventFox หรือ Preview ที่เลิกใช้ปะปนในโปรเจกต์',()=>{
  const pkg=read('../package.json');
  assert.equal(pkg.includes('eventfox'),false);
  assert.ok(!fs.existsSync(new URL('../preview_dark.html',import.meta.url)));
  assert.ok(!fs.existsSync(new URL('../preview_light.html',import.meta.url)));
});
