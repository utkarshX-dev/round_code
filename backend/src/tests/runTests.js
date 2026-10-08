process.env.NODE_ENV = 'test';
import assert from 'node:assert';
import http from 'node:http';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
dotenv.config();

import app from '../app.js';
import User from '../models/User.js';
import POTW from '../models/POTW.js';
import Submission from '../models/Submission.js';
import RatingHistory from '../models/RatingHistory.js';
import RegistrationRequest from '../models/RegistrationRequest.js';
import { processPOTWPenalties } from '../utils/penaltyWorker.js';

dotenv.config();

let server;
let baseUrl;
let mongod;

const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING ROUNDCODE COMPREHENSIVE BUSINESS RULE TESTS');
  console.log('======================================================\n');

  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  let superAdminToken;
  let adminToken;
  let memberToken;
  let memberId;
  let activePotwId;
  let problemIds = [];

  try {
    // -------------------------------------------------------------------------
    // 1. AUTHENTICATION & REGISTRATION TESTS
    // -------------------------------------------------------------------------
    console.log('▶ [Test 1.1] Registration: Valid DTU Email (@dtu.ac.in)...');
    const validReg = await request('POST', '/api/auth/register', {
      name: 'Kushagra Saxena',
      dtuEmail: 'kushagra22coe@dtu.ac.in',
      personalEmail: 'kushagra.test@gmail.com',
      branch: 'Computer Engineering',
      batch: '2026',
    });
    assert.strictEqual(validReg.status, 201);
    assert.strictEqual(validReg.body.success, true);
    console.log('  ✓ Passed: Registration request submitted.');

    console.log('▶ [Test 1.2] Registration: Invalid non-DTU Email rejected...');
    const invalidReg = await request('POST', '/api/auth/register', {
      name: 'Intruder',
      dtuEmail: 'intruder@gmail.com',
      personalEmail: 'intruder@gmail.com',
      branch: 'IT',
      batch: '2026',
    });
    assert.strictEqual(invalidReg.status, 400);
    assert.strictEqual(invalidReg.body.success, false);
    console.log('  ✓ Passed: Non-DTU email was rejected.');

    // Create Super Admin, Admin, Member directly for test suite
    const superAdmin = await User.create({
      name: 'Root Super Admin',
      dtuEmail: 'super@dtu.ac.in',
      personalEmail: 'super@roundtabledtu.in',
      password: 'Password@123',
      role: 'super_admin',
      accountStatus: 'active',
      rating: 0,
    });

    const admin = await User.create({
      name: 'Lead Admin',
      dtuEmail: 'admin@dtu.ac.in',
      personalEmail: 'admin@roundtabledtu.in',
      password: 'Password@123',
      role: 'admin',
      accountStatus: 'active',
      rating: 0,
    });

    const member = await User.create({
      name: 'Active Member',
      dtuEmail: 'member@dtu.ac.in',
      personalEmail: 'member@gmail.com',
      password: 'Password@123',
      role: 'member',
      accountStatus: 'active',
      rating: 0,
    });
    memberId = member._id.toString();

    console.log('▶ [Test 1.3] Login with Personal Email & Password & First-Time Tour flag...');
    const loginRes = await request('POST', '/api/auth/login', {
      personalEmail: 'member@gmail.com',
      password: 'Password@123',
    });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.success, true);
    assert.strictEqual(loginRes.body.data.isFirstLogin, true);
    assert.strictEqual(loginRes.body.data.user.hasSeenTour, false);
    memberToken = loginRes.body.data.token;

    // Test Complete Tour
    const completeTourRes = await request('PATCH', '/api/users/complete-tour', {}, memberToken);
    assert.strictEqual(completeTourRes.status, 200);
    assert.strictEqual(completeTourRes.body.data.hasSeenTour, true);

    // Verify subsequent login has isFirstLogin false
    const loginAgain = await request('POST', '/api/auth/login', {
      personalEmail: 'member@gmail.com',
      password: 'Password@123',
    });
    assert.strictEqual(loginAgain.body.data.isFirstLogin, false);
    assert.strictEqual(loginAgain.body.data.user.hasSeenTour, true);

    // Test Reset Tour
    const resetTourRes = await request('PATCH', '/api/users/reset-tour', {}, memberToken);
    assert.strictEqual(resetTourRes.status, 200);
    assert.strictEqual(resetTourRes.body.data.hasSeenTour, false);

    console.log('  ✓ Passed: Login successful with personal email and first-time tour flow verified.');

    const adminLogin = await request('POST', '/api/auth/login', {
      personalEmail: 'admin@roundtabledtu.in',
      password: 'Password@123',
    });
    adminToken = adminLogin.body.data.token;

    const superLogin = await request('POST', '/api/auth/login', {
      personalEmail: 'super@roundtabledtu.in',
      password: 'Password@123',
    });
    superAdminToken = superLogin.body.data.token;

    console.log('▶ [Test 1.4] Forgot Password & Reset Flow...');
    const forgotRes = await request('POST', '/api/auth/forgot-password', {
      personalEmail: 'member@gmail.com',
    });
    assert.strictEqual(forgotRes.status, 200);
    const resetUrl = new URL(forgotRes.body.devResetLink);
    const resetToken = resetUrl.searchParams.get('token');

    const resetRes = await request('POST', '/api/auth/reset-password', {
      personalEmail: 'member@gmail.com',
      token: resetToken,
      newPassword: 'NewPassword@123',
    });
    assert.strictEqual(resetRes.status, 200);

    // Verify login with new password
    const newLogin = await request('POST', '/api/auth/login', {
      personalEmail: 'member@gmail.com',
      password: 'NewPassword@123',
    });
    assert.strictEqual(newLogin.status, 200);
    memberToken = newLogin.body.data.token;
    console.log('  ✓ Passed: Forgot and reset password cycle succeeded.');

    // -------------------------------------------------------------------------
    // 2. AUTHORIZATION TESTS
    // -------------------------------------------------------------------------
    console.log('▶ [Test 2.1] Member cannot access Admin routes...');
    const memberAccessAdmin = await request('GET', '/api/registrations', null, memberToken);
    assert.strictEqual(memberAccessAdmin.status, 403);
    console.log('  ✓ Passed: Member was blocked with 403.');

    console.log('▶ [Test 2.2] Regular Admin cannot access Super Admin endpoints...');
    const adminAccessSuper = await request('GET', '/api/admin/admins', null, adminToken);
    assert.strictEqual(adminAccessSuper.status, 403);
    console.log('  ✓ Passed: Admin was blocked from Super Admin endpoint.');

    console.log('▶ [Test 2.3] Super Admin can access Super Admin endpoints...');
    const superAccessSuper = await request('GET', '/api/admin/admins', null, superAdminToken);
    assert.strictEqual(superAccessSuper.status, 200);
    console.log('  ✓ Passed: Super Admin successfully accessed admin management.');

    // -------------------------------------------------------------------------
    // 3. POTW STRUCTURE & CONFLICT TESTS
    // -------------------------------------------------------------------------
    console.log('▶ [Test 3.1] POTW creation rejected if not exactly 3 problems...');
    const invalidPotw = await request(
      'POST',
      '/api/potws',
      {
        weekNumber: 1,
        title: 'Invalid POTW',
        publishAt: new Date(),
        deadline: new Date(Date.now() + 86400000),
        problems: [
          { title: 'Only One', statement: 'Statement', difficulty: 'easy', maxScore: 1 },
        ],
      },
      adminToken
    );
    assert.strictEqual(invalidPotw.status, 400);
    console.log('  ✓ Passed: Invalid problem count rejected.');

    console.log('▶ [Test 3.2] Valid POTW creation with exactly Easy(1), Medium(2), Hard(3)...');
    const validPotw = await request(
      'POST',
      '/api/potws',
      {
        weekNumber: 101,
        title: 'Weekly Challenge 101',
        description: 'Binary trees and Dynamic Programming',
        publishAt: new Date(Date.now() - 3600000),
        deadline: new Date(Date.now() + 86400000 * 3), // 3 days in future
        status: 'active',
        problems: [
          {
            title: 'Tree Inorder',
            statement: 'Return inorder traversal',
            difficulty: 'easy',
            maxScore: 1,
            expectedTimeComplexity: 'O(n)',
            expectedSpaceComplexity: 'O(n)',
          },
          {
            title: 'Coin Change',
            statement: 'Return fewest coins',
            difficulty: 'medium',
            maxScore: 2,
            expectedTimeComplexity: 'O(n*amount)',
            expectedSpaceComplexity: 'O(amount)',
          },
          {
            title: 'Edit Distance',
            statement: 'Return min operations',
            difficulty: 'hard',
            maxScore: 3,
            expectedTimeComplexity: 'O(m*n)',
            expectedSpaceComplexity: 'O(m*n)',
          },
        ],
      },
      adminToken
    );
    assert.strictEqual(validPotw.status, 201);
    activePotwId = validPotw.body.data._id;
    problemIds = validPotw.body.data.problems.map((p) => p._id);
    console.log('  ✓ Passed: Valid 3-problem POTW created.');

    console.log('▶ [Test 3.3] Prevent multiple concurrent active POTWs...');
    const duplicateActivePotw = await request(
      'POST',
      '/api/potws',
      {
        weekNumber: 102,
        title: 'Conflicting POTW',
        publishAt: new Date(),
        deadline: new Date(Date.now() + 86400000 * 5),
        status: 'active',
        problems: [
          { title: 'E', statement: 'E', difficulty: 'easy', maxScore: 1 },
          { title: 'M', statement: 'M', difficulty: 'medium', maxScore: 2 },
          { title: 'H', statement: 'H', difficulty: 'hard', maxScore: 3 },
        ],
      },
      adminToken
    );
    assert.strictEqual(duplicateActivePotw.status, 400);
    console.log('  ✓ Passed: Conflicting active POTW was rejected.');

    // -------------------------------------------------------------------------
    // 4. SUBMISSION RULES & LOCK TESTS
    // -------------------------------------------------------------------------
    console.log('▶ [Test 4.1] Incomplete submission (missing questions) rejected...');
    const incompleteSub = await request(
      'POST',
      '/api/submissions',
      {
        potwId: activePotwId,
        problems: [
          {
            problemId: problemIds[0],
            language: 'C++',
            code: 'int main(){}',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            platform: 'LeetCode',
            submissionLink: 'https://leetcode.com/submissions/1',
            driveLink: 'https://drive.google.com/proof1',
          },
        ],
      },
      memberToken
    );
    assert.strictEqual(incompleteSub.status, 400);
    console.log('  ✓ Passed: Incomplete submission rejected.');

    console.log('▶ [Test 4.2] Full submission of all 3 questions accepted & locked...');
    const validSub = await request(
      'POST',
      '/api/submissions',
      {
        potwId: activePotwId,
        problems: [
          {
            problemId: problemIds[0],
            language: 'C++',
            code: 'void inorder(){}',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            platform: 'LeetCode',
            submissionLink: 'https://leetcode.com/submissions/1',
            driveLink: 'https://drive.google.com/proof1',
          },
          {
            problemId: problemIds[1],
            language: 'Python',
            code: 'def coinChange(): pass',
            timeComplexity: 'O(n*amount)',
            spaceComplexity: 'O(amount)',
            platform: 'LeetCode',
            submissionLink: 'https://leetcode.com/submissions/2',
            driveLink: 'https://drive.google.com/proof2',
          },
          {
            problemId: problemIds[2],
            language: 'C++',
            code: 'int minDistance(){ return 0; }',
            timeComplexity: 'O(m*n)',
            spaceComplexity: 'O(m*n)',
            platform: 'LeetCode',
            submissionLink: 'https://leetcode.com/submissions/3',
            driveLink: 'https://drive.google.com/proof3',
          },
        ],
      },
      memberToken
    );
    assert.strictEqual(validSub.status, 201);
    const submissionId = validSub.body.data._id;
    console.log('  ✓ Passed: Full submission accepted.');

    console.log('▶ [Test 4.3] Duplicate/locked submission cannot be resubmitted...');
    const duplicateSub = await request(
      'POST',
      '/api/submissions',
      {
        potwId: activePotwId,
        problems: validSub.body.data.problems,
      },
      memberToken
    );
    assert.strictEqual(duplicateSub.status, 400);
    console.log('  ✓ Passed: Locked submission rejected further edits.');

    // -------------------------------------------------------------------------
    // 5. REVIEW, PARTIAL SCORING & RATING COMPUTATION TESTS
    // -------------------------------------------------------------------------
    console.log('▶ [Test 5.1] Invalid score exceeding maxScore rejected...');
    const invalidReview = await request(
      'PATCH',
      `/api/submissions/${submissionId}/review`,
      {
        problemReviews: [
          { problemId: problemIds[0], score: 2.5, feedback: 'Too high' }, // Max is 1
          { problemId: problemIds[1], score: 1.5, feedback: 'OK' },
          { problemId: problemIds[2], score: 2.0, feedback: 'OK' },
        ],
      },
      adminToken
    );
    assert.strictEqual(invalidReview.status, 400);
    console.log('  ✓ Passed: Score exceeding maxScore was rejected.');

    console.log('▶ [Test 5.2] Review with valid partial scoring (Easy 1.0, Medium 1.5, Hard 2.0 = 4.5/6)...');
    const validReview = await request(
      'PATCH',
      `/api/submissions/${submissionId}/review`,
      {
        problemReviews: [
          { problemId: problemIds[0], score: 1, status: 'approved', feedback: 'Perfect' },
          { problemId: problemIds[1], score: 1.5, status: 'approved', feedback: 'Suboptimal space' },
          { problemId: problemIds[2], score: 2, status: 'approved', feedback: 'Good logic' },
        ],
      },
      adminToken
    );
    assert.strictEqual(validReview.status, 200);
    assert.strictEqual(validReview.body.data.totalScore, 4.5);

    // Verify member rating updated: 0 + 4.5 = 4.5
    const memberUpdated = await User.findById(memberId);
    assert.strictEqual(memberUpdated.rating, 4.5);
    assert.strictEqual(memberUpdated.potwsCompleted, 1);
    console.log('  ✓ Passed: Partial score of 4.5/6 awarded and member rating updated to 4.5.');

    // -------------------------------------------------------------------------
    // 6. PENALTY WORKER & NO-SUBMISSION PENALTY (-2, MIN 0)
    // -------------------------------------------------------------------------
    console.log('▶ [Test 6.1] No-submission penalty: rating decreases by 2, never below 0...');
    // Create member with rating 1
    const penaltyMember = await User.create({
      name: 'Unsubmitted Member',
      dtuEmail: 'unsub@dtu.ac.in',
      personalEmail: 'unsub@gmail.com',
      password: 'Password@123',
      role: 'member',
      accountStatus: 'active',
      rating: 1.0,
      createdAt: new Date(Date.now() - 86400000 * 2),
    });

    // Create an expired POTW where deadline has passed
    const expiredPotw = await POTW.create({
      weekNumber: 99,
      title: 'Expired POTW',
      publishAt: new Date(Date.now() - 86400000 * 3),
      deadline: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'active',
      createdBy: admin._id,
      problems: [
        { title: 'P1', statement: 'S1', difficulty: 'easy', maxScore: 1 },
        { title: 'P2', statement: 'S2', difficulty: 'medium', maxScore: 2 },
        { title: 'P3', statement: 'S3', difficulty: 'hard', maxScore: 3 },
      ],
    });

    await processPOTWPenalties(expiredPotw._id);

    const penalizedUser = await User.findById(penaltyMember._id);
    // Rating was 1.0. Deducting 2 gives Math.max(0, 1 - 2) = 0
    assert.strictEqual(penalizedUser.rating, 0);

    const ratingHist = await RatingHistory.findOne({ userId: penaltyMember._id, potwId: expiredPotw._id });
    assert.strictEqual(ratingHist.penalty, 2);
    assert.strictEqual(ratingHist.newRating, 0);
    console.log('  ✓ Passed: Penalty of -2 applied, bounded by min 0 with immutable RatingHistory entry.');

    // -------------------------------------------------------------------------
    // 7. SUPER ADMIN MANUAL RATING ADJUSTMENT (SECTION 57)
    // -------------------------------------------------------------------------
    console.log('▶ [Test 7.1] Super Admin manual rating modification with audit record...');
    const adjustRes = await request(
      'PATCH',
      `/api/admin/ratings/${penaltyMember._id}`,
      {
        newRating: 15.5,
        reason: 'Restoring bonus points for HackDTU hackathon achievement',
      },
      superAdminToken
    );
    assert.strictEqual(adjustRes.status, 200);
    assert.strictEqual(adjustRes.body.data.newRating, 15.5);

    const adjustedMember = await User.findById(penaltyMember._id);
    assert.strictEqual(adjustedMember.rating, 15.5);
    console.log('  ✓ Passed: Super Admin manual rating modification logged and saved.');

    console.log('\n======================================================');
    console.log('✅ ALL BACKEND BUSINESS RULE TESTS PASSED (100%)!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
  }
};

runAllTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
