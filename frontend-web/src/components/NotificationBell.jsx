import React, { useState, useEffect, useRef } from 'react';
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 72, left: 0 });
  const bellButtonRef = useRef(null);
  
  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    pollInterval: 30000,
  });

  const [markAsRead] = useMutation(MARK_AS_READ_NOTIFICATION);
  const [markAllAsRead] = useMutation(MARK_AS_READ_ALL_NOTIFICATIONS);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  const notifications = data?.myNotifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Check for new notifications and trigger browser notification when allowed
  useEffect(() => {
    if (unreadCount > previousUnreadCount && previousUnreadCount > 0) {
      setNewNotificationSound(true);

      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        const latestNotification = notifications.find((n) => !n.isRead);
        if (latestNotification) {
          new window.Notification(latestNotification.title, {
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
      return 'text-blue-300 bg-blue-500/10 border border-blue-500/20';
    } else if (titleLower.includes('verification') || titleLower.includes('admin')) {
      return 'text-purple-300 bg-purple-500/10 border border-purple-500/20';
    } else if (titleLower.includes('feedback') || titleLower.includes('review')) {
      return 'text-green-300 bg-green-500/10 border border-green-500/20';
    } else if (titleLower.includes('payment') || titleLower.includes('fee')) {
      return 'text-orange-300 bg-orange-500/10 border border-orange-500/20';
    } else if (titleLower.includes('schedule') || titleLower.includes('class')) {
      return 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20';
    } else {
      return 'text-accent-muted bg-white/5 border border-white/10';
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  const updateDropdownPosition = () => {
    if (!bellButtonRef.current || typeof window === 'undefined') return;

    const rect = bellButtonRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(384, window.innerWidth - 16);
    const left = Math.min(Math.max(8, rect.right - dropdownWidth), window.innerWidth - dropdownWidth - 8);

    setDropdownPosition({
      top: rect.bottom + 12,
      left,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();

    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen]);

  const handleToggleOpen = () => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
        window.Notification.requestPermission().catch(() => {});
      }

      updateDropdownPosition();
    }

    setIsOpen(!isOpen);
  };

  return (
    <div className="relative z-[100]">
      <button
        ref={bellButtonRef}
        onClick={handleToggleOpen}
        className={`relative p-3 rounded-2xl transition-all border ${
          unreadCount > 0
            ? 'bg-primary text-[#080C14] border-primary/40 yellow-glow hover:scale-105'
            : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
        }`}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className={`w-5 h-5 ${newNotificationSound ? 'animate-pulse' : ''}`} />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-black border border-white/20">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed w-96 max-w-[calc(100vw-1rem)] glass-premium rounded-[1.5rem] shadow-2xl border border-white/10 z-[1000] overflow-hidden bg-[#0D1B2A]/95 backdrop-blur-xl"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-brand-yellow" />
                <h3 className="font-black text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-accent-secondary">({unreadCount} unread)</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-brand-yellow hover:text-white font-bold uppercase tracking-wider"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-accent-muted hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="p-6 text-center text-accent-secondary">Loading notifications...</div>
              ) : error ? (
                <div className="p-6 text-center text-red-400">Error loading notifications</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-accent-secondary">No notifications yet</div>
              ) : (
                <div className="divide-y divide-white/10">
                  {displayedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors ${!notification.isRead ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-xl ${getNotificationColor(notification.title)}`}>
                          {getNotificationIcon(notification.title)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-white text-sm line-clamp-1">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-brand-yellow rounded-full"></div>
                            )}
                          </div>
                          <p
                            className="text-sm text-accent-secondary mt-1 line-clamp-2 cursor-pointer hover:text-white"
                            onClick={() => setSelectedNotification(notification)}
                          >
                            {notification.content}
                          </p>
                          <div className="flex items-center justify-between mt-3 gap-2">
                            <span className="text-xs text-accent-muted">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs text-brand-yellow hover:text-white font-bold"
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-xs text-red-400 hover:text-red-300 font-bold"
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

            {notifications.length > 5 && (
              <div className="border-t border-white/10 p-3 bg-white/5">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full text-sm text-accent-secondary hover:text-white text-center font-bold"
                >
                  {showAll ? 'Show less' : `Show all ${notifications.length} notifications`}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && <div className="fixed inset-0 z-[900]" onClick={() => setIsOpen(false)}></div>}

      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[1100] p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-premium rounded-[1.5rem] shadow-2xl max-w-md w-full border border-white/10 bg-[#0D1B2A]/95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${getNotificationColor(selectedNotification.title)}`}>
                      {getNotificationIcon(selectedNotification.title)}
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg">
                        {selectedNotification.title}
                      </h3>
                      <p className="text-sm text-accent-muted">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="p-1 rounded-lg text-accent-muted hover:text-white hover:bg-white/5"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-accent-secondary whitespace-pre-wrap leading-relaxed">
                    {selectedNotification.content}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 gap-3">
                  <div className="flex flex-wrap gap-2">
                    {!selectedNotification.isRead && (
                      <button
                        onClick={() => {
                          handleMarkAsRead(selectedNotification.id);
                          setSelectedNotification(null);
                        }}
                        className="px-4 py-2 bg-primary text-[#080C14] rounded-xl hover:opacity-90 text-sm font-black yellow-glow"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleDeleteNotification(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-bold"
                    >
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="px-4 py-2 text-accent-secondary hover:text-white text-sm font-bold"
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
