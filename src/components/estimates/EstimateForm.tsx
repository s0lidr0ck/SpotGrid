import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import { apiClient } from '../../utils/api-client';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  common_name: string;
}

interface EstimateFormData {
  estimateName: string;
  brandId: string;
  startDate: string;
  totalSpend: number;
}

interface EstimateFormProps {
  initialData?: Partial<EstimateFormData>;
  onSubmit: (data: EstimateFormData) => void;
  isLoading?: boolean;
  isEditing?: boolean;
  onBrandChange?: (brandId: string) => void;
}

const EstimateForm: React.FC<EstimateFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEditing = false,
  onBrandChange
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [formData, setFormData] = useState<EstimateFormData>({
    estimateName: initialData?.estimateName || '',
    brandId: initialData?.brandId || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    totalSpend: initialData?.totalSpend || 0
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EstimateFormData, string>>>({});

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log('Setting initial form data:', initialData);
      setFormData(prev => ({
        ...prev,
        estimateName: initialData.estimateName || prev.estimateName,
        brandId: initialData.brandId || prev.brandId,
        startDate: initialData.startDate || prev.startDate,
        totalSpend: initialData.totalSpend || prev.totalSpend
      }));
    }
  }, [initialData]);

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const { data, error } = await apiClient.getBrands();

      if (error) throw new Error(error.message);
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (name === 'totalSpend') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));

    if (name === 'brandId' && onBrandChange) {
      onBrandChange(value);
    }
    
    if (errors[name as keyof EstimateFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EstimateFormData, string>> = {};
    
    if (!formData.estimateName.trim()) {
      newErrors.estimateName = 'Order name is required';
    }
    
    if (!formData.brandId) {
      newErrors.brandId = 'Please select a brand';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.totalSpend || formData.totalSpend <= 0) {
      newErrors.totalSpend = 'Total spend must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      console.log('Submitting form data:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save changes');
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
          <p className="text-sm text-gray-500">Basic information about your advertising order</p>
        </div>
      </div>

      <form id="orderForm" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Order Name"
            name="estimateName"
            id="estimateName"
            placeholder="Enter order name"
            value={formData.estimateName}
            onChange={handleChange}
            error={errors.estimateName}
            disabled={!isEditing}
            required
          />
          
          <Select
            label="Brand"
            name="brandId"
            id="brandId"
            value={formData.brandId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Brand' },
              ...brands.map(brand => ({
                value: brand.id,
                label: brand.common_name
              }))
            ]}
            error={errors.brandId}
            disabled={!isEditing || loadingBrands}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
            disabled={!isEditing}
            required
            icon={<Calendar size={18} className="text-gray-400" />}
          />
          
          <Input
            label="Total Budget"
            name="totalSpend"
            id="totalSpend"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter total budget"
            value={formData.totalSpend.toString()}
            onChange={handleChange}
            error={errors.totalSpend}
            disabled={!isEditing}
            required
            icon={<DollarSign size={18} className="text-gray-400" />}
          />
        </div>
      </form>
    </Card>
  );
};

export default EstimateForm;