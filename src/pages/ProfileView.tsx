import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building2, Briefcase, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  address?: string;
  company?: string;
  job_title?: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  company: string;
  jobTitle: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    company: '',
    jobTitle: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user profile from public.users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Fetch additional profile data from user's brand (if they have one)
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('contact_first_name, contact_last_name, phone, address, common_name, contact_job_title')
        .eq('owner_id', user.id)
        .limit(1)
        .single();

      // Don't throw error if no brand found, just use empty data
      const brandInfo = brandError ? {} : brandData;

      const userProfile: UserProfile = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        phone: userData.phone || brandInfo.phone || '',
        address: userData.address || brandInfo.address || '',
        company: userData.company || brandInfo.common_name || '',
        job_title: userData.job_title || brandInfo.contact_job_title || ''
      };

      setProfile(userProfile);
      setProfileForm({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        company: userProfile.company || '',
        jobTitle: userProfile.job_title || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (profileErrors[name as keyof ProfileFormData]) {
      setProfileErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (passwordErrors[name as keyof PasswordFormData]) {
      setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateProfileForm = (): boolean => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!profileForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!profileForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: Partial<Record<keyof PasswordFormData, string>> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm() || !profile) return;

    try {
      setSaving(true);

      // Update user profile in public.users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          phone: profileForm.phone,
          address: profileForm.address,
          company: profileForm.company,
          job_title: profileForm.jobTitle
        })
        .eq('id', profile.id);

      if (userError) throw userError;

      // Update or create brand information if user has additional profile data
      if (profileForm.phone || profileForm.address || profileForm.company || profileForm.jobTitle) {
        // Check if user has an existing brand
        const { data: existingBrand, error: brandCheckError } = await supabase
          .from('brands')
          .select('id')
          .eq('owner_id', profile.id)
          .limit(1)
          .single();

        if (brandCheckError && brandCheckError.code !== 'PGRST116') {
          // Error other than "no rows returned"
          throw brandCheckError;
        }

        if (existingBrand) {
          // Update existing brand
          const { error: brandUpdateError } = await supabase
            .from('brands')
            .update({
              contact_first_name: profileForm.firstName,
              contact_last_name: profileForm.lastName,
              phone: profileForm.phone,
              address: profileForm.address,
              common_name: profileForm.company,
              legal_name: profileForm.company,
              contact_job_title: profileForm.jobTitle
            })
            .eq('id', existingBrand.id);

          if (brandUpdateError) throw brandUpdateError;
        } else if (profileForm.company) {
          // Create new brand if company name is provided
          const { error: brandCreateError } = await supabase
            .from('brands')
            .insert({
              common_name: profileForm.company,
              legal_name: profileForm.company,
              contact_first_name: profileForm.firstName,
              contact_last_name: profileForm.lastName,
              phone: profileForm.phone,
              address: profileForm.address,
              contact_job_title: profileForm.jobTitle,
              owner_id: profile.id
            });

          if (brandCreateError) throw brandCreateError;
        }
      }

      // Update local profile state
      setProfile(prev => prev ? {
        ...prev,
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        phone: profileForm.phone,
        address: profileForm.address,
        company: profileForm.company,
        job_title: profileForm.jobTitle
      } : null);

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    try {
      setChangingPassword(true);

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      // Clear password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast.error(error.message || 'Failed to send password reset email');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-500">Update your personal and business information</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                error={profileErrors.firstName}
                icon={<User size={18} className="text-gray-400" />}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                error={profileErrors.lastName}
                icon={<User size={18} className="text-gray-400" />}
                required
              />
            </div>

            <Input
              label="Email Address"
              value={profile.email}
              disabled
              icon={<Mail size={18} className="text-gray-400" />}
              helper="Email cannot be changed. Contact support if needed."
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={profileForm.phone}
              onChange={handleProfileChange}
              error={profileErrors.phone}
              icon={<Phone size={18} className="text-gray-400" />}
            />

            <Input
              label="Address"
              name="address"
              value={profileForm.address}
              onChange={handleProfileChange}
              error={profileErrors.address}
              icon={<MapPin size={18} className="text-gray-400" />}
            />

            <Input
              label="Company"
              name="company"
              value={profileForm.company}
              onChange={handleProfileChange}
              error={profileErrors.company}
              icon={<Building2 size={18} className="text-gray-400" />}
            />

            <Input
              label="Job Title"
              name="jobTitle"
              value={profileForm.jobTitle}
              onChange={handleProfileChange}
              error={profileErrors.jobTitle}
              icon={<Briefcase size={18} className="text-gray-400" />}
            />

            <div className="pt-4">
              <Button
                type="submit"
                isLoading={saving}
                className="w-full"
              >
                Update Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Settings */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-500">Update your password and security preferences</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                icon={<Lock size={18} className="text-gray-400" />}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="New Password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                icon={<Lock size={18} className="text-gray-400" />}
                helper="Must be at least 8 characters long"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                icon={<Lock size={18} className="text-gray-400" />}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                isLoading={changingPassword}
                className="w-full"
              >
                Change Password
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Or send password reset email
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Role:</span> {profile.role === 'traffic_admin' ? 'Traffic Admin' : 'User'}</p>
                <p><span className="font-medium">Account ID:</span> {profile.id}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Management */}
      <div className="grid grid-cols-1 gap-6">
        <SubscriptionCard onUpgrade={() => toast('Subscription management coming soon')} />
      </div>
    </div>
  );
};

export default ProfileView;