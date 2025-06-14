# Smart Agriculture IoT System

A comprehensive IoT-based smart agriculture system that enables real-time monitoring and control of agricultural parameters using modern technology.

## 🌟 Features

- Real-time monitoring of environmental parameters
- Mobile application for remote monitoring and control
- Backend server for data management and processing
- IoT device integration for sensor data collection
- User authentication and authorization
- Real-time alerts and notifications
- Data visualization and analytics

## 🏗️ Project Structure

```
SmartAgri/
├── my-app/                 # React Native mobile application
│   ├── app/               # Main application code
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── constants/        # Application constants
│   └── assets/           # Static assets
│
├── server/                # Backend server
│   ├── index.js          # Main server file
│   └── uploads/          # File upload directory
│
└── .vscode/              # VS Code configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native development environment setup
- MongoDB database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/djawedleb/SmartAgri.git
cd SmartAgri
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../my-app
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. Start the mobile application:
```bash
cd my-app
npm start
```

## 🔧 Configuration

1. Backend Configuration:
   - Set up your MongoDB connection string in the server configuration
   - Configure environment variables for sensitive data

2. Frontend Configuration:
   - Update the API endpoint in `config.js`
   - Configure any necessary API keys or credentials

## 📱 Mobile Application

The mobile application is built using React Native and provides:
- Real-time monitoring dashboard
- Sensor data visualization
- Control interface for IoT devices
- User authentication
- Push notifications

## 🔌 Backend Server

The backend server is built with Node.js and provides:
- RESTful API endpoints
- Real-time data processing
- Database management
- File upload handling
- Authentication and authorization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- [Djawed Lebaili](https://github.com/djawedleb)
- [Salah Nahal AbdelMouiz](https://github.com/SaNa-nhl11)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for their invaluable tools and libraries
