import { Component, Input, Output, EventEmitter, forwardRef, ContentChild, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';

export interface TreeNode {
  label: string;
  value: any;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
  loading?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

@Component({
  selector: 'ui-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreeSelectComponent),
      multi: true
    }
  ]
})
export class TreeSelectComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() override disabled = false;
  @Input() required = false;
  @Input() nodes: TreeNode[] = [];
  @Input() multiple = false;
  @Input() loadingText = 'Loading...';
  @Input() noNodesText = 'No options available';
  @Input() clearable = true;
  @Input() filter = false;
  @Input() filterPlaceholder = 'Search...';

  @Input() set asyncChildNodes(value: ((node: TreeNode) => Promise<TreeNode[]>) | null) {
    this._asyncChildNodes = value;
    this.initializeNodes();
  }
  get asyncChildNodes(): ((node: TreeNode) => Promise<TreeNode[]>) | null {
    return this._asyncChildNodes;
  }

  @Output() nodeSelect = new EventEmitter<TreeNode>();
  @Output() nodeUnselect = new EventEmitter<TreeNode>();
  @Output() nodeExpand = new EventEmitter<TreeNode>();
  @Output() nodeCollapse = new EventEmitter<TreeNode>();
  @Output() clear = new EventEmitter<void>();

  @ContentChild('nodeTemplate') nodeTemplate?: TemplateRef<any>;
  @ContentChild('selectedNodeTemplate') selectedNodeTemplate?: TemplateRef<any>;

  id = `ui-tree-select-${Math.random().toString(36).substr(2, 9)}`;
  expanded = false;
  focused = false;
  filterValue = '';
  selectedNodes: TreeNode[] = [];
  filteredNodes: TreeNode[] = [];
  expandedNodes = new Set<any>();

  private _asyncChildNodes: ((node: TreeNode) => Promise<TreeNode[]>) | null = null;
  private onChange: (value: any) => void = () => {};
  protected onTouched: () => void = () => {};

  ngOnInit() {
    this.initializeNodes();
  }

  private initializeNodes() {
    this.filteredNodes = this.nodes;
  }

  async toggleNode(node: TreeNode, event?: Event) {
    event?.stopPropagation();
    
    if (node.disabled) return;

    if (this.asyncChildNodes && !node.expanded && !node.children?.length) {
      node.loading = true;
      try {
        node.children = await this.asyncChildNodes(node);
      } catch (error) {
        console.error('Error loading tree nodes:', error);
      } finally {
        node.loading = false;
      }
    }

    node.expanded = !node.expanded;
    
    if (node.expanded) {
      this.expandedNodes.add(node.value);
      this.nodeExpand.emit(node);
    } else {
      this.expandedNodes.delete(node.value);
      this.nodeCollapse.emit(node);
    }
  }

  selectNode(node: TreeNode, event?: Event) {
    event?.stopPropagation();
    
    if (node.disabled) return;

    if (this.multiple) {
      const index = this.selectedNodes.findIndex(n => n.value === node.value);
      if (index === -1) {
        this.selectedNodes = [...this.selectedNodes, node];
        this.nodeSelect.emit(node);
      } else {
        this.selectedNodes = this.selectedNodes.filter(n => n.value !== node.value);
        this.nodeUnselect.emit(node);
      }
      this.onChange(this.selectedNodes.map(n => n.value));
    } else {
      this.selectedNodes = [node];
      this.onChange(node.value);
      this.nodeSelect.emit(node);
      this.expanded = false;
    }
  }

  isSelected(node: TreeNode): boolean {
    return this.selectedNodes.some(n => n.value === node.value);
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.onTouched();
    }
  }

  onClickOutside() {
    this.expanded = false;
  }

  clearSelection() {
    this.selectedNodes = [];
    this.onChange(this.multiple ? [] : null);
    this.clear.emit();
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterValue = value;
    
    if (!value) {
      this.filteredNodes = this.nodes;
      return;
    }

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce((filtered: TreeNode[], node) => {
        const matches = node.label.toLowerCase().includes(value);
        const childMatches = node.children ? filterTree(node.children) : [];
        
        if (matches || childMatches.length) {
          const clone = { ...node };
          if (childMatches.length) {
            clone.children = childMatches;
            clone.expanded = true;
            this.expandedNodes.add(clone.value);
          }
          filtered.push(clone);
        }
        return filtered;
      }, []);
    };

    this.filteredNodes = filterTree(this.nodes);
  }

  getDisplayValue(): string {
    if (!this.selectedNodes.length) {
      return '';
    }
    return this.multiple
      ? `${this.selectedNodes.length} item${this.selectedNodes.length > 1 ? 's' : ''} selected`
      : this.selectedNodes[0].label;
  }

  trackByValue(_: number, node: TreeNode): any {
    return node.value;
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.selectedNodes = [];

    if (value === null || value === undefined) {
      return;
    }

    const findNodes = (nodes: TreeNode[], values: any[]): TreeNode[] => {
      const found: TreeNode[] = [];
      const search = (currentNodes: TreeNode[]) => {
        for (const node of currentNodes) {
          if (values.includes(node.value)) {
            found.push(node);
          }
          if (node.children) {
            search(node.children);
          }
        }
      };
      search(nodes);
      return found;
    };

    const valuesToFind = Array.isArray(value) ? value : [value];
    this.selectedNodes = findNodes(this.nodes, valuesToFind);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 