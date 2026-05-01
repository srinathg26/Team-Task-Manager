const express = require('express');
const { body } = require('express-validator');
const { updateTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Valid date required'),
  ],
  updateTask
);

router.patch('/:id/status', updateTaskStatus);

router.delete('/:id', deleteTask);

module.exports = router;
