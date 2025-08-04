import React, { useState, useRef } from "react";
import { Sparkles, Save, RefreshCw, Eye, Copy, Upload } from "lucide-react";

const AddPerfumeForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    category: "عطور نسائية",
    price: "",
    originalPrice: "",
    image: null,
    imagePreview: "",
    description: "",
    badge: "",
    badgeColor: "bg-amber-500",
  });

  const fileInputRef = useRef(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const badgeColors = [
    { value: "bg-amber-500", label: "ذهبي" },
    { value: "bg-red-500", label: "أحمر" },
    { value: "bg-green-500", label: "أخضر" },
    { value: "bg-blue-500", label: "أزرق" },
    { value: "bg-purple-500", label: "بنفسجي" },
    { value: "bg-indigo-500", label: "نيلي" },
    { value: "bg-pink-500", label: "وردي" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For demo purposes, we'll create a preview URL
    const imagePreview = URL.createObjectURL(file);

    // In a real app, you would upload this to a server and get a URL back
    // For now, we'll use the file name as a placeholder in the generated code
    setFormData((prev) => ({
      ...prev,
      image: file,
      imagePreview: imagePreview,
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const generatePerfumeObject = () => {
    let discount = null;
    if (
      formData.originalPrice &&
      parseFloat(formData.originalPrice) > parseFloat(formData.price)
    ) {
      discount = Math.round(
        (1 - parseFloat(formData.price) / parseFloat(formData.originalPrice)) *
          100
      );
    }

    // In a real application, you would upload the image and get a URL
    // For now, we'll use a placeholder or the default image
    const imageUrl = formData.imagePreview
      ? "uploaded_image_url.jpg" // This would be replaced with the actual uploaded URL
      : "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop";

    const perfumeObject = {
      id: Math.floor(Math.random() * 1000) + 4,
      name: formData.name,
      subtitle: formData.subtitle,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice
        ? parseFloat(formData.originalPrice)
        : null,
      discount: discount,
      image: imageUrl,
      description: formData.description,
      badge: formData.badge || (discount ? `خصم ${discount}%` : "جديد"),
      badgeColor: formData.badgeColor,
    };

    const codeString = `{
  id: ${perfumeObject.id},
  name: "${perfumeObject.name}",
  subtitle: "${perfumeObject.subtitle}",
  category: "${perfumeObject.category}",
  price: ${perfumeObject.price},
  originalPrice: ${perfumeObject.originalPrice},
  discount: ${perfumeObject.discount},
  image: "${perfumeObject.image}",
  description: "${perfumeObject.description}",
  badge: "${perfumeObject.badge}",
  badgeColor: "${perfumeObject.badgeColor}",
},`;

    setGeneratedCode(codeString);
    return perfumeObject;
  };

  const handleGenerate = () => {
    if (!formData.name || !formData.price || !formData.description) {
      alert("يرجى ملء الحقول المطلوبة: اسم العطر، السعر، والوصف");
      return;
    }
    generatePerfumeObject();
    setShowPreview(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      alert("تم نسخ الكود بنجاح! يمكنك الآن إضافته إلى مصفوفة العطور في كودك");
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subtitle: "",
      category: "عطور نسائية",
      price: "",
      originalPrice: "",
      image: null,
      imagePreview: "",
      description: "",
      badge: "",
      badgeColor: "bg-amber-500",
    });
    setGeneratedCode("");
    setShowPreview(false);
  };

  const getPreviewDiscount = () => {
    if (
      formData.originalPrice &&
      parseFloat(formData.originalPrice) > parseFloat(formData.price)
    ) {
      return Math.round(
        (1 - parseFloat(formData.price) / parseFloat(formData.originalPrice)) *
          100
      );
    }
    return null;
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col items-center"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-8 w-full">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-white mx-2" />
            <h1 className="text-3xl font-bold text-white">إضافة عطر جديد</h1>
            <Sparkles className="h-8 w-8 text-white mx-2" />
          </div>
          <p className="text-white text-lg">
            املأ النموذج أدناه لإنشاء بيانات العطر الجديد
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Save className="h-6 w-6 text-amber-500" />
              بيانات العطر
            </h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العطر *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="مثال: عود الملوك"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان الفرعي
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="مثال: التراث العربي"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                >
                  <option value="عطور نسائية">عطور نسائية</option>
                  <option value="عطور رجالية">عطور رجالية</option>
                </select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الحالي (₪) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="199"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأصلي (₪)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="299 (اختياري للخصم)"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة العطر
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="flex flex-col items-center space-y-4">
                  <div
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-12 w-12 text-amber-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center">
                      انقر لاختيار صورة أو اسحب وأفلت الصورة هنا
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG، PNG، WebP، GIF بحد أقصى 5MB
                    </p>
                  </div>

                  {formData.imagePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={formData.imagePreview}
                        alt="معاينة"
                        className="h-64 w-auto object-contain rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            image: null,
                            imagePreview: "",
                          }))
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="إزالة الصورة"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                  placeholder="وصف العطر ومكوناته..."
                />
              </div>

              {/* Badge and Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نص الشارة
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="جديد، محدود، إلخ (اتركه فارغاً للتلقائي)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    لون الشارة
                  </label>
                  <select
                    name="badgeColor"
                    value={formData.badgeColor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  >
                    {badgeColors.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  إعادة تعيين
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  اضف العطر
                </button>
              </div>
            </div>
          </div>

          {/* Generated Code Section */}
          {showPreview && generatedCode && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mx-auto w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Copy className="h-5 w-5 text-amber-500" />
                  الكود المُولَّد
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  نسخ الكود
                </button>
              </div>

              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{generatedCode}</pre>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  طريقة الاستخدام:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. انسخ الكود أعلاه</li>
                  <li>2. افتح ملف الكود الخاص بك</li>
                  <li>3. أضف الكود داخل مصفوفة العطور (perfumes)</li>
                  <li>4. احفظ الملف وستظهر العطر في المتجر</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPerfumeForm;
