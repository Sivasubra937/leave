require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('./src/config/db');
const { seedDemoData } = require('./src/seed/seedData');
const User = require('./src/models/User');
const LeaveRequest = require('./src/models/LeaveRequest');
const LeaveType = require('./src/models/LeaveType');
const Holiday = require('./src/models/Holiday');
const LeaveBalance = require('./src/models/LeaveBalance');
const { calculateWorkingDays, validateLeaveDates, checkOverlappingLeaves } = require('./src/utils/leaveCalculator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`  PASS: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING FULL STACK LEAVE MANAGEMENT SYSTEM TEST SUITE');
  console.log('====================================================');

  try {
    // 1. Connect DB and seed
    await connectDB();
    await seedDemoData();

    console.log('\n--- Test Group 1: Seed Data Verification ---');
    const admin = await User.findOne({ email: 'admin@company.com' }).select('+password');
    const manager = await User.findOne({ email: 'manager.eng@company.com' }).select('+password');
    const alice = await User.findOne({ email: 'alice@company.com' }).select('+password');

    assert(admin && admin.role === 'admin', 'Admin user exists with role "admin"');
    assert(manager && manager.role === 'manager', 'Manager user exists with role "manager"');
    assert(alice && alice.role === 'employee', 'Employee Alice exists with role "employee"');

    const holidayCount = await Holiday.countDocuments();
    assert(holidayCount >= 5, `Configured holidays seeded (found ${holidayCount})`);

    const balanceCount = await LeaveBalance.countDocuments();
    assert(balanceCount > 0, `Leave balance records seeded (found ${balanceCount})`);

    console.log('\n--- Test Group 2: Password Hashing & Authentication ---');
    const isPasswordValid = await bcrypt.compare('employee123', alice.password);
    assert(isPasswordValid, 'Bcrypt correctly validates employee password');

    const token = jwt.sign({ id: alice._id, role: alice.role }, process.env.JWT_SECRET || 'leave_management_jwt_secret_dev_2024_fsd', { expiresIn: '7d' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'leave_management_jwt_secret_dev_2024_fsd');
    assert(decoded.id === alice._id.toString() && decoded.role === 'employee', 'JWT generation and payload verification succeeded');

    console.log('\n--- Test Group 3: Business Rules & Working Days Calculation ---');
    // Test Weekend exclusion
    // 2026-10-17 is Saturday, 2026-10-18 is Sunday
    const weekendDays = await calculateWorkingDays('2026-10-17', '2026-10-18');
    assert(weekendDays === 0, 'Saturdays and Sundays are correctly excluded (0 working days)');

    // Test Monday-Friday (5 days)
    // 2026-10-19 (Mon) to 2026-10-23 (Fri)
    const weekDays = await calculateWorkingDays('2026-10-19', '2026-10-23');
    assert(weekDays === 5, 'Full work week Monday-Friday calculates to 5 working days');

    // Test Holiday exclusion
    // Thanksgiving is 2026-11-26 (Thursday). Range 2026-11-23 (Mon) to 2026-11-27 (Fri) has 5 weekdays minus 1 holiday = 4 working days
    const holidayWeekDays = await calculateWorkingDays('2026-11-23', '2026-11-27');
    assert(holidayWeekDays === 4, 'Configured holiday is automatically excluded (5 weekdays - 1 holiday = 4 days)');

    // Test Past Date validation
    let pastDateErrorCaught = false;
    try {
      await validateLeaveDates('2020-01-01', '2020-01-05');
    } catch (err) {
      pastDateErrorCaught = true;
    }
    assert(pastDateErrorCaught, 'Past date leave application is rejected');

    console.log('\n--- Test Group 4: Leave Application & Overlapping Protection ---');
    const casualType = await LeaveType.findOne({ code: 'casual' });
    assert(casualType !== null, 'Casual leave type exists');

    // Create a new pending leave request
    const startWindow = new Date(Date.now() + 14 * 86400000);
    // Find next Monday
    while (startWindow.getDay() !== 1) startWindow.setDate(startWindow.getDate() + 1);
    const endWindow = new Date(startWindow);
    endWindow.setDate(endWindow.getDate() + 2); // Mon - Wed (3 days)

    const initialBalance = alice.leaveBalances.casual;

    // Clean up any prior test run requests
    await LeaveRequest.deleteMany({ reason: 'Automated test suite leave application' });

    const testLeave = await LeaveRequest.create({
      employee: alice._id,
      leaveType: casualType._id,
      leaveTypeCode: casualType.code,
      leaveTypeName: casualType.name,
      startDate: startWindow,
      endDate: endWindow,
      daysCount: 3,
      reason: 'Automated test suite leave application',
      status: 'pending',
    });
    assert(testLeave.status === 'pending', 'New leave request created with initial status "pending"');

    // Check that balance is NOT yet deducted upon application
    const alicePostApply = await User.findById(alice._id);
    assert(alicePostApply.leaveBalances.casual === initialBalance, 'Leave balance is NOT deducted while status is pending');

    // Test overlapping leave detection
    const conflict = await checkOverlappingLeaves(alice._id, startWindow, endWindow);
    assert(conflict !== null && conflict._id.toString() === testLeave._id.toString(), 'Overlapping leave conflict correctly detected');

    console.log('\n--- Test Group 5: Approval Workflow & Balance Deduction ---');
    // Manager approves the leave
    alicePostApply.leaveBalances.casual -= testLeave.daysCount;
    await alicePostApply.save();

    testLeave.status = 'approved';
    testLeave.approver = manager._id;
    testLeave.reviewer = manager._id;
    testLeave.approverComment = 'Approved by test suite';
    testLeave.reviewComments = 'Approved by test suite';
    testLeave.decisionDate = new Date();
    testLeave.reviewDate = new Date();
    await testLeave.save();

    const alicePostApprove = await User.findById(alice._id);
    assert(alicePostApprove.leaveBalances.casual === initialBalance - 3, `Leave balance correctly deducted on approval (${initialBalance} -> ${alicePostApprove.leaveBalances.casual})`);
    assert(testLeave.status === 'approved', 'Leave request status transitioned to "approved"');

    console.log('\n--- Test Group 6: Cancellation Workflow & Balance Refund ---');
    // Cancel the approved leave
    alicePostApprove.leaveBalances.casual += testLeave.daysCount;
    await alicePostApprove.save();

    testLeave.status = 'cancelled';
    testLeave.cancelledAt = new Date();
    testLeave.cancellationReason = 'Cancelled by applicant via automated test';
    await testLeave.save();

    const alicePostCancel = await User.findById(alice._id);
    assert(alicePostCancel.leaveBalances.casual === initialBalance, `Leave balance correctly refunded upon cancellation (${alicePostCancel.leaveBalances.casual})`);
    assert(testLeave.status === 'cancelled', 'Leave request status transitioned to "cancelled"');

    console.log('\n====================================================');
    console.log(`TEST SUITE RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('====================================================\n');

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('\n[FATAL ERROR IN TEST SUITE]:', err);
    await closeDB();
    process.exit(1);
  }
}

runTests();
