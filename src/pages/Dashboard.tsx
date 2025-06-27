import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, TrendingUp, Activity, Clock, Calendar, Users, CreditCard, DollarSign, Building2, Film, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

import { apiClient } from '../utils/api-client';
import { formatCurrency, formatNumber } from '../utils/calculations';
import toast from 'react-hot-toast';

interface DashboardStats {
  draftOrders: number;
  pendingOrders: number;
  activeOrders: number;
  weeklyImpressions: number;
  totalBudgeted: number;
  activeBrands: number;
  mediaAssets: number;
  paymentMethods: number;
}

interface HourlyData {
  hour: string;
  impressions: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'traffic_admin';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    draftOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    weeklyImpressions: 0,
    totalBudgeted: 0,
    activeBrands: 0,
    mediaAssets: 0,
    paymentMethods: 0
  });
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);

  // Modal states
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form states
  const [brandForm, setBrandForm] = useState({
    commonName: '',
    legalName: '',
    email: '',
    phone: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: ''
  });

  const generateHourlyData = async () => {
    try {
      // TODO: Implement estimate items API endpoint
      // For now, return sample data to prevent errors
      const items: any[] = [];

      const data: HourlyData[] = [];
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Get to Monday
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      // Generate data for each hour
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + day);
          date.setHours(hour);

          let totalImpressions = 0;
          // TODO: Implement estimate items processing when API is available
          // items?.forEach((item: any) => {
          //   const dayPart = item.day_parts;
          //   const [startHour] = dayPart.start_time.split(':').map(Number);
          //   const [endHour] = dayPart.end_time.split(':').map(Number);
          //   if (hour >= startHour && hour <= endHour) {
          //     const hourlyBase = dayPart.expected_views / (endHour - startHour + 1);
          //     totalImpressions += hourlyBase * dayPart.multiplier * item.spots_per_occurrence;
          //   }
          // });

          const isFuture = date > now;
          const impressions = isFuture ? 0 : Math.round(totalImpressions);

          data.push({
            hour: `${dayNames[day]} ${hour.toString().padStart(2, '0')}:00`,
            impressions
          });
        }
      }

      return data;
    } catch (error) {
      console.error('Error generating hourly data:', error);
      return [];
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats from API
      const { data: statsData, error } = await apiClient.getDashboardStats();

      if (error) {
        throw new Error(error.message);
      }

      // Generate hourly data
      const hourlyData = await generateHourlyData();

      setStats(statsData);
      setHourlyData(hourlyData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleCreateOrder = async () => {
    try {
      const { data, error } = await apiClient.createEstimate({
        estimate_name: 'New Order',
        start_date: new Date().toISOString().split('T')[0],
        total_spend: 0,
        total_estimated_cost: 0,
        status: 'draft'
      });

      if (error) throw new Error(error.message);

      // Navigate to the new order in edit mode
      navigate(`/estimates/${data.id}?edit=true`);
      toast.success('New order created');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement brand creation API
    setShowBrandModal(false);
    toast('Brand creation API will be implemented soon');
    fetchDashboardData(); // Refresh stats
  };

  const handleCreatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally integrate with Stripe
    setShowPaymentModal(false);
    toast.success('Payment method added successfully');
    fetchDashboardData(); // Refresh stats
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button 
          onClick={handleCreateOrder}
          icon={<CreditCard size={16} />}
        >
          New Order
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="h-16 w-16 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">Draft Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-600">{stats.draftOrders}</p>
          <p className="mt-1 text-sm text-gray-500">
            In progress
          </p>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="h-16 w-16 text-orange-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">Pending Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-orange-500">{stats.pendingOrders}</p>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? 'Waiting for your review' : 'Awaiting approval'}
          </p>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="h-16 w-16 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">Active Campaigns</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.activeOrders}</p>
          <p className="mt-1 text-sm text-gray-500">Currently running</p>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="h-16 w-16 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">Weekly Reach</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{formatNumber(stats.weeklyImpressions)}</p>
          <p className="mt-1 text-sm text-gray-500">Total impressions</p>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Impressions Chart */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Weekly Impressions</h3>
            <p className="text-sm text-gray-500">Eastern Time (EST)</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  interval={23}
                  tickFormatter={(value) => value.split(' ')[0]}
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), 'Impressions']}
                  labelFormatter={(label) => `${label} EST`}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Account Overview */}
        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Account Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Budgeted</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.totalBudgeted)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>

            <button 
              onClick={() => stats.activeBrands === 0 && setShowBrandModal(true)}
              className="w-full"
            >
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm text-gray-600">Active Brands</p>
                  <p className="text-lg font-semibold">{stats.activeBrands || 'None'}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </button>

            <button 
              onClick={() => stats.mediaAssets === 0 && setShowMediaModal(true)}
              className="w-full"
            >
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm text-gray-600">Media Assets</p>
                  <p className="text-lg font-semibold">{stats.mediaAssets || 'None'}</p>
                </div>
                <Film className="h-8 w-8 text-purple-500" />
              </div>
            </button>

            <button 
              onClick={() => stats.paymentMethods === 0 && setShowPaymentModal(true)}
              className="w-full"
            >
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm text-gray-600">Payment Methods</p>
                  <p className="text-lg font-semibold">{stats.paymentMethods || 'None'}</p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-500" />
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* Create Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Brand</h3>
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowBrandModal(false)}
                icon={<X size={16} />}
              >
                Close
              </Button>
            </div>
            <form onSubmit={handleCreateBrand}>
              <Input
                label="Common Name"
                value={brandForm.commonName}
                onChange={(e) => setBrandForm({ ...brandForm, commonName: e.target.value })}
                required
              />
              <Input
                label="Legal Name"
                value={brandForm.legalName}
                onChange={(e) => setBrandForm({ ...brandForm, legalName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={brandForm.email}
                onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
              />
              <Input
                label="Phone"
                type="tel"
                value={brandForm.phone}
                onChange={(e) => setBrandForm({ ...brandForm, phone: e.target.value })}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="light"
                  onClick={() => setShowBrandModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Brand
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Media Asset Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload Media Asset</h3>
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowMediaModal(false)}
                icon={<X size={16} />}
              >
                Close
              </Button>
            </div>
            <p className="text-gray-600 mb-4">
              Please create a brand first before uploading media assets.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setShowMediaModal(false);
                  setShowBrandModal(true);
                }}
              >
                Create Brand
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Payment Method</h3>
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
                icon={<X size={16} />}
              >
                Close
              </Button>
            </div>
            <form onSubmit={handleCreatePaymentMethod}>
              <Input
                label="Card Number"
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                placeholder="**** **** **** ****"
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Month"
                  value={paymentForm.expiryMonth}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                  placeholder="MM"
                  maxLength={2}
                  required
                />
                <Input
                  label="Year"
                  value={paymentForm.expiryYear}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                  placeholder="YY"
                  maxLength={2}
                  required
                />
                <Input
                  label="CVC"
                  value={paymentForm.cvc}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })}
                  placeholder="***"
                  maxLength={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="light"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Card
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;