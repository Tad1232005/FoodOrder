import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  // Lấy các biến cần thiết từ StoreContext
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  
  //  Tạo state lưu trữ thông tin địa chỉ người dùng nhập
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: ""
  });

  const navigate = useNavigate();

  //  Hàm cập nhật dữ liệu khi người dùng gõ vào ô input
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  // Hàm xử lý logic đặt hàng và gọi Stripe
  const placeOrder = async (event) => {
    event.preventDefault();
    
    // Đóng gói các món ăn đang có trong giỏ hàng
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    // Gom toàn bộ thông tin đơn hàng
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2, // Tiền đồ ăn + 2$ ship
    };

    // Gọi API xuống Backend
    try {
      let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
      if (response.data.success) {
        const { session_url } = response.data;
        // Chuyển hướng người dùng sang giao diện quẹt thẻ của Stripe
        window.location.replace(session_url);
      } else {
        alert("Error Placing Order");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  //  Bảo mật: Chặn người dùng nếu chưa đăng nhập hoặc giỏ hàng trống
  useEffect(() => {
    if (!token) {
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  return (
    <form className='place-order' onSubmit={placeOrder}>
      {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          {/* Cần thêm thuộc tính name, onChange và value vào từng ô input */}
          <input name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' required />
          <input name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' required />
        </div>
        <input name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' required />
        <input name="street" onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder='City' required />
          <input name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required />
        </div>
        <input name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' required />
      </div>

      {/* CỘT PHẢI: TỔNG TIỀN & THANH TOÁN */}
      <div className="place-order-right">

        {/* 1. Bảng tính tiền */}
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
        </div>

        {/* 2. Khung nhập mã giảm giá ở giữa */}
        <div className="cart-promocode">
          <p>If you have a promocode, enter it here</p>
          <div className="cart-promocode-input">
            <input type="text" placeholder="Promo Code" />
            <button type="button">Apply</button>
          </div>
        </div>

        {/* 3. Nút chốt đơn hàng */}
        <button className="proceed-btn" type='submit'>PROCEED TO PAYMENT</button>

      </div>
    </form>
  )
}

export default PlaceOrder;