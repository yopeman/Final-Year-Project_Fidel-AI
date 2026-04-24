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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-1000"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">System Reports</h2>
              <p className="text-accent-secondary mt-1 font-medium flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Access and generate comprehensive system metrics
              </p>
            </div>
          </div>
          <button 
            onClick={() => onGenerateReport('custom')}
            className="group px-8 py-4 bg-primary text-[#080C14] rounded-2xl font-black uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,193,7,0.2)] flex items-center space-x-3 active:scale-95"
          >
            <Download className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
            <span>Produce Report</span>
          </button>
        </div>
      </div>

      {/* System Health Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="glass-premium rounded-3xl border border-white/10 p-6 flex items-center justify-between shadow-xl bg-white/5 backdrop-blur-md group hover:bg-white/10 transition-all">
          <div>
            <p className="text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Archived Reports</p>
            <p className="text-3xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors tracking-tight">1,234</p>
          </div>
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-7 h-7 text-blue-400" />
          </div>
        </div>

        <div className="glass-premium rounded-3xl border border-white/10 p-6 flex items-center justify-between shadow-xl bg-white/5 backdrop-blur-md group hover:bg-white/10 transition-all">
          <div>
            <p className="text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Latest Sync</p>
            <p className="text-2xl font-black text-white mt-2 tracking-tight group-hover:text-green-400 transition-colors">2 Hrs Ago</p>
          </div>
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
            <Clock className="w-7 h-7 text-green-400" />
          </div>
        </div>

        <div className="glass-premium rounded-3xl border border-white/10 p-6 flex items-center justify-between shadow-xl bg-white/5 backdrop-blur-md group hover:bg-white/10 transition-all">
          <div>
            <p className="text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Volume Capacity</p>
            <p className="text-3xl font-black text-white mt-1 tracking-tight group-hover:text-purple-400 transition-colors">45%</p>
          </div>
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
            <Database className="w-7 h-7 text-purple-400" />
          </div>
        </div>

        <div className="glass-premium rounded-3xl border border-white/10 p-6 flex items-center justify-between shadow-xl bg-green-500/5 backdrop-blur-md border-green-500/20 group hover:bg-green-500/10 transition-all cursor-crosshair">
          <div>
            <p className="text-[11px] font-black text-green-400/70 uppercase tracking-[0.2em] animate-pulse">Diagnostics</p>
            <p className="text-3xl font-black text-green-400 mt-1 tracking-tight">Optimal</p>
          </div>
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform animate-pulse">
            <Shield className="w-7 h-7 text-green-400" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-premium rounded-3xl border border-white/10 p-8 shadow-xl bg-white/5 backdrop-blur-md"
      >
        <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
          <Activity className="w-6 h-6 text-brand-indigo" />
          <h4 className="text-xl font-black text-white tracking-widest uppercase">Rapid Execution Links</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => onGenerateReport(action.action)}
              className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-indigo/50 hover:bg-brand-indigo/10 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] relative overflow-hidden w-full"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-brand-indigo/10 blur-xl rounded-full group-hover:bg-brand-indigo/20 transition-all"></div>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-brand-indigo/20 group-hover:border-brand-indigo/30 transition-all relative z-10 shrink-0">
                <action.icon className="w-6 h-6 text-brand-indigo" />
              </div>
              <div className="relative z-10 w-full text-left">
                <h5 className="font-bold text-white text-lg tracking-tight group-hover:text-brand-indigo transition-colors">{action.title}</h5>
                <p className="text-sm text-accent-secondary mt-1 leading-relaxed line-clamp-2 w-full">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-xl bg-white/5">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
              Intelligence Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reportTypes.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="bg-[#080C14]/40 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all group overflow-hidden relative"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${report.color} opacity-5 blur-2xl rounded-full group-hover:opacity-10 transition-all duration-700`}></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <report.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-accent-muted tracking-widest">
                        {report.frequency}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-white mb-2">{report.title}</h4>
                    <p className="text-sm text-accent-secondary mb-6 flex-1">{report.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-6 opacity-60">
                      {report.details.slice(0, 2).map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2 text-[10px] uppercase font-bold text-accent-muted tracking-wide truncate">
                          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full shrink-0"></div>
                          <span className="truncate">{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => onGenerateReport(report.id)}
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors text-xs font-black uppercase tracking-widest border border-white/5 hover:border-white/20"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Inspect</span>
                      </button>
                      <button 
                        onClick={() => onGenerateReport(report.id, 'download')}
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors text-xs font-black uppercase tracking-widest border border-primary/20"
                      >
                        <Download className="w-4 h-4" />
                        <span>Extract</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-premium rounded-3xl border border-white/10 shadow-xl bg-white/5 backdrop-blur-md h-full"
          >
            <div className="px-8 py-6 border-b border-white/10 flex items-center space-x-3">
              <Clock className="w-6 h-6 text-brand-yellow" />
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Recent Activity</h3>
            </div>
            <div className="p-8 space-y-6">
              {[
                {
                  id: 1,
                  title: 'Monthly User Activity',
                  status: 'completed',
                  time: '2 hours ago',
                  icon: Users,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10 border-blue-500/20'
                },
                {
                  id: 2,
                  title: 'Security Audit',
                  status: 'completed',
                  time: '4 hours ago',
                  icon: Shield,
                  color: 'text-red-400',
                  bg: 'bg-red-500/10 border-red-500/20'
                },
                {
                  id: 3,
                  title: 'Hardware Diagnostics',
                  status: 'in_progress',
                  time: 'Active Process',
                  icon: Activity,
                  color: 'text-brand-yellow',
                  bg: 'bg-brand-yellow/10 border-brand-yellow/20'
                }
              ].map((activity, idx) => (
                <div key={activity.id} className="relative">
                  {idx !== 2 && <div className="absolute left-6 top-14 bottom-[-24px] w-px bg-white/10"></div>}
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${activity.bg}`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{activity.title}</p>
                      <p className="text-[11px] font-black uppercase text-accent-muted tracking-widest">{activity.time}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shrink-0 ${
                      activity.status === 'completed' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : activity.status === 'in_progress'
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        : 'bg-white/5 text-accent-muted border-white/10'
                    }`}>
                      {activity.status === 'completed' ? 'Done' : 
                       activity.status === 'in_progress' ? 'Running' : 'Wait'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;