"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type RoleContextType = {
  role: string | null;
  token: string | null;
  setRole: (role: string | null) => void;
  setToken: (token: string | null) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  return (
    <RoleContext.Provider value={{ role, token, setRole, setToken }}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook สำหรับใช้ใน component
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
