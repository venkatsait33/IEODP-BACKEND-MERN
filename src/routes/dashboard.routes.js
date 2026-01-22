import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { getDashboardData } from "../controllers/dashboard.controller.js";

const routes = express.Router();

routes.get("/", isAuthenticated, getDashboardData);

export default routes;
