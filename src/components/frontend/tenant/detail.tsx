"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Mail,
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { useRole } from "../context/RoleContext";
import { manager_property } from "@/services/api";

interface TypeReviewProperty {
  id: number;
  comment: string;
  score: number;
  created_at: string;
  tenant_id: number;
  user: {
    id: number;
    email_phone: string;
    first_name: string;
    last_name: string;
  };
}

// set flash
const setFlash = (key: string, value: string) => {
  sessionStorage.setItem(key, value);
};

const HouseRentalDetail: React.FC<{
  initialProperty: TypeDetailProperty;
  initialReview: TypeReviewProperty[];
}> = ({ initialProperty, initialReview }) => {
  const { id } = useRole();
  const [property, setProperty] = useState<TypeDetailProperty>(initialProperty);
  const [review, setReview] = useState<TypeReviewProperty[]>(initialReview);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(
    property.favorite.length > 0
  );
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [newReview, setNewReview] = useState<{
    rating: number;
    comment: string;
  }>({
    rating: review.find((e) => e.tenant_id === id)?.score || 0,
    comment: review.find((e) => e.tenant_id === id)?.comment || "",
  });

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const url = `${window.location.origin}/tenant/properties/detail/${property.id}`;
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Property Detail",
          text: "เช็คดูห้องนี้สิ 🔥",
          url: url,
        });
      } catch (err) {
        console.error("Share canceled", err);
      }
    } else {
      // fallback → copy link
      await navigator.clipboard.writeText(url);
      alert("คัดลอกลิงก์แล้ว 📋");
    }
  };

  let reviewed = review.some((r) => r.tenant_id === id);

  const refreshReview = async () => {
    try {
      const res = await manager_property.get_review_property({
        withCredentials: true,
        params: { property_id: property.id },
      });
      if (res.data.success) {
        reviewed = res.data.data.some((r: any) => r.tenant_id === id);
        setReview(res.data.data);
      }
    } catch (err) {
      console.error("Error refreshing review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = (): void => {
    setCurrentImageIndex((prev) =>
      prev === property.property_image.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (): void => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.property_image.length - 1 : prev - 1
    );
  };

  const averageRating =
    (review?.reduce((acc, review) => acc + review.score, 0) ?? 0) /
    (review?.length ?? 1);

  const handleReviewCreate = async (): Promise<void> => {
    console.log(newReview);
    if (!newReview.comment.trim() || newReview.rating <= 0) return;

    setIsSubmitting(true);

    try {
      const res = await manager_property.post_review_property(
        {
          score: newReview.rating,
          comment: newReview.comment,
        },
        {
          withCredentials: true,
          params: { property_id: property.id },
        }
      );

      if (!res.data.success) {
        throw new Error("Failed to submit review");
      }
      refreshReview();
      setNewReview({
        rating: newReview.rating,
        comment: newReview.comment,
      });
      console.log("Review submitted successfully:", res.data);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleReviewEdit = async (): Promise<void> => {
    if (!newReview.comment.trim() || newReview.rating <= 0) return;

    setIsSubmitting(true);

    try {
      const res = await manager_property.put_review_property(
        {
          score: newReview.rating,
          comment: newReview.comment,
        },
        {
          withCredentials: true,
          params: { property_id: property.id },
        }
      );

      if (!res.data.success) {
        throw new Error("Failed to submit review");
      }
      setNewReview({
        rating: newReview.rating,
        comment: newReview.comment,
      });
      refreshReview();
      console.log("Review submitted successfully:", res.data);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const deleteReview = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      const res = await manager_property.delete_review_property({
        withCredentials: true,
        params: { property_id: property.id },
      });

      if (!res.data.success) {
        throw new Error("Failed to submit review");
      }
      setNewReview({
        rating: 0,
        comment: "",
      });
      refreshReview();
      console.log("Review submitted successfully:", res.data);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await manager_property.get_favorite_property({
        withCredentials: true,
        params: { property_id: property.id },
      });
      if (res.data.success) {
        setIsFavorite(res.data.data);
      }
    } catch (err) {
      console.error("Error handle Like:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number): void => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleChat = async (): Promise<void> => {
    try {
      const response = await axios.post(
        "/api/conversations/create",
        {
          landlord_id: property.user.id,
          email_phone: property.user.email_phone,
        },
        {
          withCredentials: true, // ถ้ามี cookie httpOnly
        }
      );

      if (!response.data.success) {
        throw new Error("Failed to create conversation");
      }
      setFlash("conversation_id", response.data.conversation.id);
      router.push(`/tenant/message`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-50 md:h-[500px] bg-gray-200">
        {property.property_image.length > 0 ? (
          <img
            src={`http://localhost:5000/image/${property.user.id}/images_property/${property.uuid}/${property.property_image[currentImageIndex].image}`}
            alt={property.property_image[currentImageIndex].alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="k absolute top-1/2 left-1/2 -translate-1/2 ">
            ບໍ່ມີຮູບພາບ
          </div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {property.property_image.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleLike}
            className="bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          >
            <Heart
              className={`w-6 h-6 ${
                isFavorite ? "text-red-500 fill-current" : "text-gray-700"
              }`}
            />
          </button>
          <button
            onClick={handleShare}
            className="bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          >
            <Share2 className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {property.name}
              </h1>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>
                  {property.village}
                  {property.district}
                  {property.province}
                </span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-bold text-indigo-600">
                  {property.price.toLocaleString()}
                  <span className="text-lg text-gray-500">/ເດືອນ</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">
                    {isNaN(averageRating) ? 0 : averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">({review.length} ລີວິວ)</span>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Bed className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="font-semibold">4</div>
                  <div className="text-sm text-gray-500">ຫ້ອງນອນ</div>
                </div>
                <div className="text-center">
                  <Bath className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="font-semibold">2</div>
                  <div className="text-sm text-gray-500">ຫ້ອງນໍ້າ</div>
                </div>
                <div className="text-center">
                  <Car className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="font-semibold">1</div>
                  <div className="text-sm text-gray-500">ບ່ອນຈອດລົດ</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ລາຍລະອຽດ
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">ລີວິວ</h2>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">
                    {isNaN(averageRating) ? 0 : averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ຈາກ {review.length} ລີວິວ
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {review
                  .slice(0, showAllReviews ? review.length : 2)
                  .map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          // src={review.avatar}
                          // alt={review.user.first_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">
                              {review.user.first_name}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.score
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">
                            {review.comment}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(review.created_at).toLocaleDateString(
                              "th-TH"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {review.length > 2 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showAllReviews
                    ? "ສະແດງນ້ອຍລົງ"
                    : `ເບິ່ງລີວິວທັງໝົດ (${review.length})`}
                </button>
              )}

              {/* Add Review Form */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ໃຫ້ຄະແນນ
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    reviewed ? handleReviewEdit() : handleReviewCreate();
                  }}
                  className="space-y-4"
                >
                  {/* Rating Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ໃຫ້ຄະແນນ
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingClick(rating)}
                          className="focus:outline-none transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              rating <= newReview.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 hover:text-yellow-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({newReview.rating} ດາວ)
                      </span>
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label
                      htmlFor="reviewComment"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      ຄວາມຄິດເຫັນ
                    </label>
                    <textarea
                      id="reviewComment"
                      rows={4}
                      value={newReview.comment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNewReview((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      placeholder="ສະແດງຄວາມຄິດເຫັນ..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-x-2">
                    {reviewed && (
                      <button
                        type="button"
                        onClick={deleteReview}
                        disabled={
                          isSubmitting ||
                          !newReview.comment?.trim() ||
                          !newReview.rating
                        }
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          isSubmitting ||
                          !newReview.comment?.trim() ||
                          !newReview.rating
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                      >
                        {isSubmitting ? "ກຳລັງລົບ..." : reviewed && "ລົບ"}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !newReview.comment?.trim() ||
                        !newReview.rating
                      }
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isSubmitting ||
                        !newReview.comment?.trim() ||
                        !newReview.rating
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isSubmitting
                        ? "ກຳລັງສົ່ງ..."
                        : reviewed
                        ? "ແກ້ໄຂ"
                        : "ສົ່ງ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-2xl font-bold text-gray-800 mb-4">
                  ฿{property.price.toLocaleString()}
                  <span className="text-lg text-gray-500">/ເດືອນ</span>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  ຕິດຕໍ່ເຊົ່າ
                </button>
              </div>

              {/* Landlord Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  ເຈົ້າຂອງເຮືອນ
                </h3>

                <div className="flex space-x-4 mb-4">
                  <img
                    // src={}
                    alt={property.user.first_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {property.user.first_name} {property.user.last_name}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{property.user.email_phone}</span>
                  </div> */}
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{property.user.email_phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleChat();
                  }}
                  className="w-full mt-4 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg font-medium transition-colors"
                >
                  ສົ່ງຂໍ້ຄວາມ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseRentalDetail;
