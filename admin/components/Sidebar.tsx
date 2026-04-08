"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileText, ShieldCheck, LogOut } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/dashboard/posts", label: "Postlar", icon: FileText },
  { href: "/dashboard/approvals", label: "Tasdiqlash", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-black/[0.06] flex flex-col py-6 px-3">
      <div className="px-3 mb-8">
        <h1 className="text-[16px] font-bold text-[#141414]">Amally</h1>
        <p className="text-[11px] text-[#141414]/30 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#69824F]/10 text-[#69824F]"
                  : "text-[#141414]/50 hover:bg-black/[0.02] hover:text-[#141414]/70"
              }`}
            >
              <Icon size={17} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/60 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <LogOut size={17} strokeWidth={1.5} />
        Chiqish
      </button>
    </aside>
  );
}
