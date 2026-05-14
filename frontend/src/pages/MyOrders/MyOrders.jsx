import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './MyOrders.css';

const MyOrders = () => {
    // Lấy url backend và token đăng nhập từ Context API
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hàm gọi API lấy danh sách đơn hàng của user
    const fetchOrders = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    // Tự động gọi API khi vào trang
    useEffect(() => {
        if (token) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [token]);

    return (
        <div className="my-orders-wrap">
            <div className="my-orders-container">
                <h2>My Orders</h2>
                
                {loading ? (
                    <div className="loading-spinner">Loading data...</div>
                ) : data.length === 0 ? (
                    <div className="no-orders">
                        <p>You have no orders yet. Go order some delicious food! 🍔</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {data.map((order, index) => (
                            <div key={index} className="order-card">
                                <div className="order-icon">📦</div>
                                
                                <div className="order-info">
                                    <p className="order-items">
                                        {/* Hiển thị danh sách món ăn: Tên món x Số lượng */}
                                        {order.items.map((item, i) => {
                                            if (i === order.items.length - 1) {
                                                return item.name + " x " + item.quantity;
                                            } else {
                                                return item.name + " x " + item.quantity + ", ";
                                            }
                                        })}
                                    </p>
                                    
                                    <p className="order-amount">${order.amount}.00</p>
                                    
                                    <p className="order-qty">Items: {order.items.length}</p>
                                    
                                    <p className="order-status">
                                        {/* Chấm tròn đổi màu tùy trạng thái */}
                                        <span className={`status-dot ${order.status === 'Delivered' ? 'green' : 'orange'}`}></span>
                                        <b>{order.status}</b>
                                    </p>
                                </div>
                                
                                {/* Nút cập nhật trạng thái đơn hàng */}
                                <button onClick={fetchOrders} className="track-btn">Track Order</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;