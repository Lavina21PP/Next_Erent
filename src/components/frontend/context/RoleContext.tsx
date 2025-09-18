"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type RoleContextType = {
  id: number | null;
  role: string | null;
  email_phone: string | null;
  first_name: string | null;
  last_name: string | null;
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [id, setId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email_phone, setEmail_Phone] = useState<string | null>(null);
  const [first_name, setFirst_Name] = useState<string | null>(null);
  const [last_name, setLast_Name] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      setIsLoading(true);
      try {
        // await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate loading delay
        const res = await axios.get("/api/me");
        setId(res.data.id);
        setRole(res.data.role);
        setEmail_Phone(res.data.email_phone);
        setFirst_Name(res.data.first_name);
        setLast_Name(res.data.last_name);
      } catch (err) {
        console.error("Failed to fetch role", err);
        setId(null);
        setRole(null);
        setEmail_Phone(null);
        setFirst_Name(null);
        setLast_Name(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, []);

  return (
    <RoleContext.Provider value={{ id, role, isLoading, first_name, last_name, email_phone }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
};
