import { Injectable } from '@angular/core';

export interface Skill {
  name: string;
  level: number; // 0-100
  category: 'frontend' | 'backend' | 'tools' | 'soft';
  description: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private skills: Skill[] = [
    { 
      name: 'Angular', 
      level: 90, 
      category: 'frontend',
      description: 'Expert in Angular development with extensive experience in building complex applications.',
      icon: 'fab fa-angular'
    },
    { 
      name: 'React', 
      level: 85, 
      category: 'frontend',
      description: 'Proficient in React with a focus on hooks and modern practices.',
      icon: 'fab fa-react'
    },
    { 
      name: 'Node.js', 
      level: 80, 
      category: 'backend',
      description: 'Strong backend development skills with Node.js and Express.',
      icon: 'fab fa-node-js'
    },
    { 
      name: 'TypeScript', 
      level: 95, 
      category: 'frontend',
      description: 'Advanced TypeScript usage including complex type systems.',
      icon: 'fas fa-code'
    },
    { 
      name: 'Python', 
      level: 75, 
      category: 'backend',
      description: 'Experienced in Python development for backend and data analysis.',
      icon: 'fab fa-python'
    },
    { 
      name: 'Docker', 
      level: 70, 
      category: 'tools',
      description: 'Containerization and deployment using Docker.',
      icon: 'fab fa-docker'
    },
    { 
      name: 'Git', 
      level: 85, 
      category: 'tools',
      description: 'Advanced version control and collaboration.',
      icon: 'fab fa-git-alt'
    },
    { 
      name: 'Communication', 
      level: 90, 
      category: 'soft',
      description: 'Excellent communication and team collaboration skills.',
      icon: 'fas fa-comments'
    },
    { 
      name: 'Problem Solving', 
      level: 95, 
      category: 'soft',
      description: 'Strong analytical and problem-solving abilities.',
      icon: 'fas fa-puzzle-piece'
    },
    { 
      name: 'AWS', 
      level: 75, 
      category: 'tools',
      description: 'Cloud infrastructure and deployment with AWS.',
      icon: 'fab fa-aws'
    },
    { 
      name: 'MongoDB', 
      level: 80, 
      category: 'backend',
      description: 'Database design and optimization with MongoDB.',
      icon: 'fas fa-database'
    },
    { 
      name: 'CSS/SASS', 
      level: 85, 
      category: 'frontend',
      description: 'Advanced styling and responsive design.',
      icon: 'fab fa-sass'
    }
  ];

  constructor() { }

  getSkills(): Skill[] {
    return [...this.skills];
  }

  getSkillsByCategory(category: string): Skill[] {
    if (category === 'all') {
      return [...this.skills];
    }
    return this.skills.filter(skill => skill.category === category);
  }

  getSkillByName(name: string): Skill | undefined {
    return this.skills.find(skill => skill.name === name);
  }

  getSkillLevel(skillName: string): number {
    const skill = this.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    return skill ? skill.level : 0;
  }

  updateSkill(skillName: string, updates: Partial<Skill>): void {
    const index = this.skills.findIndex(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (index !== -1) {
      this.skills[index] = { ...this.skills[index], ...updates };
    }
  }

  addSkill(skill: Skill): void {
    this.skills.push(skill);
  }

  getTopSkills(limit: number = 5): Skill[] {
    return [...this.skills]
      .sort((a, b) => b.level - a.level)
      .slice(0, limit);
  }

  getYearsOfExperience(skillName: string): number {
    const skill = this.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    return skill ? skill.level : 0;
  }

  getTotalExperience(): number {
    return Math.max(...this.skills.map(s => s.level));
  }
} 