import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  UserPlus,
  ShoppingBag,
  LogOut,
  List,
  ChevronRight,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { firestore } from "../firebase"; // Make sure this path is correct for your project

const AdminDashboard = () => {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({
    perfumes: 0,
    users: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }
    setUsername(user);
  }, [navigate]);

  // Fetch statistics from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Get perfumes count
        const perfumesCountSnapshot = await getCountFromServer(
          collection(firestore, "perfumes")
        );
        const perfumesCount = perfumesCountSnapshot.data().count;

        // Get users count
        const usersCountSnapshot = await getCountFromServer(
          collection(firestore, "Users")
        );
        const usersCount = usersCountSnapshot.data().count;

        // Get orders count - if you have an orders collection
        // Assuming you have an orders collection. If not, keep it at 0
        let ordersCount = 0;
        try {
          const ordersCountSnapshot = await getCountFromServer(
            collection(firestore, "orders")
          );
          ordersCount = ordersCountSnapshot.data().count;
        } catch (err) {
          console.log("Orders collection may not exist yet:", err);
          // Keep ordersCount as 0
        }

        setStats({
          perfumes: perfumesCount,
          users: usersCount,
          orders: ordersCount,
        });
      } catch (err) {
        console.error("Error fetching statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Handle logout - remove user from localStorage and navigate to home
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-8 text-center relative">
        <div className="absolute top-4 left-4">
          <button
            onClick={handleLogout}
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>

        <div className="flex items-center justify-center mb-2">
          <Package className="h-8 w-8 text-white mx-2" />
          <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
        </div>

        <p className="text-white/90">
          مرحباً {username}، اختر الخيار المناسب من اللوحة أدناه
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Add Perfume Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="h-24 bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center">
              <Package className="h-12 w-12 text-white" />
            </div>
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                إضافة عطر جديد
              </h2>
              <p className="text-gray-600 mb-6">
                إضافة منتجات جديدة إلى المتجر
              </p>
              <Link
                to="/addnewperfume"
                className="inline-flex items-center justify-center px-5 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors group-hover:bg-amber-600 w-full"
              >
                <span>إضافة عطر جديد</span>
                <ChevronRight className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Manage Perfumes Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="h-24 bg-gradient-to-r from-amber-300 to-amber-400 flex items-center justify-center">
              <List className="h-12 w-12 text-white" />
            </div>
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                إدارة العطور
              </h2>
              <p className="text-gray-600 mb-6">
                عرض وتعديل وحذف العطور الحالية
              </p>
              <Link
                to="/managePerfumes"
                className="inline-flex items-center justify-center px-5 py-3 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors group-hover:bg-amber-500 w-full"
              >
                <span>إدارة العطور</span>
                <ChevronRight className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Manage Users Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="h-24 bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
              <UserPlus className="h-12 w-12 text-white" />
            </div>
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                إدارة المستخدمين
              </h2>
              <p className="text-gray-600 mb-6">
                إضافة وحذف مستخدمي لوحة التحكم
              </p>
              <Link
                to="/addnewuser"
                className="inline-flex items-center justify-center px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors group-hover:bg-blue-600 w-full"
              >
                <span>إدارة المستخدمين</span>
                <ChevronRight className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="h-24 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-white" />
            </div>
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">الطلبات</h2>
              <p className="text-gray-600 mb-6">عرض وإدارة طلبات العملاء</p>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors group-hover:bg-green-600 w-full"
              >
                <span>إدارة الطلبات</span>
                <ChevronRight className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-right">
            لوحة الإحصائيات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Products Stats */}
            <div className="border border-gray-200 rounded-lg p-4 text-center relative overflow-hidden">
              {loading ? (
                <div className="animate-pulse h-12 w-12 bg-amber-200 rounded-full mx-auto mb-2"></div>
              ) : (
                <div className="text-5xl font-bold text-amber-500 mb-2">
                  {stats.perfumes}
                </div>
              )}
              <div className="text-gray-600">إجمالي المنتجات</div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-50 rounded-full opacity-50"></div>
            </div>

            {/* Users Stats */}
            <div className="border border-gray-200 rounded-lg p-4 text-center relative overflow-hidden">
              {loading ? (
                <div className="animate-pulse h-12 w-12 bg-blue-200 rounded-full mx-auto mb-2"></div>
              ) : (
                <div className="text-5xl font-bold text-blue-500 mb-2">
                  {stats.users}
                </div>
              )}
              <div className="text-gray-600">إجمالي المستخدمين</div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
            </div>

            {/* Orders Stats */}
            <div className="border border-gray-200 rounded-lg p-4 text-center relative overflow-hidden">
              {loading ? (
                <div className="animate-pulse h-12 w-12 bg-green-200 rounded-full mx-auto mb-2"></div>
              ) : (
                <div className="text-5xl font-bold text-green-500 mb-2">
                  {stats.orders}
                </div>
              )}
              <div className="text-gray-600">طلبات جديدة</div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-green-50 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
