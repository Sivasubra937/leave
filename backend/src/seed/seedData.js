const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const LeaveType = require('../models/LeaveType');
const LeaveRequest = require('../models/LeaveRequest');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Holiday = require('../models/Holiday');
const LeaveBalance = require('../models/LeaveBalance');

const seedDemoData = async (force = false) => {
  try {
    console.log('[Seed] Checking if database seeding is required...');

    const userCount = await User.countDocuments();
    if (userCount > 0 && !force) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Populating rich Student & College Leave Management dataset...');

    // Clear existing collections safely
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      LeaveType.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Holiday.deleteMany({}),
      LeaveBalance.deleteMany({}),
    ]);

    // 1. Seed Academic & General Leave Types
    const leaveTypes = await LeaveType.create([
      {
        name: 'On-Duty (OD) Leave',
        code: 'onduty',
        annualQuota: 15,
        isPaid: true,
        description:
          'For representing college in Hackathons, Coding Contests, Paper Presentations, Seminars, and Inter-College Sports.',
      },
      {
        name: 'Medical Leave',
        code: 'medical',
        annualQuota: 10,
        isPaid: true,
        description:
          'For sick recovery, hospital visits, or medical treatment. Doctor prescription/certificate required.',
      },
      {
        name: 'Casual Leave',
        code: 'casual',
        annualQuota: 12,
        isPaid: true,
        description: 'For personal affairs, urgent family events, or unplanned casual breaks.',
      },
      {
        name: 'Academic / Internship Leave',
        code: 'academic',
        annualQuota: 15,
        isPaid: true,
        description: 'For technical industrial internships, research conferences, and project work.',
      },
      {
        name: 'Sick Leave',
        code: 'sick',
        annualQuota: 10,
        isPaid: true,
        description: 'General sickness and health recuperation.',
      },
      {
        name: 'Earned Leave',
        code: 'earned',
        annualQuota: 15,
        isPaid: true,
        description: 'Accrued annual vacation leave for faculty and staff.',
      },
      {
        name: 'Unpaid / Semester Break',
        code: 'unpaid',
        annualQuota: 30,
        isPaid: false,
        description: 'Extended leave without stipend or academic credit deduction.',
      },
    ]);

    const ondutyType = leaveTypes.find((t) => t.code === 'onduty');
    const medicalType = leaveTypes.find((t) => t.code === 'medical');
    const casualType = leaveTypes.find((t) => t.code === 'casual');
    const academicType = leaveTypes.find((t) => t.code === 'academic');
    const sickType = leaveTypes.find((t) => t.code === 'sick');
    const earnedType = leaveTypes.find((t) => t.code === 'earned');

    // 2. Seed Academic Departments
    const cseDept = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science, Software Engineering, AI & Data Science.',
    });

    const itDept = await Department.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology, Cloud Computing & Cyber Security.',
    });

    const eceDept = await Department.create({
      name: 'Electronics & Communication',
      code: 'ECE',
      description: 'Department of Electronics, Embedded Systems & IoT.',
    });

    const mechDept = await Department.create({
      name: 'Mechanical Engineering',
      code: 'MECH',
      description: 'Department of Mechanical Engineering, Robotics & Design.',
    });

    // 3. Seed Faculty Mentors & College Dean
    const deanAdmin = await User.create({
      name: 'Prof. Sarah Connor',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      employeeId: 'DEAN-001',
      jobTitle: 'Dean of Academic Affairs',
      designation: 'Dean & Professor',
      phone: '+1 (555) 019-2831',
      department: cseDept._id,
      leaveBalances: {
        onduty: 15,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    // Alias admin for company email compatibility
    const companyAdmin = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      employeeId: 'ADM001',
      jobTitle: 'System Administrator & Dean',
      designation: 'Dean of Academics',
      phone: '+1 (555) 019-2832',
      department: cseDept._id,
      leaveBalances: {
        onduty: 15,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    const facultyAdvisorCSE = await User.create({
      name: 'Dr. Robert Chen',
      email: 'faculty@college.edu',
      password: 'faculty123',
      role: 'manager',
      employeeId: 'FAC-CSE-01',
      jobTitle: 'Associate Professor & Faculty Advisor',
      designation: 'Faculty Advisor (CSE 3rd Year)',
      phone: '+1 (555) 432-8765',
      department: cseDept._id,
      leaveBalances: {
        onduty: 15,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    const engManagerAlias = await User.create({
      name: 'Dr. Robert Chen (Faculty)',
      email: 'manager.eng@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'MGR001',
      jobTitle: 'Faculty Mentor & Tech Lead',
      designation: 'Associate Professor',
      phone: '+1 (555) 432-8766',
      department: cseDept._id,
      leaveBalances: {
        onduty: 15,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    const hodIT = await User.create({
      name: 'Dr. Elena Rodriguez',
      email: 'manager.hr@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'FAC-IT-02',
      jobTitle: 'Head of Department (IT)',
      designation: 'Professor & HOD',
      phone: '+1 (555) 765-4321',
      department: itDept._id,
      leaveBalances: {
        onduty: 15,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    // Link department heads
    cseDept.head = facultyAdvisorCSE._id;
    await cseDept.save();

    itDept.head = hodIT._id;
    await itDept.save();

    // 4. Seed Students assigned to Faculty Advisors
    const studentAlice = await User.create({
      name: 'Alice Sharma',
      email: 'student@college.edu',
      password: 'student123',
      role: 'employee',
      employeeId: '22CSE045',
      jobTitle: 'Student (Roll: 22CSE045)',
      designation: 'B.Tech CSE - 3rd Year',
      phone: '+1 (555) 234-5678',
      department: cseDept._id,
      manager: facultyAdvisorCSE._id,
      // 3 days On-Duty approved in history
      leaveBalances: {
        onduty: 12,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 12,
        unpaid: 30,
      },
    });

    // Corporate employee alias for Alice
    const aliceCompany = await User.create({
      name: 'Alice Johnson',
      email: 'alice@company.com',
      password: 'employee123',
      role: 'employee',
      employeeId: 'EMP1001',
      jobTitle: 'Student Intern / Engineer',
      designation: 'Senior Student Lead',
      phone: '+1 (555) 234-5679',
      department: cseDept._id,
      manager: engManagerAlias._id,
      leaveBalances: {
        onduty: 12,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 12,
        unpaid: 30,
      },
    });

    const studentBob = await User.create({
      name: 'Bob Smith',
      email: 'bob@college.edu',
      password: 'student123',
      role: 'employee',
      employeeId: '22CSE048',
      jobTitle: 'Student (Roll: 22CSE048)',
      designation: 'B.Tech CSE - 3rd Year',
      phone: '+1 (555) 345-6789',
      department: cseDept._id,
      manager: facultyAdvisorCSE._id,
      leaveBalances: {
        onduty: 15,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    const bobCompany = await User.create({
      name: 'Bob Smith (Company)',
      email: 'bob@company.com',
      password: 'employee123',
      role: 'employee',
      employeeId: 'EMP1002',
      jobTitle: 'Junior Developer',
      designation: 'Developer Intern',
      phone: '+1 (555) 345-6790',
      department: cseDept._id,
      manager: engManagerAlias._id,
      leaveBalances: {
        onduty: 15,
        medical: 10,
        casual: 12,
        academic: 15,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    const studentCharlie = await User.create({
      name: 'Charlie Davis',
      email: 'charlie@company.com',
      password: 'employee123',
      role: 'employee',
      employeeId: '22IT012',
      jobTitle: 'Student (Roll: 22IT012)',
      designation: 'B.Tech IT - 3rd Year',
      phone: '+1 (555) 456-7890',
      department: itDept._id,
      manager: hodIT._id,
      leaveBalances: {
        onduty: 15,
        medical: 10,
        casual: 10,
        academic: 15,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    // 5. Seed Realistic Student Leave Requests
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const addDays = (d, n) => {
      const result = new Date(d);
      result.setDate(result.getDate() + n);
      return result;
    };

    // (A) Pending On-Duty (OD) Leave for Alice (Smart India Hackathon Finals)
    const aliceODPending = await LeaveRequest.create({
      employee: studentAlice._id,
      leaveType: ondutyType._id,
      leaveTypeCode: 'onduty',
      leaveTypeName: 'On-Duty (OD) Leave',
      startDate: addDays(today, 5),
      endDate: addDays(today, 6),
      daysCount: 2,
      reason:
        'Selected for Grand Finale of Smart India Hackathon (SIH 2026) at IIT Bombay. Submitting invitation letter for OD attendance.',
      status: 'pending',
    });

    // Also mirror request for aliceCompany
    await LeaveRequest.create({
      employee: aliceCompany._id,
      leaveType: ondutyType._id,
      leaveTypeCode: 'onduty',
      leaveTypeName: 'On-Duty (OD) Leave',
      startDate: addDays(today, 5),
      endDate: addDays(today, 6),
      daysCount: 2,
      reason: 'Attending Smart India Hackathon 2026 National Finals.',
      status: 'pending',
    });

    // (B) Pending Medical Leave for Bob (Viral Fever with Clinic Slip)
    const bobMedicalPending = await LeaveRequest.create({
      employee: studentBob._id,
      leaveType: medicalType._id,
      leaveTypeCode: 'medical',
      leaveTypeName: 'Medical Leave',
      startDate: addDays(today, 3),
      endDate: addDays(today, 3),
      daysCount: 1,
      reason:
        'Severe viral fever and migraine. Advised complete rest by campus health physician. Medical slip attached.',
      status: 'pending',
    });

    // (C) Past Approved On-Duty (OD) Leave for Alice (IEEE International Conference)
    const aliceODApproved = await LeaveRequest.create({
      employee: studentAlice._id,
      leaveType: ondutyType._id,
      leaveTypeCode: 'onduty',
      leaveTypeName: 'On-Duty (OD) Leave',
      startDate: addDays(today, -15),
      endDate: addDays(today, -13),
      daysCount: 3,
      reason:
        'Oral presentation of research paper on "AI in Distributed Systems" at IEEE International Conference.',
      status: 'approved',
      approver: facultyAdvisorCSE._id,
      reviewer: facultyAdvisorCSE._id,
      approverComment:
        'Approved. Congratulations on representing our department at IEEE! Please submit the attendance certificate upon return.',
      reviewComments: 'Approved. Research presentation OD granted.',
      decisionDate: addDays(today, -16),
      reviewDate: addDays(today, -16),
    });

    // (D) Past Approved Casual Leave for Charlie (Sister Wedding)
    const charlieApproved = await LeaveRequest.create({
      employee: studentCharlie._id,
      leaveType: casualType._id,
      leaveTypeCode: 'casual',
      leaveTypeName: 'Casual Leave',
      startDate: addDays(today, -5),
      endDate: addDays(today, -4),
      daysCount: 2,
      reason: 'Attending elder sister wedding ceremony in hometown.',
      status: 'approved',
      approver: hodIT._id,
      reviewer: hodIT._id,
      approverComment: 'Approved. Ensure missed lab practicals are completed during makeup hours.',
      reviewComments: 'Approved.',
      decisionDate: addDays(today, -6),
    });

    // 6. Seed Notifications
    await Notification.create([
      {
        recipient: facultyAdvisorCSE._id,
        sender: studentAlice._id,
        title: 'New OD Leave Application Received',
        message: 'Alice Sharma (Roll: 22CSE045) applied for 2 days On-Duty (OD) Leave for Smart India Hackathon.',
        type: 'leave_applied',
        relatedLeave: aliceODPending._id,
        isRead: false,
      },
      {
        recipient: facultyAdvisorCSE._id,
        sender: studentBob._id,
        title: 'New Medical Leave Application Received',
        message: 'Bob Smith (Roll: 22CSE048) applied for 1 day Medical Leave.',
        type: 'leave_applied',
        relatedLeave: bobMedicalPending._id,
        isRead: false,
      },
      {
        recipient: studentAlice._id,
        sender: facultyAdvisorCSE._id,
        title: 'On-Duty Leave Approved',
        message: 'Your 3-day On-Duty leave for IEEE Conference presentation has been approved by Dr. Robert Chen.',
        type: 'leave_status',
        relatedLeave: aliceODApproved._id,
        isRead: true,
      },
    ]);

    // 7. Seed Audit Logs
    await AuditLog.create([
      {
        action: 'SYSTEM_INITIALIZED',
        performedBy: deanAdmin._id,
        details: { description: 'College Student Leave Management System initialized.' },
      },
      {
        action: 'LEAVE_APPLIED',
        performedBy: studentAlice._id,
        targetLeave: aliceODPending._id,
        details: { leaveType: 'onduty', days: 2 },
      },
      {
        action: 'LEAVE_APPROVED',
        performedBy: facultyAdvisorCSE._id,
        targetUser: studentAlice._id,
        targetLeave: aliceODApproved._id,
        details: { daysDeducted: 3, approver: facultyAdvisorCSE.name },
      },
    ]);

    // 8. Seed College Academic Calendar Holidays
    const currentYear = new Date().getFullYear();
    await Holiday.create([
      {
        name: "New Year's Day",
        date: new Date(currentYear, 0, 1),
        description: 'College winter holiday celebration',
        isRecurring: true,
      },
      {
        name: 'Republic Day',
        date: new Date(currentYear, 0, 26),
        description: 'National Republic Day Celebration',
        isRecurring: true,
      },
      {
        name: 'National Technology Day',
        date: new Date(currentYear, 4, 11),
        description: 'Celebration of technological innovations and student symposium',
        isRecurring: true,
      },
      {
        name: 'Independence Day',
        date: new Date(currentYear, 7, 15),
        description: 'National Independence Day Ceremony',
        isRecurring: true,
      },
      {
        name: 'Teachers & Engineers Day',
        date: new Date(currentYear, 8, 15),
        description: 'Commemoration of Sir M. Visvesvaraya & Teachers Day',
        isRecurring: true,
      },
      {
        name: 'Semester Exam Prep Break',
        date: new Date(currentYear, 10, 25),
        description: 'Academic preparatory recess before semester end-term examinations',
        isRecurring: false,
      },
      {
        name: 'Christmas / Winter Recess',
        date: new Date(currentYear, 11, 25),
        description: 'Winter vacation and semester break',
        isRecurring: true,
      },
    ]);

    // 9. Seed LeaveBalance documents
    const allUsers = [
      deanAdmin,
      companyAdmin,
      facultyAdvisorCSE,
      engManagerAlias,
      hodIT,
      studentAlice,
      aliceCompany,
      studentBob,
      bobCompany,
      studentCharlie,
    ];

    const balanceDocs = [];
    for (const u of allUsers) {
      for (const lt of leaveTypes) {
        const available = u.leaveBalances?.[lt.code] ?? lt.annualQuota;
        const used = Math.max(0, lt.annualQuota - available);
        balanceDocs.push({
          employee: u._id,
          leaveType: lt._id,
          year: currentYear,
          annualQuota: lt.annualQuota,
          usedDays: used,
          pendingDays: 0,
        });
      }
    }
    await LeaveBalance.insertMany(balanceDocs);

    console.log('[Seed] Seeding completed successfully!');
    console.log('====================================================');
    console.log('STUDENT & COLLEGE LEAVE MANAGEMENT ACCOUNTS:');
    console.log('Student (Alice Sharma, 22CSE045):  student@college.edu  / student123');
    console.log('Faculty Advisor (Dr. Robert Chen): faculty@college.edu  / faculty123');
    console.log('Dean of Academics (Prof. Connor):  admin@college.edu    / admin123');
    console.log('----------------------------------------------------');
    console.log('CORPORATE COMPATIBILITY ACCOUNTS:');
    console.log('Admin:       admin@company.com        / admin123');
    console.log('Manager ENG: manager.eng@company.com  / manager123');
    console.log('Manager HR:  manager.hr@company.com   / manager123');
    console.log('Employee:    alice@company.com        / employee123');
    console.log('Employee:    bob@company.com          / employee123');
    console.log('====================================================');
  } catch (err) {
    console.error('[Seed Error]', err);
  }
};

// If run directly from terminal: `node src/seed/seedData.js`
if (require.main === module) {
  require('dotenv').config();
  const { connectDB, closeDB } = require('../config/db');

  connectDB()
    .then(async () => {
      await seedDemoData(true);
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDemoData };
