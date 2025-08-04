import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react'
import { cn } from '../../utils'
import { Button } from './Button'
import { Input } from './Input'
import { LoadingSpinner } from './LoadingSpinner'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T, index: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  filterable?: boolean
  onFilter?: () => void
  actions?: React.ReactNode
  pagination?: PaginationProps
  striped?: boolean
  hoverable?: boolean
  className?: string
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

// ==========================================
// COMPONENTE TABLE
// ==========================================
export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  onSort,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  filterable = false,
  onFilter,
  actions,
  pagination,
  striped = true,
  hoverable = true,
  className
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSort = (columnKey: string) => {
    if (!onSort) return

    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key: columnKey, direction })
    onSort(columnKey, direction)
  }

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />
  }

  const getCellValue = (row: T, column: TableColumn<T>): React.ReactNode => {
    const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
      return path.split('.').reduce((current: unknown, key: string) => {
        return current && typeof current === 'object' && key in current 
          ? (current as Record<string, unknown>)[key]
          : undefined
      }, obj)
    }

    if (column.render) {
      const value = typeof column.key === 'string' && column.key.includes('.') 
        ? getNestedValue(row as Record<string, unknown>, column.key)
        : row[column.key as keyof T]
      return column.render(value, row, data.indexOf(row))
    }
    
    if (typeof column.key === 'string' && column.key.includes('.')) {
      const value = getNestedValue(row as Record<string, unknown>, column.key)
      return String(value ?? '')
    }
    
    const value = row[column.key as keyof T]
    return String(value ?? '')
  }

  return (
    <div className={cn('bg-white shadow-sm rounded-lg overflow-hidden', className)}>
      {/* Header with search and actions */}
      {(searchable || filterable || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search and filters */}
            <div className="flex flex-1 items-center gap-3">
              {searchable && onSearch && (
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder={searchPlaceholder}
                    leftIcon={<Search className="w-4 h-4" />}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
              
              {filterable && onFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFilter}
                  leftIcon={<Filter className="w-4 h-4" />}
                >
                  Filtros
                </Button>
              )}
            </div>
            
            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={typeof column.key === 'string' ? column.key : index}
                  className={cn(
                    'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="ml-2">
                        {getSortIcon(String(column.key))}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={cn(
            'bg-white divide-y divide-gray-200',
            striped && 'divide-y divide-gray-200'
          )}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="md" />
                    <span className="ml-2 text-gray-500">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-1">Sin resultados</p>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    striped && rowIndex % 2 === 0 && 'bg-white',
                    striped && rowIndex % 2 === 1 && 'bg-gray-50',
                    hoverable && 'hover:bg-gray-100 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <TablePagination {...pagination} />
      )}
    </div>
  )
}

// ==========================================
// COMPONENTE PAGINATION
// ==========================================
const TablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)
  
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Items info and page size selector */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <span>
            Mostrando {startItem} a {endItem} de {totalItems} resultados
          </span>
          
          <div className="flex items-center gap-2">
            <span>Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[2.5rem]"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
