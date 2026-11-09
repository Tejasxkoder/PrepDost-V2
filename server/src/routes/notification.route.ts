import { Router } from "express"
import {
  list,
  markRead,
  markAllRead,
} from "../controllers/notification.controller.js"
import { protect } from "../middlewares/auth.middleware.js"

const notificationRouter = Router()

notificationRouter.use(protect)

notificationRouter.get("/", list)

notificationRouter.patch("/read-all", markAllRead)
notificationRouter.patch("/:id/read", markRead)

export default notificationRouter
