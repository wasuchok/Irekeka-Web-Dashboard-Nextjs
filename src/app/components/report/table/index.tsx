import LoadingSpinner from '@/app/components/LoadingSpinner';
import React from 'react';
import { FiEye, FiTrash } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

interface Column<T> {
    header: string;
    accessor: keyof T;
    width?: string;
    render?: (value: any, row?: T) => React.ReactNode;
}

interface ScrollableTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    className?: string;
    height?: string;
    itemsPerPage?: number;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function ScrollableTable<T>({
    columns,
    data,
    loading = false,
    className = '',
    height = 'auto',
    onEdit,
    onDelete,
    currentPage,
    totalPages,
    onPageChange,
}: ScrollableTableProps<T>) {
    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const hasActions = Boolean(onEdit || onDelete);
    const colSpan = columns.length + (hasActions ? 1 : 0);

    const renderCellContent = (column: Column<T>, row: T) =>
        column.render ? column.render(row[column.accessor], row) : String(row[column.accessor] ?? '');

    const renderDesktopBody = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={colSpan} className="py-12 text-center">
                        <LoadingSpinner size={32} color="#3b82f6" />
                        <p className="mt-2 text-sm text-gray-500">Loading data...</p>
                    </td>
                </tr>
            );
        }

        if (data.length === 0) {
            return (
                <tr>
                    <td colSpan={colSpan} className="py-12 text-center">
                        <div className="text-gray-400">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <p className="mt-2 text-sm">No data available</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return data.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition-colors hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                    <td
                        key={colIndex}
                        className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap sm:px-6 sm:py-4 sm:text-sm"
                        style={{ width: column.width }}
                    >
                        {renderCellContent(column, row)}
                    </td>
                ))}
                {hasActions && (
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(row)}
                                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center w-8 h-8 shadow-sm hover:shadow-md"
                                    title="View"
                                >
                                    <FiEye size={16} className="font-bold" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(row)}
                                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center w-8 h-8 shadow-sm hover:shadow-md"
                                    title="Delete"
                                >
                                    <FiTrash size={16} className="font-bold" />
                                </button>
                            )}
                        </div>
                    </td>
                )}
            </tr>
        ));
    };

    const renderMobileContent = () => {
        if (loading) {
            return (
                <div className="py-10 text-center">
                    <LoadingSpinner size={28} color="#3b82f6" />
                    <p className="mt-2 text-sm text-gray-500">Loading data...</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="py-10 text-center text-gray-500">
                    <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                    <p className="mt-2 text-sm">No data available</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-4">
                {data.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                        <div className="space-y-3">
                            {columns.map((column, colIndex) => (
                                <div key={colIndex} className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {column.header}
                                    </span>
                                    <div className="text-sm font-medium text-gray-900">{renderCellContent(column, row)}</div>
                                </div>
                            ))}
                            {hasActions && (
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(row)}
                                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center w-9 h-9 shadow-sm hover:shadow-md"
                                            title="View"
                                        >
                                            <FiEye size={16} className="font-bold" />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(row)}
                                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center w-9 h-9 shadow-sm hover:shadow-md"
                                            title="Delete"
                                        >
                                            <FiTrash size={16} className="font-bold" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const tableContainerStyle = height === 'auto' ? undefined : { height };

    return (
        <div className={twMerge('w-full bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col', className)}>


            {/* Table Container */}
            <div className="relative hidden sm:block">
                <div className={twMerge('overflow-x-auto rounded-t-xl', height !== 'auto' && 'overflow-y-auto')} style={tableContainerStyle}>
                    <table className="min-w-full table-auto divide-y divide-gray-100">
                        <thead className="bg-white sticky top-0 z-10 border-b border-gray-100">
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide sm:px-6 sm:py-4"
                                        style={{ width: column.width }}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                                {hasActions && (
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-16 sm:w-20 sm:px-6 sm:py-4">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">{renderDesktopBody()}</tbody>
                    </table>
                </div>
            </div>
            <div className="sm:hidden px-4 py-4">{renderMobileContent()}</div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="text-xs text-gray-600 sm:text-sm">
                        Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                        <button
                            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors sm:text-sm"
                        >
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {generatePageNumbers().map((page, index) =>
                                typeof page === 'number' ? (
                                    <button
                                        key={index}
                                        onClick={() => onPageChange(page)}
                                        className={twMerge(
                                            'px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 transition-colors sm:text-sm',
                                            page === currentPage
                                                ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                                                : 'hover:bg-gray-100 text-gray-700'
                                        )}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={index} className="px-3 py-1.5 text-xs text-gray-400 sm:text-sm">...</span>
                                )
                            )}
                        </div>
                        <button
                            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors sm:text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}