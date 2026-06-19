"use client";
import { useEffect, useState } from "react";

export interface PresetModel {
  id: string;
  title: string;
  gender: string | null;
  hijab: boolean;
  thumbnailUrl: string;
}

interface Props {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function ModelGallery({ selectedId, onSelect }: Props) {
  const [models, setModels] = useState<PresetModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((d) => setModels(d.models ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-ink-muted">در حال بارگذاری مدل‌ها…</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {models.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`rounded-xl border-2 p-1 transition ${
            selectedId === m.id ? "border-gold ring-2 ring-gold/25" : "border-ink/10 hover:border-clay"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.thumbnailUrl}
            alt={m.title}
            className="h-32 w-full rounded-lg object-cover"
          />
          <span className="mt-1 block text-xs text-ink-muted">
            {m.title} {m.hijab ? "🧕" : ""}
          </span>
        </button>
      ))}
    </div>
  );
}
