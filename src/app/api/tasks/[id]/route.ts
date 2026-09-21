import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations/task";
import { TaskPriority, TaskStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tasks/:id - Retrieve a single task by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: `Task with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Error retrieving task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/:id - Update an existing task
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: `Task with ID ${id} not found` },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate payload with Zod
    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, description, status, priority, dueDate } = validation.data;

    // Build update data object
    const updateData: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date | null;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (status !== undefined) updateData.status = status as TaskStatus;
    if (priority !== undefined) updateData.priority = priority as TaskPriority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/:id - Delete a task by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: `Task with ID ${id} not found` },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
