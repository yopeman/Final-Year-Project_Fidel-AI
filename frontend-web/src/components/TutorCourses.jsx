import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  GraduationCap,
  FileText,
  Video,
  File,
  Download,
  ExternalLink,
  Loader2,
  FileCheck,
  FileText as FileTextIcon
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_COURSES } from '../graphql/course';
import { ME_QUERY } from '../graphql/instructor';
import { BASE_URL } from '../lib/apollo-client';
import useContentStore from '../store/contentStore';

const TutorCourses = ({ onCourseAction, onViewCourse, onEditCourse }) => {
  const { filters, setFilters, setCourses } = useContentStore();
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatchCourse, setSelectedBatchCourse] = useState(null);
  const [showViewMaterialModal, setShowViewMaterialModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get tutor's associated batch courses using the new ME query
  const { data: meData, loading: meLoading } = useQuery(ME_QUERY);

  // Get all courses for reference
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);

  // Combine data to get tutor's courses
  const tutorCourses = React.useMemo(() => {
    if (!meData?.me || !coursesData?.courses) {
      return [];
    }

    const batchInstructors = meData.me.batchInstructors || [];
    const batchCourses = batchInstructors
      .filter(instructor => instructor.role === 'MAIN' || instructor.role === 'ASSISTANT')
      .map(instructor => instructor.batchCourse);

    const courses = coursesData.courses;

    return batchCourses.map(bc => {
      const course = courses.find(c => c.id === bc.courseId);

      return {
        ...bc,
        course: course,
        courseName: course?.name || 'Unknown Course',
        courseDescription: course?.description || '',
        batchName: bc.batch?.name || 'Unknown Batch',
        batchLevel: bc.batch?.level || 'Unknown',
        batchLanguage: bc.batch?.language || 'Unknown',
        startDate: bc.batch?.startDate,
        endDate: bc.batch?.endDate,
        schedules: bc.schedules || []
      };
    });
  }, [meData, coursesData]);

  useEffect(() => {
    if (tutorCourses.length > 0) {
      setCourses(tutorCourses);
    }
  }, [tutorCourses, setCourses]);

  const filteredCourses = tutorCourses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.courseDescription.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.batchName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'ACTIVE' && course.batch?.status === 'ACTIVE') ||
      (filters.status === 'UPCOMING' && course.batch?.status === 'UPCOMING') ||
      (filters.status === 'COMPLETED' && course.batch?.status === 'COMPLETED');

    return matchesSearch && matchesStatus;
  });

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
    setShowViewMaterialModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'UPCOMING': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'COMPLETED': return 'bg-white/10 text-accent-secondary border border-white/10';
      default: return 'bg-white/10 text-accent-secondary border border-white/10';
    }
  };

  const getFileIcon = (extension) => {
    const ext = extension.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc': case 'docx': return <FileTextIcon className="w-4 h-4 text-blue-400" />;
      case 'ppt': case 'pptx': return <FileTextIcon className="w-4 h-4 text-orange-400" />;
      case 'mp4': case 'avi': case 'mov': return <Video className="w-4 h-4 text-purple-400" />;
      case 'mp3': case 'wav': return <File className="w-4 h-4 text-green-400" />;
      default: return <File className="w-4 h-4 text-accent-secondary" />;
    }
  };

  const formatDayOfWeek = (day) => {
    switch (day) {
      case 'MONDAY': return 'Monday';
      case 'TUESDAY': return 'Tuesday';
      case 'WEDNESDAY': return 'Wednesday';
      case 'THURSDAY': return 'Thursday';
      case 'FRIDAY': return 'Friday';
      case 'SATURDAY': return 'Saturday';
      case 'SUNDAY': return 'Sunday';
      default: return day;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Convert time format if needed (assuming it's in HH:MM:SS format)
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (meLoading || coursesLoading) {
    return (
      <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin"></div>
          <p className="text-accent-muted font-bold uppercase tracking-widest text-xs">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-brand-yellow/10 transition-all duration-1000"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <BookOpen className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">My Courses</h2>
              <p className="text-accent-secondary mt-1 font-medium flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-yellow mr-2 animate-pulse"></span>
                Manage courses and learning materials across your batches
              </p>
            </div>
          </div>
          <div className="text-sm font-black text-white uppercase tracking-[0.2em] bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
            {filteredCourses.length} / {tutorCourses.length} Showing
          </div>
        </div>
      </div>

      <div className="glass-premium rounded-3xl border border-white/10 p-6 shadow-xl bg-white/5 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2 group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-accent-muted w-5 h-5 group-focus-within:text-brand-yellow transition-colors" />
            <input
              type="text"
              placeholder="Search courses, batches, or materials..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-accent-muted focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
            <Filter className="w-5 h-5 text-accent-muted ml-2" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="w-full bg-transparent text-white font-bold px-4 py-2 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#080C14] text-white">All Status</option>
              <option value="ACTIVE" className="bg-[#080C14] text-white">Active</option>
              <option value="UPCOMING" className="bg-[#080C14] text-white">Upcoming</option>
              <option value="COMPLETED" className="bg-[#080C14] text-white">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="group relative bg-[#080C14]/40 border border-white/10 rounded-[2rem] p-6 hover:border-brand-yellow/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-yellow/5 group-hover:bg-brand-yellow transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="text-lg font-black text-white tracking-tight">{course.courseName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.batch?.status)}`}>
                      {course.batch?.status}
                    </span>
                  </div>
                  <p className="text-sm text-accent-secondary mb-3 line-clamp-3">{course.courseDescription}</p>

                  <div className="space-y-2 text-sm text-accent-secondary">
                    <div className="flex items-center space-x-3 flex-wrap">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-brand-yellow" />
                        <span>{course.batchName}</span>
                      </div>
                      <span className="px-2 py-1 bg-white/5 text-accent-muted rounded-full text-xs border border-white/10">
                        {course.batchLevel} • {course.batchLanguage}
                      </span>
                    </div>

                    {course.startDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-brand-yellow" />
                        <span>Starts: {new Date(course.startDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {course.endDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-brand-yellow" />
                        <span>Ends: {new Date(course.endDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {course.schedules && course.schedules.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-accent-muted">
                          {course.schedules.length} schedule{course.schedules.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-yellow/10 group-hover:border-brand-yellow/30 transition-all">
                  <BookOpen className="w-6 h-6 text-accent-muted group-hover:text-brand-yellow transition-colors" />
                </div>
              </div>

              {course.course?.materials && course.course.materials.length > 0 ? (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">Materials</h4>
                    <span className="text-xs text-accent-muted">{course.course.materials.length} items</span>
                  </div>
                  <div className="space-y-2">
                    {course.course.materials.slice(0, 3).map((material) => (
                      <div key={material.id} className="flex items-center justify-between text-sm bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                        <div className="flex items-center space-x-2 min-w-0">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-accent-secondary truncate">{material.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-accent-muted">
                          {material.files && material.files.length > 0 && (
                            <>
                              <FileCheck className="w-3 h-3 text-green-400" />
                              <span className="text-xs">{material.files.length}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {course.course.materials.length > 3 && (
                      <p className="text-xs text-accent-muted text-center pt-1">
                        +{course.course.materials.length - 3} more materials
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-accent-muted text-center py-2">No materials yet</p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                <div className="text-xs text-accent-muted">
                  Updated: {new Date(course.updatedAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => handleViewCourse(course)}
                  className="p-2.5 bg-white/5 hover:bg-brand-yellow/20 text-accent-muted hover:text-brand-yellow rounded-xl transition-all border border-white/5"
                  title="View Course Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="glass-premium rounded-[2.5rem] border border-dashed border-white/20 p-12 text-center bg-white/5">
          <BookOpen className="w-16 h-16 text-accent-muted/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
          <p className="text-accent-secondary max-w-lg mx-auto">
            {filters.search || filters.status !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'You are not currently assigned to any courses. Contact your administrator to be assigned to courses.'}
          </p>
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="glass-premium rounded-[2.5rem] p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(255,193,7,0.18)]">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedCourse.courseName}</h3>
                  <p className="text-accent-secondary">{selectedCourse.batchName} • {selectedCourse.batchLevel}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCourseDetails(false);
                  setSelectedCourse(null);
                }}
                className="text-accent-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Course Information</h4>
                <div className="space-y-2 text-sm text-accent-secondary">
                  <div className="flex justify-between gap-3">
                    <span>Course ID:</span>
                    <span className="font-mono text-xs text-white">{selectedCourse.course?.id}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Batch ID:</span>
                    <span className="font-mono text-xs text-white">{selectedCourse.batch?.id}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Batch Course ID:</span>
                    <span className="font-mono text-xs text-white">{selectedCourse.id}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCourse.batch?.status)}`}>
                      {selectedCourse.batch?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Batch Details</h4>
                <div className="space-y-2 text-sm text-accent-secondary">
                  <div className="flex justify-between gap-3">
                    <span>Level:</span>
                    <span className="text-white">{selectedCourse.batchLevel}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Language:</span>
                    <span className="text-white">{selectedCourse.batchLanguage}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Start Date:</span>
                    <span className="text-white">{selectedCourse.startDate ? new Date(selectedCourse.startDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>End Date:</span>
                    <span className="text-white">{selectedCourse.endDate ? new Date(selectedCourse.endDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Schedule Details</h4>
                {selectedCourse.schedules && selectedCourse.schedules.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-accent-secondary">
                      <span>Total Sessions:</span>
                      <span className="font-medium text-white">{selectedCourse.schedules.length}</span>
                    </div>
                    <div className="space-y-1">
                      {selectedCourse.schedules.slice(0, 3).map((courseSchedule) => (
                        <div key={courseSchedule.id} className="text-xs text-accent-secondary">
                          <div className="flex justify-between gap-3">
                            <span>{courseSchedule.schedule?.dayOfWeek}</span>
                            <span className="text-white">{courseSchedule.schedule?.startTime} - {courseSchedule.schedule?.endTime}</span>
                          </div>
                        </div>
                      ))}
                      {selectedCourse.schedules.length > 3 && (
                        <p className="text-xs text-accent-muted text-center pt-1">
                          +{selectedCourse.schedules.length - 3} more sessions
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-accent-muted text-center py-2">No schedules yet</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-white mb-3">Course Description</h4>
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 text-accent-secondary">
                <p>{selectedCourse.courseDescription}</p>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Class Schedule</h4>
                <span className="text-sm text-accent-muted">
                  {selectedCourse.schedules?.length || 0} scheduled sessions
                </span>
              </div>

              {selectedCourse.schedules && selectedCourse.schedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCourse.schedules.map((courseSchedule) => (
                    <div key={courseSchedule.id} className="bg-[#0B111B]/70 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">
                          {formatDayOfWeek(courseSchedule.schedule?.dayOfWeek)}
                        </h5>
                        <div className="flex items-center space-x-2 text-accent-muted">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-xs">Session</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-accent-secondary">
                        <div className="flex justify-between gap-3">
                          <span>Time:</span>
                          <span className="font-medium text-white">
                            {formatTime(courseSchedule.schedule?.startTime)} - {formatTime(courseSchedule.schedule?.endTime)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Schedule ID:</span>
                          <span className="font-mono text-xs text-white">{courseSchedule.schedule?.id}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Course Schedule ID:</span>
                          <span className="font-mono text-xs text-white">{courseSchedule.id}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-accent-muted">
                          Created: {new Date(courseSchedule.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-accent-muted border-2 border-dashed border-white/15 rounded-2xl bg-white/5">
                  No class schedules have been set for this course yet.
                </div>
              )}
            </div>

            {/* Materials Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Course Materials</h4>
                <span className="text-sm text-accent-muted">
                  {selectedCourse.course?.materials?.length || 0} materials
                </span>
              </div>

              {selectedCourse.course?.materials && selectedCourse.course.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCourse.course.materials.map((material) => (
                    <div key={material.id} className="bg-[#0B111B]/70 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-white">{material.name}</h5>
                        <button
                          onClick={() => handleViewMaterial(material)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Material"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-accent-secondary mb-3">{material.description}</p>

                      {material.files && material.files.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-accent-muted mb-2">Files ({material.files.length}):</p>
                          {material.files.map((file) => (
                            <a
                              key={file.id}
                              href={`${BASE_URL}/${file.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between text-xs text-accent-secondary bg-white/5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                {getFileIcon(file.fileExtension)}
                                <span className="truncate">{file.fileName}</span>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
                                <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                                <ExternalLink className="w-3 h-3 text-accent-muted" />
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-accent-muted text-center py-2">No files uploaded</p>
                      )}

                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-accent-muted">
                          Created: {new Date(material.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-accent-muted border-2 border-dashed border-white/15 rounded-2xl bg-white/5">
                  No materials have been added to this course yet.
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCourseDetails(false);
                  setSelectedCourse(null);
                }}
                className="flex-1 px-4 py-3 border border-white/10 text-accent-secondary rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Material Modal */}
      {showViewMaterialModal && selectedMaterial && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="glass-premium rounded-[2rem] p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/20">
                  <FileText className="w-6 h-6 text-brand-indigo" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedMaterial.name}</h3>
                  <p className="text-sm text-accent-secondary">Material Details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewMaterialModal(false);
                  setSelectedMaterial(null);
                }}
                className="text-accent-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Material Information</h4>
                <div className="space-y-2 text-sm text-accent-secondary">
                  <div className="flex justify-between gap-3">
                    <span>Material ID:</span>
                    <span className="font-mono text-xs text-white">{selectedMaterial.id}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Deleted:</span>
                    <span className="text-white">{selectedMaterial.isDeleted ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Created:</span>
                    <span className="text-white">{new Date(selectedMaterial.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Updated:</span>
                    <span className="text-white">{new Date(selectedMaterial.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Files</h4>
                <div className="space-y-2 text-sm text-accent-secondary">
                  <div className="flex justify-between gap-3">
                    <span>Total Files:</span>
                    <span className="text-white">{selectedMaterial.files?.length || 0}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Total Size:</span>
                    <span className="text-white">
                      {selectedMaterial.files
                        ? (selectedMaterial.files.reduce((total, file) => total + file.fileSize, 0) / 1024).toFixed(1) + ' KB'
                        : '0 KB'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-white mb-3">Description</h4>
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 text-accent-secondary">
                <p>{selectedMaterial.description}</p>
              </div>
            </div>

            {/* Files Section */}
            <div className="mb-6">
              <h4 className="font-medium text-white mb-4">Files</h4>

              {selectedMaterial.files && selectedMaterial.files.length > 0 ? (
                <div className="space-y-3">
                  {selectedMaterial.files.map((file) => (
                    <a
                      key={file.id}
                      href={`${BASE_URL}/${file.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-white/5 rounded-2xl p-3 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {getFileIcon(file.fileExtension)}
                        <div className="min-w-0">
                          <h6 className="font-medium text-white truncate">{file.fileName}</h6>
                          <p className="text-sm text-accent-secondary">
                            {(file.fileSize / 1024).toFixed(1)} KB •
                            Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs text-accent-muted">{file.fileExtension.toUpperCase()}</span>
                        <ExternalLink className="w-4 h-4 text-accent-muted" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-accent-muted border-2 border-dashed border-white/15 rounded-2xl bg-white/5">
                  No files have been uploaded for this material yet.
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowViewMaterialModal(false);
                  setSelectedMaterial(null);
                }}
                className="flex-1 px-4 py-3 border border-white/10 text-accent-secondary rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorCourses;