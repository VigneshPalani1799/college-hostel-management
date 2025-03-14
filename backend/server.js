// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5000;
const SECRET_KEY = "supersecretkey";

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hostelDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true } // 'student' or 'faculty'
});
const User = mongoose.model('User', UserSchema);

const CheckInSchema = new mongoose.Schema({
    studentEmail: { type: String, required: true },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date, default: null },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    status: { type: String, required: true } // 'Check-in successful' or 'Check-in failed'
});

const CheckIn = mongoose.model('CheckIn', CheckInSchema);

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid Token" });
    }
}

// Define hostel coordinates (for GPS validation)
const HOSTEL_LAT = 12.9716; // Example latitude
const HOSTEL_LONG = 77.5946; // Example longitude
const ALLOWED_RADIUS = 0.01; // 10 meters (in degrees, approximate)

function isWithinAllowedRadius(studentLat, studentLong) {
    const distance = Math.sqrt(
        Math.pow(studentLat - HOSTEL_LAT, 2) + Math.pow(studentLong - HOSTEL_LONG, 2)
    );
    return distance <= ALLOWED_RADIUS;
}


async function logCheckinAttempt(email, latitude, longitude, status) {
    try {
        const checkinLog = new CheckIn({
            studentEmail: email,
            checkInTime: new Date(),
            location: { latitude, longitude },
            status: status
        });
        await checkinLog.save();
    } catch (err) {
        console.error("Failed to log check-in attempt:", err);
    }
}

// Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role });
        await user.save();
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/auth/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findOne({ email: decoded.email });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ email: user.email, role: user.role });
    } catch (error) {
        res.status(401).json({ error: "Invalid Token" });
    }
});


// Login API
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // ✅ Ensure a valid JWT token is returned
        const token = jwt.sign({ email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ token, email: user.email, role: user.role });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Student Check-in with GPS Validation
app.post('/api/student/checkin', verifyToken, async (req, res) => {
    try {
        const { email } = req.user;
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            await logCheckinAttempt(email, latitude, longitude, "Check-in failed: GPS coordinates missing");
            return res.status(400).json({ error: "GPS coordinates required." });
        }

        if (!isWithinAllowedRadius(latitude, longitude)) {
            await logCheckinAttempt(email, latitude, longitude, "Check-in failed: Outside hostel premises");
            return res.status(400).json({ error: "Check-in must be within the hostel premises." });
        }

        const existingCheckIn = await CheckIn.findOne({ studentEmail: email, checkOutTime: null });
        if (existingCheckIn) {
            await logCheckinAttempt(email, latitude, longitude, "Check-in failed: Already checked in");
            return res.status(400).json({ error: "Already checked in. Please check out first." });
        }

        const newCheckIn = new CheckIn({ studentEmail: email, checkInTime: new Date(), location: { latitude, longitude } });
        await newCheckIn.save();

        await logCheckinAttempt(email, latitude, longitude, "Check-in successful");
        res.json({ message: "Check-in successful", success: true });
    } catch (error) {
        await logCheckinAttempt(req.user.email, req.body.latitude, req.body.longitude, "Check-in failed: Internal server error");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Student Check-out
app.post('/api/student/checkout', verifyToken, async (req, res) => {
    try {
        const { email } = req.user;
        const checkInRecord = await CheckIn.findOne({ studentEmail: email, checkOutTime: null });
        if (!checkInRecord) {
            return res.status(400).json({ error: "No active check-in found." });
        }
        checkInRecord.checkOutTime = new Date();
        await checkInRecord.save();
        res.json({ message: "Check-out successful" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Faculty Query Student Check-in/out Data
app.get('/api/faculty/query', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ error: "Access denied." });
        }

        let { studentEmail } = req.query;
        if (!studentEmail) {
            return res.status(400).json({ error: "Student email is required" });
        }

        // Remove the domain from the email
        studentEmail = studentEmail.split("@")[0];

        // Find all check-in attempts (successful or failed) based on the username part of the email
        const records = await CheckIn.find({ studentEmail: { $regex: `^${studentEmail}`, $options: "i" } });
        
        if (records.length === 0) {
            return res.status(404).json({ message: "No check-in records found for this student." });
        }

        res.json(records);
    } catch (error) {
        console.error("Query Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});