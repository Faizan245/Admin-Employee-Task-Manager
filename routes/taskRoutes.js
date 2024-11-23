const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // Assuming Cloudinary configuration is in this file
const Task = require('../model/Tasks');
const TaskHistory = require('../model/TaskHistory')
const router = express.Router();
const uuid = require('uuid');
// Configure Multer for file upload (handle multiple files)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// POST route to assign a task to an employee
router.post('/assignTask', upload.array('files', 5), async (req, res) => {
    try {
        const { status, taskDetails, employeeId, employeeName } = req.body;

        // Basic validation
        if (!status || !taskDetails || !employeeId || !employeeName) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }



        // Handle file uploads (if any)
        let uploadedFileUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'task_files',
                    public_id: file.filename,
                });
                uploadedFileUrls.push(result.secure_url);
            }
        }
        const taskId = uuid.v4();

        // Create a new Task with the assigned employeeId (UUID)
        const newTask = new Task({
            taskId,
            status,
            taskDetails,
            employeeId,  // Store the UUID for employeeId
            employeeName,
            documentURLs: uploadedFileUrls,
        });

        await newTask.save();

        res.status(201).json({ message: 'Task assigned successfully', task: newTask });
    } catch (err) {
        res.status(500).json({ message: 'Error assigning task', error: err.message });
    }
});

router.post('/updateTask', upload.array('files', 5), async (req, res) => {
    try {
        const { taskId, newStatus } = req.body;

        if (!taskId || !newStatus) {
            return res.status(400).json({ message: 'Please provide both taskId and newStatus' });
        }

        // Find the task in the Task collection by taskId
        const task = await Task.findOne({ taskId });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // If the task is in "Done" status and you want to change the status
        if (task.status === 'Done' && newStatus !== 'Done') {
            // Check if the task is in taskHistory collection
            const taskInHistory = await TaskHistory.findOne({ taskId });

            if (taskInHistory) {
                // Delete the task from the taskHistory collection
                await TaskHistory.deleteOne({ taskId });
            }
        }

        // Handle file uploads (if any)
        if (req.files && req.files.length > 0) {
            // Ensure the 'files' array exists or initialize it
            task.files = task.files || [];

            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'task_files',
                    public_id: file.filename,
                });
                task.documentURLs.push(result.secure_url);
                console.log(result.secure_url)
                // Push the file URL to the array
            }
        }

        // Update the task status
        task.status = newStatus;

        // If the newStatus is "Done", move the task to the taskHistory collection
        if (newStatus === 'Done') {
            // Create a new task history document
            const taskHistory = new TaskHistory({
                taskId: task.taskId,
                status: task.status,
                taskDetails: task.taskDetails,
                employeeId: task.employeeId,
                employeeName: task.employeeName,
                documentURLs: task.documentURLs, // Include the updated files array
            });

            // Save the task to the history collection
            await taskHistory.save();
        }

        // Save the updated task in the Task collection
        await task.save();

        res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (err) {
        res.status(500).json({ message: 'Error updating task', error: err.message });
    }
});

router.get('/tasks', async (req, res) => {
    try {
        // Fetch all tasks from the Task collection
        const tasks = await Task.find();

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found' });
        }

        res.status(200).json({ message: 'Tasks fetched successfully', tasks });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks', error: err.message });
    }
});


router.get('/taskHistory', async (req, res) => {
    try {
        // Fetch all tasks from the TaskHistory collection
        const taskHistory = await TaskHistory.find();

        if (taskHistory.length === 0) {
            return res.status(404).json({ message: 'No task history found' });
        }

        res.status(200).json({ message: 'Task history fetched successfully', taskHistory });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching task history', error: err.message });
    }
});





module.exports = router;
