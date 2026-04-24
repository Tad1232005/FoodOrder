import React, { useContext } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';

const PlaceOrder = () => {
  const { getTotalCartAmount } = useContext(StoreContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã đặt hàng!");
  };

  return (
    <form className='place-order' onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Thông tin giao hàng</p>
        <div className="multi-fields">
          <input type="text" placeholder='Tên' required />
          <input type="text" placeholder='Họ' required />
        </div>
        <input type="email" placeholder='Địa chỉ Email' required />
        <input type="text" placeholder='Đường/Phố' required />
        <div className="multi-fields">
          <input type="text" placeholder='Thành phố' required />
          <input type="text" placeholder='Quận/Huyện' required />
        </div>
        <input type="text" placeholder='Số điện thoại' required />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Tổng Giỏ Hàng</h2>
          <div>
            <div className="cart-total-details">
              <p>Tạm tính</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Phí giao hàng</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Tổng cộng</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit'>XÁC NHẬN THANH TOÁN</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder;