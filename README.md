# Modern Angular Portfolio

A high-performance, responsive portfolio showcasing Angular development expertise with modern web technologies.

## Features

- 🚀 Interactive Hero Section with Three.js Integration
- 💻 Terminal-style Skills Presentation
- 📊 Dynamic SVG Skill Radars
- 🎯 RxJS-powered Scroll Animations
- 📱 Responsive Design with Angular Flex Layout
- ♿ WCAG 2.1 AA Compliant
- 🔍 SEO Optimized
- 📈 Performance Benchmarking Dashboard

## UI Components Library

A comprehensive collection of highly customizable, accessible, and responsive UI components built with Tailwind CSS and Angular.

### Form Controls
- **Input Components**
  - InputText (with FloatLabel support)
  - InputNumber
  - InputMask
  - InputOTP
  - TextArea
  - Editor (Rich Text)
  - KeyFilter
  - Password (with strength meter)
  
- **Selection Components**
  - Checkbox
  - RadioButton
  - Select
  - MultiSelect
  - CascadeSelect
  - AutoComplete
  - TreeSelect
  - Listbox
  - SelectButton
  
- **Advanced Inputs**
  - ColorPicker
  - DatePicker
  - Slider
  - Rating
  - Knob
  - IconField
  - ToggleButton
  - ToggleSwitch

### Data Display & Management
- **Data Containers**
  - Table (with sorting, filtering, pagination)
  - TreeTable
  - DataView
  - VirtualScroller
  - Timeline
  - Tree
  - OrgChart
  
- **Data Management**
  - Paginator
  - OrderList
  - PickList
  - FilterService
  - SortService

### Layout Components
- **Content Containers**
  - Card
  - Panel
  - Accordion
  - Tabs
  - Fieldset
  - ScrollPanel
  - Divider
  - Splitter
  - Toolbar
  
- **Overlay Components**
  - Dialog
  - DynamicDialog
  - ConfirmDialog
  - ConfirmPopup
  - Drawer
  - Tooltip
  - Popover
  
- **Navigation**
  - Menu
  - Menubar
  - MegaMenu
  - PanelMenu
  - ContextMenu
  - TieredMenu
  - Dock
  - Steps
  - Breadcrumb

### Media & Graphics
- **Visual Components**
  - Image (with preview & zoom)
  - ImageCompare
  - Carousel
  - Galleria
  - Chart.js Integration
  
### Feedback Components
- **User Notifications**
  - Toast
  - Message
  - ProgressBar
  - ProgressSpinner
  - BlockUI
  
- **Status Indicators**
  - Badge
  - Tag
  - Chip
  - Skeleton
  - MeterGroup
  - Terminal

### Utility Components
- **Enhancement Utilities**
  - Ripple
  - StyleClass
  - AnimateOnScroll
  - AutoFocus
  - FocusTrap
  - ScrollTop
  
- **Button Variations**
  - Button
  - SplitButton
  - SpeedDial
  - Upload Button

### Component Features
- 🎨 Extensive Tailwind customization
- 🔄 Modular architecture
- 📱 Responsive design patterns
- ♿ WCAG 2.1 AA compliance
- 🌙 Dark mode & theming
- 🔍 SEO optimization
- 🚀 Lazy loading support
- 📝 Storybook documentation
- 🧪 Unit test coverage
- 🎯 Real-time validation
- 🔒 Security best practices
- 🌐 Internationalization ready

### Implementation Standards
- Component State Management
- Event Handling Patterns
- Two-way Binding Support
- Template-driven & Reactive Forms
- Custom Control Value Accessor
- Content Projection Patterns
- Change Detection Strategies
- Error Boundary Implementation
- Accessibility Patterns
- Animation Standards

## Technical Stack

- Angular 17.1.0
- RxJS 7.8.0
- Three.js for 3D Visualizations
- NgRx for State Management
- Angular Animations
- Angular Flex Layout
- TypeScript 5.3
- SCSS for Styling

## Performance Metrics

- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Bundle Size: < 200kb (main)

## Getting Started

### Prerequisites

- Node.js (v18.18.0 or higher)
- npm (v9.0.0 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`.

### Building for Production

```bash
npm run build
```

This will create an optimized production build in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── hero/
│   │   ├── about/
│   │   ├── projects/
│   │   └── performance/
│   ├── ui-components/                  # UI Components Library
│   │   ├── form-controls/             # Form-related components
│   │   │   ├── input/
│   │   │   ├── select/
│   │   │   └── advanced/
│   │   ├── data-display/             # Data presentation components
│   │   │   ├── table/
│   │   │   ├── tree/
│   │   │   └── timeline/
│   │   ├── layout/                   # Layout components
│   │   │   ├── containers/
│   │   │   ├── overlay/
│   │   │   └── navigation/
│   │   ├── feedback/                 # User feedback components
│   │   │   ├── notifications/
│   │   │   └── indicators/
│   │   ├── media/                    # Media components
│   │   │   ├── image/
│   │   │   └── carousel/
│   │   ├── utils/                    # Utility components
│   │   │   ├── animations/
│   │   │   └── directives/
│   │   ├── models/                   # Shared interfaces & types
│   │   ├── services/                 # Shared services
│   │   └── styles/                   # Component styles
│   ├── services/
│   ├── models/
│   └── shared/
├── assets/
├── environments/
└── styles/
```

## Component Usage Examples

### Basic Input with Floating Label
```typescript
// Template usage
<ui-input
  [(ngModel)]="value"
  label="Username"
  [floatingLabel]="true"
  [validation]="usernameValidation"
  theme="primary"
  size="md">
</ui-input>

// Configuration
const usernameValidation = {
  required: true,
  minLength: 3,
  pattern: /^[a-zA-Z0-9_]*$/
};
```

### Data Table with Sorting and Filtering
```typescript
// Template usage
<ui-table
  [data]="users"
  [columns]="columns"
  [sortable]="true"
  [filterable]="true"
  [pagination]="true"
  [pageSize]="10"
  theme="striped"
  (onSort)="handleSort($event)"
  (onFilter)="handleFilter($event)">
  
  <ng-template #actionTemplate let-row>
    <ui-button icon="edit" (click)="editUser(row)"></ui-button>
    <ui-button icon="delete" theme="danger" (click)="deleteUser(row)"></ui-button>
  </ng-template>
</ui-table>

// Configuration
const columns = [
  { field: 'name', header: 'Name', sortable: true, filterable: true },
  { field: 'email', header: 'Email', sortable: true, filterable: true },
  { field: 'role', header: 'Role', sortable: true, filter: 'dropdown' },
  { field: 'actions', header: 'Actions', template: 'actionTemplate' }
];
```

### Toast Notification System
```typescript
// Service usage
@Injectable()
class YourComponent {
  constructor(private toastService: UiToastService) {}

  showSuccess() {
    this.toastService.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Operation completed successfully',
      duration: 3000,
      position: 'top-right'
    });
  }
}

// Global configuration
const toastConfig = {
  timeOut: 3000,
  position: 'top-right',
  preventDuplicates: true,
  maxStack: 5,
  animation: 'fade',
  themes: {
    success: { bgColor: 'green-500', textColor: 'white' },
    error: { bgColor: 'red-500', textColor: 'white' },
    // ... other themes
  }
};
```

## Development Guidelines

- Follow Angular style guide
- Maintain component isolation
- Use lazy loading for feature modules
- Implement proper error handling
- Write comprehensive unit tests
- Document complex logic
- Optimize bundle size

## Testing

```bash
# Unit Tests
npm run test

# E2E Tests
npm run e2e
```

## Accessibility

This portfolio follows WCAG 2.1 AA guidelines:

- Proper heading hierarchy
- ARIA labels where necessary
- Keyboard navigation support
- High contrast ratios
- Reduced motion alternatives

## Performance Optimization

- Tree-shaking enabled
- Lazy loading implemented
- Image optimization
- Code splitting
- Service Worker integration
- Caching strategies

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 