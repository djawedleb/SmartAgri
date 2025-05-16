// Function to get the base URL for API calls
export const getBaseUrl = () => {
  // For development, use the current machine's IP address
  if (__DEV__) {
    // In development, we'll use localhost
    return 'https://rnaap-105-106-119-139.a.free.pinggy.link';
  }
  
  // For production, use your production server URL
  return 'https://your-production-server.com';
}; 