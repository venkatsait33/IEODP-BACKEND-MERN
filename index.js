import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./src/db/db.js";
import userRoutes from "./src/routes/user.routes.js";
import ticketRoutes from "./src/routes/ticket.routes.js";
import auditRoutes from "./src/routes/audit.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import dashboardData from "./src/routes/dashboard.routes.js";
import { errorHandler } from "./src/utils/errorHandler.js";

dotenv.config();

const app = express();

/* ---------------- MIDDLEWARES FIRST ---------------- */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------------- CORS (🔥 MUST BE BEFORE ROUTES) ---------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "https://ieodp-frontend-react.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* 🔥 HANDLE PREFLIGHT */
app.options("*", cors());

/* ---------------- ROUTES ---------------- */
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/ticket", ticketRoutes);
app.use("/api/v1/audit", auditRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/dashboard", dashboardData);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* ---------------- ERROR HANDLER LAST ---------------- */
app.use(errorHandler);

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await connectDB();
});
