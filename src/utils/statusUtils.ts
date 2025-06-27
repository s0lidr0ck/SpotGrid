import { StatusBadge } from '../components/ui/StatusBadge';

export type EstimateStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export const STATUS_COLORS: Record<EstimateStatus, string> = {
  draft: '#6c757d',
  pending_approval: '#ff9800', 
  approved: '#28a745',
  rejected: '#dc3545'
};

export const getStatusColor = (status: EstimateStatus): string => STATUS_COLORS[status] || '#6c757d';

export const getStatusBgColor = (status: EstimateStatus): string => {
  const hexColor = STATUS_COLORS[status];
  if (!hexColor) return 'bg-gray-300';
  
  switch (status) {
    case 'draft': return 'bg-gray-300';
    case 'pending_approval': return 'bg-orange-100';
    case 'approved': return 'bg-green-100';
    case 'rejected': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
};

export const getStatusLabel = (status: EstimateStatus): string => {
  switch (status) {
    case 'pending_approval': return 'Pending Approval';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const getNextStatuses = (status: EstimateStatus, isAdmin: boolean): EstimateStatus[] => {
  if (isAdmin) {
    switch (status) {
      case 'pending_approval':
        return ['approved', 'rejected'];
      default:
        return [];
    }
  } else {
    switch (status) {
      case 'draft':
      case 'rejected':
        return ['pending_approval'];
      default:
        return [];
    }
  }
};

export const canEditEstimate = (status: EstimateStatus, isAdmin: boolean): boolean => {
  if (isAdmin) return true;
  // Users can edit drafts and rejected orders
  return ['draft', 'rejected'].includes(status);
};