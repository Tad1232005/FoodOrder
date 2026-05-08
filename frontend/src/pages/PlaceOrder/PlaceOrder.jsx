import React, { useContext } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';

const PlaceOrder = () => {
  const { getTotalCartAmount } = useContext(StoreContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your order!");
  };

  return (
    <form className='place-order' onSubmit={handleSubmit}>
      {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input type="text" placeholder='First Name' required />
          <input type="text" placeholder='Last Name' required />
        </div>
        <input type="email" placeholder='Email address' required />
        <input type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input type="text" placeholder='City' required />
          <input type="text" placeholder='State' required />
        </div>
        <input type="text" placeholder='Phone' required />
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