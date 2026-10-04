import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCny, formatMnt, LOW_STOCK, PLATFORM_LABEL } from "@/lib/format";
import { addVariant, setStock, updateProduct } from "../actions";

export const dynamic = "force-dynamic";

const REASON_LABEL = { PURCHASE_RECEIVE: "Захиалга хүлээн авсан", SALE: "Борлуулалт", ADJUST: "Гараар тохируулсан" } as const;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { supplier: true, variants: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) notFound();

  const movements = await prisma.stockMovement.findMany({
    where: { variant: { productId: id } },
    include: { variant: { select: { color: true, size: true } } },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  const total = product.variants.reduce((a, v) => a + v.stock, 0);

  return (
    <div className="grid max-w-4xl gap-5">
      <header>
        <Link href="/products" className="text-sm text-muted hover:text-ink">← Бараа</Link>
        <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-muted">
          {[product.nameCn, product.category, PLATFORM_LABEL[product.platform], product.supplier?.name].filter(Boolean).join(" · ")}
          {product.sourceUrl && (
            <> · <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">Эх линк</a></>
          )}
        </p>
      </header>

      <form action={updateProduct} className="panel grid gap-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
        <input type="hidden" name="id" value={product.id} />
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Нэр
          <input name="name" defaultValue={product.name} className="input text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Зарах үнэ (₮)
          <input name="sellingPrice" type="number" min={0} step={1000} defaultValue={product.sellingPrice} className="input num text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Авах үнэ (CNY)
          <input name="costCny" type="number" min={0} step="0.01" defaultValue={product.costCny ? Number(product.costCny) : ""} className="input num text-ink" />
        </label>
        <button className="btn">Хадгалах</button>
      </form>

      <section className="panel">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Үлдэгдэл</h2>
          <span className="num text-sm text-muted">Нийт {total} ш · {formatMnt(product.sellingPrice)}{product.costCny ? ` · авах ${formatCny(Number(product.costCny))}` : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-1.5 text-left font-medium">Өнгө</th>
                <th className="py-1.5 text-left font-medium">Размер</th>
                <th className="py-1.5 text-left font-medium">SKU</th>
                <th className="py-1.5 text-left font-medium">Үлдэгдэл</th>
                <th className="py-1.5 text-left font-medium">Тохируулах</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id} className="border-b border-line last:border-0">
                  <td className="py-2">{v.color}</td>
                  <td className="py-2">{v.size}</td>
                  <td className="num py-2 text-xs text-muted">{v.sku}</td>
                  <td className="py-2">
                    <span className={`num inline-block min-w-8 rounded-md px-1.5 py-0.5 text-center ${v.stock === 0 ? "border border-dashed border-line text-muted" : v.stock <= LOW_STOCK ? "bg-crit-soft font-semibold text-crit" : "bg-paper"}`}>{v.stock}</span>
                  </td>
                  <td className="py-2">
                    <form action={setStock} className="flex flex-wrap gap-2">
                      <input type="hidden" name="variantId" value={v.id} />
                      <input name="stock" type="number" min={0} defaultValue={v.stock} aria-label={`${v.color} ${v.size} үлдэгдэл`} className="input num w-20 py-1" />
                      <input name="note" placeholder="Шалтгаан (заавал биш)" aria-label="Шалтгаан" className="input w-44 py-1" />
                      <button className="btn py-1">Хадгалах</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={addVariant} className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <input type="hidden" name="productId" value={product.id} />
          <span className="text-sm text-muted">Variant нэмэх:</span>
          <input name="color" placeholder="Өнгө" aria-label="Өнгө" className="input w-32 py-1" />
          <input name="size" placeholder="Размер" aria-label="Размер" className="input w-24 py-1" />
          <button className="btn py-1">Нэмэх</button>
        </form>
      </section>

      <section className="panel">
        <h2 className="mb-3 text-[15px] font-semibold">Үлдэгдлийн түүх</h2>
        {movements.length === 0 ? (
          <p className="text-sm text-muted">Өөрчлөлт алга.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {movements.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
                <span className="num w-36 text-xs text-muted">{m.createdAt.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</span>
                <span className="w-24">{m.variant.color} / {m.variant.size}</span>
                <span className={`num w-12 font-semibold ${m.change > 0 ? "text-emerald-700" : "text-crit"}`}>{m.change > 0 ? `+${m.change}` : m.change}</span>
                <span className="text-muted">{REASON_LABEL[m.reason]}{m.note ? ` — ${m.note}` : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
