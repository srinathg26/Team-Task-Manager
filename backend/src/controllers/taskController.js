const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/projects/:projectId/tasks
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId } = req.query;

    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ tasks });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/projects/:projectId/tasks
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    // Validate assignee is a member if provided
    if (assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assigneeId } },
      });
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!member && project.ownerId !== assigneeId) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Verify user is a member of this task's project
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });
    const project = await prisma.project.findUnique({ where: { id: task.projectId } });

    if (!member && project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({ message: 'Task updated', task: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only creator or project admin can delete
    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });

    const canDelete =
      task.creatorId === req.user.id ||
      project.ownerId === req.user.id ||
      member?.role === 'ADMIN';

    if (!canDelete) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/tasks/:id/status — quick status update
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({ message: 'Status updated', task });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, updateTaskStatus };
