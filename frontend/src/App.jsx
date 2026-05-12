import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar.jsx';
import SideNavbar from './components/SideNavbar/SideNavbar.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Home from './pages/Home/Home.jsx';
import VideoPage from './pages/Video/VideoPage.jsx';
import SignUp from './pages/SignUp/SignUp.jsx';
import Login from './pages/Login/Login.jsx';
import Channel from './pages/Channel/Channel.jsx';
import VideoUpload from './pages/VideoUpload/VideoUpload.jsx';
import EditVideo from './pages/VideoUpload/EditVideo.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';
import './App.css';

function App() {
  const [sideNavOpen, setSideNavOpen] = useState(true);

  return (
    <div className="app">
      <Navbar toggleSideNav={() => setSideNavOpen((p) => !p)} />

      <div className="app-body">
        <SideNavbar open={sideNavOpen} onClose={() => setSideNavOpen(false)}/>

        <main className={`app-main ${sideNavOpen ? 'with-sidebar' : ''}`}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<VideoPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/channel/:userId" element={<Channel />} />

            {/* Protected */}
            <Route path="/upload" element={<ProtectedRoute><VideoUpload /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><EditVideo /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <ToastContainer position="bottom-left" autoClose={3000} theme="dark" pauseOnHover />
    </div>
  );
}

export default App;
