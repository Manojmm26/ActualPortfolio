import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';

// Form Controls
import { ButtonComponent } from '../form-controls/button/button.component';
import { CheckboxComponent } from '../form-controls/checkbox/checkbox.component';
import { SelectComponent } from '../form-controls/select/select.component';
import { InputComponent } from '../form-controls/input/input.component';
import { RadioComponent } from '../form-controls/radio/radio.component';
import { SliderComponent } from '../form-controls/slider/slider.component';
import { RatingComponent } from '../form-controls/rating/rating.component';
import { EditorComponent } from '../form-controls/editor/editor.component';
import { DatePickerComponent } from '../form-controls/date-picker/date-picker.component';
import { ColorPickerComponent } from '../form-controls/color-picker/color-picker.component';
import { InputOTPComponent } from '../form-controls/input-otp/input-otp.component';
import { KnobComponent } from '../form-controls/knob/knob.component';
import { SelectButtonComponent } from '../form-controls/select-button/select-button.component';
import { ListboxComponent } from '../form-controls/listbox/listbox.component';

// Data Display
import { TableComponent } from '../data-display/table/table.component';
import { TreeComponent } from '../data-display/tree/tree.component';
import { TimelineComponent } from '../data-display/timeline/timeline.component';
import { DataViewComponent } from '../data-display/dataview/dataview.component';

// Feedback
import { AlertsComponent } from '../feedback/alerts/alerts.component';
import { TooltipComponent } from '../feedback/tooltip/tooltip.component';
import { BannerComponent } from '../feedback/banner/banner.component';
import { ProgressComponent } from '../feedback/progress/progress.component';
import { DialogComponent } from '../feedback/dialog/dialog.component';
import { NotificationsComponent } from '../feedback/notifications/notifications.component';

// Types and Interfaces
import { InputValidation } from '../form-controls/input/input.component';
import { SelectOption, SelectValidation } from '../form-controls/select/select.component';
import { RadioOption } from '../form-controls/radio/radio.component';
import { SliderMarker } from '../form-controls/slider/slider.component';
import { TableColumn, TableSort, TableFilter, TablePagination } from '../data-display/table/table.component';
import { TreeNode, TreeEvent } from '../data-display/tree/tree.component';
import { TimelineItem } from '../data-display/timeline/timeline.component';
import { DataViewLayoutOptions, DataViewSortField } from '../data-display/dataview/dataview.component';

interface TableState {
  selectedRows: any[];
  sort: TableSort | null;
  filters: TableFilter[];
  pagination: TablePagination;
}

interface TimelineState {
  layout: 'vertical' | 'horizontal';
  alternate: boolean;
  theme: string;
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Form Controls
    ButtonComponent,
    CheckboxComponent,
    SelectComponent,
    InputComponent,
    RadioComponent,
    SliderComponent,
    RatingComponent,
    EditorComponent,
    DatePickerComponent,
    ColorPickerComponent,
    InputOTPComponent,
    KnobComponent,
    SelectButtonComponent,
    ListboxComponent,
    // Data Display
    TableComponent,
    TreeComponent,
    TimelineComponent,
    DataViewComponent,
    // Feedback
    AlertsComponent,
    TooltipComponent,
    BannerComponent,
    ProgressComponent,
    DialogComponent,
    NotificationsComponent
  ],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {
  form!: FormGroup;
  
  checkboxValues = {
    basic: false,
    disabled: true,
    indeterminate: false,
    primary: false,
    success: false,
    danger: false,
    warning: false,
    info: false
  };

  selectValues = {
    basic: null,
    floating: null,
    multiple: [],
    icons: null,
    disabled: 'disabled-value'
  };

  basicOptions: SelectOption[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Disabled Option', value: 'option4', disabled: true },
  ];

  iconOptions: SelectOption[] = [
    { label: 'Edit', value: 'edit', icon: 'fas fa-edit' },
    { label: 'Delete', value: 'delete', icon: 'fas fa-trash' },
    { label: 'Share', value: 'share', icon: 'fas fa-share' },
    { label: 'Download', value: 'download', icon: 'fas fa-download' },
  ];

  multiSelectValidation: SelectValidation = {
    required: true,
    minSelected: 2,
    maxSelected: 3
  };

  usernameValidation: InputValidation = {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_]*$'
  };

  passwordValidation: InputValidation = {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      return /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
    }
  };

  radioValues = {
    basic: null,
    withIcons: null,
    horizontal: null,
    withDesc: null
  };

  toggleValues = {
    basic: false,
    small: false,
    medium: true,
    large: false,
    primary: true,
    success: false,
    danger: false,
    warning: true,
    info: false,
    withDesc: true,
    disabled: true
  };

  basicRadioOptions: RadioOption[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Disabled Option', value: 'option4', disabled: true }
  ];

  iconRadioOptions: RadioOption[] = [
    { label: 'Light Theme', value: 'light', icon: 'fas fa-sun' },
    { label: 'Dark Theme', value: 'dark', icon: 'fas fa-moon' },
    { label: 'System Theme', value: 'system', icon: 'fas fa-laptop' }
  ];

  descriptionRadioOptions: RadioOption[] = [
    {
      label: 'Free Plan',
      value: 'free',
      description: 'Basic features with limited storage',
      icon: 'fas fa-user'
    },
    {
      label: 'Pro Plan',
      value: 'pro',
      description: 'Advanced features with 100GB storage',
      icon: 'fas fa-star'
    },
    {
      label: 'Enterprise Plan',
      value: 'enterprise',
      description: 'Custom features with unlimited storage',
      icon: 'fas fa-building'
    }
  ];

  sliderValues = {
    basic: 50,
    stepped: 30,
    range: [200, 800],
    success: 75,
    danger: 25,
    warning: 60,
    disabled: 40,
    volume: 50,
    priceRange: [200, 800]
  };

  ratingValues = {
    basic: 3,
    half: 3.5,
    custom: 7,
    warning: 4,
    danger: 2,
    success: 5,
    disabled: 4
  };

  volumeMarkers: SliderMarker[] = [
    { value: 0, label: 'Mute' },
    { value: 25, label: 'Low' },
    { value: 50, label: 'Mid' },
    { value: 75, label: 'High' },
    { value: 100, label: 'Max' }
  ];

  // Table Demo
  tableColumns: TableColumn[] = [
    { field: 'id', header: 'ID', width: '80px' },
    { field: 'name', header: 'Name', sortable: true, filterable: true },
    { field: 'email', header: 'Email', sortable: true, filterable: true },
    { field: 'status', header: 'Status', sortable: true, filterable: true },
    { field: 'created', header: 'Created', sortable: true }
  ];

  tableData = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'Active',
      created: '2024-01-01'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'Inactive',
      created: '2024-01-02'
    }
  ];

  tableState: {
    selectedRows: any[];
    sort: TableSort | null;
    filters: TableFilter[];
    pagination: TablePagination;
  } = {
    selectedRows: [],
    sort: null,
    filters: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: this.tableData.length
    }
  };

  // Tree Demo
  basicTreeNodes: TreeNode[] = [
    {
      id: 1,
      label: 'Documents',
      icon: 'fas fa-folder',
      expanded: false,
      children: [
        {
          id: 11,
          label: 'Work',
          icon: 'fas fa-folder',
          expanded: false,
          children: []
        },
        {
          id: 12,
          label: 'Personal',
          icon: 'fas fa-folder',
          expanded: false,
          children: []
        }
      ]
    },
    {
      id: 2,
      label: 'Pictures',
      icon: 'fas fa-folder',
      expanded: false,
      children: [
        {
          id: 21,
          label: 'Vacation',
          icon: 'fas fa-folder',
          expanded: false,
          children: []
        },
        {
          id: 22,
          label: 'Family',
          icon: 'fas fa-folder',
          expanded: false,
          children: []
        }
      ]
    }
  ];

  lazyTreeNodes: TreeNode[] = [
    {
      id: 'cloud',
      label: 'Cloud Storage',
      icon: 'fas fa-cloud',
      children: [],
      expanded: false
    },
    {
      id: 'network',
      label: 'Network Drives',
      icon: 'fas fa-network-wired',
      children: [],
      expanded: false
    }
  ];

  treeState = {
    expanded: new Set<string>(),
    selected: new Set<string>(),
    loading: new Set<string>()
  };

  timelineState: TimelineState = {
    layout: 'vertical',
    alternate: true,
    theme: 'primary'
  };

  timelineLayoutOptions = [
    { value: 'vertical', label: 'Vertical' },
    { value: 'horizontal', label: 'Horizontal' }
  ];

  themeOptions: SelectOption[] = [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Success', value: 'success' },
    { label: 'Danger', value: 'danger' },
    { label: 'Warning', value: 'warning' },
    { label: 'Info', value: 'info' }
  ];

  timelineItems: TimelineItem[] = [
    {
      id: 1,
      title: 'Order Placed',
      content: 'Customer placed the order',
      date: '2024-01-01 09:00',
      icon: 'fas fa-shopping-cart',
      status: 'success'
    },
    {
      id: 2,
      title: 'Order Processed',
      content: 'Order has been processed and ready for shipping',
      date: '2024-01-01 10:30',
      icon: 'fas fa-box',
      status: 'success'
    },
    {
      id: 3,
      title: 'Order Shipped',
      content: 'Order has been shipped to the customer',
      date: '2024-01-02 11:00',
      icon: 'fas fa-truck',
      status: 'info'
    }
  ];

  customTimelineItems = [
    {
      id: 1,
      title: 'Order Placed',
      content: 'Order #12345 has been successfully placed.',
      date: new Date('2024-03-15'),
      icon: 'fas fa-shopping-cart',
      markerColor: '#3B82F6',
      data: { status: 'Completed' }
    },
    {
      id: 2,
      title: 'Payment Confirmed',
      content: 'Payment of $299.99 has been processed.',
      date: new Date('2024-03-16'),
      icon: 'fas fa-credit-card',
      markerColor: '#10B981',
      data: { status: 'Completed' }
    },
    {
      id: 3,
      title: 'Order Shipped',
      content: 'Package has been shipped via Express Delivery.',
      date: new Date('2024-03-17'),
      icon: 'fas fa-truck',
      markerColor: '#F59E0B',
      data: { status: 'In Progress' }
    },
    {
      id: 4,
      title: 'Out for Delivery',
      content: 'Package is out for delivery in your area.',
      date: new Date('2024-03-18'),
      icon: 'fas fa-box',
      markerColor: '#6366F1',
      data: { status: 'Pending' }
    }
  ];

  // DataView Demo
  dataViewLayout: 'grid' | 'list' = 'grid';

  productSortFields: DataViewSortField[] = [
    { field: 'name', header: 'Name' },
    { field: 'price', header: 'Price' },
    { field: 'rating', header: 'Rating' }
  ];

  products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      description: 'Premium noise-canceling wireless headphones with 30-hour battery life and crystal-clear sound quality.',
      price: 299.99,
      rating: 4.8,
      stock: 45,
      image: 'https://picsum.photos/400/300?random=1'
    },
    {
      id: 2,
      name: 'Smart Watch',
      description: 'Advanced fitness tracking, heart rate monitoring, and smartphone notifications in a sleek design.',
      price: 199.99,
      rating: 4.6,
      stock: 32,
      image: 'https://picsum.photos/400/300?random=2'
    },
    {
      id: 3,
      name: 'Laptop Stand',
      description: 'Ergonomic aluminum laptop stand with adjustable height and cooling ventilation.',
      price: 49.99,
      rating: 4.5,
      stock: 78,
      image: 'https://picsum.photos/400/300?random=3'
    },
    {
      id: 4,
      name: 'Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard with customizable switches and multimedia controls.',
      price: 149.99,
      rating: 4.7,
      stock: 23,
      image: 'https://picsum.photos/400/300?random=4'
    },
    {
      id: 5,
      name: 'Wireless Mouse',
      description: 'High-precision wireless mouse with ergonomic design and long battery life.',
      price: 79.99,
      rating: 4.4,
      stock: 56,
      image: 'https://picsum.photos/400/300?random=5'
    },
    {
      id: 6,
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery.',
      price: 39.99,
      rating: 4.3,
      stock: 91,
      image: 'https://picsum.photos/400/300?random=6'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      username: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
      date: this.fb.control(''),
      color: this.fb.control(''),
      content: this.fb.control(''),
      knob: this.fb.control(0),
      otp: this.fb.control(''),
      disabled: this.fb.control({ value: '', disabled: true })
    });
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  ngOnInit(): void {
    // Initialize component state
  }

  onTableSelectionChange(event: { selectedRows: any[] }): void {
    console.log('Selected rows:', event.selectedRows);
    this.tableState.selectedRows = event.selectedRows;
  }

  onTableSortChange(event: { sort: TableSort }): void {
    console.log('Sort changed:', event.sort);
    this.tableState.sort = event.sort;
  }

  onTableFilterChange(event: { filters: TableFilter[] }): void {
    console.log('Filters changed:', event.filters);
    this.tableState.filters = event.filters;
  }

  onTablePageChange(event: { pagination: TablePagination }): void {
    console.log('Page changed:', event.pagination);
    this.tableState.pagination = event.pagination;
  }

  onAddRow(): void {
    const newId = Math.max(...this.tableData.map(row => row.id)) + 1;
    this.tableData = [
      ...this.tableData,
      {
        id: newId,
        name: `New User ${newId}`,
        email: `user${newId}@example.com`,
        status: 'Pending',
        created: new Date().toISOString().split('T')[0]
      }
    ];
    this.tableState.pagination.total = this.tableData.length;
  }

  onNodeExpand(event: TreeEvent<any>): void {
    console.log('Node expanded:', event);
  }

  onNodeCollapse(event: TreeEvent<any>): void {
    console.log('Node collapsed:', event);
  }

  onNodeSelect(event: TreeEvent<any>): void {
    console.log('Node selected:', event);
  }

  onLazyLoad(event: TreeEvent<any>): void {
    console.log('Lazy load requested:', event);
  }

  alert(message: string): void {
    window.alert(message);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'text-gray-600';
    
    const classes: Record<string, string> = {
      'Completed': 'text-green-600',
      'In Progress': 'text-yellow-600',
      'Pending': 'text-blue-600',
      'Failed': 'text-red-600'
    };
    return classes[status] || 'text-gray-600';
  }

  onDataViewLayoutChange(event: { layout: 'grid' | 'list' }): void {
    console.log('Layout changed:', event.layout);
    this.dataViewLayout = event.layout;
  }

  onDataViewSortChange(event: { field: string; order: 'asc' | 'desc' }): void {
    console.log('Sort changed:', event);
  }

  onDataViewFilterChange(filter: string): void {
    console.log('Filter changed:', filter);
  }

  onDataViewPageChange(page: { page: number; pageSize: number }): void {
    console.log('Page changed:', page);
  }
} 