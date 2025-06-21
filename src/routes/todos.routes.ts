import { Router } from 'express';
import { TodosController } from '../controllers/todos.controllers';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const todosCtrl = new TodosController();

router.use(authMiddleware);

router.post('/', todosCtrl.createTodo);
router.get('/', todosCtrl.getTodos);
router.get('/:id', todosCtrl.getTodoById);
router.put('/:id', todosCtrl.updateTodo);
router.delete('/:id', todosCtrl.deleteTodo);
router.put('/complete/:id', todosCtrl.toggleTodoCompletion);
router.put('/archive/:id', todosCtrl.toggleTodoArchive);

export default router;
