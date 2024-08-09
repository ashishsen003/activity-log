const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cors = require('cors');
const UserActivity = require('./models/UserActivity');
const UAParser = require('ua-parser-js');
const axios = require('axios');


const app = express();
app.use(cors());

const PORT = 3001;
const JWT_SECRET = 'your_jwt_secret'; // Replace with a secure secret

app.use(bodyParser.json());

// Utility function to get device info
const getDeviceInfo = (req) => req.headers['user-agent'];
const parseBrowserInfo = (userAgent) => {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser(); // Returns an object with name and version
    return `${browser.name} ${browser.version}`;
};

const parseOSInfo = (userAgent) => {
    const parser = new UAParser(userAgent);
    const os = parser.getOS(); // Returns an object with name and version
    return `${os.name} ${os.version}`;
};
const getLocationFromIP = async (ipAddress) => {
    try {
        const response = await axios.get(`https://ipinfo.io/${ipAddress}/json?token=your_ipinfo_token`);
        return response.data; // Contains location data such as city, region, country, etc.
    } catch (error) {
        console.error('Failed to fetch location data:', error);
        return {};
    }
};


// Signup route
app.post('/signup', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            email,
            password: hashedPassword,
            role: role || 'user', // Default role is 'user' if not provided
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        const ipAddress = req.ip;
        const deviceInfo = getDeviceInfo(req);
        const location = await getLocationFromIP(ipAddress);
        console.log("=======================================================================", location);


         const activityLog = new UserActivity({
            userId: user._id,
            actionType: 'login',
            status: 'success',
            sessionId: token,
            userRole: user.role,
            ipAddress,
            deviceInfo,
            browserInfo: parseBrowserInfo(deviceInfo), // Implement a function to parse browser info
            osInfo: parseOSInfo(deviceInfo), // Implement a function to parse OS info
            location: location, // You can fill this with actual location data if available
            userAgent: deviceInfo,
        });

        await activityLog.save();

        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// User logout route
app.post('/logout', async (req, res) => {
    const token = req.headers['authorization'];

    try {
        await UserActivity.findOneAndUpdate(
            { sessionId: token },
            { logoutTime: new Date(), status: 'logged out' }
        );

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Logout failed' });
    }
});

// Fetch all active sessions for the admin
app.get('/admin/sessions', async (req, res) => {
    try {
        const activeSessions = await UserActivity.find({ logoutTime: null });
        res.status(200).json(activeSessions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch active sessions' });
    }
});

// Admin endpoint to log out a user
app.post('/admin/logout-user', async (req, res) => {
    const { sessionId } = req.body;

    try {
        const session = await UserActivity.findOneAndUpdate(
            { sessionId },
            { logoutTime: new Date(), status: 'logged out' },
            { new: true }
        );

        if (!session) return res.status(404).json({ message: 'Session not found' });

        res.status(200).json({ message: `User with session ID ${sessionId} has been logged out` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to log out user' });
    }
});

// Middleware to validate sessions
const checkSession = async (req, res, next) => {
    const token = req.headers['authorization'];

    try {
        const session = await UserActivity.findOne({ sessionId: token, logoutTime: null });
        if (!session) return res.status(401).json({ message: 'Session is no longer active' });

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Apply session validation middleware to all routes that require authentication
app.use(checkSession);

// Connect to MongoDB and start the server
mongoose.connect('mongodb://localhost:27017/crm')
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('Database connection error:', err));
