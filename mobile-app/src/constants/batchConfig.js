export const LEVEL = {
    BEGINNER: { color: '#10B981', gradB: '#052e16', gradT: '#0d4f2a', icon: 'leaf', emoji: '🌱', label: 'Beginner', tagline: 'Perfect for starters' },
    BASIC: { color: '#60A5FA', gradB: '#0f172a', gradT: '#1e3a5f', icon: 'school', emoji: '📘', label: 'Basic', tagline: 'Build your foundation' },
    INTERMEDIATE: { color: '#FBBF24', gradB: '#1c1101', gradT: '#3d2a00', icon: 'flash', emoji: '⚡', label: 'Intermediate', tagline: 'Level up your fluency' },
    ADVANCED: { color: '#F87171', gradB: '#1c0000', gradT: '#4a0000', icon: 'rocket', emoji: '🚀', label: 'Advanced', tagline: 'Master the language' },
};

export const STATUS = {
    UPCOMING: { color: '#60A5FA', label: 'Upcoming', dot: '#60A5FA', glow: 'rgba(96,165,250,0.18)' },
    ACTIVE: { color: '#10B981', label: 'Live Now', dot: '#10B981', glow: 'rgba(16,185,129,0.18)' },
    COMPLETED: { color: '#6B7280', label: 'Completed', dot: '#9CA3AF', glow: 'rgba(107,114,128,0.12)' },
    CANCELLED: { color: '#EF4444', label: 'Cancelled', dot: '#EF4444', glow: 'rgba(239,68,68,0.12)' },
};

export const FILTERS = [
    { key: 'All', icon: 'apps', label: 'All' },
    { key: 'ACTIVE', icon: 'pulse', label: 'Live' },
    { key: 'UPCOMING', icon: 'time', label: 'Upcoming' },
    { key: 'BEGINNER', icon: 'leaf', label: 'Beginner' },
    { key: 'INTERMEDIATE', icon: 'flash', label: 'Intermediate' },
    { key: 'ADVANCED', icon: 'rocket', label: 'Advanced' },
];

export function formatDate(d) {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
}

export function daysUntil(dateStr) {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}