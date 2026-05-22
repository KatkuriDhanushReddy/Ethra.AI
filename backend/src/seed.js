import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { Task } from './models/Task.js';
import { Comment } from './models/Comment.js';
import { Notification } from './models/Notification.js';
import { connectDB } from './config/db.js';

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'Admin123!',
    role: 'admin',
  });

  const member = await User.create({
    name: 'Demo Member',
    email: 'member@demo.com',
    password: 'Member123!',
    role: 'member',
  });

  const member2 = await User.create({
    name: 'Alex Johnson',
    email: 'alex@demo.com',
    password: 'Member123!',
    role: 'member',
  });

  const project = await Project.create({
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern UI',
    members: [admin._id, member._id, member2._id],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active',
    createdBy: admin._id,
  });

  const project2 = await Project.create({
    name: 'Mobile App Launch',
    description: 'iOS and Android app development and release',
    members: [admin._id, member._id],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    status: 'planning',
    createdBy: admin._id,
  });

  const tasks = await Task.insertMany([
    {
      title: 'Design homepage mockup',
      description: 'Create Figma designs for new homepage',
      assignedTo: member._id,
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      project: project._id,
      createdBy: admin._id,
      activity: [{ user: admin._id, action: 'created', details: 'Task created' }],
    },
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for deployments',
      assignedTo: member2._id,
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      project: project._id,
      createdBy: admin._id,
      activity: [{ user: admin._id, action: 'created', details: 'Task created' }],
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints',
      assignedTo: member._id,
      priority: 'low',
      status: 'completed',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      project: project._id,
      createdBy: admin._id,
      activity: [
        { user: admin._id, action: 'created', details: 'Task created' },
        { user: member._id, action: 'status_changed', details: 'Completed' },
      ],
    },
    {
      title: 'User authentication flow',
      description: 'Implement login/signup screens',
      assignedTo: member._id,
      priority: 'high',
      status: 'todo',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      project: project2._id,
      createdBy: admin._id,
      activity: [{ user: admin._id, action: 'created', details: 'Task created' }],
    },
  ]);

  await Comment.create({
    content: 'Started working on the hero section design.',
    user: member._id,
    task: tasks[0]._id,
  });

  await Notification.insertMany([
    {
      user: member._id,
      type: 'task_assigned',
      message: 'You were assigned: "Design homepage mockup"',
      relatedId: tasks[0]._id,
      relatedModel: 'Task',
    },
    {
      user: member._id,
      type: 'project_invite',
      message: 'You were added to project "Website Redesign"',
      relatedId: project._id,
      relatedModel: 'Project',
    },
  ]);

  console.log('Seed completed!');
  console.log('Demo accounts:');
  console.log('  Admin:  admin@demo.com / Admin123!');
  console.log('  Member: member@demo.com / Member123!');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
