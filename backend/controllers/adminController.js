import User from "../models/userModel.js";
import Food from "../models/foodModel.js";
import Order from "../models/orderModel.js";
import dayjs from "dayjs";

export const getDashboardStats = async (req, res) => {
  try {
    const { filterType = "month", date } = req.query;
    const selectedDate = dayjs(date || new Date());

    let startDate, endDate, prevStartDate, prevEndDate;

    if (filterType === "day") {
      startDate = selectedDate.startOf("day");
      endDate = selectedDate.endOf("day");
      prevStartDate = selectedDate.subtract(1, "day").startOf("day");
      prevEndDate = selectedDate.subtract(1, "day").endOf("day");
    } else if (filterType === "year") {
      startDate = selectedDate.startOf("year");
      endDate = selectedDate.endOf("year");
      prevStartDate = selectedDate.subtract(1, "year").startOf("year");
      prevEndDate = selectedDate.subtract(1, "year").endOf("year");
    } else {
      startDate = selectedDate.startOf("month");
      endDate = selectedDate.endOf("month");
      prevStartDate = selectedDate.subtract(1, "month").startOf("month");
      prevEndDate = selectedDate.subtract(1, "month").endOf("month");
    }

    const totalUsers = await User.countDocuments();
    const totalFoods = await Food.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Chỉ tính các order đã thanh toán
    const paidOrders = await Order.find({ payment: true });

    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

    const filteredOrders = paidOrders.filter((order) => {
      const orderDate = dayjs(order.date);
      return (
        orderDate.isAfter(startDate.subtract(1, "millisecond")) &&
        orderDate.isBefore(endDate.add(1, "millisecond"))
      );
    });

    const filteredRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

    const previousOrders = paidOrders.filter((order) => {
      const orderDate = dayjs(order.date);
      return (
        orderDate.isAfter(prevStartDate.subtract(1, "millisecond")) &&
        orderDate.isBefore(prevEndDate.add(1, "millisecond"))
      );
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

    let revenuePercent = null;
    if (previousRevenue > 0) {
      revenuePercent = (((filteredRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1);
    }

    let revenueChart = [];

    if (filterType === "day") {
      for (let i = 0; i < 24; i++) {
        const revenue = filteredOrders
          .filter((order) => dayjs(order.date).hour() === i)
          .reduce((sum, order) => sum + Number(order.amount || 0), 0);

        revenueChart.push({ label: `${i}h`, revenue });
      }
    } else if (filterType === "year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 0; i < 12; i++) {
        const revenue = filteredOrders
          .filter((order) => dayjs(order.date).month() === i)
          .reduce((sum, order) => sum + Number(order.amount || 0), 0);

        revenueChart.push({ label: months[i], revenue });
      }
    } else {
      const daysInMonth = selectedDate.daysInMonth();
      for (let i = 1; i <= daysInMonth; i++) {
        const revenue = filteredOrders
          .filter((order) => dayjs(order.date).date() === i)
          .reduce((sum, order) => sum + Number(order.amount || 0), 0);

        revenueChart.push({ label: `${i}`, revenue });
      }
    }

    const foodMap = {};
    filteredOrders.forEach((order) => {
      if (!order.items) return;
      order.items.forEach((item) => {
        const foodName = item.name || item.foodName || "Unknown";
        const quantity = Number(item.quantity || 1);
        foodMap[foodName] = (foodMap[foodName] || 0) + quantity;
      });
    });

    const topFoods = Object.entries(foodMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const recentOrders = await Order.find().sort({ date: -1 }).limit(5);

    const formattedOrders = recentOrders.map((order) => ({
      key: order._id,
      customer: `${order.address?.firstName || ""} ${order.address?.lastName || ""}`.trim(),
      date: dayjs(order.date).format("DD/MM/YYYY"),
      status: order.status,
      payment: order.payment,
      amount: `$${order.amount}`,
    }));

    res.json({
      success: true,
      totalUsers,
      totalFoods,
      totalOrders,
      totalRevenue,
      filteredRevenue,
      revenuePercent,
      revenueChart,
      topFoods,
      recentOrders: formattedOrders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};