// Function to get the base URL for API calls
export const getBaseUrl = () => {
  // For development, use the current machine's IP address
  if (__DEV__) {
    // In development, we'll use localhost
    return 'http://192.168.1.5:8080';
  }
  
  // For production, use your production server URL
  return 'https://your-production-server.com';
}; 