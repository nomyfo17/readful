import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Pen, Settings, Users, Search, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getServerSession } from "next-auth";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Read Anywhere",
      description: "Access your books from any device with our seamless reading experience.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Upload EPUBs",
      description: "Share your own EPUB books with the community or keep them private.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Pen className="w-8 h-8" />,
      title: "Become an Author",
      description: "Create your author profile and showcase your literary works.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Follow Authors",
      description: "Stay updated with your favorite authors and their latest releases.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Track Reads",
      description: "Monitor how many people are reading your books with our analytics.",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Discover Books",
      description: "Find new and interesting books from our vast collection.",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  const sections = [
    { name: "App", path: "/app", icon: <BookOpen className="w-5 h-5" />, description: "Your reading feed" },
    { name: "Author", path: "/author", icon: <Pen className="w-5 h-5" />, description: "Author dashboard" },
    { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" />, description: "Account settings" },
    { name: "Docs", path: "/docs", icon: <BookOpen className="w-5 h-5" />, description: "Documentation" },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar session={session} />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-slate-800/20 to-slate-900/30" />
        <div className="relative max-w-6xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Readful</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Your Digital Reading Sanctuary
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            {!session ? (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="bg-transparent border-slate-600 hover:bg-slate-800 text-white">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/app">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  Go to App
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Floating book animation */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg opacity-20 animate-float" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg opacity-20 animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-40 left-1/4 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Features</h2>
            <p className="text-slate-400 text-lg">Everything you need for the perfect reading experience</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color}`}>
                  <span className="text-white text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections Overview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Explore Readful</h2>
            <p className="text-slate-400 text-lg">Different experiences for every need</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300"
              >
                <Link href={section.path} className="block">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                      <span className="text-white">{section.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{section.name}</h3>
                      <p className="text-slate-400 text-sm">{section.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                    Visit {section.name}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-card rounded-3xl p-12"
          >
            <h2 className="text-4xl font-bold mb-6">
              Start Your Reading Journey Today
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of readers and authors who have made Readful their digital reading sanctuary.
            </p>
            <Link href={session ? "/app" : "/auth/signin"}>
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                {session ? "Go to Dashboard" : "Get Started Free"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
