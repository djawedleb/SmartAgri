// Function to get the base URL for API calls
export const getBaseUrl = () => {
  // For development, use the current machine's IP address
  if (__DEV__) {
    // In development, we'll use the local network IP
    // You can find this by running 'ipconfig' on Windows or 'ifconfig' on Mac/Linux
    // For now, we'll use a placeholder that you can replace with your actual IP
    return 'https://rnjgb-154-249-86-145.a.free.pinggy.link';
  }
  
  // For production, use your production server URL
  return 'https://your-production-server.com';
}; 