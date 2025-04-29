import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DynamicForm from './components/DynamicForm';

const ProtectedRoute = ({ children }) => {
  const rollNumber = localStorage.getItem('rollNumber');
  if (!rollNumber) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <DynamicForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
