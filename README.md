# Lucky Draw v2.1 — Next.js + React + TypeScript + Tailwind CSS

**เฉพาะโปรเจกต์ Lucky Draw เท่านั้น ไม่เกี่ยวข้องกับ EventFox**

## ที่มาและสิ่งที่ย้าย

ย้ายจากไฟล์ `lucky-draw-event-v1.8.0.rar` ของผู้ใช้ โดยคง HTML DOM/ID, CSS เดิม, เงื่อนไขการทำงาน, ตาราง Supabase, RPC `draw_winner()` และ URL หน้า Live `live.html` ไว้ เพื่อให้การย้าย Frontend กระทบระบบเดิมน้อยที่สุด

- **Next.js App Router:** `/` (Dashboard/Login), `/live.html` (Live Screen)
- **React:** แปลง HTML หน้าจอจริงเป็น React JSX ใน `src/components/`
- **TypeScript:** `src/lib/legacy/` มีบริการ Supabase ที่มี Type, ฟังก์ชัน Winners ที่เพิ่มชนิดข้อมูล และ Controller ที่ย้ายจาก JS เป็น `.ts`
- **Tailwind CSS v4:** พร้อมใช้ Utility Classes โดย **ไม่โหลด Preflight Reset** เพื่อรักษาหน้าตาเดิม
- **Supabase:** ใช้ Project / Auth / RLS / Storage / Realtime / SQL Function เดิม **ไม่ต้องรัน SQL ซ้ำ**

### สำคัญ: ระยะการย้ายแบบรักษาฟังก์ชัน

โปรเจกต์นี้เป็น **compatibility-first migration**: JSX ใช้ React แสดงหน้าจอ แต่งาน DOM events, ตาราง/โมดัลแบบไดนามิกและกระบวนการสุ่มยังคงใช้ Controller เดิมใน `app.ts`/`live.ts` (มี `// @ts-nocheck`) เพื่อลดความเสี่ยงจากการเขียนระบบใหม่ทั้งหมด ฟังก์ชัน Winners และ Supabase Client เพิ่ม TypeScript Type แล้ว ไม่ควรเข้าใจว่าเป็นการ rewrite เป็น React hooks ทั้งหมด การย้ายเป็น State-driven React Components 100% ควรทำเป็นงานแยกหลังทดสอบ End-to-End ผ่าน

## เริ่มใช้งานใน VS Code

1. ติดตั้ง Node.js 22 LTS หรือใหม่กว่า (ใช้กับชุดทดสอบ TypeScript ของโปรเจกต์นี้)
2. เปิด Folder นี้ใน VS Code
3. เปิด Terminal แล้วรัน `npm install`
4. ระบบได้เตรียม `.env.local` จาก **publishable key** ที่อยู่ใน Source Code เดิมไว้ให้ (ไม่ใช้ secret/service_role key)
5. รัน `npm run dev`
6. เปิด `http://localhost:3000` และหน้า Live `http://localhost:3000/live.html`
7. ตรวจสอบ `npm run typecheck`, `npm run build`, `npm run test:logic`

## อัปเดต Vercel

1. แนะนำให้ Push โปรเจกต์นี้ไป **branch ใหม่** แยกจากตัวที่ใช้งานจริง
2. ใน Vercel ตั้ง Environment Variables `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` จาก `.env.local` เพราะไฟล์ `.env.local` จะถูก Git ignore
3. ทดสอบ Preview Deployment และ Supabase Auth Redirect URLs ก่อนนำเวอร์ชันใหม่ขึ้นทับ Production
4. ตรวจ Login/Register, Theme Dark/Light, CRUD ผู้เข้าร่วม/รางวัล, Import .xlsx/.xls/.csv, Custom Fields, สุ่มซ้ำ/ไม่ซ้ำ, Winners/CSV, History, Live Preview/Upload Background, Realtime และ Reset
5. **อย่ารีรัน** `sql/schema.sql` หรือ SQL upgrade บนฐานข้อมูลใช้งานจริงโดยไม่มีเหตุจำเป็น

## ไฟล์ที่เก็บไว้

- `src/components/LuckyDrawDashboard.tsx`, `LuckyDrawLive.tsx` : JSX จาก HTML เดิม
- `src/styles/legacy.css`: UI CSS เดิมครบ (คงสไตล์โดยไม่ดัดแปลง)
- `src/lib/legacy/app.ts`, `live.ts`: ฟังก์ชัน/การทำงานเดิม
- `src/lib/legacy/client.ts`, `winners.ts`: Supabase helper และตัวรวมผลผู้ชนะ
- `sql/schema.sql`: โครงสร้าง SQL เดิมสำหรับอ้างอิงเท่านั้น **ไม่ต้องรันซ้ำ**

## ไฟล์ที่นำออก

`index.html`, `live.html`, `preview_dark.html`, `preview_light.html`, `css/preview.css`, `js/config.js`, ไฟล์ `.js` ที่ทดแทนด้วย `.ts`/`.tsx` แล้ว, SVG ธีมเก่าที่นำออกจาก UI ตั้งแต่เวอร์ชัน 1.4, SQL upgrade รุ่นเก่าที่รันแล้ว และ README รุ่นเก่าที่มีคำสั่ง Deploy static HTML

## เงื่อนไข / ขอบเขตการตรวจสอบ

- สร้างจากไฟล์ .rar เดิม ไม่ได้แก้ schema เดิมหรือธุรกรรมสุ่มในฐานข้อมูล
- ต้องลง npm dependencies ก่อน Build และมี Browser + Supabase ที่เข้าถึงได้จริงจึงจะยืนยันได้ว่าทุกปุ่มทำงานเหมือน Production ทุกประการ
- Excel importer ยังโหลด SheetJS 0.20.3 จาก CDN เดิม **เมื่อผู้ใช้เลือกนำเข้าไฟล์เท่านั้น** เช่นเดียวกับ v1.8.0 (ต้องมีอินเทอร์เน็ต)


## เพิ่มใน v2.1 — ไม่เปลี่ยน UI เดิม

- Node.js Test Runner: `npm run test:logic`, `npm run test:all` (ตรวจ Winners, CSV, SQL source contract, ตั้งค่า Turnstile และโครงสร้างหน้า)
- Grafana k6: `npm run test:k6:smoke`, `npm run test:k6:load` (ทดสอบ GET หน้าเว็บเฉพาะ localhost เป็นค่าเริ่มต้น ไม่มีคำขอสุ่มหรือแก้ DB)
- Cloudflare Turnstile: โค้ดรองรับใน `src/lib/security/turnstile.ts` **ปิดใช้งานเริ่มต้น**; ไม่แสดง Widget และไม่เปลี่ยน Login UI จนกว่าจะตั้งค่ากับ Supabase และเปิด Flag ด้วยตนเอง
- อ่านไฟล์ `TESTING_AND_TURNSTILE.md` ก่อนเปิด CAPTCHA หรือรันทดสอบโหลด
