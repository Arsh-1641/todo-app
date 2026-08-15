import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Todo from './models/Todo.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedTodos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Read todos from the frontend data file
    const todosPath = path.join(__dirname, '..', 'src', 'data', 'todos.json');
    const todosData = JSON.parse(fs.readFileSync(todosPath, 'utf-8'));

    // Clear existing todos
    await Todo.deleteMany();
    console.log('Cleared existing todos');

    // Insert seed data
    const todos = await Todo.insertMany(todosData);
    console.log(`Seeded ${todos.length} todos`);

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedTodos();