import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import parcelIcon from "../../assets/parcel_icon.png";
import "./Orders.css";
import ConfirmDialog from "../../components/Modal/ConfirmDialog.jsx";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterMethod, setFilterMethod] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmModal, setConfirmModal] = useState({ open: false, orderId: null });
  const token = localStorage.getItem("token");

  const fetchAllOrders = async () => {
    const response = await axios.get(url + "/api/order/list", { headers: { token } });


    if (response.data.success) {
      const sorted = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(sorted);
    } else {
      toast.error("Error fetching orders");

    };
  };

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(url + "/api/order/status",
      { orderId, status: event.target.value },
      { headers: { token } }
    )
    if (response.data.success) {
      await fetchAllOrders();
      toast.success("Status updated");
    };
  };

  // Nút Mark as Paid riêng cho COD
  const markAsPaid = async (orderId) => {
    const response = await axios.post(url + "/api/order/markpaid",
      { orderId },
      { headers: { token } }
    );
    if (response.data.success) {
      await fetchAllOrders();
      toast.success("Marked as paid");
    } else {
      toast.error("Error");
    }
  };

  const deleteOrder = async () => {
    const response = await axios.post(url + "/api/order/delete",
      { orderId: confirmModal.orderId },
      { headers: { token } }
    );
    if (response.data.success) {
      await fetchAllOrders();
      toast.success("Order deleted");
    } else {
      toast.error("Error deleting order");
    }
    setConfirmModal({ open: false, orderId: null });
  };

  const filteredOrders = orders.filter((order) => {
    // Filter trạng thái
    const matchStatus = filterStatus === "All" || order.status === filterStatus;

    // Filter phương thức
    const matchMethod =
      filterMethod === "All" ||
      (filterMethod === "COD" && order.paymentMethod === "cod") ||
      (filterMethod === "Stripe" && (order.paymentMethod === "stripe" || !order.paymentMethod));

    // Filter đã/chưa thanh toán
    const matchPayment =
      filterPayment === "All" ||
      (filterPayment === "Paid" && order.payment === true) ||
      (filterPayment === "Unpaid" && order.payment === false);

    // Filter theo ngày
    const orderDate = new Date(order.date);
    const matchFrom = !dateFrom || orderDate >= new Date(dateFrom);
    const matchTo = !dateTo || orderDate <= new Date(dateTo + "T23:59:59");

    // Search tên hoặc SĐT
    const matchSearch =
      searchText === "" ||
      (order.address.firstName + " " + order.address.lastName)
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      order.address.phone.includes(searchText);

    return matchStatus && matchMethod && matchPayment && matchFrom && matchTo && matchSearch;
  });

  const resetFilters = () => {
    setFilterStatus("All");
    setFilterPayment("All");
    setFilterMethod("All");
    setSearchText("");
    setDateFrom("");
    setDateTo("");
  };

  useEffect(() => {
    fetchAllOrders();
  }, [])

  return (
    <div className="order add">
      <h3>Order Page</h3>
      {/* THANH FILTER */}
      <div className="order-filter-bar">
        {/* Search */}
        <input
          type="text"
          placeholder="Search name or phone..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="order-search"
        />

        {/* Filter trạng thái */}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Food Processing">Food Processing</option>
          <option value="Out for delivery">Out for delivery</option>
          <option value="Delivered">Delivered</option>
        </select>

        {/* Filter phương thức */}
        <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
          <option value="All">All Methods</option>
          <option value="COD">COD</option>
          <option value="Stripe">Stripe</option>
        </select>

        {/* Filter đã/chưa thanh toán */}
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
          <option value="All">All Payment</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        {/* Filter ngày */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title="From date"
        />
        <span style={{ color: "#888", fontSize: 13 }}>→</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title="To date"
        />

        <button className="btn-reset-filter" onClick={resetFilters}>Reset</button>
        <span className="order-count">{filteredOrders.length} orders</span>
      </div>

      {/* DANH SÁCH ORDER */}
      <div className="order-list">
        {filteredOrders.length === 0 && (
          <p className="no-orders">No orders found.</p>
        )}

        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className={`order-item ${!order.payment && (order.paymentMethod === "stripe" || !order.paymentMethod)
              ? "order-unpaid-stripe"
              : ""
              }`}
          >
            <img src={parcelIcon} alt="" />

            {/* Thông tin đơn */}
            <div className="order-item-info">
              <p className="order-item-food">
                {order.items.map((item, i) =>
                  i === order.items.length - 1
                    ? item.name + " x " + item.quantity
                    : item.name + " x " + item.quantity + ", "
                )}
              </p>
              <p className="order-item-name">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street}</p>
                <p>{order.address.city + ", " + order.address.state}</p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
              {order.address.note && (
                <p className="order-item-note">
                  📝 {order.address.note}
                </p>
              )}
            </div>

            {/* Tổng tiền + ngày */}
            <div className="order-item-summary">
              <p>Items: {order.items.length}</p>
              <p>Total: ${order.amount}</p>
              <p className="order-date">
                {new Date(order.date).toLocaleDateString("vi-VN")}
              </p>
            </div>

            {/* Badges */}
            <div className="order-badges">
              <span className={`badge-method ${order.paymentMethod === "cod" ? "badge-cod" : "badge-stripe"}`}>
                {order.paymentMethod === "cod" ? "COD" : "Stripe"}
              </span>
              <span className={`badge-payment ${order.payment ? "badge-paid" : "badge-unpaid"}`}>
                {order.payment ? "✓ Paid" : "✗ Unpaid"}
              </span>
            </div>

            {/* Dropdown status */}
            <select onChange={(e) => statusHandler(e, order._id)} value={order.status}>
              <option value="Pending">Pending</option>
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>

            <div className="order-actions">
              {order.paymentMethod === "cod" && !order.payment && (
                <button className="btn-mark-paid" onClick={() => markAsPaid(order._id)}>
                  Mark as Paid
                </button>
              )}
              <button className="btn-delete-order" onClick={() => setConfirmModal({ open: true, orderId: order._id })} title="Delete">🗑</button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={confirmModal.open}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={deleteOrder}
        onClose={() => setConfirmModal({ open: false, orderId: null })}
      />
    </div>
  );
};
export default Orders