//Danh sách đơn hàng của admin
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
}   catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

//api để cập nhật trạng thái đơn hàng
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { listOrders, updateStatus }