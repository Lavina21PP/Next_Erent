"use client";
import React, { useState, useMemo } from "react";
import { Search, MapPin, Heart, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { PropertyTypeResponse } from "@/components/frontend/landlord/myproperties/Type";
import { manager_property } from "@/services/api";
import { useRole } from "../context/RoleContext";

// อินเทอร์เฟซสำหรับ props ของ PropertyCard
interface PropertyCardProps {
  property: PropertyTypeResponse;
}

const RentalPropertiesList: React.FC<{
  properties: PropertyTypeResponse[];
}> = ({ properties }) => {
  const router = useRouter();
  // States สำหรับการค้นหาและฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState<string>("");

  // กรองคุณสมบัติโดยใช้ useMemo เพื่อประสิทธิภาพ
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.village.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [searchTerm, properties]);

  // ฟังก์ชันสำหรับจัดรูปแบบราคา
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("th-TH").format(price);
  };

  // คอมโพเนนต์ PropertyCard สำหรับการแสดงผลแบบ Grid
  const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    // State สำหรับเก็บสถานะถูกใจ
    const { id } = useRole();

    const [isFavorite, setIsFavorite] = useState<boolean>(
      property.favorite.length > 0
    );
    const [isHandleLike, setIsHandleLike] = useState<boolean>(false);

    // ฟังก์ชันสำหรับ toggle สถานะถูกใจ
    const handleFavoriteToggle = async () => {
      setIsHandleLike(true);
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
        setIsHandleLike(false);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          <img
            src={
              property.coverImage
                ? `http://localhost:5000/image/${property.user.id}/cover_property/${property.uuid}/${property.coverImage}`
                : undefined
            }
            alt={property.name}
            className="w-full h-48 object-cover sm:h-48"
          />
          <div className="absolute top-3 right-3">
            <button
              onClick={handleFavoriteToggle} // เรียกใช้ฟังก์ชันเมื่อคลิก
              className={`p-2 rounded-full transition-colors bg-white/80 text-gray-600 hover:bg-white ${
                isFavorite ? "text-red-500" : "" // เปลี่ยนสีเมื่อเป็น favorite
              }`}
              disabled={isHandleLike}
            >
              <Heart
                size={16}
                fill={isFavorite ? "currentColor" : "none"} // เติมสีเมื่อเป็น favorite
                className={isFavorite ? "text-red-500" : ""}
              />
            </button>
          </div>
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                property.property_status_id === 1
                  ? "bg-green-500 text-white"
                  : property.property_status_id === 2
                  ? "bg-red-500 text-white"
                  : property.property_status_id === 3 &&
                    "bg-orange-500 text-white"
              }`}
            >
              {property.property_status.name}
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              {property.property_type.name}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">
            {property.name}
          </h3>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin size={16} className="mr-1" />
            <span className="text-sm sm:text-base">{property.village}</span>
          </div>

          <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">
            {property.description}
          </p>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                {formatPrice(Number(property.price))}
              </span>
              <span className="text-gray-500 text-sm sm:text-base ml-1">
                /ເດືອນ
              </span>
            </div>
            <button
              onClick={() => router.push(`./properties/detail/${property.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              ລາຍລະອຽດ
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 sm:p-0">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            Rental Properties (ລາຍການເຮືອນເຊົ່າ)
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Find your perfect rental home in Bangkok
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid ">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="k flex justify-between my-3">
          <div className="k font-bold md:text-2xl">ເຮືອນເຊົ່າ</div>
          <div className="k cursor-pointer">ເບີ່ງເຮືອນເຊົ່າທັງໝົດ</div>
        </div>

        {/* Properties Grid/List */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more
              properties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalPropertiesList;
