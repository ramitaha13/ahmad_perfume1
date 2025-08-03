import React, { useState } from "react";
import { Heart, Share2, Search, Filter, Sparkles } from "lucide-react";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["الكل", "عطور نسائية", "عطور رجالية"];

  const perfumes = [
    {
      id: 1,
      name: "زهرة اللوتس",
      subtitle: "عبير الحدائق",
      category: "عطور نسائية",
      price: 199,
      originalPrice: null,
      discount: null,
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop",
      description: "عطر منعش يحتوي على خلاصة زهرة اللوتس والليمون مع الريحان",
      badge: "جديد",
      badgeColor: "bg-amber-500",
    },
    {
      id: 2,
      name: "عود الملوك",
      subtitle: "التراث العربي",
      category: "عطور رجالية",
      price: 450,
      originalPrice: 599,
      discount: 25,
      image:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop",
      description:
        "عطر فاخر من العود الطبيعي مع نفحات من الزعفران والورد الطائفي",
      badge: "خصم 25%",
      badgeColor: "bg-red-500",
    },
    {
      id: 3,
      name: "ليلة صيف دافئة",
      subtitle: "أزهار الشرق",
      category: "عطور نسائية",
      price: 299,
      originalPrice: 399,
      discount: 25,
      image:
        "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400&h=500&fit=crop",
      description:
        "عطر ساحر يجمع بين رائحة الياسمين والورد مع لمسة من العنبر الدافئ",
      badge: "خصم 25%",
      badgeColor: "bg-red-500",
    },
  ];

  const filteredPerfumes = perfumes.filter((perfume) => {
    const matchesCategory =
      selectedCategory === "الكل" || perfume.category === selectedCategory;
    const matchesSearch = perfume.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-12 text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-white mx-2" />
          <h1 className="text-3xl font-bold text-white">متجر العطور الفاخرة</h1>
          <Sparkles className="h-8 w-8 text-white mx-2" />
        </div>
        <p className="text-white text-lg mb-6 max-w-2xl mx-auto px-4">
          اكتشف مجموعة مختارة من أفضل العطور العربية والعالمية بأسعار لا تقاوم
        </p>
        <div className="flex justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white">
            ضمان الجودة 100%
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث عن العطور المفضلة لديك..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="h-5 w-5 text-gray-500" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full transition-all duration-200 ${
                    selectedCategory === category
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

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPerfumes.map((perfume) => (
            <div
              key={perfume.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={perfume.image}
                  alt={perfume.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`${perfume.badgeColor} text-white px-3 py-1 rounded-full text-sm font-medium`}
                  >
                    {perfume.badge}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="text-center mb-4">
                  <span className="text-sm text-amber-600 font-medium">
                    {perfume.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    {perfume.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{perfume.subtitle}</p>
                </div>

                <p className="text-gray-600 text-sm text-center mb-4 leading-relaxed">
                  {perfume.description}
                </p>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <span className="text-2xl font-bold text-gray-900">
                      {perfume.price}₪
                    </span>
                    {perfume.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {perfume.originalPrice}₪
                      </span>
                    )}
                  </div>
                </div>

                {/* Buy Button */}
                <button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white py-3 px-6 rounded-full font-semibold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                  دعوة للشراء
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPerfumes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              لم يتم العثور على نتائج
            </h3>
            <p className="text-gray-500">
              جرب البحث بكلمات مختلفة أو تغيير الفئة
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
