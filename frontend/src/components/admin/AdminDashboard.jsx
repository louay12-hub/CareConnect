import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Mail,
  Bell,
  Hospital,
  Stethoscope,
  Menu,
  X,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { apiURL } from "../apiURL.JSX";
import Appointments from "./Appointments";
import Contact from "./Contact";
import Notification from "./Notification";
import Equipment from "./Equipment";
import Hospital_av from "./Hospital_av";
import ManageUsers from "./ManageUsers";

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ username: "", email: "" });
  const [notificationCount, setNotificationCount] = useState(0);

  // Render the main content
  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <ManageUsers />;
      case "appointments":
        return <Appointments />;
      case "contacts":
        return <Contact />;
      case "notifications":
        return <Notification />;
      case "hospital":
        return <Hospital_av />;
     
      default:
        return null;
    }
  };

  // Fetch admin info
  useEffect(() => {
    const fetchAdminInfo = async () => {
      const user_role = localStorage.getItem("user_role");
      if (!user_role) return;

      try {
        const response = await fetch(`${apiURL}/api/users/role/${user_role}`);
        if (!response.ok) throw new Error("Failed to fetch admin info");

        const data = await response.json();
        if (data.length > 0) {
          setAdminInfo({ username: data[0].username, email: data[0].email });
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${apiURL}/api/notifications`);
        if (!response.ok) throw new Error("Failed to fetch notifications");

        const data = await response.json();
        setNotificationCount(data.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchAdminInfo();
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    window.location.href = "/login";
  };

  // Sidebar buttons configuration
  const sidebarItems = [
    { id: "users", label: "Users", icon: <Users /> },
    { id: "appointments", label: "Appointments", icon: <Calendar /> },
    { id: "contacts", label: "Contacts", icon: <Mail /> },
    { id: "notifications", label: "Notifications", icon: <Bell />, badge: notificationCount },
    { id: "hospital", label: "Hospitals", icon: <Hospital /> },
  ];

  const renderSidebarButton = (item) => (
    <button
      key={item.id}
      onClick={() => setActivePage(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${activePage === item.id ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"}`}
    >
      <div className="relative inline-block">
        {item.icon}
        {item.badge > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
            {item.badge}
          </span>
        )}
      </div>
      {sidebarOpen && <span>{item.label}</span>}
    </button>
  );


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col bg-white shadow-lg p-4 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold text-blue-600 ${!sidebarOpen && "hidden"}`}>CareConnect</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-blue-600">
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        <nav className="space-y-2 flex-1">{sidebarItems.map(renderSidebarButton)}</nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 transition"
          >
            <LogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebar && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setMobileSidebar(false)}></div>
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-4 flex flex-col z-50 md:hidden transition-all">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-blue-600">CareConnect</h1>
              <button onClick={() => setMobileSidebar(false)} className="text-gray-600 hover:text-blue-600">
                <X />
              </button>
            </div>
            <nav className="space-y-2 flex-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileSidebar(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${activePage === item.id ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                >
                  <div className="relative">
                    {item.icon}
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 transition"
              >
                <LogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white shadow px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebar(true)} className="md:hidden text-gray-600 hover:text-blue-600">
              <Menu />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>

          <div className="relative">
            <button onClick={() => setShowAccount(!showAccount)} className="flex items-center gap-2">
              <UserCircle2 className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            </button>
            {showAccount && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-gray-800">{adminInfo.username || "Loading..."}</p>
                <p className="text-gray-500 text-xs mb-3">{adminInfo.email || "Fetching..."}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto flex-1 bg-gray-50">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
