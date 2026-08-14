# ระบบแจ้งซ่อมเครื่องจักรในโรงงาน (Machine Repair Request System)

เว็บแอปพลิเคชันสำหรับแจ้งซ่อม ติดตามงาน และดูรายงานการซ่อมบำรุงเครื่องจักรในโรงงาน
สร้างด้วย **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma**

## Tech Stack

| ส่วนประกอบ | เทคโนโลยี |
|---|---|
| Frontend + Backend | Next.js 14 (App Router, API Routes) |
| ภาษา | TypeScript |
| ฐานข้อมูล (default) | SQLite (ไฟล์เดียว รันได้ทันทีโดยไม่ต้องต่อเน็ต) |
| ฐานข้อมูล (ทางเลือก) | PostgreSQL ผ่าน Supabase |
| ORM | Prisma |
| Authentication | Custom email/password + JWT (httpOnly cookie), เขียนเองด้วย `jose` + `bcryptjs` |
| ไฟล์แนบ | บันทึกลง `public/uploads` (local storage) |
| กราฟ/แดชบอร์ด | Recharts |
| Export รายงาน | ExcelJS (.xlsx) |
| Styling | Tailwind CSS |

> หมายเหตุ: โปรเจกต์นี้ไม่ได้ใช้ NextAuth.js/Supabase Auth เพื่อให้รันได้แบบ local-first
> โดยไม่ต้องพึ่งบริการภายนอก แต่โครงสร้างสามารถสลับไปใช้ Supabase Auth/Storage ได้ตามคำแนะนำด้านล่าง

## โครงสร้างโปรเจกต์

```
repair-system/
├── prisma/
│   ├── schema.prisma        # นิยามตาราง: User, Machine, RepairRequest, RepairLog, Notification
│   └── seed.ts               # ข้อมูลตัวอย่างสำหรับทดสอบ
├── public/
│   └── uploads/               # รูปภาพที่แนบมากับใบแจ้งซ่อม
├── src/
│   ├── app/
│   │   ├── (auth)/login, register       # หน้าเข้าสู่ระบบ/สมัครสมาชิก
│   │   ├── dashboard/                   # แดชบอร์ดสรุปภาพรวม
│   │   ├── machines/                    # ทะเบียนเครื่องจักร (CRUD)
│   │   ├── requests/                    # รายการงานซ่อม, แจ้งซ่อมใหม่, รายละเอียดงาน
│   │   ├── reports/                     # รายงานสรุป + export Excel (Admin)
│   │   └── api/
│   │       ├── auth/(login|register|logout)
│   │       ├── machines[/[id]]
│   │       ├── requests[/[id]]
│   │       ├── notifications
│   │       └── reports/(summary|export)
│   ├── components/            # UI components (Navbar, ฟอร์ม, กราฟ, ตาราง ฯลฯ)
│   └── lib/                   # prisma client, auth helpers, utils (ticket no. gen, labels)
├── package.json
└── .env                        # ตัวแปรแวดล้อม (DATABASE_URL, JWT_SECRET)
```

## บทบาทผู้ใช้งาน (Roles)

- **REQUESTER** (พนักงานทั่วไป) — แจ้งซ่อม, ดูสถานะงานของตัวเอง
- **TECHNICIAN** (ช่างซ่อมบำรุง) — รับงาน, อัปเดตสถานะ, บันทึกผลการซ่อม
- **ADMIN** (หัวหน้างาน/ผู้ดูแลระบบ) — เห็นภาพรวมทั้งหมด, มอบหมายงาน, ทะเบียนเครื่องจักร, รายงาน, export Excel

สิทธิ์การเข้าถึงถูกบังคับใช้ทั้งฝั่ง UI (ซ่อน/แสดงเมนู) และฝั่ง API (route handlers ตรวจสอบ role จาก JWT session ทุกครั้ง)

## การติดตั้งและรันโปรเจกต์ (Local, SQLite — ค่าเริ่มต้น)

**ข้อกำหนดเบื้องต้น:** Node.js 18+ และ npm

```bash
# 1) ติดตั้ง dependencies
npm install

# 2) คัดลอกไฟล์ตัวอย่าง .env.example เป็น .env แล้วแก้ไขค่าตามต้องการ
cp .env.example .env
#    DATABASE_URL="file:./dev.db"
#    JWT_SECRET="เปลี่ยนเป็นค่าสุ่มยาวๆ ก่อนใช้งานจริง"

# 3) สร้างฐานข้อมูลตาม schema (สร้างไฟล์ dev.db และตาราง)
npx prisma migrate dev --name init

# 4) ใส่ข้อมูลตัวอย่าง (ผู้ใช้ทดสอบ + เครื่องจักร + งานซ่อมตัวอย่าง)
npm run prisma:seed

# 5) รันเซิร์ฟเวอร์พัฒนา
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

### บัญชีทดสอบ (หลัง seed) — รหัสผ่านทั้งหมด: `password123`

| อีเมล | บทบาท |
|---|---|
| admin@factory.com | ผู้ดูแลระบบ (ADMIN) |
| tech@factory.com | ช่างซ่อมบำรุง (TECHNICIAN) |
| tech2@factory.com | ช่างซ่อมบำรุง (TECHNICIAN) |
| staff@factory.com | พนักงานทั่วไป (REQUESTER) |

## สลับไปใช้ PostgreSQL ผ่าน Supabase (สำหรับ production/deploy)

1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com) (มี free tier)
2. คัดลอก Connection string (Settings → Database → Connection string → URI)
3. แก้ `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. แก้ `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres"
   ```
5. รันใหม่:
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

หากต้องการใช้ Supabase Storage แทนการเก็บไฟล์ในเครื่อง ให้แก้ไขส่วนอัปโหลดใน
`src/app/api/requests/route.ts` ให้เรียก Supabase Storage SDK แทน `fs/promises.writeFile`

## Deploy ขึ้น Vercel

1. Push โปรเจกต์นี้ขึ้น GitHub
2. Import repository เข้า [Vercel](https://vercel.com)
3. ตั้งค่า Environment Variables ใน Vercel: `DATABASE_URL` (ชี้ไปที่ Supabase Postgres) และ `JWT_SECRET`
4. เพิ่ม Build Command เป็น `prisma generate && prisma migrate deploy && next build`
   (หรือรัน `npx prisma migrate deploy` แยกก่อน deploy ก็ได้)
5. Deploy — Vercel free tier รองรับทั้ง frontend และ API routes ในตัว

> หมายเหตุ: การอัปโหลดไฟล์แบบ local storage (`public/uploads`) จะไม่ persist บน Vercel
> (filesystem เป็นแบบ ephemeral) หากต้องใช้ production จริง แนะนำให้สลับไปใช้ Supabase Storage หรือ Vercel Blob

## คำสั่งที่มีประโยชน์

```bash
npm run dev              # รันเซิร์ฟเวอร์พัฒนา
npm run build             # build production
npm run start              # รัน production build
npm run prisma:studio     # เปิด Prisma Studio ดู/แก้ข้อมูลผ่าน UI
npm run prisma:migrate    # สร้าง migration ใหม่หลังแก้ schema.prisma
npm run prisma:seed        # รัน seed script ใหม่
```

## ฟีเจอร์ที่ใช้งานได้ในเวอร์ชันนี้

- ✅ สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ พร้อม RBAC (3 บทบาท)
- ✅ แจ้งซ่อม พร้อม auto-generate เลขที่ใบแจ้งซ่อม (`RQ-YYYYMMDD-XXXX`), แนบรูปภาพได้สูงสุด 5 รูป, เลือกระดับความเร่งด่วน
- ✅ Workflow สถานะงานครบ 6 สถานะ: รอดำเนินการ → รับเรื่องแล้ว → กำลังซ่อม → รอชิ้นส่วนอะไหล่ → ซ่อมเสร็จ → ปิดงาน
- ✅ Admin มอบหมายงานให้ช่าง, ช่างบันทึกสาเหตุ/วิธีแก้ไข/อะไหล่/เวลาที่ใช้ซ่อม
- ✅ ประวัติการดำเนินงาน (log) ต่อใบแจ้งซ่อม
- ✅ ทะเบียนเครื่องจักร (CRUD สำหรับ Admin, ดูอย่างเดียวสำหรับช่าง)
- ✅ แดชบอร์ด: จำนวนงานแยกตามสถานะ/ความเร่งด่วน, งานล่าสุด
- ✅ รายงาน: แนวโน้มรายเดือน (6 เดือนล่าสุด), เครื่องจักรที่เสียบ่อยที่สุด Top 5, Export เป็น Excel
- ✅ การแจ้งเตือนในระบบ (in-app notification bell, polling ทุก 15 วินาที) เมื่อมีงานใหม่/มอบหมายงาน/เปลี่ยนสถานะ
- ✅ UI รองรับมือถือ (responsive), ปุ่มใหญ่/ฟอร์มกระชับสำหรับพนักงานหน้างาน, สีสถานะเข้าใจง่าย

## ส่วนที่ยังไม่รวมในเวอร์ชันนี้ (แนะนำให้ต่อยอด)

- การแจ้งเตือนผ่าน Email/LINE Notify จริง (ปัจจุบันมีเฉพาะ in-app notification — จุดต่อ Email/LINE
  อยู่ที่ฟังก์ชัน `notifyUser()` ใน `src/lib/utils.ts`)
- Export รายงานเป็น PDF (ปัจจุบันมีเฉพาะ Excel)
- การแก้ไข/ลบเครื่องจักรผ่าน UI (มี API `PATCH`/`DELETE` พร้อมใช้ที่ `/api/machines/[id]` แล้ว
  แต่ยังไม่ผูกปุ่มแก้ไขในตาราง — ต่อยอดได้ง่ายจาก `MachinesTable.tsx`)
- Real-time notification (WebSocket) — ปัจจุบันใช้ polling แทน
