import { motion } from "framer-motion";
import Link from "next/link";
import { Settings, User, Bookmark, Bell, Shield, Heart, Pen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();

  const settingsSections = [
    {
      icon: <User className="w-6 h-6" />,
      title: "Profile Settings",
      description: "Manage your personal information",
      path: "/settings/profile",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Bookmark className="w-6 h-6" />,
      title: "Bookmarks",
      description: "View your saved books",
      path: "/settings/bookmarks",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notifications",
      description: "Configure your preferences",
      path: "/settings/notifications",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy & Security",
      description: "Control your data and security",
      path: "/settings/security",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Reading Preferences",
      description: "Customize your reading experience",
      path: "/settings/preferences",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Pen className="w-6 h-6" />,
      title: "Author Settings",
      description: "Manage your author profile",
      path: "/settings/author",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark pt-16">
      <Navbar session={session} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-slate-400">
            Customize your Readful experience
          </p>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {settingsSections.map((section, index) => (
            <Link key={section.title} href={section.path}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-gradient-card rounded-2xl p-6 cursor-pointer transition-all duration-200"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${section.color}`}>
                  <span className="text-white text-xl">{section.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{section.title}</h3>
                <p className="text-slate-400 text-sm">{section.description}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-card rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
            <div className="space-y-3">
              <Link href="/app">
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                  Go to App
                </Button>
              </Link>
              <Link href="/author">
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                  Author Dashboard
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                  Documentation
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-card rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Link href="/settings/profile">
                <Button variant="outline" className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800">
                  Edit Profile
                </Button>
              </Link>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
