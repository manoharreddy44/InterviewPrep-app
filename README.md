# Interview Preparation Application

A comprehensive full-stack application designed to help users prepare for interviews with AI-powered assistance, interview practice, and performance tracking.

## 🌟 Features

- 💡 AI-Powered Interview Assistance using OpenAI
- 🔐 Secure Authentication System
- 📊 Interview Performance Analytics & Reports
- 📝 Document Processing (PDF & Word)
- 📈 Interactive Charts for Progress Tracking
- ⚡ Real-time Interview Feedback
- 🔄 Automated Scheduling with Cron Jobs
- 📱 Responsive Design with Modern UI

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- OpenAI Integration
- PDF Processing (pdf-lib, pdf-parse)
- Document Processing (mammoth)
- Cron Jobs for Automation

### Frontend
- React.js with Vite
- Tailwind CSS
- Chart.js for Analytics
- Context API for State Management
- Custom React Hooks
- Modern Component Architecture

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- OpenAI API Key

### Environment Variables (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/interview-app.git
cd interview-app
```

2. Install dependencies for backend and frontend
```bash
# Root directory - Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Build the application
```bash
# From root directory
npm run build
```

4. Start the application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📁 Project Structure

```
├── backend/
│   ├── controllers/    # Route controllers
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── openAi/        # OpenAI integration
│   ├── utils/         # Utility functions
│   └── db/           # Database configuration
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Utility functions
│   └── public/       # Static assets
```

## 🔒 API Endpoints

### Authentication
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout

### User Management
- GET `/api/user/profile` - Get user profile
- PUT `/api/user/profile` - Update user profile

### Interview Management
- POST `/api/interview/create` - Create new interview
- GET `/api/interview/list` - Get user interviews
- GET `/api/interview/:id` - Get interview details

### Reports
- GET `/api/report/generate` - Generate interview reports
- GET `/api/report/history` - Get report history

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Chart.js for analytics visualization
- All contributors and supporters of the project 