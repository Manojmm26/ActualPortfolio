import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, OnDestroy, NgZone } from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-digital-rain',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="digital-rain-container">
      <canvas #digitalRainCanvas></canvas>
      <div class="overlay-content">
        <h2>Digital Rain</h2>
        <p>Interactive Matrix-style visualization</p>
        <div class="controls">
          <button (click)="toggleColor()">Toggle Color Mode</button>
          <button (click)="toggleSpeed()">Change Speed</button>
          <button (click)="toggleDirection()">Toggle Direction</button>
          <div class="control-group">
            <label>Font Size:</label>
            <input type="range" 
                   [(ngModel)]="fontSize" 
                   (input)="updateFontSize()"
                   min="10" max="30" step="2">
          </div>
          <div class="control-group">
            <label>Density:</label>
            <input type="range" 
                   [(ngModel)]="density" 
                   (input)="updateDensity()"
                   min="1" max="3" step="0.1">
          </div>
          <div class="control-group">
            <label>Trail Opacity:</label>
            <input type="range" 
                   [(ngModel)]="trailOpacity" 
                   (input)="updateTrailOpacity()"
                   min="0.01" max="0.2" step="0.01">
          </div>
          <div class="control-group">
            <label>Angle:</label>
            <input type="range" 
                   [(ngModel)]="angle" 
                   (input)="updateAngle()"
                   min="-90" max="90" step="5">
            <span>{{angle}}°</span>
          </div>
          <input type="text" 
                 [(ngModel)]="customText" 
                 (input)="updateText()"
                 placeholder="Enter custom text...">
        </div>
        <div class="advanced-controls">
          <div class="control-group">
            <label>Character Set:</label>
            <select [(ngModel)]="selectedCharacterSet" (change)="updateCharacterSet()">
              <option value="matrix">Matrix</option>
              <option value="binary">Binary</option>
              <option value="japanese">Japanese</option>
            </select>
          </div>
          <div class="control-group">
            <label>Effect Mode:</label>
            <select [(ngModel)]="effectMode" (change)="updateEffectMode()">
              <option value="none">None</option>
              <option value="glitch">Glitch</option>
              <option value="pulse">Pulse</option>
              <option value="rainbow">Rainbow Wave</option>
            </select>
          </div>
          <div class="control-group">
            <label>Mouse Interaction:</label>
            <select [(ngModel)]="mouseMode" (change)="updateMouseMode()">
              <option value="none">None</option>
              <option value="repel">Repel</option>
              <option value="attract">Attract</option>
              <option value="explode">Explode</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .digital-rain-container {
      position: relative;
      width: 100%;
      height: 100vh;
      background: #000;
      overflow: hidden;
    }

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .overlay-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #0f0;
      z-index: 1;
      text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
      width: 90%;
      max-width: 1200px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 20px;
      background: rgba(0, 0, 0, 0.18);
      border-radius: 8px;
    }

    h2 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-family: 'Courier New', monospace;
    }

    p {
      font-size: 1.2rem;
      opacity: 0.8;
      margin-bottom: 2rem;
    }

    .controls {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      max-width: 100%;
      margin: 0 auto;
    }

    button {
      background: rgba(0, 255, 0, 0.1);
      border: 1px solid rgba(0, 255, 0, 0.3);
      padding: 0.5rem 1rem;
      color: #0f0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
      min-width: 120px;
      margin: 0.25rem;
    }

    button:hover {
      background: rgba(0, 255, 0, 0.2);
      border-color: rgba(0, 255, 0, 0.5);
    }

    input {
      background: rgba(0, 255, 0, 0.1);
      border: 1px solid rgba(0, 255, 0, 0.3);
      padding: 0.5rem;
      color: #0f0;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      width: 200px;
      max-width: 150px;
      min-width: 100px;
    }

    input::placeholder {
      color: rgba(0, 255, 0, 0.5);
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 255, 0, 0.1);
      padding: 0.5rem;
      border-radius: 4px;
      min-width: 150px;
      max-width: 200px;
      margin: 0.25rem;
      flex-grow: 1;
    }

    label {
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
    }

    input[type="range"] {
      width: 100px;
      accent-color: #0f0;
    }

    .advanced-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.5rem;
      width: 100%;
      margin: 1rem auto;
      padding: 0.5rem;
    }

    .advanced-controls .control-group {
      flex-direction: column;
      align-items: stretch;
      min-width: 120px;
      max-width: none;
      width: 100%;
    }

    .advanced-controls .control-group label {
      margin-bottom: 0.25rem;
    }

    .advanced-controls select {
      width: 100%;
      min-width: 0;
      max-width: none;
    }

    select {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(0, 255, 0, 0.3);
      padding: 0.5rem;
      color: #0f0;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      width: 150px;
      cursor: pointer;
    }

    select:hover {
      border-color: rgba(0, 255, 0, 0.5);
    }

    select option {
      background: black;
      color: #0f0;
    }

    @media (max-width: 768px) {
      .overlay-content {
        padding: 10px;
      }

      h2 {
        font-size: 2rem;
      }

      p {
        font-size: 1rem;
      }

      button {
        font-size: 0.8rem;
        padding: 0.3rem 0.6rem;
        min-width: 100px;
      }

      .control-group {
        min-width: 120px;
      }

      input[type="range"] {
        width: 80px;
      }

      select {
        width: 120px;
      }

      .advanced-controls .control-group {
        min-width: 100px;
        padding: 0.4rem;
      }

      .advanced-controls select {
        padding: 0.3rem;
        font-size: 0.8rem;
      }
    }

    @media (max-height: 600px) {
      .overlay-content {
        top: 0;
        transform: translate(-50%, 0);
        max-height: 100vh;
      }
    }
  `]
})
export class DigitalRainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('digitalRainCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private drops: Drop[] = [];
  fontSize = 14;
  private columns: number = 0;
  private isColorMode = false;
  private speed = 1;
  customText: string = '';
  private characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
  density = 1;
  trailOpacity = 0.2;
  private isReversed = false;
  angle: number = 0;
  selectedCharacterSet: 'matrix' | 'binary' | 'japanese' = 'matrix';
  effectMode = 'none';
  mouseMode = 'none';
  bloomEffect = false;
  private glitchProbability = 0.01;

  private characterSets = {
    matrix: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*',
    binary: '01',
    japanese: 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',
  };

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.initCanvas();
    this.createDrops();
    this.animate();
    this.setupEventListeners();
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
    
      // Use the maximum dimension to ensure full coverage
    const maxDimension = Math.max(canvas.width, canvas.height);
    this.columns = Math.ceil((maxDimension / this.fontSize) * this.density) * 2; // Doubled for better coverage
    this.createDrops();
  }

  private createDrops() {
    this.drops = [];
    const canvas = this.canvasRef.nativeElement;
    const angleRad = (this.angle * Math.PI) / 180;
    
    // Calculate a wider spread to ensure full coverage
    const spread = Math.max(canvas.width, canvas.height) * 2;
    const step = spread / this.columns;

    for (let i = 0; i < this.columns; i++) {
        // Start drops from a wider range
        const startX = -spread/4 + (i * step);
        
        // Create multiple drops per column with varied starting positions
        const dropCount = Math.ceil(3 * this.density);
        for (let j = 0; j < dropCount; j++) {
            let startY;
            if (this.isReversed) {
                startY = canvas.height + (Math.random() * canvas.height);
            } else {
                startY = -(Math.random() * canvas.height);
            }

            this.drops.push(this.createDrop(startX, startY));
        }
    }
  }

  private createDrop(startX: number, startY: number): Drop {
    return {
      x: startX,
      y: startY,
      speed: Math.random() * 2 + 1,
      text: this.getRandomCharacter(),
      color: this.getRandomColor(),
      length: Math.floor(Math.random() * 20) + 10,
      initialX: startX,
      trail: [],
      brightness: 1,
      glitchTimer: 0
    };
  }

  private getRandomCharacter(): string {
    if (this.customText) {
      return this.customText[Math.floor(Math.random() * this.customText.length)];
    }
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  private getRandomColor(): string {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 100%, 50%)`;
  }

  private animate() {
    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
      this.ctx.fillStyle = `rgba(0, 0, 0, ${this.trailOpacity})`;
      this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

      const angleRad = (this.angle * Math.PI) / 180;
      const canvas = this.canvasRef.nativeElement;

      this.drops.forEach(drop => {
        // Calculate movement based on angle
        const verticalMove = (this.isReversed ? -1 : 1) * drop.speed * this.speed;
        drop.y += verticalMove;
        drop.x = drop.initialX + (drop.y - (this.isReversed ? canvas.height : 0)) * Math.tan(angleRad);

        // Only draw if within visible area (with padding)
        const padding = this.fontSize * 2;
        if (drop.x >= -padding && 
            drop.x <= canvas.width + padding && 
            drop.y >= -padding && 
            drop.y <= canvas.height + padding) {
            this.ctx.fillStyle = this.isColorMode ? drop.color : '#0f0';
            this.ctx.font = `${this.fontSize}px monospace`;
            this.ctx.fillText(drop.text, drop.x, drop.y);
        }

        // Reset position when out of bounds
        if (this.isReversed) {
            if (drop.y < -padding * 2) {
                drop.y = canvas.height + padding;
                drop.x = drop.initialX;
                drop.text = this.getRandomCharacter();
            }
        } else {
            if (drop.y > canvas.height + padding * 2) {
                drop.y = -padding;
                drop.x = drop.initialX;
                drop.text = this.getRandomCharacter();
            }
        }


        // Apply effects
        this.applyEffects(drop);

        // Draw main character
        if (this.bloomEffect) {
          this.drawBloom(drop);
        }
      });
    });
  }

  private updateTrail(drop: Drop) {
    // Add current position to trail
    drop.trail.unshift({
      char: this.getRandomCharacter(),
      opacity: 1,
      x: drop.x,
      y: drop.y
    });
  }

  private applyEffects(drop: Drop) {
    switch (this.effectMode) {
      case 'glitch':
        if (Math.random() < this.glitchProbability) {
          drop.text = this.getRandomCharacter();
          drop.glitchTimer = 3;
        }
        break;
      case 'pulse':
        drop.brightness = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
        break;
      case 'rainbow':
        const hue = (Date.now() * 0.1 + drop.y) % 360;
        drop.color = `hsl(${hue}, 100%, 50%)`;
        break;
    }
  }

  private drawBloom(drop: Drop) {
    const blur = 5;
    this.ctx.shadowBlur = blur;
    this.ctx.shadowColor = this.isColorMode ? drop.color : '#0f0';
    // Draw the character multiple times for bloom effect
    for (let i = 0; i < 3; i++) {
      this.ctx.globalAlpha = 0.3 / (i + 1);
      this.ctx.fillText(drop.text, drop.x, drop.y);
    }
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());
    this.canvasRef.nativeElement.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.mouseMode === 'none') return;

      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.drops.forEach(drop => {
        const dx = x - drop.x;
        const dy = y - drop.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.handleMouseInteraction(drop, x, y, distance);
          if (this.isColorMode) {
            drop.color = this.getRandomColor();
          }
        }
      });
    });
  }

  private handleMouseInteraction(drop: Drop, mouseX: number, mouseY: number, distance: number) {
    const dx = mouseX - drop.x;
    const dy = mouseY - drop.y;
    const angle = Math.atan2(dy, dx);
    const force = (100 - Math.min(distance, 100)) / 100;

    switch (this.mouseMode) {
      case 'repel':
        drop.x -= Math.cos(angle) * force * 5;
        drop.y -= Math.sin(angle) * force * 5;
        break;
      case 'attract':
        drop.x += Math.cos(angle) * force * 5;
        drop.y += Math.sin(angle) * force * 5;
        break;
      case 'explode':
        if (distance < 50) {
          drop.y = this.isReversed ? this.canvasRef.nativeElement.height + 10 : -10;
          drop.x = drop.initialX;
          drop.text = this.getRandomCharacter();
          drop.color = this.getRandomColor();
        }
        break;
    }
  }

  toggleColor() {
    this.isColorMode = !this.isColorMode;
  }

  toggleSpeed() {
    this.speed = this.speed === 1 ? 2 : this.speed === 2 ? 0.5 : 1;
  }

  toggleDirection() {
    this.isReversed = !this.isReversed;
    this.createDrops();
  }

  updateText() {
    if (this.customText) {
      this.drops.forEach(drop => {
        drop.text = this.getRandomCharacter();
      });
    }
  }

  updateFontSize() {
    this.resizeCanvas();
  }

  updateDensity() {
    this.columns = Math.floor((this.canvasRef.nativeElement.width / this.fontSize) * this.density);
    this.createDrops();
  }

  updateTrailOpacity() {
    // No need to do anything as the animate loop uses this value directly
  }

  updateAngle() {
    this.createDrops();
  }

  updateCharacterSet() {
    this.characters = this.characterSets[this.selectedCharacterSet];
    this.createDrops();
  }

  updateEffectMode() {
    // Reset any existing effects
    this.drops.forEach(drop => {
      drop.brightness = 1;
      drop.glitchTimer = 0;
    });
  }

  updateMouseMode() {
    // Reset all drops to their initial positions when changing modes
    this.drops.forEach(drop => {
      drop.x = drop.initialX;
    });
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}

interface Drop {
  x: number;
  y: number;
  speed: number;
  text: string;
  color: string;
  length: number;
  initialX: number;
  trail: TrailCharacter[];
  brightness: number;
  glitchTimer: number;
}

interface TrailCharacter {
  char: string;
  opacity: number;
  x: number;
  y: number;
}