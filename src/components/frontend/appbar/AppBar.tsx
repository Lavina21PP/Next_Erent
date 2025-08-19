"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X, // This is the X icon for closing the sidebar
  Home,
  User,
  Settings,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";
import { useLogout } from "@/lib/logout";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useMessage } from "../context/MessageContext";
import { getRole } from "@/lib/getRole";

type AppBarLayoutProps = {
  children: React.ReactNode; // Declare children prop
};

const AppBarLayout: React.FC<AppBarLayoutProps> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const logout = useLogout();
  const { showMessage } = useMessage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Create refs for the profile dropdown button and the dropdown content
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  const navigationItems = [
    { name: "Dashboard", icon: Home, href: "#", current: true }, // Changed href to '#' for example
    { name: "Profile", icon: User, href: "#", current: false },
    { name: "Settings", icon: Settings, href: "#", current: false },
    {
      name: "Notifications",
      icon: Bell,
      href: "#",
      current: false,
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Effect to handle clicks outside the profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is outside the dropdown content AND outside the dropdown button, close the dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setProfileDropdown(false);
      }
    };

    // Add event listener when dropdown is open
    if (profileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when dropdown is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup: remove event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdown]); // Re-run effect when profileDropdown state changes

  // if (isLoading) return <p>Loading role...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {" "}
      {/* Added font-sans class */}
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      {/* Sidebar */}
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
              {role}
            </span>
          </div>
          {/* This is the button that closes the sidebar when clicked */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-0"
            onClick={toggleSidebar}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 mb-2 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-0
                ${
                  item.current
                    ? "bg-blue-100 text-blue-800 border-l-4 border-blue-600" // Updated active style for better visual
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

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          {" "}
          {/* Added bg-white to footer */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          </div>
        </div>
      </div>
      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
          {" "}
          {/* Changed shadow-sm to shadow-md */}
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left side - Mobile menu button */}
            <div className="flex items-center">
              <button
                className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-0"
                onClick={toggleSidebar}
              >
                {" "}
                {/* Added focus:outline-none focus:ring-0 */}
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* Search bar */}
              <div className="relative hidden md:block w-72">
                {" "}
                {/* Increased width for search bar */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 text-sm shadow-sm" // Changed focus:ring-1 to focus:ring-0
                />
              </div>
            </div>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0 focus:ring-offset-0 rounded-full transition-colors duration-150">
                {" "}
                {/* Changed focus:ring-2 to focus:ring-0 and focus:ring-offset-2 to focus:ring-offset-0 */}
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>{" "}
                {/* Adjusted size and added pulse animation */}
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  ref={dropdownButtonRef} // Attach ref to the button
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0 p-1.5 hover:bg-gray-100 transition-colors duration-150" // Changed focus:ring-2 to focus:ring-0 and focus:ring-offset-2 to focus:ring-offset-0
                  onClick={() => setProfileDropdown(!profileDropdown)}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {" "}
                    {/* Changed background color */}
                    <User className="w-5 h-5 text-blue-600" />{" "}
                    {/* Changed icon color */}
                  </div>
                  <span className="ml-2 text-gray-800 font-medium hidden md:block">
                    John Doe
                  </span>
                  <ChevronDown
                    className={`ml-1 w-4 h-4 text-gray-500 hidden md:block transition-transform duration-200 ${
                      profileDropdown ? "rotate-180" : "rotate-0"
                    }`}
                  />{" "}
                  {/* Added rotation on dropdown open */}
                </button>

                {profileDropdown && (
                  <div
                    ref={dropdownRef} // Attach ref to the dropdown content
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 p-1 animate-fade-in-down" // Increased shadow, added padding, and animation
                    style={{ transformOrigin: "top right" }} // Set transform origin for animation
                  >
                    <div className="py-1">
                      <a
                        href="#" // Changed href to '#'
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-0" // Added focus:outline-none focus:ring-0
                      >
                        Your Profile
                      </a>
                      <a
                        href="#" // Changed href to '#'
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-0" // Added focus:outline-none focus:ring-0
                      >
                        Settings
                      </a>
                      <div
                        onClick={logout}
                        className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors duration-150 focus:outline-none focus:ring-0" // Added focus:outline-none focus:ring-0
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

        {/* Page content */}
        <main className="">
          {" "}
          {/* Removed min-h-screen from main to allow content to dictate height, adjusted in overall div */}
          <div className="max-w-7xl mx-auto">
            {" "}
            {/* Added padding-y */}
            {children} {/* <- content of each page */}
          </div>
        </main>
      </div>
      {/* Tailwind CSS keyframes for fade-in-down animation */}
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
