import { listOrders,updateStatus } from "../controllers/orderController.js";

orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

export default orderRouter;