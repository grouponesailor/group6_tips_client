import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TutorialService } from '../../services/tutorial.service';
import { Tip, Topic } from '../../models/tutorial.model';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit, OnDestroy {
  tips: Tip[] = [];
  currentIndex = 0;
  currentTip?: Tip;
  currentTopic: Topic | undefined = undefined;
  loading = false;
  feedbackGiven: 'positive' | 'negative' | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private tutorialService: TutorialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tutorialService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.tips = state.currentTips;
      this.currentIndex = state.currentTipIndex;
      this.currentTip = this.tips[this.currentIndex];
      this.currentTopic = state.currentTopic;
      this.loading = state.loading;
      
      // איפוס משוב כשעוברים לטיפ חדש
      this.feedbackGiven = null;
    });

    // סימון הטיפ הנוכחי כנקרא
    if (this.currentTip) {
      this.tutorialService.markTipAsRead(this.currentTip.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.nextTip();
    } else if (event.key === 'ArrowRight') {
      this.previousTip();
    } else if (event.key === 'Escape') {
      this.onClose();
    }
  }

  nextTip(): void {
    if (this.currentIndex < this.tips.length - 1) {
      this.tutorialService.nextTip();
      // סימון הטיפ החדש כנקרא
      setTimeout(() => {
        if (this.currentTip) {
          this.tutorialService.markTipAsRead(this.currentTip.id);
        }
      }, 100);
    }
  }

  previousTip(): void {
    if (this.currentIndex > 0) {
      this.tutorialService.previousTip();
    }
  }

  goToTip(index: number): void {
    this.tutorialService.setCurrentTipIndex(index);
    // סימון הטיפ החדש כנקרא
    setTimeout(() => {
      if (this.currentTip) {
        this.tutorialService.markTipAsRead(this.currentTip.id);
      }
    }, 100);
  }

  markAsHelpful(): void {
    // סימון הטיפ כמועיל ומעבר לטיפ הבא
    if (this.currentTip) {
      this.tutorialService.markTipAsHelpful(this.currentTip.id);
    }
    this.nextTip();
  }

  skipTip(): void {
    // דילוג על הטיפ ומעבר לטיפ הבא
    this.nextTip();
  }

  giveFeedback(isPositive: boolean): void {
    // מתן משוב על הטיפ
    this.feedbackGiven = isPositive ? 'positive' : 'negative';
    
    if (this.currentTip) {
      this.tutorialService.saveFeedback(this.currentTip.id, isPositive);
    }
  }

  openAIChat(): void {
    // פתיחת צ'אט AI
    console.log('Opening AI chat for tip:', this.currentTip?.title);
    // כאן ניתן להוסיף לוגיקה לפתיחת מודל או דף צ'אט AI
  }

  onClose(): void {
    this.router.navigate(['/tips', this.currentTip?.topicId]);
  }

  get progressPercentage(): number {
    return this.tips.length > 0 ? ((this.currentIndex + 1) / this.tips.length) * 100 : 0;
  }
}