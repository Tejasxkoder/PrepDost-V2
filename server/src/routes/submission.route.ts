import { Router } from "express"
import { submit, run, mySubmissions, getOne } from "../controllers/submission.controller.js"
import { protect } from "../middlewares/auth.middleware.js"

const submissionRouter = Router()

submissionRouter.use(protect)
submissionRouter.post("/", submit)
submissionRouter.post("/run", run)
submissionRouter.get("/", mySubmissions)
submissionRouter.get("/:id", getOne)

export default submissionRouter