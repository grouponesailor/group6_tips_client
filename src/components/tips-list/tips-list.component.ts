import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TutorialService } from '../../services/tutorial.service';
import { Tip, Topic } from '../../models/tutorial.model';

@Component({
  selector: 'app-tips-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tips-list.component.html',
  styleUrls: ['./tips-list.component.scss']
})
export class TipsListComponent implements OnInit, OnDestroy {
  tips: Tip[] = [];
  currentTopic?: Topic;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private tutorialService: TutorialService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tutorialService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.tips = state.currentTips;
      this.currentTopic = state.currentTopic;
      this.loading = state.loading;
    });

    this.route.params.subscribe(params => {
      const topicId = params['topicId'];
      if (topicId) {
        this.tutorialService.loadTipsForTopic(topicId).subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTipClick(tip: Tip, index: number): void {
    // סימון הטיפ כנקרא
    this.tutorialService.markTipAsRead(tip.id);
    
    this.tutorialService.setCurrentTipIndex(index);
    this.router.navigate(['/carousel']);
  }

  onBack(): void {
    this.router.navigate(['/']);
  }
}