import useAuthStore from '../store/authStore';

// Check if user is authenticated
export const isAuthenticated = () => {
  const { token, user } = useAuthStore.getState();
  return !!token && !!user;
};

// Get current user data
export const getCurrentUser = () => {
  return useAuthStore.getState().user;
};

// Get auth token
export const getAuthToken = () => {
  return useAuthStore.getState().token;
};

// Save authentication data
export const saveAuthData = (token, user) => {
  useAuthStore.getState().login(user, token);
};

// Clear authentication data (logout)
export const clearAuthData = () => {
  useAuthStore.getState().logout();
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles) => {
  const user = getCurrentUser();
  return user && roles.includes(user.role);
};

// Get user's full name
export const getUserFullName = () => {
  const user = getCurrentUser();
  return user ? `${user.firstName} ${user.lastName}` : '';
};

// Check if token is expired (basic check)
export const isTokenExpired = () => {
  const token = getAuthToken();
  if (!token) return true;
  
  try {
    // Simple check - you might want to decode JWT for actual expiration
    // For now, just check if token exists
    return false;
  } catch (error) {
    return true;
  }
};

// Redirect based on user role
export const redirectBasedOnRole = (navigate) => {
  const user = getCurrentUser();
  
  if (!user) {
    navigate('/login');
    return;
  }
  
  switch (user.role) {
    case 'STUDENT':
      navigate('/student/dashboard');
      break;
    case 'TUTOR':
      navigate('/tutor/dashboard');
      break;
    case 'ADMIN':
      navigate('/admin/dashboard');
      break;
    default:
      navigate('/dashboard');
  }
};