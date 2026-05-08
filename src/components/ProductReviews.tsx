"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      if (!productId) return;

      const res = await fetch(`/api/reviews/product/${productId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch reviews error:", error);
      setReviews([]);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please login first to leave a review");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add review");
        return;
      }

      setComment("");
      setRating(5);
      toast.success("Review submitted successfully");
      await fetchReviews();
    } catch (error) {
      console.error("Submit review error:", error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Customer Reviews ({reviews.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-8 border-b border-gray-100 pb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Write a Review</h3>

        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className="text-yellow-400"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review..."
          required
          rows={4}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] mb-4"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium transition"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">
          No reviews yet. Be the first to review this product.
        </p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border-b border-gray-100 pb-5 last:border-0"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                  {review.user?.image ? (
                    <img
                      src={review.user.image}
                      alt={review.user?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    review.user?.name?.[0] || "U"
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {review.user?.name || "Anonymous"}
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-6">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}