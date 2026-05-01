const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/projects — get all projects where user is owner or member
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ projects });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/projects — create a project
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'ADMIN' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    return res.json({ project });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/projects/:id — update project (admin only)
const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return res.json({ message: 'Project updated', project });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/projects/:id — delete project (owner only)
const deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can delete a project' });
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Project deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/projects/:id/members — add member (admin only)
const addMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, role = 'MEMBER' } = req.body;
    const projectId = req.params.id;

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with this email' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });
    if (existing) return res.status(409).json({ message: 'User is already a member' });

    const member = await prisma.projectMember.create({
      data: { projectId, userId: userToAdd.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return res.status(201).json({ message: 'Member added', member });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/projects/:id/members/:userId — remove member (admin only)
const removeMember = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.ownerId === userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    return res.json({ message: 'Member removed' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/projects/:id/members/:userId/role — update member role (admin only)
const updateMemberRole = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be ADMIN or MEMBER' });
    }

    const member = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return res.json({ message: 'Role updated', member });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
};
