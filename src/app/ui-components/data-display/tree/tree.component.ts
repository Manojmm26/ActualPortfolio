import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TreeNode {
  id: string | number;
  label: string;
  icon?: string;
  data?: any;
  children?: TreeNode[];
  expanded: boolean;
  selected?: boolean;
  selectable?: boolean;
  loading?: boolean;
  leaf?: boolean;
}

export interface TreeEvent<T = any> {
  node: TreeNode;
  data?: T;
}

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-container">
      <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: nodes, level: 0 }">
      </ng-container>
    </div>

    <ng-template #nodeTemplate let-nodes let-level="level">
      <div class="tree-node-list" [style.padding-left.px]="level * 20">
        <div
          *ngFor="let node of nodes"
          class="tree-node"
          [class.selected]="node.selected"
          [class.disabled]="!node.selectable"
        >
          <!-- Node Content -->
          <div
            class="node-content"
            [class.has-children]="hasChildren(node)"
            (click)="onNodeClick(node)"
          >
            <!-- Expand/Collapse Icon -->
            <div
              *ngIf="hasChildren(node)"
              class="expand-icon"
              [class.expanded]="node.expanded"
              (click)="toggleNode($event, node)"
            >
              <span class="icon">▶</span>
            </div>

            <!-- Node Icon -->
            <i *ngIf="node.icon" [class]="node.icon" class="node-icon"></i>

            <!-- Node Label -->
            <span class="node-label">{{ node.label }}</span>

            <!-- Loading Indicator -->
            <div *ngIf="node.loading" class="loading-indicator">
              <div class="spinner"></div>
            </div>
          </div>

          <!-- Child Nodes -->
          <div
            *ngIf="node.expanded && hasChildren(node)"
            class="child-nodes"
            [@expandCollapse]
          >
            <ng-container
              *ngTemplateOutlet="nodeTemplate; context: { $implicit: node.children, level: level + 1 }"
            >
            </ng-container>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .tree-container {
      padding: 8px;
    }

    .tree-node-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tree-node {
      display: flex;
      flex-direction: column;
    }

    .node-content {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: var(--border-radius);
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;
    }

    .node-content:hover {
      background: var(--color-surface-variant);
    }

    .node-content.has-children {
      font-weight: 500;
    }

    .expand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      transition: transform 0.2s;
    }

    .expand-icon.expanded {
      transform: rotate(90deg);
    }

    .icon {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .node-icon {
      color: var(--color-text-secondary);
      font-size: 16px;
    }

    .node-label {
      flex: 1;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
    }

    .spinner {
      width: 12px;
      height: 12px;
      border: 2px solid var(--color-primary);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .selected > .node-content {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }

    .disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .child-nodes {
      overflow: hidden;
    }
  `]
})
export class TreeComponent {
  @Input() nodes: TreeNode[] = [];
  @Input() selectable = true;
  @Input() multiple = false;

  @Output() nodeExpand = new EventEmitter<TreeEvent>();
  @Output() nodeCollapse = new EventEmitter<TreeEvent>();
  @Output() nodeSelect = new EventEmitter<TreeEvent>();
  @Output() lazyLoad = new EventEmitter<TreeEvent>();

  hasChildren(node: TreeNode): boolean {
    return !node.leaf && (!!node.children?.length || !!node.loading);
  }

  toggleNode(event: Event, node: TreeNode): void {
    event.stopPropagation();
    
    if (node.loading) return;
    
    if (!node.children?.length && !node.leaf) {
      node.loading = true;
      this.lazyLoad.emit({ node });
      return;
    }
    
    node.expanded = !node.expanded;
    
    if (node.expanded) {
      this.nodeExpand.emit({ node });
    } else {
      this.nodeCollapse.emit({ node });
    }
  }

  onNodeClick(node: TreeNode): void {
    if (!this.selectable || node.selectable === false) return;
    
    if (!this.multiple) {
      // Deselect all other nodes
      this.traverseNodes(this.nodes, n => {
        if (n !== node) n.selected = false;
      });
    }
    
    node.selected = !node.selected;
    this.nodeSelect.emit({ node });
  }

  private traverseNodes(nodes: TreeNode[], callback: (node: TreeNode) => void): void {
    nodes.forEach(node => {
      callback(node);
      if (node.children?.length) {
        this.traverseNodes(node.children, callback);
      }
    });
  }
} 