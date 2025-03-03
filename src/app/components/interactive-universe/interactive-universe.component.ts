import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, OnDestroy, NgZone } from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';

@Component({
  selector: 'app-interactive-universe',
  template: `
    <section class="universe-container">
      <canvas #universeCanvas></canvas>
      <div class="overlay-text">
        <h2>Interactive Universe</h2>
        <p>Move your cursor to interact with the particles</p>
        <div class="controls">
          <button (click)="toggleGalaxyMode()">Toggle Galaxy Mode</button>
          <button (click)="explodeParticles()">Explode</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .universe-container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .overlay-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 1;
      pointer-events: none;
      text-shadow: 0 0 10px rgba(0,0,0,0.5);
    }

    h2 {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      font-size: 1.2rem;
      opacity: 0.8;
      margin-bottom: 2rem;
    }

    .controls {
      pointer-events: auto;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class InteractiveUniverseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('universeCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private animationFrameId: number = 0;
  private isGalaxyMode: boolean = false;
  private originalPositions: Float32Array | null = null;

  private readonly PARTICLE_COUNT = 5000;
  private readonly PARTICLE_SIZE = 0.05;
  private readonly ANIMATION_SPEED = 0.001;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.initThreeJS();
      this.createParticles();
      this.setupEventListeners();
      this.animate();
    });
  }

  private initThreeJS(): void {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private createParticles(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.PARTICLE_COUNT * 3);
    const colors = new Float32Array(this.PARTICLE_COUNT * 3);

    for (let i = 0; i < this.PARTICLE_COUNT * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      colors[i] = Math.random();
      colors[i + 1] = Math.random();
      colors[i + 2] = Math.random();
    }

    this.originalPositions = positions.slice();

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: this.PARTICLE_SIZE,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private setupEventListeners(): void {
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.particles);

    if (intersects.length > 0) {
      const positions = this.particles.geometry.getAttribute('position')['array'] as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const distance = Math.sqrt(
          Math.pow(positions[i] - intersects[0].point.x, 2) +
          Math.pow(positions[i + 1] - intersects[0].point.y, 2) +
          Math.pow(positions[i + 2] - intersects[0].point.z, 2)
        );

        if (distance < 1) {
          const currentX = positions[i];
          const currentY = positions[i + 1];
          const currentZ = positions[i + 2];
          
          const target = { value: 0 };
          gsap.to(target, {
            value: 1,
            duration: 1,
            ease: "elastic.out(1, 0.3)",
            onUpdate: () => {
              positions[i] = currentX + (Math.random() - 0.5) * 0.2 * target.value;
              positions[i + 1] = currentY + (Math.random() - 0.5) * 0.2 * target.value;
              positions[i + 2] = currentZ + (Math.random() - 0.5) * 0.2 * target.value;
              this.particles.geometry.attributes['position'].needsUpdate = true;
            }
          });
        }
      }
    }
  }

  toggleGalaxyMode(): void {
    this.isGalaxyMode = !this.isGalaxyMode;
    const positions = this.particles.geometry.getAttribute('position')['array'] as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const currentX = positions[i];
      const currentY = positions[i + 1];
      const currentZ = positions[i + 2];

      if (this.isGalaxyMode) {
        const radius = Math.random() * 3 + 1;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 0.5;

        const targetX = Math.cos(angle) * radius;
        const targetY = height;
        const targetZ = Math.sin(angle) * radius;

        const target = { value: 0 };
        gsap.to(target, {
          value: 1,
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => {
            positions[i] = currentX + (targetX - currentX) * target.value;
            positions[i + 1] = currentY + (targetY - currentY) * target.value;
            positions[i + 2] = currentZ + (targetZ - currentZ) * target.value;
            this.particles.geometry.attributes['position'].needsUpdate = true;
          }
        });
      } else if (this.originalPositions) {
        const target = { value: 0 };
        gsap.to(target, {
          value: 1,
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => {
            positions[i] = currentX + (this.originalPositions![i] - currentX) * target.value;
            positions[i + 1] = currentY + (this.originalPositions![i + 1] - currentY) * target.value;
            positions[i + 2] = currentZ + (this.originalPositions![i + 2] - currentZ) * target.value;
            this.particles.geometry.attributes['position'].needsUpdate = true;
          }
        });
      }
    }
  }

  explodeParticles(): void {
    const positions = this.particles.geometry.getAttribute('position')['array'] as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const currentX = positions[i];
      const currentY = positions[i + 1];
      const currentZ = positions[i + 2];

      const direction = new THREE.Vector3(currentX, currentY, currentZ).normalize();
      const target = { value: 0 };

      gsap.to(target, {
        value: 1,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          positions[i] = currentX + direction.x * 20 * target.value;
          positions[i + 1] = currentY + direction.y * 20 * target.value;
          positions[i + 2] = currentZ + direction.z * 20 * target.value;
          this.particles.geometry.attributes['position'].needsUpdate = true;
        },
        onComplete: () => {
          if (this.originalPositions) {
            const returnTarget = { value: 0 };
            gsap.to(returnTarget, {
              value: 1,
              duration: 2,
              ease: "elastic.out(1, 0.3)",
              onUpdate: () => {
                positions[i] = positions[i] + (this.originalPositions![i] - positions[i]) * returnTarget.value;
                positions[i + 1] = positions[i + 1] + (this.originalPositions![i + 1] - positions[i + 1]) * returnTarget.value;
                positions[i + 2] = positions[i + 2] + (this.originalPositions![i + 2] - positions[i + 2]) * returnTarget.value;
                this.particles.geometry.attributes['position'].needsUpdate = true;
              }
            });
          }
        }
      });
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.particles.rotation.x += this.ANIMATION_SPEED;
    this.particles.rotation.y += this.ANIMATION_SPEED;

    const positions = this.particles.geometry.getAttribute('position')['array'] as Float32Array;
    const colors = this.particles.geometry.getAttribute('color')['array'] as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      colors[i] = Math.sin(Date.now() * 0.001 + positions[i]) * 0.5 + 0.5;
      colors[i + 1] = Math.cos(Date.now() * 0.002 + positions[i + 1]) * 0.5 + 0.5;
      colors[i + 2] = Math.sin(Date.now() * 0.003 + positions[i + 2]) * 0.5 + 0.5;
    }

    this.particles.geometry.attributes['color'].needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    this.renderer.dispose();
  }
} 