"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosController = void 0;
const todos_service_1 = require("../services/todos.service");
class TodosController {
    todosService = new todos_service_1.TodosService();
    createTodo = async (req, res, next) => {
        try {
            const { title, description } = req.body;
            const userId = req.user.id;
            const todo = await this.todosService.createTodo(title, description, userId);
            res.status(201).json({ message: 'Todo created successfully', todo });
        }
        catch (error) {
            next(error);
        }
    };
    getTodos = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const todos = await this.todosService.getTodos(userId);
            res.status(200).json({ message: 'Todos retrieved successfully', todos });
        }
        catch (error) {
            next(error);
        }
    };
    getTodoById = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const todo = await this.todosService.getTodoById(id);
            if (!todo || todo.user.toString() !== userId) {
                res.status(404).json({ message: 'Todo not found or unauthorized' });
            }
            res.status(200).json({ message: 'Todo retrieved successfully', todo });
        }
        catch (error) {
            next(error);
        }
    };
    updateTodo = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { title, description } = req.body;
            const updated = await this.todosService.updateTodo(id, title, description);
            if (!updated || updated.user.toString() !== userId) {
                res.status(404).json({ message: 'Todo not found or unauthorized' });
            }
            res.status(200).json({ message: 'Todo updated successfully', todo: updated });
        }
        catch (error) {
            next(error);
        }
    };
    deleteTodo = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const deleted = await this.todosService.deleteTodo(id);
            if (!deleted || deleted.user.toString() !== userId) {
                res.status(404).json({ message: 'Todo not found or unauthorized' });
            }
            res.status(200).json({ message: 'Todo deleted successfully', todo: deleted });
        }
        catch (error) {
            next(error);
        }
    };
    toggleTodoCompletion = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const toggled = await this.todosService.toggleTodoCompletion(id);
            if (!toggled || toggled.user.toString() !== userId) {
                res.status(404).json({ message: 'Todo not found or unauthorized' });
            }
            res.status(200).json({ message: 'Todo completion toggled', todo: toggled });
        }
        catch (error) {
            next(error);
        }
    };
    toggleTodoArchive = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const toggled = await this.todosService.toggleTodoArchive(id);
            if (!toggled || toggled.user.toString() !== userId) {
                res.status(404).json({ message: 'Todo not found or unauthorized' });
            }
            res.status(200).json({ message: 'Todo archived toggled', todo: toggled });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.TodosController = TodosController;
//# sourceMappingURL=todos.controllers.js.map