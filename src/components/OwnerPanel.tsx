import React, { useState, useEffect } from 'react';
import { Order, Product, OrderStatus } from '../types';
import { BabyIcon } from './BabyIcons';
import logoImage from '../assets/images/baby_glow_logo_1787930092615.jpg';
import { 
  X, Phone, MessageCircle, Trash2, CheckCircle2, XCircle, Clock, 
  Truck, PackageCheck, Download, Search, 
  Plus, Minus, AlertTriangle, PackageX, Boxes,
  Edit3, Image as ImageIcon, Sparkles, Eye, Ruler, Palette, Settings, Check, Send
} from 'lucide-react';
import { 
  sendOrderToWhatsApp, 
  generateOrderWhatsAppMessage, 
  generateCustomerConfirmationMessage, 
  getStoredOwnerWhatsApp, 
  setStoredOwnerWhatsApp, 
  formatWhatsAppPhone 
} from '../utils/whatsapp';
import { StockControl } from './StockControl';

interface OwnerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  onUpdateStatus: (orderId: string, status: OrderStatus, restoreStockProductId?: number) => void;
  onDeleteOrder: (orderId: string) => void;
  onClearAllOrders: () => void;
  onUpdateStock: (productId: number, newStock: number) => void;
  onRestockAll: (amount: number) => void;
  onOpenAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: number) => void;
  onViewProductDetails?: (product: Product) => void;
  ownerWhatsApp?: string;
  onUpdateOwnerWhatsApp?: (num: string) => void;
}

export const OwnerPanel: React.FC<OwnerPanelProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  onUpdateStatus,
  onDeleteOrder,
  onClearAllOrders,
  onUpdateStock,
  onRestockAll,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewProductDetails,
  ownerWhatsApp,
  onUpdateOwnerWhatsApp
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'custom_products'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [customSearch, setCustomSearch] = useState<string>('');
  const [productToDeleteConfirm, setProductToDeleteConfirm] = useState<Product | null>(null);

  // WhatsApp settings state
  const [targetWhatsApp, setTargetWhatsApp] = useState<string>(ownerWhatsApp || getStoredOwnerWhatsApp());
  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState<boolean>(false);
  const [savedPhoneToast, setSavedPhoneToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveWhatsAppPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredOwnerWhatsApp(targetWhatsApp);
    if (onUpdateOwnerWhatsApp) {
      onUpdateOwnerWhatsApp(targetWhatsApp);
    }
    setSavedPhoneToast(true);
    setTimeout(() => setSavedPhoneToast(false), 3000);
  };

  const handleSendTestWhatsApp = () => {
    const testMsg = `مرحباً متجر BABY glow 👶✨\nهذه رسالة اختبار للتأكد من ربط رقم الواتساب (${targetWhatsApp}) بنجاح لاستقبال كافة الطلبيات المؤكدة آلياً.`;
    const formatted = formatWhatsAppPhone(targetWhatsApp);
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(testMsg)}`, '_blank');
  };

  // Custom uploaded products list
  const customProducts = products.filter(p => p.isCustom);

  // Filter Custom Products
  const filteredCustomProducts = customProducts.filter(p => 
    p.name.toLowerCase().includes(customSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(customSearch.toLowerCase()) ||
    (p.desc && p.desc.toLowerCase().includes(customSearch.toLowerCase()))
  );

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'الكل' || o.status === filterStatus;
    const matchesSearch =
      o.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery) ||
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.wilaya.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter Products for Inventory
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.category.toLowerCase().includes(inventorySearch.toLowerCase());
    
    if (inventoryFilter === 'out_of_stock') {
      return matchesSearch && p.stock <= 0;
    }
    if (inventoryFilter === 'low_stock') {
      return matchesSearch && p.stock > 0 && p.stock <= 3;
    }
    if (inventoryFilter === 'in_stock') {
      return matchesSearch && p.stock > 3;
    }
    return matchesSearch;
  });

  // Orders statistics
  const pendingOrdersCount = orders.filter(o => o.status === 'جديد').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'مؤكد').length;
  const rejectedOrdersCount = orders.filter(o => o.status === 'مرفوض' || o.status === 'ملغى').length;
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.status !== 'مرفوض' && curr.status !== 'ملغى' ? curr.totalAmount : 0), 0);

  // Inventory statistics
  const totalStockPieces = products.reduce((acc, curr) => acc + curr.stock, 0);
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 3).length;

  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['رقم الطلب', 'المنتج', 'المقاس', 'الزبون', 'الهاتف', 'الولاية', 'نوع التوصيل', 'العنوان', 'المبلغ', 'الحالة', 'التاريخ'];
    const rows = orders.map(o => [
      o.orderId,
      `"${o.productName}"`,
      `"${o.size}"`,
      `"${o.fullName}"`,
      `"${o.phone}"`,
      `"${o.wilaya}"`,
      `"${o.deliveryType}"`,
      `"${o.location}"`,
      o.totalAmount,
      o.status,
      `"${o.timestamp}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `طلبات_بيبي_جلو_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'جديد':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" /> بانتظار التأكيد
          </span>
        );
      case 'مؤكد':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> طلب مؤكد ✅
          </span>
        );
      case 'مرفوض':
        return (
          <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-700" /> طلب مرفوض ❌
          </span>
        );
      case 'في الطريق':
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-700" /> في الطريق للشحن
          </span>
        );
      case 'تم التسليم':
        return (
          <span className="bg-teal-100 text-teal-900 border border-teal-300 text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <PackageCheck className="w-3 h-3 text-teal-700" /> تم التسليم للزبون
          </span>
        );
      case 'ملغى':
        return (
          <span className="bg-stone-200 text-stone-700 border border-stone-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
            ملغى
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0E1E2E]/60 backdrop-blur-xs flex justify-start z-50 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#FAFBFD] h-full shadow-2xl border-l border-[#D3E3F0] flex flex-col z-10 text-right overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#D3E3F0] bg-[#EDF5FB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#D3E3F0] p-0.5 shadow-2xs overflow-hidden shrink-0">
              <img
                src={logoImage}
                alt="BABY glow"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['El_Messiri',serif] font-bold text-xl sm:text-2xl text-[#1C4263]">
                  لوحة تحكم المتجر والمنتجات
                </h3>
                {pendingOrdersCount > 0 && (
                  <span className="bg-gradient-to-r from-[#D86688] to-[#E27D9A] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full animate-bounce shadow-2xs">
                    {pendingOrdersCount} جديد!
                  </span>
                )}
              </div>
              <p className="text-xs text-[#617487]">
                إدارة الطلبيات، تعديل المنتجات المحمّلة مع صورها، وضبط المخزون
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#E2EFFB] text-[#55738E] hover:text-[#1C2D3D] flex items-center justify-center transition-colors shadow-2xs border border-[#D3E3F0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (3 Tabs) */}
        <div className="flex border-b border-[#D3E3F0] bg-[#F2F7FC] p-2 gap-1.5 overflow-x-auto">
          {/* Tab 1: Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-[#2E6F9E] to-[#235D86] text-white shadow-xs'
                : 'bg-white text-[#55697D] hover:bg-[#EDF5FB]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>الطلبيات</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'orders' ? 'bg-white/25 text-white' : 'bg-[#EDF5FB] text-[#235D86]'}`}>
              {orders.length}
            </span>
          </button>

          {/* Tab 2: Custom Uploaded Products with Edit */}
          <button
            onClick={() => setActiveTab('custom_products')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'custom_products'
                ? 'bg-gradient-to-r from-[#D86688] to-[#C24F73] text-white shadow-xs'
                : 'bg-white text-[#55697D] hover:bg-[#FDF2F6]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#D86688] group-hover:text-white" />
            <span>منتجاتي المحمّلة 📸</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'custom_products' ? 'bg-white/25 text-white' : 'bg-[#FCE7EF] text-[#D86688]'}`}>
              {customProducts.length}
            </span>
          </button>

          {/* Tab 3: Inventory */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-r from-[#2E6F9E] to-[#235D86] text-white shadow-xs'
                : 'bg-white text-[#55697D] hover:bg-[#EDF5FB]'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>المخزن العام</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'inventory' ? 'bg-white/25 text-white' : 'bg-[#EDF5FB] text-[#235D86]'}`}>
              {totalStockPieces}
            </span>
          </button>
        </div>

        {/* TAB 1: ORDERS DASHBOARD */}
        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-[#F2F7FC] border-b border-[#D3E3F0] text-center">
              <div className="bg-white p-2 rounded-xl border border-[#D3E3F0] shadow-2xs">
                <span className="text-[10px] text-[#617487] block font-bold">الجديدة ⏳</span>
                <span className="font-['El_Messiri',serif] font-black text-base text-amber-700">
                  {pendingOrdersCount}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#D3E3F0] shadow-2xs">
                <span className="text-[10px] text-[#617487] block font-bold">المؤكدة ✅</span>
                <span className="font-['El_Messiri',serif] font-black text-base text-emerald-700">
                  {confirmedOrdersCount}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#D3E3F0] shadow-2xs">
                <span className="text-[10px] text-[#617487] block font-bold">المرفوضة ❌</span>
                <span className="font-['El_Messiri',serif] font-black text-base text-rose-700">
                  {rejectedOrdersCount}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#D3E3F0] shadow-2xs">
                <span className="text-[10px] text-[#617487] block font-bold">المبيعات 💰</span>
                <span className="font-['El_Messiri',serif] font-black text-xs sm:text-sm text-[#235D86] truncate block">
                  {totalRevenue.toLocaleString('ar-DZ')} د.ج
                </span>
              </div>
            </div>

            {/* WhatsApp Integration Banner & Settings Card */}
            <div className="p-3 bg-gradient-to-r from-[#E9F9EE] to-[#F2FAF4] border-b border-[#BCE8C8]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#14532D] flex items-center gap-1">
                      <span>إرسال الطلبيات مباشرة إلى واتساب</span>
                      <span className="text-[9px] bg-[#25D366] text-white px-1.5 py-0.2 rounded-full font-sans">
                        مفعل ✅
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#166534] truncate">
                      الرقم المستلم: <b className="font-mono text-[#0F381E]" dir="ltr">{targetWhatsApp}</b>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowWhatsAppSettings(!showWhatsAppSettings)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#BCE8C8] text-[#166534] hover:bg-[#DDF3E4] text-xs font-bold flex items-center gap-1 transition-colors shrink-0 shadow-2xs cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{showWhatsAppSettings ? 'إخفاء الإعدادات' : 'تعديل الرقم'}</span>
                </button>
              </div>

              {/* Expandable WhatsApp Settings Form */}
              {showWhatsAppSettings && (
                <form onSubmit={handleSaveWhatsAppPhone} className="mt-3 pt-3 border-t border-[#BCE8C8]/60 space-y-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-[#166534]">
                    أدخل رقم الهاتف الجزائري أو الدولي الذي تريد استقبال الطلبيات عليه:
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={targetWhatsApp}
                        onChange={(e) => setTargetWhatsApp(e.target.value)}
                        placeholder="مثال: 0555123456 أو 213555123456"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#BCE8C8] rounded-xl text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#25D366] font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ الرقم</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSendTestWhatsApp}
                        className="px-3 py-1.5 bg-white hover:bg-[#DDF3E4] text-[#166534] border border-[#BCE8C8] text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>تجربة إرسال</span>
                      </button>
                    </div>
                  </div>
                  {savedPhoneToast && (
                    <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم حفظ رقم الواتساب بنجاح! سيتم توجيه جميع الطلبيات المؤكدة إليه.</span>
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 border-b border-[#D3E3F0] space-y-2 bg-[#FAFBFD]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم، الهاتف، رمز الطلب، الولاية..."
                    className="w-full px-3 py-1.5 pl-8 text-xs bg-white border border-[#D3E3F0] rounded-xl text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-1 focus:ring-[#2E6F9E]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#8A9EB1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {orders.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={exportCSV}
                      title="تصدير جدول Excel / CSV"
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D3E3F0] text-[#2E6F9E] hover:bg-[#EAF3FA] flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button
                      onClick={onClearAllOrders}
                      title="مسح جميع الطلبات السابقة"
                      className="px-2 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {['الكل', 'جديد', 'مؤكد', 'في الطريق', 'تم التسليم', 'مرفوض'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                      filterStatus === st
                        ? 'bg-[#2E6F9E] text-white shadow-2xs'
                        : 'bg-[#EDF5FB] text-[#55697D] hover:bg-[#E2EFFB]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-[#8A9EB1]">
                  <Clock className="w-12 h-12 text-[#8A9EB1] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#55697D]">لا توجد طلبيات مطابقة للبحث</p>
                  <p className="text-xs text-[#8A9EB1] mt-1">الطلبات الجديدة التي يسجلها الزبائن ستظهر فوراً هنا</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const matchingProduct = products.find(p => p.id === order.productId);

                  return (
                    <div
                      key={order.orderId}
                      className="bg-white rounded-2xl p-4 border border-[#D3E3F0] shadow-xs hover:shadow-md transition-shadow space-y-3 text-right"
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#EEF2F6]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#2E6F9E] bg-[#EEF6FC] px-2 py-0.5 rounded-md border border-[#D3E3F0]">
                            {order.orderId}
                          </span>
                          <span className="text-[11px] text-[#7E96AC]">
                            {order.timestamp}
                          </span>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Customer Info & Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#8A9EB1] block">الزبون:</span>
                          <span className="font-bold text-[#1C2D3D] text-sm">{order.fullName}</span>
                        </div>
                        <div>
                          <span className="text-[#8A9EB1] block">الهاتف:</span>
                          <span className="font-mono font-bold text-[#235D86] text-sm" dir="ltr">
                            {order.phone}
                          </span>
                        </div>
                        <div className="sm:col-span-2 bg-[#F8FAFD] p-2 rounded-xl border border-[#EEF2F6]">
                          <span className="text-[#8A9EB1] block">الوجهة والعنوان:</span>
                          <span className="font-bold text-[#1C2D3D]">
                            {order.wilaya} — {order.deliveryType} ({order.location})
                          </span>
                          {order.notes && (
                            <p className="text-[11px] text-[#D86688] mt-1">
                              ملاحظات: {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Product Details & Total */}
                      <div className="p-2.5 bg-[#FAF3F6] rounded-xl border border-[#F6D7E3] flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-[#D86688] font-bold block">
                            المنتج المطلوب:
                          </span>
                          <span className="font-bold text-xs text-[#1C2D3D]">
                            {order.productName} ({order.size})
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-[11px] text-[#7E96AC] block">المبلغ الإجمالي:</span>
                          <span className="font-['El_Messiri',serif] font-bold text-base text-[#235D86]">
                            {order.totalAmount.toLocaleString('ar-DZ')} د.ج
                          </span>
                        </div>
                      </div>

                      {/* Direct Call & WhatsApp Action Buttons */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => sendOrderToWhatsApp(order, targetWhatsApp)}
                            className="flex-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                            title="إرسال فاتورة هذه الطلبية إلى رقم الواتساب الخاص بالمتجر"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>📲 إرسال لواتسابي</span>
                          </button>

                          <a
                            href={`https://wa.me/${formatWhatsAppPhone(order.phone)}?text=${encodeURIComponent(generateCustomerConfirmationMessage(order))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-[#2E6F9E] hover:bg-[#235D86] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            title="مراسلة الزبون على واتساب لتأكيد الشحن"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>💬 تأكيد للزبون</span>
                          </a>

                          <a
                            href={`tel:${order.phone}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            title="اتصال هاتفي بالزبون"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">اتصال</span>
                          </a>

                          <button
                            onClick={() => onDeleteOrder(order.orderId)}
                            title="حذف هذا الطلب"
                            className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Status Update Quick Bar */}
                      <div className="pt-2 border-t border-[#EEF2F6] flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-[#8A9EB1] font-bold ml-1">تحديث الحالة:</span>
                        {(['جديد', 'مؤكد', 'في الطريق', 'تم التسليم', 'مرفوض'] as OrderStatus[]).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              onUpdateStatus(order.orderId, st, matchingProduct?.id);
                              if (st === 'مؤكد') {
                                try {
                                  sendOrderToWhatsApp(order, targetWhatsApp);
                                } catch {
                                  // ignore
                                }
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              order.status === st
                                ? 'bg-[#2E6F9E] text-white shadow-2xs ring-2 ring-[#2E6F9E]/30'
                                : 'bg-[#EDF5FB] text-[#55697D] hover:bg-[#E2EFFB]'
                            }`}
                          >
                            {st === 'مؤكد' ? 'مؤكد ✅' : st === 'في الطريق' ? 'في الطريق 🚚' : st === 'تم التسليم' ? 'تم التسليم 🎁' : st === 'مرفوض' ? 'مرفوض ❌' : 'جديد ⏳'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY UPLOADED PRODUCTS & EDITING (منتجاتي المحمّلة والتعديل عليها) */}
        {activeTab === 'custom_products' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Top Action & Search Bar */}
            <div className="p-3 border-b border-[#D3E3F0] space-y-2 bg-[#FAFBFD]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    placeholder="ابحث في المنتجات التي قمت بتحميلها..."
                    className="w-full px-3 py-1.5 pl-8 text-xs bg-white border border-[#D3E3F0] rounded-xl text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-1 focus:ring-[#D86688]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#8A9EB1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {onOpenAddProduct && (
                  <button
                    onClick={onOpenAddProduct}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D86688] to-[#C24F73] hover:from-[#C24F73] hover:to-[#AC3E60] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تحميل منتج جديد</span>
                  </button>
                )}
              </div>

              {/* Status summary banner */}
              <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-[#FDF2F6] rounded-xl border border-[#F7D2DF] text-[#D86688] font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>إجمالي المنتجات المضافة بصورها: {customProducts.length}</span>
                </span>
                <span className="text-[11px] text-[#55697D] font-normal">
                  يمكنك تعديل أي منتج (الاسم، السعر، الصورة، المخزون)
                </span>
              </div>
            </div>

            {/* List of Custom Uploaded Products */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {filteredCustomProducts.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-[#D3E3F0] m-3">
                  <div className="w-16 h-16 rounded-3xl bg-[#FDF0F5] border border-[#FAD6E4] flex items-center justify-center text-[#D86688] mx-auto mb-3 shadow-xs">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-[#1C2D3D] mb-1">
                    {customProducts.length === 0 
                      ? 'لم تقم برفع أي منتج خاص بك حتى الآن' 
                      : 'لا توجد منتجات مطابقة لكلمة البحث'}
                  </h4>
                  <p className="text-xs text-[#7E96AC] max-w-sm mx-auto mb-4">
                    ارفع صور ملابسك، وحدد الأسعار والكميات والمقاسات، وستتمكن من تعديلها في أي وقت من هذه الخانة.
                  </p>

                  {onOpenAddProduct && (
                    <button
                      onClick={onOpenAddProduct}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2E6F9E] to-[#235D86] hover:from-[#235D86] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>تحميل أول منتج مع صورة الآن</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredCustomProducts.map((product) => {
                  const isZero = product.stock <= 0;
                  const isLow = product.stock > 0 && product.stock <= 3;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl p-4 border border-[#D3E3F0] shadow-sm hover:shadow-md transition-shadow space-y-3 text-right relative overflow-hidden"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        {/* Image & Basic info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div 
                            onClick={() => onViewProductDetails && onViewProductDetails(product)}
                            className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#EEF6FC] via-[#FAF3F6] to-[#FCEEF4] border border-[#DCE8F2] flex items-center justify-center text-[#2E6F9E] shrink-0 overflow-hidden cursor-pointer shadow-2xs group relative"
                          >
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <BabyIcon name={product.icon} className="w-8 h-8" />
                            )}
                            <span className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                              <Eye className="w-4 h-4" />
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              {product.gender && (
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                                    product.gender === 'ذكور'
                                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                                      : product.gender === 'إناث'
                                      ? 'bg-[#FDF2F8] text-[#BE185D] border-[#FBCFE8]'
                                      : 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]'
                                  }`}
                                >
                                  {product.gender === 'ذكور' ? '👦 ذكور' : product.gender === 'إناث' ? '👧 إناث' : '👶 للجنسين'}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-[#D86688] bg-[#FDF2F6] px-2 py-0.2 rounded-md border border-[#F8D7E3]">
                                {product.category}
                              </span>
                              {product.tag && (
                                <span className="text-[9px] font-bold text-[#2E6F9E] bg-[#EAF3FA] px-1.5 py-0.2 rounded border border-[#D3E3F0]">
                                  {product.tag}
                                </span>
                              )}
                            </div>
                            <h4 
                              onClick={() => onViewProductDetails && onViewProductDetails(product)}
                              className="font-bold text-sm text-[#1C2D3D] truncate hover:text-[#2E6F9E] cursor-pointer"
                            >
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-['El_Messiri',serif] font-bold text-sm text-[#235D86]">
                                {product.price.toLocaleString('ar-DZ')} د.ج
                              </span>
                              <span className="text-[11px] text-[#8A9EB1]">·</span>
                              <span className="text-[11px] text-[#617487]">
                                {product.fabric.split(' ')[0]} {product.fabric.split(' ')[1] || ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stock Badge */}
                        <div className="text-left shrink-0">
                          {isZero ? (
                            <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-2.5 py-1 rounded-lg border border-rose-300 inline-flex items-center gap-1">
                              <PackageX className="w-3 h-3" />
                              <span>نفدت الكمية</span>
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-lg border border-amber-300 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{product.stock} فقط</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-1 rounded-lg border border-emerald-300 inline-flex items-center gap-1">
                              <PackageCheck className="w-3 h-3" />
                              <span>{product.stock} متوفرة</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Sizes & Colors preview pills */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] bg-[#F8FAFD] p-2 rounded-xl border border-[#E9F0F8]">
                        <span className="text-[#8A9EB1] font-bold flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-[#2E6F9E]" /> المقاسات:
                        </span>
                        {product.sizes.map((s) => (
                          <span key={s} className="bg-white border border-[#D3E3F0] text-[#55697D] px-1.5 py-0.2 rounded font-medium">
                            {s}
                          </span>
                        ))}

                        <span className="text-[#8A9EB1] font-bold flex items-center gap-1 mr-2">
                          <Palette className="w-3 h-3 text-[#D86688]" /> الألوان:
                        </span>
                        {product.colors.map((c) => (
                          <span key={c} className="bg-white border border-[#D3E3F0] text-[#55697D] px-1.5 py-0.2 rounded font-medium">
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Stock Adjustment Stepper */}
                      <StockControl
                        productId={product.id}
                        stock={product.stock}
                        onUpdateStock={onUpdateStock}
                        label="المخزون الحالي:"
                      />

                      {/* PRIMARY ACTION BUTTONS: EDIT PRODUCT & DELETE */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#EEF2F6]">
                        {/* Edit Button */}
                        {onEditProduct && (
                          <button
                            onClick={() => onEditProduct(product)}
                            className="flex-1 bg-gradient-to-r from-[#2E6F9E] to-[#235D86] hover:from-[#235D86] hover:to-[#1C4B6E] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
                          >
                            <Edit3 className="w-4 h-4 text-[#FDE8F1]" />
                            <span>تعديل بيانات وصورة هذا المنتج</span>
                          </button>
                        )}

                        {/* View in Store Button */}
                        {onViewProductDetails && (
                          <button
                            onClick={() => onViewProductDetails(product)}
                            title="معاينة كما يراها الزبون"
                            className="px-3 py-2.5 rounded-xl bg-white border border-[#D3E3F0] text-[#2E6F9E] hover:bg-[#EAF3FA] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">معاينة</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        {onDeleteProduct && (
                          <button
                            onClick={() => setProductToDeleteConfirm(product)}
                            title="حذف هذا المنتج"
                            className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">حذف</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GENERAL INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#F2F7FC] border-b border-[#D3E3F0] text-center">
              <div className="bg-white p-2 rounded-xl border border-[#D3E3F0] shadow-2xs">
                <span className="text-[10px] text-[#617487] block font-bold">إجمالي القطع 📦</span>
                <span className="font-['El_Messiri',serif] font-black text-base text-[#235D86]">
                  {totalStockPieces}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#D3E3F0] shadow-2xs">
                <span className="text-[10px] text-[#617487] block font-bold">كمية محدودة ⚠️</span>
                <span className="font-['El_Messiri',serif] font-black text-base text-amber-700">
                  {lowStockCount}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#D3E3F0] shadow-2xs">
                <span className="text-[10px] text-[#617487] block font-bold">نفدت من المخزن 🚫</span>
                <span className="font-['El_Messiri',serif] font-black text-base text-rose-700">
                  {outOfStockCount}
                </span>
              </div>
            </div>

            {/* Quick Bulk Restock & Inventory Controls */}
            <div className="p-3 border-b border-[#D3E3F0] space-y-2 bg-[#FAFBFD]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="ابحث عن قطعة أو صنف في المخزن..."
                    className="w-full px-3 py-1.5 pl-8 text-xs bg-white border border-[#D3E3F0] rounded-xl text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-1 focus:ring-[#2E6F9E]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#8A9EB1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {onOpenAddProduct && (
                  <button
                    onClick={onOpenAddProduct}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D86688] to-[#C24F73] hover:from-[#C24F73] hover:to-[#AC3E60] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة منتج</span>
                  </button>
                )}

                <button
                  onClick={() => onRestockAll(10)}
                  title="إضافة 10 قطع لمخزون جميع المنتجات"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2E6F9E] to-[#235D86] hover:from-[#235D86] hover:to-[#1C4B6E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+10 للكل</span>
                </button>
              </div>

              {/* Inventory Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {[
                  { label: 'كافة المنتجات', value: 'all', count: products.length },
                  { label: 'متوفر بكثرة', value: 'in_stock', count: products.filter(p => p.stock > 3).length },
                  { label: 'كمية محدودة (≤3)', value: 'low_stock', count: lowStockCount },
                  { label: 'نفدت من المخزن', value: 'out_of_stock', count: outOfStockCount }
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setInventoryFilter(f.value as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                      inventoryFilter === f.value
                        ? 'bg-[#2E6F9E] text-white shadow-2xs'
                        : 'bg-[#EDF5FB] text-[#55697D] hover:bg-[#E2EFFB]'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${inventoryFilter === f.value ? 'bg-white/25' : 'bg-[#D3E3F0]'}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Items List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-[#8A9EB1]">
                  <Boxes className="w-12 h-12 text-[#8A9EB1] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#55697D]">لا توجد قطع مطابقة للبحث</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isZero = product.stock <= 0;
                  const isLow = product.stock > 0 && product.stock <= 3;

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-2xl p-3.5 border shadow-2xs transition-all space-y-3 ${
                        isZero 
                          ? 'border-rose-300 bg-rose-50/15' 
                          : isLow 
                          ? 'border-amber-300 bg-amber-50/15' 
                          : 'border-[#D3E3F0]'
                      }`}
                    >
                      {/* Product Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EEF6FC] via-[#FAF3F6] to-[#FCEEF4] border border-[#DCE8F2] flex items-center justify-center text-[#2E6F9E] shrink-0 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <BabyIcon name={product.icon} className="w-7 h-7" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {product.gender && (
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                                  product.gender === 'ذكور'
                                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                                    : product.gender === 'إناث'
                                    ? 'bg-[#FDF2F8] text-[#BE185D] border-[#FBCFE8]'
                                    : 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]'
                                }`}
                              >
                                {product.gender === 'ذكور' ? '👦 ذكور' : product.gender === 'إناث' ? '👧 إناث' : '👶 للجنسين'}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-[#D86688] block">
                              {product.category}
                            </span>
                            {product.isCustom && (
                              <span className="text-[9px] font-bold bg-[#EAF3FA] text-[#2E6F9E] px-1.5 py-0.2 rounded border border-[#D3E3F0]">
                                منتج مضاف 📷
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1C2D3D] truncate">
                            {product.name}
                          </h4>
                          <span className="font-['El_Messiri',serif] font-bold text-xs text-[#235D86]">
                            {product.price.toLocaleString('ar-DZ')} د.ج
                          </span>
                        </div>

                        {/* Current Stock Badge & Custom Actions */}
                        <div className="text-left shrink-0 flex items-center gap-2">
                          {isZero ? (
                            <span className="bg-rose-100 text-rose-800 text-xs font-black px-2.5 py-1 rounded-lg border border-rose-300 inline-flex items-center gap-1">
                              <PackageX className="w-3.5 h-3.5" />
                              <span>0 (نفد)</span>
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-300 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{product.stock} قطع فقط</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-lg border border-emerald-300 inline-flex items-center gap-1">
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>{product.stock} قطعة</span>
                            </span>
                          )}

                          {/* Quick Edit for custom */}
                          {product.isCustom && onEditProduct && (
                            <button
                              onClick={() => onEditProduct(product)}
                              title="تعديل هذا المنتج"
                              className="p-1.5 rounded-lg bg-[#EEF6FC] border border-[#D3E3F0] text-[#2E6F9E] hover:bg-[#E2EFFB] transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#D86688]" />
                            </button>
                          )}

                          {product.isCustom && onDeleteProduct && (
                            <button
                              onClick={() => setProductToDeleteConfirm(product)}
                              title="حذف هذا المنتج المضاف"
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stock Stepper & Quick Adjustment Controls */}
                      <StockControl
                        productId={product.id}
                        stock={product.stock}
                        onUpdateStock={onUpdateStock}
                        label="تعديل الكمية في المخزن:"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Confirmation & Approval Modal for Deleting Product */}
      {productToDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-[#0E1E2E]/75 backdrop-blur-xs flex items-center justify-center p-4 z-[80] animate-in fade-in duration-150"
          onClick={() => setProductToDeleteConfirm(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl p-6 border border-[#D3E3F0] shadow-2xl text-right animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon & Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                <Trash2 className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="font-['El_Messiri',serif] font-bold text-lg text-rose-950">
                  تأكيد والموافقة على حذف المنتج ⚠️
                </h4>
                <p className="text-xs text-[#617487]">
                  يرجى تأكيد رغبتك في حذف هذا المنتج نهائياً من المتجر
                </p>
              </div>
            </div>

            {/* Product Card Preview */}
            <div className="p-3.5 bg-[#FAFBFD] rounded-2xl border border-[#DCE8F2] flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white border border-[#D3E3F0] overflow-hidden flex items-center justify-center text-[#2E6F9E] shrink-0 shadow-2xs">
                {productToDeleteConfirm.image ? (
                  <img
                    src={productToDeleteConfirm.image}
                    alt={productToDeleteConfirm.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <BabyIcon name={productToDeleteConfirm.icon} className="w-7 h-7" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-[#D86688] block">
                  {productToDeleteConfirm.category}
                </span>
                <h5 className="font-bold text-xs sm:text-sm text-[#1C2D3D] truncate">
                  {productToDeleteConfirm.name}
                </h5>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-['El_Messiri',serif] font-bold text-xs text-[#235D86]">
                    {productToDeleteConfirm.price.toLocaleString('ar-DZ')} د.ج
                  </span>
                  <span className="text-[10px] text-[#7E96AC]">
                    · المخزون: {productToDeleteConfirm.stock} قطعة
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-5 flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                تنبيه: بعد الموافقة والحذف، سيتم إزالة هذا المنتج وصوره فوراً ولن يتمكن الزبائن من مشاهدته أو طلبه مجدداً.
              </span>
            </div>

            {/* Approval & Cancellation Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProduct) {
                    onDeleteProduct(productToDeleteConfirm.id);
                  }
                  setProductToDeleteConfirm(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، أوافق على الحذف نهائياً 🗑️</span>
              </button>

              <button
                type="button"
                onClick={() => setProductToDeleteConfirm(null)}
                className="py-3 px-4 rounded-xl border border-[#D3E3F0] hover:bg-[#F2F7FC] text-[#55738E] hover:text-[#1C2D3D] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
