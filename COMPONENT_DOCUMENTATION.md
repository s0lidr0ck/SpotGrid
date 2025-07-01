# SpotGrid Component Documentation

## Table of Contents
1. [UI Components](#ui-components)
2. [Page Components](#page-components)
3. [Layout Components](#layout-components)
4. [Route Components](#route-components)
5. [Context Providers](#context-providers)
6. [Component Patterns](#component-patterns)

---

## UI Components

### Button (`src/components/ui/Button.tsx`)

A versatile button component with multiple variants, sizes, and states.

#### Props
```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}
```

#### Variants
- **primary**: Blue background, primary action button
- **secondary**: Gray background, secondary actions
- **success**: Green background, success actions
- **danger**: Red background, destructive actions
- **warning**: Orange background, warning actions
- **info**: Light blue background, informational actions
- **light**: Light gray background, subtle actions
- **dark**: Dark gray background, dark theme
- **link**: Transparent background, looks like a link

#### Examples
```jsx
import Button from '../ui/Button';
import { Save, Delete, Edit, Plus } from 'lucide-react';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary Action</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Approve</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icons
<Button icon={<Save size={16} />}>Save Changes</Button>
<Button variant="danger" icon={<Delete size={16} />}>Delete Item</Button>

// Loading state
<Button isLoading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>

// Disabled state
<Button disabled>Cannot Click</Button>

// Link style
<Button variant="link">Learn More</Button>
```

### Card (`src/components/ui/Card.tsx`)

A container component for organizing content into distinct sections.

#### Props
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Examples
```jsx
import Card from '../ui/Card';

// Basic card
<Card title="User Information">
  <p>Card content goes here</p>
</Card>

// Card with subtitle
<Card 
  title="Dashboard Statistics" 
  subtitle="Overview of your campaign performance"
>
  <div className="grid grid-cols-2 gap-4">
    <div>Metric 1</div>
    <div>Metric 2</div>
  </div>
</Card>

// Card with header content
<Card 
  title="Campaigns" 
  headerContent={
    <Button size="sm" icon={<Plus size={16} />}>
      New Campaign
    </Button>
  }
>
  <CampaignList />
</Card>

// Card with footer
<Card 
  title="Monthly Report"
  footer={
    <div className="flex justify-between">
      <span>Total: $1,234</span>
      <Button variant="link">View Details</Button>
    </div>
  }
>
  <ReportContent />
</Card>
```

### Input (`src/components/ui/Input.tsx`)

Form input component with validation and error handling.

#### Props
```typescript
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}
```

#### Examples
```jsx
import Input from '../ui/Input';
import { Mail, Eye, EyeOff } from 'lucide-react';

// Basic input
<Input 
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  required
/>

// Input with error
<Input 
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Input with help text
<Input 
  label="Username"
  helpText="Must be unique and contain only letters and numbers"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

// Input with icons
<Input 
  label="Email"
  type="email"
  leftIcon={<Mail size={20} />}
  placeholder="your@email.com"
/>

// Password input with toggle
<Input 
  label="Password"
  type={showPassword ? 'text' : 'password'}
  rightIcon={
    <button 
      type="button" 
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  }
/>

// Disabled input
<Input 
  label="Read Only Field"
  value="Cannot be changed"
  disabled
/>
```

### Select (`src/components/ui/Select.tsx`)

Dropdown select component with search functionality.

#### Props
```typescript
interface SelectProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  clearable?: boolean;
}
```

#### Examples
```jsx
import Select from '../ui/Select';

// Basic select
<Select 
  label="Select Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
  value={selectedCountry}
  onChange={setSelectedCountry}
  placeholder="Choose a country"
/>

// Searchable select
<Select 
  label="Select Brand"
  options={brandOptions}
  value={selectedBrand}
  onChange={setSelectedBrand}
  searchable
  placeholder="Search for a brand..."
/>

// Select with error
<Select 
  label="Category"
  options={categoryOptions}
  value={category}
  onChange={setCategory}
  error="Please select a category"
/>

// Clearable select
<Select 
  label="Optional Filter"
  options={filterOptions}
  value={filter}
  onChange={setFilter}
  clearable
  placeholder="Select filter (optional)"
/>

// Disabled options
<Select 
  options={[
    { value: 'option1', label: 'Available Option' },
    { value: 'option2', label: 'Disabled Option', disabled: true }
  ]}
  value={selected}
  onChange={setSelected}
/>
```

### StatusBadge (`src/components/ui/StatusBadge.tsx`)

Visual indicator for status values with color coding.

#### Props
```typescript
interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}
```

#### Examples
```jsx
import StatusBadge from '../ui/StatusBadge';

// Basic status badges
<StatusBadge status="approved" />
<StatusBadge status="pending" />
<StatusBadge status="rejected" />
<StatusBadge status="draft" />

// Different sizes
<StatusBadge status="active" size="sm" />
<StatusBadge status="active" size="md" />
<StatusBadge status="active" size="lg" />

// With icons
<StatusBadge status="approved" showIcon />
<StatusBadge status="rejected" showIcon />

// In a table
<table>
  <tbody>
    <tr>
      <td>Campaign 1</td>
      <td><StatusBadge status="approved" /></td>
    </tr>
    <tr>
      <td>Campaign 2</td>
      <td><StatusBadge status="pending" /></td>
    </tr>
  </tbody>
</table>
```

### Spinner (`src/components/ui/Spinner.tsx`)

Loading spinner component for indicating processing states.

#### Props
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}
```

#### Examples
```jsx
import Spinner from '../ui/Spinner';

// Basic spinner
<Spinner />

// Different sizes
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// Different colors
<Spinner color="primary" />
<Spinner color="secondary" />
<Spinner color="white" />

// In a loading state
{isLoading ? (
  <div className="flex justify-center p-4">
    <Spinner size="lg" />
  </div>
) : (
  <DataTable data={data} />
)}

// In a button
<Button disabled={isLoading}>
  {isLoading && <Spinner size="sm" color="white" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

---

## Page Components

### Dashboard (`src/pages/Dashboard.tsx`)

Main dashboard showing overview statistics and quick actions.

#### Features
- Statistics cards (orders, budget, impressions)
- Recent activity feed
- Quick action buttons
- Charts and graphs

#### Usage
```jsx
import Dashboard from '../pages/Dashboard';

// Used in routing
<Route path="/dashboard" element={<Dashboard />} />
```

### Login (`src/pages/Login.tsx`)

Authentication page for user login.

#### Features
- Email/password form
- Form validation
- Error handling
- Remember me option
- Forgot password link

#### Props
```typescript
// No props - uses AuthContext
```

### BrandsView (`src/pages/BrandsView.tsx`)

Page for managing brand information.

#### Features
- Brand list display
- Add new brand
- Edit existing brands
- Delete brands (with validation)
- Search and filter

#### Usage
```jsx
import BrandsView from '../pages/BrandsView';

<Route path="/brands" element={<BrandsView />} />
```

### CampaignsView (`src/pages/CampaignsView.tsx`)

Page for managing advertising campaigns.

#### Features
- Campaign list with filtering
- Status-based organization
- Campaign creation
- Bulk actions
- Export functionality

### EstimateDetails (`src/pages/EstimateDetails.tsx`)

Detailed view and editor for individual estimates.

#### Features
- Estimate information editing
- Item management
- Cost calculations
- Status changes
- Media asset management

#### Route Parameters
```typescript
// Accessed via useParams()
{ id: string } // Estimate UUID
```

---

## Layout Components

### Layout (`src/components/layout/Layout.tsx`)

Main layout wrapper providing consistent structure.

#### Features
- Navigation sidebar
- Header with user menu
- Main content area
- Responsive design
- Toast notifications

#### Usage
```jsx
import Layout from '../components/layout/Layout';

// Wraps all authenticated pages
<Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="brands" element={<BrandsView />} />
</Route>
```

### Sidebar Navigation

#### Features
- Collapsible menu
- Active route highlighting
- Role-based menu items
- User profile section

### Header

#### Features
- Page title
- User avatar and dropdown
- Notification indicators
- Search functionality (if applicable)

---

## Route Components

### PrivateRoute (`src/components/routes/PrivateRoute.tsx`)

Higher-order component protecting authenticated routes.

#### Props
```typescript
interface PrivateRouteProps {
  children: React.ReactNode;
}
```

#### Usage
```jsx
import PrivateRoute from '../components/routes/PrivateRoute';

// Protect a single component
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />

// Protect multiple routes
<Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="brands" element={<BrandsView />} />
</Route>
```

### AdminRoute (`src/components/routes/AdminRoute.tsx`)

Higher-order component protecting admin-only routes.

#### Props
```typescript
interface AdminRouteProps {
  children?: React.ReactNode;
}
```

#### Usage
```jsx
import AdminRoute from '../components/routes/AdminRoute';

// Admin-only routes
<Route path="/admin" element={<AdminRoute />}>
  <Route path="approvals" element={<ApprovalsView />} />
  <Route path="media-approvals" element={<MediaApprovalsView />} />
</Route>
```

---

## Context Providers

### AuthProvider (`src/context/AuthContext.tsx`)

Provides authentication state and methods throughout the app.

#### Context Value
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

#### Usage
```jsx
import { AuthProvider, useAuth } from '../context/AuthContext';

// Wrap app with provider
<AuthProvider>
  <App />
</AuthProvider>

// Use in components
function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }
  
  return <WelcomeMessage user={user} onLogout={logout} />;
}
```

### SocketProvider (`src/context/SocketContext.tsx`)

Provides WebSocket connection for real-time updates.

#### Context Value
```typescript
interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}
```

#### Usage
```jsx
import { SocketProvider, useSocket } from '../context/SocketContext';

// Wrap relevant parts with provider
<SocketProvider>
  <Dashboard />
</SocketProvider>

// Use in components
function RealTimeComponent() {
  const { socket, connected } = useSocket();
  
  useEffect(() => {
    if (socket && connected) {
      socket.on('estimate_updated', (data) => {
        // Handle real-time updates
      });
    }
  }, [socket, connected]);
}
```

---

## Component Patterns

### Form Components

Standard pattern for form components with validation:

```jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

function ContactForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const submitHandler = (data) => {
    onSubmit(data);
  };
  
  return (
    <Card title="Contact Information">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <Input
          label="Full Name"
          {...register('fullName', { required: 'Full name is required' })}
          error={errors.fullName?.message}
        />
        
        <Input
          label="Email"
          type="email"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address'
            }
          })}
          error={errors.email?.message}
        />
        
        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading}>
            Save Contact
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

### List Components

Standard pattern for displaying lists with actions:

```jsx
import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import { Edit, Delete, Plus } from 'lucide-react';

function ItemList({ items, onEdit, onDelete, onCreate }) {
  const [selectedItems, setSelectedItems] = useState([]);
  
  return (
    <Card 
      title="Items"
      headerContent={
        <Button 
          size="sm" 
          icon={<Plus size={16} />}
          onClick={onCreate}
        >
          Add Item
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Created</th>
              <th className="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.name}</td>
                <td className="p-2">
                  <StatusBadge status={item.status} />
                </td>
                <td className="p-2">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 text-right">
                  <Button
                    size="sm"
                    variant="light"
                    icon={<Edit size={14} />}
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<Delete size={14} />}
                    onClick={() => onDelete(item)}
                    className="ml-2"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

### Modal Components

Standard pattern for modal dialogs:

```jsx
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X } from 'lucide-react';

function EditModal({ isOpen, onClose, item, onSave }) {
  const [formData, setFormData] = useState(item || {});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Item</h2>
          <Button
            variant="light"
            size="sm"
            icon={<X size={16} />}
            onClick={onClose}
          />
        </div>
        
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <Input
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
```

This component documentation provides comprehensive examples and patterns for using the SpotGrid component library effectively. Each component is designed to be reusable, accessible, and consistent with the overall design system.