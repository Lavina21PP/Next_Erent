"use client";
import { usePathname } from "next/navigation";
import AppBarLayout from "./AppBar";
import { RoleProvider } from "../context/RoleContext";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  const noNavbarRoutes = [
    "/login",
    "/signup",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const useAppBarLayout = !noNavbarRoutes.includes(pathname);

  return useAppBarLayout ? (
    <AppBarLayout>
      <RoleProvider>{children}</RoleProvider>
    </AppBarLayout>
  ) : (
    <>{children}</>
  );
}
