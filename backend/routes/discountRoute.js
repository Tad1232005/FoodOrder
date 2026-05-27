import express from "express";
import { addDiscount, listDiscounts, removeDiscount, applyDiscount ,updateDiscount} from "../controllers/discountController.js";
import authMiddleware from "../middleware/auth.js";

const discountRouter = express.Router();

discountRouter.post("/add", addDiscount);
discountRouter.get("/list", listDiscounts);
discountRouter.post("/remove", removeDiscount);
discountRouter.post('/apply', authMiddleware, applyDiscount);
discountRouter.post("/update", updateDiscount);
export default discountRouter;