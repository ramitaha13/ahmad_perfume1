import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CreditCard,
  MapPin,
  Truck,
  Phone,
  User,
  Mail,
  Home,
  CheckCircle,
  X,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "cashOnDelivery", // Default payment method
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Get cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
      }
    } else {
      // Redirect to home if cart is empty
      navigate("/");
    }
  }, [navigate]);

  // Calculate subtotal
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculate shipping cost
  const getShippingCost = () => {
    const subtotal = getSubtotal();
    // Free shipping for orders over 300₪
    return subtotal > 300 ? 0 : 30;
  };

  // Calculate total
  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "الرجاء إدخال الاسم الكامل";
    }

    if (!formData.email.trim()) {
      newErrors.email = "الرجاء إدخال البريد الإلكتروني";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "الرجاء إدخال بريد إلكتروني صحيح";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "الرجاء إدخال رقم الهاتف";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "الرجاء إدخال رقم هاتف صحيح (10 أرقام)";
    }

    if (!formData.address.trim()) {
      newErrors.address = "الرجاء إدخال العنوان";
    }

    if (!formData.city.trim()) {
      newErrors.city = "الرجاء إدخال المدينة";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Scroll to first error
      const firstErrorField = document.querySelector(`.error-field`);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order object
      const order = {
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        subtotal: getSubtotal(),
        shipping: getShippingCost(),
        total: getTotal(),
        paymentMethod: formData.paymentMethod,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      // Add order to Firestore
      const docRef = await addDoc(collection(firestore, "orders"), order);

      // Save order ID
      setOrderId(docRef.id);

      // Clear cart
      localStorage.removeItem("cart");

      // Show order complete screen
      setOrderComplete(true);

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("حدث خطأ أثناء إنشاء الطلب. الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to home page
  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="text-white flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            <span>العودة إلى المتجر</span>
          </Link>
          <h1 className="text-2xl font-bold text-white text-center mt-2">
            {orderComplete ? "تم استلام طلبك" : "إتمام الطلب"}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {orderComplete ? (
          /* Order Complete Screen */
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              شكراً لك! تم استلام طلبك بنجاح
            </h2>
            <p className="text-gray-600 mb-4">
              لقد تم استلام طلبك وسيتم معالجته قريباً. رقم طلبك هو:
            </p>
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <span className="font-mono font-bold text-lg">{orderId}</span>
            </div>
            <p className="text-gray-600 mb-8">
              سيتم إرسال تفاصيل الطلب والشحن إلى بريدك الإلكتروني في غضون 24
              ساعة.
            </p>
            <button
              onClick={handleContinueShopping}
              className="bg-gradient-to-r from-amber-400 to-amber-500 text-white py-3 px-6 rounded-full font-semibold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg w-full max-w-xs mx-auto"
            >
              العودة إلى التسوق
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  ملخص الطلب
                </h2>

                {/* Cart Items */}
                <div className="divide-y mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 flex gap-3 items-center">
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
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
                          <span className="text-gray-500">
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي</span>
                    <span className="font-medium">{getSubtotal()}₪</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رسوم التوصيل</span>
                    <span className="font-medium">
                      {getShippingCost() === 0
                        ? "مجاني"
                        : `${getShippingCost()}₪`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>الإجمالي</span>
                    <span>{getTotal()}₪</span>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {getShippingCost() > 0 && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <p className="text-amber-700">
                      أضف {300 - getSubtotal()}₪ أخرى للحصول على شحن مجاني!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  معلومات الشحن والدفع
                </h2>

                <form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <User className="h-5 w-5 ml-2 text-amber-500" />
                      المعلومات الشخصية
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div
                        className={`${errors.fullName ? "error-field" : ""}`}
                      >
                        <label
                          className="block text-gray-700 mb-2"
                          htmlFor="fullName"
                        >
                          الاسم الكامل <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border ${
                            errors.fullName
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent`}
                          placeholder="أدخل الاسم الكامل"
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className={`${errors.email ? "error-field" : ""}`}>
                        <label
                          className="block text-gray-700 mb-2"
                          htmlFor="email"
                        >
                          البريد الإلكتروني{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pr-12 border ${
                              errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent`}
                            placeholder="أدخل البريد الإلكتروني"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className={`${errors.phone ? "error-field" : ""}`}>
                        <label
                          className="block text-gray-700 mb-2"
                          htmlFor="phone"
                        >
                          رقم الهاتف <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pr-12 border ${
                              errors.phone
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent`}
                            placeholder="أدخل رقم الهاتف"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 ml-2 text-amber-500" />
                      عنوان الشحن
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Address */}
                      <div
                        className={`md:col-span-2 ${
                          errors.address ? "error-field" : ""
                        }`}
                      >
                        <label
                          className="block text-gray-700 mb-2"
                          htmlFor="address"
                        >
                          العنوان <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pr-12 border ${
                              errors.address
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent`}
                            placeholder="أدخل العنوان التفصيلي"
                          />
                        </div>
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.address}
                          </p>
                        )}
                      </div>

                      {/* City */}
                      <div className={`${errors.city ? "error-field" : ""}`}>
                        <label
                          className="block text-gray-700 mb-2"
                          htmlFor="city"
                        >
                          المدينة <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border ${
                            errors.city ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent`}
                          placeholder="أدخل المدينة"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 ml-2 text-amber-500" />
                      طريقة الدفع
                    </h3>

                    <div className="space-y-3">
                      {/* Cash on Delivery */}
                      <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-amber-400 cursor-pointer">
                        <input
                          type="radio"
                          id="cashOnDelivery"
                          name="paymentMethod"
                          value="cashOnDelivery"
                          checked={formData.paymentMethod === "cashOnDelivery"}
                          onChange={handleChange}
                          className="h-5 w-5 text-amber-500 focus:ring-amber-400 ml-3"
                        />
                        <label
                          htmlFor="cashOnDelivery"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">الدفع عند الاستلام</div>
                          <p className="text-sm text-gray-500">
                            ادفع نقداً عند استلام طلبك
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-gradient-to-r from-amber-400 to-amber-500 text-white py-4 px-6 rounded-full font-semibold text-lg w-full hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2">جاري تنفيذ الطلب...</span>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      "تأكيد الطلب"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
