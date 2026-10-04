import { PrismaClient, Platform } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  nameCn: string;
  category: string;
  sellingPrice: number;
  costCny: number;
  platform: Platform;
  supplier: string;
  colors: string[];
  sizes: string[];
  stock: Record<string, number>; // "Хар|M" -> 3
};

const products: SeedProduct[] = [
  {
    name: "Oversize Hoodie", nameCn: "卫衣女宽松连帽", category: "Hoodie", sellingPrice: 89000, costCny: 62,
    platform: "WECHAT", supplier: "王姐服装", colors: ["Хар", "Саарал"], sizes: ["S", "M", "L", "XL"],
    stock: { "Хар|S": 3, "Хар|M": 1, "Хар|L": 4, "Хар|XL": 2, "Саарал|S": 2, "Саарал|M": 5, "Саарал|L": 3, "Саарал|XL": 1 },
  },
  {
    name: "Wide-leg Jeans", nameCn: "高腰阔腿牛仔裤", category: "Өмд", sellingPrice: 95000, costCny: 65,
    platform: "TAOBAO", supplier: "潮流牛仔店", colors: ["Цэнхэр"], sizes: ["S", "M", "L"],
    stock: { "Цэнхэр|S": 0, "Цэнхэр|M": 2, "Цэнхэр|L": 4 },
  },
  {
    name: "Puffer Jacket", nameCn: "加厚短款羽绒服", category: "Куртик", sellingPrice: 189000, costCny: 148,
    platform: "TAOBAO", supplier: "北方冬装旗舰", colors: ["Хар", "Цөцгий"], sizes: ["M", "L", "XL"],
    stock: { "Хар|M": 1, "Хар|L": 0, "Хар|XL": 2, "Цөцгий|M": 2, "Цөцгий|L": 1, "Цөцгий|XL": 0 },
  },
];

async function main() {
  await prisma.stockMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.cargo.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();

  for (const p of products) {
    const supplier = await prisma.supplier.create({ data: { name: p.supplier, platform: p.platform } });
    const product = await prisma.product.create({
      data: {
        name: p.name, nameCn: p.nameCn, category: p.category, sellingPrice: p.sellingPrice,
        costCny: p.costCny, platform: p.platform, supplierId: supplier.id,
      },
    });
    let i = 0;
    for (const color of p.colors) {
      for (const size of p.sizes) {
        const stock = p.stock[`${color}|${size}`] ?? 0;
        await prisma.productVariant.create({
          data: {
            productId: product.id, color, size, stock, sortOrder: i,
            sku: `${product.id.slice(-6).toUpperCase()}-${String(i + 1).padStart(2, "0")}`,
            movements: stock ? { create: { change: stock, reason: "ADJUST", note: "Анхны үлдэгдэл" } } : undefined,
          },
        });
        i++;
      }
    }
  }
  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
