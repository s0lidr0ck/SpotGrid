import React, { useState } from 'react';
import { Trash2, Edit, DollarSign, Hash } from 'lucide-react';
import Button from '../ui/Button';
import { formatCurrency, formatNumber } from '../../utils/calculations';

export interface EstimateItem {
  id: string; // Changed from number to string for UUID compatibility
  dayPartId: number;
  dayPartName: string;
  specificDate: string;
  userDefinedCpm: number;
  spotsPerOccurrence: number;
  estimatedCpmAtCreation: number;
  days: number;
  multiplier: number;
  impressionsPerSpot: number;
  startTime: string;
  endTime: string;
}

interface EstimateItemsListProps {
  items: EstimateItem[];
  onEdit: (itemId: string) => void; // Changed from number to string
  onDelete: (itemId: string) => void; // Changed from number to string
  isEditable?: boolean;
}

const EstimateItemsList: React.FC<EstimateItemsListProps> = ({
  items,
  onEdit,
  onDelete,
  isEditable = true
}) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null); // Changed from number to string

  const toggleExpand = (itemId: string) => { // Changed from number to string
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  // Format time
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${minutes !== '00' ? `:${minutes}` : ''} ${period}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate total cost for an item
  const calculateItemCost = (item: EstimateItem): number => {
    const impressions = item.impressionsPerSpot * item.multiplier * item.spotsPerOccurrence * item.days;
    return (impressions / 1000) * item.userDefinedCpm;
  };

  if (items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No spots have been added to this estimate yet.</p>
        {isEditable && (
          <p className="text-sm mt-2">Use the schedule grid above to add spots.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="p-4 border-b border-gray-200 text-lg font-semibold text-gray-800">Selected Spots</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day Part
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPM
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spots
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impressions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              {isEditable && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const isExpanded = expandedItemId === item.id;
              const totalImpressions = item.impressionsPerSpot * item.multiplier * item.spotsPerOccurrence * item.days;
              const itemCost = calculateItemCost(item);
              
              return (
                <React.Fragment key={item.id}>
                  <tr 
                    className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-blue-50' : ''}`}
                    onClick={() => toggleExpand(item.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.dayPartName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.specificDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.userDefinedCpm)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.spotsPerOccurrence}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(totalImpressions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(itemCost)}
                    </td>
                    {isEditable && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="light"
                          size="sm"
                          className="mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item.id);
                          }}
                          icon={<Edit size={16} />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          icon={<Trash2 size={16} />}
                        >
                          Remove
                        </Button>
                      </td>
                    )}
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-blue-50">
                      <td colSpan={isEditable ? 7 : 6} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Hash size={14} className="mr-1" /> Days
                            </p>
                            <p className="font-medium">{item.days}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="font-medium">
                              {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 flex items-center">
                              <DollarSign size={14} className="mr-1" /> Multiplier
                            </p>
                            <p className="font-medium">{item.multiplier}x</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Base Impressions</p>
                            <p className="font-medium">{formatNumber(item.impressionsPerSpot)} per spot</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                Totals:
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {formatNumber(items.reduce((sum, item) => {
                  return sum + (item.impressionsPerSpot * item.multiplier * item.spotsPerOccurrence * item.days);
                }, 0))}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {formatCurrency(items.reduce((sum, item) => sum + calculateItemCost(item), 0))}
              </td>
              {isEditable && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default EstimateItemsList;