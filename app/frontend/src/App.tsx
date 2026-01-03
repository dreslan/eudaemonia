import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewQuest from './pages/NewQuest';
import NewAchievement from './pages/NewAchievement';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Tools from './pages/Tools';

import QuestDetail from './pages/QuestDetail';
import AchievementDetail from './pages/AchievementDetail';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<PublicLayout />}>
              <Route path="/public/:username" element={<PublicProfile />} />
              <Route path="/public/achievement/:id" element={<AchievementDetail />} />
            </Route>
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="quests/new" element={<NewQuest />} />
              <Route path="quests/:id" element={<QuestDetail />} />
              <Route path="quests/:id/edit" element={<NewQuest />} />
              <Route path="achievements/new" element={<NewAchievement />} />
              <Route path="achievements/:id" element={<AchievementDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="tools" element={<Tools />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
