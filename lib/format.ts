import type { Platform } from "@prisma/client";

/** Үлдэгдэл энэ тооноос бага/тэнцүү бол "дуусах дөхсөн" */
export const LOW_STOCK = 1;

export const formatMnt = (n: number) => `${Math.round(n).toLocaleString("en-US")}₮`;

/** Хятадын юань — Японы иенээс ялгахын тулд CNY гэж үргэлж бичнэ */
export const formatCny = (n: number) =>
  `CNY ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const PLATFORM_LABEL: Record<Platform, string> = {
  TAOBAO: "Taobao",
  PINDUODUO: "Pinduoduo",
  TEMU: "Temu",
  WECHAT: "WeChat",
  OTHER: "Бусад",
};

export const PLATFORMS = Object.keys(PLATFORM_LABEL) as Platform[];

/** "Хар, Саарал ,хар" -> ["Хар", "Саарал"] (давхардалгүй, дарааллаа хадгална) */
export function splitList(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input.split(/[,，、]/)) {
    const v = raw.trim();
    if (v && !seen.has(v.toLowerCase())) {
      seen.add(v.toLowerCase());
      out.push(v);
    }
  }
  return out;
}

/** Variant-уудыг өнгө × размер хүснэгт болгох */
export function variantGrid<T extends { color: string; size: string; sortOrder: number }>(variants: T[]) {
  const sorted = [...variants].sort((a, b) => a.sortOrder - b.sortOrder);
  const colors = [...new Set(sorted.map((v) => v.color))];
  const sizes = [...new Set(sorted.map((v) => v.size))];
  const find = (c: string, s: string) => sorted.find((v) => v.color === c && v.size === s);
  return { colors, sizes, find };
}
