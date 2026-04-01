import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Loader2,
  Eye,
  Trash2
} from 'lucide-react';
import { BASE_URL } from '../lib/apollo-client';

export const ViewCourseDetailsModal = ({ 
  isOpen, 
  onClose, 
  selectedCourse, 
  onAddMaterial, 
  onViewMaterial, 
  onDeleteMaterial,
  onEditCourse
}) => {
  if (!isOpen || !selectedCourse) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="glass-premium w-full max-w-4xl overflow-hidden border border-white/10 shadow-2xl rounded-[3rem] max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-yellow shadow-[0_0_20px_rgba(255,193,7,0.5)]"></div>
          <div className="flex items-center space-x-6 relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-2xl">
              <BookOpen className="w-10 h-10 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{selectedCourse.name}</h3>
              <div className="flex items-center space-x-3 mt-1">
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-accent-muted uppercase tracking-widest">
                  Catalogue #{selectedCourse.id.slice(-6)}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white relative z-10"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 relative group hover:border-brand-yellow/30 transition-all">
              <div className="absolute top-4 right-4 text-brand-yellow/20 group-hover:text-brand-yellow/40 transition-colors">
                <AlertCircle className="w-12 h-12" />
              </div>
              <h4 className="text-xs font-black text-accent-muted uppercase tracking-[0.3em] mb-6">Course Metadata</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-accent-secondary font-bold text-sm">Deployment Status</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black border border-green-500/30">ACTIVE</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-accent-secondary font-bold text-sm">Archive Priority</span>
                  <span className="text-white font-black text-sm uppercase">Standard</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-accent-secondary font-bold text-sm">System ID</span>
                  <span className="font-mono text-[10px] text-accent-muted">{selectedCourse.id}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 relative group hover:border-brand-yellow/30 transition-all">
              <div className="absolute top-4 right-4 text-brand-yellow/20 group-hover:text-brand-yellow/40 transition-colors">
                <Calendar className="w-12 h-12" />
              </div>
              <h4 className="text-xs font-black text-accent-muted uppercase tracking-[0.3em] mb-6">Timeline Analysis</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-accent-secondary font-bold text-sm">Initialized</span>
                  <span className="text-white font-black text-sm">{new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-accent-secondary font-bold text-sm">Last Sync</span>
                  <span className="text-white font-black text-sm">{new Date(selectedCourse.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-brand-yellow uppercase tracking-[0.3em] ml-1">Syllabus Overview</h4>
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 leading-relaxed text-accent-secondary font-medium italic">
              {selectedCourse.description}
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-brand-yellow uppercase tracking-[0.3em] ml-1">Academic Assets</h4>
              <button
                onClick={onAddMaterial}
                className="px-6 py-2.5 bg-brand-yellow text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl"
              >
                Add Material
              </button>
            </div>
            
            {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCourse.materials.map((material) => (
                  <motion.div 
                    key={material.id} 
                    whileHover={{ y: -5 }}
                    className="bg-[#080C14]/40 border border-white/10 rounded-3xl p-6 hover:border-brand-yellow/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-black text-white tracking-tight text-lg group-hover:text-brand-yellow transition-colors">{material.name}</h5>
                        <span className="text-[10px] font-bold text-accent-muted uppercase tracking-tighter">Asset #{material.id.slice(-4)}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onViewMaterial(material)}
                          className="p-2.5 bg-white/5 hover:bg-brand-yellow/20 text-accent-muted hover:text-brand-yellow rounded-xl transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteMaterial(material.id)}
                          className="p-2.5 bg-white/5 hover:bg-red-500/20 text-accent-muted hover:text-red-400 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-accent-muted text-sm line-clamp-2 mb-4 font-medium">{material.description}</p>
                    
                    {material.files && material.files.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-white/5">
                        {material.files.slice(0, 2).map((file) => (
                          <a 
                            key={file.id} 
                            href={`${BASE_URL}/${file.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10 transition-all border border-white/5"
                          >
                            <span className="truncate text-[10px] font-bold text-white max-w-[150px]">{file.fileName}</span>
                            <span className="text-[10px] font-black text-accent-muted">{(file.fileSize / 1024).toFixed(0)}KB</span>
                          </a>
                        ))}
                        {material.files.length > 2 && (
                          <p className="text-[10px] font-black text-center text-brand-yellow pt-1 uppercase tracking-widest">+{material.files.length - 2} More Vaulted Files</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/20">
                <Loader2 className="w-12 h-12 text-accent-muted opacity-20 mx-auto mb-6" />
                <p className="text-accent-secondary font-black uppercase tracking-widest text-xs">No Assets Initialized</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-10 py-8 bg-[#080C14]/40 border-t border-white/10 flex space-x-6">
          <button
            onClick={onClose}
            className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
          >
            Terminate View
          </button>
          <button
            onClick={() => onEditCourse(selectedCourse)}
            className="flex-1 py-4 bg-white/5 hover:bg-brand-yellow/20 text-white hover:text-brand-yellow rounded-2xl font-black transition-all border border-white/10 text-sm uppercase tracking-[0.2em]"
          >
            Open Syllabus Editor
          </button>
        </div>
      </motion.div>
    </div>
  );
};
