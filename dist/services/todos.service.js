"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosService = void 0;
const todos_models_1 = require("../models/todos.models");
const redis_1 = require("redis");
// Initialize Redis client
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
// Connect to Redis
redisClient.connect().catch(console.error);
class TodosService {
    CACHE_TTL = 3600; // Cache TTL in seconds (1 hour)
    async createTodo(title, description, userId) {
        const todo = new todos_models_1.Todo({ title, description, user: userId });
        const savedTodo = await todo.save();
        // Invalidate user todos cache
        await redisClient.del(`todos:user:${userId}`);
        return savedTodo;
    }
    async getTodos(userId) {
        // Check cache first
        const cacheKey = `todos:user:${userId}`;
        const cachedTodos = await redisClient.get(cacheKey);
        if (cachedTodos) {
            return JSON.parse(cachedTodos);
        }
        // If not in cache, query database
        const todos = await todos_models_1.Todo.find({ user: userId });
        // Store in cache
        await redisClient.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(todos));
        return todos;
    }
    async getTodoById(id) {
        // Check cache first
        const cacheKey = `todo:${id}`;
        const cachedTodo = await redisClient.get(cacheKey);
        if (cachedTodo) {
            return JSON.parse(cachedTodo);
        }
        // If not in cache, query database
        const todo = await todos_models_1.Todo.findById(id);
        if (todo) {
            // Store in cache
            await redisClient.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(todo));
        }
        return todo;
    }
    async updateTodo(id, title, description) {
        const updatedTodo = await todos_models_1.Todo.findByIdAndUpdate(id, { title, description, updatedAt: new Date() }, { new: true });
        // Invalidate caches
        if (updatedTodo) {
            await redisClient.del(`todo:${id}`);
            await redisClient.del(`todos:user:${updatedTodo.user}`);
        }
        return updatedTodo;
    }
    async deleteTodo(id) {
        const todo = await todos_models_1.Todo.findById(id);
        if (!todo)
            return null;
        const deletedTodo = await todos_models_1.Todo.findByIdAndDelete(id);
        // Invalidate caches
        await redisClient.del(`todo:${id}`);
        await redisClient.del(`todos:user:${todo.user}`);
        return deletedTodo;
    }
    async toggleTodoCompletion(id) {
        const todo = await todos_models_1.Todo.findById(id);
        if (!todo)
            return null;
        todo.completed = !todo.completed;
        todo.updatedAt = new Date();
        const updatedTodo = await todo.save();
        // Invalidate caches
        await redisClient.del(`todo:${id}`);
        await redisClient.del(`todos:user:${todo.user}`);
        return updatedTodo;
    }
    async toggleTodoArchive(id) {
        const todo = await todos_models_1.Todo.findById(id);
        if (!todo)
            return null;
        todo.archived = !todo.archived;
        todo.updatedAt = new Date();
        const updatedTodo = await todo.save();
        // Invalidate caches
        await redisClient.del(`todo:${id}`);
        await redisClient.del(`todos:user:${todo.user}`);
        return updatedTodo;
    }
}
exports.TodosService = TodosService;
// Handle Redis connection errors
redisClient.on('error', (err) => console.error('Redis Client Error', err));
// Ensure Redis connection is closed when application terminates
process.on('SIGTERM', async () => {
    await redisClient.quit();
});
//# sourceMappingURL=todos.service.js.map