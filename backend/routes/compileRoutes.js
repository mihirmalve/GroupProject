import compileController from "../controllers/compileController.js";
import {Router} from "express"

const router = Router()

router.post('/compile',compileController.compileCode);

export default router;