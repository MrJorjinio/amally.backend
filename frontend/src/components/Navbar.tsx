"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const { isLoggedIn, user, openAuth, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-3 sm:pt-5 px-3 sm:px-6">
      <nav
        className={`
          flex items-center w-full max-w-3xl px-4 sm:px-6 py-3 sm:py-4 rounded-full
          border
          transition-all duration-300 ease-out
          border-black/[0.06]
          ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              : "bg-white/50 backdrop-blur-md"
          }
        `}
      >
        {/* Logo + name — left */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] sm:text-[19px] font-bold tracking-tight text-[#141414]"
        >
          <Image src="/logo.png" alt="Amally" width={44} height={44} className="w-[34px] h-[34px] sm:w-[44px] sm:h-[44px]" unoptimized />
          Amally
        </Link>

        {/* Links — right */}
        <div className="ml-auto flex items-center gap-0.5 sm:gap-2">
          {isLoggedIn ? (
            <Link
              href="/experiences"
              className="px-3 sm:px-5 py-2 text-[13px] sm:text-[15px] font-medium text-[#141414]/60 hover:text-[#69824f] transition-colors duration-200 rounded-full hover:bg-[#69824f]/[0.04]"
            >
              Experiences
            </Link>
          ) : (
            <button
              onClick={() => openAuth("login")}
              className="px-3 sm:px-5 py-2 text-[13px] sm:text-[15px] font-medium text-[#141414]/60 hover:text-[#69824f] transition-colors duration-200 rounded-full hover:bg-[#69824f]/[0.04]"
            >
              Experiences
            </button>
          )}

          <Link
            href="/about"
            className="hidden sm:block px-5 py-2 text-[15px] font-medium text-[#141414]/60 hover:text-[#69824f] transition-colors duration-200 rounded-full hover:bg-[#69824f]/[0.04]"
          >
            About
          </Link>

          {isLoggedIn ? (
            <div className="relative ml-1 sm:ml-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-[#141414]/[0.06] text-[12px] font-semibold text-[#141414]/50 shrink-0 ring-2 ring-transparent hover:ring-black/[0.06] transition-all"
              >
                {user?.profilePictureUrl ? (
                  <Image src={user.profilePictureUrl} alt={user.fullName} width={36} height={36} className="w-full h-full object-cover" unoptimized />
                ) : (
                  user?.fullName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"
                )}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden z-20">
                    <div className="px-4 py-3 border-b border-black/[0.04]">
                      <p className="text-[14px] font-semibold text-[#141414] truncate">{user?.fullName}</p>
                      <p className="text-[12px] text-[#141414]/35 truncate">@{user?.username}</p>
                    </div>
                    <div className="py-1">
                      <Link href={`/profile/${user?.username}`} onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#141414]/60 hover:bg-[#69824f]/[0.04] hover:text-[#69824f] transition-colors">
                        Profilim
                      </Link>
                      <button onClick={() => { logout(); setShowMenu(false); router.push("/"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400/70 hover:bg-red-50/50 hover:text-red-500 transition-colors">
                        <LogOut size={14} strokeWidth={1.5} />
                        Chiqish
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuth("login")}
              className="px-3 sm:px-5 py-1.5 sm:py-2 text-[13px] sm:text-[15px] font-semibold text-white bg-[#69824f] rounded-full hover:bg-[#576d42] transition-colors"
            >
              Kirish
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
