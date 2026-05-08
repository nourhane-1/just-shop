"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const res = await fetch("/api/admin/reviews", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load reviews");
        return;
      }

      setReviews(data.reviews || []);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reviewId: string) {
    const confirmed = window.confirm("Delete this review?");
    if (!confirmed) return;

    setDeletingId(reviewId);

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete review");
        return;
      }

      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
      toast.success("Review deleted successfully");
    } catch (error) {
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-[#F97316]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-sm text-gray-500">
            Manage and moderate customer reviews
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-16 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-900 font-semibold mb-1">No reviews found</p>
            <p className="text-sm text-gray-500">
              Customer reviews will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review._id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold overflow-hidden">
                        {review.user?.image ? (
                          <img
                            src={review.user.image}
                            alt={review.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          review.user?.name?.[0] || "U"
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-sm font-medium text-[#1E3A5F]">
                        Product:
                      </span>{" "}
                      <span className="text-sm text-gray-700">
                        {review.product?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-3">
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

                    <p className="text-sm text-gray-600 leading-6">
                      {review.comment}
                    </p>

                    <p className="text-xs text-gray-400 mt-3">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>

                
                  <div>
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={deletingId === review._id}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === review._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}