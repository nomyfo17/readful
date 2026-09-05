"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, Upload, Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState("");
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const epubInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleEpubUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith(".epub")) {
      setError("Please upload a valid EPUB file");
      return;
    }
    
    setError("");
    setEpubFile(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError("Please log in to upload books");
      return;
    }

    if (!epubFile) {
      setError("Please select an EPUB file");
      return;
    }

    if (!title) {
      setError("Please enter a title");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("genres", genres);
      formData.append("epubFile", epubFile);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const response = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      setSuccess("Book uploaded successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setGenres("");
      setEpubFile(null);
      setCoverImage(null);
      setCoverPreview(null);

      // Redirect to the book page after a delay
      setTimeout(() => {
        router.push(`/app/books/${data.book.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-16">
      <Navbar session={{ user }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Upload</span> EPUB
          </h1>
          <p className="text-slate-400">
            Share your books with the Readful community
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-card rounded-2xl p-8 mb-8"
        >
          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg mb-6"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EPUB File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                EPUB File *
              </label>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  epubFile
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                }`}
                onClick={() => epubInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={epubInputRef}
                  onChange={handleEpubUpload}
                  accept=".epub"
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">
                  {epubFile ? epubFile.name : "Drag & drop EPUB file or click to browse"}
                </p>
                <p className="text-xs text-slate-500">
                  Supported format: .epub (Max size: 50MB)
                </p>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cover Image (Optional)
              </label>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  coverPreview
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                }`}
                onClick={() => coverInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-24 h-32 object-cover rounded-lg mx-auto mb-4"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCover();
                      }}
                      className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Image className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">
                      Upload cover image
                    </p>
                    <p className="text-xs text-slate-500">
                      Recommended: 400x600px (JPG, PNG, WebP)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter book description (optional)"
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Genres (Optional)
              </label>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="e.g., Fiction, Fantasy, Romance (comma separated)"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !epubFile || !title}
              isLoading={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Book
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-card rounded-2xl p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              EPUB Requirements
            </h4>
            <p className="text-slate-400 text-sm">
              Upload valid EPUB files (version 2.0 or 3.0). Make sure your EPUB is properly formatted for the best reading experience.
            </p>
          </div>
          <div className="bg-gradient-card rounded-2xl p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Cover Image Tips
            </h4>
            <p className="text-slate-400 text-sm">
              Use high-quality images (400x600px recommended) for the best visual appeal. JPG, PNG, and WebP formats are supported.
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
