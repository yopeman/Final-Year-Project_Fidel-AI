// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  try {
    JSON.parse(user);
    return true;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return false;
  }
};

// Get current user data
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return null;
  }
  
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Save authentication data
export const saveAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Clear authentication data (logout)
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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