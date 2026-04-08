"use client";

import { useEffect, useRef, useState } from "react";

export function StickyScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState(96); // initial top-24 = 96px
  const lastScrollY = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY.current;
      lastScrollY.current = scrollY;

      const sidebarHeight = el.offsetHeight;
      const viewportHeight = window.innerHeight;
      const minTop = 96; // navbar clearance
      const maxNegative = Math.max(0, sidebarHeight - viewportHeight + 32); // 32px bottom padding

      setTopOffset((prev) => {
        const next = prev - delta;
        return Math.max(-maxNegative, Math.min(minTop, next));
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="sticky space-y-5 pb-8"
      style={{ top: topOffset }}
    >
      {children}
    </div>
  );
}
