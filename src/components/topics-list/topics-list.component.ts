import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { TutorialService } from '../../services/tutorial.service';
import { Topic, Tip } from '../../models/tutorial.model';

@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topics-list.component.html',
  styleUrls: ['./topics-list.component.scss']
})
export class TopicsListComponent implements OnInit, OnDestroy {
  topics: Topic[] = [];
  searchResults: Tip[] = [];
  searchQuery = '';
  loading = false;
  showTipResults = false;
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
      
      // אם יש חיפוש פעיל ויש טיפים, הצג אותם
      if (state.searchQuery && state.currentTips.length > 0 && !state.currentTopic) {
        this.searchResults = state.currentTips;
        this.showTipResults = true;
      } else {
        this.showTipResults = false;
        this.searchResults = [];
      }
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
      this.showTipResults = false;
      this.searchResults = [];
      this.tutorialService.loadTopics().subscribe();
    } else {
      // חיפוש בנושאים
      this.tutorialService.searchTopics(query).subscribe();
      
      // חיפוש בטיפים
      this.tutorialService.searchTips(query).subscribe();
    }
  }

  onTopicClick(topic: Topic): void {
    this.router.navigate(['/tips', topic.id]);
  }

  onTipClick(tip: Tip, index: number): void {
    // סימון הטיפ כנקרא
    this.tutorialService.markTipAsRead(tip.id);
    
    // טעינת כל הטיפים של הנושא ומעבר לקרוסלה
    this.tutorialService.loadTipsForTopic(tip.topicId).subscribe(() => {
      // מציאת האינדקס של הטיפ שנבחר בתוך הנושא
      const tipIndex = this.tutorialService.currentState.currentTips.findIndex((t: Tip) => t.id === tip.id);
      if (tipIndex !== -1) {
        this.tutorialService.setCurrentTipIndex(tipIndex);
      }
      this.router.navigate(['/carousel']);
    });
  }

  getTopicTitle(topicId: string): string {
    const topicTitles: { [key: string]: string } = {
      '1': 'ניהול משתמשים',
      '2': 'דוחות ואנליטיקה',
      '3': 'הגדרות מערכת',
      '4': 'אבטחה והרשאות',
      '5': 'גיבוי ושחזור'
    };
    return topicTitles[topicId] || 'נושא לא ידוע';
  }

  onClose(): void {
    // Implement close functionality
    console.log('Close tutorial');
  }
}