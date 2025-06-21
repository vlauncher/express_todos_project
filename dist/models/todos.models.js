"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Todo = void 0;
const mongoose_1 = require("mongoose");
const TodoSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.Todo = (0, mongoose_1.model)('Todo', TodoSchema);
//# sourceMappingURL=todos.models.js.map