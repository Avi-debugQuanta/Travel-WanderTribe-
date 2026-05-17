import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Component } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TripDetail from './pages/TripDetail';
import Login from './pages/Login';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div style={{padding:'2rem',color:'#f87171',background:'#0f172a',minHeight:'100vh',fontFamily:'monospace'}}>
        <h2>Something went wrong</h2>
        <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{this.state.error.message}{'\n'}{this.state.error.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trip/:id" element={<TripDetail />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
