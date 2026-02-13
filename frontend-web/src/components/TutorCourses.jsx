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

const TutorCourses = ({ onCourseAction, onViewCourse, onEditCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
        endDate: bc.batch?.endDate
      };
    });
  }, [meData, coursesData]);

  const filteredCourses = tutorCourses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.batchName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'ACTIVE' && course.batch?.status === 'ACTIVE') ||
      (filterStatus === 'UPCOMING' && course.batch?.status === 'UPCOMING') ||
      (filterStatus === 'COMPLETED' && course.batch?.status === 'COMPLETED');

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
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (extension) => {
    const ext = extension.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-600" />;
      case 'doc': case 'docx': return <FileTextIcon className="w-4 h-4 text-blue-600" />;
      case 'ppt': case 'pptx': return <FileTextIcon className="w-4 h-4 text-orange-600" />;
      case 'mp4': case 'avi': case 'mov': return <Video className="w-4 h-4 text-purple-600" />;
      case 'mp3': case 'wav': return <File className="w-4 h-4 text-green-600" />;
      default: return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  if (meLoading || coursesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-center text-gray-600 mt-4">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <p className="text-gray-600">Manage courses and materials for your batches</p>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredCourses.length} of {tutorCourses.length} courses
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses, batches, or materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{course.courseName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.batch?.status)}`}>
                      {course.batch?.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{course.courseDescription}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span>{course.batchName}</span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {course.batchLevel} • {course.batchLanguage}
                      </span>
                    </div>
                    
                    {course.startDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Starts: {new Date(course.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {course.endDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Ends: {new Date(course.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 bg-indigo-100 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
              </div>

              {/* Materials Summary */}
              {course.course?.materials && course.course.materials.length > 0 ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Materials</h4>
                    <span className="text-xs text-gray-500">{course.course.materials.length} items</span>
                  </div>
                  <div className="space-y-2">
                    {course.course.materials.slice(0, 3).map((material) => (
                      <div key={material.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700 truncate">{material.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {material.files && material.files.length > 0 && (
                            <>
                              <FileCheck className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-gray-500">{material.files.length}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {course.course.materials.length > 3 && (
                      <p className="text-xs text-gray-500 text-center pt-1">
                        +{course.course.materials.length - 3} more materials
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500 text-center py-2">No materials yet</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(course.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewCourse(course)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View Course Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search criteria or filters.' 
              : 'You are not currently assigned to any courses. Contact your administrator to be assigned to courses.'}
          </p>
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCourse.courseName}</h3>
                  <p className="text-gray-600">{selectedCourse.batchName} • {selectedCourse.batchLevel}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCourseDetails(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Course Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Course ID:</span>
                    <span className="font-mono text-xs">{selectedCourse.course?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Batch ID:</span>
                    <span className="font-mono text-xs">{selectedCourse.batch?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Batch Course ID:</span>
                    <span className="font-mono text-xs">{selectedCourse.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCourse.batch?.status)}`}>
                      {selectedCourse.batch?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Batch Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span>{selectedCourse.batchLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span>{selectedCourse.batchLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{selectedCourse.startDate ? new Date(selectedCourse.startDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>{selectedCourse.endDate ? new Date(selectedCourse.endDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Course Description</h4>
              <p className="text-gray-700">{selectedCourse.courseDescription}</p>
            </div>

            {/* Materials Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Course Materials</h4>
                <span className="text-sm text-gray-500">
                  {selectedCourse.course?.materials?.length || 0} materials
                </span>
              </div>
              
              {selectedCourse.course?.materials && selectedCourse.course.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCourse.course.materials.map((material) => (
                    <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{material.name}</h5>
                        <button
                          onClick={() => handleViewMaterial(material)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                          title="View Material"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                      
                      {material.files && material.files.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 mb-2">Files ({material.files.length}):</p>
                          {material.files.map((file) => (
                            <a 
                              key={file.id}
                              href={`http://localhost:8000/${file.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                {getFileIcon(file.fileExtension)}
                                <span className="truncate">{file.fileName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-2">No files uploaded</p>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Created: {new Date(material.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
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
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Material Modal */}
      {showViewMaterialModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedMaterial.name}</h3>
                  <p className="text-sm text-gray-600">Material Details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewMaterialModal(false);
                  setSelectedMaterial(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Material Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Material ID:</span>
                    <span className="font-mono text-xs">{selectedMaterial.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deleted:</span>
                    <span>{selectedMaterial.isDeleted ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(selectedMaterial.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span>{new Date(selectedMaterial.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Files</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Files:</span>
                    <span>{selectedMaterial.files?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Size:</span>
                    <span>
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
              <h4 className="font-medium text-gray-900 mb-3">Description</h4>
              <p className="text-gray-700">{selectedMaterial.description}</p>
            </div>

            {/* Files Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Files</h4>
              
              {selectedMaterial.files && selectedMaterial.files.length > 0 ? (
                <div className="space-y-3">
                  {selectedMaterial.files.map((file) => (
                    <a 
                      key={file.id}
                      href={`http://localhost:8000/${file.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.fileExtension)}
                        <div>
                          <h6 className="font-medium text-gray-900">{file.fileName}</h6>
                          <p className="text-sm text-gray-600">
                            {(file.fileSize / 1024).toFixed(1)} KB • 
                            Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{file.fileExtension.toUpperCase()}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
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
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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