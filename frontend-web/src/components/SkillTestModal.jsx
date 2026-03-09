import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save,
  Send,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  Eye,
  Edit,
  Plus,
  GraduationCap,
  Book,
  MessageSquare,
  FileCheck,
  Download,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { 
  GET_TUTOR_ASSIGNED_STUDENTS, 
  GET_EXAM_LINK, 
  CREATE_SKILL, 
  UPDATE_SKILL, 
  SEND_EXAM_LINK, 
  GENERATE_CERTIFICATE 
} from '../graphql/tutorBatch';

const SkillTestModal = ({ 
  isOpen, 
  onClose, 
  batch, 
  onOpen 
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [skillData, setSkillData] = useState({
    readingSkill: {
      comprehension: 'A_PLUS',
      speed: 'A_PLUS',
      vocabulary: 'A_PLUS'
    },
    writingSkill: {
      coherence: 'A_PLUS',
      grammar: 'A_PLUS',
      vocabulary: 'A_PLUS',
      punctuation: 'A_PLUS'
    },
    speakingSkill: {
      pronunciation: 'A_PLUS',
      fluency: 'A_PLUS',
      grammar: 'A_PLUS',
      vocabulary: 'A_PLUS',
      coherence: 'A_PLUS'
    },
    listeningSkill: {
      comprehension: 'A_PLUS',
      retention: 'A_PLUS',
      interpretation: 'A_PLUS'
    }
  });
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, refetch } = useQuery(GET_TUTOR_ASSIGNED_STUDENTS, {
    variables: { batchId: batch?.id },
    skip: !isOpen
  });

  const [createSkillMutation] = useMutation(CREATE_SKILL);
  const [updateSkillMutation] = useMutation(UPDATE_SKILL);
  const [sendExamLinkMutation] = useMutation(SEND_EXAM_LINK);
  const [generateCertificateMutation] = useMutation(GENERATE_CERTIFICATE);

  const [getExamLinkQuery] = useLazyQuery(GET_EXAM_LINK);

  const handleJoinExam = async () => {
    if (!selectedStudent) return;
    
    try {
      const { data } = await getExamLinkQuery({
        variables: { enrollmentId: selectedStudent.id }
      });
      
      if (data?.getExamLink) {
        window.open(data.getExamLink, '_blank');
      } else {
        alert('No exam link available for this student.');
      }
    } catch (error) {
      console.error('Error fetching exam link:', error);
      alert('Failed to fetch exam link. Please try again.');
    }
  };

  useEffect(() => {
    if (isOpen && onOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  if (!isOpen) return null;

  const students = data?.tutorAssignedStudents || [];
  
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setActiveTab('overview');
    
    // Initialize skill data if student has existing skill
    if (student.skill) {
      setSkillData({
        readingSkill: student.skill.readingSkill || {
          comprehension: 'A_PLUS',
          speed: 'A_PLUS',
          vocabulary: 'A_PLUS'
        },
        writingSkill: student.skill.writingSkill || {
          coherence: 'A_PLUS',
          grammar: 'A_PLUS',
          vocabulary: 'A_PLUS',
          punctuation: 'A_PLUS'
        },
        speakingSkill: student.skill.speakingSkill || {
          pronunciation: 'A_PLUS',
          fluency: 'A_PLUS',
          grammar: 'A_PLUS',
          vocabulary: 'A_PLUS',
          coherence: 'A_PLUS'
        },
        listeningSkill: student.skill.listeningSkill || {
          comprehension: 'A_PLUS',
          retention: 'A_PLUS',
          interpretation: 'A_PLUS'
        }
      });
    } else {
      setSkillData({
        readingSkill: {
          comprehension: 'A_PLUS',
          speed: 'A_PLUS',
          vocabulary: 'A_PLUS'
        },
        writingSkill: {
          coherence: 'A_PLUS',
          grammar: 'A_PLUS',
          vocabulary: 'A_PLUS',
          punctuation: 'A_PLUS'
        },
        speakingSkill: {
          pronunciation: 'A_PLUS',
          fluency: 'A_PLUS',
          grammar: 'A_PLUS',
          vocabulary: 'A_PLUS',
          coherence: 'A_PLUS'
        },
        listeningSkill: {
          comprehension: 'A_PLUS',
          retention: 'A_PLUS',
          interpretation: 'A_PLUS'
        }
      });
    }
  };

  const handleGradeChange = (skillType, field, value) => {
    setSkillData(prev => ({
      ...prev,
      [skillType]: {
        ...prev[skillType],
        [field]: value
      }
    }));
  };

  const calculateFinalResult = (skillType) => {
    const skill = skillData[skillType];
    const grades = Object.values(skill);
    const gradeValues = {
      'A_PLUS': 100, 'A': 95, 'A_MINUS': 90,
      'B_PLUS': 85, 'B': 80, 'B_MINUS': 75,
      'C_PLUS': 70, 'C': 65, 'C_MINUS': 60,
      'D': 55, 'F': 0, 'FX': 0
    };
    
    const average = grades.reduce((sum, grade) => sum + gradeValues[grade], 0) / grades.length;
    
    if (average >= 95) return 'A_PLUS';
    if (average >= 90) return 'A';
    if (average >= 85) return 'A_MINUS';
    if (average >= 80) return 'B_PLUS';
    if (average >= 75) return 'B';
    if (average >= 70) return 'B_MINUS';
    if (average >= 65) return 'C_PLUS';
    if (average >= 60) return 'C';
    if (average >= 55) return 'C_MINUS';
    return 'F';
  };

  const handleSubmitSkill = async () => {
    if (!selectedStudent) return;
    
    setIsSubmitting(true);
    try {
      const input = {
        enrollmentId: selectedStudent.id,
        readingSkill: skillData.readingSkill,
        writingSkill: skillData.writingSkill,
        speakingSkill: skillData.speakingSkill,
        listeningSkill: skillData.listeningSkill
      };

      if (selectedStudent.skill) {
        // Update existing skill
        await updateSkillMutation({
          variables: {
            id: selectedStudent.skill.id,
            input
          }
        });
      } else {
        // Create new skill
        await createSkillMutation({
          variables: { input }
        });
      }
      
      await refetch();
      alert('Skill assessment saved successfully!');
    } catch (error) {
      console.error('Error saving skill assessment:', error);
      alert('Failed to save skill assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendExamLink = async () => {
    if (!selectedStudent) return;
    
    try {
      await sendExamLinkMutation({
        variables: {
          input: {
            enrollmentId: selectedStudent.id,
            examDate: new Date(examDate).toISOString()
          }
        }
      });
      alert('Exam link sent successfully!');
    } catch (error) {
      console.error('Error sending exam link:', error);
      alert('Failed to send exam link. Please try again.');
    }
  };

  const handleGenerateCertificate = async () => {
    if (!selectedStudent?.skill) return;
    
    try {
      await generateCertificateMutation({
        variables: {
          input: {
            skillId: selectedStudent.skill.id
          }
        }
      });
      alert('Certificate generated successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A_PLUS': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-green-100 text-green-800';
      case 'A_MINUS': return 'bg-green-100 text-green-800';
      case 'B_PLUS': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'B_MINUS': return 'bg-blue-100 text-blue-800';
      case 'C_PLUS': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'C_MINUS': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      case 'FX': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const GradeSelector = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="A_PLUS">A+ (Excellent)</option>
        <option value="A">A (Very Good)</option>
        <option value="A_MINUS">A- (Good)</option>
        <option value="B_PLUS">B+ (Above Average)</option>
        <option value="B">B (Average)</option>
        <option value="B_MINUS">B- (Below Average)</option>
        <option value="C_PLUS">C+ (Satisfactory)</option>
        <option value="C">C (Pass)</option>
        <option value="C_MINUS">C- (Marginal Pass)</option>
        <option value="D">D (Fail)</option>
        <option value="F">F (Fail)</option>
        <option value="FX">FX (Fail)</option>
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Skill Assessment</h3>
              <p className="text-gray-600">Batch: {batch?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Students ({students.length})</span>
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="bg-gray-300 h-12 rounded"></div>
                  </div>
                ) : students.length === 0 ? (
                  <p className="text-gray-500 text-sm">No students assigned to this batch.</p>
                ) : (
                  students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedStudent?.id === student.id 
                          ? 'bg-indigo-100 border-2 border-indigo-200' 
                          : 'bg-white border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.profile.user.firstName} {student.profile.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{student.profile.user.email}</div>
                        </div>
                        {student.skill && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.skill.finalResult)}`}>
                            {student.skill.finalResult}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedStudent ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h4>
                <p className="text-gray-600">Choose a student from the list to begin skill assessment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student Header */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {selectedStudent.profile.user.firstName} {selectedStudent.profile.user.lastName}
                        </h4>
                        <p className="text-gray-600">{selectedStudent.profile.user.email}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <span>Status: {selectedStudent.status}</span>
                          <span>Enrolled: {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {selectedStudent.skill && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Final Result</div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(selectedStudent.skill.finalResult)}`}>
                          {selectedStudent.skill.finalResult}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'reading', label: 'Reading', icon: Book },
                      { id: 'writing', label: 'Writing', icon: FileText },
                      { id: 'speaking', label: 'Speaking', icon: MessageSquare },
                      { id: 'listening', label: 'Listening', icon: Clock }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-4">Skill Assessment Summary</h5>
                          {selectedStudent.skill ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <div className="text-sm text-green-600">Reading</div>
                                  <div className="font-bold text-green-800">{selectedStudent.skill.readingSkill?.finalResult || 'N/A'}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="text-sm text-blue-600">Writing</div>
                                  <div className="font-bold text-blue-800">{selectedStudent.skill.writingSkill?.finalResult || 'N/A'}</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                  <div className="text-sm text-purple-600">Speaking</div>
                                  <div className="font-bold text-purple-800">{selectedStudent.skill.speakingSkill?.finalResult || 'N/A'}</div>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                  <div className="text-sm text-orange-600">Listening</div>
                                  <div className="font-bold text-orange-800">{selectedStudent.skill.listeningSkill?.finalResult || 'N/A'}</div>
                                </div>
                              </div>
                              
                              <div className="flex space-x-3">
                                <button
                                  onClick={handleGenerateCertificate}
                                  disabled={!selectedStudent.skill}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FileCheck className="w-4 h-4" />
                                  <span>Generate Certificate</span>
                                </button>
                                <button
                                  onClick={handleSubmitSkill}
                                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit Assessment</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No skill assessment found for this student.</p>
                              <p className="text-sm text-gray-400 mt-2">Create a new assessment to get started.</p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-4">Actions</h5>
                          <div className="space-y-3">
                            <div className="flex space-x-3">
                              <input
                                type="date"
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <button
                                onClick={handleSendExamLink}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                <Send className="w-4 h-4" />
                                <span>Send Exam Link</span>
                              </button>                              
                                <button
                                  onClick={handleJoinExam}
                                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Join Exam</span>
                                </button>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h6 className="font-medium text-gray-900 mb-2">Exam Link</h6>
                              <p className="text-sm text-gray-600 mb-3">Generate and send exam link to student for skill testing.</p>
                              <div className="text-xs text-gray-500">
                                Selected date: {new Date(examDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reading' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GradeSelector
                          value={skillData.readingSkill.comprehension}
                          onChange={(value) => handleGradeChange('readingSkill', 'comprehension', value)}
                          label="Reading Comprehension"
                        />
                        <GradeSelector
                          value={skillData.readingSkill.speed}
                          onChange={(value) => handleGradeChange('readingSkill', 'speed', value)}
                          label="Reading Speed"
                        />
                        <GradeSelector
                          value={skillData.readingSkill.vocabulary}
                          onChange={(value) => handleGradeChange('readingSkill', 'vocabulary', value)}
                          label="Vocabulary"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">Final Result: </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(calculateFinalResult('readingSkill'))}`}>
                            {calculateFinalResult('readingSkill')}
                          </span>
                        </div>
                        <button
                          onClick={handleSubmitSkill}
                          disabled={isSubmitting}
                          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSubmitting ? 'Saving...' : 'Save Reading Assessment'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'writing' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GradeSelector
                          value={skillData.writingSkill.coherence}
                          onChange={(value) => handleGradeChange('writingSkill', 'coherence', value)}
                          label="Coherence & Cohesion"
                        />
                        <GradeSelector
                          value={skillData.writingSkill.grammar}
                          onChange={(value) => handleGradeChange('writingSkill', 'grammar', value)}
                          label="Grammar"
                        />
                        <GradeSelector
                          value={skillData.writingSkill.vocabulary}
                          onChange={(value) => handleGradeChange('writingSkill', 'vocabulary', value)}
                          label="Vocabulary"
                        />
                        <GradeSelector
                          value={skillData.writingSkill.punctuation}
                          onChange={(value) => handleGradeChange('writingSkill', 'punctuation', value)}
                          label="Punctuation"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">Final Result: </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(calculateFinalResult('writingSkill'))}`}>
                            {calculateFinalResult('writingSkill')}
                          </span>
                        </div>
                        <button
                          onClick={handleSubmitSkill}
                          disabled={isSubmitting}
                          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSubmitting ? 'Saving...' : 'Save Writing Assessment'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'speaking' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GradeSelector
                          value={skillData.speakingSkill.pronunciation}
                          onChange={(value) => handleGradeChange('speakingSkill', 'pronunciation', value)}
                          label="Pronunciation"
                        />
                        <GradeSelector
                          value={skillData.speakingSkill.fluency}
                          onChange={(value) => handleGradeChange('speakingSkill', 'fluency', value)}
                          label="Fluency"
                        />
                        <GradeSelector
                          value={skillData.speakingSkill.grammar}
                          onChange={(value) => handleGradeChange('speakingSkill', 'grammar', value)}
                          label="Grammar"
                        />
                        <GradeSelector
                          value={skillData.speakingSkill.vocabulary}
                          onChange={(value) => handleGradeChange('speakingSkill', 'vocabulary', value)}
                          label="Vocabulary"
                        />
                        <GradeSelector
                          value={skillData.speakingSkill.coherence}
                          onChange={(value) => handleGradeChange('speakingSkill', 'coherence', value)}
                          label="Coherence"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">Final Result: </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(calculateFinalResult('speakingSkill'))}`}>
                            {calculateFinalResult('speakingSkill')}
                          </span>
                        </div>
                        <button
                          onClick={handleSubmitSkill}
                          disabled={isSubmitting}
                          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSubmitting ? 'Saving...' : 'Save Speaking Assessment'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'listening' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GradeSelector
                          value={skillData.listeningSkill.comprehension}
                          onChange={(value) => handleGradeChange('listeningSkill', 'comprehension', value)}
                          label="Listening Comprehension"
                        />
                        <GradeSelector
                          value={skillData.listeningSkill.retention}
                          onChange={(value) => handleGradeChange('listeningSkill', 'retention', value)}
                          label="Information Retention"
                        />
                        <GradeSelector
                          value={skillData.listeningSkill.interpretation}
                          onChange={(value) => handleGradeChange('listeningSkill', 'interpretation', value)}
                          label="Interpretation"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">Final Result: </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(calculateFinalResult('listeningSkill'))}`}>
                            {calculateFinalResult('listeningSkill')}
                          </span>
                        </div>
                        <button
                          onClick={handleSubmitSkill}
                          disabled={isSubmitting}
                          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSubmitting ? 'Saving...' : 'Save Listening Assessment'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTestModal;