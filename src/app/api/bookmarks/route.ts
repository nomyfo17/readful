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
          updatedAt: bookmark.updatedAt,
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
        { message: "Unauthorized - Please log in to bookmark" },
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

    // Check if user already has a bookmark for this book
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        bookId,
      },
    });

    let bookmark;
    
    if (existingBookmark) {
      // Update existing bookmark (move it to new page/chapter)
      bookmark = await prisma.bookmark.update({
        where: {
          id: existingBookmark.id,
        },
        data: {
          chapterId: chapterId || null,
          page: page || null,
          notes: notes || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new bookmark
      bookmark = await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          bookId,
          chapterId: chapterId || null,
          page: page || null,
          notes: notes || null,
        },
      });
    }

    // Increment book's like count (bookmark = interest)
    await prisma.book.update({
      where: { id: bookId },
      data: { likeCount: { increment: 1 } },
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
          updatedAt: bookmark.updatedAt,
        },
        message: existingBookmark ? "Bookmark moved successfully" : "Bookmark created successfully"
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

// Special endpoint to move bookmark to a new page
// POST /api/bookmarks/move
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { oldBookId, newBookId, chapterId, page, notes } = await request.json();

    if (!oldBookId || !newBookId) {
      return NextResponse.json(
        { message: "Both old and new book IDs are required" },
        { status: 400 }
      );
    }

    // Find existing bookmark for old book
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        bookId: oldBookId,
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { message: "No bookmark found for the specified book" },
        { status: 404 }
      );
    }

    // Delete old bookmark
    await prisma.bookmark.delete({
      where: { id: existingBookmark.id },
    });

    // Create new bookmark for new book
    const newBookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        bookId: newBookId,
        chapterId: chapterId || null,
        page: page || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(
      { 
        message: "Bookmark moved successfully",
        oldBookmarkId: existingBookmark.id,
        newBookmark: {
          id: newBookmark.id,
          bookId: newBookmark.bookId,
          chapterId: newBookmark.chapterId,
          page: newBookmark.page,
          notes: newBookmark.notes,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error moving bookmark:", error);
    return NextResponse.json(
      { message: "Failed to move bookmark", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
