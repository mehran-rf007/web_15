"use client";

const STYLES = [
  { id: "studio", label: "استودیویی" },
  { id: "editorial", label: "ژورنالی" },
  { id: "lifestyle", label: "لایف‌استایل" },
] as const;

interface Props {
  value: string;
  onChange: (v: "studio" | "editorial" | "lifestyle") => void;
}

export default function StyleSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {STYLES.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            value === s.id ? "bg-gold text-white shadow-sm" : "bg-sand text-ink-soft hover:bg-clay"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
