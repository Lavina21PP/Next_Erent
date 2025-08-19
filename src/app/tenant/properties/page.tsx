'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Bed, Bath, Car, Heart, Filter, Grid, List } from 'lucide-react';

// อินเทอร์เฟซสำหรับข้อมูลคุณสมบัติ
interface Property {
  id: number;
  title: string;
  location: string;
  district: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  type: string;
  images: string[];
  amenities: string[];
  description: string;
  available: boolean;
  furnishing: string;
}

// อินเทอร์เฟซสำหรับ props ของ PropertyCard
interface PropertyCardProps {
  property: Property;
}

// อินเทอร์เฟซสำหรับ props ของ PropertyRow
interface PropertyRowProps {
  property: Property;
}

const RentalPropertiesList: React.FC = () => {
  // States สำหรับการค้นหาและฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // State สำหรับรายการคุณสมบัติที่ถูกใจ
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Ref สำหรับเก็บตำแหน่งการ scroll ก่อนการอัปเดต state
  const scrollPositionRef = useRef<number>(0); 

  // ข้อมูลคุณสมบัติ (ตัวอย่าง)
  const properties: Property[] = [
    {
      id: 1,
      title: 'Modern Condo in Asoke',
      location: 'Asoke, Bangkok',
      district: 'Watthana',
      price: 25000,
      bedrooms: 2,
      bathrooms: 2,
      area: 65,
      parking: 1,
      type: 'Condo',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'],
      amenities: ['Swimming Pool', 'Gym', 'Security', 'BTS nearby'],
      description: 'Beautiful modern condo with city view, fully furnished',
      available: true,
      furnishing: 'Fully Furnished'
    },
    {
      id: 2,
      title: 'Luxury House in Thonglor',
      location: 'Thonglor, Bangkok',
      district: 'Watthana',
      price: 80000,
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
      parking: 2,
      type: 'House',
      images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'],
      amenities: ['Private Pool', 'Garden', 'Maid Room', 'Security'],
      description: 'Spacious luxury house with private garden and pool',
      available: true,
      furnishing: 'Fully Furnished'
    },
    {
      id: 3,
      title: 'Cozy Apartment in Ekkamai',
      location: 'Ekkamai, Bangkok',
      district: 'Watthana',
      price: 18000,
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      parking: 1,
      type: 'Apartment',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
      amenities: ['BTS nearby', 'Shopping Mall', 'Restaurants'],
      description: 'Cozy studio apartment perfect for young professionals',
      available: true,
      furnishing: 'Partially Furnished'
    },
    {
      id: 4,
      title: 'Penthouse in Silom',
      location: 'Silom, Bangkok',
      district: 'Bang Rak',
      price: 120000,
      bedrooms: 3,
      bathrooms: 3,
      area: 150,
      parking: 2,
      type: 'Penthouse',
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
      amenities: ['Rooftop Terrace', 'City View', 'Premium Gym', 'Concierge'],
      description: 'Stunning penthouse with panoramic city views',
      available: true,
      furnishing: 'Fully Furnished'
    },
    {
      id: 5,
      title: 'Townhouse in Sukhumvit',
      location: 'Sukhumvit 71, Bangkok',
      district: 'Watthana',
      price: 45000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      parking: 2,
      type: 'Townhouse',
      images: ['https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400'],
      amenities: ['Private Parking', 'Near BTS', 'Shopping Centers'],
      description: 'Comfortable townhouse in prime Sukhumvit location',
      available: false,
      furnishing: 'Unfurnished'
    },
    {
      id: 6,
      title: 'Studio in Ari',
      location: 'Ari, Bangkok',
      district: 'Chatuchak',
      price: 12000,
      bedrooms: 1,
      bathrooms: 1,
      area: 30,
      parking: 0,
      type: 'Studio',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
      amenities: ['Near BTS', 'Cafes', 'Local Markets'],
      description: 'Compact studio in trendy Ari neighborhood',
      available: true,
      furnishing: 'Fully Furnished'
    }
  ];

  // ดึงข้อมูลสถานที่และประเภทคุณสมบัติที่ไม่ซ้ำกัน
  const locations = [...new Set(properties.map(p => p.district))];
  const propertyTypes = [...new Set(properties.map(p => p.type))];

  // กรองคุณสมบัติโดยใช้ useMemo เพื่อประสิทธิภาพ
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
      const matchesLocation = !selectedLocation || property.district === selectedLocation;
      const matchesType = !propertyType || property.type === propertyType;
      const matchesBedrooms = !bedrooms || property.bedrooms.toString() === bedrooms;
      
      return matchesSearch && matchesPrice && matchesLocation && matchesType && matchesBedrooms;
    });
  }, [searchTerm, priceRange, selectedLocation, propertyType, bedrooms, properties]);

  // ฟังก์ชันสำหรับ toggle สถานะถูกใจ
  const toggleFavorite = (id: number): void => {
    // บันทึกตำแหน่งการเลื่อนปัจจุบันของหน้าต่างก่อนการอัปเดต state
    scrollPositionRef.current = window.scrollY;

    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  // useEffect สำหรับกู้คืนตำแหน่งการเลื่อนหลังการ render
  useEffect(() => {
    if (scrollPositionRef.current > 0) {
      // กู้คืนตำแหน่งการเลื่อนของหน้าต่าง
      window.scrollTo(0, scrollPositionRef.current);
      // รีเซ็ต ref หลังจากกู้คืนเพื่อป้องกันการเลื่อนที่ไม่ต้องการ
      scrollPositionRef.current = 0;
    }
  }, [filteredProperties, viewMode, favorites]); // เพิ่ม favorites ใน dependency array

  // ฟังก์ชันสำหรับจัดรูปแบบราคา
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  // คอมโพเนนต์ PropertyCard สำหรับการแสดงผลแบบ Grid
  const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={property.images[0]} 
          alt={property.title}
          // ปรับขนาดรูปภาพ responsive: เต็มความกว้างบนมือถือ, คงที่ 48h บนจอใหญ่
          className="w-full h-48 object-cover sm:h-48" 
        />
        <div className="absolute top-3 right-3">
          <button
            onClick={() => toggleFavorite(property.id)}
            className={`p-2 rounded-full transition-colors ${
              favorites.has(property.id) 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart size={16} className={favorites.has(property.id) ? 'fill-current' : ''} />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            property.available 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {property.available ? 'Available' : 'Rented'}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
            {property.type}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm sm:text-base">{property.location}</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-gray-600 mb-3">
          <div className="flex items-center">
            <Bed size={16} className="mr-1" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center">
            <Bath size={16} className="mr-1" />
            <span>{property.bathrooms} bath</span>
          </div>
          {property.parking > 0 && (
            <div className="flex items-center">
              <Car size={16} className="mr-1" />
              <span>{property.parking} car</span>
            </div>
          )}
          <div className="flex items-center">
            <span>{property.area} sqm</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">{property.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs sm:text-sm">
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-gray-500 text-xs sm:text-sm">+{property.amenities.length - 3} more</span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">
              ฿{formatPrice(property.price)}
            </span>
            <span className="text-gray-500 text-sm sm:text-base ml-1">/month</span>
            <div className="text-xs sm:text-sm text-gray-500">{property.area} sqm</div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  // คอมโพเนนต์ PropertyRow สำหรับการแสดงผลแบบ List
  const PropertyRow: React.FC<PropertyRowProps> = ({ property }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-48 object-cover rounded-lg sm:w-24 sm:h-24"
        />
        <div className="flex-1 p-2 sm:p-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg sm:text-xl text-gray-900">{property.title}</h3>
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`p-1 rounded-full ${
                favorites.has(property.id) ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <Heart size={16} className={favorites.has(property.id) ? 'fill-current' : ''} />
            </button>
          </div>
          
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin size={14} className="mr-1" />
            <span className="text-sm sm:text-base">{property.location}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-4 gap-y-1 text-sm sm:text-base text-gray-600 mb-2">
            <div className="flex items-center">
              <Bed size={14} className="mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath size={14} className="mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <span>{property.area} sqm</span>
            <span className="text-blue-600 font-medium">฿{formatPrice(property.price)}/month</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6"> 
        {/* Header */}
        <div className="mb-8 sm:p-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Rental Properties (รายการบ้านให้เช่า)
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Find your perfect rental home in Bangkok</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">All Districts</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* Property Type Filter */}
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Bedrooms Filter */}
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 p-2 flex items-center justify-center text-sm sm:text-base ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 p-2 flex items-center justify-center text-sm sm:text-base ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Price Range: ฿{formatPrice(priceRange[0])} - ฿{formatPrice(priceRange[1])}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="range"
                min="0"
                max="150000"
                step="5000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="150000"
                step="5000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 text-center sm:text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {filteredProperties.length} Properties Found
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {filteredProperties.filter(p => p.available).length} available for rent
            </p>
          </div>
        </div>

        {/* Properties Grid/List */}
        <div> 
            {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                <PropertyCard
                    key={property.id}
                    property={property}
                />
                ))}
            </div>
            ) : (
            <div className="space-y-4">
                {filteredProperties.map(property => (
                <PropertyRow
                    key={property.id}
                    property={property}
                />
                ))}
            </div>
            )}
        </div>

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more properties.
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h4 className="text-2xl font-bold text-blue-600">{properties.length}</h4>
            <p className="text-blue-800 text-sm sm:text-base">Total Properties</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <h4 className="text-2xl font-bold text-green-600">
              {properties.filter(p => p.available).length}
            </h4>
            <p className="text-green-800 text-sm sm:text-base">Available</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <h4 className="text-2xl font-bold text-purple-600">{locations.length}</h4>
            <p className="text-purple-800 text-sm sm:text-base">Districts</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-6 text-center">
            <h4 className="text-2xl font-bold text-orange-600">
              ฿{formatPrice(Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length))}
            </h4>
            <p className="text-orange-800 text-sm sm:text-base">Avg. Price</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalPropertiesList;
