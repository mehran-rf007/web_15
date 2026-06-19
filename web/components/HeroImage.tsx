// نمایش تصویر هیرو در قاب منحنی — عکس فقط از پنل مدیریت تغییر می‌کند.
type Props = {
  imageUrl: string | null;
  width: number;
  height: number;
};

export default function HeroImage({ imageUrl, width, height }: Props) {
  return (
    <div className="relative flex justify-center">
      {/* لکه‌های تزئینی پس‌زمینه */}
      <div className="absolute -top-6 -left-6 h-40 w-40 rounded-full bg-gold/25 blur-2xl" />
      <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-clay blur-2xl" />
      <div className="absolute -top-4 right-10 dot-grid h-24 w-24 opacity-70" />

      <div
        className="relative w-full overflow-hidden blob-frame border-4 border-white bg-sand shadow-soft"
        style={{ maxWidth: width, aspectRatio: `${width} / ${height}` }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="نمونه‌ی ژورینو" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" />
        )}
      </div>
    </div>
  );
}
