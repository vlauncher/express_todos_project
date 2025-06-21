import { Todo, ITodo } from '../models/todos.models';

export class TodosService {
  public async createTodo(title: string, description: string, userId: string) {
    const todo = new Todo({ title, description, user: userId });
    return todo.save();
  }

  public async getTodos(userId: string) {
    return Todo.find({ user: userId });
  }

  public async getTodoById(id: string) {
    return Todo.findById(id);
  }

  public async updateTodo(id: string, title: string, description: string) {
    return Todo.findByIdAndUpdate(
      id,
      { title, description, updatedAt: new Date() },
      { new: true }
    );
  }

  public async deleteTodo(id: string) {
    return Todo.findByIdAndDelete(id);
  }

  public async toggleTodoCompletion(id: string) {
    const todo = await Todo.findById(id);
    if (!todo) return null;
    todo.completed = !todo.completed;
    todo.updatedAt = new Date();
    return todo.save();
  }

  public async toggleTodoArchive(id: string) {
    const todo = await Todo.findById(id);
    if (!todo) return null;
    todo.archived = !todo.archived;
    todo.updatedAt = new Date();
    return todo.save();
  }
}