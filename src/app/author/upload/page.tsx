"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Upload, 
  Image, 
  X, 
  Loader2,
  Tag,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthorUploadPage() {
  const router = useRouter();
  const { isAuthenticated, user, signOut } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [sampleChapter, setSampleChapter] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [epubMetadata, setEpubMetadata] = useState<any>(null);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [maturityRating, setMaturityRating] = useState("General");
  const [language, setLanguage] = useState("en");
  const [publisher, setPublisher] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [isbn, setIsbn] = useState("");
  const [series, setSeries] = useState("");
  const [seriesNumber, setSeriesNumber] = useState("");

  const epubInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const sampleInputRef = useRef<HTMLInputElement>(null);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/author/upload");
    }
  }, [isAuthenticated, router]);

  const handleEpubUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith(".epub")) {
      setError("Please upload a valid EPUB file");
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      setError("EPUB file size exceeds 50MB limit");
      return;
    }
    
    setError("");
    setEpubFile(file);
    
    // Parse EPUB metadata
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uintArray = new Uint8Array(arrayBuffer);
        
        // Simple EPUB parsing (in production, use epubjs)
        const text = new TextDecoder().decode(uintArray.subarray(0, 10000));
        
        // Extract basic metadata
        const titleMatch = text.match(/<dc:title>([^<]+)<\/dc:title>/i);
        const authorMatch = text.match(/<dc:creator>([^<]+)<\/dc:creator>/i);
        const descMatch = text.match(/<dc:description>([^<]+)<\/dc:description>/i);
        const langMatch = text.match(/<dc:language>([^<]+)<\/dc:language>/i);
        const dateMatch = text.match(/<dc:date>([^<]+)<\/dc:date>/i);
        
        setEpubMetadata({
          title: titleMatch?.[1] || "",
          author: authorMatch?.[1] || "",
          description: descMatch?.[1] || "",
          language: langMatch?.[1] || "en",
          date: dateMatch?.[1] || "",
        });
        
        // Auto-fill form if metadata exists
        if (titleMatch?.[1]) setTitle(titleMatch[1]);
        if (descMatch?.[1]) setDescription(descMatch[1]);
        if (langMatch?.[1]) setLanguage(langMatch[1]);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error parsing EPUB:", error);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image size exceeds 5MB limit");
      return;
    }
    
    setError("");
    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSampleChapter(file);
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleRemoveSample = () => {
    setSampleChapter(null);
  };

  const addGenre = () => {
    if (genreInput.trim() && !genres.includes(genreInput.trim())) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput("");
    }
  };

  const removeGenre = (genre: string) => {
    setGenres(genres.filter(g => g !== genre));
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
      formData.append("subtitle", subtitle);
      formData.append("description", description);
      formData.append("genres", JSON.stringify(genres));
      formData.append("epubFile", epubFile);
      
      // Advanced metadata
      formData.append("language", language);
      formData.append("publisher", publisher);
      formData.append("publishedDate", publishedDate);
      formData.append("isbn", isbn);
      formData.append("series", series);
      formData.append("seriesNumber", seriesNumber);
      formData.append("maturityRating", maturityRating);
      
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      
      if (sampleChapter) {
        formData.append("sampleChapter", sampleChapter);
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
      setSuccess("Book uploaded successfully! Redirecting...");
      
      // Reset form
      setTitle("");
      setSubtitle("");
      setDescription("");
      setGenres([]);
      setGenreInput("");
      setEpubFile(null);
      setCoverImage(null);
      setSampleChapter(null);
      setCoverPreview(null);
      setEpubMetadata(null);
      setPublishedDate("");
      setIsbn("");
      setSeries("");
      setSeriesNumber("");

      // Redirect to the book page after a delay
      setTimeout(() => {
        router.push(`/author/books/${data.book.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (activeStep === 1 && !epubFile) {
      setError("Please upload an EPUB file first");
      return;
    }
    if (activeStep === 2 && !title) {
      setError("Please enter a title");
      return;
    }
    setActiveStep(activeStep + 1);
    setError("");
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };

  const steps = [
    { number: 1, label: "Upload EPUB" },
    { number: 2, label: "Basic Info" },
    { number: 3, label: "Advanced Metadata" },
    { number: 4, label: "Review & Publish" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-16">
        <Navbar session={{ user }} />
        <div className="flex items-center justify-center min-h-[calc(100vh-136px)] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
            <p className="text-slate-400 mb-6">
              You must be logged in to upload books as an author.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/auth/login")}>
                Log In
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth/signin")}>
                Sign Up
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-16">
      <Navbar session={{ user }} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Upload</span> Your Book
          </h1>
          <p className="text-slate-400">
            Share your EPUB with the Readful community
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      activeStep >= step.number
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {activeStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span className={`text-xs mt-2 ${activeStep >= step.number ? "text-white" : "text-slate-500"}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-2 rounded ${activeStep > step.number ? "bg-indigo-600" : "bg-slate-700"}`} style={{ minWidth: "80px" }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-card rounded-2xl p-8 mb-8"
        >
          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg mb-6 flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: EPUB Upload */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-xl font-semibold mb-6">Upload Your EPUB File</h3>
                
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
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
                  <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">
                    {epubFile ? epubFile.name : "Drag & drop EPUB file or click to browse"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Supported format: .epub (Max size: 50MB)
                  </p>
                  
                  {epubMetadata && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 p-4 bg-slate-800/50 rounded-lg"
                    >
                      <h4 className="font-semibold mb-2">Detected Metadata:</h4>
                      {epubMetadata.title && <p className="text-sm text-slate-300">Title: {epubMetadata.title}</p>}
                      {epubMetadata.author && <p className="text-sm text-slate-300">Author: {epubMetadata.author}</p>}
                      {epubMetadata.description && <p className="text-sm text-slate-300 line-clamp-2">Description: {epubMetadata.description}</p>}
                      {epubMetadata.language && <p className="text-sm text-slate-300">Language: {epubMetadata.language}</p>}
                    </motion.div>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button onClick={nextStep} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Next: Basic Info
                    <Plus className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Basic Info */}
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-xl font-semibold mb-6">Basic Information</h3>
                
                <div className="space-y-4">
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

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Enter book subtitle"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      placeholder="Enter detailed book description..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  {/* Genres */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Genres
                    </label>
                    <div className="flex gap-2 mb-2">
                      {genres.map((genre) => (
                        <motion.div
                          key={genre}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-4 h-4" />
                          {genre}
                          <button
                            type="button"
                            onClick={() => removeGenre(genre)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={genreInput}
                        onChange={(e) => setGenreInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                        placeholder="Add genre..."
                        className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Button onClick={addGenre} type="button" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Cover Image */}
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
                            className="w-32 h-48 object-cover rounded-lg mx-auto mb-4"
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
                            Recommended: 400x600px (JPG, PNG, WebP, Max: 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button onClick={prevStep} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Back
                  </Button>
                  <Button onClick={nextStep} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Next: Advanced Metadata
                    <Plus className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Advanced Metadata */}
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-xl font-semibold mb-6">Advanced Metadata</h3>
                
                <div className="space-y-4">
                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>

                  {/* Publisher */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Publisher (Optional)
                    </label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="Enter publisher name"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Published Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Published Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={publishedDate}
                      onChange={(e) => setPublishedDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* ISBN */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      ISBN (Optional)
                    </label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="Enter ISBN number"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Series */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Series (Optional)
                      </label>
                      <input
                        type="text"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        placeholder="Enter series name"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Series Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={seriesNumber}
                        onChange={(e) => setSeriesNumber(e.target.value)}
                        placeholder="e.g., 1, 2, 3..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Maturity Rating */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Maturity Rating
                    </label>
                    <select
                      value={maturityRating}
                      onChange={(e) => setMaturityRating(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="General">General Audiences</option>
                      <option value="Teen">Teen</option>
                      <option value="Mature">Mature</option>
                      <option value="Adult">Adult</option>
                    </select>
                  </div>

                  {/* Sample Chapter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sample Chapter (Optional)
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        sampleChapter
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                      }`}
                      onClick={() => sampleInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={sampleInputRef}
                        onChange={handleSampleUpload}
                        accept=".epub,.pdf,.txt"
                        className="hidden"
                      />
                      
                      {sampleChapter ? (
                        <div className="relative">
                          <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                          <p className="text-slate-400 mb-2">{sampleChapter.name}</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSample();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-400 mb-2">
                            Upload sample chapter
                          </p>
                          <p className="text-xs text-slate-500">
                            EPUB, PDF, or TXT (Max: 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Advanced Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAdvanced}
                        onChange={(e) => setIsAdvanced(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                    <span className="text-sm font-medium text-slate-300">Show more options</span>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button onClick={prevStep} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Back
                  </Button>
                  <Button onClick={nextStep} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Next: Review & Publish
                    <Plus className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review & Publish */}
            {activeStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-xl font-semibold mb-6">Review & Publish</h3>
                
                <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold mb-4">Book Summary</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Book Info */}
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-3">Basic Information</h5>
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-500 text-sm">Title:</span>
                          <p className="text-white font-medium">{title || "Not provided"}</p>
                        </div>
                        {subtitle && (
                          <div>
                            <span className="text-slate-500 text-sm">Subtitle:</span>
                            <p className="text-white">{subtitle}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-500 text-sm">Description:</span>
                          <p className="text-slate-300 text-sm line-clamp-3">{description || "Not provided"}</p>
                        </div>
                        {genres.length > 0 && (
                          <div>
                            <span className="text-slate-500 text-sm">Genres:</span>
                            <div className="flex gap-1 flex-wrap">
                              {genres.map((genre) => (
                                <span key={genre} className="bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded text-xs">
                                  {genre}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-3">Additional Information</h5>
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-500 text-sm">Language:</span>
                          <p className="text-white">{language}</p>
                        </div>
                        {publisher && (
                          <div>
                            <span className="text-slate-500 text-sm">Publisher:</span>
                            <p className="text-white">{publisher}</p>
                          </div>
                        )}
                        {publishedDate && (
                          <div>
                            <span className="text-slate-500 text-sm">Published:</span>
                            <p className="text-white">{publishedDate}</p>
                          </div>
                        )}
                        {isbn && (
                          <div>
                            <span className="text-slate-500 text-sm">ISBN:</span>
                            <p className="text-white">{isbn}</p>
                          </div>
                        )}
                        {series && (
                          <div>
                            <span className="text-slate-500 text-sm">Series:</span>
                            <p className="text-white">{series}{seriesNumber && ` #${seriesNumber}`}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-500 text-sm">Maturity:</span>
                          <p className="text-white">{maturityRating}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  {coverPreview && (
                    <div className="mt-6 pt-4 border-t border-slate-700/50">
                      <h5 className="text-sm font-medium text-slate-400 mb-3">Cover Image</h5>
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-24 h-36 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <h5 className="text-sm font-medium text-slate-400 mb-3">Files</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                        <span className="text-white">{epubFile?.name}</span>
                        <span className="text-slate-500 text-xs">({(epubFile?.size! / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      {sampleChapter && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-400" />
                          <span className="text-white">{sampleChapter.name}</span>
                          <span className="text-slate-500 text-xs">({(sampleChapter.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button onClick={prevStep} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !title || !epubFile}
                    isLoading={isLoading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Publish Book
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
