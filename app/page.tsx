import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [productCount, stockAgg, low] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.aggregate({ _sum: { stock: true } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: LOW_STOCK } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: [{ stock: "asc" }, { createdAt: "asc" }],
      take: 10,
    }),
  ]);

  const tiles = [
    { label: "Бараа", value: productCount },
    { label: "Дэлгүүрт байгаа", value: `${stockAgg._sum.stock ?? 0} ш` },
    { label: "Дуусах дөхсөн", value: low.length, crit: low.length > 0 },
  ];

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-2xl font-semibold">Самбар</h1>
        <p className="text-sm text-muted">Phase 1: бараа ба үлдэгдэл. Борлуулалт, захиалгын тоо дараагийн шатанд нэмэгдэнэ.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="panel">
            <div className="text-xs uppercase tracking-wider text-muted">{t.label}</div>
            <div className={`num mt-1.5 text-2xl font-semibold ${t.crit ? "text-crit" : ""}`}>{t.value}</div>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Дуусах дөхсөн бараа</h2>
          <Link href="/products" className="btn">Бүх бараа</Link>
        </div>
        {low.length === 0 ? (
          <p className="text-sm text-muted">Бүх бараа хангалттай байна.</p>
        ) : (
          <ul className="divide-y divide-line">
            {low.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/products/${v.product.id}`} className="min-w-0 hover:text-accent">
                  <div className="font-medium">{v.product.name}</div>
                  <div className="text-xs text-muted">{v.color} / {v.size} · {v.sku}</div>
                </Link>
                <span className={`num rounded-md px-2 py-0.5 text-sm font-semibold ${v.stock === 0 ? "border border-dashed border-line text-muted" : "bg-crit-soft text-crit"}`}>{v.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
