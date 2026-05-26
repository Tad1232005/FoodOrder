import User from "../models/userModel.js";
import Food from "../models/foodModel.js";
import Order from "../models/orderModel.js";

export const getDashboardStats = async (req, res) => {

  try {

    // TOTALS

    const totalUsers =
      await User.countDocuments();

    const totalFoods =
      await Food.countDocuments();

    const totalOrders =
      await Order.countDocuments();

    // TOTAL REVENUE

    const revenueData =
      await Order.aggregate([
        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const totalRevenue =
      revenueData.length > 0
        ? revenueData[0].totalRevenue
        : 0;

    // CURRENT + PREVIOUS MONTH

    const currentMonth =
      new Date().getMonth() + 1;

    const previousMonth =
      currentMonth - 1;

    // =========================
    // REVENUE GROWTH
    // =========================

    const currentMonthRevenue =
      await Order.aggregate([
        {
          $match: {
            $expr: {
              $eq: [
                {
                  $month: {
                    $toDate: "$date",
                  },
                },
                currentMonth,
              ],
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const previousMonthRevenue =
      await Order.aggregate([
        {
          $match: {
            $expr: {
              $eq: [
                {
                  $month: {
                    $toDate: "$date",
                  },
                },
                previousMonth,
              ],
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const currentRevenue =
      currentMonthRevenue[0]?.total || 0;

    const previousRevenue =
      previousMonthRevenue[0]?.total || 0;

    const revenueGrowth =
      previousRevenue > 0
        ? Math.round(
            (
              (currentRevenue -
                previousRevenue) /
              previousRevenue
            ) * 100
          )
        : 0;

    // =========================
    // ORDER GROWTH
    // =========================

    const currentMonthOrders =
      await Order.countDocuments({
        $expr: {
          $eq: [
            {
              $month: {
                $toDate: "$date",
              },
            },
            currentMonth,
          ],
        },
      });

    const previousMonthOrders =
      await Order.countDocuments({
        $expr: {
          $eq: [
            {
              $month: {
                $toDate: "$date",
              },
            },
            previousMonth,
          ],
        },
      });

    const orderGrowth =
      previousMonthOrders > 0
        ? Math.round(
            (
              (currentMonthOrders -
                previousMonthOrders) /
              previousMonthOrders
            ) * 100
          )
        : 0;

    // =========================
    // USER GROWTH
    // =========================

    const currentMonthUsers =
      await User.countDocuments({
        $expr: {
          $eq: [
            {
              $month: "$createdAt",
            },
            currentMonth,
          ],
        },
      });

    const previousMonthUsers =
      await User.countDocuments({
        $expr: {
          $eq: [
            {
              $month: "$createdAt",
            },
            previousMonth,
          ],
        },
      });

    const userGrowth =
      previousMonthUsers > 0
        ? Math.round(
            (
              (currentMonthUsers -
                previousMonthUsers) /
              previousMonthUsers
            ) * 100
          )
        : 0;

    // =========================
    // FOOD GROWTH
    // =========================

    const currentMonthFoods =
      await Food.countDocuments({
        $expr: {
          $eq: [
            {
              $month: "$createdAt",
            },
            currentMonth,
          ],
        },
      });

    const previousMonthFoods =
      await Food.countDocuments({
        $expr: {
          $eq: [
            {
              $month: "$createdAt",
            },
            previousMonth,
          ],
        },
      });

    const foodGrowth =
      previousMonthFoods > 0
        ? Math.round(
            (
              (currentMonthFoods -
                previousMonthFoods) /
              previousMonthFoods
            ) * 100
          )
        : 0;

    // =========================
    // MONTHLY REVENUE CHART
    // =========================

    const monthlyRevenue =
      await Order.aggregate([
        {
          $group: {
            _id: {
              $month: {
                $toDate: "$date",
              },
            },

            revenue: {
              $sum: "$amount",
            },
          },
        },

        {
          $sort: {
            "_id": 1,
          },
        },
      ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const revenueChart =
      monthlyRevenue.map((item) => ({
        month:
          monthNames[item._id - 1],

        revenue:
          item.revenue,
      }));

    // =========================
    // RECENT ORDERS
    // =========================

    const recentOrders =
      await Order.find()
        .sort({ date: -1 })
        .limit(5);

    // RESPONSE

    res.json({
      success: true,

      totalUsers,
      totalFoods,
      totalOrders,
      totalRevenue,

      revenueGrowth,
      orderGrowth,
      userGrowth,
      foodGrowth,

      revenueChart,

      recentOrders,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};