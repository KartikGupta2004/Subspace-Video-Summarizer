import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {NhostClient, NhostProvider} from '@nhost/react'
import { NhostApolloProvider } from '@nhost/react-apollo';

import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { Summary } from './components/Summary';
import { History } from './components/History';
import { SummaryPage } from './components/ViewSummary';

const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN, // Missing value
  region: process.env.REACT_APP_NHOST_REGION,
})
function App() {
  return (
    <>
    <NhostProvider nhost = {nhost}>
      <NhostApolloProvider nhost = {nhost}>
        <BrowserRouter>
          <Routes>
            <Route path="sign-up" element={<SignUp />} />
            <Route path="sign-in" element={<SignIn />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="summary" element={<Summary />} />
              <Route path="/summary/:id" element={<SummaryPage />} />
              <Route path="history" element={<History />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NhostApolloProvider>

      <Toaster />
    </NhostProvider>
    </>
  );
}

export default App;
