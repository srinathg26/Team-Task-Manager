const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/projectController');
const {
  getTasks,
  createTask,
} = require('../controllers/taskController');
const { authenticate, requireProjectAdmin, requireProjectMember } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getProjects);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ],
  createProject
);

router.get('/:id', requireProjectMember, getProjectById);

router.put(
  '/:id',
  requireProjectAdmin,
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ],
  updateProject
);

router.delete('/:id', deleteProject);

// Member management (admin only)
router.post(
  '/:id/members',
  requireProjectAdmin,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
  ],
  addMember
);

router.delete('/:id/members/:userId', requireProjectAdmin, removeMember);

router.patch('/:id/members/:userId/role', requireProjectAdmin, updateMemberRole);

// Task routes nested under project
router.get('/:projectId/tasks', requireProjectMember, getTasks);

router.post(
  '/:projectId/tasks',
  requireProjectMember,
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().trim(),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('dueDate').optional().isISO8601().withMessage('Valid date required'),
    body('assigneeId').optional().isString(),
  ],
  createTask
);

module.exports = router;
