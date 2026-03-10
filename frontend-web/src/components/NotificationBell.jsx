import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  X, 
  CheckCircle, 
  Clock, 
  Mail, 
  User, 
  GraduationCap,
  Shield,
  AlertCircle
} from 'lucide-react';
import { GET_NOTIFICATIONS, MARK_AS_READ_NOTIFICATION, MARK_AS_READ_ALL_NOTIFICATIONS, DELETE_NOTIFICATION } from '../graphql/notification';


const NotificationBell = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [newNotificationSound, setNewNotificationSound] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId },
    pollInterval: 30000, // Poll every 30 seconds
  });

  const [markAsRead] = useMutation(MARK_AS_READ_NOTIFICATION);
  const [markAllAsRead] = useMutation(MARK_AS_READ_ALL_NOTIFICATIONS);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  const notifications = data?.myNotifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Check for new notifications and play sound
  useEffect(() => {
    if (unreadCount > previousUnreadCount && previousUnreadCount > 0) {
      // New notification arrived
      setNewNotificationSound(true);
      // Trigger browser notification if permission is granted
      if (Notification.permission === 'granted') {
        const latestNotification = notifications.find(n => !n.isRead);
        if (latestNotification) {
          new Notification(latestNotification.title, {
            body: latestNotification.content,
            icon: '/favicon.ico',
            tag: 'fidel-ai-notification'
          });
        }
      }
      setTimeout(() => setNewNotificationSound(false), 100);
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount, notifications]);

  useEffect(() => {
    // Listen for new notifications via WebSocket or polling
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ variables: { id: notificationId } });
      refetch();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetch();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification({ variables: { id: notificationId } });
      refetch();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('enrollment') || titleLower.includes('batch')) {
      return <GraduationCap className="w-5 h-5" />;
    } else if (titleLower.includes('verification') || titleLower.includes('admin')) {
      return <Shield className="w-5 h-5" />;
    } else if (titleLower.includes('feedback') || titleLower.includes('review')) {
      return <User className="w-5 h-5" />;
    } else if (titleLower.includes('payment') || titleLower.includes('fee')) {
      return <Mail className="w-5 h-5" />;
    } else if (titleLower.includes('schedule') || titleLower.includes('class')) {
      return <Clock className="w-5 h-5" />;
    } else {
      return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('enrollment') || titleLower.includes('batch')) {
      return 'text-blue-600 bg-blue-50';
    } else if (titleLower.includes('verification') || titleLower.includes('admin')) {
      return 'text-purple-600 bg-purple-50';
    } else if (titleLower.includes('feedback') || titleLower.includes('review')) {
      return 'text-green-600 bg-green-50';
    } else if (titleLower.includes('payment') || titleLower.includes('fee')) {
      return 'text-orange-600 bg-orange-50';
    } else if (titleLower.includes('schedule') || titleLower.includes('class')) {
      return 'text-indigo-600 bg-indigo-50';
    } else {
      return 'text-gray-600 bg-gray-50';
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-sm text-gray-500">({unreadCount} unread)</span>
                )}
              </div>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  Error loading notifications
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.title)}`}>
                          {getNotificationIcon(notification.title)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            )}
                          </div>
                          <p 
                            className="text-sm text-gray-600 mt-1 line-clamp-2 cursor-pointer hover:text-gray-900"
                            onClick={() => setSelectedNotification(notification)}
                          >
                            {notification.content}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            <div className="flex space-x-1">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 text-center font-medium"
                >
                  {showAll ? 'Show less' : `Show all ${notifications.length} notifications`}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Full Text Popup */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(selectedNotification.title)}`}>
                      {getNotificationIcon(selectedNotification.title)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {selectedNotification.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedNotification.content}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    {!selectedNotification.isRead && (
                      <button
                        onClick={() => {
                          handleMarkAsRead(selectedNotification.id);
                          setSelectedNotification(null);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleDeleteNotification(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
