// models/Notes.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Replace 'User' with the actual name of your user model
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true // Ensure description is required
    },
    tag: {
        type: String,
        default: "General"
    },
    date: {
        type: Date,
        default: Date.now,
        required: true // Ensure date is required
    }
});

module.exports = mongoose.model('Note', NotesSchema); // Ensure model name is singular
