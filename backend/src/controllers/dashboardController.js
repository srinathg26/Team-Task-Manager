const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Projects where user is owner or member
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    // All tasks in those projects
    const allTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    // My assigned tasks
    const myTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        dueDate: { lt: now },
        status: { not: 'DONE' },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Status summary
    const statusSummary = {
      TODO: allTasks.filter((t) => t.status === 'TODO').length,
      IN_PROGRESS: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      DONE: allTasks.filter((t) => t.status === 'DONE').length,
    };

    // Priority summary
    const prioritySummary = {
      HIGH: allTasks.filter((t) => t.priority === 'HIGH').length,
      MEDIUM: allTasks.filter((t) => t.priority === 'MEDIUM').length,
      LOW: allTasks.filter((t) => t.priority === 'LOW').length,
    };

    // Recent activity (last 5 updated tasks)
    const recentActivity = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return res.json({
      stats: {
        totalProjects: projects.length,
        totalTasks: allTasks.length,
        overdueTasks: overdueTasks.length,
        myTasks: myTasks.length,
      },
      statusSummary,
      prioritySummary,
      myTasks,
      overdueTasks,
      recentActivity,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboard };
