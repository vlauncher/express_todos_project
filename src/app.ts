import express,{ Application} from 'express';
import { config } from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';

config();


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mongoose
import { connectDB } from './config/db';
connectDB();

// Routes
import userRoutes from './routes/users.routes';
import todoRoutes from './routes/todos.routes';

app.use('/api/v1/todos', todoRoutes);
app.use('/api/v1/auth', userRoutes);


// Global error handler
app.use(errorHandler);


export default app;