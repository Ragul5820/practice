# CodeLearn LMS - Learning Management System

A modern, full-featured Learning Management System with integrated code compiler and student performance tracking.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Initialize Demo Data**
   - Navigate to: http://localhost:3000/api/init-demo
   - This creates demo users and courses

4. **Login**
   - Go to: http://localhost:3000
   - Use demo credentials:
     - Student: `student@demo.com` / `password`
     - Teacher: `teacher@demo.com` / `password`
     - Admin: `admin@demo.com` / `password`

## ✨ Features

- **Authentication**: Secure login/signup with JWT and bcrypt
- **Code Editor**: Monaco Editor with multi-language support
- **Compiler**: Real-time code execution (Python, JavaScript, Java, C++, C)
- **Student Dashboard**: Statistics, quick actions, and activity feed
- **Practice Playground**: Free-form coding environment
- **Modern UI**: Glassmorphism design with dark mode support

## 🛠️ Tech Stack

- **Framework**: Next.js 15 + TypeScript
- **Styling**: TailwindCSS
- **Editor**: Monaco Editor
- **Compiler**: Judge0 API (with local JS fallback)
- **Auth**: JWT + bcryptjs
- **Database**: JSON file storage

## 📁 Project Structure

```
lms-platform/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (student)/         # Student pages (dashboard, practice)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components (Button, Card, Input, Modal)
│   └── editor/           # Code editor components
├── lib/                   # Utilities
│   ├── auth.ts           # Authentication
│   ├── compiler.ts       # Code compilation
│   └── db.ts             # Database operations
├── context/              # React context
└── data/                 # JSON database
```

## 🧪 Testing

### Manual Testing Steps

1. **Login Flow**
   - Test login with demo credentials
   - Test signup with new account
   - Verify JWT token persistence

2. **Code Playground**
   - Navigate to `/practice`
   - Test Python code execution
   - Test JavaScript code execution
   - Test with custom input
   - Verify error handling

3. **Dashboard**
   - View statistics cards
   - Test quick action navigation
   - Check recent activity

## 🔧 Configuration

### Optional: Judge0 API Setup

For full multi-language support:

1. Get API key from [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Create `.env.local`:
   ```
   RAPIDAPI_KEY=your_api_key_here
   JWT_SECRET=your_secret_key_here
   ```
3. Restart server

**Note**: Without API key, JavaScript runs locally; other languages will show connection errors.

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Code Execution
- `POST /api/compile` - Compile and run code

### Demo Data
- `POST /api/init-demo` - Initialize demo users and courses

## 🎨 Design System

### Colors
- Primary: `#0ea5e9` (blue)
- Success: `#10b981` (green)
- Warning: `#f97316` (orange)
- Error: `#ef4444` (red)

### Components
- **Button**: Primary, Secondary, Danger variants
- **Card**: Glass effect with optional hover
- **Input**: With label and error support
- **Modal**: Backdrop blur with animations

## 🚧 Future Enhancements

- [ ] Course creation and management
- [ ] Assessment/quiz system
- [ ] Performance analytics with charts
- [ ] Admin dashboard
- [ ] Teacher dashboard
- [ ] Real-time collaboration
- [ ] Code submission history
- [ ] Leaderboards

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ using Next.js and TypeScript
