const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getManagers,
  getTeamMembers,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/managers', getManagers);
router.get('/team-members', authorize('manager', 'admin'), getTeamMembers);
router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.put('/:id/status', authorize('admin'), toggleUserStatus);
router.patch('/:id/status', authorize('admin'), toggleUserStatus);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
