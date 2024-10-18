// server.js

import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve static files from the uploads directory

app.use(cors());
// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Student Model
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    avatar: { type: String },
    address: { type: String, required: true },
});

const Student = mongoose.model("Student", studentSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
    },
});
const upload = multer({ storage: storage });

// API Endpoints

// Create a new student
app.post("/students", upload.single("avatar"), async (req, res) => {
    try {
        const student = new Student({
            name: req.body.name,
            age: req.body.age,
            avatar: req.file ? req.file.path : null,
            address: req.body.address,
        });
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all students with pagination
app.get("/students-paging", async (req, res) => {
    const { page = 1, limit = 4 } = req.query; // Default to page 1 and limit 4 per page
    try {
        const students = await Student.find()
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Student.countDocuments();

        res.json({
            totalPages: Math.ceil(count / limit), // Calculate total pages
            currentPage: page,
            students,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all students
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single student by ID
app.get("/students/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a student
app.put("/students/:id", upload.single("avatar"), async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            age: req.body.age,
            address: req.body.address,
        };
        if (req.file) {
            updates.avatar = req.file.path;
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a student
app.delete("/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
