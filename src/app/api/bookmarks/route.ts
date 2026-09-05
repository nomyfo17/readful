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

    const bookmarks = await prisma.bookmark.findMany({
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
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { 
        bookmarks: bookmarks.map(bookmark => ({
          id: bookmark.id,
          book: bookmark.book,
          chapterId: bookmark.chapterId,
          page: bookmark.page,
          notes: bookmark.notes,
          createdAt: bookmark.createdAt,
        })),
        message: "Bookmarks fetched successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { message: "Failed to fetch bookmarks", error: error instanceof Error ? error.message : "Unknown error" },
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

    const { bookId, chapterId, page, notes } = await request.json();

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

    // Create or update bookmark
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId,
        },
      },
      create: {
        userId: session.user.id,
        bookId,
        chapterId,
        page,
        notes,
      },
      update: {
        chapterId,
        page,
        notes,
      },
    });

    return NextResponse.json(
      { 
        bookmark: {
          id: bookmark.id,
          bookId: bookmark.bookId,
          chapterId: bookmark.chapterId,
          page: bookmark.page,
          notes: bookmark.notes,
          createdAt: bookmark.createdAt,
        },
        message: "Bookmark saved successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving bookmark:", error);
    return NextResponse.json(
      { message: "Failed to save bookmark", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookmarkId } = await request.json();

    if (!bookmarkId) {
      return NextResponse.json(
        { message: "Bookmark ID is required" },
        { status: 400 }
      );
    }

    await prisma.bookmark.delete({
      where: {
        id: bookmarkId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { message: "Failed to delete bookmark", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
