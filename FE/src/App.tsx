/**
 * ============================================
 * APP — Entry point cho toàn app
 *
 * Cấu hình router và providers
 * ============================================
 */
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';

function App() {
  return <RouterProvider router={router} />;
}

export default App;