import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Video, 
  Calendar,
  BarChart,
  Bell,
  Settings,
  LogOut,
  User
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { icon: <BookOpen className="w-6 h-6" />, label: 'Active Courses', value: '3', color: 'bg-blue-100 text-blue-600' },
    { icon: <Video className="w-6 h-6" />, label: 'Live Sessions', value: '2', color: 'bg-green-100 text-green-600' },
    { icon: <Calendar className="w-6 h-6" />, label: 'Upcoming Classes', value: '5', color: 'bg-purple-100 text-purple-600' },
    { icon: <BarChart className="w-6 h-6" />, label: 'Learning Hours', value: '24', color: 'bg-orange-100 text-orange-600' },
  ];

  const recentActivities = [
    { action: 'Completed lesson', course: 'Business English', time: '2 hours ago' },
    { action: 'Joined live class', course: 'Grammar Mastery', time: '1 day ago' },
    { action: 'Submitted assignment', course: 'Speaking Practice', time: '2 days ago' },
    { action: 'Earned certificate', course: 'Beginner Level', time: '1 week ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Fidel<span className="text-indigo-600">AI</span> Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <button className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user.firstName}!
          </h1>
          <p className="text-gray-600">
            Welcome back to your English learning journey. Continue where you left off.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow border">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <BookOpen className="w-5 h-5" />, label: 'Continue Learning', color: 'bg-blue-50 text-blue-600' },
                  { icon: <Video className="w-5 h-5" />, label: 'Join Class', color: 'bg-green-50 text-green-600' },
                  { icon: <Users className="w-5 h-5" />, label: 'Community', color: 'bg-purple-50 text-purple-600' },
                  { icon: <Settings className="w-5 h-5" />, label: 'Settings', color: 'bg-gray-50 text-gray-600' },
                ].map((action, index) => (
                  <button
                    key={index}
                    className={`${action.color} p-4 rounded-lg hover:opacity-90 transition flex flex-col items-center justify-center`}
                  >
                    {action.icon}
                    <span className="mt-2 text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.course}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Classes */}
          <div>
            <div className="bg-white rounded-xl shadow border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Classes</h2>
              <div className="space-y-4">
                {[
                  { time: '10:00 AM', title: 'Business Communication', tutor: 'Dr. Alemayehu' },
                  { time: '02:00 PM', title: 'Grammar Workshop', tutor: 'Ms. Birhanu' },
                  { time: '04:30 PM', title: 'Speaking Practice', tutor: 'Mr. Getachew' },
                ].map((classItem, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <p className="text-sm text-gray-500">{classItem.time}</p>
                    <p className="font-medium text-gray-900">{classItem.title}</p>
                    <p className="text-sm text-gray-600">with {classItem.tutor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Grammar</span>
                    <span className="text-sm font-medium text-gray-700">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Vocabulary</span>
                    <span className="text-sm font-medium text-gray-700">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Speaking</span>
                    <span className="text-sm font-medium text-gray-700">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;