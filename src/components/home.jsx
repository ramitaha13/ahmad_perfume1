import React, { useState, useEffect } from "react";
import { Heart, Share2, Search, Filter, Sparkles } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase"; // Make sure this path is correct for your project

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ["الكل", "عطور نسائية", "عطور رجالية"];

  // Fetch perfumes from Firebase
  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        setLoading(true);
        // Create a query against the "perfumes" collection, ordered by creation time (newest first)
        const perfumesQuery = query(
          collection(firestore, "perfumes"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(perfumesQuery);
        const perfumesList = [];

        querySnapshot.forEach((doc) => {
          // Add the document ID and data to our perfumes list
          perfumesList.push({
            id: doc.id,
            ...doc.data(),
            // Handle Firestore timestamp
            createdAt: doc.data().createdAt
              ? doc.data().createdAt.toDate()
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

  const filteredPerfumes = perfumes.filter((perfume) => {
    const matchesCategory =
      selectedCategory === "الكل" || perfume.category === selectedCategory;
    const matchesSearch = perfume.name
      ?.toLowerCase()
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

        {/* Perfumes Grid */}
        {!loading && !error && (
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
                  {perfume.badge && (
                    <div className="absolute top-4 right-4">
                      <span
                        className={`${perfume.badgeColor} text-white px-3 py-1 rounded-full text-sm font-medium`}
                      >
                        {perfume.badge}
                      </span>
                    </div>
                  )}

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
        )}

        {/* No Results */}
        {!loading && !error && filteredPerfumes.length === 0 && (
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
