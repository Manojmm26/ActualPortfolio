import { Component, OnInit } from '@angular/core';
import { SkillsService, Skill } from '../../services/skills.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFade', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('50ms', [
            animate('400ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <section class="about-section">
      <div class="about-content" @fadeInUp>
        <div class="profile-header">
          <div class="profile-image">
            <!-- Add your profile image here -->
            <img src="assets/profile.jpg" alt="Profile" />
          </div>
          <div class="profile-intro">
            <h1>John Doe</h1>
            <h2>Senior Full Stack Developer</h2>
            <p class="tagline">Crafting robust digital solutions with modern technologies</p>
          </div>
        </div>

        <div class="content-grid">
          <div class="main-content">
            <div class="bio-section">
              <h3>Professional Summary</h3>
              <p>
                Detail-oriented Full Stack Developer with 5+ years of experience in building
                scalable web applications. Specializing in JavaScript/TypeScript ecosystem
                with expertise in Angular, React, and Node.js. Passionate about clean code,
                performance optimization, and creating exceptional user experiences.
              </p>
            </div>

            <div class="expertise-section">
              <h3>Core Competencies</h3>
              <div class="skills-grid">
                <div *ngFor="let skill of topSkills" class="skill-card" @fadeInUp>
                  <div class="skill-header">
                    <i [class]="skill.icon"></i>
                    <h4>{{ skill.name }}</h4>
                  </div>
                  <div class="skill-level">
                    <div class="level-bar">
                      <div class="level-fill" [style.width.%]="skill.level"></div>
                    </div>
                    <span class="level-text">{{ skill.level }}%</span>
                  </div>
                  <p class="skill-description">{{ skill.description }}</p>
                </div>
              </div>
            </div>

            <div class="work-history-section" @staggerFade>
              <h3>Work Experience</h3>
              <div class="timeline">
                <div *ngFor="let job of workHistory" class="timeline-item">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <h4>{{job.title}} - {{job.company}}</h4>
                    <p class="timeline-date">{{job.period}}</p>
                    <ul class="achievement-list">
                      <li *ngFor="let achievement of job.achievements">{{achievement}}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="education-section" @staggerFade>
              <h3>Education & Certifications</h3>
              <div class="education-grid">
                <div *ngFor="let edu of education" class="education-card">
                  <div class="edu-icon">
                    <mat-icon>{{edu.icon}}</mat-icon>
                  </div>
                  <div class="edu-details">
                    <h4>{{edu.degree}}</h4>
                    <p>{{edu.institution}}</p>
                    <p class="edu-year">{{edu.year}}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="project-highlights" @staggerFade>
              <h3>Featured Projects</h3>
              <div class="projects-grid">
                <div *ngFor="let project of featuredProjects" class="project-card">
                  <img [src]="project.image" [alt]="project.title">
                  <div class="project-info">
                    <h4>{{project.title}}</h4>
                    <p>{{project.description}}</p>
                    <div class="tech-stack">
                      <span *ngFor="let tech of project.technologies">{{tech}}</span>
                    </div>
                    <div class="project-links">
                      <a [href]="project.github" target="_blank">GitHub</a>
                      <a [href]="project.live" target="_blank">Live Demo</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="metrics-section">
              <h3>Professional Metrics</h3>
              <div class="metrics-grid">
                <div class="metric-card" *ngFor="let metric of professionalMetrics">
                  <div class="metric-icon">
                    <i [class]="metric.icon"></i>
                  </div>
                  <div class="metric-content">
                    <h4>{{ metric.title }}</h4>
                    <p class="metric-value">{{ metric.value }}</p>
                    <p class="metric-description">{{ metric.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar">
            <div class="quick-info-card" @fadeInUp>
              <h3>Quick Info</h3>
              <ul class="info-list">
                <li>
                  <mat-icon>location_on</mat-icon>
                  <span>{{location}}</span>
                </li>
                <li>
                  <mat-icon>language</mat-icon>
                  <span>Available Worldwide</span>
                </li>
                <li>
                  <mat-icon>schedule</mat-icon>
                  <span>{{availability}}</span>
                </li>
              </ul>
              <button class="download-cv" (click)="downloadResume()">
                <mat-icon>download</mat-icon>
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-section {
      padding: var(--spacing-xxl) 0;
      background: linear-gradient(
        to bottom,
        var(--color-surface),
        var(--color-surface-accent)
      );
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-xxl);
    }

    .profile-image {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid var(--color-primary);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .profile-intro {
      h1 {
        font-size: var(--font-size-xxxl);
        color: var(--color-primary);
        margin-bottom: var(--spacing-xs);
      }

      h2 {
        font-size: var(--font-size-xl);
        color: var(--color-text);
        margin-bottom: var(--spacing-sm);
      }

      .tagline {
        font-size: var(--font-size-lg);
        color: var(--color-text-secondary);
      }
    }

    .bio-section {
      margin-bottom: var(--spacing-xxl);
      
      p {
        font-size: var(--font-size-lg);
        line-height: 1.8;
        color: var(--color-text);
      }
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .skill-card {
      background: var(--color-card-background);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: transform var(--transition-duration) ease;

      &:hover {
        transform: translateY(-2px);
      }

      .skill-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      i {
        font-size: 2rem;
        color: var(--color-primary);
      }

      h4 {
        margin: 0;
        color: var(--color-text);
      }
    }

    .skill-level {
      margin-top: var(--spacing-sm);
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

    .level-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .skill-description {
      margin-top: var(--spacing-sm);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .metric-card {
      display: flex;
      align-items: start;
      gap: var(--spacing-md);
      background: var(--color-card-background);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius);
      box-shadow: 0 4px 16px var(--color-shadow);
    }

    .metric-icon {
      font-size: 2rem;
      color: var(--color-primary);
    }

    .metric-value {
      font-size: var(--font-size-xl);
      font-weight: bold;
      color: var(--color-primary);
    }

    .metric-description {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 3fr 1fr;
      gap: var(--spacing-xl);
      max-width: var(--container-width);
      margin: 0 auto;
      padding: 0 var(--spacing-md);

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .timeline {
      position: relative;
      margin: var(--spacing-lg) 0;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 2px;
        background: var(--color-primary);
      }
    }

    .timeline-item {
      position: relative;
      padding-left: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
    }

    .timeline-marker {
      position: absolute;
      left: -6px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--color-primary);
      border: 2px solid var(--color-surface);
    }

    .education-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
    }

    .education-card {
      display: flex;
      align-items: start;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--color-card-background);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 8px var(--color-shadow);
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .project-card {
      background: var(--color-card-background);
      border-radius: var(--border-radius);
      overflow: hidden;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-4px);
      }

      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }
    }

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);

      span {
        padding: 4px 8px;
        background: var(--color-primary);
        color: var(--color-surface);
        border-radius: 12px;
        font-size: var(--font-size-sm);
      }
    }

    .quick-info-card {
      position: sticky;
      top: var(--spacing-lg);
      background: var(--color-card-background);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius);
      box-shadow: 0 4px 16px var(--color-shadow);
    }

    .info-list {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
      }
    }

    .download-cv {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: background 0.3s ease;

      &:hover {
        background: var(--color-primary-dark);
      }
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }

      .profile-image {
        width: 150px;
        height: 150px;
      }

      .skills-grid,
      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .about-content {
        padding: 0 var(--spacing-sm);
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }

      .timeline {
        &::before {
          left: 50%;
          transform: translateX(-50%);
        }
      }

      .timeline-item {
        padding-left: 0;
        padding-top: var(--spacing-lg);
        text-align: center;
      }

      .timeline-marker {
        left: 50%;
        transform: translateX(-50%);
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  topSkills: Skill[] = [];
  professionalMetrics = [
    {
      icon: 'fas fa-code-branch',
      title: 'Projects Delivered',
      value: '20+',
      description: 'Successfully completed projects across various industries'
    },
    {
      icon: 'fas fa-clock',
      title: 'Years of Experience',
      value: '5+',
      description: 'Professional experience in software development'
    },
    {
      icon: 'fas fa-award',
      title: 'Certifications',
      value: '4',
      description: 'Professional certifications in modern technologies'
    }
  ];

  workHistory = [
    {
      title: 'Senior Full Stack Developer',
      company: 'Tech Corp',
      period: '2020 - Present',
      achievements: [
        'Led development of microservices architecture',
        'Improved system performance by 40%',
        'Mentored junior developers'
      ]
    }
    // Add more work history items
  ];

  education = [
    {
      icon: 'school',
      degree: 'BSc Computer Science',
      institution: 'University Name',
      year: '2018'
    }
    // Add more education items
  ];

  featuredProjects = [
    {
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with real-time inventory',
      image: 'assets/projects/ecommerce.jpg',
      technologies: ['Angular', 'Node.js', 'MongoDB'],
      github: 'https://github.com/...',
      live: 'https://...'
    }
    // Add more projects
  ];

  location = 'New York, USA';
  availability = 'Full-time';

  constructor(private skillsService: SkillsService) {}

  ngOnInit(): void {
    this.topSkills = this.skillsService.getTopSkills(6);
  }

  downloadResume() {
    // Implement resume download logic
  }
}