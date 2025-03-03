import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { SkillsService, Skill } from '../../services/skills.service';

@Component({
  selector: 'app-interactive-skills',
  template: `
    <section class="skills-section">
      <div class="skills-grid">
        <div 
          *ngFor="let skill of skills" 
          class="skill-item"
          [class.active]="selectedSkill?.name === skill.name"
          (click)="selectSkill(skill)"
          [attr.aria-label]="'Select ' + skill.name"
        >
          <i [class]="skill.icon || 'fas fa-code'"></i>
          <span>{{ skill.name }}</span>
        </div>
      </div>

      <ng-container *ngIf="selectedSkill">
        <div class="skill-details">
          <div class="skill-header">
            <h3>{{ selectedSkill!.name }}</h3>
          </div>
          <div class="skill-level">
            <div class="level-bar">
              <div class="level-fill" [style.width.%]="selectedSkill!.level"></div>
            </div>
            <span>{{ selectedSkill!.level }}%</span>
          </div>
          <p>{{ selectedSkill!.description }}</p>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .skills-section {
      padding: var(--spacing-xl) 0;
      background-color: var(--color-surface);
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .skill-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-md);
      background-color: var(--color-card-background);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all var(--transition-duration) ease;

      &:hover, &.active {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--color-shadow);
      }

      i {
        font-size: 2rem;
        margin-bottom: var(--spacing-sm);
        color: var(--color-primary);
      }

      span {
        text-align: center;
        font-size: var(--font-size-sm);
      }
    }

    .skill-details {
      background-color: var(--color-card-background);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius);
      animation: fadeIn 0.3s ease-out;

      h3 {
        color: var(--color-primary);
        margin-bottom: var(--spacing-md);
      }

      .skill-level {
        margin: var(--spacing-md) 0;
      }

      .level-bar {
        height: 8px;
        background-color: var(--color-surface);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--spacing-xs);
      }

      .level-fill {
        height: 100%;
        background-color: var(--color-primary);
        transition: width 0.5s ease-out;
      }

      p {
        color: var(--color-text-secondary);
        line-height: 1.6;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class InteractiveSkillsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('skillsCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private skillSpheres: THREE.Mesh[] = [];
  private animationFrameId: number = 0;

  selectedSkill: Skill | null = null;
  currentCategory: string = 'all';
  categories = ['all', 'frontend', 'backend', 'tools', 'soft'];

  private skills: Skill[] = [];

  constructor(private ngZone: NgZone, private skillsService: SkillsService) {}

  ngAfterViewInit() {
    this.initThreeJS();
    this.createSkillSpheres();
    this.setupEventListeners();
    this.animate();
  }

  private initThreeJS() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 20;
    this.controls.minDistance = 5;
  }

  private createSkillSpheres() {
    this.skillSpheres = [];
    const geometry = new THREE.SphereGeometry(1, 32, 32);

    this.skills.forEach((skill, index) => {
      const material = new THREE.MeshPhongMaterial({
        color: this.getColorForCategory(skill.category),
        transparent: true,
        opacity: 0.8,
        emissive: this.getColorForCategory(skill.category),
        emissiveIntensity: 0.2
      });

      const sphere = new THREE.Mesh(geometry, material);
      
      // Position spheres in a spiral
      const angle = index * 0.5;
      const radius = 8;
      sphere.position.x = Math.cos(angle) * radius;
      sphere.position.y = Math.sin(angle) * radius;
      sphere.position.z = (index - this.skills.length / 2) * 0.5;

      sphere.userData = { skill };
      this.skillSpheres.push(sphere);
      this.scene.add(sphere);
    });

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);
  }

  private getColorForCategory(category: string): number {
    const colors = {
      frontend: 0x6b5b95,
      backend: 0x45b7d1,
      tools: 0xff7f50,
      soft: 0x98fb98
    };
    return colors[category as keyof typeof colors] || 0xffffff;
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.canvasRef.nativeElement.addEventListener('click', this.onCanvasClick.bind(this));
    this.canvasRef.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onCanvasClick(event: MouseEvent) {
    this.updateMousePosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.skillSpheres);
    if (intersects.length > 0) {
      const skill = intersects[0].object.userData['skill'] as Skill;
      this.selectedSkill = skill;
      
      // Animate the selected sphere
      gsap.to(intersects[0].object.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }
  }

  private onMouseMove(event: MouseEvent) {
    this.updateMousePosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.skillSpheres);
    this.canvasRef.nativeElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';

    // Scale effect on hover
    this.skillSpheres.forEach(sphere => {
      if (intersects.length > 0 && intersects[0].object === sphere) {
        if (sphere.scale.x === 1) {
          gsap.to(sphere.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.3 });
        }
      } else if (sphere.scale.x > 1) {
        gsap.to(sphere.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      }
    });
  }

  private updateMousePosition(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  filterByCategory(category: string) {
    this.currentCategory = category;
    this.selectedSkill = null;

    this.skillSpheres.forEach(sphere => {
      const skill = sphere.userData['skill'] as Skill;
      const visible = category === 'all' || skill.category === category;

      gsap.to(sphere.material, {
        opacity: visible ? 0.8 : 0.2,
        duration: 0.5
      });

      if (visible) {
        gsap.to(sphere.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.5
        });
      } else {
        gsap.to(sphere.scale, {
          x: 0.5,
          y: 0.5,
          z: 0.5,
          duration: 0.5
        });
      }
    });
  }

  private animate() {
    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(() => this.animate());

      this.skillSpheres.forEach(sphere => {
        sphere.rotation.x += 0.005;
        sphere.rotation.y += 0.005;
      });

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.canvasRef.nativeElement.removeEventListener('click', this.onCanvasClick.bind(this));
    this.canvasRef.nativeElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
    
    this.controls.dispose();
    this.renderer.dispose();
  }

  ngOnInit(): void {
    this.skills = this.skillsService.getSkills();
    if (this.skills.length > 0) {
      this.selectSkill(this.skills[0]);
    }
  }

  selectSkill(skill: Skill): void {
    this.selectedSkill = skill;
  }
} 