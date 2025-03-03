import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DataViewLayoutOptions {
  layout: 'grid' | 'list';
}

export interface DataViewSortField {
  field: string;
  header: string;
}

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dataview.component.html',
  styleUrls: ['./dataview.component.css']
})
export class DataViewComponent {
  @Input() items: any[] = [];
  @Input() layout: 'grid' | 'list' = 'grid';
  @Input() sortFields: DataViewSortField[] = [];
  @Input() filterable = true;
  @Input() paginator = true;
  @Input() pageSizes = [12, 24, 48, 96];
  @Input() emptyMessage = 'No items to display';
  @Input() gridTemplate: TemplateRef<any> | null = null;
  @Input() listTemplate: TemplateRef<any> | null = null;

  @Output() layoutChange = new EventEmitter<DataViewLayoutOptions>();
  @Output() sortChange = new EventEmitter<{ field: string; order: 'asc' | 'desc' }>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

  currentSort: { field: string; order: 'asc' | 'desc' } = {
    field: '',
    order: 'asc'
  };
  filterValue = '';
  currentPage = 1;
  pageSize = 12;

  get sortedItems(): any[] {
    let result = [...this.items];

    // Apply filter
    if (this.filterValue) {
      const searchTerm = this.filterValue.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply sort
    if (this.currentSort.field) {
      result.sort((a, b) => {
        const aValue = a[this.currentSort.field];
        const bValue = b[this.currentSort.field];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return this.currentSort.order === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    if (this.paginator) {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return result.slice(start, end);
    }

    return result;
  }

  get totalPages(): number {
    return Math.ceil(this.items.length / this.pageSize);
  }

  onLayoutChange(layout: 'grid' | 'list'): void {
    this.layout = layout;
    this.layoutChange.emit({ layout });
  }

  onSortFieldChange(field: string): void {
    this.currentSort = {
      ...this.currentSort,
      field
    };
    this.emitSortChange();
  }

  toggleSortOrder(): void {
    if (!this.currentSort.field) return;

    this.currentSort = {
      ...this.currentSort,
      order: this.currentSort.order === 'asc' ? 'desc' : 'asc'
    };
    this.emitSortChange();
  }

  private emitSortChange(): void {
    this.sortChange.emit(this.currentSort);
  }

  onFilter(event: Event): void {
    this.currentPage = 1;
    this.filterChange.emit(this.filterValue);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit({ page, pageSize: this.pageSize });
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }
} 