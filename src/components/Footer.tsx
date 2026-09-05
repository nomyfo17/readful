"use client";

import Link from "next/link";
import { BookOpen, Heart, Twitter, GitHub, Instagram } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "App", path: "/app" },
      { name: "Author", path: "/author" },
      { name: "Settings", path: "/settings" },
      { name: "Docs", path: "/docs" },
    ],
    resources: [
      { name: "EPUB Editor", path: "/editor" },
      { name: "Upload Book", path: "/app/upload" },
      { name: "Search", path: "/app/search" },
      { name: "Following", path: "/app/following" },
    ],
    support: [
      { name: "Documentation", path: "/docs" },
      { name: "Community", path: "/community" },
      { name: "Contact", path: "/contact" },
    ],
  };

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, path: "#" },
    { icon: <GitHub className="w-5 h-5" />, path: "https://github.com/nomyfo17/readful" },
    { icon: <Instagram className="w-5 h-5" />, path: "#" },
  ];

  return (
    <footer className="bg-slate-900/50 border-t border-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">Readful</span>
            </motion.div>
            <p className="text-slate-400 text-sm">
              Your digital reading sanctuary. Upload, read, and share EPUB books with ease.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} Readful. All rights reserved.
          </p>
          <p className="text-slate-400 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> for readers
          </p>
        </div>
      </div>
    </footer>
  );
};
