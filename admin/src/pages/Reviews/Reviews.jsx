import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./Reviews.css";
import ConfirmDialog from "../../components/Modal/ConfirmDialog.jsx";

const Reviews = ({ url }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterRating, setFilterRating] = useState("All");
    const [confirmModal, setConfirmModal] = useState({ open: false, reviewId: null });
    const token = localStorage.getItem("token");

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await axios.get(url + "/api/review/all", { headers: { token } });
            if (res.data.success) setReviews(Array.isArray(res.data.data) ? res.data.data : []);
            else toast.error("Failed to load reviews");
        } catch {
            toast.error("Error loading reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await axios.delete(
                url + "/api/review/admin/" + confirmModal.reviewId,
                { headers: { token } }
            );
            if (res.data.success) {
                toast.success("Review deleted");
                fetchReviews();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Error");
        } finally {
            setConfirmModal({ open: false, reviewId: null });
        }
    };

    const filtered = reviews.filter(review => {
        const matchRating = filterRating === "All" || review.rating === Number(filterRating);
        const matchSearch = searchText === "" ||
            review.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchText.toLowerCase());
        return matchRating && matchSearch;
    });

    const resetFilters = () => {
        setSearchText("");
        setFilterRating("All");
    };

    useEffect(() => { fetchReviews(); }, []);

    const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

    return (
        <div className="reviews-page">
            <h3>Review Management</h3>

            {/* FILTER BAR */}
            <div className="reviews-filter-bar">
                <input
                    type="text"
                    placeholder="Search by name or comment..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="reviews-search"
                />
                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                    <option value="All">All Ratings</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 stars</option>
                    <option value="3">⭐⭐⭐ 3 stars</option>
                    <option value="2">⭐⭐ 2 stars</option>
                    <option value="1">⭐ 1 star</option>
                </select>
                {(searchText || filterRating !== "All") && (
                    <button className="reviews-reset" onClick={resetFilters}>Reset</button>
                )}
                <span className="reviews-count">{filtered.length} reviews</span>
            </div>

            {/* TABLE */}
            {loading ? (
                <div className="reviews-loading">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="reviews-empty">No reviews found.</div>
            ) : (
                <div className="reviews-table-wrap">
                    <table className="reviews-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Food ID</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(review => (
                                <tr key={review._id}>
                                    <td>
                                        <div className="reviews-user">
                                            <div className="reviews-avatar">
                                                {review.userName?.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{review.userName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="reviews-foodid">
                                            {review.foodId?.slice(-6)}...
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`reviews-stars rating-${review.rating}`}>
                                            {renderStars(review.rating)}
                                        </span>
                                    </td>
                                    <td>
                                        <p className="reviews-comment">
                                            {review.comment || <em style={{ color: "#aaa" }}>No comment</em>}
                                        </p>
                                    </td>
                                    <td className="reviews-date">
                                        {new Date(review.date).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td>
                                        <button
                                            className="reviews-delete-btn"
                                            onClick={() => setConfirmModal({ open: true, reviewId: review._id })}
                                        >
                                            🗑 Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CONFIRM MODAL */}
            <ConfirmDialog
                open={confirmModal.open}
                title="Delete Review"
                description="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={handleDelete}
                onClose={() => setConfirmModal({ open: false, reviewId: null })}
            />
        </div>
    );
};

export default Reviews;