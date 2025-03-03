import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate, sequence } from '@angular/animations';
import { fromEvent, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import * as THREE from 'three';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-section" [@heroAnimation]="animationState">
      <div class="hero-content">
        <h1 class="text-5xl md:text-7xl font-bold mb-4 leading-tight" [class.typing]="isTyping">{{ displayText }}</h1>
        <p class="subtitle">Angular Developer | Performance Optimizer | Solution Architect</p>
        <div class="skills-terminal">
          <div class="terminal-header">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <div class="terminal-content">
            <p>> Specialized in:</p>
            <ul>
              <li *ngFor="let skill of skills" [@skillAnimation]="'in'">• {{ skill }}</li>
            </ul>
          </div>
        </div>
      </div>
      <canvas #projectCanvas class="project-carousel"></canvas>
      
      <!-- Shape Controls -->
      <div class="canvas-controls shape-controls">
        <button 
          *ngFor="let shape of particleShapes" 
          class="control-btn"
          [class.active]="currentShape === shape.id"
          (click)="changeParticleShape(shape.id)"
          [title]="shape.name">
          <i class="fas" [class]="shape.icon"></i>
        </button>
      </div>

      <!-- Color Controls -->
      <div class="canvas-controls color-controls">
        <button 
          *ngFor="let scheme of colorSchemes" 
          class="control-btn"
          [class.active]="currentColorScheme === scheme.id"
          (click)="changeColorScheme(scheme.id)"
          [title]="scheme.name">
          <i class="fas" [class]="scheme.icon"></i>
        </button>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 var(--spacing-lg);
      background: var(--color-background);
      color: var(--color-text);
      position: relative;
      overflow: hidden;
    }

    .hero-content {
      max-width: var(--container-width);
      z-index: 2;
      position: relative;
      text-align: center;
      backdrop-filter: blur(5px);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-xl);
      background: var(--color-surface);
      box-shadow: 0 10px 30px var(--color-shadow);
    }

    .title {
      font-size: calc(var(--font-size-xxl) * 1.5);
      margin-bottom: var(--spacing-md);
      font-weight: 700;
      line-height: 1.2;
    }

    .title.typing::after {
      content: '|';
      animation: blink 1s infinite;
    }

    .subtitle {
      font-size: var(--font-size-lg);
      margin-bottom: var(--spacing-lg);
      color: var(--color-text-secondary);
    }

    .skills-terminal {
      background: var(--color-surface);
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: 0 10px 30px var(--color-shadow);
    }

    .terminal-header {
      background: var(--color-surface-hover);
      padding: var(--spacing-sm);
      display: flex;
      gap: var(--spacing-xs);
    }

    .dot {
      width: var(--spacing-sm);
      height: var(--spacing-sm);
      border-radius: 50%;
      opacity: 0.8;
      transition: background-color var(--transition-duration) ease;
    }

    .dot:nth-child(1) { background: var(--color-terminal-dot-1, #ff5f56); }
    .dot:nth-child(2) { background: var(--color-terminal-dot-2, #ffbd2e); }
    .dot:nth-child(3) { background: var(--color-terminal-dot-3, #27c93f); }

    .terminal-content {
      padding: var(--spacing-lg);
      font-family: 'Fira Code', monospace;
      text-align: left;
    }

    .terminal-content ul {
      text-align: left;
      padding-left: var(--spacing-lg);
    }

    .project-carousel {
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
    }

    @media (max-width: 768px) {
      .project-carousel {
        opacity: 0.5;
      }

      .hero-content {
        max-width: 100%;
        text-align: center;
        margin: 0 auto;
      }

      .title {
        font-size: var(--font-size-xxl);
      }
    }

    @keyframes blink {
      50% { opacity: 0; }
    }

    .canvas-controls {
      position: fixed;
      z-index: 10;
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--color-surface);
      backdrop-filter: blur(5px);
      border-radius: var(--border-radius);
      transition: opacity var(--transition-duration) ease;
    }

    .canvas-controls:hover {
      opacity: 1;
    }

    .shape-controls {
      top: 10%;
      left: var(--spacing-lg);
      opacity: 0.6;
    }

    .color-controls {
      top: 10%;
      right: var(--spacing-lg);
      opacity: 0.6;
    }

    .control-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: var(--border-radius);
      background: var(--color-surface-hover);
      color: var(--color-text);
      cursor: pointer;
      transition: all var(--transition-duration) ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .control-btn:hover {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      transform: scale(1.1);
    }

    .control-btn.active {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      box-shadow: 0 0 15px var(--color-shadow);
    }

    .control-btn i {
      font-size: var(--font-size-lg);
    }

    @media (max-width: 768px) {
      .canvas-controls {
        transform: scale(0.8);
      }

      .shape-controls {
        top: var(--spacing-sm);
        left: var(--spacing-sm);
      }

      .color-controls {
        top: var(--spacing-sm);
        right: var(--spacing-sm);
      }
    }

    @media (max-width: 768px) {
      .hero-content {
        padding: var(--spacing-md);
        margin: 0 var(--spacing-sm);
        backdrop-filter: blur(10px);
      }

      .title {
        font-size: var(--font-size-xl);
        line-height: 1.3;
      }

      .subtitle {
        font-size: var(--font-size-md);
        margin-bottom: var(--spacing-md);
      }

      .skills-terminal {
        font-size: var(--font-size-sm);
      }

      .terminal-content {
        padding: var(--spacing-md);
      }

      .canvas-controls {
        transform: scale(0.7);
        opacity: 0.8;
      }

      .shape-controls {
        bottom: var(--spacing-lg);
        left: var(--spacing-sm);
        top: auto;
      }

      .color-controls {
        bottom: var(--spacing-lg);
        right: var(--spacing-sm);
        top: auto;
      }
    }

    @media (max-width: 480px) {
      .hero-content {
        padding: var(--spacing-sm);
      }

      .canvas-controls {
        transform: scale(0.6);
      }

      .title {
        font-size: var(--font-size-lg);
      }

      .subtitle {
        font-size: var(--font-size-sm);
      }
    }

    @media (orientation: landscape) and (max-height: 600px) {
      .hero-section {
        height: auto;
        min-height: 100vh;
        padding: var(--spacing-xl) 0;
      }

      .hero-content {
        margin: var(--spacing-xl) auto;
      }
    }
  `],
  animations: [
    trigger('heroAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('800ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('skillAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms 200ms ease-out', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('projectCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particles!: THREE.Points;
  private raycaster!: THREE.Raycaster;
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private clock: THREE.Clock = new THREE.Clock();
  private particleCount: number = 1000;
  private particleGeometry!: THREE.BufferGeometry;
  private destroy$ = new Subject<void>();
  private uniforms: { [key: string]: THREE.IUniform<any> } = {
    time: { value: 0 },
    mousePosition: { value: new THREE.Vector3() },
    mouseVelocity: { value: new THREE.Vector2(0, 0) },
    mouseForce: { value: 0.0 },
    resolution: { value: new THREE.Vector2() },
    colorCycle: { value: 0.0 },
    shapeType: { value: 0 }
  };
  
  animationState = 'in';
  isTyping = true;
  displayText = '';
  fullText = 'Building Modern Angular Solutions';
  skills = [
    'Angular Enterprise Architecture',
    'RxJS & State Management',
    'Performance Optimization',
    'Responsive UI/UX Design',
    'Testing & Quality Assurance'
  ];

  // Particle shape configurations
  particleShapes = [
    { id: 'hexagon', name: 'Hexagon', icon: 'fa-hexagon' },
    { id: 'star', name: 'Star', icon: 'fa-star' },
    { id: 'circle', name: 'Circle', icon: 'fa-circle' },
    { id: 'square', name: 'Square', icon: 'fa-square' }
  ];
  currentShape = 'hexagon';

  // Color scheme configurations
  colorSchemes = [
    { id: 'nature', name: 'Nature', icon: 'fa-leaf', colors: [0x4CAF50, 0x2196F3, 0xFFC107, 0xFF4081, 0x9C27B0] },
    { id: 'neon', name: 'Neon', icon: 'fa-bolt', colors: [0xFF1744, 0xD500F9, 0x00E5FF, 0x76FF03, 0xFFEA00] },
    { id: 'sunset', name: 'Sunset', icon: 'fa-sun', colors: [0xFF9800, 0xFF5722, 0xE91E63, 0x9C27B0, 0x673AB7] },
    { id: 'monochrome', name: 'Monochrome', icon: 'fa-adjust', colors: [0xFFFFFF, 0xCCCCCC, 0x999999, 0x666666, 0x333333] }
  ];
  currentColorScheme = 'nature';

  private isMobile = false;
  private readonly MOBILE_PARTICLE_COUNT = 500;
  private readonly DESKTOP_PARTICLE_COUNT = 2000;

  ngOnInit() {
    this.checkDeviceType();
    this.animateText();

    // Handle device orientation changes
    fromEvent(window, 'orientationchange')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        setTimeout(() => {
          this.onWindowResize();
          this.checkDeviceType();
          this.updateParticleSystem();
        }, 100);
      });
  }

  ngAfterViewInit() {
    console.log('Initializing Three.js scene...');
    this.initThreeJS();
    console.log('Creating particle system...');
    this.createParticleSystem();
    console.log('Setting up mouse interaction...');
    this.setupMouseInteraction();
    console.log('Starting animation loop...');
    this.animate();

    // Handle window resize
    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(250),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.onWindowResize();
      });

    // Handle scroll
    fromEvent(window, 'scroll')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(50),
        map(() => window.scrollY),
        distinctUntilChanged()
      )
      .subscribe(scrollPos => {
        this.updateSceneOnScroll(scrollPos);
      });
  }

  private animateText() {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= this.fullText.length) {
        this.displayText = this.fullText.slice(0, currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
        this.isTyping = false;
      }
    }, 100);
  }

  private checkDeviceType() {
    this.isMobile = window.innerWidth <= 768;
    this.particleCount = this.isMobile ? this.MOBILE_PARTICLE_COUNT : this.DESKTOP_PARTICLE_COUNT;
  }

  private initThreeJS() {
    // Scene setup
    this.scene = new THREE.Scene();
    
    // Camera setup with wider field of view and better position
    const fov = 75;
    const width = window.innerWidth;  // Use full window width
    const height = window.innerHeight;
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    this.camera.position.z = this.isMobile ? 40 : 30;  // Move camera further back
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    if (this.isMobile) {
      this.renderer.setPixelRatio(1);
      this.renderer.setSize(width, height, false); // false to avoid setting canvas style
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(width, height);
    }
    this.renderer.setClearColor(0x000000, 0); // Transparent background

    console.log('Canvas dimensions:', width, height);
    console.log('Camera position:', this.camera.position);
    console.log('Renderer initialized:', this.renderer.getContext());

    // Raycaster setup
    this.raycaster = new THREE.Raycaster();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    const directionalLight = new THREE.DirectionalLight(0x4CAF50, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(ambientLight, directionalLight);
  }

  private createParticleSystem() {
    this.particleCount = 2000;
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    const initialPositions = new Float32Array(this.particleCount * 3);
    const velocities = new Float32Array(this.particleCount * 3);
    const phases = new Float32Array(this.particleCount);

    const spread = this.isMobile ? 30 : 40;
    const colorPalette = [
      new THREE.Color(0x4CAF50), // Green
      new THREE.Color(0x2196F3), // Blue
      new THREE.Color(0xFFC107), // Amber
      new THREE.Color(0xFF4081), // Pink
      new THREE.Color(0x9C27B0)  // Purple
    ];

    for (let i = 0; i < this.particleCount; i++) {
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;

      // Random velocities for particle motion
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Random phase offset for wave motion
      phases[i] = Math.random() * Math.PI * 2;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = this.isMobile ? 
        (Math.random() * 0.3 + 0.1) : // Smaller particles on mobile
        (Math.random() * 0.5 + 0.1);
    }

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.particleGeometry.setAttribute('initialPosition', new THREE.BufferAttribute(initialPositions, 3));
    this.particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    this.particleGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const vertexShader = `
      uniform float time;
      uniform vec3 mousePosition;
      uniform vec2 mouseVelocity;
      uniform float mouseForce;
      uniform vec2 resolution;
      uniform float colorCycle;
      uniform int shapeType;
      
      attribute float size;
      attribute vec3 aColor;
      attribute vec3 initialPosition;
      attribute vec3 velocity;
      attribute float phase;
      
      varying vec3 vColor;
      varying float vDistance;
      varying float vPhase;

      // Noise functions
      ${this.getNoiseFunction()}

      // Color transition function
      vec3 cycleColor(vec3 color, float cycle) {
        float angle = cycle * 6.28318;
        float s = sin(angle);
        float c = cos(angle);
        mat3 colorMatrix = mat3(
          vec3(c * 0.5 + 0.5, -s * 0.5, s * 0.5),
          vec3(s * 0.5, c * 0.5 + 0.5, -s * 0.5),
          vec3(-s * 0.5, s * 0.5, c * 0.5 + 0.5)
        );
        return colorMatrix * color;
      }

      float hexagon(vec2 p) {
        vec2 q = abs(p);
        return max(abs(q.y * 0.866025 + q.x * 0.5), q.x) - 0.5;
      }

      float star(vec2 p) {
        float angle = atan(p.y, p.x);
        float radius = length(p);
        float star = 0.5 + 0.2 * sin(5.0 * angle);
        return radius - star;
      }

      float circle(vec2 p) {
        return length(p) - 0.5;
      }

      float square(vec2 p) {
        vec2 d = abs(p) - vec2(0.4);
        return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
      }

      void main() {
        vColor = cycleColor(aColor, colorCycle);
        vPhase = phase;
        
        // Multiple wave patterns
        float noise1 = snoise(vec2(initialPosition.x * 0.05 + time * 0.2, initialPosition.z * 0.05 + time * 0.2));
        float noise2 = snoise(vec2(initialPosition.z * 0.04 - time * 0.15, initialPosition.x * 0.04 - time * 0.15));
        float noise3 = snoise(vec2(initialPosition.y * 0.06 + time * 0.25, initialPosition.z * 0.06 + time * 0.25));
        
        vec3 newPosition = initialPosition;
        newPosition.y += noise1 * 2.0 + sin(time * 2.0 + phase) * 0.5;
        newPosition.x += noise2 * 1.5;
        newPosition.z += noise3 * 1.5;
        
        // Velocity-based motion
        newPosition += velocity * time * 10.0;
        
        // Interactive force field with velocity influence
        vec3 toMouse = mousePosition - newPosition;
        float distanceToMouse = length(toMouse);
        float force = 1.0 - smoothstep(0.0, 15.0, distanceToMouse);
        
        // Add mouse velocity influence
        vec3 mouseInfluence = vec3(mouseVelocity.x, mouseVelocity.y, 0.0) * 2.0;
        newPosition += normalize(toMouse + mouseInfluence) * force * mouseForce;
        
        // Position calculation
        vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Dynamic point size with distance and velocity factors
        float velocityFactor = length(velocity) * 50.0;
        float pointSize = size * (300.0 / -mvPosition.z);
        pointSize *= (1.0 + force * 2.0 + velocityFactor);
        gl_PointSize = pointSize;
        
        vDistance = force;
      }
    `;

    const fragmentShader = `
      uniform int shapeType;
      varying vec3 vColor;
      varying float vDistance;
      varying float vPhase;

      float hexagon(vec2 p) {
        vec2 q = abs(p);
        return max(abs(q.y * 0.866025 + q.x * 0.5), q.x) - 0.5;
      }

      float star(vec2 p) {
        float angle = atan(p.y, p.x);
        float radius = length(p);
        float star = 0.5 + 0.2 * sin(5.0 * angle);
        return radius - star;
      }

      float circle(vec2 p) {
        return length(p) - 0.5;
      }

      float square(vec2 p) {
        vec2 d = abs(p) - vec2(0.4);
        return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
      }

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist;
        
        if (shapeType == 0) dist = hexagon(center);
        else if (shapeType == 1) dist = star(center);
        else if (shapeType == 2) dist = circle(center);
        else dist = square(center);
        
        if (dist > 0.0) discard;
        
        float alpha = 1.0 - smoothstep(-0.1, 0.0, dist);
        float glowStrength = 0.5 + 0.5 * sin(vPhase + vDistance * 5.0);
        vec3 glowColor = mix(vColor, vec3(1.0), vDistance * glowStrength);
        
        alpha *= 0.8 + 0.2 * sin(vPhase + vDistance * 10.0);
        
        gl_FragColor = vec4(glowColor, alpha);
      }
    `;

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(this.particleGeometry, particleMaterial);
    this.scene.add(this.particles);
  }

  private getNoiseFunction(): string {
    return `
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,
                           0.366025403784439,
                           -0.577350269189626,
                           0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
    `;
  }

  private setupMouseInteraction() {
    let lastMousePosition = { x: 0, y: 0 };
    let mouseVelocity = { x: 0, y: 0 };

    fromEvent<MouseEvent>(this.canvasRef.nativeElement, 'mousemove')
      .pipe(
        takeUntil(this.destroy$),
        map((event: MouseEvent) => {
          const rect = this.canvasRef.nativeElement.getBoundingClientRect();
          return {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((event.clientY - rect.top) / rect.height) * 2 + 1
          };
        })
      )
      .subscribe(({ x, y }) => {
        // Calculate mouse velocity
        mouseVelocity = {
          x: x - lastMousePosition.x,
          y: y - lastMousePosition.y
        };
        lastMousePosition = { x, y };

        this.mouse.x = x;
        this.mouse.y = y;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersection = new THREE.Vector3();
        this.raycaster.ray.at(15, intersection);
        
        const material = this.particles.material as THREE.ShaderMaterial;
        material.uniforms['mousePosition'].value.copy(intersection);
        material.uniforms['mouseVelocity'].value.set(mouseVelocity.x, mouseVelocity.y);
      });
  }

  private animate() {
    if (this.destroy$.closed) return;
    
    requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();
    const material = this.particles.material as THREE.ShaderMaterial;

    // Update uniforms
    material.uniforms['time'].value = time;
    material.uniforms['colorCycle'].value = (time * 0.1) % 1.0;
    
    // Smooth mouse force transition
    const targetForce = this.mouse.x !== 0 || this.mouse.y !== 0 ? 3.0 : 0.0;
    material.uniforms['mouseForce'].value += (targetForce - material.uniforms['mouseForce'].value) * 0.1;

    // Dynamic rotation based on mouse position and velocity
    if (this.isMobile) {
      const rotationSpeed = 0.05; // Slower rotation on mobile
      this.particles.rotation.y = Math.sin(time * rotationSpeed) * 0.05;
      this.particles.rotation.x = Math.cos(time * rotationSpeed) * 0.05;
    } else {
      const rotationSpeed = 0.1;
      this.particles.rotation.y = Math.sin(time * rotationSpeed) * 0.1 + this.mouse.x * 0.2;
      this.particles.rotation.x = Math.cos(time * rotationSpeed) * 0.1 + this.mouse.y * 0.2;
    }
    
    // Throttle frame rate on mobile
    if (!this.isMobile || this.clock.getElapsedTime() % 2 === 0) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private updateSceneOnScroll(scrollPos: number) {
    const normalizedScroll = scrollPos / window.innerHeight;
    if (this.particles) {
      this.particles.rotation.x = normalizedScroll * Math.PI / 4;
    }
  }

  private onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.checkDeviceType();

    console.log('Resizing to:', width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.isMobile) {
      this.renderer.setPixelRatio(1);
      this.renderer.setSize(width, height, false);
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(width, height);
    }
    this.uniforms['resolution'].value.set(width, height);
  }

  private updateParticleSystem() {
    if (!this.scene || !this.particles) return;

    // Remove existing particles
    this.scene.remove(this.particles);
    this.particleGeometry.dispose();
    (this.particles.material as THREE.ShaderMaterial).dispose();

    // Recreate particle system with new count
    this.createParticleSystem();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up Three.js resources
    this.scene.remove(this.particles);
    this.particleGeometry.dispose();
    (this.particles.material as THREE.ShaderMaterial).dispose();
    this.renderer.dispose();
  }

  changeParticleShape(shapeId: string) {
    this.currentShape = shapeId;
    const material = this.particles.material as THREE.ShaderMaterial;
    material.uniforms['shapeType'].value = this.particleShapes.findIndex(s => s.id === shapeId);
    material.needsUpdate = true;
  }

  changeColorScheme(schemeId: string) {
    this.currentColorScheme = schemeId;
    const scheme = this.colorSchemes.find(s => s.id === schemeId);
    if (!scheme) return;

    const colors = new Float32Array(this.particleCount * 3);
    for (let i = 0; i < this.particleCount; i++) {
      const color = new THREE.Color(scheme.colors[Math.floor(Math.random() * scheme.colors.length)]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    this.particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    (this.particleGeometry.attributes['aColor'] as THREE.BufferAttribute).needsUpdate = true;
  }
}