import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { NotificationCard } from '../reusable/NotificationCard';
import { apiURL } from '../apiURL.JSX';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            const userId = localStorage.getItem("user_id");
            try {
                const res = await fetch(`${apiURL}/api/notifications/${userId}`);
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }
                const data = await res.json();
                setNotifications(data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false); // <-- important
            }
        };

        fetchNotifications();
    }, []);

    return (
        <>
            <Navbar />
            <div className="pt-36 px-4 min-h-screen bg-gray-50">
                {loading ? (
                    <p className="text-center text-gray-500">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <p className="text-center text-gray-500">No notifications found.</p>
                ) : (
                    notifications.map((note) => <NotificationCard key={note.id} {...note} />)
                )}
            </div>

        </>
    );
};

export default Notification;
