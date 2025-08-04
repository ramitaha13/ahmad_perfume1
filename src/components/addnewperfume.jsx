import React, { useState, useRef } from "react";
import { Sparkles, Save, RefreshCw, Upload } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase"; // Make sure this path is correct for your project

const AddPerfumeForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    category: "عطور نسائية",
    price: "",
    originalPrice: "",
    image: null,
    imageUrl: "",
    imagePreview: "",
    description: "",
    badge: "",
    badgeColor: "bg-amber-500",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

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

    if (file && file.type.startsWith("image/")) {
      // Create image preview URL
      const imagePreview = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: imagePreview,
      }));

      setUploadError("");
    } else if (file) {
      setUploadError("الرجاء اختيار ملف صورة");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const uploadImageToCloudinary = async () => {
    if (!formData.image) return null;

    setIsUploading(true);
    setUploadError("");

    try {
      // Create a FormData object to send the file
      const imageFormData = new FormData();
      imageFormData.append("file", formData.image);
      imageFormData.append("upload_preset", "rami123"); // Using your Cloudinary upload preset

      // Upload to Cloudinary (image upload endpoint)
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/drrpopjnm/image/upload", // Your Cloudinary cloud name
        {
          method: "POST",
          body: imageFormData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        // Save the image URL
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.secure_url,
        }));
        return data.secure_url;
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      setUploadError("فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveToFirebase = async (perfumeData) => {
    try {
      // Add to the "perfumes" collection
      await addDoc(collection(firestore, "perfumes"), {
        ...perfumeData,
        createdAt: serverTimestamp(),
      });

      setUploadSuccess(true);
      return true;
    } catch (firestoreError) {
      console.error("Error saving to Firestore:", firestoreError);
      setUploadError("فشل الحفظ في قاعدة البيانات");
      return false;
    }
  };

  const generatePerfumeObject = async () => {
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

    // Upload image to Cloudinary if we have one
    let imageUrl = formData.imageUrl;

    if (formData.image && !imageUrl) {
      imageUrl = await uploadImageToCloudinary();
    }

    // Use default image if no upload
    if (!imageUrl) {
      imageUrl =
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop";
    }

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

    return perfumeObject;
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      alert("يرجى ملء الحقول المطلوبة: اسم العطر، السعر، والوصف");
      return;
    }

    setUploadError("");
    setUploadSuccess(false);

    // Generate the perfume object (this will also upload the image if needed)
    const perfumeObject = await generatePerfumeObject();

    // Save to Firebase
    if (perfumeObject) {
      const saved = await saveToFirebase(perfumeObject);
      if (saved) {
        // Keep success message visible but reset form fields
        setUploadSuccess(true);

        // Clean up the object URL first to prevent memory leaks
        if (formData.imagePreview) {
          URL.revokeObjectURL(formData.imagePreview);
        }

        // Reset form fields but don't reset success message
        setFormData({
          name: "",
          subtitle: "",
          category: "عطور نسائية",
          price: "",
          originalPrice: "",
          image: null,
          imageUrl: "",
          imagePreview: "",
          description: "",
          badge: "",
          badgeColor: "bg-amber-500",
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Set a timer to clear the success message after 5 seconds
        setTimeout(() => {
          setUploadSuccess(false);
        }, 5000);
      }
    }
  };

  const resetForm = () => {
    // Clean up the object URL first to prevent memory leaks
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }

    setFormData({
      name: "",
      subtitle: "",
      category: "عطور نسائية",
      price: "",
      originalPrice: "",
      image: null,
      imageUrl: "",
      imagePreview: "",
      description: "",
      badge: "",
      badgeColor: "bg-amber-500",
    });

    setUploadSuccess(false);
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

            {/* Success Message */}
            {uploadSuccess && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center mb-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">تم حفظ العطر بنجاح!</span>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center mb-6">
                {uploadError}
              </div>
            )}

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
                        onClick={() => {
                          if (formData.imagePreview) {
                            URL.revokeObjectURL(formData.imagePreview);
                          }
                          setFormData((prev) => ({
                            ...prev,
                            image: null,
                            imagePreview: "",
                            imageUrl: "",
                          }));
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
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
                  onClick={handleSave}
                  disabled={isUploading}
                  className={`flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isUploading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-amber-500 hover:to-amber-600"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      حفظ العطر
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPerfumeForm;
