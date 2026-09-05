"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Eye, Bookmark as BookmarkIcon, Heart } from "lucide-react";
import { Button } from "./ui/Button";
import { formatNumber, timeAgo } from "@/lib/utils";

interface Author {
  id: string;
  name: string;
  image?: string | null;
}

interface Book {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  author: Author;
  readCount: number;
  createdAt: Date;
}

interface BookCardProps {
  book: Book;
  session: any;
  showAuthor?: boolean;
  compact?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  session,
  showAuthor = true,
  compact = false,
}) => {
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      // Redirect to login
      window.location.href = "/auth/login";
      return;
    }

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId: book.id }),
      });

      if (response.ok) {
        // Bookmark added successfully
        console.log("Bookmark added");
      }
    } catch (error) {
      console.error("Failed to add bookmark:", error);
    }
  };

  const handleRead = async () => {
    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      await fetch("/api/reads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId: book.id, progress: 0 }),
      });
    } catch (error) {
      console.error("Failed to track read:", error);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-gradient-card rounded-2xl overflow-hidden transition-all duration-200 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <Link href={`/app/books/${book.id}`} onClick={handleRead}>
        <div className="flex gap-4">
          {/* Book Cover */}
          <div className={`relative ${compact ? "w-16 h-24" : "w-24 h-32"}`}>
            <Image
              src={book.coverImage || "/placeholder-book.png"}
              alt={book.title}
              fill
              className="object-cover rounded-lg"
              unoptimized
            />
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold mb-1 ${
                compact ? "text-sm" : "text-lg"
              }`}
            >
              {book.title}
            </h3>
            {showAuthor && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs">
                  {book.author.image ? (
                    <Image
                      src={book.author.image}
                      alt={book.author.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-white">
                      {book.author.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-sm">{book.author.name}</span>
              </div>
            )}
            <p
              className={`text-slate-400 mb-3 line-clamp-2 ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              {book.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(book.readCount)} reads</span>
              </div>
              <span>•</span>
              <span>{timeAgo(book.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className="flex-1 text-slate-400 hover:text-indigo-400"
        >
          <BookmarkIcon className="w-4 h-4" />
        </Button>
        <Link href={`/app/books/${book.id}`} className="flex-1">
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm"
          >
            Read
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
