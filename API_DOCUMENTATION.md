# SpotGrid API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Utility Functions](#utility-functions)
6. [Database Schema](#database-schema)
7. [Configuration](#configuration)

## Overview

SpotGrid is a comprehensive advertising campaign management platform built with React/TypeScript frontend and Node.js/Express backend with PostgreSQL database. It provides tools for managing brands, estimates, media assets, and payment processing through Stripe integration.

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Authentication**: JWT tokens
- **Payments**: Stripe integration
- **UI Components**: Custom component library with Lucide React icons

---

## Authentication

### JWT Token Authentication
All API endpoints (except login) require Bearer token authentication.

**Token Format**: `Bearer <token>`

**Headers Required**:
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### User Roles
- `client`: Regular user with access to own data
- `traffic_admin`: Admin user with access to all data

---

## Backend API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client"
  }
}
```

**Example Usage**:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

#### GET `/api/auth/me`
Get current authenticated user information.

**Headers**: Requires Authentication

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client"
  }
}
```

#### POST `/api/auth/logout`
Logout user (client-side token removal).

**Headers**: Requires Authentication

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

### Brands Routes (`/api/brands`)

#### GET `/api/brands`
Get all brands (filtered by user role).

**Headers**: Requires Authentication

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "common_name": "Brand Name",
      "legal_name": "Legal Company Name",
      "address": "123 Main St",
      "phone": "+1234567890",
      "email": "contact@brand.com",
      "contact_person": "John Doe",
      "owner_id": "uuid",
      "has_orders": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "error": null
}
```

**Example Usage**:
```javascript
const { data, error } = await apiClient.getBrands();
if (error) {
  console.error('Failed to fetch brands:', error.message);
} else {
  console.log('Brands:', data);
}
```

#### GET `/api/brands/:id`
Get specific brand by ID.

**Parameters**:
- `id` (string): Brand UUID

**Headers**: Requires Authentication

**Response**: Same as single brand object from GET `/api/brands`

#### POST `/api/brands`
Create new brand.

**Headers**: Requires Authentication

**Request Body**:
```json
{
  "common_name": "Brand Name",
  "legal_name": "Legal Company Name",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "contact@brand.com",
  "contact_first_name": "John",
  "contact_last_name": "Doe",
  "contact_job_title": "Marketing Manager"
}
```

**Response**: Created brand object

**Example Usage**:
```javascript
const brandData = {
  common_name: "My Brand",
  legal_name: "My Brand LLC",
  address: "123 Business St",
  phone: "+1234567890",
  email: "contact@mybrand.com"
};

const { data, error } = await apiClient.createBrand(brandData);
```

#### PUT `/api/brands/:id`
Update existing brand.

**Parameters**:
- `id` (string): Brand UUID

**Headers**: Requires Authentication

**Request Body**: Same as POST (partial updates allowed)

**Response**: Updated brand object

#### DELETE `/api/brands/:id`
Delete brand (only if no associated orders).

**Parameters**:
- `id` (string): Brand UUID

**Headers**: Requires Authentication

**Response**:
```json
{
  "data": { "id": "uuid" },
  "error": null
}
```

### Estimates Routes (`/api/estimates`)

#### GET `/api/estimates`
Get all estimates with optional filtering.

**Headers**: Requires Authentication

**Query Parameters**:
- `status` (string, optional): Filter by status (`draft`, `pending_approval`, `approved`, `rejected`)
- `exclude_status[]` (array, optional): Exclude specific statuses

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Campaign Name",
      "brand_id": "uuid",
      "brand_name": "Brand Name",
      "owner_id": "uuid",
      "status": "draft",
      "total_amount": 1000.00,
      "media_asset_count": 5,
      "notes": "Campaign notes",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "error": null
}
```

**Example Usage**:
```javascript
// Get all estimates
const { data, error } = await apiClient.getEstimates();

// Get only draft estimates
const { data, error } = await apiClient.getEstimates({ status: 'draft' });

// Get estimates excluding drafts and rejected
const { data, error } = await apiClient.getEstimates({ 
  exclude_status: ['draft', 'rejected'] 
});
```

#### GET `/api/estimates/:id`
Get specific estimate by ID.

**Parameters**:
- `id` (string): Estimate UUID

**Headers**: Requires Authentication

**Response**: Single estimate object with brand details

#### POST `/api/estimates`
Create new estimate.

**Headers**: Requires Authentication

**Request Body**:
```json
{
  "estimate_name": "New Campaign",
  "start_date": "2024-01-01",
  "total_spend": 1000.00,
  "total_estimated_cost": 1200.00,
  "status": "draft",
  "brand_id": "uuid"
}
```

**Response**: Created estimate object

#### PUT `/api/estimates/:id`
Update existing estimate.

**Parameters**:
- `id` (string): Estimate UUID

**Headers**: Requires Authentication

**Request Body**: Same as POST (partial updates allowed)

**Response**: Updated estimate object

#### DELETE `/api/estimates/:id`
Delete estimate.

**Parameters**:
- `id` (string): Estimate UUID

**Headers**: Requires Authentication

**Response**:
```json
{
  "data": { "id": "uuid" },
  "error": null
}
```

#### GET `/api/estimates/stats/dashboard`
Get dashboard statistics.

**Headers**: Requires Authentication

**Response**:
```json
{
  "data": {
    "draftOrders": 5,
    "pendingOrders": 3,
    "activeOrders": 10,
    "totalBudgeted": 50000.00,
    "weeklyImpressions": 1000000,
    "activeBrands": 8,
    "mediaAssets": 25,
    "paymentMethods": 2
  },
  "error": null
}
```

---

## Frontend Components

### Core Components

#### App Component (`src/App.tsx`)
Main application component with routing configuration.

**Features**:
- React Router integration
- Authentication provider
- Socket context provider
- Toast notifications
- Protected routes

**Usage**:
```jsx
import App from './App';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

#### AuthProvider (`src/context/AuthContext.tsx`)
Authentication context provider managing user state.

**Context API**:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

**Hook Usage**:
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome {user?.email}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### UI Components (`src/components/ui/`)

#### Button Component
Customizable button with variants and loading states.

**Props**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
```

**Usage**:
```jsx
import Button from '../ui/Button';
import { Save } from 'lucide-react';

function MyForm() {
  return (
    <div>
      <Button variant="primary" size="md" icon={<Save />}>
        Save Changes
      </Button>
      
      <Button variant="secondary" isLoading={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
```

#### Card Component
Container component for content sections.

**Props**:
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}
```

**Usage**:
```jsx
import Card from '../ui/Card';

function Dashboard() {
  return (
    <Card title="Statistics" subtitle="Current campaign metrics">
      <div>Card content here</div>
    </Card>
  );
}
```

#### Input Component
Form input with validation and error states.

**Props**:
```typescript
interface InputProps {
  label?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}
```

**Usage**:
```jsx
import Input from '../ui/Input';

function ContactForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  return (
    <Input
      label="Email Address"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={error}
      placeholder="Enter your email"
      required
    />
  );
}
```

#### Select Component
Dropdown select with search functionality.

**Props**:
```typescript
interface SelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
}
```

**Usage**:
```jsx
import Select from '../ui/Select';

function BrandSelector() {
  const [selectedBrand, setSelectedBrand] = useState('');
  
  const brandOptions = [
    { value: 'brand1', label: 'Brand One' },
    { value: 'brand2', label: 'Brand Two' }
  ];
  
  return (
    <Select
      options={brandOptions}
      value={selectedBrand}
      onChange={setSelectedBrand}
      placeholder="Select a brand"
      searchable
    />
  );
}
```

#### StatusBadge Component
Visual status indicator component.

**Props**:
```typescript
interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active';
  size?: 'sm' | 'md';
}
```

**Usage**:
```jsx
import StatusBadge from '../ui/StatusBadge';

function EstimateList() {
  return (
    <div>
      <StatusBadge status="approved" />
      <StatusBadge status="pending" size="sm" />
    </div>
  );
}
```

#### Spinner Component
Loading spinner indicator.

**Usage**:
```jsx
import Spinner from '../ui/Spinner';

function LoadingComponent() {
  return (
    <div className="flex justify-center">
      <Spinner />
    </div>
  );
}
```

### Route Components

#### PrivateRoute
Protects routes requiring authentication.

**Usage**:
```jsx
import PrivateRoute from '../components/routes/PrivateRoute';

<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

#### AdminRoute
Protects routes requiring admin access.

**Usage**:
```jsx
import AdminRoute from '../components/routes/AdminRoute';

<Route path="/admin" element={<AdminRoute />}>
  <Route path="approvals" element={<ApprovalsView />} />
</Route>
```

---

## Utility Functions

### API Client (`src/utils/api-client.ts`)

#### ApiClient Class
Centralized HTTP client for backend communication.

**Initialization**:
```javascript
import { apiClient } from '../utils/api-client';

// Set authentication token
apiClient.setToken('jwt_token_here');
```

**Methods**:
```javascript
// Authentication
await apiClient.login(email, password);
await apiClient.getCurrentUser();
await apiClient.logout();

// Estimates
await apiClient.getEstimates();
await apiClient.getEstimate(id);
await apiClient.createEstimate(data);
await apiClient.updateEstimate(id, data);
await apiClient.deleteEstimate(id);
await apiClient.getDashboardStats();

// Brands
await apiClient.getBrands();
await apiClient.getBrand(id);
await apiClient.createBrand(data);
await apiClient.updateBrand(id, data);
await apiClient.deleteBrand(id);
```

### Calculations (`src/utils/calculations.ts`)

#### calculateWeeklySpend
Calculate total weekly spend for estimate items.

**Signature**:
```typescript
function calculateWeeklySpend(
  items: EstimateItem[], 
  dayParts: DayPart[]
): number
```

**Usage**:
```javascript
import { calculateWeeklySpend } from '../utils/calculations';

const weeklySpend = calculateWeeklySpend(estimateItems, dayParts);
console.log(`Weekly spend: $${weeklySpend.toFixed(2)}`);
```

#### calculateWeeklyImpressions
Calculate total weekly impressions for estimate items.

**Signature**:
```typescript
function calculateWeeklyImpressions(
  items: EstimateItem[], 
  dayParts: DayPart[]
): number
```

#### calculateBudgetDuration
Calculate how long a budget will last given weekly spend.

**Signature**:
```typescript
function calculateBudgetDuration(
  totalBudget: number, 
  weeklySpend: number
): string
```

**Usage**:
```javascript
import { calculateBudgetDuration } from '../utils/calculations';

const duration = calculateBudgetDuration(10000, 1500);
console.log(`Budget duration: ${duration}`); // "6 weeks, 4 days"
```

#### formatCurrency
Format number as currency string.

**Signature**:
```typescript
function formatCurrency(amount: number): string
```

**Usage**:
```javascript
import { formatCurrency } from '../utils/calculations';

console.log(formatCurrency(1234.56)); // "$1,234.56"
```

#### formatNumber
Format number with thousands separators.

**Signature**:
```typescript
function formatNumber(num: number): string
```

**Usage**:
```javascript
import { formatNumber } from '../utils/calculations';

console.log(formatNumber(1234567)); // "1,234,567"
```

### Authentication Utilities (`src/utils/auth.ts`)

#### Token Management
```javascript
import { 
  getStoredToken, 
  setStoredToken, 
  clearStoredToken 
} from '../utils/auth';

// Get current token
const token = getStoredToken();

// Store new token
setStoredToken('new_jwt_token');

// Clear token on logout
clearStoredToken();
```

#### User Role Checking
```javascript
import { isAdmin } from '../utils/auth';

const user = { role: 'traffic_admin' };
if (isAdmin(user)) {
  console.log('User has admin access');
}
```

### Status Utilities (`src/utils/statusUtils.ts`)

#### getStatusColor
Get color class for status badges.

**Usage**:
```javascript
import { getStatusColor } from '../utils/statusUtils';

const colorClass = getStatusColor('approved'); // 'text-green-600'
```

#### getStatusDisplayName
Get human-readable status names.

**Usage**:
```javascript
import { getStatusDisplayName } from '../utils/statusUtils';

const displayName = getStatusDisplayName('pending_approval'); // 'Pending Approval'
```

---

## Database Schema

### Core Tables

#### users
User accounts and authentication.

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  role user_role DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### brands
Brand/client information.

```sql
CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name text NOT NULL,
  legal_name text NOT NULL,
  address text,
  phone text,
  email text,
  contact_person text,
  owner_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### estimates
Campaign estimates and orders.

```sql
CREATE TABLE estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand_id uuid REFERENCES brands(id),
  owner_id uuid REFERENCES users(id),
  status estimate_status DEFAULT 'draft',
  total_amount decimal(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### media_assets
Uploaded media files.

```sql
CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  brand_id uuid REFERENCES brands(id),
  status media_status DEFAULT 'pending',
  uploaded_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Enums

#### user_role
```sql
CREATE TYPE user_role AS ENUM ('client', 'traffic_admin');
```

#### estimate_status
```sql
CREATE TYPE estimate_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');
```

#### media_status
```sql
CREATE TYPE media_status AS ENUM ('pending', 'approved', 'rejected');
```

---

## Configuration

### Environment Variables

#### Frontend (Vite)
```bash
# .env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Backend (Node.js)
```bash
# .env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/spotgrid
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
```

### Stripe Configuration (`src/stripe-config.ts`)

#### Product Configuration
```typescript
export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1QDmfSDtJnn28LjWXnvlFmKf',
    name: 'Annual Subscription',
    description: 'Pursuit Annual Subscription',
    mode: 'subscription',
    price: 49.99
  }
];
```

#### Usage
```javascript
import { getProductByPriceId } from '../stripe-config';

const product = getProductByPriceId('price_1QDmfSDtJnn28LjWXnvlFmKf');
```

### Server Configuration (`server/config.js`)

```javascript
export const config = {
  port: process.env.PORT || 3001,
  database: {
    url: process.env.DATABASE_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  }
};
```

---

## Error Handling

### API Response Format
All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: { message: string } | null;
}
```

### Error Handling Examples

#### Frontend
```javascript
const { data, error } = await apiClient.getEstimates();
if (error) {
  toast.error(error.message);
  return;
}
// Use data safely
console.log(data);
```

#### Backend
```javascript
try {
  const result = await query('SELECT * FROM estimates');
  res.json({ data: result.rows, error: null });
} catch (error) {
  console.error('Database error:', error);
  res.status(500).json({ 
    data: null, 
    error: { message: 'Failed to fetch estimates' } 
  });
}
```

---

## Testing

### Test Files
- `test-auth-client.js`: Authentication testing
- `test-connection.js`: Database connection testing
- `test-dashboard.js`: Dashboard functionality testing

### Running Tests
```bash
# Frontend tests
npm run test

# Backend tests
cd server && npm test
```

---

This documentation covers all public APIs, components, and utilities in the SpotGrid application. For implementation details or specific use cases, refer to the individual component files or contact the development team.