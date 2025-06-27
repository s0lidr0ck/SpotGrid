import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, Filter, Plus, Film, CreditCard, User } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/calculations';
import { EstimateStatus } from '../../utils/statusUtils';

export interface Estimate {
  id: string;
  estimateName: string;
  status: EstimateStatus;
  totalEstimatedCost: number;
  totalSpend: number;
  brandName: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  media_asset?: {
    friendly_name: string;
    isci_code: string;
  };
  payment_method_id?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface EstimatesListProps {
  estimates: Estimate[];
  isLoading?: boolean;
  showActions?: boolean;
  title?: string;
  onNewOrder?: () => void;
  showCreator?: boolean;
}

const EstimatesList: React.FC<EstimatesListProps> = ({
  estimates,
  isLoading = false,
  showActions = true,
  title = 'Orders',
  onNewOrder,
  showCreator = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Estimate | null;
    direction: 'ascending' | 'descending';
  }>({
    key: 'updatedAt',
    direction: 'descending',
  });

  // Debug logging for estimates
  console.log('=== ESTIMATES LIST RENDER ===');
  console.log('Total estimates received:', estimates.length);
  console.log('Show creator:', showCreator);
  estimates.forEach((estimate, index) => {
    console.log(`Estimate ${index + 1}:`, {
      id: estimate.id,
      name: estimate.estimateName,
      createdBy: estimate.createdBy,
      hasCreatedBy: !!estimate.createdBy
    });
  });

  const handleSort = (key: keyof Estimate) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter estimates based on search term
  const filteredEstimates = estimates.filter(estimate => 
    estimate.estimateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (estimate.createdBy && 
      `${estimate.createdBy.firstName} ${estimate.createdBy.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort estimates based on sort config
  const sortedEstimates = [...filteredEstimates].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key: keyof Estimate) => {
    if (sortConfig.key !== key) {
      return <ChevronDown size={16} className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? (
      <ChevronUp size={16} className="ml-1" />
    ) : (
      <ChevronDown size={16} className="ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="py-2 pl-10 pr-4 block w-full sm:w-64 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="light" className="flex items-center">
            <Filter size={16} className="mr-1" />
            Filter
          </Button>
          
          {showActions && onNewOrder && (
            <Button
              onClick={onNewOrder}
              className="flex items-center"
            >
              <Plus size={16} className="mr-1" />
              New Order
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  ID {getSortIcon('id')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('estimateName')}
              >
                <div className="flex items-center">
                  Name {getSortIcon('estimateName')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('brandName')}
              >
                <div className="flex items-center">
                  Brand {getSortIcon('brandName')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalSpend')}
              >
                <div className="flex items-center">
                  Budget {getSortIcon('totalSpend')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Media
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment
              </th>
              {showCreator && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created By
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status {getSortIcon('status')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('startDate')}
              >
                <div className="flex items-center">
                  Start Date {getSortIcon('startDate')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('updatedAt')}
              >
                <div className="flex items-center">
                  Updated {getSortIcon('updatedAt')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEstimates.length > 0 ? (
              sortedEstimates.map((estimate) => {
                console.log('Rendering estimate row:', {
                  id: estimate.id,
                  name: estimate.estimateName,
                  createdBy: estimate.createdBy,
                  showCreator
                });
                
                return (
                  <tr 
                    key={estimate.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link to={`/estimates/${estimate.id}`}>{estimate.id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link to={`/estimates/${estimate.id}`} className="hover:underline">
                        {estimate.estimateName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {estimate.brandName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(estimate.totalSpend)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {estimate.media_asset ? (
                        <div className="flex items-center text-gray-700">
                          <Film size={16} className="mr-1" />
                          <span title={estimate.media_asset.isci_code}>
                            {estimate.media_asset.friendly_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {estimate.payment_method_id ? (
                        <div className="flex items-center text-gray-700">
                          <CreditCard size={16} className="mr-1" />
                          <span>•••• {estimate.payment_method_id.slice(-4)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </td>
                    {showCreator && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {estimate.createdBy ? (
                          <div className="flex items-center text-gray-700">
                            <User size={16} className="mr-1" />
                            <div>
                              <div className="font-medium">
                                {estimate.createdBy.firstName} {estimate.createdBy.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {estimate.createdBy.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <User size={16} className="mr-1" />
                            <div>
                              <div className="font-medium">Unknown User</div>
                              <div className="text-xs">No email</div>
                            </div>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={estimate.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(estimate.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(estimate.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={showCreator ? 10 : 9} className="px-6 py-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{sortedEstimates.length}</span> orders
        </p>
      </div>
    </div>
  );
};

export default EstimatesList;