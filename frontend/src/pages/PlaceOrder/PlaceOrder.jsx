<<<<<<< HEAD
import React from "react";
import "./PlaceOrder.css";

const PlaceOrder = () => {
    return (
        <div>
            <h1>PlaceOrder</h1>
        </div>
    )   
=======
import React, { useContext,useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";
const PlaceOrder = () => {
  const { getTotalCartAmount,token,food_list,cartItems,url } = useContext(StoreContext);

  // State lưu thông tin form địa chỉ
    const [data, setData] = useState({
        firstName: "", lastName: "", email: "", street: "",
        city: "", state: "", zipCode: "", country: "", phone: ""
    });

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(data => ({ ...data, [name]: value }));
    };
    // Hàm gọi API Backend của bạn khi bấm nút "Proceed to Payment"
    const placeOrder = async (event) => {
        event.preventDefault();
        let orderItems = [];
        // Lọc ra các món có trong giỏ hàng
        food_list.forEach((item) => {
            if (cartItems[item._id] > 0) {
                let itemInfo = { ...item, quantity: cartItems[item._id] };
                orderItems.push(itemInfo);
            }
        });
        // Đóng gói dữ liệu chuẩn bị gửi cho Backend
        let orderData = {
            address: data,
            items: orderItems,
            amount: getTotalCartAmount() + 2, // Tổng tiền + 2$ ship
        };
        let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
        
        if (response.data.success) {
            const { session_url } = response.data;
            // Đẩy người dùng sang trang quẹt thẻ của Stripe
            window.location.replace(session_url);
        } else {
            alert("Đã có lỗi xảy ra khi thanh toán!");
        }
      };
  return (
    <form className='place-order' onSubmit={placeOrder}>
      {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' required />
          <input name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' required />
        </div>
        <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' required />
        <input name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' required />
          <input name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required />
        </div>
        <div className="multi-fields">
          <input required name='zipCode' onChange={onChangeHandler} value={data.zipCode} type="text" placeholder='Zip code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' required />
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
>>>>>>> 190b2bd (Create place order feature and stripe payment integration ,done)
}

export default PlaceOrder;