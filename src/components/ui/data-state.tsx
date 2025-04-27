
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from './skeleton';

interface DataStateProps {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export const DataState = ({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = "No data available",
  children
}: DataStateProps) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 space-y-4 bg-red-50 rounded-lg border border-red-100">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <div className="text-center">
          <p className="font-medium text-red-600">Error loading data</p>
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 space-y-4 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-lg text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export const TableRowSkeleton = ({ cols = 4 }: { cols?: number }) => {
  return (
    <tr className="animate-pulse">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-6 w-full" />
        </td>
      ))}
    </tr>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <Skeleton className="h-10 w-1/3" />
    </div>
  );
};
