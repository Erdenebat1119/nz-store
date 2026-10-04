# NZ Store

Хувцасны дэлгүүрийн бараа, захиалга, карго, борлуулалтын систем.
Taobao / Pinduoduo / Temu / WeChat-аас бараа авч Монголд зардаг дэлгүүрт зориулав.

**Одоогийн шат: Phase 1 — бараа ба үлдэгдэл**

- Бараа үүсгэх (өнгө × размер-аар variant автоматаар үүснэ)
- Үлдэгдэл харах, гараар тохируулах (өөрчлөлт бүр түүхэнд бичигдэнэ)
- Самбар: нийт бараа, үлдэгдэл, дуусах дөхсөн бараа

Мөнгөн тэмдэгт: зарах үнэ **₮ (MNT)**, авах үнэ **CNY (Хятадын юань)**.

## Технологи

Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind CSS 4 · Prisma 6 · PostgreSQL

## Ажиллуулах

```bash
npm install
cp .env.example .env          # Windows: copy .env.example .env

# Database — аль нэгийг сонго:
docker compose up -d          # A) Docker дээр local PostgreSQL
#                             # B) Supabase-ийн connection string-ийг .env-д тавина

npm run db:push               # хүснэгтүүдийг үүсгэнэ
npm run db:seed               # жишээ бараа (заавал биш)
npm run dev                   # http://localhost:3000
```

Бусад: `npm run db:studio` (DB-г браузерт харах), `npm run typecheck`, `npm run build`.

## Бүтэц

```
app/
  page.tsx                 Самбар
  products/
    page.tsx               Барааны жагсаалт + үлдэгдлийн хүснэгт
    new/page.tsx           Шинэ бараа
    [id]/page.tsx          Барааны дэлгэрэнгүй, үлдэгдэл тохируулах, түүх
    actions.ts             Server actions (create, update, setStock, addVariant)
components/                Nav, ProductForm
lib/                       prisma client, format (₮ / CNY), туслах функцууд
prisma/
  schema.prisma            Бүх data model (Phase 1–5)
  seed.ts                  Жишээ өгөгдөл
```

## Roadmap

| Phase | Агуулга | Төлөв |
| --- | --- | --- |
| 1 | Бараа, variant, үлдэгдэл | ✅ |
| 2 | Захиалга (Purchase Order), supplier | ⏳ |
| 3 | Карго, хүлээн авах → үлдэгдэл нэмэх | ⏳ |
| 4 | POS борлуулалт → үлдэгдэл хасах | ⏳ |
| 5 | Dashboard, ашиг (landed cost) | ⏳ |
| 6+ | Taobao import, AI, дахин захиалах санал | ⏳ |

Төлбөрийг marketplace дээр хэрэглэгч өөрөө хийнэ — систем төлбөрийн мэдээлэл хадгалахгүй.
