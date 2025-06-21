"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todos_controllers_1 = require("../controllers/todos.controllers");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const todosCtrl = new todos_controllers_1.TodosController();
router.use(auth_1.authMiddleware);
router.post('/', todosCtrl.createTodo);
router.get('/', todosCtrl.getTodos);
router.get('/:id', todosCtrl.getTodoById);
router.put('/:id', todosCtrl.updateTodo);
router.delete('/:id', todosCtrl.deleteTodo);
router.put('/complete/:id', todosCtrl.toggleTodoCompletion);
router.put('/archive/:id', todosCtrl.toggleTodoArchive);
exports.default = router;
//# sourceMappingURL=todos.routes.js.map