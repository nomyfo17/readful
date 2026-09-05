import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { generateId } from "@/lib/utils";

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), "public", "uploads");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";

    const where = {
      title: { contains: search, mode: "insensitive" as const },
      ...(genre && { genres: { has: genre } }),
    };

    const books = await prisma.book.findMany({
      where,
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
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.book.count({ where });

    return NextResponse.json(
      { 
        books: books.map(book => ({
          id: book.id,
          title: book.title,
          description: book.description,
          coverImage: book.coverImage,
          epubFile: book.epubFile,
          author: book.author,
          readCount: book.readCount,
          likeCount: book.likeCount,
          genres: book.genres,
          createdAt: book.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { message: "Failed to fetch books", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const genres = formData.get("genres") as string;
    const epubFile = formData.get("epubFile") as File;
    const coverImage = formData.get("coverImage") as File;

    if (!title || !epubFile) {
      return NextResponse.json(
        { message: "Title and EPUB file are required" },
        { status: 400 }
      );
    }

    // Generate unique filenames
    const epubFileName = `${generateId()}-${epubFile.name}`;
    const coverFileName = coverImage ? `${generateId()}-${coverImage.name}` : null;

    // Ensure uploads directory exists
    await mkdir(uploadsDir, { recursive: true });

    // Save EPUB file
    const epubBuffer = await epubFile.arrayBuffer();
    const epubPath = join(uploadsDir, epubFileName);
    await writeFile(epubPath, Buffer.from(epubBuffer));

    // Save cover image if provided
    let coverPath = "/placeholder-book.png";
    if (coverImage) {
      const coverBuffer = await coverImage.arrayBuffer();
      coverPath = `/uploads/${coverFileName}`;
      const coverFilePath = join(uploadsDir, coverFileName!);
      await writeFile(coverFilePath, Buffer.from(coverBuffer));
    }

    // Create book record
    const book = await prisma.book.create({
      data: {
        title,
        description,
        epubFile: `/uploads/${epubFileName}`,
        coverImage: coverPath,
        authorId: session.user.id,
        genres: genres ? genres.split(",").map(g => g.trim()) : [],
      },
    });

    return NextResponse.json(
      { 
        book: {
          id: book.id,
          title: book.title,
          description: book.description,
          coverImage: book.coverImage,
          epubFile: book.epubFile,
          authorId: book.authorId,
          genres: book.genres,
          createdAt: book.createdAt,
        },
        message: "Book uploaded successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading book:", error);
    return NextResponse.json(
      { message: "Failed to upload book", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
