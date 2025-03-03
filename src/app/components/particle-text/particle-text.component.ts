import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  originalX: number;
originalY: number;
}

interface ParticleSettings {
  minSize: number;
  maxSize: number;
  speed: number;
  particleDensity: number;
  gravitationalForce: number;
  mouseRepelForce: number;
  mouseRepelRadius: number;
  fontFamily: string;
}

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
}

@Component({
  selector: 'app-particle-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="particle-text-container">
      <canvas #particleCanvas></canvas>
      <div class="controls-wrapper">
        <div class="controls">
          <div class="control-group text-input">
            <input type="text" 
                   [(ngModel)]="text" 
                   (input)="updateText()"
                   placeholder="Enter text..."
                   maxlength="50">
          </div>
          
          <div class="control-group animation-controls">
            <select [(ngModel)]="selectedEffect" (change)="applyEffect()">
              <option value="explode">Explode</option>
              <option value="spiral">Spiral</option>
              <option value="wave">Wave</option>
              <option value="vortex">Vortex</option>
              <option value="bounce">Bounce</option>
              <option value="scatter">Scatter</option>
              <option value="tornado">Tornado</option>
              <option value="pulse">Pulse</option>
            </select>
            <button (click)="applyEffect()" class="primary">Animate</button>
            <button (click)="reformText()">Reset</button>
          </div>
          
          <div class="control-group color-controls">
            <div class="color-picker">
              <input type="color" [(ngModel)]="customColor" (change)="addCustomColor()">
              <button (click)="changeColor()" class="icon-btn">🎨</button>
            </div>
            <button (click)="toggleRainbowMode()" 
                    [class.active]="rainbowMode" 
                    class="rainbow-btn">
              🌈 Rainbow
            </button>
          </div>

          <div class="control-group style-controls">
            <select [(ngModel)]="settings.fontFamily" (change)="updateText()">
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier">Courier</option>
              <option value="Impact">Impact</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Papyrus">Papyrus</option>
              <option value="Verdana">Verdana</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
              <option value="Georgia">Georgia</option>
              <option value="Copperplate">Copperplate</option>
              <option value="Brush Script MT">Brush Script MT</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./particle-text.component.scss']
})
export class ParticleTextComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId: number = 0;
  private mouse = { x: 0, y: 0 };
  private isExploded = false;
  text = 'HELLO';
  private currentColorIndex = 0;
  private colors = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#ffeead',
    '#ff9999'
  ];

   settings: ParticleSettings = {
    minSize: 1,
    maxSize: 3,
    speed: 0.1,
    particleDensity: 40,
    gravitationalForce: 0.1,
    mouseRepelForce: 5,
    mouseRepelRadius: 100,
    fontFamily: 'Arial'

  };

   textStyle: TextStyle = {
    fontSize: 200,
    fontFamily: 'Arial',
    bold: true,
    italic: false
  };

  selectedEffect: string = 'explode';
  customColor: string = '#ffffff';
  rainbowMode: boolean = false;
   rainbowSpeed: number = 2; // Adjusted for horizontal flow
   hue: number = 0;
   private rainbowOffset: number = 0;

  private themeSubscription: Subscription | undefined;
  private isDarkTheme: boolean = false;

  constructor(private ngZone: NgZone, private themeService: ThemeService) {}

  ngAfterViewInit() {
    this.initCanvas();
    this.createParticles();
    this.setupEventListeners();
    this.setupThemeSubscription();
    this.animate();
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private createParticles() {
    this.particles = [];
    const canvas = this.canvasRef.nativeElement;
    
    // Calculate font size based on both width and height constraints
    const maxWidth = canvas.width * 0.8;
    const maxHeight = canvas.height * 0.3;
    const widthBasedSize = maxWidth / (this.text.length);
    const heightBasedSize = maxHeight;
    const fontSize = Math.min(widthBasedSize, heightBasedSize, 200);
    
    this.ctx.font = `bold ${fontSize}px Arial`;
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const textMetrics = this.ctx.measureText(this.text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    this.ctx.fillText(this.text, centerX, centerY);
    
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Reduce particle spacing to create more particles
    const particleSpacing = Math.max(1, Math.floor(fontSize / 40)); // Changed from 20 to 40
    
    for (let y = 0; y < canvas.height; y += particleSpacing) {
        for (let x = 0; x < canvas.width; x += particleSpacing) {
            const index = (y * canvas.width + x) * 4;
            const alpha = pixels[index + 3];
            
            if (alpha > 128) {
                const boundedX = Math.min(Math.max(x, 0), canvas.width);
                const boundedY = Math.min(Math.max(y, 0), canvas.height);
                
                this.particles.push({
                    x: boundedX,
                    y: boundedY,
                    targetX: boundedX,
                    targetY: boundedY,
                    size: Math.min(particleSpacing / 2, 2), // Reduced max size from 3 to 2
                    color: this.colors[this.currentColorIndex],
                    velocity: { x: 0, y: 0 },
                    originalX: boundedX,
                    originalY: boundedY
                });
            }
        }
    }
    
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.canvasRef.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  private onWindowResize() {
    this.resizeCanvas();
    this.createParticles();
  }

  private onMouseMove(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;

    if (!this.isExploded) {
      this.particles.forEach(particle => {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 100;
          
          particle.x -= Math.cos(angle) * force * 5;
          particle.y -= Math.sin(angle) * force * 5;
        }
      });
    }
  }

  updateText() {
    if (this.text.length > 0) {
        // Call the existing onWindowResize function that we know works
        this.onWindowResize();
    }
  }

  explodeText() {
    this.isExploded = true;
    this.particles.forEach(particle => {
      const angle = Math.random() * Math.PI * 2;
      const force = Math.random() * 10 + 5;
      particle.velocity.x = Math.cos(angle) * force;
      particle.velocity.y = Math.sin(angle) * force;
    });
  }

  reformText() {
    this.isExploded = false;
    this.particles.forEach(particle => {
      particle.velocity.x = 0;
      particle.velocity.y = 0;
      particle.targetX = particle.originalX;
      particle.targetY = particle.originalY;
    });
  }

  changeColor() {
    this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
    this.particles.forEach(particle => {
      particle.color = this.colors[this.currentColorIndex];
    });
  }

   applyEffect() {
    switch (this.selectedEffect) {
      case 'spiral':
        this.spiralEffect();
        break;
      case 'wave':
        this.waveEffect();
        break;
      case 'vortex':
        this.vortexEffect();
        break;
      case 'bounce':
        this.bounceEffect();
        break;
      case 'scatter':
        this.scatterEffect();
        break;
      case 'tornado':
        this.tornadoEffect();
        break;
      case 'pulse':
        this.pulseEffect();
        break;
      default:
        this.explodeText();
    }
  }

   spiralEffect() {
    const centerX = this.canvasRef.nativeElement.width / 2;
    const centerY = this.canvasRef.nativeElement.height / 2;
    
    this.particles.forEach((particle, i) => {
      const angle = i * 0.1;
      const radius = i * 0.5;
      particle.targetX = centerX + Math.cos(angle) * radius;
      particle.targetY = centerY + Math.sin(angle) * radius;
    });
  }

   waveEffect() {
    this.particles.forEach((particle, i) => {
      particle.targetY = particle.originalY + Math.sin(i * 0.1) * 50;
    });
  }

   vortexEffect() {
    const centerX = this.canvasRef.nativeElement.width / 2;
    const centerY = this.canvasRef.nativeElement.height / 2;
    
    this.particles.forEach(particle => {
      const dx = particle.x - centerX;
      const dy = particle.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) + 0.1; // Add rotation

      particle.targetX = centerX + Math.cos(angle) * distance * 0.95;
      particle.targetY = centerY + Math.sin(angle) * distance * 0.95;
    });
  }

  bounceEffect() {
    this.particles.forEach(particle => {
      particle.velocity.y = -15 - Math.random() * 5;
      particle.velocity.x = (Math.random() - 0.5) * 10;
    });
    this.isExploded = true;
  }

  scatterEffect() {
    const centerX = this.canvasRef.nativeElement.width / 2;
    const centerY = this.canvasRef.nativeElement.height / 2;
    
    this.particles.forEach(particle => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 200 + 100;
      particle.targetX = centerX + Math.cos(angle) * distance;
      particle.targetY = centerY + Math.sin(angle) * distance;
    });
  }

  tornadoEffect() {
    const centerX = this.canvasRef.nativeElement.width / 2;
    const time = Date.now() * 0.001;
    
    this.particles.forEach((particle, i) => {
      const angle = i * 0.1 + time;
      const radius = Math.sin(i * 0.05) * 100 + 150;
      particle.targetX = centerX + Math.cos(angle) * radius;
      particle.targetY = particle.originalY + Math.sin(angle * 2) * 20;
    });
  }

  pulseEffect() {
    const centerX = this.canvasRef.nativeElement.width / 2;
    const centerY = this.canvasRef.nativeElement.height / 2;
    
    this.particles.forEach(particle => {
      const dx = particle.originalX - centerX;
      const dy = particle.originalY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const pulse = Math.sin(Date.now() * 0.005) * 50;
      
      particle.targetX = centerX + Math.cos(angle) * (distance + pulse);
      particle.targetY = centerY + Math.sin(angle) * (distance + pulse);
    });
  }

   addCustomColor() {
    this.colors.push(this.customColor);
    this.currentColorIndex = this.colors.length - 1;
    this.changeColor();
  }

   toggleRainbowMode() {
    this.rainbowMode = !this.rainbowMode;
  }

  private setupThemeSubscription() {
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
      // Update colors based on theme
      this.colors = this.isDarkTheme ? [
        '#ff6b6b',
        '#4ecdc4',
        '#45b7d1',
        '#96ceb4',
        '#ffeead',
        '#ff9999'
      ] : [
        '#ff3366',
        '#2196f3',
        '#673ab7',
        '#4caf50',
        '#ff9800',
        '#795548'
      ];
      if (!this.rainbowMode) {
        this.particles.forEach(particle => {
          particle.color = this.colors[this.currentColorIndex];
        });
      }
    });
  }

  private animate() {
    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
      
      this.ctx.fillStyle = this.isDarkTheme ? 
        'rgba(0, 0, 0, 0.1)' : 
        'rgba(255, 255, 255, 0.1)';
      this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        if (this.rainbowMode) {
        this.rainbowOffset -= this.rainbowSpeed; // Negative for right to left, positive for left to right
      }

      this.particles.forEach((particle) => {
        if (this.isExploded) {
          particle.velocity.y += this.settings.gravitationalForce;
          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;
        } else {
          particle.x += (particle.targetX - particle.x) * this.settings.speed;
          particle.y += (particle.targetY - particle.y) * this.settings.speed;
        }

        this.ctx.fillStyle = this.rainbowMode ? 
          `hsl(${((particle.x / this.canvasRef.nativeElement.width * 360) + this.rainbowOffset) % 360}, 100%, 50%)` : 
          particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.canvasRef.nativeElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }
}