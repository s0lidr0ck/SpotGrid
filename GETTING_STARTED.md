# SpotGrid - Getting Started Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Development Setup](#development-setup)
4. [Common Usage Patterns](#common-usage-patterns)
5. [API Quick Reference](#api-quick-reference)
6. [Component Quick Reference](#component-quick-reference)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Setup Instructions

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd spotgrid

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

2. **Set up environment variables**:
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Backend (server/.env)
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/spotgrid
JWT_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

3. **Set up database**:
```bash
# Create database
createdb spotgrid

# Run migrations
psql -d spotgrid -f database-schema.sql
```

4. **Start the application**:
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

5. **Access the application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

---

## Project Overview

SpotGrid is a comprehensive advertising campaign management platform with the following key features:

### Core Modules
- **Authentication**: JWT-based user authentication with role-based access
- **Brand Management**: Create and manage client brand information
- **Campaign Estimates**: Create, manage, and approve advertising estimates
- **Media Assets**: Upload and manage campaign media files
- **Payment Processing**: Stripe integration for subscription billing
- **Dashboard**: Overview statistics and quick actions

### Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Authentication**: JWT tokens with middleware protection
- **Payments**: Stripe subscriptions and one-time payments
- **Real-time**: WebSocket integration for live updates

---

## Development Setup

### Project Structure
```
spotgrid/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components (Button, Input, etc.)
│   │   ├── layout/        # Layout components (Header, Sidebar)
│   │   └── routes/        # Route protection components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── utils/             # Utility functions and helpers
│   └── App.tsx           # Main application component
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── database.js       # Database connection and utilities
│   └── index.js         # Server entry point
├── package.json          # Frontend dependencies and scripts
└── database-schema.sql   # Database schema and migrations
```

### Key Configuration Files
- `vite.config.ts`: Frontend build configuration
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `server/config.js`: Backend server configuration

---

## Common Usage Patterns

### 1. Creating a New Component

```jsx
// src/components/MyComponent.tsx
import React from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <Card title={title}>
      <p>Component content here</p>
      <Button onClick={onAction}>
        Take Action
      </Button>
    </Card>
  );
};

export default MyComponent;
```

### 2. Making API Calls

```jsx
// In a component
import { useEffect, useState } from 'react';
import { apiClient } from '../utils/api-client';
import toast from 'react-hot-toast';

function MyDataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data, error } = await apiClient.getBrands();
    if (error) {
      toast.error(error.message);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const createItem = async (itemData) => {
    const { data, error } = await apiClient.createBrand(itemData);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Brand created successfully');
      loadData(); // Refresh list
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

### 3. Using Authentication

```jsx
// Protected component
import { useAuth } from '../context/AuthContext';

function ProtectedComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4. Creating Forms with Validation

```jsx
import { useState } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

function CreateBrandForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    common_name: '',
    legal_name: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.common_name) newErrors.common_name = 'Common name is required';
    if (!formData.legal_name) newErrors.legal_name = 'Legal name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ common_name: '', legal_name: '', email: '' });
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Brand">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Common Name"
          value={formData.common_name}
          onChange={(e) => setFormData({ ...formData, common_name: e.target.value })}
          error={errors.common_name}
          required
        />
        
        <Input
          label="Legal Name"
          value={formData.legal_name}
          onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
          error={errors.legal_name}
          required
        />
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />
        
        <Button type="submit" isLoading={loading}>
          Create Brand
        </Button>
      </form>
    </Card>
  );
}
```

### 5. Adding New API Endpoints

Backend route:
```javascript
// server/routes/myNewRoute.js
import express from 'express';
import { query } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-data', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM my_table WHERE user_id = $1', [req.user.id]);
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch data' } });
  }
});

export default router;
```

Frontend API client extension:
```typescript
// Extend apiClient
class ExtendedApiClient extends ApiClient {
  async getMyData() {
    return this.request<MyDataType[]>('/my-data');
  }
}

export const extendedApiClient = new ExtendedApiClient();
```

---

## API Quick Reference

### Authentication
```typescript
// Login
const { data, error } = await apiClient.login(email, password);

// Get current user
const { data, error } = await apiClient.getCurrentUser();

// Logout
await apiClient.logout();
```

### Brands
```typescript
// Get all brands
const { data, error } = await apiClient.getBrands();

// Create brand
const { data, error } = await apiClient.createBrand({
  common_name: "Brand Name",
  legal_name: "Legal Name",
  email: "contact@brand.com"
});

// Update brand
const { data, error } = await apiClient.updateBrand(id, updateData);

// Delete brand
const { data, error } = await apiClient.deleteBrand(id);
```

### Estimates
```typescript
// Get all estimates
const { data, error } = await apiClient.getEstimates();

// Get filtered estimates
const { data, error } = await apiClient.getEstimates({ status: 'draft' });

// Create estimate
const { data, error } = await apiClient.createEstimate({
  estimate_name: "Campaign Name",
  brand_id: brandId,
  total_spend: 10000
});

// Update estimate
const { data, error } = await apiClient.updateEstimate(id, { status: 'approved' });
```

---

## Component Quick Reference

### UI Components
```jsx
// Button with variants
<Button variant="primary" size="md" icon={<Save />}>Save</Button>

// Input with validation
<Input label="Email" type="email" error={errorMessage} required />

// Card container
<Card title="Section Title" subtitle="Description">
  <p>Content here</p>
</Card>

// Status badge
<StatusBadge status="approved" size="md" />

// Select dropdown
<Select 
  options={[{value: '1', label: 'Option 1'}]} 
  value={selected} 
  onChange={setSelected} 
  searchable 
/>
```

### Layout Components
```jsx
// Protected route
<PrivateRoute>
  <MyComponent />
</PrivateRoute>

// Admin-only route
<AdminRoute>
  <AdminComponent />
</AdminRoute>
```

### Utility Functions
```typescript
// Formatting
formatCurrency(1234.56); // "$1,234.56"
formatNumber(1234567);   // "1,234,567"

// Calculations
calculateWeeklySpend(items, dayParts);
calculateBudgetDuration(budget, weeklySpend);

// Status utilities
getStatusColor('approved');     // "text-green-600"
getStatusDisplayName('pending_approval'); // "Pending Approval"
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check DATABASE_URL in server/.env
   - Ensure PostgreSQL is running
   - Verify database exists and migrations are applied

2. **Authentication Issues**:
   - Check JWT_SECRET is set in server/.env
   - Verify token is being stored in localStorage
   - Check API endpoints require authentication middleware

3. **CORS Errors**:
   - Ensure frontend API_URL matches backend port
   - Check backend CORS configuration

4. **Build Errors**:
   - Clear node_modules and reinstall dependencies
   - Check TypeScript errors in IDE
   - Verify all environment variables are set

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

### Common Commands
```bash
# Reset database
dropdb spotgrid && createdb spotgrid
psql -d spotgrid -f database-schema.sql

# Clear frontend cache
rm -rf node_modules/.vite
npm run dev

# Check backend logs
cd server && npm run dev | grep ERROR

# Type checking
npm run type-check
```

---

## Next Steps

### Documentation Resources
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Complete API reference
- **[COMPONENT_DOCUMENTATION.md](./COMPONENT_DOCUMENTATION.md)**: Detailed component guide
- **[UTILITIES_DOCUMENTATION.md](./UTILITIES_DOCUMENTATION.md)**: Utility functions reference

### Development Tasks
1. **Add New Features**: 
   - Create components in `src/components/`
   - Add API routes in `server/routes/`
   - Update database schema as needed

2. **Extend UI Components**:
   - Follow existing patterns in `src/components/ui/`
   - Use TypeScript interfaces for props
   - Include accessibility features

3. **Add Business Logic**:
   - Create utility functions in `src/utils/`
   - Add calculations in `src/utils/calculations.ts`
   - Follow error handling patterns

4. **Testing**:
   - Add unit tests for components
   - Test API endpoints with test files
   - Validate database operations

### Best Practices
- Use TypeScript for type safety
- Follow consistent error handling patterns
- Implement proper loading states
- Add user feedback with toast notifications
- Validate data on both client and server
- Use environment variables for configuration
- Follow existing code organization patterns

### Getting Help
- Check existing components for implementation patterns
- Review API documentation for endpoint details
- Use browser dev tools for debugging
- Check server logs for backend issues
- Verify database schema for data structure

---

This getting started guide provides everything you need to begin developing with SpotGrid. For detailed information about specific APIs, components, or utilities, refer to the comprehensive documentation files linked above.