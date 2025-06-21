import { NextFunction, Response } from 'express';
import { TodosService } from '../services/todos.service';
import { AuthRequest } from '../middlewares/auth';

export class TodosController {
  private todosService = new TodosService();

  public createTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description } = req.body;
      const userId = req.user!.id;
      const todo = await this.todosService.createTodo(title, description, userId);
      res.status(201).json({ message: 'Todo created successfully', todo });
    } catch (error) {
      next(error);
    }
  }

  public getTodos = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const todos = await this.todosService.getTodos(userId);
      res.status(200).json({ message: 'Todos retrieved successfully', todos });
    } catch (error) {
      next(error);
    }
  }

  public getTodoById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const todo = await this.todosService.getTodoById(id);
      if (!todo || todo.user.toString() !== userId) {
         res.status(404).json({ message: 'Todo not found or unauthorized' });
      }
      res.status(200).json({ message: 'Todo retrieved successfully', todo });
    } catch (error) {
      next(error);
    }
  }

  public updateTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, description } = req.body;
      const updated = await this.todosService.updateTodo(id, title, description);
      if (!updated || updated.user.toString() !== userId) {
         res.status(404).json({ message: 'Todo not found or unauthorized' });
      }
      res.status(200).json({ message: 'Todo updated successfully', todo: updated });
    } catch (error) {
      next(error);
    }
  }

  public deleteTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const deleted = await this.todosService.deleteTodo(id);
      if (!deleted || deleted.user.toString() !== userId) {
         res.status(404).json({ message: 'Todo not found or unauthorized' });
      }
      res.status(200).json({ message: 'Todo deleted successfully', todo: deleted });
    } catch (error) {
      next(error);
    }
  }

  public toggleTodoCompletion = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const toggled = await this.todosService.toggleTodoCompletion(id);
      if (!toggled || toggled.user.toString() !== userId) {
         res.status(404).json({ message: 'Todo not found or unauthorized' });
      }
      res.status(200).json({ message: 'Todo completion toggled', todo: toggled });
    } catch (error) {
      next(error);
    }
  }

  public toggleTodoArchive = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const toggled = await this.todosService.toggleTodoArchive(id);
      if (!toggled || toggled.user.toString() !== userId) {
         res.status(404).json({ message: 'Todo not found or unauthorized' });
      }
      res.status(200).json({ message: 'Todo archived toggled', todo: toggled });
    } catch (error) {
      next(error);
    }
  }
}