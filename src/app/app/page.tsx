import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Search, Users, Upload, Eye, Clock, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BookCard } from "@/components/BookCard";

export default async function AppPage() {
  const session = await auth();

  // Fetch books data
  const books = await prisma.book.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          authorName: true,
        },
      },
      reads: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  const trendingBooks = [...books].sort((a, b) => b.readCount - a.readCount).slice(0, 6);
  const recentBooks = books.slice(0, 6);

  const stats = {
    totalBooks: await prisma.book.count(),
    totalAuthors: await prisma.user.count({ where: { isAuthor: true } }),
    totalReads: await prisma.read.count(),
  };

  const quickActions = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Book",
      description: "Share your EPUB files",
      path: "/app/upload",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Search Books",
      description: "Find new content",
      path: "/app/search",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Following",
      description: "Authors you follow",
      path: "/app/following",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Bookmark className="w-6 h-6" />,
      title: "Bookmarks",
      description: "Your saved books",
      path: "/app/bookmarks",
      color: "from-yellow-500 to-amber-500",
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient">Your Reading</span> Feed
              </h1>
              <p className="text-slate-400">
                Discover new books, track your reads, and connect with authors
              </p>
            </div>
            {session && (
              <Link href="/app/upload">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload EPUB
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-gradient-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{stats.totalBooks}</h3>
                <p className="text-slate-400 text-sm">Total Books</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{stats.totalAuthors}</h3>
                <p className="text-slate-400 text-sm">Authors</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{stats.totalReads}</h3>
                <p className="text-slate-400 text-sm">Total Reads</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.path}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`bg-gradient-card rounded-2xl p-6 cursor-pointer transition-all duration-200`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${action.color}`}>
                    <span className="text-white text-xl">{action.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                  <p className="text-slate-400 text-sm">{action.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Trending Books */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Trending Books</h2>
            <Link href="/app/search">
              <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingBooks.map((book) => (
              <BookCard
                key={book.id}
                book={{
                  id: book.id,
                  title: book.title,
                  description: book.description || "",
                  coverImage: book.coverImage || "/placeholder-book.png",
                  author: {
                    id: book.author.id,
                    name: book.author.authorName || book.author.name || "Unknown",
                    image: book.author.image || book.author.authorImage,
                  },
                  readCount: book.readCount,
                  createdAt: book.createdAt,
                }}
                session={session}
              />
            ))}
          </div>
        </motion.div>

        {/* Recent Books */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Recent Uploads</h2>
            <Link href="/app/search">
              <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentBooks.map((book) => (
              <BookCard
                key={book.id}
                book={{
                  id: book.id,
                  title: book.title,
                  description: book.description || "",
                  coverImage: book.coverImage || "/placeholder-book.png",
                  author: {
                    id: book.author.id,
                    name: book.author.authorName || book.author.name || "Unknown",
                    image: book.author.image || book.author.authorImage,
                  },
                  readCount: book.readCount,
                  createdAt: book.createdAt,
                }}
                session={session}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
