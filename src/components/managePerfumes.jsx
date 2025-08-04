import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../firebase"; // Make sure this path is correct for your project
import {
  Package,
  Search,
  Trash,
  Edit,
  Save,
  X,
  ArrowRight,
  Upload,
  Check,
  Filter,
} from "lucide-react";

const ManagePerfumes = () => {
  // Authentication check
  const navigate = useNavigate();
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // State variables
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [editingPerfume, setEditingPerfume] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);

  // Badge color options
  const badgeColors = [
    { value: "bg-amber-500", label: "ذهبي" },
    { value: "bg-red-500", label: "أحمر" },
    { value: "bg-green-500", label: "أخضر" },
    { value: "bg-blue-500", label: "أزرق" },
    { value: "bg-purple-500", label: "بنفسجي" },
    { value: "bg-indigo-500", label: "نيلي" },
    { value: "bg-pink-500", label: "وردي" },
  ];

  // Fetch perfumes from Firestore
  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        setLoading(true);
        const perfumesQuery = query(
          collection(firestore, "perfumes"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(perfumesQuery);
        const perfumesList = [];

        querySnapshot.forEach((doc) => {
          perfumesList.push({
            docId: doc.id, // Store the Firestore document ID
            ...doc.data(),
            createdAt: doc.data().createdAt
              ? new Date(doc.data().createdAt.seconds * 1000)
              : new Date(),
          });
        });

        setPerfumes(perfumesList);
        setError(null);
      } catch (err) {
        console.error("Error fetching perfumes:", err);
        setError("حدث خطأ أثناء تحميل العطور. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfumes();
  }, []);

  // Filter perfumes based on search term and category
  const filteredPerfumes = perfumes.filter((perfume) => {
    const matchesSearch =
      perfume.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perfume.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "الكل" || perfume.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Handle edit mode
  const handleEdit = (perfume) => {
    // Create a copy of the perfume for editing
    setEditingPerfume({
      ...perfume,
      newImage: null,
      imagePreview: null,
    });
    setEditSuccess(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Clean up any image preview
    if (editingPerfume?.imagePreview) {
      URL.revokeObjectURL(editingPerfume.imagePreview);
    }
    setEditingPerfume(null);
    setEditSuccess(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle input change in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPerfume((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload in edit form
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file && file.type.startsWith("image/")) {
      // Revoke previous preview URL if exists
      if (editingPerfume.imagePreview) {
        URL.revokeObjectURL(editingPerfume.imagePreview);
      }

      // Create new preview URL
      const imagePreview = URL.createObjectURL(file);

      setEditingPerfume((prev) => ({
        ...prev,
        newImage: file,
        imagePreview: imagePreview,
      }));
    } else {
      alert("الرجاء اختيار ملف صورة");
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageFile) => {
    if (!imageFile) return null;

    setIsUploading(true);

    try {
      const imageFormData = new FormData();
      imageFormData.append("file", imageFile);
      imageFormData.append("upload_preset", "rami123"); // Your Cloudinary upload preset

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/drrpopjnm/image/upload",
        {
          method: "POST",
          body: imageFormData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      alert("فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Save edited perfume
  const handleSaveEdit = async () => {
    if (
      !editingPerfume.name ||
      !editingPerfume.price ||
      !editingPerfume.description
    ) {
      alert("يرجى ملء الحقول المطلوبة: اسم العطر، السعر، والوصف");
      return;
    }

    setIsUploading(true);

    try {
      // Calculate discount if needed
      let discount = null;
      if (
        editingPerfume.originalPrice &&
        parseFloat(editingPerfume.originalPrice) >
          parseFloat(editingPerfume.price)
      ) {
        discount = Math.round(
          (1 -
            parseFloat(editingPerfume.price) /
              parseFloat(editingPerfume.originalPrice)) *
            100
        );
      }

      // Handle image upload if a new image was selected
      let imageUrl = editingPerfume.image;

      if (editingPerfume.newImage) {
        const uploadedImageUrl = await uploadImageToCloudinary(
          editingPerfume.newImage
        );
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }

      // Prepare the updated perfume data
      const updatedPerfume = {
        name: editingPerfume.name,
        subtitle: editingPerfume.subtitle || "",
        category: editingPerfume.category,
        price: parseFloat(editingPerfume.price) || 0,
        originalPrice: editingPerfume.originalPrice
          ? parseFloat(editingPerfume.originalPrice)
          : null,
        discount: discount,
        image: imageUrl,
        description: editingPerfume.description,
        badge: editingPerfume.badge || (discount ? `خصم ${discount}%` : "جديد"),
        badgeColor: editingPerfume.badgeColor,
        updatedAt: serverTimestamp(),
      };

      // Update the document in Firestore
      const perfumeRef = doc(firestore, "perfumes", editingPerfume.docId);
      await updateDoc(perfumeRef, updatedPerfume);

      // Update the local state
      setPerfumes(
        perfumes.map((p) =>
          p.docId === editingPerfume.docId
            ? { ...p, ...updatedPerfume, image: imageUrl }
            : p
        )
      );

      // Clean up
      if (editingPerfume.imagePreview) {
        URL.revokeObjectURL(editingPerfume.imagePreview);
      }

      // Show success message briefly
      setEditSuccess(true);
      setTimeout(() => {
        setEditingPerfume(null);
        setEditSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error updating perfume:", err);
      alert("فشل تحديث العطر. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete perfume
  const handleDelete = async (docId) => {
    try {
      await deleteDoc(doc(firestore, "perfumes", docId));

      // Update the local state
      setPerfumes(perfumes.filter((p) => p.docId !== docId));

      // Reset delete confirmation
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting perfume:", err);
      alert("فشل حذف العطر. يرجى المحاولة مرة أخرى.");
    }
  };

  // Handle triggering file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-8 text-center relative">
        <div className="absolute top-4 right-4">
          <Link
            to="/adminpage"
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowRight className="h-5 w-5 ml-1" />
            <span className="hidden sm:inline">العودة للوحة التحكم</span>
          </Link>
        </div>

        <div className="flex items-center justify-center mb-2">
          <Package className="h-7 w-7 text-white mx-2" />
          <h1 className="text-2xl font-bold text-white">إدارة العطور</h1>
        </div>
        <p className="text-white/90 text-sm">
          عرض وتعديل وحذف العطور في المتجر
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full max-w-lg">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث عن العطور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="h-5 w-5 text-gray-500" />
              {["الكل", "عطور نسائية", "عطور رجالية"].map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    categoryFilter === category
                      ? "bg-amber-400 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-amber-400 border-t-transparent rounded-full"></div>
            <p className="text-gray-600">جاري تحميل العطور...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 underline"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {/* No Perfumes */}
        {!loading && !error && filteredPerfumes.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              لا توجد عطور
            </h3>
            <p className="text-gray-500">
              {searchTerm || categoryFilter !== "الكل"
                ? "لا توجد عطور تطابق معايير البحث"
                : "لم يتم إضافة أي عطور بعد"}
            </p>
            <Link
              to="/addnewperfume"
              className="mt-4 inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              إضافة عطر جديد
            </Link>
          </div>
        )}

        {/* Perfumes Grid */}
        {!loading && !error && filteredPerfumes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPerfumes.map((perfume) => (
              <div
                key={perfume.docId}
                className="bg-white rounded-xl shadow-md overflow-hidden relative"
              >
                {/* Edit Form (Only shown when editing this perfume) */}
                {editingPerfume && editingPerfume.docId === perfume.docId ? (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        تعديل العطر
                      </h3>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {editSuccess && (
                      <div className="p-2 mb-4 bg-green-50 text-green-600 rounded-lg flex items-center">
                        <Check className="h-5 w-5 ml-2" />
                        <span>تم تحديث العطر بنجاح</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم العطر *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editingPerfume.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          placeholder="مثال: عود الملوك"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          العنوان الفرعي
                        </label>
                        <input
                          type="text"
                          name="subtitle"
                          value={editingPerfume.subtitle || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          placeholder="مثال: التراث العربي"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الفئة *
                        </label>
                        <select
                          name="category"
                          value={editingPerfume.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        >
                          <option value="عطور نسائية">عطور نسائية</option>
                          <option value="عطور رجالية">عطور رجالية</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            السعر الحالي (₪) *
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={editingPerfume.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            placeholder="199"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            السعر الأصلي (₪)
                          </label>
                          <input
                            type="number"
                            name="originalPrice"
                            value={editingPerfume.originalPrice || ""}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            placeholder="299"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          صورة العطر
                        </label>

                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />

                        <div className="flex items-center space-x-3 space-x-reverse">
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            <span>تغيير الصورة</span>
                          </button>

                          <div className="text-xs text-gray-500">
                            {editingPerfume.newImage
                              ? `تم اختيار: ${editingPerfume.newImage.name}`
                              : "الصورة الحالية"}
                          </div>
                        </div>

                        <div className="mt-2">
                          {editingPerfume.imagePreview ? (
                            <img
                              src={editingPerfume.imagePreview}
                              alt="معاينة الصورة الجديدة"
                              className="h-32 object-contain rounded-lg"
                            />
                          ) : (
                            <img
                              src={editingPerfume.image}
                              alt={editingPerfume.name}
                              className="h-32 object-contain rounded-lg"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الوصف *
                        </label>
                        <textarea
                          name="description"
                          value={editingPerfume.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                          placeholder="وصف العطر ومكوناته..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            نص الشارة
                          </label>
                          <input
                            type="text"
                            name="badge"
                            value={editingPerfume.badge || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            placeholder="جديد، محدود، إلخ"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            لون الشارة
                          </label>
                          <select
                            name="badgeColor"
                            value={editingPerfume.badgeColor}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          >
                            {badgeColors.map((color) => (
                              <option key={color.value} value={color.value}>
                                {color.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={isUploading}
                          className={`px-4 py-2 bg-amber-500 text-white rounded-lg flex items-center gap-2 text-sm ${
                            isUploading
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:bg-amber-600"
                          }`}
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              <span>جاري الحفظ...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span>حفظ التغييرات</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Perfume Card (View Mode) */}
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={perfume.image}
                        alt={perfume.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Badge */}
                      {perfume.badge && (
                        <div className="absolute top-2 right-2">
                          <span
                            className={`${perfume.badgeColor} text-white px-2 py-1 rounded-full text-xs font-medium`}
                          >
                            {perfume.badge}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="absolute top-2 left-2 flex flex-col space-y-2">
                        <button
                          onClick={() => handleEdit(perfume)}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4 text-amber-500" />
                        </button>

                        {deleteConfirm === perfume.docId ? (
                          <button
                            onClick={() => handleDelete(perfume.docId)}
                            className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-md"
                            title="تأكيد الحذف"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(perfume.docId)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                            title="حذف"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </button>
                        )}

                        {deleteConfirm === perfume.docId && (
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                            title="إلغاء"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <div className="text-xs text-amber-600 font-medium">
                          {perfume.category}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                          {perfume.name}
                        </h3>
                        {perfume.subtitle && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {perfume.subtitle}
                          </p>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {perfume.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {perfume.price}₪
                          </span>
                          {perfume.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {perfume.originalPrice}₪
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          {new Date(perfume.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePerfumes;
