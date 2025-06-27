import React from 'react';
import { CalendarDays, DollarSign, Clock, Tv } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import Card from '../ui/Card';
import { formatCurrency, formatNumber, calculateBudgetDuration } from '../../utils/calculations';
import { EstimateStatus } from '../../utils/statusUtils';
import { Estimate } from '../../pages/EstimateDetails';

interface EstimateSidePanelProps {
  estimate: Estimate;
  weeklySpend: number;
  weeklyImpressions: number;
  onStatusChange: (status: EstimateStatus) => void;
  isAdmin: boolean;
  isLoading?: boolean;
}

const EstimateSidePanel: React.FC<EstimateSidePanelProps> = ({
  estimate,
  weeklySpend,
  weeklyImpressions,
  onStatusChange,
  isAdmin,
  isLoading = false
}) => {
  const budgetDuration = calculateBudgetDuration(
    estimate.totalSpend || 0,
    weeklySpend
  );

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Estimate Details</h3>
        {estimate.status && <StatusBadge status={estimate.status as EstimateStatus} size="lg" />}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <DollarSign size={18} className="text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-lg font-semibold">{formatCurrency(estimate.totalSpend || 0)}</p>
          </div>
        </div>
        
        <div className="flex items-center mb-3">
          <CalendarDays size={18} className="text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="text-base font-medium">
              {estimate.startDate
                ? new Date(estimate.startDate).toLocaleDateString()
                : 'Not set'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center mb-3">
          <Clock size={18} className="text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Budget Duration</p>
            <p className="text-base font-medium">{budgetDuration}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Tv size={18} className="text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Brand</p>
            <p className="text-base font-medium">{estimate.brands?.common_name || 'Not set'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-700 mb-2">Weekly Metrics</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-600">Weekly Spend</p>
            <p className="text-lg font-semibold text-blue-800">{formatCurrency(weeklySpend)}</p>
          </div>
          
          <div>
            <p className="text-sm text-blue-600">Impressions</p>
            <p className="text-lg font-semibold text-blue-800">{formatNumber(weeklyImpressions)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EstimateSidePanel;