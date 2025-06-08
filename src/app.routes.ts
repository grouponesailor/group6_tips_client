import { Routes } from '@angular/router';
import { TopicsListComponent } from './components/topics-list/topics-list.component';
import { TipsListComponent } from './components/tips-list/tips-list.component';
import { CarouselComponent } from './components/carousel/carousel.component';

export const routes: Routes = [
  { path: '', component: TopicsListComponent },
  { path: 'tips/:topicId', component: TipsListComponent },
  { path: 'carousel', component: CarouselComponent },
  { path: '**', redirectTo: '' }
];