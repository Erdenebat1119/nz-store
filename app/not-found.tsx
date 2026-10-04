import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel max-w-md">
      <h1 className="text-lg font-semibold">Олдсонгүй</h1>
      <p className="mt-1 text-sm text-muted">Энэ хуудас эсвэл бараа байхгүй байна.</p>
      <Link href="/products" className="btn mt-4">Бараа руу буцах</Link>
    </div>
  );
}
