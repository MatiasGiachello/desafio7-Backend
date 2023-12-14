import mongoose from 'mongoose';

const msgCollection = "messages";

const msgSchema = new mongoose.Schema({
    user: String,
    message: String
});

export const messageModel = mongoose.model(msgCollection, msgSchema);