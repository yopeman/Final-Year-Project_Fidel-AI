# Fidel AI - Language Learning Platform
## Empowering Language Learning Through Technology & AI

**Final Year Project Presentation**

---

## Introduction

- **Project Name**: Fidel AI
- **Type**: Comprehensive Language Learning Platform
- **Purpose**: AI-powered language education with community engagement
- **Scope**: Multi-platform ecosystem (Web, Mobile, Admin)

---

## System Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Web Frontend│    │ Mobile App  │    │ Admin Panel │
│   (React)   │    │(React Native│    │   (React)   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       └───────────────────┼──────────────────┘
                           │ GraphQL/HTTP
              ┌─────────────▼─────────────┐
              │    GraphQL API Server     │
              │     (FastAPI/Python)      │
              │  • Auth • AI • WebSocket  │
              └─────────────┬─────────────┘
                           │
              ┌─────────────▼─────────────┐
              │      Database (MySQL)     │
              │    (SQLAlchemy ORM)       │
              └───────────────────────────┘
```

---

## Backend Implementation - Project Structure

```
backend-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point
│   ├── config/
│   │   └── database.py      # SQLAlchemy setup
│   ├── schema/              # GraphQL schemas
│   │   ├── user.gql
│   │   ├── course.gql
│   │   └── schedule.gql
│   └── resolvers/           # GraphQL resolvers
│       ├── user.py
│       └── course.py
├── static/uploads/          # File storage
├── .env                     # Environment variables
└── requirements.txt
```

---

## Backend Implementation - Database Models

```python
# User Model Example
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(100), unique=True)
    password_hash = Column(String(255))
    role = Column(Enum("ADMIN", "INSTRUCTOR", "STUDENT"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    enrollments = relationship("Enrollment", back_populates="user")
    progress = relationship("Progress", back_populates="user")
```

---

## Backend Implementation - GraphQL Schema

```graphql
# User Schema Example
type User {
  id: ID!
  username: String!
  email: String!
  role: UserRole!
  createdAt: DateTime!
  enrollments: [Enrollment!]!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  me: User
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}
```

---

## Backend Implementation - GraphQL Resolvers

```python
# User Resolver Example
from ariadne import QueryType, MutationType

query = QueryType()
mutation = MutationType()

@query.field("users")
def resolve_users(_, info):
    db = info.context["db"]
    return db.query(User).all()

@query.field("user")
def resolve_user(_, info, id):
    db = info.context["db"]
    return db.query(User).filter(User.id == id).first()

@mutation.field("createUser")
def resolve_create_user(_, info, input):
    db = info.context["db"]
    user = User(**input)
    db.add(user)
    db.commit()
    return user
```

---

## Backend Implementation - Authentication

```python
# JWT Authentication Implementation
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

---

## Backend Implementation - WebSocket Real-time Chat

```python
# WebSocket Implementation
from fastapi import WebSocket, WebSocketDisconnect
from broadcaster import Broadcast

broadcast = Broadcast("memory://")

@app.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    try:
        async with broadcast.subscribe(channel=room_id) as subscriber:
            async for event in subscriber:
                await websocket.send_text(event.message)
    except WebSocketDisconnect:
        await broadcast.disconnect()

async def send_message(room_id: str, message: str):
    await broadcast.publish(channel=room_id, message=message)
```

---

## Backend Implementation - AI Integration

```python
# AI Chatbot with Ollama
from langchain_community.llms import Ollama
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

llm = Ollama(
    base_url=os.getenv("OLLAMA_BASE_URL"),
    model="llama2"
)

conversation = ConversationChain(
    llm=llm,
    memory=ConversationBufferMemory()
)

async def get_ai_response(user_message: str, context: str):
    prompt = f"""You are a language tutor. 
    Context: {context}
    User: {user_message}
    Tutor:"""
    return await conversation.apredict(input=prompt)
```

---

## Frontend Implementation - Project Structure

```
frontend-web/
├── src/
│   ├── components/           # React components
│   │   ├── BatchCourseModals.jsx
│   │   ├── AdminSchedules.jsx
│   │   └── CourseManagementModals.jsx
│   ├── pages/               # Page components
│   ├── graphql/             # GraphQL queries/mutations
│   │   ├── user.js
│   │   ├── course.js
│   │   └── schedule.js
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

## Frontend Implementation - GraphQL Client Setup

```javascript
// Apollo Client Configuration
import { ApolloClient, InMemoryCache, createHttpLink } 
  from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

---

## Frontend Implementation - GraphQL Queries & Mutations

```javascript
// GraphQL Operations Example
import { gql } from '@apollo/client';

export const GET_SCHEDULES = gql`
  query GetSchedules {
    schedules {
      id
      title
      startTime
      endTime
      instructor {
        id
        username
      }
    }
  }
`;

export const ASSIGN_COURSE = gql`
  mutation AssignCourse($batchId: ID!, $courseId: ID!) {
    assignCourse(batchId: $batchId, courseId: $courseId) {
      id
      name
      courses {
        id
        title
      }
    }
  }
`;
```

---

## Frontend Implementation - React Components

```jsx
// Component with GraphQL
import { useQuery, useMutation } from '@apollo/client';
import { GET_SCHEDULES, ASSIGN_COURSE } from '../graphql/schedule';

export const AdminSchedules = () => {
  const { data, loading, error } = useQuery(GET_SCHEDULES);
  const [assignCourse] = useMutation(ASSIGN_COURSE);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="schedules-container">
      {data.schedules.map(schedule => (
        <ScheduleCard 
          key={schedule.id} 
          schedule={schedule}
          onAssign={(courseId) => 
            assignCourse({ variables: { 
              batchId: schedule.id, 
              courseId 
            }})}
        />
      ))}
    </div>
  );
};
```

---

## Frontend Implementation - UI/UX with Tailwind + Framer Motion

```jsx
// Animated Modal Component
import { motion, AnimatePresence } from 'framer-motion';

export const AssignCourseModal = ({ isOpen, onClose, onSubmit }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl 
                        flex items-center justify-center p-4 z-[110]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-premium w-full max-w-md 
                       border border-white/10 shadow-2xl rounded-3xl"
          >
            {/* Modal Content */}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

---

## Mobile Implementation - React Native + Expo

```
mobile-app/
├── src/
│   ├── components/          # Reusable RN components
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.jsx
│   │   ├── CourseScreen.jsx
│   │   └── ChatScreen.jsx
│   ├── navigation/          # Navigation config
│   │   └── AppNavigator.jsx
│   ├── store/               # Zustand store
│   │   └── useAuthStore.js
│   ├── api/                 # API clients
│   └── utils/               # Utilities
├── App.js
└── app.json
```

---

## Mobile Implementation - Navigation & State

```javascript
// React Navigation Setup
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from 
  '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from 
  '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Zustand State Management
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));
```

---

## Mobile Implementation - NativeWind Styling

```jsx
// React Native with Tailwind (NativeWind)
import { View, Text, TouchableOpacity } from 'react-native';

export const CourseCard = ({ course, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-4 
                 shadow-lg border border-gray-100"
    >
      <Text className="text-xl font-bold text-gray-900">
        {course.title}
      </Text>
      <Text className="text-sm text-gray-600 mt-1">
        {course.description}
      </Text>
      <View className="flex-row items-center mt-3">
        <Text className="text-xs text-blue-600 font-medium">
          {course.lessonCount} Lessons
        </Text>
      </View>
    </TouchableOpacity>
  );
};
```

---

## Database Schema Design

```sql
-- Core Tables
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','INSTRUCTOR','STUDENT') DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    batch_id INT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Environment Configuration

```bash
# Backend .env
DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/fidel_ai
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLLAMA_BASE_URL=http://localhost:11434

# Frontend .env
VITE_GRAPHQL_ENDPOINT=http://localhost:8000/graphql
VITE_API_ENDPOINT=http://localhost:8000
VITE_APP_NAME=Fidel AI
VITE_APP_VERSION=1.0.0
```

---

## Deployment Architecture

```
Production Deployment:

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   Docker    │────▶│   MySQL     │
│  (Reverse   │     │  Containers │     │  Database   │
│   Proxy)    │     │             │     │             │
└─────────────┘     │ • FastAPI   │     └─────────────┘
                    │ • React     │
                    │   Frontend  │
                    └─────────────┘
                         │
                    ┌────▼────┐
                    │ Ollama  │
                    │  (AI)   │
                    └─────────┘
```

---

## Challenges & Technical Solutions

| Challenge | Technical Solution |
|-----------|-------------------|
| Real-time Updates | WebSocket with broadcaster library |
| Scalable API | GraphQL with FastAPI + Ariadne |
| State Management | Zustand (Mobile) / React Context (Web) |
| AI Integration | Ollama + LangChain for local AI |
| Cross-platform UI | Tailwind CSS + NativeWind |
| Secure Auth | JWT tokens with bcrypt hashing |

---

## Testing & Development Tools

- **Backend Testing**: pytest with FastAPI TestClient
- **GraphQL Testing**: Built-in GraphQL Playground at `/graphql`
- **Frontend Testing**: React Testing Library + Jest
- **Hot Reload**: Automatic reloading for all platforms
- **Database Migrations**: SQLAlchemy Alembic
- **API Documentation**: Auto-generated Swagger/OpenAPI

---

## Key Implementation Highlights

- **GraphQL API**: Single endpoint for all data operations
- **Modular Architecture**: Separate concerns per component
- **Type Safety**: Strong typing with Python types + GraphQL schemas
- **AI-Powered**: Local AI with Ollama for privacy
- **Real-time**: WebSocket for chat and notifications
- **Cross-Platform**: 90%+ code sharing between Web/Mobile

---

## Future Technical Enhancements

- **Redis Caching**: Improve API response times
- **Docker Compose**: Full container orchestration
- **CI/CD Pipeline**: GitHub Actions for automated deployment
- **Monitoring**: Prometheus + Grafana for observability
- **CDN Integration**: Cloudflare for static assets
- **Push Notifications**: Firebase Cloud Messaging

---

## Thank You for Your Attention!

**Questions?**

**Repository**: github.com/yopeman/Final-Year-Project_Fidel-AI

**Fidel AI** - Empowering Language Learning Through Technology

