#!/bin/bash

# Install Angular CLI globally
npm install -g @angular/cli

# Install dependencies
npm install

# Create necessary directories
mkdir -p src/assets/images/projects

# Install additional dependencies
npm install three @types/three
npm install @angular/cdk
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
npm install @apollo/client graphql
npm install cloudinary-angular
npm install webpack-bundle-analyzer
npm install artillery axe-core --save-dev
npm install @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint --save-dev
npm install @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @angular-eslint/template-parser --save-dev

# Create environment files if they don't exist
if [ ! -f src/environments/environment.ts ]; then
  cp src/environments/environment.ts.example src/environments/environment.ts
fi

if [ ! -f src/environments/environment.prod.ts ]; then
  cp src/environments/environment.ts.example src/environments/environment.prod.ts
fi

# Build the project
ng build

echo "Setup completed successfully!" 