# Angular Portfolio Project Structure

## Root Directory

├── .angular/ # Angular cache and configuration ├── src/ # Source code │ ├── app/ # Application code │ ├── assets/ # Static assets │ ├── environments/ # Environment configurations │ └── styles/ # Global styles ├── angular.json # Angular CLI configuration ├── package.json # Project dependencies and scripts ├── tsconfig.json # TypeScript configuration ├── tailwind.config.js # Tailwind CSS configuration └── postcss.config.js # PostCSS configuration

## Source Directory (src/)

src/ ├── app/ │ ├── components/ # Feature components │ │ ├── about/ │ │ ├── hero/ │ │ ├── performance/ │ │ └── projects/ │ ├── ui-components/ # Reusable UI components │ │ ├── data-display/ # Data presentation components │ │ │ ├── table/ │ │ │ ├── tree/ │ │ │ └── timeline/ │ │ ├── form-controls/ # Form-related components │ │ └── demo/ # Component demos │ ├── services/ # Application services │ ├── models/ # Data models and interfaces │ └── shared/ # Shared utilities and components ├── assets/ │ └── images/ # Image assets ├── environments/ # Environment configurations │ ├── environment.ts │ └── environment.prod.ts └── styles/ # Global styles ├── _themes.scss ├── theme.scss └── styles.scss