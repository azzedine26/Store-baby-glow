import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { 
  X, 
  Upload, 
  Plus, 
  Sparkles, 
  Trash2, 
  Check, 
  Link as LinkIcon, 
  Palette, 
  Ruler, 
  AlertCircle,
  Edit3,
  Save,
  Star,
  Image as ImageIcon,
  Layers
} from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: Product, isEditing: boolean) => void;
  productToEdit?: Product | null;
  existingCategories: string[];
}

const COMMON_SIZES = ['حديث الولادة', '0-3 أشهر', '3-6 أشهر', '6-9 أشهر', '9-12 شهر', '12-18 شهر'];
const COMMON_COLORS = ['أزرق سماوي', 'وردي بودري', 'أبيض لؤلؤي', 'بيج رملي', 'عاجي', 'رمادي فاتح'];
const COMMON_TAGS = ['وصل حديثاً ✨', 'الأكثر طلباً ⭐', 'طقم مميز 👶', 'عرض خاص 🎁', 'قطن 100% 🌿'];

const DEFAULT_CATEGORIES = [
  'أطقم ومجموعات',
  'أفرولات وسلوبيتات',
  'قماطات وأغطية',
  'ملابس المناسبات',
  'بيجامات ونوم',
  'إكسسوارات ومستلزمات'
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  productToEdit,
  existingCategories
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(productToEdit);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [gender, setGender] = useState<'ذكور' | 'إناث' | 'للجنسين'>('للجنسين');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [stock, setStock] = useState<string>('10');
  const [desc, setDesc] = useState('');
  const [fabric, setFabric] = useState('100% قطن طبيعي ناعم مضاد للحساسية');
  const [piecesCount, setPiecesCount] = useState<string>('1');
  const [tag, setTag] = useState<string>('وصل حديثاً ✨');
  const [icon, setIcon] = useState<Product['icon']>('onesie');

  // Multiple Images Upload State
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // Sizes & Colors
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['0-3 أشهر', '3-6 أشهر']);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>(['أزرق سماوي', 'وردي بودري']);
  const [newColorInput, setNewColorInput] = useState('');

  // Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setPrice(productToEdit.price ? productToEdit.price.toString() : '');
      setGender(productToEdit.gender || 'للجنسين');
      setCategory(productToEdit.category || DEFAULT_CATEGORIES[0]);
      setIsCustomCategory(false);
      setCustomCategory('');
      setStock(productToEdit.stock !== undefined ? productToEdit.stock.toString() : '10');
      setDesc(productToEdit.desc || '');
      setFabric(productToEdit.fabric || '100% قطن طبيعي');
      setPiecesCount(productToEdit.piecesCount ? productToEdit.piecesCount.toString() : '1');
      setTag(productToEdit.tag || '');
      setIcon(productToEdit.icon || 'onesie');
      
      // Load all images (from images array or fallback to image string)
      if (productToEdit.images && productToEdit.images.length > 0) {
        setImages([...productToEdit.images]);
      } else if (productToEdit.image) {
        setImages([productToEdit.image]);
      } else {
        setImages([]);
      }

      setSelectedSizes(productToEdit.sizes && productToEdit.sizes.length > 0 ? productToEdit.sizes : ['0-3 أشهر']);
      setSelectedColors(productToEdit.colors && productToEdit.colors.length > 0 ? productToEdit.colors : ['أزرق سماوي']);
    } else {
      // Reset defaults for a new product
      setName('');
      setPrice('');
      setGender('للجنسين');
      setCategory(DEFAULT_CATEGORIES[0]);
      setIsCustomCategory(false);
      setCustomCategory('');
      setStock('10');
      setDesc('');
      setFabric('100% قطن طبيعي ناعم مضاد للحساسية');
      setPiecesCount('1');
      setTag('وصل حديثاً ✨');
      setIcon('onesie');
      setImages([]);
      setSelectedSizes(['0-3 أشهر', '3-6 أشهر']);
      setSelectedColors(['أزرق سماوي', 'وردي بودري']);
    }
    setErrorMessage(null);
    setShowUrlInput(false);
    setImageUrlInput('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Combine default and existing categories uniquely
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));

  // Helper to resize single image using canvas
  const resizeSingleImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 900;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('فشل رفع الملف'));
      reader.readAsDataURL(file);
    });
  };

  // Process multiple files
  const processImageFiles = async (files: FileList | File[]) => {
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage('يرجى اختيار ملفات صور صالحة (PNG, JPG, WEBP)');
      return;
    }

    setIsProcessingImages(true);
    setErrorMessage(null);

    try {
      const results = await Promise.all(validFiles.map((f) => resizeSingleImage(f)));
      setImages((prev) => [...prev, ...results]);
    } catch (err) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء معالجة الصور، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const handleApplyUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      setErrorMessage(null);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSetAsPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setImages((prev) => {
      const target = prev[indexToPrimary];
      const rest = prev.filter((_, i) => i !== indexToPrimary);
      return [target, ...rest];
    });
  };

  const handleToggleSize = (sizeStr: string) => {
    if (selectedSizes.includes(sizeStr)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== sizeStr));
      }
    } else {
      setSelectedSizes([...selectedSizes, sizeStr]);
    }
  };

  const handleAddCustomSize = () => {
    const trimmed = newSizeInput.trim();
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
      setNewSizeInput('');
    }
  };

  const handleRemoveSize = (sizeStr: string) => {
    if (selectedSizes.length > 1) {
      setSelectedSizes((prev) => prev.filter((s) => s !== sizeStr));
    }
  };

  const handleToggleColor = (colorStr: string) => {
    if (selectedColors.includes(colorStr)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter((c) => c !== colorStr));
      }
    } else {
      setSelectedColors([...selectedColors, colorStr]);
    }
  };

  const handleAddCustomColor = () => {
    const trimmed = newColorInput.trim();
    if (trimmed && !selectedColors.includes(trimmed)) {
      setSelectedColors((prev) => [...prev, trimmed]);
      setNewColorInput('');
    }
  };

  const handleRemoveColor = (colorStr: string) => {
    if (selectedColors.length > 1) {
      setSelectedColors((prev) => prev.filter((c) => c !== colorStr));
    }
  };

  // Merge default common sizes/colors with any custom ones in selectedSizes/selectedColors
  const displaySizes = Array.from(new Set([...COMMON_SIZES, ...selectedSizes]));
  const displayColors = Array.from(new Set([...COMMON_COLORS, ...selectedColors]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسم المنتج');
      return;
    }

    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('يرجى إدخال سعر صحيح بالدينار الجزائري (مثال: 2800)');
      return;
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setErrorMessage('يرجى إدخال كمية مخزون صحيحة (مثال: 10)');
      return;
    }

    const finalCategory = isCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    const primaryImage = images.length > 0 ? images[0] : undefined;

    const savedProduct: Product = {
      id: productToEdit ? productToEdit.id : Date.now(),
      name: name.trim(),
      desc: desc.trim() || 'قطعة ملابس قطنية فائقة النعومة ومريحة لبشرة المولود الحساسة.',
      price: parsedPrice,
      icon,
      gender,
      image: primaryImage,
      images: images.length > 0 ? images : undefined,
      category: finalCategory,
      tag: tag.trim() || undefined,
      piecesCount: parseInt(piecesCount, 10) || 1,
      fabric: fabric.trim() || '100% قطن طبيعي',
      colors: selectedColors.length > 0 ? selectedColors : ['أزرق سماوي', 'وردي'],
      sizes: selectedSizes.length > 0 ? selectedSizes : ['0-3 أشهر'],
      stock: parsedStock,
      initialStock: productToEdit?.initialStock ?? parsedStock,
      isCustom: true
    };

    onSaveProduct(savedProduct, isEditing);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0E1E2E]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-[70] overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-7 border border-[#D3E3F0] shadow-2xl relative max-h-[92vh] overflow-y-auto my-auto text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[#F2F7FC] hover:bg-[#E2EFFB] text-[#55738E] hover:text-[#1C2D3D] flex items-center justify-center transition-colors text-lg font-bold z-10 border border-[#D3E3F0] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#D3E3F0]">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E2F0FC] via-[#FDF0F5] to-[#FDE8F1] border border-[#D3E3F0] flex items-center justify-center text-[#2E6F9E] shadow-xs">
            {isEditing ? (
              <Edit3 className="w-5 h-5 text-[#D86688]" />
            ) : (
              <Plus className="w-6 h-6 text-[#2E6F9E]" />
            )}
          </div>
          <div>
            <h3 className="font-['El_Messiri',serif] font-bold text-xl sm:text-2xl text-[#1C4263]">
              {isEditing ? 'تعديل بيانات وصور المنتج' : 'تحميل وإضافة منتج جديد مع عدة صور'}
            </h3>
            <p className="text-xs text-[#617487]">
              {isEditing 
                ? 'عدّل الصور المتعددة، السعر، المخزون، والمواصفات وسيتم تحديثها فوراً في المتجر'
                : 'ارفع صورة أو عدة صور للمنتج، واملأ المواصفات لتظهر مباشرة في المتجر'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. MULTIPLE IMAGES UPLOAD SECTION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1C2D3D] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#2E6F9E]" />
                <span>صور المنتج (يمكنك رفع عدة صور معاً):</span>
              </label>
              {images.length > 0 && (
                <span className="text-xs font-bold text-[#2E6F9E] bg-[#EAF3FA] px-2.5 py-0.5 rounded-full border border-[#D3E3F0]">
                  {images.length} {images.length === 1 ? 'صورة مرفوعة' : 'صور مرفوعة'} 📷
                </span>
              )}
            </div>

            {/* Hidden multi-file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Display Images Gallery Strip if images exist */}
            {images.length > 0 && (
              <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border-2 border-[#D3E3F0] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#55697D]">
                  <span className="font-bold text-[#1C2D3D]">معرض الصور المرفوعة للمنتج:</span>
                  <span className="text-[11px] text-[#7E96AC]">
                    ⭐ الصورة الأولى هي الغلاف الرئيسي في المتجر
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {images.map((imgUrl, index) => {
                    const isPrimary = index === 0;
                    return (
                      <div
                        key={index}
                        className={`relative rounded-xl overflow-hidden border-2 bg-white shadow-2xs group flex flex-col ${
                          isPrimary ? 'border-[#2E6F9E] ring-2 ring-[#93C5FD]' : 'border-[#D3E3F0]'
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="h-28 sm:h-32 w-full relative bg-[#F2F7FC] flex items-center justify-center overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />

                          {/* Primary Badge */}
                          {isPrimary && (
                            <div className="absolute top-1.5 right-1.5 bg-[#2E6F9E] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-amber-300" />
                              <span>الغلاف الرئيسي</span>
                            </div>
                          )}

                          {/* Index Badge if not primary */}
                          {!isPrimary && (
                            <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                              #{index + 1}
                            </div>
                          )}
                        </div>

                        {/* Image Action Buttons */}
                        <div className="p-1.5 bg-white border-t border-[#E8EFF6] flex items-center justify-between gap-1">
                          {!isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetAsPrimary(index)}
                              title="تعيين كصورة غلاف رئيسية"
                              className="flex-1 py-1 px-1.5 rounded-lg bg-[#EEF6FC] hover:bg-[#2E6F9E] hover:text-white text-[#2E6F9E] text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Star className="w-3 h-3" />
                              <span>تعيين كرئيسية</span>
                            </button>
                          ) : (
                            <span className="flex-1 text-[10px] font-bold text-[#2E6F9E] text-center py-1">
                              ✓ الصورة الأساسية
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            title="حذف هذه الصورة"
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add More Images Button Tile */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-28 sm:h-32 rounded-xl border-2 border-dashed border-[#8EBFDE] bg-[#F2F8FD] hover:bg-[#E2F0FC] hover:border-[#2E6F9E] flex flex-col items-center justify-center gap-1.5 text-[#2E6F9E] transition-all cursor-pointer p-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-black">+ إضافة صور أخرى</span>
                    <span className="text-[10px] text-[#55738E]">من جهازك</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dropzone for Uploading */}
            {images.length === 0 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#2E6F9E] bg-[#EAF3FA]'
                    : 'border-[#BDD4E7] bg-gradient-to-b from-[#F7FAFD] to-[#F1F6FB] hover:border-[#2E6F9E] hover:bg-[#EAF3FA]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#D3E3F0] text-[#2E6F9E] shadow-2xs flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-7 h-7" />
                </div>

                <h4 className="font-bold text-sm text-[#1C2D3D] mb-1">
                  اسحب وأفلت صورة أو <span className="text-[#2E6F9E] underline">عدة صور معاً</span> هنا، أو اضغط للاختيار
                </h4>
                <p className="text-xs text-[#7E96AC] mb-3">
                  يمكنك تحديد عدة صور بضغطة واحدة (JPG, PNG, WEBP بدقة عالية)
                </p>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUrlInput(!showUrlInput);
                    }}
                    className="text-[11px] font-bold text-[#2E6F9E] bg-white border border-[#D3E3F0] px-3 py-1.5 rounded-xl hover:bg-[#E2EFFB] transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>أو إضافة رابط صورة (URL)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Extra URL bar toggle if images exist */}
            {images.length > 0 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs font-bold text-[#2E6F9E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{showUrlInput ? 'إخفاء خانة رابط الصورة' : '+ إضافة صورة برابط URL'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[#2E6F9E] bg-[#F2F7FC] hover:bg-[#E2EFFB] px-3 py-1 rounded-xl border border-[#D3E3F0] flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع المزيد من الصور</span>
                </button>
              </div>
            )}

            {/* URL Input Dropdown */}
            {showUrlInput && (
              <div className="p-3 bg-[#F2F7FC] rounded-xl border border-[#D3E3F0] flex gap-2 animate-in fade-in">
                <input
                  type="url"
                  placeholder="https://example.com/baby-outfit-view2.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#D3E3F0] rounded-xl text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3.5 py-2 bg-[#2E6F9E] hover:bg-[#235D86] text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة الصورة</span>
                </button>
              </div>
            )}

            {isProcessingImages && (
              <div className="p-2.5 bg-[#EBF5FD] text-[#2E6F9E] text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-[#8EBFDE] animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>جاري معالجة وتحسين الصور المرفوعة...</span>
              </div>
            )}
          </div>

          {/* 2. BASIC PRODUCT DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                اسم المنتج أو الطقم: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: طقم استقبال مولود فاخر قطن 100% (6 قطع)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                السعر بالدينار الجزائري (د.ج): <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="100"
                step="50"
                dir="ltr"
                placeholder="مثال: 3200"
                value={price}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm font-mono text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
              />
            </div>

            {/* Initial Stock */}
            <div>
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                الكمية المتوفرة بالمخزن: <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                dir="ltr"
                placeholder="مثال: 15"
                value={stock}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm font-mono text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
              />
            </div>

            {/* Gender Classification (ذكور / إناث / للجنسين) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                فئة الموديل (ذكور / إناث):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('ذكور')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                    gender === 'ذكور'
                      ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8] shadow-xs ring-2 ring-[#93C5FD]'
                      : 'bg-white border-[#D3E3F0] text-[#55738E] hover:bg-[#F2F7FC]'
                  }`}
                >
                  <span className="text-base">👦</span>
                  <span>ذكور (أولاد)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender('إناث')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                    gender === 'إناث'
                      ? 'bg-[#FDF2F8] border-[#D86688] text-[#BE185D] shadow-xs ring-2 ring-[#FBCFE8]'
                      : 'bg-white border-[#D3E3F0] text-[#55738E] hover:bg-[#F2F7FC]'
                  }`}
                >
                  <span className="text-base">👧</span>
                  <span>إناث (بنات)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender('للجنسين')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                    gender === 'للجنسين'
                      ? 'bg-[#F5F3FF] border-[#7C3AED] text-[#6D28D9] shadow-xs ring-2 ring-[#DDD6FE]'
                      : 'bg-white border-[#D3E3F0] text-[#55738E] hover:bg-[#F2F7FC]'
                  }`}
                >
                  <span className="text-base">👶</span>
                  <span>للجنسين (محايد)</span>
                </button>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                الصنف / القسم:
              </label>
              {!isCustomCategory ? (
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm font-medium text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">➕ إضافة تصنيف جديد...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب اسم التصنيف الجديد..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#D3E3F0] bg-white text-xs text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className="px-3 py-2 bg-[#F2F7FC] border border-[#D3E3F0] rounded-xl text-xs font-bold text-[#55697D]"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            {/* Tag / Badge */}
            <div>
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                شارة ترويجية (Badge):
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm font-medium text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
              >
                {COMMON_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="">بدون شارة</option>
              </select>
            </div>
          </div>

          {/* 3. SIZES & COLORS SELECTION */}
          <div className="p-4 bg-[#F8FAFD] rounded-2xl border border-[#D3E3F0] space-y-4">
            {/* Sizes */}
            <div>
              <label className="block text-xs font-bold text-[#235D86] mb-1.5 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#2E6F9E]" />
                <span>المقاسات المتوفرة للطلب:</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {displaySizes.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  const isCustom = !COMMON_SIZES.includes(sz);
                  return (
                    <div key={sz} className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSize(sz)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#2E6F9E] text-white shadow-2xs'
                            : 'bg-white border border-[#D3E3F0] text-[#617487] hover:bg-[#EAF3FA]'
                        }`}
                      >
                        <span>{sz}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(sz)}
                          title={`إزالة مقاس ${sz}`}
                          className="mr-1 text-[#8A9EB1] hover:text-rose-600 text-xs px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add custom size */}
              <div className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  placeholder="مقاس مخصص (مثال: 18-24 شهر)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSize();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D3E3F0] rounded-xl text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-1 focus:ring-[#2E6F9E]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3.5 py-1.5 bg-[#2E6F9E] hover:bg-[#235D86] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  + إضافة مقاس
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-bold text-[#235D86] mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#D86688]" />
                <span>الألوان المتوفرة:</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {displayColors.map((col) => {
                  const isSelected = selectedColors.includes(col);
                  const isCustom = !COMMON_COLORS.includes(col);
                  return (
                    <div key={col} className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => handleToggleColor(col)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#D86688] text-white shadow-2xs'
                            : 'bg-white border border-[#D3E3F0] text-[#617487] hover:bg-[#FDF2F6]'
                        }`}
                      >
                        <span>{col}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(col)}
                          title={`إزالة لون ${col}`}
                          className="mr-1 text-[#8A9EB1] hover:text-rose-600 text-xs px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add custom color */}
              <div className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  placeholder="لون مخصص (مثال: أزرق نيلي)"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomColor();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D3E3F0] rounded-xl text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-1 focus:ring-[#D86688]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="px-3.5 py-1.5 bg-[#D86688] hover:bg-[#C24F73] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  + إضافة لون
                </button>
              </div>
            </div>
          </div>

          {/* 4. FABRIC, PIECES & DESCRIPTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                نوع القماش والملمس:
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="100% قطن طبيعي تركي ناعم"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                عدد القطع بالطقم:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={piecesCount}
                onChange={(e) => setPiecesCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1C2D3D] mb-1.5">
                وصف القطعة ومميزاتها:
              </label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="تفاصيل التصميم، الأزرار، أسلوب الارتداء، ونعومة القماش للأيام الأولى للمولود..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D3E3F0] bg-white text-xs text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-3 border-t border-[#D3E3F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-[#D3E3F0] text-xs font-bold text-[#55738E] hover:bg-[#F2F7FC] transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex-1 sm:flex-none sm:min-w-[200px] bg-gradient-to-r from-[#2E6F9E] to-[#235D86] hover:from-[#235D86] hover:to-[#1C4B6E] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 text-[#FDE8F1]" />
                  <span>حفظ التعديلات على المنتج</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FDE8F1]" />
                  <span>إضافة المنتج للمتجر الآن</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
