import { useEffect, useState } from "react";

import axios from "axios";

import "./Dashboard.css";

import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
} from "antd";

import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {

  const [stats, setStats] =
    useState({
      totalUsers: 0,
      totalFoods: 0,
      totalOrders: 0,
      totalRevenue: 0,

      revenueGrowth: 0,
      orderGrowth: 0,
      userGrowth: 0,
      foodGrowth: 0,
    });

  const [revenueData, setRevenueData] =
    useState([]);

  const [recentOrders, setRecentOrders] =
    useState([]);

  useEffect(() => {

    const fetchDashboard =
      async () => {

        try {

          const res =
            await axios.get(
              "http://localhost:4000/api/admin/dashboard"
            );

          if (res.data.success) {

            setStats({
              totalUsers:
                res.data.totalUsers,

              totalFoods:
                res.data.totalFoods,

              totalOrders:
                res.data.totalOrders,

              totalRevenue:
                res.data.totalRevenue,

              revenueGrowth:
                res.data.revenueGrowth,

              orderGrowth:
                res.data.orderGrowth,

              userGrowth:
                res.data.userGrowth,

              foodGrowth:
                res.data.foodGrowth,
            });

            setRevenueData(
              res.data.revenueChart || []
            );

            setRecentOrders(
              res.data.recentOrders || []
            );
          }

        } catch (error) {

          console.log(error);
        }
      };

    fetchDashboard();

  }, []);

  const columns = [
    {
      title: "Customer",
      dataIndex: "customer",
    },

    {
      title: "Amount",
      dataIndex: "amount",
    },

    {
      title: "Status",
      dataIndex: "status",

      render: (status) => {

        let color = "blue";

        if (status === "Delivered") {
          color = "green";
        }

        if (
          status === "Food Processing"
        ) {
          color = "orange";
        }

        return (
          <Tag color={color}>
            {status}
          </Tag>
        );
      },
    },
  ];

  const tableData =
    recentOrders.map((order) => ({
      key: order._id,

      customer:
        order.address.firstName +
        " " +
        order.address.lastName,

      amount:
        "$" + order.amount,

      status:
        order.status,
    }));

  return (
    <div className="dashboard">

      <h1 className="dashboard-title">
        Analytics Dashboard
      </h1>

      <Row gutter={[20, 20]}>

        {/* REVENUE */}

        <Col xs={24} md={12} lg={6}>

          <Card
            bordered={false}
            className="dashboard-card"
          >

            <Statistic
              title="Revenue"
              value={
                stats.totalRevenue
              }
              precision={2}
              prefix={
                <DollarOutlined />
              }
            />

            <p
              className={`card-growth ${
                stats.revenueGrowth >= 0
                  ? "growth-up"
                  : "growth-down"
              }`}
            >

              {stats.revenueGrowth >= 0 ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}

              {" "}

              {Math.abs(
                stats.revenueGrowth
              )}%

              {" "}

              compared to last month

            </p>

          </Card>

        </Col>

        {/* ORDERS */}

        <Col xs={24} md={12} lg={6}>

          <Card
            bordered={false}
            className="dashboard-card"
          >

            <Statistic
              title="Orders"
              value={
                stats.totalOrders
              }
              prefix={
                <ShoppingCartOutlined />
              }
            />

            <p
              className={`card-growth ${
                stats.orderGrowth >= 0
                  ? "growth-up"
                  : "growth-down"
              }`}
            >

              {stats.orderGrowth >= 0 ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}

              {" "}

              {Math.abs(
                stats.orderGrowth
              )}%

              {" "}

              compared to last month

            </p>

          </Card>

        </Col>

        {/* USERS */}

        <Col xs={24} md={12} lg={6}>

          <Card
            bordered={false}
            className="dashboard-card"
          >

            <Statistic
              title="Users"
              value={
                stats.totalUsers
              }
              prefix={
                <UserOutlined />
              }
            />

            <p
              className={`card-growth ${
                stats.userGrowth >= 0
                  ? "growth-up"
                  : "growth-down"
              }`}
            >

              {stats.userGrowth >= 0 ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}

              {" "}

              {Math.abs(
                stats.userGrowth
              )}%

              {" "}

              compared to last month

            </p>

          </Card>

        </Col>

        {/* FOODS */}

        <Col xs={24} md={12} lg={6}>

          <Card
            bordered={false}
            className="dashboard-card"
          >

            <Statistic
              title="Foods"
              value={
                stats.totalFoods
              }
              prefix={
                <AppstoreOutlined />
              }
            />

            <p
              className={`card-growth ${
                stats.foodGrowth >= 0
                  ? "growth-up"
                  : "growth-down"
              }`}
            >

              {stats.foodGrowth >= 0 ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}

              {" "}

              {Math.abs(
                stats.foodGrowth
              )}%

              {" "}

              compared to last month

            </p>

          </Card>

        </Col>

      </Row>

      {/* CHART */}

      <Row
        gutter={[20, 20]}
        className="section-margin"
      >

        <Col xs={24}>

          <Card
            title="Revenue Analytics"
            bordered={false}
            className="chart-card"
          >

            <ResponsiveContainer
              width="100%"
              height={420}
            >

              <AreaChart
                data={revenueData}
              >

                <defs>

                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#1677ff"
                      stopOpacity={0.8}
                    />

                    <stop
                      offset="95%"
                      stopColor="#1677ff"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1677ff"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </Card>

        </Col>

      </Row>

      {/* RECENT ORDERS */}

      <Row className="section-margin">

        <Col span={24}>

          <Card
            title="Recent Orders"
            bordered={false}
            className="table-card"
          >

            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
            />

          </Card>

        </Col>

      </Row>

    </div>
  );
};

export default Dashboard;