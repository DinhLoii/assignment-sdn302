import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations/task";
import { TaskPriority, TaskStatus } from "@prisma/client";

// GET /api/tasks - Retrieve all tasks with optional filtering & search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const priorityParam = searchParams.get("priority");
    const searchParam = searchParams.get("search");

    // Build Prisma where clause
    const where: {
      status?: TaskStatus;
      priority?: TaskPriority;
      OR?: Array<{ title?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" } }>;
    } = {};

    if (statusParam && statusParam !== "ALL" && Object.values(TaskStatus).includes(statusParam as TaskStatus)) {
      where.status = statusParam as TaskStatus;
    }

    if (priorityParam && priorityParam !== "ALL" && Object.values(TaskPriority).includes(priorityParam as TaskPriority)) {
      where.priority = priorityParam as TaskPriority;
    }

    if (searchParam && searchParam.trim().length > 0) {
      where.OR = [
        { title: { contains: searchParam.trim(), mode: "insensitive" } },
        { description: { contains: searchParam.trim(), mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tasks from database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validation = createTaskSchema.safeParse(body);
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

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        data: newTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
