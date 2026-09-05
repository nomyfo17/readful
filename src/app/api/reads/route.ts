import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const reads = await prisma.read.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            author: {
              select: {
                id: true,
                name: true,
                authorName: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastRead: "desc",
      },
    });

    return NextResponse.json(
      { 
        reads: reads.map(read => ({
          id: read.id,
          book: read.book,
          progress: read.progress,
          lastRead: read.lastRead,
          startedAt: read.startedAt,
          finishedAt: read.finishedAt,
        })),
        message: "Reads fetched successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reads:", error);
    return NextResponse.json(
      { message: "Failed to fetch reads", error: error instanceof Error ? error.message : "Unknown error" },
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

    const { bookId, progress } = await request.json();

    if (!bookId) {
      return NextResponse.json(
        { message: "Book ID is required" },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    // Update or create read record
    const read = await prisma.read.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId,
        },
      },
      create: {
        userId: session.user.id,
        bookId,
        progress: progress || 0,
        lastRead: new Date(),
        startedAt: new Date(),
      },
      update: {
        progress: progress || { increment: 1 },
        lastRead: new Date(),
        ...(progress === 100 && { finishedAt: new Date() }),
      },
    });

    // Increment book read count
    await prisma.book.update({
      where: { id: bookId },
      data: { readCount: { increment: 1 } },
    });

    return NextResponse.json(
      { 
        read: {
          id: read.id,
          bookId: read.bookId,
          progress: read.progress,
          lastRead: read.lastRead,
        },
        message: "Read tracked successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error tracking read:", error);
    return NextResponse.json(
      { message: "Failed to track read", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
