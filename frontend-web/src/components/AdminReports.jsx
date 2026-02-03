import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  FileText,
  Shield,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  Download,
  Eye,
  Calendar,
  Database,
  Activity
} from 'lucide-react';

const AdminReports = ({ onGenerateReport }) => {
  const reportTypes = [
    {
      id: 'user-activity',
      title: 'User Activity Report',
      description: 'Comprehensive user activity and engagement metrics',
      frequency: 'Monthly',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      details: [
        'User registration trends',
        'Login activity patterns',
        'Content engagement metrics',
        'Feature usage statistics'
      ]
    },
    {
      id: 'system-performance',
      title: 'System Performance',
      description: 'Server performance and resource utilization',
      frequency: 'Real-time',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      details: [
        'Server response times',
        'Database performance metrics',
        'Memory and CPU usage',
        'Network throughput'
      ]
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      description: 'Security events and potential threats',
      frequency: 'Daily',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      details: [
        'Authentication attempts',
        'Suspicious activity logs',
        'System vulnerabilities',
        'Compliance status'
      ]
    },
    {
      id: 'financial-summary',
      title: 'Financial Summary',
      description: 'Revenue, payments, and financial analytics',
      frequency: 'Weekly',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      details: [
        'Payment processing reports',
        'Revenue analytics',
        'Subscription metrics',
        'Expense tracking'
      ]
    },
    {
      id: 'content-analytics',
      title: 'Content Analytics',
      description: 'Course performance and content engagement',
      frequency: 'Monthly',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      details: [
        'Course completion rates',
        'Content popularity metrics',
        'Student progress tracking',
        'Assessment performance'
      ]
    },
    {
      id: 'user-feedback',
      title: 'User Feedback Analysis',
      description: 'User satisfaction and feedback trends',
      frequency: 'Weekly',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      details: [
        'Feedback sentiment analysis',
        'Feature request trends',
        'User satisfaction scores',
        'Support ticket analytics'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Export All Reports',
      description: 'Download all available reports in CSV format',
      icon: Download,
      action: 'export-all'
    },
    {
      title: 'Schedule Reports',
      description: 'Set up automated report generation',
      icon: Calendar,
      action: 'schedule'
    },
    {
      title: 'Custom Report',
      description: 'Create a custom report with specific parameters',
      icon: Database,
      action: 'custom'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h3 className="text-lg font-medium text-gray-900">System Reports</h3>
          <p className="text-sm text-gray-600">Access and generate comprehensive system reports</p>
        </div>
        <button 
          onClick={() => onGenerateReport('custom')}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </motion.div>

      {/* Report Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {reportTypes.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-lg flex items-center justify-center`}>
                  <report.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <span className="text-sm text-gray-500">{report.frequency}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => onGenerateReport(report.id)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button 
                  onClick={() => onGenerateReport(report.id, 'download')}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <div className="space-y-2">
              {report.details.map((detail, detailIndex) => (
                <div key={detailIndex} className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => onGenerateReport(action.action)}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <action.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h5 className="font-medium text-gray-900">{action.title}</h5>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* System Health Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reports Generated</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Generated</p>
              <p className="text-2xl font-bold text-gray-900">2 hours ago</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">45%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Report Activity</h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            {
              id: 1,
              title: 'Monthly User Activity Report',
              status: 'completed',
              time: '2 hours ago',
              icon: Users,
              color: 'text-blue-600'
            },
            {
              id: 2,
              title: 'Security Audit Report',
              status: 'completed',
              time: '4 hours ago',
              icon: Shield,
              color: 'text-red-600'
            },
            {
              id: 3,
              title: 'System Performance Report',
              status: 'in_progress',
              time: 'Just now',
              icon: Activity,
              color: 'text-green-600'
            }
          ].map((activity) => (
            <div key={activity.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : activity.status === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {activity.status === 'completed' ? 'Completed' : 
                 activity.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminReports;