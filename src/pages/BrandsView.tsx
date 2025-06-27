import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import BrandForm from '../components/brands/BrandForm';
import DeleteBrandDialog from '../components/brands/DeleteBrandDialog';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api-client';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  common_name: string;
  legal_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_job_title: string | null;
  created_at: string;
  updated_at: string;
  has_orders?: boolean;
  owner_id: string;
}

const BrandsView = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'traffic_admin';
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      
      const { data: brandsData, error: brandsError } = await apiClient.getBrands();

      if (brandsError) throw new Error(brandsError.message);

      setBrands(brandsData || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [user, isAdmin]);

  const handleCreateBrand = async (formData: Omit<Brand, 'id' | 'created_at' | 'updated_at' | 'has_orders' | 'owner_id'>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await apiClient.createBrand(formData);

      if (error) throw new Error(error.message);
      
      setBrands(prev => [...prev, { ...data, has_orders: false }]);
      setShowAddModal(false);
      toast.success('Brand created successfully');
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error('Failed to create brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBrand = async (formData: Omit<Brand, 'id' | 'created_at' | 'updated_at' | 'has_orders' | 'owner_id'>) => {
    if (!editingBrand) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await apiClient.updateBrand(editingBrand.id, formData);

      if (error) throw new Error(error.message);
      
      setBrands(prev => prev.map(brand => 
        brand.id === editingBrand.id ? { ...data, has_orders: brand.has_orders } : brand
      ));
      setEditingBrand(null);
      toast.success('Brand updated successfully');
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error('Failed to update brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!deletingBrand) return;
    
    setIsSubmitting(true);
    try {
      // Check if brand has orders
      if (deletingBrand.has_orders) {
        throw new Error('Cannot delete brand that has associated orders');
      }

      const { error } = await apiClient.deleteBrand(deletingBrand.id);

      if (error) throw new Error(error.message);
      
      setBrands(prev => prev.filter(brand => brand.id !== deletingBrand.id));
      setDeletingBrand(null);
      toast.success('Brand deleted successfully');
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      toast.error(error.message || 'Failed to delete brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canModifyBrand = (brand: Brand) => {
    return isAdmin || (user?.id === brand.owner_id && !brand.has_orders);
  };

  const filteredBrands = brands.filter(brand =>
    brand.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${brand.contact_first_name} ${brand.contact_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600 mt-1">
            Manage your advertising clients and their information
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={16} />}
        >
          Add Brand
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading brands...
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No brands found
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {brand.common_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {brand.legal_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {brand.contact_first_name} {brand.contact_last_name}
                      </div>
                      <div className="text-sm text-gray-500">{brand.contact_job_title}</div>
                      <div className="text-sm text-gray-500">{brand.email}</div>
                      <div className="text-sm text-gray-500">{brand.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{brand.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(brand.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canModifyBrand(brand) && (
                        <>
                          <Button
                            variant="light"
                            size="sm"
                            className="mr-2"
                            onClick={() => setEditingBrand(brand)}
                            icon={<Edit size={16} />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeletingBrand(brand)}
                            icon={<Trash2 size={16} />}
                            disabled={brand.has_orders}
                            title={brand.has_orders ? "Cannot delete brand with orders" : "Delete brand"}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Brand Modal */}
      {(showAddModal || editingBrand) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <BrandForm
                initialData={editingBrand ? {
                  common_name: editingBrand.common_name,
                  legal_name: editingBrand.legal_name,
                  address: editingBrand.address || '',
                  phone: editingBrand.phone || '',
                  email: editingBrand.email || '',
                  contact_first_name: editingBrand.contact_first_name || '',
                  contact_last_name: editingBrand.contact_last_name || '',
                  contact_job_title: editingBrand.contact_job_title || ''
                } : undefined}
                onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand}
                onCancel={() => {
                  setShowAddModal(false);
                  setEditingBrand(null);
                }}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBrand && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <DeleteBrandDialog
              brandName={deletingBrand.common_name}
              onConfirm={handleDeleteBrand}
              onCancel={() => setDeletingBrand(null)}
              isLoading={isSubmitting}
              hasOrders={deletingBrand.has_orders}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsView;