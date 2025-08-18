"use client";
import { usePathname } from "next/navigation";
import AppBarLayout from "./AppBar";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  const noNavbarRoutes = ["/login", "/signup", "/notfound"];
  const useAppBarLayout = !noNavbarRoutes.includes(pathname);

  return useAppBarLayout ? (
    <AppBarLayout>{children}</AppBarLayout>
  ) : (
    <>{children}</>
  );
}
