import express from 'express';
import insightRouter from './route/insight.js';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './route/user.js';
import InstaRouter from './route/instagramRoute.js';
import facebookRoutes from './Controller/Integration.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const allowedOrigins = ['http://localhost:5173', 'https://social-media-analytics-black.vercel.app'];
                                                 
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)){
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));


const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/insight", insightRouter);
app.use('/api/facebook', facebookRoutes);
app.use('/api/user', userRouter);
app.use("/api/insight/Ig", InstaRouter);



app.get("/", (req, res) => {
    res.json({ message: "root path" });
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
