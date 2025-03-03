# Install Angular CLI globally
Write-Host "Installing Angular CLI globally..."
npm install -g @angular/cli

# Install dependencies
Write-Host "Installing project dependencies..."
npm install

# Create necessary directories
Write-Host "Creating project directories..."
New-Item -ItemType Directory -Force -Path "src\assets\images\projects"

# Install additional dependencies
Write-Host "Installing additional dependencies..."
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
Write-Host "Setting up environment files..."
if (-not (Test-Path "src\environments\environment.ts")) {
    Copy-Item "src\environments\environment.ts.example" -Destination "src\environments\environment.ts"
}

if (-not (Test-Path "src\environments\environment.prod.ts")) {
    Copy-Item "src\environments\environment.ts.example" -Destination "src\environments\environment.prod.ts"
}

# Build the project
Write-Host "Building the project..."
ng build

Write-Host "Setup completed successfully!" -ForegroundColor Green 