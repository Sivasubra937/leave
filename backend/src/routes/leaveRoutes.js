const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getLeaves,
  getLeaveDetails,
  cancelLeave,
  getTeamLeaves,
  reviewLeave,
  approveLeave,
  rejectLeave,
  getAllLeaves,
  getLeaveStats,
  getCalendarLeaves,
  getLeaveBalances,
  getLeaveDocument,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // All leave routes require authenticated user

// General & statistics
router.get('/stats', getLeaveStats);
router.get('/calendar', getCalendarLeaves);
router.get('/balances', getLeaveBalances);

// Query leaves list (role-aware: all for admin, team for manager, my for employee)
router.get('/', getLeaves);
router.get('/my', getMyLeaves);
router.get('/my-leaves', getMyLeaves);

// Submit leave request (supports optional document file upload)
router.post('/', upload.single('document'), applyLeave);
router.post('/apply', upload.single('document'), applyLeave);

// Manager / Admin review endpoints
router.get('/team-leaves', authorize('manager', 'admin'), getTeamLeaves);
router.put('/:id/review', authorize('manager', 'admin'), reviewLeave);
router.patch('/:id/approve', authorize('manager', 'admin'), approveLeave);
router.patch('/:id/reject', authorize('manager', 'admin'), rejectLeave);

// Cancel leave request
router.put('/:id/cancel', cancelLeave);
router.patch('/:id/cancel', cancelLeave);

// Admin specific company-wide view
router.get('/all', authorize('admin'), getAllLeaves);

// Single leave details and secure document viewing
router.get('/:id/document', getLeaveDocument);
router.get('/:id', getLeaveDetails);

module.exports = router;
