import express from "express";
import {
  activateUser,
  changePassword,
  deleteUser,
  forgotPassword,
  login,
  register,
  updateUser,
  validateResetCode,
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";
import isAdmin from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/register", register);
router.patch("/activateUser", activateUser);
router.get("/login", login);
router.patch("/update", userAuth, updateUser);
router.delete("/delete/:id", userAuth, isAdmin, deleteUser);
router.post("/forgotPassword", forgotPassword);
router.post("/validatePassword", validateResetCode);
router.patch("/changePassword", changePassword);

export default router;
