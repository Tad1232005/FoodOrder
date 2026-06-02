import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  // Lấy các biến cần thiết từ StoreContext
  const { getTotalCartAmount, token, food_list, cartItems, url, clearCart } = useContext(StoreContext);

  // Tạo state lưu trữ thông tin địa chỉ người dùng nhập
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    phone: "",
    note: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const navigate = useNavigate();

  // --- QUẢN LÝ MÃ GIẢM GIÁ VÀ THÔNG BÁO ---
  const [promoCode, setPromoCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [promoMessage, setPromoMessage] = useState(""); // Lưu chữ báo lỗi/thành công
  const [isPromoError, setIsPromoError] = useState(false); // Xác định màu chữ (đỏ/xanh)

  // Hàm cập nhật dữ liệu khi người dùng gõ vào ô input địa chỉ
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const subtotal = getTotalCartAmount();

  // --- 1. LOGIC TÍNH PHÍ SHIP ĐỘNG THEO KHU VỰC (ĐÃ FIX KHÔNG ÉP VỀ 0 SỚM) ---
  const getDynamicDeliveryFee = () => {
    if (subtotal === 0) return 0; // Giỏ hàng trống = ship bằng 0

    // Lấy chữ người dùng gõ ở ô City, viết thường để so sánh không lệch
    const userCity = data.city.trim().toLowerCase();

    // CHỖ THAY ĐỔI CHUẨN UX: Nếu chưa nhập gì, trả về 0 (không lấy mặc định 2$ nữa)
    if (!userCity) return 0;

    // Nội thành (gần quán) -> Ship rẻ $1
    if (userCity === "tphcm" || userCity === "hồ chí minh" || userCity === "ho chi minh") {
      return 1;
    }

    // Ngoại thành / tỉnh khác (xa quán) -> Ship $5
    return 5;
  };

  const deliveryFee = getDynamicDeliveryFee(); // Phí ship gốc dựa theo ô City

  // --- 2. HÀM TÍNH SỐ TIỀN GIẢM (TỰ ĐỘNG TÚM THEO PHÍ SHIP ĐỂ TRỪ) ---
  const getDiscountAmount = () => {
    if (!discountInfo || subtotal === 0) return 0;

    if (discountInfo.discountType === "freeship") {
      return deliveryFee; // Tiền giảm bằng đúng phí ship gốc tại thời điểm đó (1$ hoặc 5$)
    } else if (discountInfo.discountType === "percent") {
      return (subtotal * discountInfo.discountValue) / 100;
    } else {
      return discountInfo.discountValue;
    }
  };

  const discountAmount = getDiscountAmount();

  // Tổng tiền cuối cùng sau khi cộng ship và trừ giảm giá (không âm)
  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  // --- HÀM ÁP DỤNG MÃ (GỬI KÈM SUBTOTAL VÀ HEADERS TOKEN) ---
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoMessage("Please enter a promo code!");
      setIsPromoError(true);
      return;
    }
    try {
      // Gửi kèm subtotal để check đơn tối thiểu, kèm headers token để lấy userId
      const response = await axios.post(
        `${url}/api/discount/apply`,
        { code: promoCode, subtotal: subtotal },
        { headers: { token } }
      );

      if (response.data.success) {
        setDiscountInfo(response.data.data);
        setPromoMessage(response.data.message || "Promo code applied successfully!");
        setIsPromoError(false); // Chữ màu xanh
      } else {
        setPromoMessage(response.data.message || "Invalid promo code!");
        setIsPromoError(true); // Chữ màu đỏ
        setDiscountInfo(null);
      }
    } catch (error) {
      console.error(error);
      setPromoMessage("Error applying promo code or code not found!");
      setIsPromoError(true); // Chữ màu đỏ
    }
  };

  // Hàm xử lý logic đặt hàng và gọi Stripe
  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    // --- THÊM PROMOCODE VÀO DỮ LIỆU ĐƠN HÀNG GỬI ĐI ---
    let orderData = {
      address: data,
      items: orderItems,
      amount: totalAmount,
      discountAmount: discountAmount,
      promoCode: discountInfo ? discountInfo.code : "" // Gửi tên mã lên để backend ghi nhận "đã sử dụng"
    };

    try {
      if (paymentMethod === "stripe") {
        let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
        if (response.data.success) {
          const { session_url } = response.data;
          window.location.replace(session_url);
        } else {
          alert("Error Placing Order");
        }
      } else {
        let response = await axios.post(url + "/api/order/placecod", orderData, { headers: { token } });
        if (response.data.success) {
          clearCart();
          sessionStorage.setItem("justOrdered", "true");
          navigate("/myorders");
        } else {
          alert("Error Placing Order");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

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
        <textarea name="note" onChange={onChangeHandler} value={data.note} placeholder="Order note (optional)..." rows={3}/>
      </div>

      {/* CỘT PHẢI: TỔNG TIỀN & THANH TOÁN */}
      <div className="place-order-right">

        {/* 1. Bảng tính tiền (ĐÃ TỐI ƯU HIỂN THỊ ĐẸP MẮT) */}
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${subtotal}</p>
            </div>
            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>
                {/* Nếu chưa nhập city thì hiện text gợi ý mờ thay vì số $0 */}
                {data.city.trim() === ""
                  ? <span style={{ fontSize: "13px", fontStyle: "italic", color: "#888" }}>Enter city...</span>
                  : `$${deliveryFee}`
                }
              </p>
            </div>
            <hr />

            {/* HIỂN THỊ DÒNG GIẢM GIÁ NẾU ÁP DỤNG THÀNH CÔNG */}
            {discountInfo && (
              <>
                <div className="cart-total-details" style={{ color: "#52c41a", fontWeight: "500" }}>
                  <p>
                    {/* Nếu là mã freeship thì đổi chữ hiển thị cho chuyên nghiệp */}
                    {discountInfo.discountType === "freeship"
                      ? `Free Shipping (${discountInfo.code})`
                      : `Discount (${discountInfo.code})`
                    }
                  </p>
                  <p>-${discountAmount.toFixed(2)}</p>
                </div>
                <hr />
              </>
            )}

            <div className="cart-total-details">
              <b>Total</b>
              <b>${subtotal === 0 ? 0 : totalAmount.toFixed(2)}</b>
            </div>
          </div>
        </div>

        {/* 2. Khung nhập mã giảm giá ở giữa */}
        <div className="cart-promocode">
          <p>If you have a promocode, enter it here</p>
          <div className="cart-promocode-input">
            <input
              type="text"
              placeholder="Promo Code"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoMessage("");
              }}
            />
            <button type="button" onClick={handleApplyPromoCode}>Apply</button>
          </div>

          {/* HIỂN THỊ THÔNG BÁO LỖI/THÀNH CÔNG Ở ĐÂY */}
          {promoMessage && (
            <p style={{
              color: isPromoError ? "#ff4d4f" : "#52c41a",
              fontSize: "13px",
              marginTop: "8px",
              fontWeight: "500",
              textAlign: "left"
            }}>
              {promoMessage}
            </p>
          )}
        </div>

        {/* 3. Phương thức thanh toán */}
        <div className="payment-method">
          <p>Payment Method</p>
          <div className="payment-options">
            <label className={paymentMethod === "stripe" ? "active" : ""}>
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={() => setPaymentMethod("stripe")}
              />
              Credit / Debit Card (Stripe)
            </label>
            <label className={paymentMethod === "cod" ? "active" : ""}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery (COD)
            </label>
          </div>
        </div>

        {/* Nút submit — tự đổi chữ theo phương thức */}
        <button className="proceed-btn" type='submit'>
          {paymentMethod === "stripe" ? "PROCEED TO PAYMENT" : "PLACE ORDER"}
        </button>

      </div>
    </form>
  );
};

export default PlaceOrder;