const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const User = require('../model/User');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const { isEmail } = require('validator'); // To validate email format
const router = express.Router();
const uuid = require('uuid');

// Configure Multer to store files temporarily
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Signup API
const bcrypt = require('bcryptjs');
// Email validation helper from 'validator' library

router.post('/register', upload.single('profile'), async (req, res) => {
    try {
        const { username, email, gender, password, status, designation } = req.body;

        // Basic field validation
        if (!username || !email || !password || !status || !designation) {
            return res.status(400).json({ message: 'Please provide all required fields: username, email, password, status, designation' });
        }

        // Validate email format
        if (!isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Check if there is already an "owner" in the database
        if (status === 'owner') {
            const existingOwner = await User.findOne({ status: 'owner' });
            if (existingOwner) {
                return res.status(400).json({ message: 'Only one owner can sign up' });
            }
        }

        // Encrypt password before saving to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        let profilePictureUrl = null;

        // Upload image to Cloudinary if present
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'profile_pictures',
                public_id: uuid.v4(), // Generate a unique id for the image
            });
            profilePictureUrl = result.secure_url; // Get the secure URL from Cloudinary
        }

        // Create a unique userId
        const userId = uuid.v4(); // Generate unique userId using uuid

        // Save the user details to the database
        const user = new User({
            userId,  // Save the unique userId
            username,
            email,
            gender,
            password: hashedPassword,
            status,
            designation,
            profilePicture: profilePictureUrl,
        });

        await user.save();

        res.status(201).json({ message: 'User created successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});



// Login Route


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email and password presence
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Validate email format
        if (!isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if the user exists with the given email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password with the hashed password stored in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        // Send response with token and user details
        res.status(200).json({ token, user });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});

router.get('/logout',(req, res) => {
    // Logout API just sends a response indicating successful logout
    res.json({ message: "Logout successful" });
  });

  
module.exports = router;