# Fidel AI - Language Learning Platform

Fidel AI is a comprehensive language learning platform designed to help users master new languages through interactive lessons, AI-powered tutoring, and community engagement. The platform offers a complete ecosystem for language education with web and mobile applications.

## 🚀 Features

### 🎓 Learning Management System
- **Interactive Lessons**: Structured language courses with multimedia content
- **Skill Tracking**: Reading, writing, speaking, and listening skill development
- **Progress Monitoring**: Real-time progress tracking and analytics
- **Certificates**: Generate and share achievement certificates

### 🤖 AI-Powered Features
- **Free Conversations**: AI chatbot for language practice
- **Real-time Translation**: Instant text translation with pronunciation
- **Smart Feedback**: AI-driven feedback on exercises and conversations
- **Personalized Learning**: Adaptive learning paths based on user performance

### 📚 Content Management
- **Course Materials**: Rich multimedia learning resources
- **Vocabulary Builder**: Interactive vocabulary learning tools
- **Online Articles**: Curated reading materials
- **YouTube Integration**: Video-based learning content

### 👥 Community & Social
- **Batch System**: Organized learning groups and cohorts
- **Community Forums**: Discussion boards for language learners
- **Peer Feedback**: Student-to-student feedback system
- **Instructor Management**: Teacher and student management system

### 💬 Communication
- **Real-time Chat**: WebSocket-based messaging
- **Notifications**: Push notifications for updates and reminders
- **Feedback System**: Structured feedback collection and management

### 💰 Business Features
- **Payment Integration**: Secure payment processing
- **Enrollment Management**: Student enrollment and batch management
- **Scheduling**: Class and lesson scheduling system
- **Attendance Tracking**: Automated attendance management

## 🏗️ Architecture

Fidel AI is built as a multi-platform application with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │  Mobile App     │    │  Admin Panel    │
│   (React/Vite)  │    │ (React Native)  │    │   (React)       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     GraphQL API Server    │
                    │      (FastAPI/Python)     │
                    │                           │
                    │  • Authentication         │
                    │  • Business Logic         │
                    │  • AI Integration         │
                    │  • WebSocket Support      │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │        Database           │
                    │      (MySQL/SQLAlchemy)   │
                    │                           │
                    │  • User Management        │
                    │  • Course Data            │
                    │  • Progress Tracking      │
                    │  • Community Data         │
                    └───────────────────────────┘
```

## 🛠️ Tech Stack

### Backend API
- **Framework**: FastAPI (Python 3.12+)
- **Database**: MySQL with SQLAlchemy ORM
- **GraphQL**: Ariadne for GraphQL schema and resolvers
- **Authentication**: JWT with bcrypt hashing
- **AI Integration**: LangChain, Ollama for AI features
- **Real-time**: WebSocket support with broadcaster
- **File Storage**: Static file serving for media content
- **Search**: DuckDuckGo and YouTube search integration

### Frontend Web
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: React Hook Form, Zod for validation
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **GraphQL Client**: Apollo Client
- **Animations**: Framer Motion

### Mobile App
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs, Stack)
- **State Management**: Zustand
- **Media**: React Native AV for audio/video
- **Styling**: NativeWind (Tailwind for React Native)
- **File System**: Expo File System for media handling

## 📦 Installation

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- MySQL database server
- Ollama (for AI features)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yopeman/Final-Year-Project_Fidel-AI.git
   cd Final-Year-Project_Fidel-AI/backend-api
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   # or using uv
   uv install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend-api directory:
   ```env
   DATABASE_URL=mysql+pymysql://username:password@localhost:3306/fidel_ai
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   OLLAMA_BASE_URL=http://localhost:11434
   ```

4. **Initialize database**
   ```bash
   python -c "from app.config.database import create_table; create_table()"
   ```

5. **Start the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Web Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file:
   ```env
   VITE_GRAPHQL_ENDPOINT=http://localhost:8000/graphql
   VITE_API_ENDPOINT=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd ../mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/fidel_ai

# Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=your-openai-key

# External Services
YOUTUBE_API_KEY=your-youtube-key
DDG_SEARCH_ENABLED=true

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./static/uploads
```

#### Frontend (.env)
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:8000/graphql
VITE_API_ENDPOINT=http://localhost:8000
VITE_APP_NAME=Fidel AI
VITE_APP_VERSION=1.0.0
```

## 🚀 Usage

### GraphQL API

The backend provides a comprehensive GraphQL API. Access the GraphQL playground at:
```
http://localhost:8000/graphql
```

#### Example Queries

**Get all courses:**
```graphql
query {
  courses {
    id
    title
    description
    modules {
      id
      title
      lessons {
        id
        title
        type
      }
    }
  }
}
```

**Create a new user:**
```graphql
mutation {
  createUser(input: {
    username: "john_doe"
    email: "john@example.com"
    password: "securepassword"
    role: "STUDENT"
  }) {
    id
    username
    email
    role
  }
}
```

### Web Application

Access the web application at:
```
http://localhost:5173
```

### Mobile Application

Use the Expo Go app to scan the QR code displayed in the terminal when running `npm start`.

## 📊 Database Schema

The application uses a relational database with the following main entities:

- **Users**: User accounts with roles (Admin, Instructor, Student)
- **Courses**: Language courses with structured content
- **Modules**: Course modules containing lessons
- **Lessons**: Individual lesson content with various types
- **Batches**: Learning groups and cohorts
- **Enrollments**: Student enrollment in batches
- **Progress**: Learning progress tracking
- **Community**: Discussion forums and posts
- **Payments**: Transaction and payment records

## 🔐 Authentication

The system implements JWT-based authentication with the following roles:

- **Admin**: Full system access
- **Instructor**: Course and student management
- **Student**: Learning platform access

## 🤖 AI Features

### Free Conversation
AI-powered chat for language practice with real-time feedback and suggestions.

### Translation Service
Real-time text translation with pronunciation guides and cultural context.

### Content Generation
AI-assisted content creation for lessons and learning materials.

## 📈 Monitoring & Development

### Development Tools
- **Hot Reload**: Automatic reloading during development
- **GraphQL Playground**: Interactive API testing interface
- **WebSocket Debugging**: Real-time communication monitoring
- **Database Migrations**: SQLAlchemy Alembic for schema management

### Production Deployment
- **Docker Support**: Containerized deployment
- **Environment Configuration**: Environment-specific settings
- **Logging**: Comprehensive application logging
- **Error Handling**: Graceful error handling and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangChain**: For powerful AI integration capabilities
- **FastAPI**: For excellent API development experience
- **React Ecosystem**: For robust frontend development
- **Expo**: For seamless mobile app development

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our community forum
- Contact the development team

---

**Fidel AI** - Empowering language learning through technology and community.