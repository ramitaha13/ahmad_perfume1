import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  UserPlus,
  ShoppingBag,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";

const AdminDashboard = () => {
  const [username, setUsername] = useState("");
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

  // Handle logout - remove user from localStorage and navigate to home
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-8 text-center relative">
        <div className="absolute top-4 right-4">
          <Link
            to="/"
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <Home className="h-5 w-5 ml-1" />
            <span className="hidden sm:inline">العودة للمتجر</span>
          </Link>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            لوحة الإحصائيات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-500 mb-2">0</div>
              <div className="text-gray-600">إجمالي المنتجات</div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">0</div>
              <div className="text-gray-600">إجمالي المستخدمين</div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">0</div>
              <div className="text-gray-600">طلبات جديدة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
