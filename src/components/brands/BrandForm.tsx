import React, { useState } from 'react';
import { Building2, Mail, Phone, User, Briefcase } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface BrandFormData {
  common_name: string;
  legal_name: string;
  address: string;
  phone: string;
  email: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_job_title: string;
}

interface BrandFormProps {
  initialData?: Partial<BrandFormData>;
  onSubmit: (data: BrandFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const BrandForm: React.FC<BrandFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<BrandFormData>({
    common_name: initialData?.common_name || '',
    legal_name: initialData?.legal_name || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    contact_first_name: initialData?.contact_first_name || '',
    contact_last_name: initialData?.contact_last_name || '',
    contact_job_title: initialData?.contact_job_title || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BrandFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof BrandFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BrandFormData, string>> = {};
    
    if (!formData.common_name.trim()) {
      newErrors.common_name = 'Common name is required';
    }
    
    if (!formData.legal_name.trim()) {
      newErrors.legal_name = 'Legal name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Common Name"
            name="common_name"
            placeholder="Brand's common name"
            value={formData.common_name}
            onChange={handleChange}
            error={errors.common_name}
            icon={<Building2 size={18} className="text-gray-400" />}
            required
          />
          
          <Input
            label="Legal Name"
            name="legal_name"
            placeholder="Legal business name"
            value={formData.legal_name}
            onChange={handleChange}
            error={errors.legal_name}
            icon={<Building2 size={18} className="text-gray-400" />}
            required
          />
        </div>

        <Input
          label="Address"
          name="address"
          placeholder="Full business address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            name="phone"
            placeholder="Contact phone number"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={<Phone size={18} className="text-gray-400" />}
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Contact email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={18} className="text-gray-400" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact First Name"
            name="contact_first_name"
            placeholder="Contact's first name"
            value={formData.contact_first_name}
            onChange={handleChange}
            error={errors.contact_first_name}
            icon={<User size={18} className="text-gray-400" />}
          />
          
          <Input
            label="Contact Last Name"
            name="contact_last_name"
            placeholder="Contact's last name"
            value={formData.contact_last_name}
            onChange={handleChange}
            error={errors.contact_last_name}
            icon={<User size={18} className="text-gray-400" />}
          />
        </div>

        <Input
          label="Job Title"
          name="contact_job_title"
          placeholder="Contact's job title"
          value={formData.contact_job_title}
          onChange={handleChange}
          error={errors.contact_job_title}
          icon={<Briefcase size={18} className="text-gray-400" />}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="light"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {initialData ? 'Update Brand' : 'Create Brand'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BrandForm;