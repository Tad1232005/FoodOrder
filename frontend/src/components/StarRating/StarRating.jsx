import React from "react";
import "./StarRating.css";

const StarRating = ({ rating, maxStars = 5, size = 20, interactive = false, onChange }) => {
    const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

    return (
        <div className="star-rating">
            {stars.map((star) => {
                const filled = star <= Math.floor(rating);
                const half = !filled && star - 0.5 <= rating;

                return (
                    <span
                        key={star}
                        className={`star ${filled ? "star-filled" : half ? "star-half" : "star-empty"} ${interactive ? "star-interactive" : ""}`}
                        style={{ fontSize: size }}
                        onClick={() => interactive && onChange?.(star)}
                    >
                        {filled ? "★" : half ? "★" : "☆"}
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating;