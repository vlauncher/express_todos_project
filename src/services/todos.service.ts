import { Todo, ITodo } from '../models/todos.models';
import redisClient from '../utils/redis';

// Ensure Redis connection on service initialization
redisClient.connect().catch(console.error);

export class TodosService {
  private readonly CACHE_TTL = 3600; // Cache TTL in seconds (1 hour)

  public async createTodo(title: string, description: string, userId: string) {
    const todo = new Todo({ title, description, user: userId });
    const savedTodo = await todo.save();

    // Invalidate user todos cache
    if (redisClient.isReady()) {
      await redisClient.getClient().del(`todos:user:${userId}`);
    }

    return savedTodo;
  }

  public async getTodos(userId: string) {
    // Check cache first
    const cacheKey = `todos:user:${userId}`;
    let cachedTodos = null;

    if (redisClient.isReady()) {
      cachedTodos = await redisClient.getClient().get(cacheKey);
    }

    if (cachedTodos) {
      return JSON.parse(cachedTodos);
    }

    // If not in cache or Redis is down, query database
    const todos = await Todo.find({ user: userId });

    // Store in cache if Redis is available
    if (redisClient.isReady()) {
      await redisClient.getClient().set(cacheKey, JSON.stringify(todos), 'EX', this.CACHE_TTL);
    }

    return todos;
  }

  public async getTodoById(id: string) {
    // Check cache first
    const cacheKey = `todo:${id}`;
    let cachedTodo = null;

    if (redisClient.isReady()) {
      cachedTodo = await redisClient.getClient().get(cacheKey);
    }

    if (cachedTodo) {
      return JSON.parse(cachedTodo);
    }

    // If not in cache or Redis is down, query database
    const todo = await Todo.findById(id);

    if (todo && redisClient.isReady()) {
      // Store in cache
      await redisClient.getClient().set(cacheKey, JSON.stringify(todo), 'EX', this.CACHE_TTL);
    }

    return todo;
  }

  public async updateTodo(id: string, title: string, description: string) {
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description, updatedAt: new Date() },
      { new: true }
    );

    // Invalidate caches
    if (updatedTodo && redisClient.isReady()) {
      await Promise.all([
        redisClient.getClient().del(`todo:${id}`),
        redisClient.getClient().del(`todos:user:${updatedTodo.user}`),
      ]);
    }

    return updatedTodo;
  }

  public async deleteTodo(id: string) {
    const todo = await Todo.findById(id);
    if (!todo) return null;

    const deletedTodo = await Todo.findByIdAndDelete(id);

    // Invalidate caches
    if (redisClient.isReady()) {
      await Promise.all([
        redisClient.getClient().del(`todo:${id}`),
        redisClient.getClient().del(`todos:user:${todo.user}`),
      ]);
    }

    return deletedTodo;
  }

  public async toggleTodoCompletion(id: string) {
    const todo = await Todo.findById(id);
    if (!todo) return null;

    todo.completed = !todo.completed;
    todo.updatedAt = new Date();
    const updatedTodo = await todo.save();

    // Invalidate caches
    if (redisClient.isReady()) {
      await Promise.all([
        redisClient.getClient().del(`todo:${id}`),
        redisClient.getClient().del(`todos:user:${todo.user}`),
      ]);
    }

    return updatedTodo;
  }

  public async toggleTodoArchive(id: string) {
    const todo = await Todo.findById(id);
    if (!todo) return null;

    todo.archived = !todo.archived;
    todo.updatedAt = new Date();
    const updatedTodo = await todo.save();

    // Invalidate caches
    if (redisClient.isReady()) {
      await Promise.all([
        redisClient.getClient().del(`todo:${id}`),
        redisClient.getClient().del(`todos:user:${todo.user}`),
      ]);
    }

    return updatedTodo;
  }
}