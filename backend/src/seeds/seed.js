import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import POTW from '../models/POTW.js';
import Submission from '../models/Submission.js';
import RatingHistory from '../models/RatingHistory.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import RegistrationRequest from '../models/RegistrationRequest.js';

dotenv.config();

const seed = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Cleaning existing records...');
    await Promise.all([
      User.deleteMany({}),
      POTW.deleteMany({}),
      Submission.deleteMany({}),
      RatingHistory.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      RegistrationRequest.deleteMany({}),
    ]);

    console.log('Seeding Users...');
    // 1 Super Admin
    const superAdmin = await User.create({
      name: 'Dr. Akhil Sharma (President RT)',
      dtuEmail: 'president.rt@dtu.ac.in',
      personalEmail: 'superadmin@roundtabledtu.in',
      password: 'Password@123',
      role: 'super_admin',
      accountStatus: 'active',
      branch: 'Computer Engineering',
      batch: '2023',
      bio: 'President at Round Table DTU. Tech enthusiast & Competitive Programmer.',
      skills: ['C++', 'Python', 'System Design', 'Algorithms', 'Distributed Systems'],
      codingProfiles: {
        leetcode: 'https://leetcode.com/u/akhil_rt',
        codeforces: 'https://codeforces.com/profile/tourist',
        github: 'https://github.com/akhil-dtu',
        linkedin: 'https://linkedin.com/in/akhil-dtu',
      },
    });

    // 2 Admins
    const admin1 = await User.create({
      name: 'Utkarsh Bhandari (Tech Lead)',
      dtuEmail: 'utkarsh.lead@dtu.ac.in',
      personalEmail: 'admin.utkarsh@roundtabledtu.in',
      password: 'Password@123',
      role: 'admin',
      accountStatus: 'active',
      branch: 'Software Engineering',
      batch: '2024',
      bio: 'Technical Lead @ Round Table DTU. Full-Stack Architect & Competitive Coder.',
      skills: ['C++', 'React', 'Node.js', 'Next.js', 'MongoDB', 'Docker'],
      codingProfiles: {
        leetcode: 'https://leetcode.com/u/utkarsh_rt',
        codeforces: 'https://codeforces.com/profile/utkarsh_dtu',
        github: 'https://github.com/utkarsh-dtu',
        linkedin: 'https://linkedin.com/in/utkarsh-bhandari',
      },
      projects: [
        {
          name: 'ROUNDCode Platform',
          description: 'Official competitive coding and skill tracker for Round Table DTU.',
          techStack: ['Next.js', 'Node.js', 'Express', 'MongoDB', 'Tailwind'],
          githubLink: 'https://github.com/roundtable-dtu/roundcode',
          liveLink: 'https://roundcode.roundtabledtu.in',
        },
      ],
    });

    const admin2 = await User.create({
      name: 'Ananya Verma (DSA Head)',
      dtuEmail: 'ananya.verma@dtu.ac.in',
      personalEmail: 'ananya.admin@roundtabledtu.in',
      password: 'Password@123',
      role: 'admin',
      accountStatus: 'active',
      branch: 'Information Technology',
      batch: '2024',
      bio: 'DSA Lead @ Round Table DTU. 6-star CodeChef, Candidate Master on Codeforces.',
      skills: ['C++', 'Algorithms', 'Graph Theory', 'Dynamic Programming', 'Python'],
      codingProfiles: {
        leetcode: 'https://leetcode.com/u/ananya_v',
        codeforces: 'https://codeforces.com/profile/ananya_cf',
        codechef: 'https://www.codechef.com/users/ananya_dtu',
        github: 'https://github.com/ananya-dtu',
      },
    });

    // 5 Sample Members
    const membersData = [
      {
        name: 'Aman Gupta',
        dtuEmail: 'aman21coe@dtu.ac.in',
        personalEmail: 'aman.gupta@gmail.com',
        password: 'Password@123',
        role: 'member',
        branch: 'Computer Engineering',
        batch: '2025',
        bio: 'Backend enthusiast and CP grinder. Aiming for 2000+ rating on Codeforces.',
        skills: ['C++', 'Go', 'Express', 'Redis', 'PostgreSQL'],
        rating: 38.5,
        potwsCompleted: 8,
        codingProfiles: {
          leetcode: 'https://leetcode.com/u/amangupta_dtu',
          codeforces: 'https://codeforces.com/profile/amancode',
          github: 'https://github.com/amangupta21',
          linkedin: 'https://linkedin.com/in/aman-gupta-dtu',
        },
        projects: [
          {
            name: 'Distributed KV Store',
            description: 'Raft consensus based in-memory key-value store in Go.',
            techStack: ['Go', 'gRPC', 'Raft'],
            githubLink: 'https://github.com/amangupta21/raft-kv',
          },
        ],
      },
      {
        name: 'Rohan Sharma',
        dtuEmail: 'rohan22it@dtu.ac.in',
        personalEmail: 'rohan.sharma@gmail.com',
        password: 'Password@123',
        role: 'member',
        branch: 'Information Technology',
        batch: '2026',
        bio: 'Competitive programmer and frontend aficionado. Loving Next.js and Tailwind.',
        skills: ['JavaScript', 'TypeScript', 'Next.js', 'React', 'DSA', 'Tailwind'],
        rating: 46.0,
        potwsCompleted: 10,
        codingProfiles: {
          leetcode: 'https://leetcode.com/u/rohan_s_dtu',
          codeforces: 'https://codeforces.com/profile/rohans_cf',
          github: 'https://github.com/rohansharma-dtu',
        },
      },
      {
        name: 'Priya Malik',
        dtuEmail: 'priya23se@dtu.ac.in',
        personalEmail: 'priya.malik@gmail.com',
        password: 'Password@123',
        role: 'member',
        branch: 'Software Engineering',
        batch: '2026',
        bio: 'AI/ML enthusiast & LeetCode daily streak keeper.',
        skills: ['Python', 'PyTorch', 'C++', 'FastAPI', 'DSA'],
        rating: 52.5,
        potwsCompleted: 11,
        codingProfiles: {
          leetcode: 'https://leetcode.com/u/priya_ml',
          github: 'https://github.com/priyamalik-dtu',
          linkedin: 'https://linkedin.com/in/priya-malik',
        },
        projects: [
          {
            name: 'Neural Vision OCR',
            description: 'Deep Learning pipeline for handwriting digit and symbol recognition.',
            techStack: ['Python', 'PyTorch', 'OpenCV'],
            githubLink: 'https://github.com/priyamalik-dtu/vision-ocr',
          },
        ],
      },
      {
        name: 'Devansh Taneja',
        dtuEmail: 'devansh23ece@dtu.ac.in',
        personalEmail: 'devansh.taneja@gmail.com',
        password: 'Password@123',
        role: 'member',
        branch: 'Electronics & Communication',
        batch: '2027',
        bio: 'First year enthusiast transitioning into CS & core algorithms.',
        skills: ['C++', 'Python', 'Data Structures', 'Git'],
        rating: 18.0,
        potwsCompleted: 4,
        codingProfiles: {
          leetcode: 'https://leetcode.com/u/devansh_taneja',
          codechef: 'https://www.codechef.com/users/devansh_dtu',
          github: 'https://github.com/devansh-taneja',
        },
      },
      {
        name: 'Simran Kaur',
        dtuEmail: 'simran22ee@dtu.ac.in',
        personalEmail: 'simran.kaur@gmail.com',
        password: 'Password@123',
        role: 'member',
        branch: 'Electrical Engineering',
        batch: '2026',
        bio: 'Round Table DTU member. Passionate about web development and graph problems.',
        skills: ['JavaScript', 'React', 'Node.js', 'C++', 'Algorithms'],
        rating: 29.0,
        potwsCompleted: 6,
        codingProfiles: {
          leetcode: 'https://leetcode.com/u/simran_k',
          github: 'https://github.com/simran-kaur-dtu',
        },
      },
    ];

    const createdMembers = await User.create(membersData);

    console.log('Seeding Sample Registration Requests...');
    await RegistrationRequest.create([
      {
        name: 'Tanmay Saxena',
        dtuEmail: 'tanmay24me@dtu.ac.in',
        personalEmail: 'tanmay.saxena@gmail.com',
        branch: 'Mechanical Engineering',
        batch: '2028',
        status: 'pending',
      },
      {
        name: 'Kavya Jain',
        dtuEmail: 'kavya24coe@dtu.ac.in',
        personalEmail: 'kavya.jain@gmail.com',
        branch: 'Computer Engineering',
        batch: '2028',
        status: 'pending',
      },
      {
        name: 'Harsh Vardhan',
        dtuEmail: 'harsh23ene@dtu.ac.in',
        personalEmail: 'harsh.v@gmail.com',
        branch: 'Environmental Engineering',
        batch: '2027',
        status: 'rejected',
        rejectionReason: 'Invalid student ID verification details.',
        reviewedBy: admin1._id,
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('Seeding 2 POTWs (POTW #11 closed, POTW #12 active)...');
    const now = new Date();
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const thisWeekEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days remaining

    // Closed POTW #11
    const potw11 = await POTW.create({
      weekNumber: 11,
      title: 'Graph Traversals & Sliding Windows',
      description: 'Master topological sorting, minimum window substrings, and cycle detection.',
      publishAt: lastWeekStart,
      deadline: lastWeekEnd,
      status: 'closed',
      penaltyProcessed: true,
      createdBy: admin2._id,
      problems: [
        {
          title: 'Maximum Average Subarray I',
          statement: 'Given an array nums consisting of n integers, find a contiguous subarray whose length is equal to k that has the maximum average value and return this value.',
          difficulty: 'easy',
          constraints: '1 <= k <= n <= 10^5, -10^4 <= nums[i] <= 10^4',
          expectedTimeComplexity: 'O(n)',
          expectedSpaceComplexity: 'O(1)',
          maxScore: 1,
        },
        {
          title: 'Course Schedule II',
          statement: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. Return the ordering of courses you should take to finish all courses using topological sort.',
          difficulty: 'medium',
          constraints: '1 <= numCourses <= 2000, 0 <= prerequisites.length <= numCourses * (numCourses - 1)',
          expectedTimeComplexity: 'O(V + E)',
          expectedSpaceComplexity: 'O(V + E)',
          maxScore: 2,
        },
        {
          title: 'Alien Dictionary',
          statement: 'Given a sorted dictionary of an alien language having N words and k starting alphabets of standard dictionary, find the order of characters in the alien language.',
          difficulty: 'hard',
          constraints: '1 <= N <= 10^4, 1 <= k <= 26',
          expectedTimeComplexity: 'O(N * |S| + K)',
          expectedSpaceComplexity: 'O(K)',
          maxScore: 3,
        },
      ],
    });

    // Active POTW #12
    const potw12 = await POTW.create({
      weekNumber: 12,
      title: 'Dynamic Programming & Segment Trees',
      description: 'Weekly challenge featuring interval DP, range sum queries, and classic memoization.',
      publishAt: thisWeekStart,
      deadline: thisWeekEnd,
      status: 'active',
      penaltyProcessed: false,
      createdBy: admin1._id,
      problems: [
        {
          title: 'Climbing Stairs with Variable Jumps',
          statement: 'You are on stair 0 and want to reach the nth stair. Each step i gives you the maximum number of stairs you can jump forward. Return the minimum jumps to reach stair n.',
          difficulty: 'easy',
          constraints: '1 <= n <= 1000, 0 <= jumps[i] <= 50',
          expectedTimeComplexity: 'O(n)',
          expectedSpaceComplexity: 'O(n)',
          maxScore: 1,
        },
        {
          title: 'Longest Increasing Subsequence',
          statement: 'Given an integer array nums, return the length of the longest strictly increasing subsequence using patient sorting / binary search in O(n log n).',
          difficulty: 'medium',
          constraints: '1 <= nums.length <= 2500, -10^4 <= nums[i] <= 10^4',
          expectedTimeComplexity: 'O(n log n)',
          expectedSpaceComplexity: 'O(n)',
          maxScore: 2,
        },
        {
          title: 'Range Minimum Query with Updates',
          statement: 'Design a data structure supporting range minimum queries and point updates in O(log n) time using a Segment Tree or Fenwick Tree.',
          difficulty: 'hard',
          constraints: '1 <= n, q <= 10^5, -10^9 <= a[i] <= 10^9',
          expectedTimeComplexity: 'O(q log n)',
          expectedSpaceComplexity: 'O(n)',
          maxScore: 3,
        },
      ],
    });

    console.log('Seeding Submissions for POTW #11 & POTW #12...');
    // Member Priya submitted POTW #11 - fully reviewed: 5.5/6
    const priyaSub11 = await Submission.create({
      userId: createdMembers[2]._id,
      potwId: potw11._id,
      status: 'reviewed',
      totalScore: 5.5,
      submittedAt: new Date(lastWeekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(lastWeekEnd.getTime() - 12 * 60 * 60 * 1000),
      reviewedBy: admin2._id,
      problems: [
        {
          problemId: potw11.problems[0]._id,
          language: 'C++',
          code: `#include <vector>\n#include <numeric>\nusing namespace std;\n\ndouble findMaxAverage(vector<int>& nums, int k) {\n    double sum = 0;\n    for(int i = 0; i < k; ++i) sum += nums[i];\n    double maxSum = sum;\n    for(size_t i = k; i < nums.size(); ++i) {\n        sum += nums[i] - nums[i - k];\n        maxSum = max(maxSum, sum);\n    }\n    return maxSum / k;\n}`,
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          platform: 'LeetCode',
          submissionLink: 'https://leetcode.com/submissions/detail/1100001/',
          driveLink: 'https://drive.google.com/file/d/sample-proof-1/view',
          score: 1,
          maxScore: 1,
          status: 'approved',
          feedback: 'Optimal sliding window implementation.',
        },
        {
          problemId: potw11.problems[1]._id,
          language: 'C++',
          code: `#include <vector>\n#include <queue>\nusing namespace std;\n\nvector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {\n    vector<vector<int>> adj(numCourses);\n    vector<int> indegree(numCourses, 0);\n    for(auto& p : prerequisites) {\n        adj[p[1]].push_back(p[0]);\n        indegree[p[0]]++;\n    }\n    queue<int> q;\n    for(int i = 0; i < numCourses; ++i) if(indegree[i] == 0) q.push(i);\n    vector<int> order;\n    while(!q.empty()) {\n        int u = q.front(); q.pop();\n        order.push_back(u);\n        for(int v : adj[u]) if(--indegree[v] == 0) q.push(v);\n    }\n    return order.size() == (size_t)numCourses ? order : vector<int>();\n}`,
          timeComplexity: 'O(V + E)',
          spaceComplexity: 'O(V + E)',
          platform: 'LeetCode',
          submissionLink: 'https://leetcode.com/submissions/detail/1100002/',
          driveLink: 'https://drive.google.com/file/d/sample-proof-2/view',
          score: 2,
          maxScore: 2,
          status: 'approved',
          feedback: "Flawless Kahn's algorithm implementation.",
        },
        {
          problemId: potw11.problems[2]._id,
          language: 'Python',
          code: `from collections import defaultdict, deque\n\ndef alienOrder(words):\n    adj = {c: set() for w in words for c in w}\n    in_deg = {c: 0 for c in adj}\n    for w1, w2 in zip(words, words[1:]):\n        for c1, c2 in zip(w1, w2):\n            if c1 != c2:\n                if c2 not in adj[c1]:\n                    adj[c1].add(c2)\n                    in_deg[c2] += 1\n                break\n        else:\n            if len(w1) > len(w2): return ""\n    q = deque([c for c in in_deg if in_deg[c] == 0])\n    res = []\n    while q:\n        c = q.popleft()\n        res.append(c)\n        for nxt in adj[c]:\n            in_deg[nxt] -= 1\n            if in_deg[nxt] == 0: q.append(nxt)\n    return "".join(res) if len(res) == len(in_deg) else ""`,
          timeComplexity: 'O(C)',
          spaceComplexity: 'O(1)',
          platform: 'LeetCode',
          submissionLink: 'https://leetcode.com/submissions/detail/1100003/',
          driveLink: 'https://drive.google.com/file/d/sample-proof-3/view',
          score: 2.5,
          maxScore: 3,
          status: 'approved',
          feedback: 'Minor edge case handled neatly, partial 2.5 awarded.',
        },
      ],
    });

    // Rating History for Priya
    await RatingHistory.create({
      userId: createdMembers[2]._id,
      potwId: potw11._id,
      previousRating: 47.0,
      potwScore: 5.5,
      penalty: 0,
      ratingChange: 5.5,
      newRating: 52.5,
      reason: 'Evaluation for POTW #11',
      createdBy: admin2._id,
    });

    // Member Rohan submitted POTW #12 - Pending Admin Review
    await Submission.create({
      userId: createdMembers[1]._id,
      potwId: potw12._id,
      status: 'submitted',
      totalScore: 0,
      submittedAt: new Date(thisWeekStart.getTime() + 10 * 60 * 60 * 1000),
      problems: [
        {
          problemId: potw12.problems[0]._id,
          language: 'Python',
          code: `def minJumps(jumps):\n    n = len(jumps)\n    dp = [float('inf')] * n\n    dp[0] = 0\n    for i in range(n):\n        for j in range(1, jumps[i] + 1):\n            if i + j < n:\n                dp[i + j] = min(dp[i + j], dp[i] + 1)\n    return dp[-1]`,
          timeComplexity: 'O(n * k)',
          spaceComplexity: 'O(n)',
          platform: 'LeetCode',
          submissionLink: 'https://leetcode.com/submissions/detail/1200001/',
          driveLink: 'https://drive.google.com/file/d/rohan-proof-q1/view',
          score: 0,
          maxScore: 1,
          status: 'pending',
        },
        {
          problemId: potw12.problems[1]._id,
          language: 'C++',
          code: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint lengthOfLIS(vector<int>& nums) {\n    vector<int> tails;\n    for(int x : nums) {\n        auto it = lower_bound(tails.begin(), tails.end(), x);\n        if(it == tails.end()) tails.push_back(x);\n        else *it = x;\n    }\n    return tails.size();\n}`,
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)',
          platform: 'LeetCode',
          submissionLink: 'https://leetcode.com/submissions/detail/1200002/',
          driveLink: 'https://drive.google.com/file/d/rohan-proof-q2/view',
          score: 0,
          maxScore: 2,
          status: 'pending',
        },
        {
          problemId: potw12.problems[2]._id,
          language: 'C++',
          code: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass SegmentTree {\n    int n;\n    vector<int> tree;\npublic:\n    SegmentTree(int size) : n(size), tree(4 * size, 1e9) {}\n    void update(int node, int l, int r, int idx, int val) {\n        if(l == r) { tree[node] = val; return; }\n        int mid = (l + r) / 2;\n        if(idx <= mid) update(2 * node, l, mid, idx, val);\n        else update(2 * node + 1, mid + 1, r, idx, val);\n        tree[node] = min(tree[2 * node], tree[2 * node + 1]);\n    }\n    int query(int node, int l, int r, int ql, int qr) {\n        if(ql <= l && r <= qr) return tree[node];\n        if(r < ql || l > qr) return 1e9;\n        int mid = (l + r) / 2;\n        return min(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));\n    }\n};`,
          timeComplexity: 'O(q log n)',
          spaceComplexity: 'O(n)',
          platform: 'Codeforces',
          submissionLink: 'https://codeforces.com/contest/339/submission/1200003',
          driveLink: 'https://drive.google.com/file/d/rohan-proof-q3/view',
          score: 0,
          maxScore: 3,
          status: 'pending',
        },
      ],
    });

    console.log('Seeding Sample Notifications...');
    await Notification.create([
      {
        userId: createdMembers[2]._id,
        type: 'review',
        title: 'POTW #11 Reviewed',
        message: 'You earned 5.5/6 points this week. Your rating changed from 47.0 → 52.5.',
        link: `/potw/${potw11._id}`,
        isRead: true,
      },
      {
        userId: createdMembers[1]._id,
        type: 'potw',
        title: 'POTW #12 is Now Live!',
        message: 'Dynamic Programming & Segment Trees is now open. Solve all 3 questions before deadline.',
        link: `/potw/${potw12._id}`,
        isRead: false,
      },
      {
        userId: createdMembers[0]._id,
        type: 'potw',
        title: 'POTW #12 is Now Live!',
        message: 'Dynamic Programming & Segment Trees is now open. Solve all 3 questions before deadline.',
        link: `/potw/${potw12._id}`,
        isRead: false,
      },
    ]);

    console.log('Seeding Audit Log...');
    await AuditLog.create([
      {
        actorId: superAdmin._id,
        actorName: superAdmin.name,
        actorRole: superAdmin.role,
        action: 'CREATE_ADMIN',
        targetType: 'User',
        targetId: admin1._id.toString(),
        details: { adminName: admin1.name, adminEmail: admin1.personalEmail },
      },
      {
        actorId: admin1._id,
        actorName: admin1.name,
        actorRole: admin1.role,
        action: 'CREATE_POTW',
        targetType: 'POTW',
        targetId: potw12._id.toString(),
        details: { weekNumber: 12, title: potw12.title, status: 'active' },
      },
    ]);

    console.log('\n=============================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('Super Admin:');
    console.log('  Email:    superadmin@roundtabledtu.in');
    console.log('  Password: Password@123\n');
    console.log('Admin 1:');
    console.log('  Email:    admin.utkarsh@roundtabledtu.in');
    console.log('  Password: Password@123\n');
    console.log('Admin 2:');
    console.log('  Email:    ananya.admin@roundtabledtu.in');
    console.log('  Password: Password@123\n');
    console.log('Sample Member 1 (Priya Malik, Rank #1):');
    console.log('  Email:    priya.malik@gmail.com');
    console.log('  Password: Password@123\n');
    console.log('Sample Member 2 (Rohan Sharma, Submitted POTW #12):');
    console.log('  Email:    rohan.sharma@gmail.com');
    console.log('  Password: Password@123\n');
    console.log('=============================================================\n');

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
