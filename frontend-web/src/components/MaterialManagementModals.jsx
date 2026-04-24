import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  Upload, 
  Save, 
  Loader2, 
  AlertCircle,
  FileX2,
  Hash,
  Clock
} from 'lucide-react';
import { BASE_URL } from '../lib/apollo-client';

// Add Material Modal Component
export const AddMaterialModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  materialForm, 
  onFormChange, 
  formErrors, 
  isSubmitting, 
  selectedCourse 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium w-full max-w-md overflow-hidden border border-white/10 shadow-2xl rounded-[2.5rem]"
      >
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-green-500/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <Plus className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Add Asset</h3>
              <p className="text-[10px] font-bold text-accent-muted uppercase tracking-widest">Integrating with {selectedCourse?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          {formErrors.submit && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm font-bold flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{formErrors.submit}</span>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Asset Label</label>
            <input
              type="text"
              value={materialForm.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-bold text-lg ${
                formErrors.name ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
              }`}
              placeholder="e.g. Lecture Notes - Week 1"
            />
            {formErrors.name && (
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-1">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Asset Specification</label>
            <textarea
              value={materialForm.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              rows={4}
              className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-bold resize-none ${
                formErrors.description ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
              }`}
              placeholder="Provide a brief summary of the material..."
            />
            {formErrors.description && (
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-1">{formErrors.description}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Inject Asset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Material Confirmation Modal Component
export const DeleteMaterialConfirmationModal = ({ isOpen, onClose, onConfirm, materialId, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center z-[250] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-10 text-center rounded-[2.5rem] relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
        
        <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-2xl transform group-hover:rotate-12 transition-transform">
          <Trash2 className="w-12 h-12 text-red-500" />
        </div>

        <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase italic">Delete Asset?</h3>
        <p className="text-accent-secondary mb-10 font-bold leading-relaxed px-4">
          Are you sure you want to remove this <span className="text-white">academic material</span>? All associated binary files will be purged.
        </p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onConfirm(materialId)}
            disabled={isSubmitting}
            className="w-full py-5 bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-[0_10px_30px_rgba(239,68,68,0.2)] disabled:opacity-50"
          >
            {isSubmitting ? 'Purging...' : 'Confirm Purge'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
          >
            Retrieve Asset
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// View Material Modal Component
export const ViewMaterialModal = ({ 
  isOpen, 
  onClose, 
  selectedMaterial, 
  onFileUpload, 
  onFileSelect, 
  onDeleteFile, 
  fileForm, 
  isSubmitting 
}) => {
  if (!isOpen || !selectedMaterial) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center z-[200] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl rounded-[2.5rem] flex flex-col"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/10 to-transparent">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <Eye className="w-7 h-7 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none mb-1">{selectedMaterial.name}</h3>
              <p className="text-[10px] font-bold text-accent-muted uppercase tracking-[0.3em]">Knowledge Asset Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 overflow-y-auto custom-scrollbar space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 relative group">
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <Hash className="w-5 h-5 text-accent-muted" />
              </div>
              <h4 className="text-[10px] font-black text-accent-muted uppercase tracking-widest mb-4">Metadata Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-accent-muted font-bold">CORE ID</span>
                  <span className="font-mono text-[10px] bg-white/10 px-2 py-1 rounded text-white">{selectedMaterial.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-accent-muted font-bold">STATUS</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedMaterial.isDeleted ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {selectedMaterial.isDeleted ? 'Purged' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 relative group">
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <Clock className="w-5 h-5 text-accent-muted" />
              </div>
              <h4 className="text-[10px] font-black text-accent-muted uppercase tracking-widest mb-4">Temporal Logs</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-accent-muted font-bold">CREATED</span>
                  <span className="text-white font-bold">{new Date(selectedMaterial.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-accent-muted font-bold">SYNCED</span>
                  <span className="text-white font-bold">{new Date(selectedMaterial.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-accent-muted uppercase tracking-[0.3em] mb-4 ml-1">Asset Specification</h4>
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 italic text-accent-secondary leading-relaxed font-medium">
              {selectedMaterial.description}
            </div>
          </div>

          {/* Files Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Binary Vault</h4>
                <span className="bg-brand-yellow/20 text-brand-yellow text-[10px] font-black px-2 py-0.5 rounded-full border border-brand-yellow/30">
                  {selectedMaterial.files?.length || 0}
                </span>
              </div>
              <div className="flex space-x-3">
                <label className="flex items-center space-x-2 px-5 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest cursor-pointer group">
                  <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Inject Data</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => onFileSelect(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>
                {fileForm.files && fileForm.files.length > 0 && (
                  <button
                    onClick={onFileUpload}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-5 py-2 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Commit {fileForm.files.length} Block(s)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {selectedMaterial.files && selectedMaterial.files.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {selectedMaterial.files.map((file) => (
                  <div key={file.id} className="group relative">
                    <a 
                      href={`${BASE_URL}/${file.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center space-x-5">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-brand-yellow/30 transition-colors">
                          <span className="text-accent-muted text-[10px] font-black group-hover:text-brand-yellow">
                            {file.fileExtension.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h6 className="font-bold text-white text-sm group-hover:text-brand-yellow transition-colors">{file.fileName}</h6>
                          <p className="text-[10px] font-bold text-accent-muted uppercase tracking-widest mt-0.5 text-opacity-50">
                            {(file.fileSize / 1024).toFixed(1)} KB • COMMITTED: {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onDeleteFile(file.id);
                        }}
                        className="p-3 text-accent-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl group">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileX2 className="w-8 h-8 text-accent-muted" />
                </div>
                <p className="text-sm font-bold text-accent-muted uppercase tracking-widest">Vault Empty</p>
                <p className="text-xs text-accent-secondary mt-1">No binary assets associated with this material.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="w-full py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all uppercase tracking-[0.2em] text-xs"
          >
            Exit Inspector
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Delete File Confirmation Modal Component
export const DeleteFileConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center z-[250] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-10 text-center rounded-[2.5rem] relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
        
        <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-2xl transform group-hover:rotate-12 transition-transform">
          <FileX2 className="w-12 h-12 text-red-500" />
        </div>

        <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase italic">Purge Binary?</h3>
        <p className="text-accent-secondary mb-10 font-bold leading-relaxed px-4">
          This action will <span className="text-white">permanently delete</span> the selected file from the server. This cannot be undone.
        </p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={onConfirm}
            className="w-full py-5 bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-[0_10px_30px_rgba(239,68,68,0.2)]"
          >
            Confirm Purge
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
          >
            Intercept
          </button>
        </div>
      </motion.div>
    </div>
  );
};
