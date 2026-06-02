import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url,token } = useContext(StoreContext);
  const navigate = useNavigate();

  // LỚP BẢO VỆ: Nếu dữ liệu chưa sẵn sàng, hiển thị chữ "Đang tải..."
  if (!food_list || !cartItems) {
    return <div style={{ marginTop: '100px', textAlign: 'center' }}><h2>Loading cart data...</h2></div>;
  }

  // Tối ưu biến: Gọi hàm 1 lần để dùng chung
  const cartTotal = getTotalCartAmount();

  // Xác định xem giỏ hàng có trống hay không
  const isCartEmpty = cartTotal === 0;

  // LỚP KIỂM TRA: Xử lý sự kiện bấm nút Checkout
  const handleCheckout = () => {
    //THÊM ĐOẠN KIỂM TRA ĐĂNG NHẬP (Chặn lỗi nháy màn hình)
    if (!token) {
      alert("Vui lòng đăng nhập để tiến hành thanh toán!");
      return; // Dừng hàm ngay lập tức, trình duyệt đứng im tại chỗ
    }
    if (isCartEmpty) {
      alert("Your cart is empty! Please add at least one item before checking out.");
    } else {
      navigate('/order');
    }
  };

  return (
    <div className='cart'>
      <SEO title="Your Cart" description="Review your order before checkout" />
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Name</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {/* NẾU TRỐNG: Hiện thông báo. NẾU CÓ ĐỒ: Hiện danh sách */}
        {isCartEmpty ? (
          <div style={{ textAlign: 'center', margin: '40px 0', color: '#555' }}>
            <h2>Your cart is empty 🛒</h2>
            <p>Please go back to the homepage to choose some delicious items!</p>
          </div>
        ) : (
          food_list?.map((item, index) => {
            if (cartItems?.[item._id] > 0) {
              return (
                <div key={index}>
                  <div className='cart-items-title cart-items-item'>
                    <img src={url+"/images/"+item.images} alt="" />
                    <p>{item.name}</p>
                    <p>${item.price}</p>
                    <p>{cartItems[item._id]}</p>
                    <p>${item.price * cartItems[item._id]}</p>
                    <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                  </div>
                  <hr />
                </div>
              )
            }
            return null; // Bắt buộc return null để React không cảnh báo
          })
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${cartTotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${isCartEmpty ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${isCartEmpty ? 0 : cartTotal + 2}</b>
            </div>
          </div>
          {/* Nút được gắn hàm handleCheckout thay vì navigate trực tiếp */}
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  )
}

export default Cart;