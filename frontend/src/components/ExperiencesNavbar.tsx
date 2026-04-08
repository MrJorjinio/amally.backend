"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import { AppNavbar } from "./AppNavbar";

export function ExperiencesNavbar() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) return <Navbar />;

  return (
    <>
      {/* Mobile/tablet: AppNavbar with search + filters */}
      <div className="lg:hidden">
        <AppNavbar />
      </div>
      {/* Desktop: regular Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>
    </>
  );
}
