import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../firebase"; // Make sure this path is correct for your project
import {
  UserPlus,
  Save,
  X,
  Eye,
  EyeOff,
  Trash,
  Check,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AddUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch existing users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const usersCollection = collection(firestore, "Users");
        const querySnapshot = await getDocs(usersCollection);

        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setUsers(usersList);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate form
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة. يرجى التحقق من البيانات المدخلة.");
      setIsLoading(false);
      return;
    }

    try {
      // Check if username already exists
      const usersRef = collection(firestore, "Users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("اسم المستخدم موجود بالفعل. يرجى اختيار اسم مستخدم آخر.");
        setIsLoading(false);
        return;
      }

      // Add new user to Firestore
      await addDoc(collection(firestore, "Users"), {
        username,
        password,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setSuccess("تم إضافة المستخدم بنجاح");

      // Refresh users list
      const updatedSnapshot = await getDocs(collection(firestore, "Users"));
      const updatedUsers = [];
      updatedSnapshot.forEach((doc) => {
        updatedUsers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setUsers(updatedUsers);
    } catch (err) {
      console.error("Error adding user:", err);
      setError("حدث خطأ أثناء إضافة المستخدم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(firestore, "Users", userId));

      // Update users list
      setUsers(users.filter((user) => user.id !== userId));
      setSuccess("تم حذف المستخدم بنجاح");
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("حدث خطأ أثناء حذف المستخدم. يرجى المحاولة مرة أخرى.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get current logged in username
  const currentUser = localStorage.getItem("user");

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 py-8 text-center relative">
        <div className="absolute top-4 right-4">
          <Link
            to="/managerPage"
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowRight className="h-5 w-5 ml-1" />
            <span className="hidden sm:inline">العودة للوحة التحكم</span>
          </Link>
        </div>

        <div className="flex items-center justify-center mb-2">
          <UserPlus className="h-7 w-7 text-white mx-2" />
          <h1 className="text-2xl font-bold text-white">إدارة المستخدمين</h1>
        </div>
        <p className="text-white/90 text-sm">
          إضافة وإدارة المستخدمين المسموح لهم بالوصول إلى لوحة التحكم
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add User Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <UserPlus className="h-5 w-5 text-amber-500 ml-2" />
              إضافة مستخدم جديد
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start">
                <X className="h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-start">
                <Check className="h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="أدخل اسم المستخدم"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="أدخل كلمة المرور"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="أعد إدخال كلمة المرور"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
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
                    جاري الإضافة...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Save className="h-5 w-5 ml-2" />
                    إضافة المستخدم
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-500 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              المستخدمون الحاليون
            </h2>

            {isLoadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لم يتم العثور على أي مستخدمين
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {user.username}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {user.createdAt
                          ? new Date(
                              user.createdAt.seconds * 1000
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "غير متوفر"}
                      </p>
                    </div>

                    {/* Don't allow deleting the current logged in user */}
                    {user.username !== currentUser &&
                      (deleteConfirm === user.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            تأكيد
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="حذف المستخدم"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
