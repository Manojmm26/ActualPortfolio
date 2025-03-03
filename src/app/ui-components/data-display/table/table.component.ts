import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, TemplateRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '../../form-controls/checkbox/checkbox.component';

export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface TableFilter {
  field: string;
  value: string;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxComponent],
  template: `
    <div class="table-container">
      <!-- Table Header -->
      <div class="table-header">
        <div class="table-title" *ngIf="title">{{ title }}</div>
        <div class="table-actions">
          <div class="table-filters" *ngIf="hasFilterableColumns">
            <input
              type="text"
              *ngFor="let column of filterableColumns"
              [placeholder]="'Filter ' + column.header"
              (input)="onFilterChange(column.field, $any($event.target).value)"
              class="filter-input"
            />
          </div>
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-content">
        <table>
          <thead>
            <tr>
              <th *ngIf="selectable" class="selection-column">
                <input
                  type="checkbox"
                  [checked]="isAllSelected"
                  (change)="toggleSelectAll()"
                  [disabled]="disabled"
                />
              </th>
              <th
                *ngFor="let column of columns"
                [style.width]="column.width"
                [class.sortable]="column.sortable"
                (click)="column.sortable && onSortChange(column.field)"
              >
                {{ column.header }}
                <span *ngIf="column.sortable" class="sort-icon">
                  {{ getSortIcon(column.field) }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let row of displayedData"
              [class.selected]="isSelected(row)"
              (click)="onRowClick(row)"
            >
              <td *ngIf="selectable" class="selection-column">
                <input
                  type="checkbox"
                  [checked]="isSelected(row)"
                  (click)="$event.stopPropagation()"
                  (change)="toggleRowSelection(row)"
                  [disabled]="disabled"
                />
              </td>
              <td *ngFor="let column of columns">
                {{ row[column.field] }}
              </td>
            </tr>
            <tr *ngIf="!displayedData.length" class="empty-row">
              <td [attr.colspan]="columns.length + (selectable ? 1 : 0)">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer -->
      <div class="table-footer" *ngIf="pagination">
        <div class="pagination-info">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ pagination.total }} entries
        </div>
        <div class="pagination-controls">
          <button
            (click)="onPageChange(pagination.page - 1)"
            [disabled]="pagination.page === 1"
          >
            Previous
          </button>
          <span class="page-number">Page {{ pagination.page }}</span>
          <button
            (click)="onPageChange(pagination.page + 1)"
            [disabled]="paginationEnd >= pagination.total"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      overflow: hidden;
    }

    .table-header {
      padding: 16px;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-title {
      font-weight: 500;
      font-size: 18px;
    }

    .table-filters {
      display: flex;
      gap: 8px;
    }

    .filter-input {
      padding: 6px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: 14px;
    }

    .table-content {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }

    th {
      background: var(--color-surface-variant);
      font-weight: 500;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }

    .sort-icon {
      margin-left: 4px;
      font-size: 12px;
    }

    tr:hover:not(.empty-row) {
      background: var(--color-surface-variant);
    }

    tr.selected {
      background: var(--color-primary-light);
    }

    .selection-column {
      width: 40px;
      text-align: center;
    }

    .empty-row td {
      text-align: center;
      padding: 24px;
      color: var(--color-text-secondary);
    }

    .table-footer {
      padding: 16px;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-info {
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pagination-controls button {
      padding: 6px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      background: white;
      cursor: pointer;
    }

    .pagination-controls button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .pagination-controls button:hover:not(:disabled) {
      background: var(--color-surface-variant);
    }

    .page-number {
      padding: 0 8px;
      color: var(--color-text-secondary);
    }
  `]
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() title = '';
  @Input() selectable = true;
  @Input() disabled = false;
  @Input() selectedRows: any[] = [];
  @Input() sort: TableSort | null = null;
  @Input() filters: TableFilter[] = [];
  @Input() pagination: TablePagination | null = null;

  @Output() selectionChange = new EventEmitter<{ selectedRows: any[] }>();
  @Output() sortChange = new EventEmitter<{ sort: TableSort }>();
  @Output() filterChange = new EventEmitter<{ filters: TableFilter[] }>();
  @Output() pageChange = new EventEmitter<{ pagination: TablePagination }>();

  @ViewChild('table') tableElement!: ElementRef;

  get filterableColumns(): TableColumn[] {
    return this.columns.filter(column => column.filterable);
  }

  get hasFilterableColumns(): boolean {
    return this.filterableColumns.length > 0;
  }

  get isAllSelected(): boolean {
    return this.displayedData.length > 0 && 
           this.displayedData.every(row => this.isSelected(row));
  }

  get displayedData(): any[] {
    let filteredData = this.applyFilters(this.data);
    
    if (this.sort) {
      filteredData = this.applySort(filteredData);
    }
    
    if (this.pagination) {
      const start = (this.pagination.page - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      return filteredData.slice(start, end);
    }
    
    return filteredData;
  }

  get paginationStart(): number {
    if (!this.pagination || this.pagination.total === 0) return 0;
    return (this.pagination.page - 1) * this.pagination.pageSize + 1;
  }

  get paginationEnd(): number {
    if (!this.pagination || this.pagination.total === 0) return 0;
    const end = this.pagination.page * this.pagination.pageSize;
    return Math.min(end, this.pagination.total);
  }

  isSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  getSortIcon(field: string): string {
    if (!this.sort || this.sort.field !== field) return '↕';
    return this.sort.order === 'asc' ? '↑' : '↓';
  }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.selectedRows = this.selectedRows.filter(
        row => !this.displayedData.includes(row)
      );
    } else {
      this.selectedRows = [
        ...new Set([...this.selectedRows, ...this.displayedData])
      ];
    }
    this.selectionChange.emit({ selectedRows: this.selectedRows });
  }

  toggleRowSelection(row: any): void {
    const index = this.selectedRows.indexOf(row);
    if (index === -1) {
      this.selectedRows = [...this.selectedRows, row];
    } else {
      this.selectedRows = this.selectedRows.filter((_, i) => i !== index);
    }
    this.selectionChange.emit({ selectedRows: this.selectedRows });
  }

  onRowClick(row: any): void {
    if (!this.selectable || this.disabled) return;
    this.toggleRowSelection(row);
  }

  onSortChange(field: string): void {
    let order: 'asc' | 'desc' = 'asc';
    
    if (this.sort && this.sort.field === field) {
      order = this.sort.order === 'asc' ? 'desc' : 'asc';
    }
    
    this.sort = { field, order };
    this.sortChange.emit({ sort: this.sort });
  }

  onFilterChange(field: string, value: string): void {
    const index = this.filters.findIndex(f => f.field === field);
    
    if (value) {
      if (index === -1) {
        this.filters = [...this.filters, { field, value }];
      } else {
        this.filters = this.filters.map((f, i) =>
          i === index ? { ...f, value } : f
        );
      }
    } else {
      if (index !== -1) {
        this.filters = this.filters.filter((_, i) => i !== index);
      }
    }
    
    this.filterChange.emit({ filters: this.filters });
  }

  onPageChange(page: number): void {
    if (!this.pagination) return;
    
    this.pagination = {
      ...this.pagination,
      page
    };
    
    this.pageChange.emit({ pagination: this.pagination });
  }

  private applyFilters(data: any[]): any[] {
    return data.filter(row =>
      this.filters.every(filter =>
        String(row[filter.field])
          .toLowerCase()
          .includes(filter.value.toLowerCase())
      )
    );
  }

  private applySort(data: any[]): any[] {
    if (!this.sort) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[this.sort!.field];
      const bValue = b[this.sort!.field];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return this.sort!.order === 'asc' ? comparison : -comparison;
    });
  }
} 