import express from "express";
import { protect } from "../middlewares/auth.js";
import CompletedTask from "../models/CompletedTask.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const router = express.Router();

// User: Get their own completed tasks (paginated)
router.get(
  "/my-completed",
  protect,
  catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      CompletedTask.find({ userId }).sort({ submittedAt: -1 }).skip(skip).limit(limit),
      CompletedTask.countDocuments({ userId }),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

// User: Get a single completed task by ID (if it's their own)
router.get(
  "/my-completed/:id",
  protect,
  catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const task = await CompletedTask.findOne({
      _id: req.params.id,
      userId,
    });
    if (!task) return next(new AppError("Completed task not found", 404));
    res.status(200).json({ success: true, data: task });
  })
);

// User: Download their own completed task file
router.get(
  "/my-completed/:id/download",
  protect,
  catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const task = await CompletedTask.findOne({
      _id: req.params.id,
      userId,
    });
    if (!task || !task.file || !task.file.path) {
      return next(new AppError("File not found for this completed task", 404));
    }
    res.download(
      task.file.path,
      task.file.originalName || task.file.filename,
      (err) => {
        if (err) {
          return next(new AppError("Error downloading file", 500));
        }
      }
    );
  })
);

// Admin: Get all completed tasks (paginated)
router.get(
  "/admin/all",
  protect,
  catchAsync(async (req, res, next) => {
    // Only allow admin users
    if (!req.user || req.user.role !== "admin") {
      return next(new AppError("Admin access required", 403));
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      CompletedTask.find().sort({ submittedAt: -1 }).skip(skip).limit(limit),
      CompletedTask.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

// Admin: Get a single completed task by ID
router.get(
  "/admin/:id",
  protect,
  catchAsync(async (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return next(new AppError("Admin access required", 403));
    }
    const task = await CompletedTask.findById(req.params.id);
    if (!task) return next(new AppError("Completed task not found", 404));
    res.status(200).json({ success: true, data: task });
  })
);

// Admin: Download a file from CompletedTask
router.get(
  "/admin/:id/download",
  protect,
  catchAsync(async (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return next(new AppError("Admin access required", 403));
    }
    const task = await CompletedTask.findById(req.params.id);
    if (!task || !task.file || !task.file.path) {
      return next(new AppError("File not found for this completed task", 404));
    }
    res.download(
      task.file.path,
      task.file.originalName || task.file.filename,
      (err) => {
        if (err) {
          return next(new AppError("Error downloading file", 500));
        }
      }
    );
  })
);

export default router;
