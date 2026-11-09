import { Router } from "express"
import {
  profile,
  updateProfileHandler,
  changePasswordHandler,
  stats,
  activity,
  deleteAccountHandler,
} from "../controllers/user.controller.js"
import { integrationActivity } from "../controllers/integrations.controller.js"
import { protect } from "../middlewares/auth.middleware.js"

const userRouter = Router()

userRouter.use(protect)

userRouter.get("/profile", profile)
userRouter.put("/profile", updateProfileHandler)
userRouter.put("/password", changePasswordHandler)
userRouter.get("/stats", stats)
userRouter.get("/activity", activity)
userRouter.get("/integrations/:provider", integrationActivity)
userRouter.delete("/account", deleteAccountHandler)

export default userRouter