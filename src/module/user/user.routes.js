import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { fileValidation, HME, myMulter } from "../../services/multer.js";
import { endPoints } from "./user.endPoint.js";
import { logInValidation, signUpValidation, updateRoleValidation } from "./user.validation.js";
import * as userControl from './controller/user.controller.js'
const router = Router()
router.get("/", (req, res) => {
    res.status(200).json({ message: 'user Module' })
})

router.post("/getUserData",auth(), userControl.getUserData)
router.post("/changeUserImage",auth(),myMulter(fileValidation.image).single("image"), HME, userControl.changeUserImage)

export default router