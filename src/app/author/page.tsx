import { motion } from "framer-motion";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pen, Users, BookOpen, Eye, Upload, Settings, BarChart3, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BookCard } from "@/components/BookCard";

export default async function AuthorPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login?redirect=/author");
  }

  // Fetch author data
  const authorBooks = await prisma.book.findMany({
    where: {
      authorId: session.user.id,
    },
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
  });

  const authorStats = {
    totalBooks: authorBooks.length,
    totalReads: authorBooks.reduce((sum, book) => sum + book.readCount, 0),
    totalLikes: authorBooks.reduce((sum, book) => sum + book.likeCount, 0),
    followers: await prisma.following.count({
      where: {
        followingId: session.user.id,
      },
    }),
    following: await prisma.following.count({
      where: {
        followerId: session.user.id,
      },
    }),
  };

  const popularBooks = [...authorBooks].sort((a, b) => b.readCount - a.readCount).slice(0, 6);
  const recentBooks = authorBooks.slice(0, 6);

  const authorActions = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Book",
      description: "Add new EPUB to your collection",
      path: "/author/upload",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics",
      description: "View detailed reading statistics",
      path: "/author/data",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Followers",
      description: `Manage your ${authorStats.followers} followers`,
      path: "/author/followers",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Author Settings",
      description: "Configure your author profile",
      path: "/settings/author",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark pt-16">
      <Navbar session={session} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Author Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient">Author</span> Dashboard
              </h1>
              <p className="text-slate-400">
                Manage your books, track reads, and engage with your audience
              </p>
            </div>
            <Link href="/author/upload">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Book
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Author Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-gradient-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{authorStats.totalBooks}</h3>
                <p className="text-slate-400 text-sm">Your Books</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{authorStats.totalReads}</h3>
                <p className="text-slate-400 text-sm">Total Reads</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Pen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{authorStats.totalLikes}</h3>
                <p className="text-slate-400 text-sm">Total Likes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{authorStats.followers}</h3>
                <p className="text-slate-400 text-sm">Followers</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Author Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Author Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {authorActions.map((action, index) => (
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

        {/* Popular Books */}
        {popularBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Most Popular Books</h2>
              <Link href="/author/books">
                <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularBooks.map((book) => (
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
        )}

        {/* Recent Books */}
        {recentBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recent Uploads</h2>
              <Link href="/author/books">
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
        )}

        {/* Empty State */}
        {authorBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">No Books Yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You haven&apos;t uploaded any books yet. Start sharing your work with the community!
            </p>
            <Link href="/author/upload">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Book
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
