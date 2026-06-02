import React from "react";
import StarRating from "../StarRating/StarRating";
import "./ReviewList.css";

const ReviewList = ({ reviews, avg, total, breakdown, onDelete, currentUserId }) => {

    if (total === 0) {
        return (
            <div className="review-empty">
                <p>🍽️ No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            {/* RATING SUMMARY */}
            <div className="review-summary">
                {/* Điểm tổng bên trái */}
                <div className="review-summary-left">
                    <div className="review-avg">{avg}</div>
                    <StarRating rating={avg} size={24} />
                    <p>{total} reviews</p>
                </div>

                {/* Progress bar bên phải */}
                <div className="review-summary-right">
                    {breakdown.map(({ star, count }) => (
                        <div key={star} className="review-bar-row">
                            <span className="review-bar-label">{star}★</span>
                            <div className="review-bar-track">
                                <div
                                    className="review-bar-fill"
                                    style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                                />
                            </div>
                            <span className="review-bar-count">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="review-divider" />

            {/* DANH SÁCH REVIEW */}
            <div className="review-items">
                {reviews.map((review) => (
                    <div key={review._id} className="review-item">
                        {/* Avatar + tên */}
                        <div className="review-item-header">
                            <div className="review-avatar">
                                {review.userName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="review-item-meta">
                                <p className="review-item-name">{review.userName}</p>
                                <p className="review-item-date">
                                    {new Date(review.date).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                            {/* Nút xóa nếu là review của mình */}
                            {currentUserId && review.userId === currentUserId && (
                                <button
                                    className="review-delete-btn"
                                    onClick={() => onDelete?.(review._id)}
                                    title="Delete review"
                                >
                                    🗑
                                </button>
                            )}
                        </div>

                        {/* Stars */}
                        <StarRating rating={review.rating} size={16} />

                        {/* Comment */}
                        <p className="review-item-comment">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewList;