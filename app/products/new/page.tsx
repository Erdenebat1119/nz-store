import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const suppliers = await prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return (
    <div className="grid max-w-3xl gap-5">
      <header>
        <Link href="/products" className="text-sm text-muted hover:text-ink">← Бараа</Link>
        <h1 className="mt-1 text-2xl font-semibold">Шинэ бараа</h1>
      </header>
      <ProductForm suppliers={suppliers} />
    </div>
  );
}
