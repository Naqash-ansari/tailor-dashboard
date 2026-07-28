export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 py-10 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0d6b5f]" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
