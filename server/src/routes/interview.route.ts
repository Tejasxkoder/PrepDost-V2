import { Router } from "express"
import {
  create,
  chat,
  getAll,
  getOne,
  remove,
  abandon,
} from "../controllers/interview.controller.js"
import { protect } from "../middlewares/auth.middleware.js"

const interviewRouter = Router()

interviewRouter.use(protect)

interviewRouter.post("/", create)
interviewRouter.post("/:id/chat", chat)
interviewRouter.get("/", getAll)
interviewRouter.get("/:id", getOne)
interviewRouter.delete("/:id", remove)
interviewRouter.patch("/:id/abandon", abandon)

export default interviewRouter