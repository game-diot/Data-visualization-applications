import express from "express";
import {getHelloWorld} from "../../controllers/hello.controller.js";
import authRoutes from '../../modules/auth/index.js';
const router = express.Router();

router.get('/hello', getHelloWorld);
router.use('/auth', authRoutes);

export default router;