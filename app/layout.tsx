import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "NZ Store",
  description: "Хувцасны дэлгүүрийн бараа, захиалга, борлуулалтын систем",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" />
      </head>
      <body className="font-sans antialiased">
        <div className="md:grid md:min-h-screen md:grid-cols-[220px_1fr]">
          <aside className="border-b border-line bg-white p-4 md:border-r md:border-b-0">
            <div className="mb-4 flex items-center gap-2.5 px-1">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-sm font-bold text-paper">NZ</div>
              <div>
                <div className="text-[15px] font-semibold leading-tight">NZ Store</div>
                <div className="text-xs text-muted">Хувцасны дэлгүүр</div>
              </div>
            </div>
            <Nav />
          </aside>
          <main className="min-w-0 px-4 py-6 md:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
