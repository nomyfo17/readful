"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Pen, Settings, Menu, X, User, LogIn, LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  session: any;
}

export const Navbar: React.FC<NavbarProps> = ({ session: initialSession }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "App", path: "/app", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Author", path: "/author", icon: <Pen className="w-5 h-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
    { name: "Docs", path: "/docs", icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/80 backdrop-blur-lg border-b border-slate-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-gradient hidden sm:block">
              Readful
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path}>
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50 gap-2"
                >
                  {item.icon}
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/settings/profile">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  className="text-slate-300 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50 gap-2"
                  >
                    {item.icon}
                    {item.name}
                  </Button>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-slate-800">
                {isAuthenticated ? (
                  <>
                    <Link href="/settings/profile" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-300 hover:text-white gap-2"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:text-red-300 gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-300 hover:text-white"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
