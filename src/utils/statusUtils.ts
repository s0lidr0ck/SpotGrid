import { StatusBadge } from '../components/ui/StatusBadge';

export type EstimateStatus = 'draft' | 'pending_approval' | 'ordered' | 'modified' | 'approved' | 'rejected';

export const STATUS_COLORS: Record<EstimateStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  ordered: 'bg-blue-100 text-blue-800',
  modified: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export const getStatusColor = (status: EstimateStatus): string => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

export const getStatusBgColor = (status: EstimateStatus): string => {
  switch (status) {
    case 'draft': return 'bg-gray-300';
    case 'pending_approval': return 'bg-yellow-100';
    case 'ordered': return 'bg-blue-100';
    case 'modified': return 'bg-orange-100';
    case 'approved': return 'bg-green-100';
    case 'rejected': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
};

export const getStatusLabel = (status: EstimateStatus): string => {
  switch (status) {
    case 'pending_approval': return 'Pending Approval';
    case 'ordered': return 'Ordered';
    case 'modified': return 'Modified';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const getNextStatuses = (status: EstimateStatus, isAdmin: boolean): EstimateStatus[] => {
  if (isAdmin) {
    switch (status) {
      case 'pending_approval':
      case 'ordered':
        return ['approved', 'rejected', 'modified'];
      case 'modified':
        return ['approved', 'rejected'];
      default:
        return [];
    }
  } else {
    switch (status) {
      case 'draft':
      case 'rejected':
      case 'modified':
        return ['ordered']; // Submit order for approval
      default:
        return [];
    }
  }
};

export const canEditEstimate = (status: EstimateStatus, isAdmin: boolean): boolean => {
  if (isAdmin) return true;
  // Users can edit drafts, rejected orders, and modified orders
  return ['draft', 'rejected', 'modified'].includes(status);
};