export function ShopBrandText({ className = "" }: { className?: string }) {
  return (
    <div className={`whitespace-nowrap text-center font-['Times_New_Roman',Times,serif] leading-tight ${className}`}>
      <h1 className="brand-name">
        <span className="block text-4xl font-bold leading-none">Aans</span>
        <span className="block text-lg font-bold">Fabrics &amp; Tailors ltd</span>
      </h1>
      <p className="text-[11px] font-bold">Specialist in Ladies, Gents Tailoring &amp; Alteration</p>
      <p className="text-[13px] font-bold">01615097737 / 07915253239</p>
      <p className="text-[11px] font-bold">343 Cheetham Hill Road M8 0SF MANCHESTER (UK)</p>
    </div>
  );
}
