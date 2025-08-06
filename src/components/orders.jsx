import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  Trash2, // Added for delete icon
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy as firestoreOrderBy,
  Timestamp,
  doc,
  deleteDoc, // Import deleteDoc function
} from "firebase/firestore";
import { firestore } from "../firebase";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [deleting, setDeleting] = useState(false); // State to track delete operation
  const [deleteError, setDeleteError] = useState(null); // State to track delete errors

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Create base query
        let ordersQuery = collection(firestore, "orders");

        // Add sorting
        if (sortBy === "date-desc") {
          ordersQuery = query(
            ordersQuery,
            firestoreOrderBy("createdAt", "desc")
          );
        } else if (sortBy === "date-asc") {
          ordersQuery = query(
            ordersQuery,
            firestoreOrderBy("createdAt", "asc")
          );
        } else if (sortBy === "total-desc") {
          ordersQuery = query(ordersQuery, firestoreOrderBy("total", "desc"));
        } else if (sortBy === "total-asc") {
          ordersQuery = query(ordersQuery, firestoreOrderBy("total", "asc"));
        }

        const querySnapshot = await getDocs(ordersQuery);
        const ordersList = [];

        querySnapshot.forEach((doc) => {
          // Add the document ID and data to our orders list
          ordersList.push({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to JS Date
            createdAt:
              doc.data().createdAt instanceof Timestamp
                ? doc.data().createdAt.toDate()
                : new Date(),
          });
        });

        setOrders(ordersList);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [sortBy]);

  // Toggle order details expansion
  const toggleOrderExpansion = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId, event) => {
    // Stop the event from propagating to parent elements
    event.stopPropagation();

    // Confirm with the user before deletion
    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);

      // Reference to the order document
      const orderRef = doc(firestore, "orders", orderId);

      // Delete the order document
      await deleteDoc(orderRef);

      // Remove the order from the local state
      setOrders(orders.filter((order) => order.id !== orderId));

      // If the deleted order was expanded, collapse it
      if (expandedOrder === orderId) {
        setExpandedOrder(null);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      setDeleteError("حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter orders by search term
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();

    // Search by customer name
    if (order.customer?.fullName?.toLowerCase().includes(searchLower))
      return true;

    // Search by customer email
    if (order.customer?.email?.toLowerCase().includes(searchLower)) return true;

    // Search by customer phone
    if (order.customer?.phone?.toLowerCase().includes(searchLower)) return true;

    // Search by city
    if (order.customer?.city?.toLowerCase().includes(searchLower)) return true;

    return false;
  });

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/adminpage"
              className="text-white flex items-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              <span className="hidden md:inline">العودة إلى لوحة التحكم</span>
            </Link>
            <h1 className="text-2xl font-bold text-white text-center">
              إدارة الطلبات
            </h1>
            <div className="w-5 md:w-24"></div> {/* Smaller spacer on mobile */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن طلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Sort Filter */}
              <div className="relative inline-block">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  >
                    <option value="date-desc">الأحدث</option>
                    <option value="date-asc">الأقدم</option>
                    <option value="total-desc">السعر: الأعلى للأدنى</option>
                    <option value="total-asc">السعر: الأدنى للأعلى</option>
                  </select>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                title="تحديث"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-amber-400 border-t-transparent rounded-full"></div>
            <p className="text-gray-600">جاري تحميل الطلبات...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-600 p-6 rounded-lg inline-block">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {/* Delete Error */}
        {deleteError && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 ml-2" />
              <p>{deleteError}</p>
            </div>
          </div>
        )}

        {/* No Orders */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-6 rounded-lg inline-block">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                لا توجد طلبات
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "لم يتم العثور على نتائج مطابقة. حاول تغيير معايير البحث."
                  : "لا توجد طلبات حالياً. ستظهر الطلبات الجديدة هنا عند وصولها."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
                >
                  مسح البحث
                </button>
              )}
            </div>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                        {/* Customer Name */}
                        <div className="font-semibold text-lg">
                          {order.customer?.fullName}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 md:mt-0">
                        {/* Order Date */}
                        <div className="text-gray-500 text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </div>

                        {/* Order Total */}
                        <div className="font-bold text-lg">{order.total}₪</div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteOrder(order.id, e)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="حذف الطلب"
                          disabled={deleting}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        {/* Expand/Collapse Indicator */}
                        <div className="text-amber-500">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Customer Information */}
                        <div className="md:col-span-1">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <User className="h-4 w-4 ml-1 text-amber-500" />
                            معلومات الزبون
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start">
                              <User className="h-4 w-4 ml-2 mt-0.5 text-gray-400" />
                              <span className="flex-1">
                                {order.customer?.fullName}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <Mail className="h-4 w-4 ml-2 mt-0.5 text-gray-400" />
                              <span className="flex-1">
                                {order.customer?.email}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <Phone className="h-4 w-4 ml-2 mt-0.5 text-gray-400" />
                              <span className="flex-1">
                                {order.customer?.phone}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 ml-2 mt-0.5 text-gray-400" />
                              <div className="flex-1">
                                <div>{order.customer?.address}</div>
                                <div>{order.customer?.city}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="md:col-span-2">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <Package className="h-4 w-4 ml-1 text-amber-500" />
                            تفاصيل الطلب
                          </h3>

                          {/* Order Items */}
                          <div className="divide-y">
                            {order.items?.map((item) => (
                              <div
                                key={item.id}
                                className="py-3 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {item.quantity > 1 && `x${item.quantity}`}
                                  </div>
                                </div>
                                <div className="font-semibold">
                                  {item.price}₪
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Summary */}
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                المجموع الفرعي
                              </span>
                              <span>{order.subtotal}₪</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-gray-600">
                                رسوم التوصيل
                              </span>
                              <span>
                                {order.shipping === 0
                                  ? "مجاني"
                                  : `${order.shipping}₪`}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                              <span>الإجمالي</span>
                              <span>{order.total}₪</span>
                            </div>
                          </div>

                          {/* Payment Method */}
                          <div className="mt-4 flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 ml-1 text-amber-500" />
                            <span>
                              طريقة الدفع:
                              <span className="font-medium mr-1">
                                {order.paymentMethod === "cashOnDelivery"
                                  ? "الدفع عند الاستلام"
                                  : order.paymentMethod}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="flex flex-wrap gap-2 justify-end mt-6 pt-4 border-t">
                        {/* Delete Order (alternative position) */}
                        <button
                          onClick={(e) => handleDeleteOrder(order.id, e)}
                          className="flex items-center gap-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>حذف الطلب</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
