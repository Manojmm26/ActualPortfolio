import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-hilbert-curve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="hilbert-header">
        <h2>3D Hilbert Curve Visualizer</h2>
        <button class="close-btn">×</button>
      </div>
      <div class="file-input">
        <button class="browse-btn">Browse...</button>
        <span class="file-name">hil3.csv</span>
      </div>

      <div class="controls-container">
        <div class="controls-left">
          <div class="control-group">
            <label>Point Size:</label>
            <div class="slider-container">
              <input type="range" min="0.01" max="0.5" step="0.01" [(ngModel)]="pointSize" (input)="updateVisualization()">
              <span>{{ pointSize.toFixed(1) }}</span>
            </div>
          </div>

          <div class="control-group">
            <label>Line Width:</label>
            <div class="slider-container">
              <input type="range" min="0.1" max="3" step="0.1" [(ngModel)]="lineWidth" (input)="updateVisualization()">
              <span>{{ lineWidth.toFixed(1) }}</span>
            </div>
          </div>

          <div class="view-mode">
            <button [class.active]="viewMode === 'points'" (click)="setViewMode('points')">Points Only</button>
            <button [class.active]="viewMode === 'lines'" (click)="setViewMode('lines')">Lines Only</button>
            <button [class.active]="viewMode === 'both'" (click)="setViewMode('both')">Both</button>
          </div>

          <div class="control-group">
            <label>Trace Speed:</label>
            <div class="slider-container">
              <input type="range" min="1" max="20" step="1" [(ngModel)]="traceSpeed" (input)="updateTraceSpeed()">
              <span>{{ traceSpeed.toFixed(1) }}</span>
            </div>
          </div>

          <div class="trace-controls">
            <button (click)="startTracing()" [disabled]="isTracing">Start Tracing</button>
            <button (click)="stopTracing()" [disabled]="!isTracing">Stop Tracing</button>
            <button (click)="resetTrace()">Reset Trace</button>
          </div>

          <div class="view-controls">
            <button (click)="resetView()">Reset View</button>
            <button (click)="downloadImage()">Download Image</button>
          </div>

          <div class="control-group checkbox">
            <label>Auto Rotate:</label>
            <input type="checkbox" [(ngModel)]="autoRotate" (change)="toggleAutoRotate()">
          </div>

          <div class="advanced-section">
            <h3>Advanced Options</h3>
            
            <div class="control-group">
              <label>Current Depth:</label>
              <div class="depth-controls">
                <input type="number" [(ngModel)]="currentDepth" min="0" [max]="maxDepth">
                <button (click)="goUp()" [disabled]="currentDepth >= maxDepth">Go Up</button>
              </div>
            </div>

            <div class="control-group">
              <label>Sub-cube View:</label>
              <div class="subcube-controls">
                <select [(ngModel)]="subcubeView">
                  <option value="entire">Entire Cube</option>
                  <option value="octant1">Octant 1</option>
                  <option value="octant2">Octant 2</option>
                  <option value="octant3">Octant 3</option>
                  <option value="octant4">Octant 4</option>
                  <option value="octant5">Octant 5</option>
                  <option value="octant6">Octant 6</option>
                  <option value="octant7">Octant 7</option>
                  <option value="octant8">Octant 8</option>
                </select>
                <button (click)="applySubcubeView()">Apply</button>
              </div>
            </div>

            <div class="control-group">
              <div class="path-range">
                <div>
                  <label>Start Point:</label>
                  <input type="number" [(ngModel)]="startPoint" min="0" [max]="totalPoints - 1">
                </div>
                <div>
                  <label>End Point:</label>
                  <input type="number" [(ngModel)]="endPoint" min="0" [max]="totalPoints - 1">
                </div>
                <button (click)="highlightPath()">Highlight Path</button>
              </div>
            </div>
          </div>
        </div>

        <div class="canvas-container">
          <canvas #canvas></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: #f0f0f0;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .hilbert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: #333;
      color: white;
    }

    .hilbert-header h2 {
      margin: 0;
      font-size: 18px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
    }

    .file-input {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
    }

    .browse-btn {
      padding: 4px 10px;
      margin-right: 10px;
    }

    .controls-container {
      display: flex;
      height: calc(100% - 100px);
    }

    .controls-left {
      width: 250px;
      padding: 15px;
      background-color: #f8f8f8;
      border-right: 1px solid #ddd;
      overflow-y: auto;
    }

    .canvas-container {
      flex: 1;
      position: relative;
    }

    canvas {
      width: 100%;
      height: 100%;
    }

    .control-group {
      margin-bottom: 15px;
    }

    .slider-container {
      display: flex;
      align-items: center;
    }

    .slider-container input {
      flex: 1;
      margin-right: 10px;
    }

    .view-mode, .trace-controls, .view-controls {
      display: flex;
      gap: 5px;
      margin-bottom: 15px;
    }

    .view-mode button, .trace-controls button, .view-controls button {
      flex: 1;
      padding: 5px;
      background-color: #eee;
      border: 1px solid #ccc;
      border-radius: 3px;
      cursor: pointer;
    }

    .view-mode button.active {
      background-color: #007bff;
      color: white;
    }

    .checkbox {
      display: flex;
      align-items: center;
    }

    .checkbox label {
      margin-right: 10px;
    }

    .advanced-section {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }

    .advanced-section h3 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 16px;
    }

    .depth-controls, .subcube-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .path-range {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .path-range > div {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .path-range input {
      width: 80px;
    }
  `]
})
export class HilbertCurveComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  // THREE.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  
  // Visualization objects
  private points!: THREE.Points;
  private line!: THREE.Line;
  private traceLine!: THREE.Line;
  private highlightedPath!: THREE.Line;
  
  // Hilbert curve data
  private hilbertPoints: THREE.Vector3[] = [];
  private order = 3;
  maxDepth = 3;
  
  // UI Control values
  pointSize = 0.1;
  lineWidth = 1.0;
  viewMode = 'both';
  traceSpeed = 10.0;
  isTracing = false;
  autoRotate = false;
  currentDepth = 0;
  subcubeView = 'entire';
  startPoint = 0;
  endPoint = 10;
  totalPoints = 0;
  
  // Tracing animation
  private traceIndex = 0;
  private traceAnimationId: number | null = null;

  ngOnInit() {
    this.initScene();
    this.generateHilbertCurve();
    this.createVisualization();
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private initScene() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // Create camera
    const aspect = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(10, 10, 10);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas.nativeElement, 
      antialias: true 
    });
    this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Add coordinate axes
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  private generateHilbertCurve() {
    this.hilbertPoints = [];
    const points = this.hilbert3D(this.order);
    this.hilbertPoints = points;
    this.totalPoints = points.length;
    this.endPoint = Math.min(10, this.totalPoints - 1);
  }

  private hilbert3D(order: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const totalPoints = Math.pow(8, order);
    
    // Properly implement 3D Hilbert curve
    const hilbertIndex = (index: number, order: number): [number, number, number] => {
      if (order === 0) {
        return [0, 0, 0];
      }
      
      const subCubeSize = Math.pow(2, order - 1);
      const subCubeIndex = Math.floor(index / Math.pow(8, order - 1));
      const indexInSubCube = index % Math.pow(8, order - 1);
      
      let [x, y, z] = hilbertIndex(indexInSubCube, order - 1);
      
      // Map subcube to 3D coordinates
      switch (subCubeIndex) {
        case 0: return [z, y, x];
        case 1: return [y, z, x + subCubeSize];
        case 2: return [y, x + subCubeSize, z + subCubeSize];
        case 3: return [subCubeSize - 1 - z, x + subCubeSize, y];
        case 4: return [subCubeSize - 1 - x, y, z + subCubeSize];
        case 5: return [subCubeSize - 1 - y, z + subCubeSize, x];
        case 6: return [z + subCubeSize, x, y];
        case 7: return [x, subCubeSize - 1 - z, subCubeSize - 1 - y];
        default: return [0, 0, 0]; // Should never happen
      }
    };
    
    const size = Math.pow(2, order);
    
    for (let i = 0; i < totalPoints; i++) {
      const [x, y, z] = hilbertIndex(i, order);
      // Scale and center the curve
      const xNorm = (x / (size - 1)) * 2 - 1;
      const yNorm = (y / (size - 1)) * 2 - 1;
      const zNorm = (z / (size - 1)) * 2 - 1;
      
      points.push(new THREE.Vector3(xNorm * 5, yNorm * 5, zNorm * 5));
    }
    
    return points;
  }

  private createVisualization() {
    // Remove existing objects
    if (this.points) this.scene.remove(this.points);
    if (this.line) this.scene.remove(this.line);
    if (this.traceLine) this.scene.remove(this.traceLine);
    if (this.highlightedPath) this.scene.remove(this.highlightedPath);
    
    // Create points
    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(this.hilbertPoints);
    const pointsMaterial = new THREE.PointsMaterial({ 
      color: 0x0000ff,
      size: this.pointSize,
      sizeAttenuation: true
    });
    this.points = new THREE.Points(pointsGeometry, pointsMaterial);
    if (this.viewMode === 'points' || this.viewMode === 'both') {
      this.scene.add(this.points);
    }
    
    // Create line
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(this.hilbertPoints);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff0000,
      linewidth: this.lineWidth
    });
    this.line = new THREE.Line(lineGeometry, lineMaterial);
    if (this.viewMode === 'lines' || this.viewMode === 'both') {
      this.scene.add(this.line);
    }
    
    // Create trace line (initially empty)
    const traceGeometry = new THREE.BufferGeometry();
    const traceMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff6600,
      linewidth: this.lineWidth * 1.5
    });
    this.traceLine = new THREE.Line(traceGeometry, traceMaterial);
    this.scene.add(this.traceLine);
    
    // Create highlighted path
    this.updateHighlightedPath();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    this.controls.update();
    
    // Auto-rotate if enabled
    if (this.autoRotate) {
      this.scene.rotation.y += 0.005;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  private getAspectRatio(): number {
    return this.getCanvasWidth() / this.getCanvasHeight();
  }

  private getCanvasWidth(): number {
    return this.canvas.nativeElement.clientWidth || 1;
  }

  private getCanvasHeight(): number {
    return this.canvas.nativeElement.clientHeight || 1;
  }

  private onWindowResize() {
    const width = this.getCanvasWidth();
    const height = this.getCanvasHeight();
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // UI Control Methods
  updateVisualization() {
    // Update point size
    if (this.points) {
      (this.points.material as THREE.PointsMaterial).size = this.pointSize;
      (this.points.material as THREE.PointsMaterial).needsUpdate = true;
    }
    
    // Update line width (note: linewidth may not work on all browsers/GPUs)
    if (this.line) {
      (this.line.material as THREE.LineBasicMaterial).linewidth = this.lineWidth;
      (this.line.material as THREE.LineBasicMaterial).needsUpdate = true;
    }
    
    if (this.traceLine) {
      (this.traceLine.material as THREE.LineBasicMaterial).linewidth = this.lineWidth * 1.5;
      (this.traceLine.material as THREE.LineBasicMaterial).needsUpdate = true;
    }
  }

  setViewMode(mode: string) {
    this.viewMode = mode;
    
    // Remove existing objects
    if (this.points) this.scene.remove(this.points);
    if (this.line) this.scene.remove(this.line);
    
    // Add back based on mode
    if (mode === 'points' || mode === 'both') {
      this.scene.add(this.points);
    }
    
    if (mode === 'lines' || mode === 'both') {
      this.scene.add(this.line);
    }
  }

  updateTraceSpeed() {
    // Nothing to do here, the speed is used when tracing is active
  }

  startTracing() {
    if (this.isTracing) return;
    
    this.isTracing = true;
    this.traceIndex = 0;
    this.animateTrace();
  }

  stopTracing() {
    this.isTracing = false;
    if (this.traceAnimationId !== null) {
      cancelAnimationFrame(this.traceAnimationId);
      this.traceAnimationId = null;
    }
  }

  resetTrace() {
    this.stopTracing();
    this.traceIndex = 0;
    
    // Clear trace line
    const traceGeometry = new THREE.BufferGeometry();
    this.traceLine.geometry = traceGeometry;
  }

  private animateTrace() {
    if (!this.isTracing) return;
    
    // Calculate how many points to add based on speed
    const pointsToAdd = Math.max(1, Math.round(this.traceSpeed / 5));
    const endIndex = Math.min(this.traceIndex + pointsToAdd, this.hilbertPoints.length);
    
    // Get points for current trace segment
    const tracePoints = this.hilbertPoints.slice(0, endIndex);
    
    // Update trace line
    const traceGeometry = new THREE.BufferGeometry().setFromPoints(tracePoints);
    this.traceLine.geometry = traceGeometry;
    
    // Update trace index
    this.traceIndex = endIndex;
    
    // If we've traced the full curve, stop
    if (this.traceIndex >= this.hilbertPoints.length) {
      this.isTracing = false;
      return;
    }
    
    // Continue animation
    this.traceAnimationId = requestAnimationFrame(() => this.animateTrace());
  }

  resetView() {
    // Reset camera position and controls
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
    this.controls.reset();
    
    // Reset scene rotation
    this.scene.rotation.set(0, 0, 0);
  }

  downloadImage() {
    // Render the scene
    this.renderer.render(this.scene, this.camera);
    
    // Get the image data URL
    const imageURL = this.renderer.domElement.toDataURL('image/png');
    
    // Create a download link
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'hilbert3d.png';
    link.click();
  }

  toggleAutoRotate() {
    // Auto-rotate is handled in the animate method
  }

  goUp() {
    if (this.currentDepth < this.maxDepth) {
      this.currentDepth++;
      this.applyDepthFilter();
    }
  }

  applyDepthFilter() {
    // Filter the points based on the current depth
    // For this example, we'll just use a simplified approach
    // In a real implementation, you'd need to properly filter based on the Hilbert curve properties
    
    if (this.currentDepth === 0) {
      // Show all points
      this.createVisualization();
    } else {
      // Show a subset of points based on depth
      const depthFactor = Math.pow(8, this.currentDepth);
      const filteredPoints = this.hilbertPoints.filter((_, i) => i % depthFactor === 0);
      
      // Update points
      const pointsGeometry = new THREE.BufferGeometry().setFromPoints(filteredPoints);
      this.points.geometry = pointsGeometry;
      
      // Update line
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(filteredPoints);
      this.line.geometry = lineGeometry;
    }
  }

  applySubcubeView() {
    // Create visualization based on selected subcube
    if (this.subcubeView === 'entire') {
      this.createVisualization();
      return;
    }
    
    // Get octant number (1-8)
    const octantNum = parseInt(this.subcubeView.replace('octant', ''));
    if (isNaN(octantNum) || octantNum < 1 || octantNum > 8) return;
    
    // Define octant bounds
    const octantBounds = [
      { x: [-5, 0], y: [-5, 0], z: [-5, 0] }, // octant 1
      { x: [0, 5], y: [-5, 0], z: [-5, 0] },  // octant 2
      { x: [-5, 0], y: [0, 5], z: [-5, 0] },  // octant 3
      { x: [0, 5], y: [0, 5], z: [-5, 0] },   // octant 4
      { x: [-5, 0], y: [-5, 0], z: [0, 5] },  // octant 5
      { x: [0, 5], y: [-5, 0], z: [0, 5] },   // octant 6
      { x: [-5, 0], y: [0, 5], z: [0, 5] },   // octant 7
      { x: [0, 5], y: [0, 5], z: [0, 5] }     // octant 8
    ];
    
    const bounds = octantBounds[octantNum - 1];
    
    // Filter points in selected octant
    const filteredPoints = this.hilbertPoints.filter(point => {
      return point.x >= bounds.x[0] && point.x <= bounds.x[1] &&
             point.y >= bounds.y[0] && point.y <= bounds.y[1] &&
             point.z >= bounds.z[0] && point.z <= bounds.z[1];
    });
    
    // Update visualization with filtered points
    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(filteredPoints);
    this.points.geometry = pointsGeometry;
    
    // Create lines connecting the filtered points
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(filteredPoints);
    this.line.geometry = lineGeometry;
  }

  highlightPath() {
    this.updateHighlightedPath();
  }

  private updateHighlightedPath() {
    // Remove existing highlighted path
    if (this.highlightedPath) this.scene.remove(this.highlightedPath);
    
    // Validate input
    if (this.startPoint < 0) this.startPoint = 0;
    if (this.endPoint >= this.hilbertPoints.length) this.endPoint = this.hilbertPoints.length - 1;
    if (this.startPoint > this.endPoint) [this.startPoint, this.endPoint] = [this.endPoint, this.startPoint];
    
    // Get points for highlighted path
    const pathPoints = this.hilbertPoints.slice(this.startPoint, this.endPoint + 1);
    
    // Create highlighted path
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff00,
      linewidth: this.lineWidth * 2
    });
    this.highlightedPath = new THREE.Line(pathGeometry, pathMaterial);
    this.scene.add(this.highlightedPath);
  }
}
