"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isAuthor?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthor: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  const signIn = async (email: string, password: string) => {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
  };

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    await signIn(email, password);
  };

  const value: AuthContextType = {
    user: session?.user as User | null,
    isAuthenticated: !!session?.user,
    isLoading,
    isAuthor: session?.user?.isAuthor || false,
    signIn,
    signOut,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
