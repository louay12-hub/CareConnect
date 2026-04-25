import React, { useState, useEffect } from "react";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const apiURL = "http://localhost:5000/api";

  // Fetch notifications based on user_id from backend
  const fetchNotifications = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
      const res = await fetch(`${apiURL}/notifications/${userId}`);
      const data = await res.json();

      // Map backend data to notification format
      const formatted = data.map((item) => ({
        id: item.id,
        title: item.title || "New Notification",
        message: item.message,
        date: new Date(item.created_at).toLocaleString(),
        type: item.type || "info",
      }));

      // Apply read and deleted status from localStorage
      const readStatus = JSON.parse(localStorage.getItem("readNotifications")) || [];
      const deletedStatus = JSON.parse(localStorage.getItem("deletedNotifications")) || [];

      const finalNotifications = formatted
        .filter((notif) => !deletedStatus.includes(notif.id))
        .map((notif) => ({
          ...notif,
          read: readStatus.includes(notif.id),
        }));

      setNotifications(finalNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );

    const readStatus = JSON.parse(localStorage.getItem("readNotifications")) || [];
    if (!readStatus.includes(id)) {
      readStatus.push(id);
      localStorage.setItem("readNotifications", JSON.stringify(readStatus));
    }
  };

  // Delete a notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));

    const deletedStatus = JSON.parse(localStorage.getItem("deletedNotifications")) || [];
    if (!deletedStatus.includes(id)) {
      deletedStatus.push(id);
      localStorage.setItem("deletedNotifications", JSON.stringify(deletedStatus));
    }
  };

  // Notification type styling
  const typeColor = (type) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-700";
      case "success":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {notifications.length === 0 && (
          <p className="text-gray-500 text-center">No notifications</p>
        )}
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded border flex justify-between items-start gap-4 ${
              notif.read ? "opacity-60" : "opacity-100"
            }`}
          >
            <div>
              <div
                className={`inline-block px-2 py-1 rounded text-sm font-medium mb-1 ${typeColor(
                  notif.type
                )}`}
              >
                {notif.type.toUpperCase()}
              </div>
              <h3 className="font-semibold">{notif.title}</h3>
              <p className="text-gray-600">{notif.message}</p>
              <p className="text-gray-400 text-xs mt-1">{notif.date}</p>
            </div>
            <div className="flex flex-col gap-2">
              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => deleteNotification(notif.id)}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
