const mongoose = require('mongoose');

const TaskHistorySchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  taskDetails: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  documentURLs: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TaskHistory', TaskHistorySchema);
