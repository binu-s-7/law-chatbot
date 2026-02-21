'use client';


import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const supabase = createClientComponentClient();
    const notificationTimeout = 15000; // Timeout duration in milliseconds (e.g., 5000ms = 5 seconds)

    useEffect(() => {
        // Subscribe to real-time updates
        const notificationListener = supabase.channel('custom-all-channel')
            .on('postgres_changes', {event: '*', schema: 'public', table: 'notification'},
                (payload) => {
                    console.log('Change received!', payload);
                    const newNotification = payload.new || payload;
                    // Add new notification to the list
                    setNotifications(prev => [...prev, newNotification]);

                    // Set timeout to automatically remove this notification
                    setTimeout(() => {
                        removeNotification(newNotification.id);
                    }, notificationTimeout);
                })
            .subscribe();

        return () => {
            // Unsubscribe when component unmounts
            supabase.removeChannel(notificationListener);
        };
    }, [supabase]); // Dependency on the supabase instance

    const removeNotification = (notificationId) => {
        // Remove notification by id
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    return (
        <div>
            {notifications.map((notification, index) => (
                <div key={notification.id || index} className="fixed bottom-5 right-5 bg-white p-2.5 rounded-lg shadow-md z-50 space-x-3">
                    {notification.title}  {notification.body}
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                        X
                    </button>
                </div>
            ))}
        </div>
    );
}
