import express from "express";
import { addClient } from "../utils/sseProvider.js";
// import { protect } from "../middleware/authMiddleware.js"; // Optional: Can protect with token if passed in query string

const router = express.Router();

router.get("/stream", (req, res) => {
    addClient(req, res);
});

export default router;
