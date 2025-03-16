import { Routes } from '@angular/router';
import { ProjectsComponent } from './components/projects/projects.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { DemoComponent } from './ui-components/demo/demo.component';
import { InteractiveUniverseComponent } from './components/interactive-universe/interactive-universe.component';
import { ParticleTextComponent } from './components/particle-text/particle-text.component';
import { DigitalRainComponent } from './components/digital-rain/digital-rain.component';
import { HilbertCurveComponent } from './components/hilbert-curve/hilbert-curve.component';

export const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'about', component: AboutComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'performance', component: PerformanceComponent },
  { path: 'ui-components', component: DemoComponent },
  { path: 'interactive-universe', component: InteractiveUniverseComponent },
  { path: 'particle-text', component: ParticleTextComponent },
  { path: 'digital-rain', component: DigitalRainComponent },
  {path: 'hilbert-curve', component: HilbertCurveComponent},
  { path: '**', redirectTo: '' }
];