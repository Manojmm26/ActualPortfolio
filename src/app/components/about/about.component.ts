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
            <img src="assets/profile.jpg" alt="Manoj Singh Mehta" />
          </div>
          <div class="profile-intro">
            <h1>Manoj Singh Mehta</h1>
            <h2>Angular Developer</h2>
            <p class="tagline">Web Technologies | Solution Development | UI Implementation</p>
          </div>
        </div>

        <div class="content-grid">
          <div class="main-content">
            <div class="bio-section">
              <h3>Professional Summary</h3>
              <p>
                Dedicated Angular Developer with extensive experience in web technologies including JavaScript, HTML, and CSS. 
                Specialized in developing solutions in the automotive sector. Excel in creating efficient applications while 
                collaborating with cross-functional teams. Driven by continuous learning and growth, eager to solve complex 
                challenges and improve user experiences.
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
                    <p class="edu-gpa">GPA: {{edu.gpa}}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- <div class="project-highlights" @staggerFade>
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
            </div> -->

            <div class="metrics-section">
              <h3>Professional Metrics</h3>
              <div class="metrics-grid">
                <div class="metric-card" *ngFor="let metric of professionalMetrics">
                  <div class="metric-icon">
                    <mat-icon>{{ metric.icon }}</mat-icon>
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
                  <mat-icon>call</mat-icon>
                  <span>+91-8198896310</span>
                </li>
                <li>
                  <mat-icon>mail</mat-icon>
                  <span>{{'manojmehta6996@gmail.com'}}</span>
                </li>
                <li>
                  <mat-icon>place</mat-icon>
                  <span>NCR</span>
                </li>
                <li>
                  <mat-icon>public</mat-icon>
                  <span>Available Worldwide</span>
                </li>
                <li>
                  <mat-icon>access_time</mat-icon>
                  <span>{{availability}}</span>
                </li>
              </ul>
              <button class="download-cv" (click)="downloadResume()">
                <mat-icon>file_download</mat-icon>
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

      mat-icon {
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
      padding-left: var(--spacing-xl);
      
      &::before {
        content: '';
        position: absolute;
        left: var(--spacing-xl);
        top: 0;
        height: 100%;
        width: 2px;
        background: var(--color-primary);
      }
    }

    .timeline-item {
      position: relative;
      margin-bottom: var(--spacing-xl);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .timeline-marker {
      position: absolute;
      left: -6px;
      top: 35px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--color-primary);
      border: 2px solid var(--color-surface);
    }

    .timeline-content {
      background: var(--color-card-background);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 8px var(--color-shadow);
      
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

    .edu-details {
      flex: 1;

      h4 {
        color: var(--color-text);
        margin-bottom: var(--spacing-xs);
      }

      p {
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-xs);
      }

      .edu-year {
        font-size: var(--font-size-sm);
      }

      .edu-gpa {
        color: var(--color-primary);
        font-weight: 500;
      }
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
        padding-left: 0;
        margin-left: var(--spacing-xl); /* Adjusted from 50% to fixed value */
        
        &::before {
          left: 0;
        }
      }

      .timeline-item {
        padding-left: 0;
        
        .timeline-marker {
          left: -7px;
        }

        .timeline-content {
          margin-left: var(--spacing-xl);
        }
      }
    }

    @media (max-width: 480px) {
      .timeline {
        margin-left: var(--spacing-md); /* Adjust for smaller screens */
      }

      .timeline-item {
        .timeline-content {
          margin-left: var(--spacing-md);
          padding: var(--spacing-md);
        }
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  topSkills: Skill[] = [];
  professionalMetrics = [
    {
      icon: 'code',
      title: 'Years of Experience',
      value: '5+',
      description: 'Professional experience in Angular development'
    },
    {
      icon: 'account_tree',
      title: 'Major Projects',
      value: '4+',
      description: 'Including automotive and financial sector solutions'
    },
    {
      icon: 'group',
      title: 'Team Leadership',
      value: '2+',
      description: 'Years of team mentorship and technical leadership'
    }
  ];

  workHistory = [
    {
      title: 'Angular Senior Developer [Kia Workspace]',
      company: 'Tata Technologies',
      period: '09/2024 - Present',
      achievements: [
        'Design and oversee implementation of microfrontend architecture',
        'Define standards for communication between microfrontends',
        'Guide development team in Angular best practices',
        'Implement strategies to optimize loading times and performance'
      ]
    },
    {
      title: 'Angular Senior Developer [Glovis Autobell]',
      company: 'Tata Technologies',
      period: '12/2023 - 09/2024',
      achievements: [
        'Developed Dealer Management system for Logistics and Auction department',
        'Implemented lazy loading module to improve performance',
        'Created reusable Angular components and modules',
        'Implemented JWT token-based authentication'
      ]
    },
    {
      title: 'Angular Developer [D2C Hyundai]',
      company: 'Tata Technologies',
      period: '07/2022 - 11/2023',
      achievements: [
        'Created D2C application for upcoming electric car',
        'Managed front-end structure creation to production deployment',
        'Designed and developed user interfaces',
        'Created multiple Reactive forms with validation'
      ]
    },
    {
      title: 'Associate Software Engineer',
      company: 'Accenture',
      period: '05/2019 - 07/2022',
      achievements: [
        'Developed Financial Web app for bank agents',
        'Worked with Feature Modules and reactive forms',
        'Developed dynamic web pages using modern technologies',
        'Coordinated design efforts with development team'
      ]
    }
  ];

  education = [
    {
      icon: 'school',
      degree: 'Bachelors in Computer Applications',
      institution: 'Lovely Professional University',
      year: '2018',
      gpa: '8.88/10'
    },
    {
      icon: 'school',
      degree: 'Diploma in Mechanical Engineering',
      institution: 'Lovely Professional University',
      year: '2016',
      gpa: '9.33/10'
    }
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

  location = 'NCR, India';
  availability = 'Full-time';

  constructor(private skillsService: SkillsService) {}

  ngOnInit(): void {
    this.topSkills = this.skillsService.getTopSkills(6);
  }

  downloadResume() {
    // Add download logic
    const link = document.createElement('a');
    link.href = 'assets/pdf/ManojMehtaResume.pdf';
    link.download = 'ManojMehtaResume.pdf';
    link.click();

  }
}