const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    taskId: { type: String, required: true, unique: true },
    status: { type: String, required: true },  // Task status (e.g., 'pending', 'completed')
    taskDetails: { type: String, required: true },  // Details of the task
    employeeId: { type: String, required: true }, // Reference to User  // Reference to the employee (user) assigned the task
    employeeName: { type: String, required: true },  // Employee's name
    documentURLs: [{ type: String }],  // Array to store URLs of uploaded files
    createdAt: { type: Date, default: Date.now },  // Timestamp when task was created
});

module.exports = mongoose.model('Task', TaskSchema);
