import React, { useContext, useEffect } from 'react';
import './VerifyOrder.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const VerifyOrder = () => {
    // 1. Lấy success và orderId từ thanh địa chỉ (URL)
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");

    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    // 2. Hàm gọi API xác thực với Backend
    const verifyPayment = async () => {
        try {
            const response = await axios.post(url + "/api/order/verify", { success, orderId });
            if (response.data.success) {
                // Nếu Backend báo OK, đẩy khách sang trang My Orders
                navigate("/myorders");
            } else {
                // Nếu thanh toán lỗi, đẩy về trang chủ
                navigate("/");
            }
        } catch (error) {
            console.log(error);
            navigate("/");
        }
    }

    // 3. Tự động chạy hàm xác thực khi trang vừa hiện ra
    useEffect(() => {
        verifyPayment();
    }, []);

    return (
        <div className='verify'>
            <div className="spinner"></div>
        </div>
    );
};

export default VerifyOrder;