export function Footer() {
  return (
    <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-black/[0.04]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[13px] text-[#69824f] font-medium">
          Amally
        </span>
        <span className="text-[12px] text-[#141414]/25">
          &copy; {new Date().getFullYear()} Barcha huquqlar himoyalangan.
        </span>
      </div>
    </footer>
  );
}
