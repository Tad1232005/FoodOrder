// ======================================================
// FILE:
// backend/controllers/adminController.js
// ======================================================

import User from "../models/userModel.js";
import Food from "../models/foodModel.js";
import Order from "../models/orderModel.js";

import dayjs from "dayjs";

// ======================================================
// DASHBOARD CONTROLLER
// ======================================================

export const getDashboardStats =
  async (req, res) => {

    try {

      // ======================================================
      // QUERY
      // ======================================================

      const {
        filterType = "month",
        date,
      } = req.query;

      const selectedDate =
        dayjs(date || new Date());

      // ======================================================
      // TIME RANGE
      // ======================================================

      let startDate;
      let endDate;

      let prevStartDate;
      let prevEndDate;

      // ======================================================
      // DAY
      // ======================================================

      if (filterType === "day") {

        startDate =
          selectedDate.startOf("day");

        endDate =
          selectedDate.endOf("day");

        prevStartDate =
          selectedDate
            .subtract(1, "day")
            .startOf("day");

        prevEndDate =
          selectedDate
            .subtract(1, "day")
            .endOf("day");
      }

      // ======================================================
      // YEAR
      // ======================================================

      else if (filterType === "year") {

        startDate =
          selectedDate.startOf("year");

        endDate =
          selectedDate.endOf("year");

        prevStartDate =
          selectedDate
            .subtract(1, "year")
            .startOf("year");

        prevEndDate =
          selectedDate
            .subtract(1, "year")
            .endOf("year");
      }

      // ======================================================
      // MONTH
      // ======================================================

      else {

        startDate =
          selectedDate.startOf("month");

        endDate =
          selectedDate.endOf("month");

        prevStartDate =
          selectedDate
            .subtract(1, "month")
            .startOf("month");

        prevEndDate =
          selectedDate
            .subtract(1, "month")
            .endOf("month");
      }

      // ======================================================
      // TOTAL USERS
      // ======================================================

      const totalUsers =
        await User.countDocuments();

      // ======================================================
      // TOTAL FOODS
      // ======================================================

      const totalFoods =
        await Food.countDocuments();

      // ======================================================
      // CHỈ TÍNH ORDER ĐÃ THANH TOÁN
      // ======================================================

      const paidOrders =
        await Order.find({
          payment: true,
        });

      // ======================================================
      // TOTAL ORDERS
      // ======================================================

      const totalOrders =
        await Order.countDocuments();

      // ======================================================
      // TOTAL REVENUE
      // ======================================================

      const totalRevenue =
        paidOrders.reduce(

          (sum, order) =>

            sum +
            Number(order.amount || 0),

          0
        );

      // ======================================================
      // FILTERED ORDERS
      // ======================================================

      const filteredOrders =
        paidOrders.filter((order) => {

          const orderDate =
            dayjs(order.date);

          return (

            orderDate.isAfter(
              startDate.subtract(
                1,
                "millisecond"
              )
            )

            &&

            orderDate.isBefore(
              endDate.add(
                1,
                "millisecond"
              )
            )
          );
        });

      // ======================================================
      // FILTERED REVENUE
      // ======================================================

      const filteredRevenue =
        filteredOrders.reduce(

          (sum, order) =>

            sum +
            Number(order.amount || 0),

          0
        );

      // ======================================================
      // PREVIOUS ORDERS
      // ======================================================

      const previousOrders =
        paidOrders.filter((order) => {

          const orderDate =
            dayjs(order.date);

          return (

            orderDate.isAfter(
              prevStartDate.subtract(
                1,
                "millisecond"
              )
            )

            &&

            orderDate.isBefore(
              prevEndDate.add(
                1,
                "millisecond"
              )
            )
          );
        });

      // ======================================================
      // PREVIOUS REVENUE
      // ======================================================

      const previousRevenue =
        previousOrders.reduce(

          (sum, order) =>

            sum +
            Number(order.amount || 0),

          0
        );

      // ======================================================
      // %
      // ======================================================

      let revenuePercent =
        null;

      if (previousRevenue > 0) {

        revenuePercent =
          (
            (
              (
                filteredRevenue
                - previousRevenue
              )
              /
              previousRevenue
            ) * 100
          ).toFixed(1);
      }

      // ======================================================
      // CHART
      // ======================================================

      let revenueChart = [];

      // ======================================================
      // DAY CHART
      // ======================================================

      if (filterType === "day") {

        for (
          let i = 0;
          i < 24;
          i++
        ) {

          const revenue =
            filteredOrders

              .filter((order) => {

                return (
                  dayjs(order.date)
                    .hour() === i
                );
              })

              .reduce(

                (sum, order) =>

                  sum +
                  Number(order.amount || 0),

                0
              );

          revenueChart.push({

            label: `${i}h`,

            revenue,
          });
        }
      }

      // ======================================================
      // YEAR CHART
      // ======================================================

      else if (filterType === "year") {

        const months = [

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

        for (
          let i = 0;
          i < 12;
          i++
        ) {

          const revenue =
            filteredOrders

              .filter((order) => {

                return (
                  dayjs(order.date)
                    .month() === i
                );
              })

              .reduce(

                (sum, order) =>

                  sum +
                  Number(order.amount || 0),

                0
              );

          revenueChart.push({

            label: months[i],

            revenue,
          });
        }
      }

      // ======================================================
      // MONTH CHART
      // ======================================================

      else {

        const daysInMonth =
          selectedDate.daysInMonth();

        for (
          let i = 1;
          i <= daysInMonth;
          i++
        ) {

          const revenue =
            filteredOrders

              .filter((order) => {

                return (
                  dayjs(order.date)
                    .date() === i
                );
              })

              .reduce(

                (sum, order) =>

                  sum +
                  Number(order.amount || 0),

                0
              );

          revenueChart.push({

            label: `${i}`,

            revenue,
          });
        }
      }

      // ======================================================
      // TOP SELLING
      // ======================================================

      const foodMap = {};

      filteredOrders.forEach((order) => {

        if (!order.items) return;

        order.items.forEach((item) => {

          const foodName =

            item.name ||
            item.foodName ||
            "Unknown";

          const quantity =
            Number(
              item.quantity || 1
            );

          if (foodMap[foodName]) {

            foodMap[foodName] +=
              quantity;
          }

          else {

            foodMap[foodName] =
              quantity;
          }
        });
      });

      // ======================================================
      // SORT
      // ======================================================

      const topFoods =

        Object.entries(foodMap)

          .map(([name, quantity]) => ({

            name,

            quantity,
          }))

          .sort(
            (a, b) =>
              b.quantity - a.quantity
          )

          .slice(0, 5);

      // ======================================================
      // RECENT ORDERS
      // ======================================================

      const recentOrders =
        await Order.find()

          .sort({
            date: -1,
          })

          .limit(5);

      // ======================================================
      // FORMAT TABLE
      // ======================================================

      const formattedOrders =

        recentOrders.map((order) => ({

          key: order._id,

          customer:

            `${order.address?.firstName || ""}
            ${order.address?.lastName || ""}`,

          date:

            dayjs(order.date)
              .format(
                "DD/MM/YYYY"
              ),

          status:
            order.status,

          payment:
            order.payment,

          amount:
            `$${order.amount}`,
        }));

      // ======================================================
      // RESPONSE
      // ======================================================

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

        recentOrders:
          formattedOrders,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          error.message,
      });
    }
  };