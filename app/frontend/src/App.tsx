import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import NewQuest from './pages/NewQuest';
import NewAchievement from './pages/NewAchievement';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import Tools from './pages/Tools';

import QuestDetail from './pages/QuestDetail';
import AchievementDetail from './pages/AchievementDetail';
import PrintView from './pages/PrintView';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/print/quests/:id" element={<ProtectedRoute><PrintView /></ProtectedRoute>} />
            <Route path="/print/achievements/:id" element={<ProtectedRoute><PrintView /></ProtectedRoute>} />
            <Route path="/print/character" element={<ProtectedRoute><PrintView /></ProtectedRoute>} />
            
            <Route element={<PublicLayout />}>
              <Route path="/public/profile/:username" element={<PublicProfile />} />
              <Route path="/public/quests/:id" element={<QuestDetail />} />
              <Route path="/public/achievement/:id" element={<AchievementDetail />} />
            </Route>

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Profile />} />
              <Route path="quests/new" element={<NewQuest />} />
              <Route path="quests/:id" element={<QuestDetail />} />
              <Route path="quests/:id/edit" element={<NewQuest />} />
              <Route path="achievements/new" element={<NewAchievement />} />
              <Route path="achievements/:id" element={<AchievementDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="tools" element={<Tools />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
