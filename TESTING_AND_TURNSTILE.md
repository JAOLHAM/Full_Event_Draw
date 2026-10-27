# Lucky Draw v2.1 — Testing / Turnstile (ใช้กับ Lucky Draw เท่านั้น)

## A. Node.js Test Runner (ไม่ต้องลง VS Code Extension เพิ่ม)

ติดตั้ง Node.js 22.12+ และ `npm install` ก่อน จากนั้นใช้คำสั่ง:

```bash
npm run test:logic     # ทดสอบ TypeScript helpers / Winners / CSV / SQL source contract / UI identifiers
npm run typecheck      # ตรวจ TypeScript
npm run test:all       # typecheck + logic tests
npm run build          # ตรวจ Build ของ Next.js
```

> `draw-sql-contract` ตรวจเพียง **โครงสร้าง Source Code ของ SQL** ไม่ได้ทดสอบฐานข้อมูลจริงหรือความปลอดภัยด้วยธุรกรรมจริง จึงควรทดสอบการสุ่มด้วยข้อมูลตัวอย่างบน Preview เพิ่มเติม

## B. Grafana k6 — ทดสอบ HTTP แบบอ่านอย่างเดียว

k6 เป็นโปรแกรมแยกต่างหาก (Extension VS Code ไม่ได้ติดตั้ง CLI ให้):

```powershell
winget install k6 --source winget
k6 version
```

เปิดเว็บทดสอบใน Terminal อีกแท็บด้วย `npm run dev` แล้วรัน:

```bash
npm run test:k6:smoke   # เปิด / และ /live.html รวม 10 คำขอ (5 iterations)
npm run test:k6:load    # เปิด /live.html 3 VUs นาน 15 วินาที
```

ค่าเริ่มต้นใช้ `http://127.0.0.1:3000` เท่านั้น ไม่เรียก RPC สุ่ม ไม่เรียก Reset และไม่แก้ข้อมูล Supabase ทั้งสองไฟล์

> k6 HTTP ทดสอบเพียงเซิร์ฟเวอร์ HTML; **ไม่ได้** ทดสอบความสามารถของ Supabase Realtime หรือการสุ่มหลายคนพร้อมกัน และ **ไม่ได้** รันอัตโนมัติบน Vercel

ระบบปิดการทดสอบ URL อื่นโดยค่าเริ่มต้น หากคุณมีสิทธิ์และควบคุม Preview ที่จะทดสอบจริงเท่านั้น:

```powershell
k6 run -e BASE_URL=https://YOUR-PREVIEW.vercel.app -e ALLOW_REMOTE_TEST=YES tests/performance/smoke.js
```

**ห้ามรันทดสอบโหลดกับ Production** โดยไม่ได้รับอนุญาตและประเมินทรัพยากร Supabase/Vercel ก่อน

## C. Cloudflare Turnstile — เตรียมโค้ดไว้ แต่ **ปิดไว้ก่อน**

ปัจจุบัน `NEXT_PUBLIC_TURNSTILE_ENABLED` ไม่ได้ตั้งเป็น `true` และ **ไม่มีการเพิ่ม UI ใด ๆ** หน้า Login/Register จึงเหมือนเดิม

ถ้าจะใช้งานจริง ต้องทำ *ทั้ง 3 ขั้นตอน* ต่อไปนี้ให้ครบโดยพร้อมกันในระบบทดลอง:

1. Cloudflare Dashboard > Turnstile: สร้าง Widget สำหรับโดเมน Preview (และ localhost เมื่อรองรับ) แล้วรับ **Site Key** และ **Secret Key**
2. Supabase Dashboard > Authentication > Bot and Abuse Protection: เลือก Cloudflare Turnstile และใส่ **Secret Key** ที่นี่เท่านั้น ไม่ใส่ในโค้ดหรือ Environment Variable ฝั่ง Browser
3. เพิ่มใน `.env.local` และ Vercel Preview Environment Variables เฉพาะ **Site Key**:

```dotenv
NEXT_PUBLIC_TURNSTILE_ENABLED=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_public_site_key
```

รีสตาร์ต `npm run dev` จากนั้นตรวจการ Login/Sign-up ทั้งสำเร็จและล้มเหลว (รวมถึงการเปลี่ยนหน้าสมัคร/เข้าสู่ระบบ) ก่อนเปิดใช้กับ Production

**สำคัญ:** อย่าเปิด Supabase CAPTCHA Enforcement ล่วงหน้าขณะที่เว็บ Production เดิมยังไม่ส่ง `captchaToken` เพราะอาจทำให้ผู้ใช้เข้าสู่ระบบไม่ได้ ต้องเปิดทั้งระบบพร้อมกันตามแผน Deploy ที่ทดสอบแล้ว

เมื่อเปิด Turnstile ระบบจะเพิ่ม Widget แค่ในฟอร์มเข้าสู่ระบบ/สมัครสมาชิก พร้อมส่ง `captchaToken` ให้ Supabase ตรวจจริง หากไม่มี Token จะไม่ส่งคำขอ Auth (fail-closed)

## D. การทดสอบที่ยังต้องทำด้วยมือ

- Login/Sign-up, Supabase Auth Session, Dark/Light
- Import .xlsx/.xls/.csv, Column Mapping, Custom Fields, รางวัล, สุ่มซ้ำ/ไม่ซ้ำ
- Winners/CSV, History/Logs, Live Background Preview/Save, Live Realtime
- ใช้เฉพาะข้อมูลทดสอบบนบัญชีทดสอบ หลีกเลี่ยงปุ่ม RESET ในบัญชีข้อมูลจริง

## E. ข้อจำกัด

ผลการรัน Node tests บนเครื่องไม่เท่ากับการทดสอบ End-to-End บน Browser; k6 ตรวจเฉพาะ HTTP ไม่รวมฝั่ง Browser/Supabase หากการเปิด UI จริงต่างจาก v1.8.0 ให้ทดสอบก่อน Deploy Production
