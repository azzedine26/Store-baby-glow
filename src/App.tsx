import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './data/products';
import { Product, Order, OrderStatus, GenderCategory } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { OrderModal } from './components/OrderModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { OwnerPanel } from './components/OwnerPanel';
import { AddProductModal } from './components/AddProductModal';
import { Footer } from './components/Footer';
import { MessageCircle, Sparkles, AlertCircle, PlusCircle, CheckCircle2, Image as ImageIcon, Edit3, Filter } from 'lucide-react';
import { getStoredOwnerWhatsApp, setStoredOwnerWhatsApp } from './utils/whatsapp';

export default function App() {
  // Products & Inventory state with localStorage persistence (both custom products and stock counts)
  const [products, setProducts] = useState<Product[]>(() => {
    let initialList = [...PRODUCTS];

    // Load any custom added products
    try {
      const savedCustom = localStorage.getItem('babyglow_custom_products');
      if (savedCustom) {
        const parsedCustom = JSON.parse(savedCustom);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          initialList = [...parsedCustom, ...initialList];
        }
      }
    } catch {
      // ignore
    }

    // Apply saved stock updates
    try {
      const savedStock = localStorage.getItem('babyglow_products_stock');
      if (savedStock) {
        const parsed = JSON.parse(savedStock);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return initialList.map((p) => {
            const match = parsed.find((item: { id: number; stock?: number }) => item.id === p.id);
            return match !== undefined && typeof match.stock === 'number'
              ? { ...p, stock: match.stock }
              : p;
          });
        }
      }
    } catch {
      // ignore
    }
    return initialList;
  });

  useEffect(() => {
    try {
      const stockToSave = products.map((p) => ({ id: p.id, stock: p.stock }));
      localStorage.setItem('babyglow_products_stock', JSON.stringify(stockToSave));
    } catch {
      // ignore
    }
  }, [products]);

  const [selectedGender, setSelectedGender] = useState<GenderCategory>('الكل');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Orders State with localStorage persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('babyglow_orders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [
      {
        orderId: 'BG-4821',
        productId: 1,
        productName: 'طقم قطن للمولود (5 قطع)',
        productPrice: 3200,
        size: '0-3 أشهر (بيج رملي)',
        fullName: 'أمينة بلقاسم',
        phone: '0555123456',
        deliveryType: 'مكتب',
        wilaya: '16 - الجزائر العاصمة (Alger)',
        location: 'مكتب يالدين زرالدة',
        timestamp: 'اليوم، 10:30 صباحاً',
        totalAmount: 3500,
        shippingCost: 300,
        status: 'جديد'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('babyglow_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Modals state
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState<boolean>(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [ownerWhatsApp, setOwnerWhatsApp] = useState<string>(() => getStoredOwnerWhatsApp());

  const handleUpdateOwnerWhatsApp = (newPhone: string) => {
    setOwnerWhatsApp(newPhone);
    setStoredOwnerWhatsApp(newPhone);
  };

  // Count custom uploaded products
  const customProducts = products.filter((p) => p.isCustom);

  // Gender counts
  const boysCount = products.filter((p) => p.gender === 'ذكور').length;
  const girlsCount = products.filter((p) => p.gender === 'إناث').length;
  const unisexCount = products.filter((p) => p.gender === 'للجنسين' || !p.gender).length;

  // Extract unique categories dynamically
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products by gender, category, custom toggle, and search
  const filteredProducts = products.filter((product) => {
    const matchesGender =
      selectedGender === 'الكل'
        ? true
        : selectedGender === 'للجنسين'
        ? product.gender === 'للجنسين' || !product.gender
        : product.gender === selectedGender;

    const matchesCategory =
      selectedCategory === 'الكل'
        ? true
        : selectedCategory === 'منتجاتي المحمّلة'
        ? product.isCustom === true
        : product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.fabric.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesGender && matchesCategory && matchesSearch;
  });

  // Open Add Product (New)
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsAddProductModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddProductModalOpen(true);
  };

  // Save Product (Handles both Add new and Edit existing)
  const handleSaveProduct = (savedProduct: Product, isEditing: boolean) => {
    if (isEditing) {
      // Update in products state
      setProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );

      // Update in localStorage custom products if custom
      try {
        const savedCustom = localStorage.getItem('babyglow_custom_products');
        if (savedCustom) {
          const currentCustom: Product[] = JSON.parse(savedCustom);
          const updatedCustom = currentCustom.map((p) =>
            p.id === savedProduct.id ? savedProduct : p
          );
          // If not in custom list yet, add it
          const exists = updatedCustom.some((p) => p.id === savedProduct.id);
          if (!exists) {
            updatedCustom.unshift(savedProduct);
          }
          localStorage.setItem('babyglow_custom_products', JSON.stringify(updatedCustom));
        } else {
          localStorage.setItem('babyglow_custom_products', JSON.stringify([savedProduct]));
        }
      } catch {
        // ignore
      }

      setSuccessToast(`تم تحديث بيانات وصورة منتج "${savedProduct.name}" بنجاح! 💾`);
    } else {
      // Add new product
      setProducts((prev) => [savedProduct, ...prev]);

      // Save to custom products in localStorage
      try {
        const savedCustom = localStorage.getItem('babyglow_custom_products');
        const currentCustom = savedCustom ? JSON.parse(savedCustom) : [];
        localStorage.setItem(
          'babyglow_custom_products',
          JSON.stringify([savedProduct, ...currentCustom])
        );
      } catch {
        // ignore
      }

      setSuccessToast(`تمت إضافة منتج "${savedProduct.name}" بنجاح مع صورته! ✨`);
    }

    // Reset and close
    setEditingProduct(null);
    setIsAddProductModalOpen(false);

    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  // Handle deleting a custom added product
  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      const savedCustom = localStorage.getItem('babyglow_custom_products');
      if (savedCustom) {
        const currentCustom: Product[] = JSON.parse(savedCustom);
        const filtered = currentCustom.filter((p) => p.id !== productId);
        localStorage.setItem('babyglow_custom_products', JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
    setSuccessToast('تم حذف المنتج من المتجر بنجاح.');
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // When a new order is created, automatically decrease product stock by 1
  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Deduct stock from the inventory
    setProducts((prev) =>
      prev.map((p) =>
        p.id === newOrder.productId
          ? { ...p, stock: Math.max(0, p.stock - 1) }
          : p
      )
    );
  };

  // Update order status with optional stock restoration on rejection/cancellation
  const handleUpdateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    restoreStockProductId?: number
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
    );

    // If order was rejected or cancelled and requested stock restoration
    if (restoreStockProductId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === restoreStockProductId ? { ...p, stock: p.stock + 1 } : p
        )
      );
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
  };

  const handleClearAllOrders = () => {
    setOrders([]);
  };

  // Update individual product stock
  const handleUpdateStock = (productId: number, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  };

  // Restock / batch add to stock
  const handleRestockAll = (amount: number) => {
    setProducts((prev) =>
      prev.map((p) => ({ ...p, stock: p.stock + amount }))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F2F7FC] via-[#FDF5F8] to-[#EEF5FB] text-[#1C2D3D] font-['Tajawal',sans-serif]">
      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#1C4263] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#3B7CA8] animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#86EFAC] shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        ordersCount={orders.length}
        onOpenOwnerPanel={() => setIsOwnerPanelOpen(true)}
        onOpenAddProduct={handleOpenAddProduct}
      />

      {/* Hero Section */}
      <Hero
        selectedGender={selectedGender}
        onSelectGender={setSelectedGender}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        customCount={customProducts.length}
        boysCount={boysCount}
        girlsCount={girlsCount}
        unisexCount={unisexCount}
      />

      {/* Main Products Grid Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FCE7EF] border border-[#F7D2DF] flex items-center justify-center text-[#D86688] shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-['El_Messiri',serif] font-bold text-2xl sm:text-3xl text-[#235D86]">
              {selectedGender === 'ذكور'
                ? 'تشكيلة ملابس الذكور (الأولاد) 👦💙'
                : selectedGender === 'إناث'
                ? 'تشكيلة ملابس الإناث (البنات) 👧🌸'
                : selectedGender === 'للجنسين'
                ? 'تشكيلة المواليد المحايدة (للجنسين) 👶🤍'
                : selectedCategory === 'منتجاتي المحمّلة'
                ? 'منتجاتي المحمّلة مع صورها'
                : 'كافة التشكيلة المتوفرة'}
            </h2>
            <span className="text-xs sm:text-sm font-bold text-[#55738E] bg-white px-3 py-1 rounded-full border border-[#D3E3F0] shadow-xs">
              {filteredProducts.length} قطع
            </span>

            {selectedGender !== 'الكل' && (
              <button
                onClick={() => setSelectedGender('الكل')}
                className="text-xs text-[#55738E] hover:text-[#1C2D3D] bg-[#EEF6FC] hover:bg-[#E2EFFB] px-2.5 py-1 rounded-full border border-[#D3E3F0] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>عرض الكل</span>
                <span>✕</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Quick Upload Product CTA Button */}
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D86688] to-[#C24F73] hover:from-[#C24F73] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#FDE8F1]" />
              <span>تحميل منتج جديد مع صورة</span>
            </button>

            {/* Manage/Edit Uploaded Products Button */}
            <button
              onClick={() => {
                setIsOwnerPanelOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#235D86] bg-white border border-[#D3E3F0] hover:bg-[#EAF3FA] hover:border-[#8EBFDE] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#2E6F9E]" />
              <span>تعديل المنتجات والمخزن</span>
            </button>
          </div>
        </div>

        {/* Empty state if search or filter returns nothing */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D3E3F0] shadow-sm max-w-md mx-auto my-8">
            {selectedCategory === 'منتجاتي المحمّلة' ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[#FDF2F6] border border-[#F7D2DF] flex items-center justify-center text-[#D86688] mx-auto mb-3">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="font-['El_Messiri',serif] font-bold text-xl text-[#1C2D3D] mb-2">
                  لا توجد منتجات محمّلة حتى الآن
                </h3>
                <p className="text-xs sm:text-sm text-[#617487] mb-5">
                  اضغطي على زر "تحميل منتج جديد" لرفع صور ملابسك الخاصة وإضافتها للمتجر.
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="bg-gradient-to-r from-[#D86688] to-[#C24F73] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:shadow-md transition-all active:scale-95"
                >
                  تحميل أول منتج مع صورة
                </button>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 text-[#E27D9A] mx-auto mb-3" />
                <h3 className="font-['El_Messiri',serif] font-bold text-xl text-[#1C2D3D] mb-2">
                  لم نعثر على نتائج مطابقة
                </h3>
                <p className="text-xs sm:text-sm text-[#617487] mb-5">
                  جربي البحث بكلمات أخرى أو عرض كافة التشكيلة.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('الكل');
                    setSearchQuery('');
                  }}
                  className="bg-gradient-to-r from-[#2E6F9E] to-[#235D86] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:shadow-md transition-all active:scale-95"
                >
                  عرض جميع المنتجات
                </button>
              </>
            )}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOrder={(p) => setOrderingProduct(p)}
                onViewDetails={(p) => setDetailsProduct(p)}
                onEdit={(p) => handleOpenEditProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href="https://wa.me/213550000000?text=%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%84%D8%A7%D8%A8%D8%B3%20BABY%20glow"
        target="_blank"
        rel="noreferrer"
        title="تواصل معنا عبر واتساب"
        className="fixed bottom-5 left-5 z-40 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3.5 sm:p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-white"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Upload / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSaveProduct={handleSaveProduct}
        productToEdit={editingProduct}
        existingCategories={categories}
      />

      {/* Order Modal */}
      <OrderModal
        product={orderingProduct}
        isOpen={!!orderingProduct}
        onClose={() => setOrderingProduct(null)}
        onOrderCreated={handleCreateOrder}
        ownerWhatsApp={ownerWhatsApp}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={detailsProduct}
        isOpen={!!detailsProduct}
        onClose={() => setDetailsProduct(null)}
        onOrder={(p) => setOrderingProduct(p)}
        onEditProduct={(p) => handleOpenEditProduct(p)}
      />

      {/* Owner Panel Drawer with Dedicated Uploaded Products & Edit Section */}
      <OwnerPanel
        isOpen={isOwnerPanelOpen}
        onClose={() => setIsOwnerPanelOpen(false)}
        orders={orders}
        products={products}
        onUpdateStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onClearAllOrders={handleClearAllOrders}
        onUpdateStock={handleUpdateStock}
        onRestockAll={handleRestockAll}
        onOpenAddProduct={() => {
          setEditingProduct(null);
          setIsAddProductModalOpen(true);
        }}
        onEditProduct={(p) => {
          handleOpenEditProduct(p);
        }}
        onDeleteProduct={handleDeleteProduct}
        onViewProductDetails={(p) => setDetailsProduct(p)}
        ownerWhatsApp={ownerWhatsApp}
        onUpdateOwnerWhatsApp={handleUpdateOwnerWhatsApp}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
