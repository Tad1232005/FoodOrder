import React, { useContext, useEffect, useState, useRef  } from "react";
import { useParams, Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import "./TrackOrder.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

const STEPS = [
    { key: "Pending", label: "Order Placed", icon: "🧾", desc: "Your order has been received" },
    { key: "Food Processing", label: "Preparing", icon: "👨‍🍳", desc: "Kitchen is preparing your food" },
    { key: "Out for delivery", label: "Out for Delivery", icon: "🛵", desc: "Your order is on the way" },
    { key: "Delivered", label: "Delivered", icon: "✅", desc: "Order delivered successfully" },
];

const TrackOrder = () => {
    const { id } = useParams();
    const { url, token } = useContext(StoreContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const STATUS_MESSAGES = {
        "Pending": "⏳ Order received! We'll confirm shortly.",
        "Food Processing": "👨‍🍳 Your order is being prepared!",
        "Out for delivery": "🛵 Your order is on the way!",
        "Delivered": "✅ Order delivered! Enjoy your meal!",
    };
    // Thêm ref để track status cũ
    const prevStatusRef = useRef(null);

    const fetchOrder = async () => {
        try {
            const res = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
            if (res.data.success) {
                const found = res.data.data.find(o => o._id === id);
                // Nếu status thay đổi → hiện toast
                if (prevStatusRef.current && prevStatusRef.current !== found.status) {
                    toast.info(STATUS_MESSAGES[found.status] || "Order status updated!", {
                        position: "top-right",
                        autoClose: 4000,
                    });
                }
                prevStatusRef.current = found.status;
                setOrder(found || null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // Auto refresh mỗi 10 giây (polling real-time)
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const getCurrentStep = () => {
        return STEPS.findIndex(s => s.key === order?.status);
    };

    if (loading) return <div className="track-loading">Loading...</div>;
    if (!order) return (
        <div className="track-not-found">
            <p>Order not found.</p>
            <Link to="/myorders">← Back to My Orders</Link>
        </div>
    );

    const currentStep = getCurrentStep();

    // Thêm hàm generateInvoice
    //Chức năng in hóa đơn pdf
    const generateInvoice = () => {
        const doc = new jsPDF();

        // ── Header ──
        doc.setFontSize(20);
        doc.setTextColor(255, 99, 71);
        doc.text("FoodOrder", 14, 20);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Invoice / Order Receipt", 14, 28);

        // ── Order info ──
        doc.setFontSize(10);
        doc.setTextColor(60);
        doc.text(`Order ID: #${order._id.slice(-8).toUpperCase()}`, 14, 40);
        doc.text(`Date: ${new Date(order.date).toLocaleDateString("vi-VN")}`, 14, 47);
        doc.text(`Status: ${order.status}`, 14, 54);
        doc.text(`Payment: ${order.payment ? "Paid" : "Unpaid"} (${order.paymentMethod === "cod" ? "Cash on Delivery" : "Stripe"})`, 14, 61);

        // ── Delivery address ──
        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text("Delivery Address", 14, 74);

        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`${order.address.firstName} ${order.address.lastName}`, 14, 81);
        doc.text(`${order.address.street}, ${order.address.city}, ${order.address.state}`, 14, 88);
        doc.text(`Phone: ${order.address.phone}`, 14, 95);
        if (order.address.note) {
            doc.text(`Note: ${order.address.note}`, 14, 102);
        }

        // ── Items table ──
        autoTable(doc, {
            startY: order.address.note ? 112 : 105,
            head: [["Item", "Qty", "Unit Price", "Subtotal"]],
            body: order.items.map(item => [
                item.name,
                item.quantity,
                `$${item.price}`,
                `$${item.price * item.quantity}`
            ]),
            foot: [["", "", "Total", `$${order.amount}`]],
            headStyles: { fillColor: [255, 99, 71] },
            footStyles: { fillColor: [255, 240, 238], textColor: [180, 40, 20], fontStyle: "bold" },
            styles: { fontSize: 10 },
        });

        // ── Footer ──
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Thank you for your order!", 14, pageHeight - 15);
        doc.text("FoodOrder © " + new Date().getFullYear(), 14, pageHeight - 10);

        // ── Download ──
        doc.save(`invoice-${order._id.slice(-8).toUpperCase()}.pdf`);
    };

    return (
        <div className="track-page">
            {/* HEADER */}
            <div className="track-header">
                <Link to="/myorders" className="track-back">← Back to My Orders</Link>
                <h2>Track Order</h2>
                <p className="track-id">Order ID: <span>#{order._id.slice(-8).toUpperCase()}</span></p>
            </div>

            {/* TIMELINE */}
            <div className="track-timeline">
                {STEPS.map((step, index) => {
                    const isDone = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.key} className={`track-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                            {/* Connector line */}
                            {index < STEPS.length - 1 && (
                                <div className={`track-line ${index < currentStep ? "done" : ""}`} />
                            )}

                            {/* Icon */}
                            <div className="track-icon">
                                {isDone && !isCurrent ? "✓" : step.icon}
                            </div>

                            {/* Label */}
                            <div className="track-label">
                                <p className="track-label-title">{step.label}</p>
                                <p className="track-label-desc">{step.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ORDER DETAIL */}
            <div className="track-detail">
                <h3>Order Details</h3>
                <div className="track-items">
                    {order.items.map((item, i) => (
                        <div key={i} className="track-item">
                            <span>{item.name}</span>
                            <span>x{item.quantity}</span>
                            <span>${item.price * item.quantity}</span>
                        </div>
                    ))}
                    <div className="track-item track-total">
                        <span>Total</span>
                        <span></span>
                        <span>${order.amount}</span>
                    </div>
                </div>

                {/* Địa chỉ */}
                <div className="track-address">
                    <h4>Delivery Address</h4>
                    <p>{order.address.firstName} {order.address.lastName}</p>
                    <p>{order.address.street}, {order.address.city}, {order.address.state}</p>
                    <p>{order.address.phone}</p>
                    {order.address.note && <p className="track-note">📝 {order.address.note}</p>}
                </div>

                {/* Payment */}
                <div className="track-payment">
                    <span className={`track-pay-badge ${order.payment ? "paid" : "unpaid"}`}>
                        {order.payment ? "✓ Paid" : "✗ Unpaid"}
                    </span>
                    <span className="track-pay-method">
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : "Stripe"}
                    </span>
                    <button className="track-invoice-btn" onClick={generateInvoice}>
                        📄 Download Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;