const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user is admin of the project
const requireProjectAdmin = async (req, res, next) => {
  try {
    const { projectId, id: paramId } = req.params;
    const pid = projectId || paramId;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: pid, userId: req.user.id } },
    });

    const project = await prisma.project.findUnique({ where: { id: pid } });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.ownerId === req.user.id;
    const isAdmin = member?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

// Check if user is a member of the project
const requireProjectMember = async (req, res, next) => {
  try {
    const { projectId, id: paramId } = req.params;
    const pid = projectId || paramId;

    const project = await prisma.project.findUnique({ where: { id: pid } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.ownerId === req.user.id;
    if (isOwner) {
      req.project = project;
      return next();
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: pid, userId: req.user.id } },
    });

    if (!member) return res.status(403).json({ message: 'Not a project member' });

    req.project = project;
    req.projectRole = member.role;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, requireProjectAdmin, requireProjectMember };
