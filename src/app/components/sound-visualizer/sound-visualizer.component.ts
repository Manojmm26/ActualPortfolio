import { Component, ElementRef, ViewChild, OnInit, OnDestroy, NgZone } from '@angular/core';

@Component({
  selector: 'app-sound-visualizer',
  template: `
    <section class="visualizer-container">
      <canvas #visualizerCanvas></canvas>
      <div class="overlay-content">
        <h2>Sound Visualizer</h2>
        <p>Experience your sound in visual form</p>
        <div class="controls">
          <button (click)="toggleMicrophone()" [class.active]="isListening">
            {{ isListening ? 'Stop' : 'Start' }} Microphone
          </button>
          <button (click)="toggleVisualizationType()">
            Change Visualization
          </button>
          <input type="file" 
                 accept="audio/*" 
                 (change)="handleAudioFile($event)"
                 #audioFileInput>
          <button (click)="audioFileInput.click()">
            Upload Audio File
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .visualizer-container {
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
      color: white;
      z-index: 1;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
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
      display: flex;
      gap: 1rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
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

    button:hover, button.active {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    input[type="file"] {
      display: none;
    }
  `]
})
export class SoundVisualizerComponent implements OnInit, OnDestroy {
  @ViewChild('visualizerCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray!: Uint8Array;
  private source: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number = 0;
  private visualizationType: 'bars' | 'circles' | 'wave' = 'bars';
  isListening: boolean = false;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.initAudioContext();
  }

  private initAudioContext() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
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

  async toggleMicrophone() {
    if (!this.isListening) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.source = this.audioContext!.createMediaStreamSource(stream);
        this.source.connect(this.analyser!);
        this.isListening = true;
        this.initCanvas();
        this.animate();
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    } else {
      this.stopVisualization();
    }
  }

  private stopVisualization() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.isListening = false;
    this.clearCanvas();
  }

  private clearCanvas() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  toggleVisualizationType() {
    const types: ('bars' | 'circles' | 'wave')[] = ['bars', 'circles', 'wave'];
    const currentIndex = types.indexOf(this.visualizationType);
    this.visualizationType = types[(currentIndex + 1) % types.length];
  }

  async handleAudioFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.stopVisualization();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyser!);
      source.connect(this.audioContext!.destination);
      
      this.source = source as unknown as MediaStreamAudioSourceNode;
      this.isListening = true;
      this.initCanvas();
      this.animate();
      
      source.start(0);
      source.onended = () => this.stopVisualization();
    } catch (err) {
      console.error('Error loading audio file:', err);
    }
  }

  private animate() {
    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
      
      this.analyser!.getByteFrequencyData(this.dataArray);
      this.clearCanvas();

      switch (this.visualizationType) {
        case 'bars':
          this.drawBars();
          break;
        case 'circles':
          this.drawCircles();
          break;
        case 'wave':
          this.drawWave();
          break;
      }
    });
  }

  private drawBars() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / this.dataArray.length;

    for (let i = 0; i < this.dataArray.length; i++) {
      const barHeight = (this.dataArray[i] / 255) * height;
      
      const hue = (i / this.dataArray.length) * 360;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      
      this.ctx.fillRect(
        i * barWidth,
        height - barHeight,
        barWidth,
        barHeight
      );
    }
  }

  private drawCircles() {
    const canvas = this.canvasRef.nativeElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    for (let i = 0; i < this.dataArray.length; i += 4) {
      const angle = (i / this.dataArray.length) * Math.PI * 2;
      const amplitude = this.dataArray[i] / 255;
      
      const x = centerX + Math.cos(angle) * radius * amplitude;
      const y = centerY + Math.sin(angle) * radius * amplitude;
      
      const hue = (i / this.dataArray.length) * 360;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawWave() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);

    for (let i = 0; i < this.dataArray.length; i++) {
      const x = (i / this.dataArray.length) * width;
      const y = height / 2 + ((this.dataArray[i] - 128) * height) / 255;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, '#4ecdc4');
    gradient.addColorStop(1, '#ff6b6b');

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  ngOnDestroy() {
    this.stopVisualization();
    if (this.audioContext) {
      this.audioContext.close();
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
} 