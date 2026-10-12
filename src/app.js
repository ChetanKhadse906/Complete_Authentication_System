import express from 'express'
import morgan from 'morgan'
import authRoutes from './routes/auth.route.js'
import cookieParser from 'cookie-parser';

const app=express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser())

// Authentication API'
// 1) Register
app.use("/api/auth", authRoutes)


export default app;