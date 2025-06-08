import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { TutorialService } from '../../services/tutorial.service';
import { Topic } from '../../models/tutorial.model';

@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topics-list.component.html',
  styleUrls: ['./topics-list.component.scss']
})
export class TopicsListComponent implements OnInit, OnDestroy {
  topics: Topic[] = [];
  searchQuery = '';
  loading = false;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private tutorialService: TutorialService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    this.tutorialService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.topics = state.topics;
      this.loading = state.loading;
    });

    this.tutorialService.loadTopics().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  private performSearch(query: string): void {
    if (query.trim() === '') {
      this.tutorialService.loadTopics().subscribe();
    } else {
      this.tutorialService.searchTopics(query).subscribe();
    }
  }

  onTopicClick(topic: Topic): void {
    this.router.navigate(['/tips', topic.id]);
  }

  onClose(): void {
    // Implement close functionality
    console.log('Close tutorial');
  }
}