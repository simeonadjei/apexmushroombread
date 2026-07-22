import { Router, type IRouter } from "express";
import healthRouter from "./health";
import referrersRouter from "./referrers";
import ordersRouter from "./orders";
import statsRouter from "./stats";
import donationsRouter from "./donations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(referrersRouter);
router.use(ordersRouter);
router.use(statsRouter);
router.use(donationsRouter);

export default router;
