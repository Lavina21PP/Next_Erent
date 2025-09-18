'use client'
import React, { useState, useEffect } from 'react';
import { Bell, Home, User, Calendar, DollarSign, FileText, Settings, AlertTriangle, CheckCircle, Clock, Eye, X } from 'lucide-react';

interface LandlordNotification {
  id: number;
  type: 'new_application' | 'rent_payment' | 'maintenance_request' | 'property_inquiry' | 'lease_expiry' | 'tenant_review' | 'property_alert';
  title: string;
  message: string;
  tenantName?: string;
  propertyTitle?: string;
  propertyLocation?: string;
  amount?: number;
  timestamp: Date;
  isRead: boolean;
  isUrgent: boolean;
  propertyId?: number;
  tenantId?: number;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const LandlordNotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<LandlordNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [showDetails, setShowDetails] = useState<number | null>(null);

  // Sample landlord notifications data
  const sampleNotifications: LandlordNotification[] = [
    {
      id: 1,
      type: 'new_application',
      title: 'ใบสมัครเช่าใหม่',
      message: 'มีผู้สนใจส่งใบสมัครเช่าอสังหาฯ ของคุณ',
      tenantName: 'คุณสมชาย ใจดี',
      propertyTitle: 'คอนโดโมเดิร์นในอโศก',
      propertyLocation: 'อโศก, กรุงเทพฯ',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 นาทีที่แล้ว
      isRead: false,
      isUrgent: true,
      propertyId: 1,
      tenantId: 101,
      actionUrl: '/landlord/applications/1',
      priority: 'high'
    },
    {
      id: 2,
      type: 'rent_payment',
      title: 'ได้รับค่าเช่าแล้ว',
      message: 'ผู้เช่าได้ชำระค่าเช่าประจำเดือนแล้ว',
      tenantName: 'คุณมาลี สวยงาม',
      propertyTitle: 'บ้านหรูในทองหล่อ',
      propertyLocation: 'ทองหล่อ, กรุงเทพฯ',
      amount: 75000,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 ชั่วโมงที่แล้ว
      isRead: false,
      isUrgent: false,
      propertyId: 2,
      tenantId: 102,
      actionUrl: '/landlord/payments/2',
      priority: 'low'
    },
    {
      id: 3,
      type: 'maintenance_request',
      title: 'แจ้งซ่อมด่วน!',
      message: 'ผู้เช่าแจ้งปัญหาน้ำรั่วในห้องครัว - ต้องแก้ไขด่วน',
      tenantName: 'คุณวิชัย มั่นคง',
      propertyTitle: 'อพาร์ตเมนต์สบายๆ ในเอกมัย',
      propertyLocation: 'เอกมัย, กรุงเทพฯ',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 ชั่วโมงที่แล้ว
      isRead: true,
      isUrgent: true,
      propertyId: 3,
      tenantId: 103,
      actionUrl: '/landlord/maintenance/3',
      priority: 'high'
    },
    {
      id: 4,
      type: 'property_inquiry',
      title: 'มีคนสอบถามข้อมูล',
      message: 'มีผู้สนใจ 3 คนสอบถามข้อมูลอสังหาฯ ของคุณ',
      propertyTitle: 'ทาวน์เฮาส์ในสุขุมวิท',
      propertyLocation: 'สุขุมวิท 71, กรุงเทพฯ',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 ชั่วโมงที่แล้ว
      isRead: false,
      isUrgent: false,
      propertyId: 5,
      actionUrl: '/landlord/inquiries/5',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'lease_expiry',
      title: 'สัญญาเช่าใกล้หมดอายุ',
      message: 'สัญญาเช่าจะหมดอายุในอีก 30 วัน - ควรติดต่อผู้เช่า',
      tenantName: 'คุณประพันธ์ เก่งดี',
      propertyTitle: 'สตูดิโอในอารีย์',
      propertyLocation: 'อารีย์, กรุงเทพฯ',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 วันที่แล้ว
      isRead: true,
      isUrgent: false,
      propertyId: 6,
      tenantId: 104,
      actionUrl: '/landlord/leases/6',
      priority: 'medium'
    },
    {
      id: 6,
      type: 'tenant_review',
      title: 'รีวิวใหม่จากผู้เช่า',
      message: 'ผู้เช่าให้คะแนนรีวิว 5 ดาวพร้อมความคิดเห็นดี',
      tenantName: 'คุณสุภาพ ยิ้มแย้ม',
      propertyTitle: 'คอนโดใหม่ในสีลม',
      propertyLocation: 'สีลม, กรุงเทพฯ',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 วันที่แล้ว
      isRead: false,
      isUrgent: false,
      propertyId: 4,
      tenantId: 105,
      actionUrl: '/landlord/reviews/4',
      priority: 'low'
    },
    {
      id: 7,
      type: 'property_alert',
      title: 'แจ้งเตือนอสังหาฯ',
      message: 'อสังหาฯ ของคุณว่างมา 60 วันแล้ว - ควรปรับกลยุทธ์การตลาด',
      propertyTitle: 'เพนต์เฮาส์ในสาทร',
      propertyLocation: 'สาทร, กรุงเทพฯ',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 วันที่แล้ว
      isRead: true,
      isUrgent: false,
      propertyId: 7,
      actionUrl: '/landlord/properties/7',
      priority: 'medium'
    }
  ];

  useEffect(() => {
    setNotifications(sampleNotifications);
  }, []);

  const getNotificationIcon = (type: LandlordNotification['type']) => {
    switch (type) {
      case 'new_application':
        return <FileText className="text-blue-500" size={20} />;
      case 'rent_payment':
        return <DollarSign className="text-green-500" size={20} />;
      case 'maintenance_request':
        return <Settings className="text-orange-500" size={20} />;
      case 'property_inquiry':
        return <Eye className="text-purple-500" size={20} />;
      case 'lease_expiry':
        return <Calendar className="text-yellow-500" size={20} />;
      case 'tenant_review':
        return <User className="text-pink-500" size={20} />;
      case 'property_alert':
        return <AlertTriangle className="text-red-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getNotificationColor = (type: LandlordNotification['type']) => {
    switch (type) {
      case 'new_application':
        return 'border-l-blue-500 bg-blue-50';
      case 'rent_payment':
        return 'border-l-green-500 bg-green-50';
      case 'maintenance_request':
        return 'border-l-orange-500 bg-orange-50';
      case 'property_inquiry':
        return 'border-l-purple-500 bg-purple-50';
      case 'lease_expiry':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'tenant_review':
        return 'border-l-pink-500 bg-pink-50';
      case 'property_alert':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">สูง</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">ปานกลาง</span>;
      case 'low':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">ต่ำ</span>;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    if (days < 7) return `${days} วันที่แล้ว`;
    return timestamp.toLocaleDateString('th-TH');
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const markAsRead = (id: number): void => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = (): void => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: number): void => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'urgent':
        return notification.isUrgent || notification.priority === 'high';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.isUrgent || n.priority === 'high').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Home size={24} />
                การแจ้งเตือนเจ้าของบ้าน
                <span className="text-sm text-gray-600">(Landlord Notifications)</span>
              </h1>
              <p className="text-gray-600 mt-1">
                จัดการการแจ้งเตือนเกี่ยวกับอสังหาฯ และผู้เช่าของคุณ
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  อ่านทั้งหมดแล้ว ({unreadCount})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b px-6">
          <div className="flex space-x-8">
            {[
              { key: 'all', label: 'ทั้งหมด', count: notifications.length },
              { key: 'unread', label: 'ยังไม่อ่าน', count: unreadCount },
              { key: 'urgent', label: 'ด่วน', count: urgentCount }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'unread' | 'urgent')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="px-6 py-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีการแจ้งเตือน</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'อ่านครบแล้ว! ไม่มีการแจ้งเตือนที่ยังไม่อ่าน' : 'ไม่พบการแจ้งเตือน'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    getNotificationColor(notification.type)
                  } ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    setShowDetails(showDetails === notification.id ? null : notification.id);
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {notification.isUrgent && (
                              <AlertTriangle size={16} className="text-red-500" />
                            )}
                            {getPriorityBadge(notification.priority)}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className={`text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-600'} mb-2`}>
                            {notification.message}
                          </p>
                          
                          {notification.tenantName && (
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {notification.tenantName}
                              </span>
                            </div>
                          )}
                          
                          {notification.propertyTitle && (
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span className="font-medium">{notification.propertyTitle}</span>
                              {notification.propertyLocation && (
                                <span className="flex items-center gap-1">
                                  <Home size={12} />
                                  {notification.propertyLocation}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {notification.amount && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-green-600">
                                ฿{formatPrice(notification.amount)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {showDetails === notification.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">รายละเอียดการแจ้งเตือน</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>ประเภท: <span className="capitalize">{notification.type.replace('_', ' ')}</span></div>
                              <div>เวลา: {notification.timestamp.toLocaleString('th-TH')}</div>
                              <div>สถานะ: {notification.isRead ? 'อ่านแล้ว' : 'ยังไม่อ่าน'}</div>
                              <div>ความสำคัญ: {getPriorityBadge(notification.priority)}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {notification.type === 'new_application' && (
                              <>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                                  อนุมัติใบสมัคร
                                </button>
                                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                                  ปฏิเสธใบสมัคร
                                </button>
                                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                  ดูประวัติผู้สมัคร
                                </button>
                              </>
                            )}
                            {notification.type === 'maintenance_request' && (
                              <>
                                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm">
                                  จัดช่างซ่อม
                                </button>
                                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                  ติดต่อผู้เช่า
                                </button>
                              </>
                            )}
                            {notification.type === 'lease_expiry' && (
                              <>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                  ต่อสัญญาเช่า
                                </button>
                                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                  หาผู้เช่าใหม่
                                </button>
                              </>
                            )}
                            {notification.actionUrl && (
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                ดูรายละเอียด
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
                <Bell className="text-gray-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ยังไม่อ่าน</p>
                  <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ด่วน</p>
                  <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
                </div>
                <AlertTriangle className="text-red-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">วันนี้</p>
                  <p className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => {
                      const today = new Date();
                      const notifDate = new Date(n.timestamp);
                      return notifDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <Clock className="text-green-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions for Landlords */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">เมนูด่วนสำหรับเจ้าของบ้าน</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Home className="text-blue-500" size={20} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">จัดการอสังหาฯ</div>
                  <div className="text-sm text-gray-500">ดูและแก้ไขข้อมูลอสังหาฯ</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="text-green-500" size={20} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">จัดการผู้เช่า</div>
                  <div className="text-sm text-gray-500">ดูข้อมูลและสื่อสารกับผู้เช่า</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <DollarSign className="text-purple-500" size={20} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">รายงานการเงิน</div>
                  <div className="text-sm text-gray-500">ดูรายได้และค่าใช้จ่าย</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="text-orange-500" size={20} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">ใบสมัครเช่า</div>
                  <div className="text-sm text-gray-500">ดูและจัดการใบสมัครใหม่</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="text-gray-500" size={20} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">การซ่อมบำรุง</div>
                  <div className="text-sm text-gray-500">จัดการคำร้องซ่อมแซม</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="text-pink-500" size={20} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">สัญญาเช่า</div>
                  <div className="text-sm text-gray-500">ติดตามและต่ออายุสัญญา</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordNotificationsList;