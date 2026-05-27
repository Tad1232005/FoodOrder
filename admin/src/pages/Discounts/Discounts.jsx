import { useState, useEffect, useCallback } from 'react'; 
import './Discounts.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Discounts = ({ url }) => {
    const backendUrl = url || "http://localhost:4000"; 

    const [discounts, setDiscounts] = useState([]);
    
    // State cho form Thêm mã
    const [data, setData] = useState({
        code: "",
        discountType: "percent", 
        discountValue: "",
        expireDate: "",
        minOrderAmount: "" 
    });

    // --- STATE TÌM KIẾM & CHỈNH SỬA  ---
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    }

    // --- CÁC HÀM XỬ LÝ CHỈNH SỬA ---
    const openEditModal = (discount) => {
        // Format lại ngày tháng chuẩn YYYY-MM-DD để hiển thị đúng trong thẻ <input type="date">
        const formattedDate = discount.expireDate 
            ? new Date(discount.expireDate).toISOString().split('T')[0] 
            : "";
        setEditingDiscount({ ...discount, expireDate: formattedDate });
        setIsEditModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingDiscount(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUpdateDiscount = async (e) => {
        e.preventDefault();
        const submitData = { ...editingDiscount };
        
        if (submitData.discountType === 'freeship') {
            submitData.discountValue = 0;
        }

        try {
            const response = await axios.post(`${backendUrl}/api/discount/update`, submitData);
            if (response.data.success) {
                toast.success(response.data.message);
                setIsEditModalOpen(false);
                fetchDiscounts();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating discount");
        }
    };

    // API 1: Tải danh sách mã
    const fetchDiscounts = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/discount/list`);
            if (response.data.success) {
                setDiscounts(response.data.data);
            } else {
                toast.error("Failed to load discounts!");
            }
        } catch (error) {
            console.error(error); 
            toast.error("Server connection error!");
        }
    }, [backendUrl]);

    // API 2: Gửi form tạo mã mới
    const onSubmitHandler = async (event) => {
        event.preventDefault(); 
        
        const submitData = { ...data };
        if (submitData.discountType === 'freeship') {
            submitData.discountValue = 0; 
        }

        try {
            const response = await axios.post(`${backendUrl}/api/discount/add`, submitData);
            if (response.data.success) {
                setData({ code: "", discountType: "percent", discountValue: "", expireDate: "", minOrderAmount: "" });
                fetchDiscounts();
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("This code may already exist!");
        }
    }

    // API 3: Xóa mã
    const removeDiscount = async (discountId) => {
        if (window.confirm("Are you sure you want to delete this discount?")) {
            try {
                const response = await axios.post(`${backendUrl}/api/discount/remove`, { id: discountId });
                if (response.data.success) {
                    fetchDiscounts();
                    toast.success(response.data.message);
                } else {
                    toast.error("Error removing discount!");
                }
            } catch (error) {
                console.error(error);
                toast.error("Server connection error!");
            }
        }
    }

    // Hàm kiểm tra trạng thái
    const checkStatus = (expireDate, isActive) => {
        if (isActive === false) return <span className="discount-badge status-disabled">Disabled</span>;
        
        const currentDate = new Date();
        const expiryDate = new Date(expireDate);
        
        if (currentDate > expiryDate) {
            return <span className="discount-badge status-expired">Expired</span>;
        }
        return <span className="discount-badge status-active">Active</span>;
    };

    // --- LOGIC LỌC TÌM KIẾM ---
    const filteredDiscounts = discounts.filter((item) => {
        return (
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.discountType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    useEffect(() => {
        const loadData = async () => {
            await fetchDiscounts();
        };  
        loadData();
    }, [fetchDiscounts]);

    return (
        <div className="discount-container">
            <h3>Manage Discounts</h3>
            <br />
            
            {/* --- FORM THÊM MÃ GIẢM GIÁ --- */}
            <form className="discount-form" onSubmit={onSubmitHandler}>
                <div className="form-group">
                    <p>Discount Code</p>
                    <input onChange={onChangeHandler} value={data.code} type="text" name="code" placeholder="Enter code..." required />
                </div>
                
                <div className="form-group">
                    <p>Discount Type</p>
                    <select onChange={onChangeHandler} value={data.discountType} name="discountType">
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                        <option value="freeship">Free Shipping</option>
                    </select>
                </div>

                <div className="form-group">
                    <p>Discount Value</p>
                    <input 
                        onChange={onChangeHandler} 
                        value={data.discountType === 'freeship' ? 0 : data.discountValue} 
                        type="number" 
                        name="discountValue" 
                        placeholder="e.g., 10" 
                        required={data.discountType !== 'freeship'}
                        disabled={data.discountType === 'freeship'}
                        style={{
                            opacity: data.discountType === 'freeship' ? 0.3 : 1,
                            cursor: data.discountType === 'freeship' ? 'not-allowed' : 'text'
                        }}
                    />
                </div>

                <div className="form-group">
                    <p>Min Order Amount ($)</p>
                    <input onChange={onChangeHandler} value={data.minOrderAmount} type="number" name="minOrderAmount" placeholder="e.g., 50" required />
                </div>

                <div className="form-group">
                    <p>Expiration Date</p>
                    <input onChange={onChangeHandler} value={data.expireDate} type="date" name="expireDate" required />
                </div>

                <button type="submit">ADD DISCOUNT</button>
            </form>

            {/* --- BẢNG DANH SÁCH MÃ GIẢM GIÁ --- */}
            <div className="discount-list">
                
                {/* THANH TIÊU ĐỀ + TÌM KIẾM CÙNG 1 DÒNG */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>All Discounts List</h3>
                    <input 
                        type="text" 
                        placeholder="🔍 Search code or type..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-discount-input"
                    />
                </div>

                <div className="discount-list-table">
                    <div className="discount-list-table-format title">
                        <b>Code</b>
                        <b>Type</b>
                        <b>Value</b>
                        <b>Min Order</b>
                        <b>Exp. Date</b>
                        <b>Status</b>
                        <b>Action</b>
                    </div>
                    
                    {/* SỬ DỤNG MẢNG ĐÃ LỌC: filteredDiscounts */}
                    {filteredDiscounts.map((item, index) => {
                        return (
                            <div key={index} className="discount-list-table-format">
                                <p className="code-text">{item.code}</p>
                                <p>{item.discountType === 'freeship' ? 'Free Shipping' : item.discountType}</p>
                                
                                <p>
                                    {item.discountType === 'freeship' 
                                        ? 'Free Ship' 
                                        : `${item.discountValue}${item.discountType === 'percent' ? '%' : '$'}`
                                    }
                                </p>
                                
                                <p className="min-order-text">${item.minOrderAmount || 0}</p>
                                <p>{new Date(item.expireDate).toLocaleDateString('en-US')}</p>
                                <div>{checkStatus(item.expireDate, item.isActive)}</div>
                                
                                {/* CỘT ACTION CHỨA CẢ 2 NÚT EDIT VÀ REMOVE */}
<div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
    <p onClick={() => openEditModal(item)} className='cursor edit-icon'>Edit</p>
    <p onClick={() => removeDiscount(item._id)} className='cursor remove-icon'>Remove</p>
</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- KHUNG MODAL EDIT --- */}
            {isEditModalOpen && editingDiscount && (
                <div className="discount-modal-overlay">
                    <div className="discount-modal-content">
                        <h3>Edit Promo Code: <span style={{ color: '#fc4c24' }}>{editingDiscount.code}</span></h3>
                        <form onSubmit={handleUpdateDiscount}>
                            
                            <div className="form-group-modal">
                                <label>Discount Code</label>
                                <input type="text" name="code" value={editingDiscount.code} onChange={handleEditInputChange} required />
                            </div>
                            
                            <div className="form-group-modal">
                                <label>Discount Type</label>
                                <select name="discountType" value={editingDiscount.discountType} onChange={handleEditInputChange}>
                                    <option value="percent">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ($)</option>
                                    <option value="freeship">Free Shipping</option>
                                </select>
                            </div>

                            <div className="form-group-modal">
                                <label>Discount Value</label>
                                <input 
                                    type="number" 
                                    name="discountValue" 
                                    value={editingDiscount.discountType === 'freeship' ? 0 : editingDiscount.discountValue} 
                                    onChange={handleEditInputChange} 
                                    required={editingDiscount.discountType !== "freeship"} 
                                    disabled={editingDiscount.discountType === "freeship"}
                                />
                            </div>

                            <div className="form-group-modal">
                                <label>Min Order Amount ($)</label>
                                <input type="number" name="minOrderAmount" value={editingDiscount.minOrderAmount} onChange={handleEditInputChange} required />
                            </div>

                            <div className="form-group-modal">
                                <label>Expiration Date</label>
                                <input 
                                    type="date" 
                                    name="expireDate" 
                                    value={editingDiscount.expireDate} 
                                    onChange={handleEditInputChange} 
                                    required 
                                />
                            </div>

                            <div className="form-group-modal" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                <input 
                                    type="checkbox" 
                                    name="isActive" 
                                    checked={editingDiscount.isActive ?? true} 
                                    onChange={handleEditInputChange} 
                                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#fc4c24' }} 
                                />
                                <label style={{ margin: 0, cursor: 'pointer', color: '#fff' }}>Enable this code</label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Changes</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Discounts;
