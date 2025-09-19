"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X, // นี่คือไอคอน X สำหรับปิดแถบด้านข้าง
  Home,
  User,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LucideIcon, // นำเข้า LucideIcon เพื่อใช้เป็น Type สำหรับ icon
} from "lucide-react";
import { useLogout } from "@/lib/logout";
import { useRouter, usePathname } from "next/navigation"; // นำเข้า usePathname
import { useMessage } from "../context/MessageContext";
import { useRole } from "../context/RoleContext";
import Spinner from "../ui/spinner";
import { useNotification } from "../context/NotificationContext";
import { toast } from "sonner";

const setFlash = (key: string, value: string) => {
  sessionStorage.setItem(key, value);
};

// กำหนด Type สำหรับ Navigation Item เพื่อแก้ปัญหา 'any[]'
interface NavigationItem {
  name: string;
  icon: LucideIcon; // ใช้ LucideIcon เป็น Type สำหรับ icon component
  href: string;
  current: boolean; // ตอนนี้ค่า current จะถูกกำหนดแบบ dynamic
}

type AppBarLayoutProps = {
  children: React.ReactNode; // ประกาศ prop children
};

const AppBarLayout: React.FC<AppBarLayoutProps> = ({ children }) => {
  const { role, first_name, last_name, isLoading, email_phone } = useRole(); // ดึงบทบาทของผู้ใช้จาก Context
  const router = useRouter();
  const pathname = usePathname(); // ดึง path ปัจจุบัน
  const logout = useLogout();
  const { showMessage } = useMessage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const { notifications } = useNotification();
  const lastNotifications = notifications[notifications.length - 1];
  useEffect(() => {
    if (notifications.length > 0) {
      console.log(notifications);
      const id = toast.success(
        `${lastNotifications?.detail_sender.email_phone}`,
        {
          description: `${lastNotifications?.content}`,
          // ปุ่ม ❌
          action: {
            label: "View",
            onClick: () => {
              setFlash(
                "conversation_id",
                lastNotifications?.conversation_id.toString()
              );
              router.push(
                `/${
                  role === "Landlord"
                    ? "landlord"
                    : role === "Tenant" && "tenant"
                }/message`
              );
            },
          },
          // เพิ่มคลิกที่ Toast เอง
          icon: "📩",
          closeButton: true,
        }
      );
      // showMessage("success", notifications[notifications.length - 1]?.content);
    }
  }, [notifications]);

  // สร้าง refs สำหรับปุ่ม dropdown โปรไฟล์และเนื้อหา dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // กำหนดรายการนำทางสำหรับแต่ละบทบาท
  // ค่า current ถูกกำหนดเป็น false ในเริ่มต้น เพราะจะถูกคำนวณใหม่ dynamic
  const tenantNavigationItems: NavigationItem[] = [
    {
      name: "Properties",
      icon: Home,
      href: "/tenant/properties",
      current: false,
    },
    { name: "Message", icon: User, href: "/tenant/message", current: false },
    {
      name: "Notifications",
      icon: Bell,
      href: "/tenant/notifications",
      current: false,
    },
  ];

  const landlordNavigationItems: NavigationItem[] = [
    {
      name: "MyProperties",
      icon: Home,
      href: "/landlord/myproperties",
      current: false,
    },
    { name: "Message", icon: User, href: "/landlord/message", current: false },
    {
      name: "Notifications",
      icon: Bell,
      href: "/landlord/notifications",
      current: false,
    },
  ];

  const adminNavigationItems: NavigationItem[] = [
    { name: "Dashboard", icon: Home, href: "/admin/dashboard", current: false },
    { name: "Users", icon: User, href: "/admin/users", current: false },
    { name: "Reports", icon: Bell, href: "/admin/reports", current: false },
    {
      name: "Settings",
      icon: Settings,
      href: "/admin/settings",
      current: false,
    },
  ];

  // เลือกรายการนำทางที่ถูกต้องตามบทบาทของผู้ใช้
  let baseNavigationItems: NavigationItem[];
  switch (role) {
    case "Tenant":
      baseNavigationItems = tenantNavigationItems;
      break;
    case "Landlord":
      baseNavigationItems = landlordNavigationItems;
      break;
    case "Admin":
      baseNavigationItems = adminNavigationItems;
      break;
    default:
      baseNavigationItems = [];
      break;
  }

  // สร้าง navigationItems สุดท้ายโดยกำหนดค่า current แบบ dynamic
  const navigationItems = baseNavigationItems.map((item) => ({
    ...item,
    current: pathname === item.href, // ตรวจสอบว่า path ปัจจุบันตรงกับ href ของ item หรือไม่
  }));

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Effect สำหรับจัดการการคลิกภายนอก dropdown โปรไฟล์
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // หากคลิกอยู่นอกเนื้อหา dropdown และนอกปุ่ม dropdown ให้ปิด dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setProfileDropdown(false);
      }
    };

    // เพิ่ม event listener เมื่อ dropdown เปิดอยู่
    if (profileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // ลบ event listener เมื่อ dropdown ปิดอยู่
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup: ลบ event listener เมื่อ component ถูกถอนการติดตั้ง
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdown]); // รัน effect ซ้ำเมื่อสถานะ profileDropdown เปลี่ยนแปลง

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {" "}
        {/* แก้ไขคลาสให้เหมาะสมกับการจัดกึ่งกลาง */}
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* โอเวอร์เลย์แถบด้านข้างบนมือถือ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      {/* แถบด้านข้าง */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 rounded-r-lg
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">
              {role} {/* แสดงบทบาทของผู้ใช้ */}
            </span>
          </div>
          {/* ปุ่มสำหรับปิดแถบด้านข้างเมื่อคลิก */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-0"
            onClick={toggleSidebar}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {/* แสดงรายการนำทางที่ถูกเลือกตามบทบาท */}
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 mb-2 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-0
                ${
                  item.current
                    ? "bg-blue-100 text-blue-800 border-l-4 border-blue-600" // อัปเดตสไตล์ active เพื่อการมองเห็นที่ดีขึ้น
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon
                className={`w-5 h-5 mr-3 ${
                  item.current ? "text-blue-600" : "text-gray-400"
                }`}
              />
              {item.name}
            </a>
          ))}
        </nav>

        {/* ส่วนท้ายของแถบด้านข้าง */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {first_name} {last_name}
              </p>
              <p className="text-xs text-gray-500">{email_phone}</p>
            </div>
          </div>
        </div>
      </div>
      {/* พื้นที่เนื้อหาหลัก */}
      <div className="lg:pl-64">
        {/* แถบนำทางด้านบน */}
        <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-6">
            {/* ด้านซ้าย - ปุ่มเมนูสำหรับมือถือ */}
            <div className="flex items-center">
              <button
                className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-0"
                onClick={toggleSidebar}
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* ด้านขวา - การแจ้งเตือนและโปรไฟล์ */}
            <div className="flex items-center space-x-4">
              {/* dropdown โปรไฟล์ */}
              <div className="relative">
                <button
                  ref={dropdownButtonRef} // แนบ ref กับปุ่ม
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0 p-1.5 hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => setProfileDropdown(!profileDropdown)}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="ml-2 text-gray-800 font-medium hidden md:block">
                    {first_name} {last_name}
                  </span>
                  <ChevronDown
                    className={`ml-1 w-4 h-4 text-gray-500 hidden md:block transition-transform duration-200 ${
                      profileDropdown ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {profileDropdown && (
                  <div
                    ref={dropdownRef} // แนบ ref กับเนื้อหา dropdown
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 p-1 animate-fade-in-down"
                    style={{ transformOrigin: "top right" }}
                  >
                    <div className="py-1">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-0"
                      >
                        Your Profile
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-0"
                      >
                        Settings
                      </a>
                      <div
                        onClick={logout}
                        className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors duration-150 focus:outline-none focus:ring-0"
                      >
                        Sign out
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* เนื้อหาหน้า */}
        <main className="">
          <div className="">{children}</div>
        </main>
      </div>
      {/* Tailwind CSS keyframes สำหรับแอนิเมชัน fade-in-down */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AppBarLayout;
