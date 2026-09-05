"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Upload, Download, Save, Trash2, Eye, Settings, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function EPUBEditorPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("editor");
  const [epubContent, setEpubContent] = useState<string>("");
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    description: "",
    language: "en",
  });
  const [chapters, setChapters] = useState<{ id: string; title: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("untitled.epub");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setEpubContent(content);
        parseEPUB(content);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseEPUB = (content: string) => {
    // Simple parsing - in a real app, use a proper EPUB parser
    try {
      // Extract basic metadata
      const titleMatch = content.match(/<dc:title>([^<]+)<\/dc:title>/);
      const authorMatch = content.match(/<dc:creator>([^<]+)<\/dc:creator>/);
      const descMatch = content.match(/<dc:description>([^<]+)<\/dc:description>/);

      setMetadata({
        title: titleMatch?.[1] || "",
        author: authorMatch?.[1] || "",
        description: descMatch?.[1] || "",
        language: "en",
      });

      // Extract chapters (simplified)
      const chapterMatches = content.matchAll(/<navPoint[^>]*id="([^"]+)"[^>]*><navLabel><text>([^<]+)<\/text><\/navLabel>/g);
      const chaptersList = Array.from(chapterMatches).map((match, index) => ({
        id: match[1] || `chapter-${index + 1}`,
        title: match[2] || `Chapter ${index + 1}`,
        content: "",
      }));

      if (chaptersList.length > 0) {
        setChapters(chaptersList);
      }
    } catch (error) {
      console.error("Error parsing EPUB:", error);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      alert("Please log in to save your work");
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would save to the database
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: metadata.title,
          description: metadata.description,
          epubFile: epubContent,
        }),
      });

      if (response.ok) {
        alert("Book saved successfully!");
      } else {
        alert("Failed to save book");
      }
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Error saving book");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // Create a simple EPUB structure
    const epubTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${generateId()}</dc:identifier>
    <dc:title>${metadata.title || "Untitled"}</dc:title>
    <dc:creator>${metadata.author || "Unknown"}</dc:creator>
    <dc:description>${metadata.description || ""}</dc:description>
    <dc:language>${metadata.language}</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${chapters.map((chapter, index) => `
    <item id="chapter-${index + 1}" href="chapter-${index + 1}.xhtml" media-type="application/xhtml+xml"/>`).join("")}
  </manifest>
  <spine>
    ${chapters.map((_, index) => `
    <itemref idref="chapter-${index + 1}"/>`).join("")}
  </spine>
</package>`;

    const blob = new Blob([epubContent || epubTemplate], { type: "application/epub+zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addChapter = () => {
    setChapters([
      ...chapters,
      {
        id: `chapter-${chapters.length + 1}`,
        title: `Chapter ${chapters.length + 1}`,
        content: "",
      },
    ]);
  };

  const updateChapter = (id: string, field: "title" | "content", value: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === id ? { ...chapter, [field]: value } : chapter
      )
    );
  };

  const removeChapter = (id: string) => {
    setChapters(chapters.filter((chapter) => chapter.id !== id));
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const tabs = [
    { id: "editor", label: "Editor", icon: <BookOpen className="w-4 h-4" /> },
    { id: "metadata", label: "Metadata", icon: <Settings className="w-4 h-4" /> },
    { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark pt-16">
      <Navbar session={null} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">EPUB</span> Editor
            </h1>
            <p className="text-slate-400">Create and edit EPUB books</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import EPUB
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".epub"
              className="hidden"
            />
            <Button
              onClick={handleSave}
              disabled={isLoading}
              isLoading={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-card rounded-2xl p-6 mb-8"
        >
          <div className="flex gap-2 mb-6 border-b border-slate-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === "editor" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chapter List */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-4">Chapters</h3>
                  <div className="space-y-2 mb-4">
                    {chapters.map((chapter) => (
                      <motion.div
                        key={chapter.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-slate-800/50 rounded-lg p-3 cursor-pointer transition-colors"
                        onClick={() => setActiveTab("chapter-" + chapter.id)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 text-sm">{chapter.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeChapter(chapter.id);
                            }}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <Button
                    onClick={addChapter}
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Chapter
                  </Button>
                </div>

                {/* Editor */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Content</h3>
                  <div className="bg-slate-900/50 rounded-lg p-4 min-h-[400px] border border-slate-700/50">
                    <textarea
                      value={epubContent}
                      onChange={(e) => setEpubContent(e.target.value)}
                      placeholder="EPUB content will appear here..."
                      className="w-full h-full bg-transparent text-slate-300 placeholder-slate-500 resize-none outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "metadata" && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-6">Book Metadata</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) =>
                        setMetadata({ ...metadata, title: e.target.value })
                      }
                      placeholder="Enter book title"
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) =>
                        setMetadata({ ...metadata, author: e.target.value })
                      }
                      placeholder="Enter author name"
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={metadata.description}
                      onChange={(e) =>
                        setMetadata({ ...metadata, description: e.target.value })
                      }
                      placeholder="Enter book description"
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Language
                    </label>
                    <select
                      value={metadata.language}
                      onChange={(e) =>
                        setMetadata({ ...metadata, language: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab.startsWith("chapter-") && (
              <div className="max-w-4xl">
                <h3 className="text-lg font-semibold mb-6">
                  Edit Chapter
                </h3>
                {(() => {
                  const chapterId = activeTab.replace("chapter-", "");
                  const chapter = chapters.find((c) => c.id === chapterId);
                  
                  if (!chapter) return <p>Chapter not found</p>;

                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Chapter Title
                        </label>
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) =>
                            updateChapter(chapter.id, "title", e.target.value)
                          }
                          placeholder="Enter chapter title"
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Content
                        </label>
                        <textarea
                          value={chapter.content}
                          onChange={(e) =>
                            updateChapter(chapter.id, "content", e.target.value)
                          }
                          placeholder="Enter chapter content"
                          rows={10}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>

                      <Button
                        variant="destructive"
                        onClick={() => removeChapter(chapter.id)}
                        className="w-fit"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Chapter
                      </Button>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "preview" && (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Preview</h3>
                <p className="text-slate-400">
                  Preview functionality will be available soon. In the meantime, use the Export button to download your EPUB.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-card rounded-2xl p-6">
            <h4 className="font-semibold mb-2">Quick Start</h4>
            <p className="text-slate-400 text-sm">
              Import an existing EPUB to get started, or create a new one from scratch.
            </p>
          </div>
          <div className="bg-gradient-card rounded-2xl p-6">
            <h4 className="font-semibold mb-2">Save Your Work</h4>
            <p className="text-slate-400 text-sm">
              Log in to save your books to your Readful account for easy access.
            </p>
          </div>
          <div className="bg-gradient-card rounded-2xl p-6">
            <h4 className="font-semibold mb-2">Export Options</h4>
            <p className="text-slate-400 text-sm">
              Download your EPUB at any time to share or use elsewhere.
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
