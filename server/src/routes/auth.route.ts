import { Router } from "express"
import {
  register,
  login,
  verifyEmailHandler,
  resendVerificationHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  getMe,
  logout,
} from "../controllers/auth.controller.js"
import { protect } from "../middlewares/auth.middleware.js"

const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/verify-email", verifyEmailHandler)
authRouter.post("/resend-verification", resendVerificationHandler)
authRouter.post("/forgot-password", forgotPasswordHandler)
authRouter.post("/reset-password", resetPasswordHandler)
authRouter.get("/me", protect, getMe)
authRouter.post("/logout", protect, logout)

export default authRouter
