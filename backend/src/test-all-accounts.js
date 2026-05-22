/**
 * Real-world RBAC & API audit for all demo accounts
 * Run: node src/test-all-accounts.js (from backend folder, server must be running)
 */
import 'dotenv/config';

const API = process.env.API_URL || 'http://localhost:5000/api';

const ACCOUNTS = [
  { name: 'Admin', email: 'admin@demo.com', password: 'Admin123!', role: 'admin' },
  { name: 'Member', email: 'member@demo.com', password: 'Member123!', role: 'member' },
  { name: 'Alex', email: 'alex@demo.com', password: 'Member123!', role: 'member' },
];

async function request(method, path, token, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

async function login(account) {
  const r = await request('POST', '/auth/login', null, { email: account.email, password: account.password });
  if (!r.ok) return { error: r.data.message || `HTTP ${r.status}` };
  return { token: r.data.token, user: r.data.user };
}

async function runTests() {
  console.log('\n=== TEAM TASK MANAGER — FULL ACCOUNT AUDIT ===\n');
  console.log(`API: ${API}\n`);

  const healthRes = await fetch('http://localhost:5000/api/health');
  if (!healthRes.ok) {
    console.error('❌ Backend not running. Start start-backend.bat first.');
    process.exit(1);
  }
  log('✅', 'Backend health OK');

  const sessions = {};

  for (const acc of ACCOUNTS) {
    console.log(`\n--- ${acc.name} (${acc.email}) ---`);
    const session = await login(acc);
    if (session.error) {
      log('❌', `LOGIN FAILED: ${session.error}`);
      sessions[acc.email] = null;
      continue;
    }
    if (session.user.role !== acc.role) {
      log('⚠️', `Role mismatch: expected ${acc.role}, got ${session.user.role}`);
    } else {
      log('✅', `Login OK — role: ${session.user.role}`);
    }
    sessions[acc.email] = session;
  }

  const admin = sessions['admin@demo.com'];
  const member = sessions['member@demo.com'];
  const alex = sessions['alex@demo.com'];

  if (!admin) {
    console.log('\n❌ Cannot continue without admin. Run: npm run seed (or restart backend for auto-seed)');
    process.exit(1);
  }

  // Dashboard
  console.log('\n=== DASHBOARD ===');
  for (const [label, s] of [['Admin', admin], ['Member', member], ['Alex', alex]]) {
    if (!s) continue;
    const d = await request('GET', '/dashboard', s.token);
    log(d.ok ? '✅' : '❌', `${label} dashboard: ${d.ok ? `tasks=${d.data.data?.stats?.total}` : d.data.message}`);
  }

  // Projects list
  console.log('\n=== PROJECTS (list) ===');
  const adminProjects = await request('GET', '/projects', admin.token);
  const projectCount = adminProjects.data?.data?.length ?? 0;
  log(adminProjects.ok ? '✅' : '❌', `Admin sees ${projectCount} project(s)`);

  if (member) {
    const mp = await request('GET', '/projects', member.token);
    log(mp.ok ? '✅' : '❌', `Member sees ${mp.data?.data?.length ?? 0} project(s) (should be assigned only)`);
  }

  // Admin-only: create project
  console.log('\n=== RBAC: CREATE PROJECT (admin only) ===');
  const createAsAdmin = await request('POST', '/projects', admin.token, {
    name: 'Audit Test Project',
    description: 'Auto test',
    status: 'active',
  });
  log(createAsAdmin.ok ? '✅' : '❌', `Admin create project: ${createAsAdmin.ok ? 'allowed' : createAsAdmin.data.message}`);

  if (member) {
    const createAsMember = await request('POST', '/projects', member.token, { name: 'Hack Project' });
    log(!createAsMember.ok ? '✅' : '❌', `Member create project blocked: ${createAsMember.data.message || 'SHOULD FAIL'}`);
  }

  const projectId = createAsAdmin.data?.data?._id || adminProjects.data?.data?.[0]?._id;

  // Tasks
  console.log('\n=== TASKS ===');
  const adminTasks = await request('GET', '/tasks', admin.token);
  log(adminTasks.ok ? '✅' : '❌', `Admin tasks list: ${adminTasks.data?.data?.length ?? 0} tasks`);

  if (member && adminTasks.data?.data?.[0]) {
    const taskId = adminTasks.data.data[0]._id;
    const patchMember = await request('PATCH', `/tasks/${taskId}`, member.token, { status: 'in_progress' });
    const isAssignee = adminTasks.data.data[0].assignedTo?.email === member.user.email;
    if (isAssignee) {
      log(patchMember.ok ? '✅' : '❌', `Member updates own assigned task status: ${patchMember.ok ? 'OK' : patchMember.data.message}`);
    } else {
      log('ℹ️', `Member patch non-assigned task: ${patchMember.ok ? 'unexpected allow' : patchMember.data.message}`);
    }
  }

  if (member) {
    const createTaskMember = await request('POST', '/tasks', member.token, {
      title: 'Member task',
      project: projectId,
    });
    log(!createTaskMember.ok ? '✅' : '❌', `Member create task blocked: ${createTaskMember.data.message || 'SHOULD FAIL'}`);
  }

  // Notifications
  console.log('\n=== NOTIFICATIONS ===');
  if (member) {
    const n = await request('GET', '/notifications', member.token);
    log(n.ok ? '✅' : '❌', `Member notifications: ${n.data?.data?.length ?? 0}`);
  }

  // Users list (admin panel data)
  console.log('\n=== USERS API ===');
  const usersAdmin = await request('GET', '/users', admin.token);
  log(usersAdmin.ok ? '✅' : '❌', `Admin list users: ${usersAdmin.data?.data?.length ?? 0} users`);

  if (member) {
    const usersMember = await request('GET', '/users', member.token);
    log(usersMember.ok ? '✅' : '❌', `Member list users (for assign dropdown): ${usersMember.data?.data?.length ?? 0}`);
  }

  // Invalid login
  console.log('\n=== SECURITY ===');
  const badLogin = await request('POST', '/auth/login', null, { email: 'admin@demo.com', password: 'wrong' });
  log(!badLogin.ok ? '✅' : '❌', `Wrong password rejected: ${badLogin.data.message}`);

  const noToken = await request('GET', '/dashboard', null);
  log(noToken.status === 401 ? '✅' : '❌', `Unauthenticated blocked: HTTP ${noToken.status}`);

  // Cleanup test project
  if (createAsAdmin.ok && createAsAdmin.data?.data?._id) {
    await request('DELETE', `/projects/${createAsAdmin.data.data._id}`, admin.token);
    log('ℹ️', 'Cleaned up audit test project');
  }

  console.log('\n=== AUDIT COMPLETE ===\n');
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
