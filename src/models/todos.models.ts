import { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
    title: string;
    description: string;
    completed: boolean;
    archived: boolean;
    user: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const Todo = model<ITodo>('Todo', TodoSchema);
