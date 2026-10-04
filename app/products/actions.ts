"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PLATFORMS, splitList } from "@/lib/format";

export type FormState = { errors: Record<string, string>; message?: string };

const ProductSchema = z.object({
  name: z.string().trim().min(1, "Барааны нэрээ оруулна уу"),
  nameCn: z.string().trim().optional(),
  category: z.string().trim().optional(),
  sellingPrice: z.coerce.number({ invalid_type_error: "Тоо оруулна уу" }).int().min(0, "0-ээс их байх ёстой"),
  costCny: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().min(0).optional()),
  platform: z.enum(PLATFORMS as [string, ...string[]]),
  sourceUrl: z.preprocess((v) => (v === "" ? undefined : v), z.string().url("Зөв линк оруулна уу").optional()),
  supplierId: z.string().optional(),
  newSupplier: z.string().trim().optional(),
  colors: z.string().trim().min(1, "Дор хаяж нэг өнгө"),
  sizes: z.string().trim().min(1, "Дор хаяж нэг размер"),
});

const skuFor = (productId: string, index: number) =>
  `${productId.slice(-6).toUpperCase()}-${String(index + 1).padStart(2, "0")}`;

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = ProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors };
  }
  const d = parsed.data;
  const colors = splitList(d.colors);
  const sizes = splitList(d.sizes);
  const platform = d.platform as (typeof PLATFORMS)[number];

  let supplierId = d.supplierId || null;
  if (!supplierId && d.newSupplier) {
    const s = await prisma.supplier.create({ data: { name: d.newSupplier, platform } });
    supplierId = s.id;
  }

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        name: d.name,
        nameCn: d.nameCn || null,
        category: d.category || null,
        sellingPrice: d.sellingPrice,
        costCny: d.costCny ?? null,
        platform,
        sourceUrl: d.sourceUrl ?? null,
        supplierId,
      },
    });
    let i = 0;
    for (const color of colors) {
      for (const size of sizes) {
        await tx.productVariant.create({ data: { productId: p.id, color, size, sortOrder: i, sku: skuFor(p.id, i) } });
        i++;
      }
    }
    return p;
  });

  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

const UpdateSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  sellingPrice: z.coerce.number().int().min(0),
  costCny: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().min(0).optional()),
});

export async function updateProduct(formData: FormData) {
  const d = UpdateSchema.parse(Object.fromEntries(formData));
  await prisma.product.update({
    where: { id: d.id },
    data: { name: d.name, sellingPrice: d.sellingPrice, costCny: d.costCny ?? null },
  });
  revalidatePath(`/products/${d.id}`);
  revalidatePath("/products");
}

/** Гараар үлдэгдэл тохируулах — өөрчлөлтийг StockMovement-д бичнэ */
export async function setStock(formData: FormData) {
  const variantId = String(formData.get("variantId"));
  const stock = z.coerce.number().int().min(0).parse(formData.get("stock"));
  const note = String(formData.get("note") ?? "").trim() || null;

  const productId = await prisma.$transaction(async (tx) => {
    const v = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    const change = stock - v.stock;
    if (change !== 0) {
      await tx.productVariant.update({ where: { id: v.id }, data: { stock } });
      await tx.stockMovement.create({ data: { variantId: v.id, change, reason: "ADJUST", note } });
    }
    return v.productId;
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
  revalidatePath("/");
}

export async function addVariant(formData: FormData) {
  const productId = String(formData.get("productId"));
  const color = String(formData.get("color") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  if (!color || !size) return;
  const count = await prisma.productVariant.count({ where: { productId } });
  await prisma.productVariant.upsert({
    where: { productId_color_size: { productId, color, size } },
    update: {},
    create: { productId, color, size, sortOrder: count, sku: skuFor(productId, count) },
  });
  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}
