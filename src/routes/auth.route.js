import express from 'express'
import validationMiddleware from '../middlewares/validation.middleware.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import authController from '../controllers/auth.controller.js'

const router=express.Router();

router.post("/register", validationMiddleware.ValidationRules, authMiddleware.isUserRegistered, authController.registerUser)
router.post("/login", authController.login)

router.get("/get-me", authController.getMe)
router.get("/refresh-token", authController.refreshToken)
router.get("/logout", authController.logout)
router.get("/logoutAll", authController.logoutAll)

router.get("/verify-email", authController.verifyEmail)




export default router;
