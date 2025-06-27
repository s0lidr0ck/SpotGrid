import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface DeleteBrandDialogProps {
  brandName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  hasOrders?: boolean;
}

const DeleteBrandDialog: React.FC<DeleteBrandDialogProps> = ({
  brandName,
  onConfirm,
  onCancel,
  isLoading = false,
  hasOrders = false
}) => {
  return (
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Delete Brand
          </h3>
          <div className="mt-2">
            {hasOrders ? (
              <p className="text-sm text-red-600">
                Cannot delete <strong>{brandName}</strong> because it has associated orders.
                Please remove all orders for this brand first.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>{brandName}</strong>? This action cannot be undone.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button
          variant="danger"
          onClick={onConfirm}
          isLoading={isLoading}
          disabled={hasOrders}
          className="w-full sm:w-auto sm:ml-3"
        >
          Delete
        </Button>
        <Button
          variant="light"
          onClick={onCancel}
          className="mt-3 w-full sm:w-auto sm:mt-0"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DeleteBrandDialog;