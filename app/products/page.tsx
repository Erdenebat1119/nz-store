import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCny, formatMnt, LOW_STOCK, PLATFORM_LABEL, variantGrid } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true, supplier: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const totalStock = products.reduce((a, p) => a + p.variants.reduce((b, v) => b + v.stock, 0), 0);

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Бараа ба үлдэгдэл</h1>
          <p className="text-sm text-muted">{products.length} бараа · {totalStock} ширхэг дэлгүүрт</p>
        </div>
        <Link href="/products/new" className="btn-primary">+ Шинэ бараа</Link>
      </header>

      {products.length === 0 && (
        <div className="panel text-sm text-muted">
          Бараа алга байна. <Link href="/products/new" className="text-accent underline">Эхний барааг нэмэх</Link> эсвэл <code>npm run db:seed</code> ажиллуулж жишээ өгөгдөл оруулна уу.
        </div>
      )}

      {products.map((p) => {
        const { colors, sizes, find } = variantGrid(p.variants);
        return (
          <section key={p.id} className="panel">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <Link href={`/products/${p.id}`} className="min-w-0 hover:text-accent">
                <div className="text-[15px] font-semibold">{p.name}</div>
                <div className="text-xs text-muted">
                  {[p.nameCn, PLATFORM_LABEL[p.platform], p.supplier?.name].filter(Boolean).join(" · ")}
                </div>
              </Link>
              <div className="text-right">
                <div className="num font-semibold">{formatMnt(p.sellingPrice)}</div>
                {p.costCny && <div className="num text-xs text-muted">авах {formatCny(Number(p.costCny))}</div>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="py-1.5 pr-3 text-left font-medium">Өнгө</th>
                    {sizes.map((s) => <th key={s} className="px-2 py-1.5 text-center font-medium">{s}</th>)}
                    <th className="py-1.5 pl-3 text-right font-medium">Нийт</th>
                  </tr>
                </thead>
                <tbody>
                  {colors.map((c) => {
                    const row = sizes.map((s) => find(c, s));
                    return (
                      <tr key={c} className="border-b border-line last:border-0">
                        <td className="py-2 pr-3">{c}</td>
                        {row.map((v, i) => (
                          <td key={sizes[i]} className="px-2 py-2 text-center">
                            {v ? (
                              <span className={`num inline-block min-w-8 rounded-md px-1.5 py-0.5 ${v.stock === 0 ? "border border-dashed border-line text-muted" : v.stock <= LOW_STOCK ? "bg-crit-soft font-semibold text-crit" : "bg-paper"}`}>{v.stock}</span>
                            ) : "–"}
                          </td>
                        ))}
                        <td className="num py-2 pl-3 text-right">{row.reduce((a, v) => a + (v?.stock ?? 0), 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
