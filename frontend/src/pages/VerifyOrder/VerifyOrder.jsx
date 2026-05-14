import React, { useContext, useEffect } from 'react';
import './VerifyOrder.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const VerifyOrder = () => {
    // Lấy các tham số success và orderId từ trên thanh URL xuống
    const [searchParams, setSearchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    // Hàm gọi API xác thực với Backend
    const verifyPayment = async () => {
        try {
            const response = await axios.post(url + "/api/order/verify", { success, orderId });
            if (response.data.success) {
                // Nếu thành công, đẩy sang trang Lịch sử đơn hàng (My Orders - sẽ làm ở mốc tiếp theo)
                navigate("/myorders");
            } else {
                // Nếu thất bại hoặc hủy quẹt thẻ, đá về trang chủ
                navigate("/");
            }
        } catch (error) {
            console.log(error);
            navigate("/");
        }
    };

    // Tự động chạy hàm verify ngay khi trang vừa load xong
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