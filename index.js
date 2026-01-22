import express, { urlencoded } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db/db.js";
import userRoutes from "./src/routes/user.routes.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./src/utils/errorHandler.js";
import ticketRoutes from "./src/routes/ticket.routes.js";
import auditRoutes from "./src/routes/audit.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import dashboardData from "./src/routes/dashboard.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use(errorHandler);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/ticket", ticketRoutes);
app.use("/api/v1/audit", auditRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/dashboard", dashboardData);

const corsOptions = {
  origin: "http://localhost:5173" || "https://ieodp-frontend-react.vercel.app/",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running",
  });
});

// Start server function
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing");
    }

    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
