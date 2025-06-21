"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const errorHandler_1 = require("./middlewares/errorHandler");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Mongoose
const db_1 = require("./config/db");
(0, db_1.connectDB)();
// Routes
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const todos_routes_1 = __importDefault(require("./routes/todos.routes"));
app.use('/api/v1/todos', todos_routes_1.default);
app.use('/api/v1/auth', users_routes_1.default);
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map