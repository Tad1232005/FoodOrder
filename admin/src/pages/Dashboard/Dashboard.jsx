// ======================================================
// FILE:
// admin/src/pages/Dashboard/Dashboard.jsx
// ======================================================

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import dayjs from "dayjs";

import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  DatePicker,
  Progress,
  Empty,
  Tag,
  Select,
} from "antd";

import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import "./Dashboard.css";

const { Option } = Select;

const Dashboard = () => {

  // ======================================================
  // DASHBOARD STATS STATE
  // ======================================================

  const [stats, setStats] =
    useState({

      totalUsers: 0,

      totalFoods: 0,

      totalOrders: 0,

      filteredRevenue: 0,

      recentOrders: [],

      revenueChart: [],

      topFoods: [],

      revenuePercent: null,
    });

  // ======================================================
  // FILTER STATE
  // ======================================================

  const [filterType, setFilterType] =
    useState("month");

  const [selectedDate, setSelectedDate] =
    useState(dayjs());

  // ======================================================
  // FETCH DASHBOARD WHEN FILTER CHANGES
  // ======================================================

  useEffect(() => {

    fetchDashboard();

  }, [filterType, selectedDate]);

  // ======================================================
  // FETCH DASHBOARD DATA
  // ======================================================

  const fetchDashboard =
    async () => {

      try {

        const res =
          await axios.get(
            "http://localhost:4000/api/admin/dashboard",
            {
              params: {

                filterType,

                date:
                  selectedDate.format(
                    "YYYY-MM-DD"
                  ),
              },
            }
          );

        // ==================================================
        // IF API SUCCESS
        // ==================================================

        if (res.data.success) {

          setStats(res.data);
        }

      } catch (error) {

        console.log(error);
      }
    };

  // ======================================================
  // TABLE COLUMNS
  // ======================================================

  const columns = [

    // ====================================================
    // CUSTOMER
    // ====================================================

    {
      title: "Customer",
      dataIndex: "customer",
    },

    // ====================================================
    // ORDER DATE
    // ====================================================

    {
      title: "Date",
      dataIndex: "date",

      align: "right",
    },

    // ====================================================
    // ORDER STATUS
    // ====================================================

    {
      title: "Status",
      dataIndex: "status",

      render: (status) => (

        <Tag color="blue">
          {status}
        </Tag>
      ),
    },

    // ====================================================
    // PAYMENT STATUS
    // ====================================================

    {
      title: "Payment",
      dataIndex: "payment",

      align: "center",

      render: (payment) => (

        payment ? (

          <CheckCircleOutlined
            style={{
              color: "#22c55e",
              fontSize: 20,
            }}
          />

        ) : (

          <CloseCircleOutlined
            style={{
              color: "#ef4444",
              fontSize: 20,
            }}
          />
        )
      ),
    },

    // ====================================================
    // TOTAL AMOUNT
    // ====================================================

    {
      title: "Amount",
      dataIndex: "amount",

      align: "right",
    },
  ];

  return (

    <div className="dashboard">

      {/* ================================================== */}
      {/* DASHBOARD HEADER */}
      {/* ================================================== */}

      <div className="dashboard-top">

        {/* TITLE */}

        <div>

          <h1>
            Analytics Dashboard
          </h1>

          <p>
            Revenue statistics overview
          </p>

        </div>

        {/* ================================================= */}
        {/* TIME FILTER */}
        {/* ================================================= */}

        <div className="filter-bar">

          {/* FILTER TYPE DROPDOWN */}

          <Select
            value={filterType}
            onChange={setFilterType}
            className="filter-select"
            dropdownClassName="dashboard-dropdown"
          >

            <Option value="day">
              Daily
            </Option>

            <Option value="month">
              Monthly
            </Option>

            <Option value="year">
              Yearly
            </Option>

          </Select>

          {/* DATE PICKER */}

          <DatePicker
            picker={filterType}
            value={selectedDate}
            onChange={setSelectedDate}
            allowClear={false}
            className="filter-date"
          />

        </div>

      </div>

      {/* ================================================== */}
      {/* STATISTIC CARDS */}
      {/* ================================================== */}

      <Row gutter={[20, 20]}>

        {/* REVENUE */}

        <Col xs={24} md={12} lg={6}>

          <Card className="dash-card">

            <Statistic
              title="Revenue"
              value={
                Number(
                  stats.filteredRevenue || 0
                )
              }
              precision={2}
              prefix={<DollarOutlined />}
            />

            {/* REVENUE PERCENT */}

            {
              stats.revenuePercent !==
                null &&
              Number(
                stats.revenuePercent
              ) !== 0 && (

                <div
                  className={
                    Number(
                      stats.revenuePercent
                    ) >= 0
                      ? "positive"
                      : "negative"
                  }
                >

                  {
                    Number(
                      stats.revenuePercent
                    ) > 0
                      ? "+"
                      : ""
                  }

                  {stats.revenuePercent}%

                  {" "}
                  compared to previous period

                </div>
              )
            }

          </Card>

        </Col>

        {/* ORDERS */}

        <Col xs={24} md={12} lg={6}>

          <Card className="dash-card">

            <Statistic
              title="Orders"
              value={stats.totalOrders}
              prefix={
                <ShoppingCartOutlined />
              }
            />

          </Card>

        </Col>

        {/* USERS */}

        <Col xs={24} md={12} lg={6}>

          <Card className="dash-card">

            <Statistic
              title="Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />

          </Card>

        </Col>

        {/* FOODS */}

        <Col xs={24} md={12} lg={6}>

          <Card className="dash-card">

            <Statistic
              title="Foods"
              value={stats.totalFoods}
              prefix={
                <AppstoreOutlined />
              }
            />

          </Card>

        </Col>

      </Row>

      {/* ================================================== */}
      {/* CHART + TOP FOODS */}
      {/* ================================================== */}

      <Row
        gutter={[20, 20]}
        style={{
          marginTop: 24,
        }}
      >

        {/* REVENUE CHART */}

        <Col xs={24} lg={16}>

          <Card
            title="Revenue Overview"
            className="chart-card"
          >

            {
              stats.revenueChart &&
              stats.revenueChart.length > 0
                ? (

                  <ResponsiveContainer
                    width="100%"
                    height={350}
                  >

                    <BarChart
                      data={
                        stats.revenueChart
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="label"
                      />

                      <YAxis
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        radius={[
                          10,
                          10,
                          0,
                          0,
                        ]}
                        barSize={38}
                      />

                    </BarChart>

                  </ResponsiveContainer>
                )

                : (

                  <Empty
                    description="No Revenue Data"
                  />
                )
            }

          </Card>

        </Col>

        {/* TOP SELLING FOODS */}

        <Col xs={24} lg={8}>

          <Card
            title="Top Selling Foods"
            className="chart-card"
          >

            {
              stats.topFoods?.length > 0
                ? (

                  stats.topFoods.map(
                    (
                      food,
                      index
                    ) => {

                      const max =
                        stats.topFoods[0]
                          ?.quantity || 1;

                      const percent =
                        (
                          food.quantity / max
                        ) * 100;

                      return (

                        <div
                          key={index}
                          className="food-item"
                        >

                          <div className="food-row">

                            <span
                              className="food-name"
                            >
                              {food.name}
                            </span>

                            <span
                              className="food-qty"
                            >
                              {food.quantity}
                            </span>

                          </div>

                          <Progress
                            percent={Number(
                              percent.toFixed(
                                0
                              )
                            )}
                            showInfo={false}
                            strokeColor="#3b82f6"
                          />

                        </div>
                      );
                    }
                  )
                )

                : (

                  <Empty
                    description="No Food Data"
                  />
                )
            }

          </Card>

        </Col>

      </Row>

      {/* ================================================== */}
      {/* RECENT ORDERS */}
      {/* ================================================== */}

      <Row
        style={{
          marginTop: 24,
        }}
      >

        <Col span={24}>

          <Card
            title="Recent Orders"
            className="chart-card"
          >

            <Table
              columns={columns}
              dataSource={
                stats.recentOrders
              }
              pagination={false}
            />

          </Card>

        </Col>

      </Row>

    </div>
  );
  
};

export default Dashboard;