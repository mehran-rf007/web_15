"use client";

import { useState } from "react";

export type GalleryItem = { id: string; url: string; styleLabel: string };

export default function DashboardGallery({ items }: { items: GalleryItem[] }) {
  const labels = Array.from(new Set(items.map((i) => i.styleLabel)));
  const tabs = ["همه", ...labels];
  const [active, setActive] = useState("همه");

  const filtered = active === "همه" ? items : items.filter((i) => i.styleLabel === active);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-sand/30 py-16 text-center">
        <span className="mb-3 text-4xl">🖼️</span>
        <p className="font-bold text-ink-soft">هنوز تصویری نساخته‌ای</p>
        <p className="mt-1 text-sm text-ink-muted">اولین عکس ژورنالی‌ات را بساز تا اینجا نمایش داده شود.</p>
      </div>
    );
  }

  return (
    <div>
      {tabs.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium transition " +
                (active === t ? "bg-ink text-cream" : "bg-clay/40 text-ink-soft hover:bg-clay/60")
              }
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {filtered.map((it) => (
          <a
            key={it.id}
            href={it.url}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden rounded-2xl border border-ink/10 bg-sand"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.url} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-cream backdrop-blur">
              {it.styleLabel}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
