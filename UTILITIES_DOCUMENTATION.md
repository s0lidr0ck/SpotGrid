# SpotGrid Utilities Documentation

## Table of Contents
1. [API Client](#api-client)
2. [Authentication Utilities](#authentication-utilities)
3. [Calculation Utilities](#calculation-utilities)
4. [Status Utilities](#status-utilities)
5. [Database Utilities](#database-utilities)
6. [Email Services](#email-services)
7. [Stripe Integration](#stripe-integration)
8. [Type Definitions](#type-definitions)

---

## API Client

### ApiClient Class (`src/utils/api-client.ts`)

Centralized HTTP client for all backend API communication with automatic error handling and token management.

#### Initialization
```typescript
import { apiClient } from '../utils/api-client';

// Token is automatically loaded from localStorage
// Set or update token
apiClient.setToken('your-jwt-token');
```

#### Core Methods

##### Authentication Methods
```typescript
// Login user
const { data, error } = await apiClient.login(email, password);
if (error) {
  console.error('Login failed:', error.message);
} else {
  console.log('Login successful:', data.user);
  // Token is automatically stored
}

// Get current user
const { data, error } = await apiClient.getCurrentUser();

// Logout user
await apiClient.logout(); // Automatically clears token
```

##### Brand Management
```typescript
// Get all brands
const { data: brands, error } = await apiClient.getBrands();

// Get specific brand
const { data: brand, error } = await apiClient.getBrand(brandId);

// Create new brand
const brandData = {
  common_name: "Acme Corp",
  legal_name: "Acme Corporation LLC",
  address: "123 Business St, City, State 12345",
  phone: "+1-555-0123",
  email: "contact@acmecorp.com",
  contact_first_name: "John",
  contact_last_name: "Doe",
  contact_job_title: "Marketing Director"
};

const { data: newBrand, error } = await apiClient.createBrand(brandData);

// Update brand
const updateData = { phone: "+1-555-0124" };
const { data: updatedBrand, error } = await apiClient.updateBrand(brandId, updateData);

// Delete brand
const { data, error } = await apiClient.deleteBrand(brandId);
```

##### Estimate Management
```typescript
// Get all estimates
const { data: estimates, error } = await apiClient.getEstimates();

// Get estimates with filters
const { data: draftEstimates, error } = await apiClient.getEstimates({ 
  status: 'draft' 
});

const { data: activeEstimates, error } = await apiClient.getEstimates({ 
  exclude_status: ['draft', 'rejected'] 
});

// Get specific estimate
const { data: estimate, error } = await apiClient.getEstimate(estimateId);

// Create new estimate
const estimateData = {
  estimate_name: "Q4 Campaign",
  start_date: "2024-10-01",
  total_spend: 10000.00,
  total_estimated_cost: 12000.00,
  status: "draft",
  brand_id: brandId
};

const { data: newEstimate, error } = await apiClient.createEstimate(estimateData);

// Update estimate
const updateData = { status: 'pending_approval' };
const { data: updatedEstimate, error } = await apiClient.updateEstimate(estimateId, updateData);

// Delete estimate
const { data, error } = await apiClient.deleteEstimate(estimateId);

// Get dashboard statistics
const { data: stats, error } = await apiClient.getDashboardStats();
```

#### Error Handling

All API methods return a consistent response format:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: { message: string } | null;
}
```

**Usage Pattern**:
```typescript
const { data, error } = await apiClient.someMethod();

if (error) {
  // Handle error
  toast.error(error.message);
  return;
}

// Use data safely
console.log('Success:', data);
```

#### Custom Request Method

For custom API calls not covered by specific methods:

```typescript
// The request method is private, but you can extend ApiClient
class ExtendedApiClient extends ApiClient {
  async customEndpoint(data: any) {
    return this.request<ResponseType>('/custom-endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
```

---

## Authentication Utilities

### Token Management (`src/utils/auth.ts`)

#### Core Functions
```typescript
import { 
  getStoredToken, 
  setStoredToken, 
  clearStoredToken,
  isAdmin,
  getCurrentUserId
} from '../utils/auth';

// Token management
const token = getStoredToken(); // Get from localStorage
setStoredToken('new-jwt-token'); // Store in localStorage
clearStoredToken(); // Remove from localStorage

// User role checking
const user = { role: 'traffic_admin' };
if (isAdmin(user)) {
  console.log('User has admin privileges');
}

// Get current user ID
const userId = getCurrentUserId();
if (userId) {
  console.log('Current user ID:', userId);
}
```

#### Legacy Authentication Functions

**Note**: These are placeholder functions being migrated to server-side:

```typescript
// Generate token (placeholder - server-side only)
const token = generateToken(user);

// Verify token (placeholder - server-side only)
const decoded = verifyToken(token);

// Hash password (placeholder - server-side only)
const hashedPassword = await hashPassword('password123');

// Verify password (placeholder - server-side only)
const isValid = await verifyPassword('password123', hashedPassword);
```

### Authentication Context Hook

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user, 
    loading, 
    error, 
    isAuthenticated, 
    login, 
    logout, 
    clearError 
  } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    clearError(); // Clear any previous errors
    try {
      await login(email, password);
      // Redirect or update UI
    } catch (error) {
      // Error is automatically handled by context
      console.error('Login failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} error={error} />
      )}
    </div>
  );
}
```

---

## Calculation Utilities

### Business Logic Calculations (`src/utils/calculations.ts`)

#### Cost and Budget Calculations

```typescript
import { 
  calculateWeeklySpend,
  calculateWeeklyImpressions,
  calculateBudgetDuration,
  formatCurrency,
  formatNumber
} from '../utils/calculations';

// Define types
interface EstimateItem {
  id: string;
  dayPartId: string;
  specificDate: string;
  userDefinedCpm: number;
  spotsPerOccurrence: number;
}

interface DayPart {
  id: string;
  name: string;
  expectedViews: number;
  days: number;
}

// Example data
const estimateItems: EstimateItem[] = [
  {
    id: '1',
    dayPartId: 'morning',
    specificDate: '2024-01-01',
    userDefinedCpm: 15.50,
    spotsPerOccurrence: 3
  }
];

const dayParts: DayPart[] = [
  {
    id: 'morning',
    name: 'Morning Drive',
    expectedViews: 50000,
    days: 7
  }
];

// Calculate weekly spend
const weeklySpend = calculateWeeklySpend(estimateItems, dayParts);
console.log(`Weekly spend: ${formatCurrency(weeklySpend)}`);

// Calculate weekly impressions
const weeklyImpressions = calculateWeeklyImpressions(estimateItems, dayParts);
console.log(`Weekly impressions: ${formatNumber(weeklyImpressions)}`);

// Calculate budget duration
const totalBudget = 50000;
const duration = calculateBudgetDuration(totalBudget, weeklySpend);
console.log(`Budget will last: ${duration}`);
```

#### Formatting Functions

```typescript
// Currency formatting
const amount = 1234.56;
console.log(formatCurrency(amount)); // "$1,234.56"

// Number formatting
const impressions = 1234567;
console.log(formatNumber(impressions)); // "1,234,567"

// Usage in components
function CampaignSummary({ campaign }) {
  return (
    <div>
      <p>Budget: {formatCurrency(campaign.budget)}</p>
      <p>Impressions: {formatNumber(campaign.impressions)}</p>
    </div>
  );
}
```

#### Custom Calculation Functions

Extend calculations for specific business needs:

```typescript
// Calculate cost per acquisition
export const calculateCPA = (totalSpend: number, conversions: number): number => {
  if (conversions <= 0) return 0;
  return totalSpend / conversions;
};

// Calculate return on ad spend
export const calculateROAS = (revenue: number, adSpend: number): number => {
  if (adSpend <= 0) return 0;
  return revenue / adSpend;
};

// Calculate click-through rate
export const calculateCTR = (clicks: number, impressions: number): number => {
  if (impressions <= 0) return 0;
  return (clicks / impressions) * 100;
};

// Usage
const cpa = calculateCPA(10000, 250); // $40 per acquisition
const roas = calculateROAS(50000, 10000); // 5:1 return
const ctr = calculateCTR(500, 100000); // 0.5% CTR
```

---

## Status Utilities

### Status Management (`src/utils/statusUtils.ts`)

#### Status Color Mapping

```typescript
import { getStatusColor, getStatusDisplayName } from '../utils/statusUtils';

// Get color classes for status badges
const statusColor = getStatusColor('approved'); // Returns 'text-green-600'
const pendingColor = getStatusColor('pending'); // Returns 'text-yellow-600'

// Get human-readable status names
const displayName = getStatusDisplayName('pending_approval'); // Returns 'Pending Approval'
```

#### Complete Status Utilities

```typescript
// Status color mapping
export const getStatusColor = (status: string): string => {
  const colors = {
    draft: 'text-gray-600',
    pending: 'text-yellow-600',
    pending_approval: 'text-yellow-600',
    approved: 'text-green-600',
    rejected: 'text-red-600',
    active: 'text-blue-600',
    inactive: 'text-gray-400',
    completed: 'text-green-600',
    cancelled: 'text-red-600'
  };
  return colors[status] || 'text-gray-600';
};

// Status background mapping
export const getStatusBgColor = (status: string): string => {
  const colors = {
    draft: 'bg-gray-100',
    pending: 'bg-yellow-100',
    pending_approval: 'bg-yellow-100',
    approved: 'bg-green-100',
    rejected: 'bg-red-100',
    active: 'bg-blue-100',
    inactive: 'bg-gray-100',
    completed: 'bg-green-100',
    cancelled: 'bg-red-100'
  };
  return colors[status] || 'bg-gray-100';
};

// Status display names
export const getStatusDisplayName = (status: string): string => {
  const names = {
    draft: 'Draft',
    pending: 'Pending',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    inactive: 'Inactive',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return names[status] || status;
};

// Status workflow validation
export const canTransitionTo = (currentStatus: string, newStatus: string): boolean => {
  const validTransitions = {
    draft: ['pending_approval', 'rejected'],
    pending_approval: ['approved', 'rejected'],
    approved: ['active', 'cancelled'],
    active: ['completed', 'cancelled'],
    rejected: ['draft'],
    completed: [],
    cancelled: ['draft']
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Usage in components
function StatusSelector({ currentStatus, onChange }) {
  const validStatuses = ['pending_approval', 'approved', 'rejected'];
  
  return (
    <select 
      value={currentStatus} 
      onChange={(e) => onChange(e.target.value)}
    >
      {validStatuses
        .filter(status => canTransitionTo(currentStatus, status))
        .map(status => (
          <option key={status} value={status}>
            {getStatusDisplayName(status)}
          </option>
        ))}
    </select>
  );
}
```

---

## Database Utilities

### Database Connection (`server/database.js`)

#### Query Function

```typescript
import { query } from '../database.js';

// Basic query
const result = await query('SELECT * FROM users WHERE email = $1', ['user@example.com']);
console.log(result.rows);

// Insert with returning
const newUser = await query(`
  INSERT INTO users (email, password_hash, full_name, role) 
  VALUES ($1, $2, $3, $4) 
  RETURNING *
`, [email, passwordHash, fullName, role]);

// Update with conditions
const updatedBrand = await query(`
  UPDATE brands 
  SET common_name = $1, updated_at = NOW() 
  WHERE id = $2 AND owner_id = $3
  RETURNING *
`, [newName, brandId, userId]);

// Complex joins
const estimatesWithBrands = await query(`
  SELECT 
    e.*,
    b.common_name as brand_name,
    COUNT(ma.id) as media_asset_count
  FROM estimates e
  LEFT JOIN brands b ON e.brand_id = b.id
  LEFT JOIN media_assets ma ON e.id = ma.estimate_id
  WHERE e.owner_id = $1
  GROUP BY e.id, b.common_name
  ORDER BY e.updated_at DESC
`, [userId]);
```

#### Transaction Handling

```typescript
// Manual transaction
import { pool } from '../database.js';

const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  const brand = await client.query(
    'INSERT INTO brands (common_name, owner_id) VALUES ($1, $2) RETURNING *',
    [brandName, userId]
  );
  
  const estimate = await client.query(
    'INSERT INTO estimates (name, brand_id, owner_id) VALUES ($1, $2, $3) RETURNING *',
    [estimateName, brand.rows[0].id, userId]
  );
  
  await client.query('COMMIT');
  return { brand: brand.rows[0], estimate: estimate.rows[0] };
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### Database Types and Enums

```typescript
// TypeScript definitions for database enums
export type UserRole = 'client' | 'traffic_admin';
export type EstimateStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type MediaStatus = 'pending' | 'approved' | 'rejected';
export type StripeSubscriptionStatus = 
  | 'not_started' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'trialing' 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'paused';

// Database model interfaces
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export interface Brand {
  id: string;
  common_name: string;
  legal_name: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Estimate {
  id: string;
  name: string;
  brand_id?: string;
  owner_id: string;
  status: EstimateStatus;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Email Services

### Email Service (`src/utils/emailService.ts`)

#### Basic Email Functionality

```typescript
import { sendEmail, sendEstimateNotification } from '../utils/emailService';

// Send basic email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to SpotGrid',
  html: '<p>Welcome to our platform!</p>',
  text: 'Welcome to our platform!'
});

// Send estimate notification
await sendEstimateNotification({
  estimateId: 'uuid',
  recipientEmail: 'admin@company.com',
  estimateName: 'Q4 Campaign',
  status: 'pending_approval',
  brandName: 'Acme Corp'
});
```

### Email Templates (`src/utils/emailTemplates.ts`)

#### Template Functions

```typescript
import { 
  generateEstimateApprovalEmail,
  generateEstimateRejectionEmail,
  generateWelcomeEmail,
  generatePasswordResetEmail
} from '../utils/emailTemplates';

// Generate estimate approval email
const approvalEmail = generateEstimateApprovalEmail({
  estimateName: 'Q4 Campaign',
  brandName: 'Acme Corp',
  approvedBy: 'admin@company.com',
  approvedAt: new Date(),
  estimateUrl: 'https://app.spotgrid.com/estimates/123'
});

// Generate rejection email
const rejectionEmail = generateEstimateRejectionEmail({
  estimateName: 'Q4 Campaign',
  brandName: 'Acme Corp',
  rejectedBy: 'admin@company.com',
  rejectionReason: 'Budget exceeds allocated amount',
  rejectedAt: new Date()
});

// Generate welcome email
const welcomeEmail = generateWelcomeEmail({
  userName: 'John Doe',
  userEmail: 'john@example.com',
  temporaryPassword: 'temp123',
  loginUrl: 'https://app.spotgrid.com/login'
});
```

#### Custom Email Templates

```typescript
// Create custom email template
export const generateCustomTemplate = (data: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #3b82f6; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background-color: #f3f4f6; padding: 10px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SpotGrid Notification</h1>
      </div>
      <div class="content">
        <p>Hello ${data.userName},</p>
        <p>${data.message}</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 SpotGrid. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
```

---

## Stripe Integration

### Stripe Configuration (`src/stripe-config.ts`)

#### Product Management

```typescript
import { stripeProducts, getProductByPriceId } from '../stripe-config';

// Get all available products
console.log('Available products:', stripeProducts);

// Find product by price ID
const product = getProductByPriceId('price_1QDmfSDtJnn28LjWXnvlFmKf');
if (product) {
  console.log(`Product: ${product.name} - $${product.price}`);
}

// Create checkout session data
const checkoutData = {
  priceId: product.priceId,
  mode: product.mode,
  successUrl: 'https://app.spotgrid.com/subscription-success',
  cancelUrl: 'https://app.spotgrid.com/pricing'
};
```

#### Stripe Utilities

```typescript
// Format price for display
export const formatStripePrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

// Convert cents to dollars
export const centsToDollars = (cents: number): number => {
  return cents / 100;
};

// Convert dollars to cents
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

// Get subscription status display
export const getSubscriptionStatusDisplay = (status: string): string => {
  const statusMap = {
    active: 'Active',
    past_due: 'Past Due',
    canceled: 'Cancelled',
    incomplete: 'Incomplete',
    trialing: 'Trial Period'
  };
  return statusMap[status] || status;
};

// Usage
const product = getProductByPriceId('price_123');
const displayPrice = formatStripePrice(product.price);
const cents = dollarsToCents(product.price);
```

---

## Type Definitions

### Core Types

```typescript
// User types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'client' | 'traffic_admin';
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

// Component prop types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Business logic types
export interface EstimateItem {
  id: string;
  dayPartId: string;
  specificDate: string;
  userDefinedCpm: number;
  spotsPerOccurrence: number;
}

export interface DayPart {
  id: string;
  name: string;
  expectedViews: number;
  days: number;
}

// Stripe types
export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
}
```

### Usage in Components

```typescript
import { User, ApiResponse, ButtonProps } from '../types';

// Type-safe component
const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div>
      <h2>{user.full_name || user.email}</h2>
      <p>Role: {user.role}</p>
    </div>
  );
};

// Type-safe API calls
const fetchUser = async (id: string): Promise<ApiResponse<User>> => {
  return apiClient.request<User>(`/users/${id}`);
};

// Custom hooks with types
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser(userId).then(({ data, error }) => {
      if (error) {
        setError(error.message);
      } else {
        setUser(data);
      }
      setLoading(false);
    });
  }, [userId]);

  return { user, loading, error };
};
```

---

This utilities documentation provides comprehensive coverage of all helper functions, services, and utilities in the SpotGrid application. Each utility is designed to be reusable, type-safe, and follows consistent patterns for error handling and data management.