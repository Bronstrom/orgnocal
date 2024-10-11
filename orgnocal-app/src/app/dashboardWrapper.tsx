"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AuthProvider from "./authProvider";
import StoreProvider, { useAppSelector } from "./redux";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    // Workaround to edit root layout (only time that DOM is edited directly this way)
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen w-full text-gray-900">
      <Sidebar />
      <main className="duration-250 relative flex h-full w-full flex-col transition-all ease-in-out">
        <div className="fixed z-0 h-full w-full bg-gradient-to-br from-royal-secondary from-10% via-primary-blue via-30% to-turquoise-tertiary to-100% opacity-20 bg-blend-hue"></div>
        <Navbar />
        <div className={`z-10 ${isSidebarCollapsed ? "" : "md:pl-64"}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
      </AuthProvider>
    </StoreProvider>
  );
};
export default DashboardWrapper;
