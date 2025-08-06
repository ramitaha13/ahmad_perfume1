import React, { useState, useEffect, useRef } from "react";
import {
  Share2,
  Search,
  Filter,
  Sparkles,
  LogIn,
  Menu,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  X,
  Trash2,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Instagram,
  Copy,
  MessageCircle,
  Phone, // Added Phone icon
  PhoneCall, // Added PhoneCall icon
} from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase"; // Make sure this path is correct for your project
import { Link } from "react-router-dom"; // Make sure you have react-router-dom installed

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [addedToCart, setAddedToCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPhoneTooltipVisible, setIsPhoneTooltipVisible] = useState(false);

  const shareMenuRef = useRef(null);
  const phoneTooltipRef = useRef(null);
  const categories = ["الكل", "عطور نسائية", "عطور رجالية"];

  // Phone number constant
  const phoneNumber = "0552574773";

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);

        // Create a map of items in cart for easy lookup
        const itemsInCart = {};
        parsedCart.forEach((item) => {
          itemsInCart[item.id] = item.quantity;
        });
        setAddedToCart(itemsInCart);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
      }
    }
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      localStorage.removeItem("cart");
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if clicking inside the cart
      if (e.target.closest(".cart-sidebar")) return;

      setIsMobileMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(e.target) &&
        !e.target.closest(".share-button")
      ) {
        setShareMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close phone tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        phoneTooltipRef.current &&
        !phoneTooltipRef.current.contains(e.target) &&
        !e.target.closest(".phone-button")
      ) {
        setIsPhoneTooltipVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Close cart when pressing Escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
        setShareMenuOpen(null);
        setIsPhoneTooltipVisible(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  // Handle mobile menu toggle (prevent event bubbling)
  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle cart sidebar
  const toggleCart = (e) => {
    if (e) e.stopPropagation();
    setIsCartOpen(!isCartOpen);
  };

  // Toggle share menu
  const toggleShareMenu = (e, perfumeId) => {
    e.stopPropagation();
    setShareMenuOpen(shareMenuOpen === perfumeId ? null : perfumeId);
  };

  // Toggle phone tooltip
  const togglePhoneTooltip = (e) => {
    e.stopPropagation();
    setIsPhoneTooltipVisible(!isPhoneTooltipVisible);
  };

  // Handle phone call
  const handlePhoneCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Copy phone number to clipboard
  const copyPhoneNumber = () => {
    navigator.clipboard
      .writeText(phoneNumber)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // Share functions
  const shareOnFacebook = (perfume) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}&quote=${encodeURIComponent(
      `تحقق من ${perfume.name} في متجر العطور الفاخرة!`
    )}`;
    window.open(url, "_blank");
    setShareMenuOpen(null);
  };

  const shareOnTwitter = (perfume) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `تحقق من ${perfume.name} في متجر العطور الفاخرة!`
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
    setShareMenuOpen(null);
  };

  const shareOnInstagram = () => {
    // Instagram doesn't have a direct share URL, but we can redirect to Instagram
    window.open("https://www.instagram.com/", "_blank");
    setShareMenuOpen(null);
  };

  const shareOnWhatsApp = (perfume) => {
    const text = `تحقق من ${perfume.name} في متجر العطور الفاخرة!\n${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setShareMenuOpen(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopySuccess(true);
        setShareMenuOpen(null);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

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

  // Add to cart function
  const addToCart = (perfume) => {
    // Check if the item is already in the cart
    const existingItemIndex = cart.findIndex((item) => item.id === perfume.id);

    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Item doesn't exist, add new item
      setCart([
        ...cart,
        {
          id: perfume.id,
          name: perfume.name,
          price: perfume.price,
          image: perfume.image,
          quantity: 1,
        },
      ]);
    }

    // Update the addedToCart state
    setAddedToCart((prev) => ({
      ...prev,
      [perfume.id]: (prev[perfume.id] || 0) + 1,
    }));

    // Show success animation
    showAddedSuccess(perfume.id);
  };

  // Decrease quantity in cart
  const decreaseQuantity = (perfume) => {
    // Check if the item is in the cart
    const existingItemIndex = cart.findIndex((item) => item.id === perfume.id);

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingItemIndex].quantity > 1) {
        // Decrease quantity if more than 1
        updatedCart[existingItemIndex].quantity -= 1;
        setCart(updatedCart);

        // Update the addedToCart state
        setAddedToCart((prev) => ({
          ...prev,
          [perfume.id]: prev[perfume.id] - 1,
        }));
      } else {
        // Remove item if quantity is 1
        updatedCart.splice(existingItemIndex, 1);
        setCart(updatedCart);

        // Update the addedToCart state
        setAddedToCart((prev) => {
          const updated = { ...prev };
          delete updated[perfume.id];
          return updated;
        });
      }
    }
  };

  // Remove item from cart completely
  const removeFromCart = (itemId) => {
    // Remove the item from cart
    setCart(cart.filter((item) => item.id !== itemId));

    // Update the addedToCart state
    setAddedToCart((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  // Show success animation when item is added to cart
  const showAddedSuccess = (perfumeId) => {
    const button = document.getElementById(`add-to-cart-${perfumeId}`);
    if (button) {
      button.classList.add("added-to-cart");
      setTimeout(() => {
        button.classList.remove("added-to-cart");
      }, 1000);
    }
  };

  // Get cart total quantity
  const getCartTotalQuantity = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate cart subtotal
  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    setAddedToCart({});
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-12 text-center relative">
        {/* Phone Number in header */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
          <a
            href={`tel:${phoneNumber}`}
            className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center gap-2 hover:bg-white/30 transition-colors shadow-md"
          >
            <Phone className="h-5 w-5" />
            <span>{phoneNumber}</span>
          </a>
        </div>

        {/* Mobile Menu Button - Only visible on small screens */}
        <div
          className="absolute top-4 left-4 md:hidden"
          onClick={toggleMobileMenu}
        >
          <button className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors shadow-md">
            <Menu className="h-6 w-6" />
          </button>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div
              className="absolute left-0 top-12 bg-white rounded-lg shadow-xl py-2 min-w-[160px] z-10"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Phone className="h-5 w-5 text-amber-500" />
                <span>اتصل بنا: {phoneNumber}</span>
              </a>
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogIn className="h-5 w-5 text-amber-500" />
                <span>تسجيل الدخول</span>
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Login Button - Hidden on small screens */}
        <div className="absolute top-4 left-4 hidden md:block">
          <Link
            to="/login"
            className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center gap-2 hover:bg-white/30 transition-colors shadow-md"
          >
            <LogIn className="h-5 w-5" />
            <span>تسجيل الدخول</span>
          </Link>
        </div>

        {/* Shopping Cart Icon */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={toggleCart}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors shadow-md"
            >
              <ShoppingCart className="h-6 w-6" />
              {getCartTotalQuantity() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartTotalQuantity()}
                </span>
              )}
            </button>
          </div>
        </div>

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
            <div className="relative flex-1 max-w-md w-full">
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
            <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto pb-2 w-full md:w-auto">
              <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
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

                  {/* Share Button */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    <button
                      onClick={(e) => toggleShareMenu(e, perfume.id)}
                      className="share-button p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md relative"
                    >
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </button>

                    {/* Share Menu - Separate from button */}
                    {shareMenuOpen === perfume.id && (
                      <div
                        ref={shareMenuRef}
                        className="absolute left-0 top-12 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[140px] z-20"
                      >
                        <div
                          onClick={() => shareOnFacebook(perfume)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-right cursor-pointer"
                        >
                          <Facebook className="h-4 w-4 text-blue-600" />
                          <span>فيسبوك</span>
                        </div>
                        <div
                          onClick={() => shareOnTwitter(perfume)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-right cursor-pointer"
                        >
                          <Twitter className="h-4 w-4 text-sky-500" />
                          <span>تويتر</span>
                        </div>
                        <div
                          onClick={() => shareOnInstagram()}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-right cursor-pointer"
                        >
                          <Instagram className="h-4 w-4 text-pink-600" />
                          <span>انستجرام</span>
                        </div>
                        <div
                          onClick={() => shareOnWhatsApp(perfume)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-right cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4 text-green-500" />
                          <span>واتساب</span>
                        </div>
                        <div
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-right cursor-pointer"
                        >
                          <LinkIcon className="h-4 w-4 text-gray-600" />
                          <span>نسخ الرابط</span>
                        </div>
                      </div>
                    )}

                    {/* Copy Success Message */}
                    {copySuccess && (
                      <div className="absolute left-0 top-12 mt-1 bg-green-500 text-white text-xs rounded-md py-1 px-2 min-w-max copy-success-notification">
                        تم نسخ الرابط!
                      </div>
                    )}
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

                  {/* Add to Cart Button */}
                  <div className="flex items-center gap-2">
                    {/* Decrease quantity button - only shown if item is in cart */}
                    {addedToCart[perfume.id] > 0 && (
                      <button
                        onClick={() => decreaseQuantity(perfume)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="h-5 w-5 text-gray-600" />
                      </button>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      id={`add-to-cart-${perfume.id}`}
                      onClick={() => addToCart(perfume)}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white py-3 px-6 rounded-full font-semibold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 relative overflow-hidden"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {addedToCart[perfume.id] ? (
                          <>
                            <span className="flex items-center">
                              <span className="font-semibold">
                                {addedToCart[perfume.id]}
                              </span>
                              <span className="mx-1">×</span>
                              <ShoppingCart className="h-5 w-5" />
                            </span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-5 w-5" />
                            <span>أضف إلى السلة</span>
                          </>
                        )}
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center bg-green-500 opacity-0 transition-opacity duration-300 success-overlay">
                        <Check className="h-6 w-6 text-white" />
                      </span>
                    </button>

                    {/* Increase quantity button - if already in cart, show a + button */}
                    {addedToCart[perfume.id] > 0 && (
                      <button
                        onClick={() => addToCart(perfume)}
                        className="p-2 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors"
                      >
                        <Plus className="h-5 w-5 text-amber-600" />
                      </button>
                    )}
                  </div>
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

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 left-0 w-full h-full z-50 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } transition-opacity duration-300`}
      >
        {/* Overlay */}
        <div
          onClick={toggleCart}
          className="absolute inset-0 bg-black opacity-50"
        ></div>

        {/* Cart Content */}
        <div
          className={`cart-sidebar bg-white w-full md:w-96 h-full mr-auto overflow-auto shadow-xl transform ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <ShoppingCart className="h-6 w-6 ml-2" />
                سلة التسوق
                <span className="mr-2 text-sm font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  {getCartTotalQuantity()} منتج
                </span>
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Empty Cart */}
            {cart.length === 0 && (
              <div className="text-center py-10">
                <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  السلة فارغة
                </h3>
                <p className="text-gray-500 mb-6">
                  لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.
                </p>
                <button
                  onClick={toggleCart}
                  className="bg-amber-400 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-500 transition-colors"
                >
                  متابعة التسوق
                </button>
              </div>
            )}

            {/* Cart Items */}
            {cart.length > 0 && (
              <div>
                <div className="divide-y">
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 items-center">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-amber-600 font-bold">
                            {item.price}₪
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const perfume = perfumes.find(
                                  (p) => p.id === item.id
                                );
                                if (perfume) decreaseQuantity(perfume);
                              }}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>

                            <span className="w-6 text-center font-medium">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => {
                                const perfume = perfumes.find(
                                  (p) => p.id === item.id
                                );
                                if (perfume) addToCart(perfume);
                              }}
                              className="p-1 rounded-full bg-amber-100 hover:bg-amber-200"
                            >
                              <Plus className="h-4 w-4 text-amber-600" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>إفراغ السلة</span>
                  </button>
                </div>

                {/* Subtotal */}
                <div className="border-t mt-6 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">المجموع الفرعي</span>
                    <span className="font-bold">{getCartSubtotal()}₪</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-sm">
                    <span className="text-gray-500">التوصيل</span>
                    <span className="text-gray-700">يحدد لاحقاً</span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    className="bg-gradient-to-r from-amber-400 to-amber-500 text-white py-3 px-6 rounded-full font-semibold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg w-full block text-center"
                  >
                    متابعة إلى الطلب
                  </Link>

                  {/* Continue Shopping */}
                  <button
                    onClick={toggleCart}
                    className="mt-4 text-center w-full text-gray-600 hover:text-amber-500 transition-colors"
                  >
                    متابعة التسوق
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Contact Button */}
      <div className="fixed bottom-8 left-8 z-40">
        <div className="relative">
          <button
            onClick={togglePhoneTooltip}
            className="phone-button bg-amber-500 shadow-lg rounded-full w-14 h-14 flex items-center justify-center text-white hover:bg-amber-600 transition-colors"
          >
            <Phone className="h-6 w-6" />
          </button>

          {/* Phone Tooltip */}
          {isPhoneTooltipVisible && (
            <div
              ref={phoneTooltipRef}
              className="absolute bottom-16 left-0 bg-white rounded-lg shadow-xl p-4 w-64 transform -translate-x-1/4"
            >
              <div className="text-center mb-2">
                <h3 className="font-bold text-gray-800">اتصل بنا</h3>
                <p className="text-gray-600 text-sm">للطلب أو الاستفسار</p>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex items-center gap-2 bg-amber-100 text-amber-700 p-3 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  <PhoneCall className="h-5 w-5" />
                  <span className="font-bold">{phoneNumber}</span>
                </a>

                <button
                  onClick={copyPhoneNumber}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Copy className="h-5 w-5" />
                  <span>نسخ الرقم</span>
                </button>

                <a
                  href={`https://wa.me/${phoneNumber.replace(/^0/, "972")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-100 text-green-700 p-3 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>واتساب</span>
                </a>
              </div>

              {/* Copy Success Message */}
              {copySuccess && (
                <div className="mt-2 bg-green-100 text-green-700 p-2 rounded-md text-sm text-center">
                  تم نسخ الرقم!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact info in footer */}
      <div className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="text-center md:text-right">
              <h3 className="text-xl font-bold mb-2">متجر العطور الفاخرة</h3>
              <p className="text-gray-400">
                اكتشف مجموعة مختارة من أفضل العطور العربية والعالمية
              </p>
            </div>

            <div className="text-center md:text-right">
              <h3 className="text-lg font-bold mb-2">اتصل بنا</h3>
              <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                <Phone className="h-5 w-5 text-amber-400" />
                <span>{phoneNumber}</span>
              </div>
              <div className="flex justify-center md:justify-end gap-3">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>
              © {new Date().getFullYear()} متجر العطور الفاخرة. جميع الحقوق
              محفوظة.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for Success Animation */}
      <style>{`
        .added-to-cart .success-overlay {
          opacity: 1;
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        .success-overlay {
          animation-name: fadeInOut;
          animation-duration: 1s;
          animation-timing-function: ease;
        }
        
        /* Add new notification animation for copy success */
        @keyframes fadeInOutSlide {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          15% {
            opacity: 1;
            transform: translateY(0);
          }
          85% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        
        /* Apply the animation to copy success notification */
        .copy-success-notification {
          animation: fadeInOutSlide 2s ease-in-out;
        }
        
        /* Floating button bounce animation */
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .phone-button {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
