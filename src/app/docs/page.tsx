import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Code, Rocket, Users, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";

export default async function DocsPage() {
  const session = await auth();

  const docsSections = [
    {
      title: "Getting Started",
      description: "Learn how to set up and use Readful",
      items: [
        { name: "Installation", path: "#installation" },
        { name: "First Steps", path: "#first-steps" },
        { name: "Uploading Books", path: "#uploading-books" },
      ],
      icon: <Rocket className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Reading Experience",
      description: "Everything about reading on Readful",
      items: [
        { name: "Reading Books", path: "#reading-books" },
        { name: "Bookmarks", path: "#bookmarks" },
        { name: "Reading Stats", path: "#reading-stats" },
      ],
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "For Authors",
      description: "Author-specific features and guides",
      items: [
        { name: "Becoming an Author", path: "#becoming-an-author" },
        { name: "Uploading EPUBs", path: "#uploading-epubs" },
        { name: "Tracking Reads", path: "#tracking-reads" },
        { name: "Author Analytics", path: "#author-analytics" },
      ],
      icon: <Users className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "API & Developers",
      description: "Technical documentation and API reference",
      items: [
        { name: "API Reference", path: "/api/docs" },
        { name: "Webhooks", path: "#webhooks" },
        { name: "Integrations", path: "#integrations" },
      ],
      icon: <Code className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Security & Privacy",
      description: "Learn about our security measures",
      items: [
        { name: "Data Protection", path: "#data-protection" },
        { name: "Privacy Policy", path: "#privacy-policy" },
        { name: "Terms of Service", path: "#terms-of-service" },
      ],
      icon: <Shield className="w-8 h-8" />,
      color: "from-yellow-500 to-amber-500",
    },
    {
      title: "Customization",
      description: "Customize your Readful experience",
      items: [
        { name: "Themes", path: "#themes" },
        { name: "Settings", path: "#settings" },
        { name: "Accessibility", path: "#accessibility" },
      ],
      icon: <Heart className="w-8 h-8" />,
      color: "from-indigo-500 to-violet-500",
    },
  ];

  const codeExample = `// Example: Uploading a book
const response = await fetch('/api/books', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Book',
    description: 'A great book',
    epubFile: file
  })
});

const book = await response.json();`;

  return (
    <div className="min-h-screen bg-gradient-dark pt-16">
      <Navbar session={session} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Readful</span> Docs
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Comprehensive documentation for using and developing with Readful
          </p>
        </motion.div>

        {/* Documentation Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {docsSections.map((section, index) => (
            <div
              key={section.title}
              className={`bg-gradient-card rounded-2xl p-6 ${
                index === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${section.color}`}>
                  <span className="text-white text-2xl">{section.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                  <p className="text-slate-400 text-sm">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.path}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Code Example Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-card rounded-2xl p-8 mb-16"
        >
          <h2 className="text-2xl font-semibold mb-4">API Example</h2>
          <p className="text-slate-400 mb-6">
            Here&apos;s a simple example of how to interact with the Readful API:
          </p>
          <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-slate-300">{codeExample}</pre>
          </div>
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-card rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
            <p className="text-slate-400 mb-4">
              Can&apos;t find what you&apos;re looking for? Check out our community forums or contact support.
            </p>
            <Link href="/community">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Visit Community
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-card rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Contribute</h3>
            <p className="text-slate-400 mb-4">
              Readful is open source. Help us improve by contributing to the project.
            </p>
            <Link href="https://github.com/nomyfo17/readful" target="_blank">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                GitHub Repository
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-card rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
            <p className="text-slate-400 mb-4">
              Follow our blog for the latest updates, features, and announcements.
            </p>
            <Link href="/blog">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Read Blog
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
