import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import OrdersView from './pages/OrdersView';
import DraftsView from './pages/admin/DraftsView';
import CampaignsView from './pages/CampaignsView';
import EstimateDetails from './pages/EstimateDetails';
import BrandsView from './pages/BrandsView';
import MediaView from './pages/MediaView';
import PaymentMethodsView from './pages/PaymentMethodsView';

import SubscriptionSuccessView from './pages/SubscriptionSuccessView';
import ApprovalsView from './pages/admin/ApprovalsView';
import MediaApprovalsView from './pages/admin/MediaApprovalsView';
import ReconciliationView from './pages/admin/ReconciliationView';
import ProfileView from './pages/ProfileView';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/subscription-success" element={<SubscriptionSuccessView />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<OrdersView />} />
              <Route path="campaigns" element={<CampaignsView />} />
              <Route path="estimates/:id" element={<EstimateDetails />} />
              <Route path="brands" element={<BrandsView />} />
              <Route path="media" element={<MediaView />} />
              <Route path="payment-methods" element={<PaymentMethodsView />} />
              
              <Route path="profile" element={<ProfileView />} />
              <Route path="admin" element={<AdminRoute />}>
                <Route path="drafts" element={<DraftsView />} />
                <Route path="approvals" element={<ApprovalsView />} />
                <Route path="media-approvals" element={<MediaApprovalsView />} />
                <Route path="reconciliation" element={<ReconciliationView />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;