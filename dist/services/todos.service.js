"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosService = void 0;
const todos_models_1 = require("../models/todos.models");
const redis_1 = __importDefault(require("../utils/redis"));
// Ensure Redis connection on service initialization
redis_1.default.connect().catch(console.error);
class TodosService {
    CACHE_TTL = 3600; // Cache TTL in seconds (1 hour)
    async createTodo(title, description, userId) {
        const todo = new todos_models_1.Todo({ title, description, user: userId });
        const savedTodo = await todo.save();
        // Invalidate user todos cache
        if (redis_1.default.isReady()) {
            await redis_1.default.getClient().del(`todos:user:${userId}`);
        }
        return savedTodo;
    }
    async getTodos(userId) {
        // Check cache first
        const cacheKey = `todos:user:${userId}`;
        let cachedTodos = null;
        if (redis_1.default.isReady()) {
            cachedTodos = await redis_1.default.getClient().get(cacheKey);
        }
        if (cachedTodos) {
            return JSON.parse(cachedTodos);
        }
        // If not in cache or Redis is down, query database
        const todos = await todos_models_1.Todo.find({ user: userId });
        // Store in cache if Redis is available
        if (redis_1.default.isReady()) {
            await redis_1.default.getClient().set(cacheKey, JSON.stringify(todos), 'EX', this.CACHE_TTL);
        }
        return todos;
    }
    async getTodoById(id) {
        // Check cache first
        const cacheKey = `todo:${id}`;
        let cachedTodo = null;
        if (redis_1.default.isReady()) {
            cachedTodo = await redis_1.default.getClient().get(cacheKey);
        }
        if (cachedTodo) {
            return JSON.parse(cachedTodo);
        }
        // If not in cache or Redis is down, query database
        const todo = await todos_models_1.Todo.findById(id);
        if (todo && redis_1.default.isReady()) {
            // Store in cache
            await redis_1.default.getClient().set(cacheKey, JSON.stringify(todo), 'EX', this.CACHE_TTL);
        }
        return todo;
    }
    async updateTodo(id, title, description) {
        const updatedTodo = await todos_models_1.Todo.findByIdAndUpdate(id, { title, description, updatedAt: new Date() }, { new: true });
        // Invalidate caches
        if (updatedTodo && redis_1.default.isReady()) {
            await Promise.all([
                redis_1.default.getClient().del(`todo:${id}`),
                redis_1.default.getClient().del(`todos:user:${updatedTodo.user}`),
            ]);
        }
        return updatedTodo;
    }
    async deleteTodo(id) {
        const todo = await todos_models_1.Todo.findById(id);
        if (!todo)
            return null;
        const deletedTodo = await todos_models_1.Todo.findByIdAndDelete(id);
        // Invalidate caches
        if (redis_1.default.isReady()) {
            await Promise.all([
                redis_1.default.getClient().del(`todo:${id}`),
                redis_1.default.getClient().del(`todos:user:${todo.user}`),
            ]);
        }
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
        if (redis_1.default.isReady()) {
            await Promise.all([
                redis_1.default.getClient().del(`todo:${id}`),
                redis_1.default.getClient().del(`todos:user:${todo.user}`),
            ]);
        }
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
        if (redis_1.default.isReady()) {
            await Promise.all([
                redis_1.default.getClient().del(`todo:${id}`),
                redis_1.default.getClient().del(`todos:user:${todo.user}`),
            ]);
        }
        return updatedTodo;
    }
}
exports.TodosService = TodosService;
//# sourceMappingURL=todos.service.js.map