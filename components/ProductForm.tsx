"use client";

import { useActionState } from "react";
import { createProduct, type FormState } from "@/app/products/actions";
import { PLATFORM_LABEL, PLATFORMS } from "@/lib/format";

type Props = { suppliers: { id: string; name: string }[] };

function Field({ label, name, error, children, hint }: { label: string; name: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-muted">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-crit">{error}</p>}
    </div>
  );
}

export function ProductForm({ suppliers }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(createProduct, { errors: {} });
  const e = state.errors;

  return (
    <form action={action} className="grid gap-5">
      <section className="panel grid gap-4 sm:grid-cols-2">
        <h2 className="text-[15px] font-semibold sm:col-span-2">Барааны мэдээлэл</h2>
        <Field label="Нэр (Монгол) *" name="name" error={e.name}>
          <input id="name" name="name" className="input" placeholder="Oversize Hoodie" />
        </Field>
        <Field label="Хятад нэр" name="nameCn">
          <input id="nameCn" name="nameCn" className="input" placeholder="卫衣女宽松连帽" />
        </Field>
        <Field label="Ангилал" name="category">
          <input id="category" name="category" className="input" placeholder="Hoodie, Өмд, Куртик…" />
        </Field>
        <Field label="Зарах үнэ (₮) *" name="sellingPrice" error={e.sellingPrice}>
          <input id="sellingPrice" name="sellingPrice" type="number" min={0} step={1000} className="input num" placeholder="89000" />
        </Field>
        <Field label="Авах үнэ (CNY, юань)" name="costCny" error={e.costCny}>
          <input id="costCny" name="costCny" type="number" min={0} step="0.01" className="input num" placeholder="62" />
        </Field>
        <Field label="Платформ" name="platform">
          <select id="platform" name="platform" className="input" defaultValue="TAOBAO">
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Барааны линк" name="sourceUrl" error={e.sourceUrl}>
            <input id="sourceUrl" name="sourceUrl" className="input" placeholder="https://item.taobao.com/item.htm?id=…" />
          </Field>
        </div>
        <Field label="Supplier" name="supplierId">
          <select id="supplierId" name="supplierId" className="input" defaultValue="">
            <option value="">— Шинэ supplier —</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Шинэ supplier-ийн нэр" name="newSupplier" hint="Дээрээс сонгоогүй бол энд бичнэ">
          <input id="newSupplier" name="newSupplier" className="input" placeholder="王姐服装" />
        </Field>
      </section>

      <section className="panel grid gap-4 sm:grid-cols-2">
        <h2 className="text-[15px] font-semibold sm:col-span-2">Өнгө ба размер</h2>
        <Field label="Өнгөнүүд *" name="colors" error={e.colors} hint="Таслалаар тусгаарлана: Хар, Саарал">
          <input id="colors" name="colors" className="input" placeholder="Хар, Саарал" />
        </Field>
        <Field label="Размерууд *" name="sizes" error={e.sizes} hint="S, M, L, XL">
          <input id="sizes" name="sizes" className="input" placeholder="S, M, L, XL" />
        </Field>
        <p className="text-xs text-muted sm:col-span-2">Өнгө × размер бүрээр variant үүснэ. Эхний үлдэгдэл 0 — бараа ирэхэд хүлээн авна эсвэл гараар тохируулна.</p>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Хадгалж байна…" : "Бараа үүсгэх"}</button>
        {Object.keys(e).length > 0 && <span className="text-sm text-crit">Улаанаар тэмдэглэсэн талбаруудыг засна уу.</span>}
      </div>
    </form>
  );
}
