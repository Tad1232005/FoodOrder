import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import StarRating from "../StarRating/StarRating";
import axios from "axios";
import "./ReviewForm.css";

const ReviewForm = ({ foodId, onReviewAdded }) => {
    const { token, url } = useContext(StoreContext);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [hoverRating, setHoverRating] = useState(0);

    const ratingLabels = {
        1: "Terrible 😞",
        2: "Bad 😕",
        3: "Okay 😐",
        4: "Good 😊",
        5: "Excellent 🤩"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { setError("Please select a rating"); return; }

        setBusy(true);
        setError("");
        try {
            const response = await axios.post(
                `${url}/api/review/${foodId}`,
                { rating, comment },
                { headers: { token } }
            );
            if (response.data.success) {
                setRating(0);
                setComment("");
                onReviewAdded?.(); // callback để reload reviews
            } else {
                setError(response.data.message);
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setBusy(false);
        }
    };

    if (!token) {
        return (
            <div className="review-form-login">
                <p>Please <a href="/login">sign in</a> to write a review</p>
            </div>
        );
    }

    return (
        <div className="review-form">
            <h3>Write a Review</h3>

            {/* Star picker */}
            <div className="review-form-stars">
                <p>Your rating</p>
                <div className="star-picker">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span
                            key={star}
                            className={`star-pick ${star <= (hoverRating || rating) ? "active" : ""}`}
                            onClick={() => { setRating(star); setError(""); }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            ★
                        </span>
                    ))}
                    {(hoverRating || rating) > 0 && (
                        <span className="rating-label">
                            {ratingLabels[hoverRating || rating]}
                        </span>
                    )}
                </div>
            </div>

            {/* Comment */}
            <textarea
                className="review-form-textarea"
                placeholder="Share your experience with this dish..."
                value={comment}
                onChange={(e) => { setComment(e.target.value); setError(""); }}
                rows={4}
                maxLength={500}
            />
            <div className="review-form-count">{comment.length}/500</div>

            {error && <p className="review-form-error">{error}</p>}

            <button
                className="review-form-btn"
                onClick={handleSubmit}
                disabled={busy || rating === 0}
            >
                {busy ? "Submitting..." : "Submit Review"}
            </button>
        </div>
    );
};

export default ReviewForm;