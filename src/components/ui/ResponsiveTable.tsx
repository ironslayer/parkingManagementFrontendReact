import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Search, Filter, MoreVertical, Eye } from 'lucide-react'
import { cn } from '../../utils'
import { Button } from './Button'
import { Input } from './Input'
import { LoadingSpinner } from './LoadingSpinner'

// ==========================================
// TIPOS PARA RESPONSIVE TABLE
// ==========================================
export interface ResponsiveTableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  priority?: 'high' | 'medium' | 'low' // Para decidir qué mostrar en espacios reducidos
}

export interface ResponsiveTableProps<T> {
  columns: ResponsiveTableColumn<T>[]
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
  mobileCardMode?: boolean // Cambiar a cards en móvil
  getRowId?: (row: T) => string | number
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
// COMPONENTE RESPONSIVE TABLE
// ==========================================
export function ResponsiveTable<T extends Record<string, unknown>>({
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
  className,
  mobileCardMode = true,
  getRowId
}: ResponsiveTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [expandedMobileRows, setExpandedMobileRows] = useState<Set<string | number>>(new Set())

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

  const getCellValue = (row: T, column: ResponsiveTableColumn<T>): React.ReactNode => {
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

  const getVisibleColumns = (breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop') => {
    return columns.filter(column => {
      if (breakpoint === 'mobile' && column.hideOnMobile) return false
      if (breakpoint === 'tablet' && column.hideOnTablet) return false
      return true
    })
  }

  const getPriorityColumns = (priority: 'high' | 'medium' | 'low') => {
    return columns.filter(column => (column.priority || 'medium') === priority)
  }

  const toggleMobileRow = (rowId: string | number) => {
    const newExpanded = new Set(expandedMobileRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedMobileRows(newExpanded)
  }

  // ==========================================
  // MOBILE CARD VIEW
  // ==========================================
  const MobileCardView = () => (
    <div className="block md:hidden space-y-4">
      {data.map((row, index) => {
        const rowId = getRowId ? getRowId(row) : index
        const isExpanded = expandedMobileRows.has(rowId)
        const primaryColumns = getPriorityColumns('high')
        const secondaryColumns = getPriorityColumns('medium')
        const tertiaryColumns = getPriorityColumns('low')

        return (
          <div
            key={rowId}
            className={cn(
              'bg-white border border-gray-200 rounded-lg p-4 shadow-sm',
              hoverable && 'hover:shadow-md transition-shadow',
              onRowClick && 'cursor-pointer'
            )}
          >
            {/* Primary info - always visible */}
            <div className="space-y-3">
              {primaryColumns.map((column, colIndex) => (
                <div key={colIndex} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600 min-w-0 flex-1">
                    {column.label}:
                  </span>
                  <span className="text-sm text-gray-900 ml-2 text-right">
                    {getCellValue(row, column)}
                  </span>
                </div>
              ))}
            </div>

            {/* Secondary info - visible on expand */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                {secondaryColumns.map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600 min-w-0 flex-1">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 ml-2 text-right">
                      {getCellValue(row, column)}
                    </span>
                  </div>
                ))}
                
                {tertiaryColumns.map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500 min-w-0 flex-1">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-700 ml-2 text-right">
                      {getCellValue(row, column)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMobileRow(rowId)}
                className="text-blue-600 p-0 h-auto"
              >
                {isExpanded ? 'Ver menos' : 'Ver más'}
                <Eye className="w-4 h-4 ml-1" />
              </Button>

              {onRowClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRowClick(row, index)}
                  className="flex items-center gap-2"
                >
                  <MoreVertical className="w-4 h-4" />
                  Acciones
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  // ==========================================
  // DESKTOP TABLE VIEW
  // ==========================================
  const DesktopTableView = () => (
    <div className="hidden md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {getVisibleColumns('desktop').map((column, index) => (
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
                <td colSpan={getVisibleColumns('desktop').length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="md" />
                    <span className="ml-2 text-gray-500">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={getVisibleColumns('desktop').length} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-1">Sin resultados</p>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={getRowId ? getRowId(row) : rowIndex}
                  className={cn(
                    striped && rowIndex % 2 === 0 && 'bg-white',
                    striped && rowIndex % 2 === 1 && 'bg-gray-50',
                    hoverable && 'hover:bg-gray-100 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {getVisibleColumns('desktop').map((column, colIndex) => (
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
    </div>
  )

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className={cn('bg-white shadow-sm rounded-lg overflow-hidden', className)}>
      {/* Header with search and actions */}
      {(searchable || filterable || actions) && (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Search and filters */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 flex-1">
              {searchable && onSearch && (
                <div className="flex-1 max-w-sm">
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
                  className="w-full sm:w-auto"
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

      {/* Table Content */}
      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      ) : (
        <>
          {mobileCardMode ? <MobileCardView /> : null}
          <DesktopTableView />
        </>
      )}

      {/* Pagination */}
      {pagination && <ResponsivePagination {...pagination} />}
    </div>
  )
}

// ==========================================
// COMPONENTE RESPONSIVE PAGINATION
// ==========================================
const ResponsivePagination: React.FC<PaginationProps> = ({
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
    <div className="px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        {/* Items info and page size selector */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-sm text-gray-700">
          <span className="whitespace-nowrap">
            Mostrando <span className="font-medium">{startItem}</span> a{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </span>
          
          <div className="flex items-center space-x-2">
            <span className="whitespace-nowrap">Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        {/* Page navigation */}
        <div className="flex items-center justify-center space-x-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="hidden sm:flex"
          >
            Anterior
          </Button>
          
          {/* Mobile navigation */}
          <div className="flex sm:hidden items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </Button>
            <span className="text-sm text-gray-700 px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </Button>
          </div>
          
          {/* Desktop page numbers */}
          <div className="hidden sm:flex items-center space-x-1">
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
          </div>
          
          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="hidden sm:flex"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResponsiveTable
