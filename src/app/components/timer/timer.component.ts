import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Removed DecimalPipe
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Subscription, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit, OnDestroy {
  workDurationMinutes = 25;
  breakDurationMinutes = 5;

  timeLeft: number = this.workDurationMinutes * 60;
  timerRunning = false;
  isWorkMode = true;
  progress = 100;

  isLoggedIn = false;
  spotifySubscription: Subscription | null = null;

  private timerSubscription: Subscription | null = null;
  private destroy$ = new Subject<void>();

  constructor(public spotifyService: SpotifyService) {}

  ngOnInit(): void {
    this.loadSettings();
    this.resetTimer();

    this.spotifySubscription = this.spotifyService.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
        if (loggedIn) {
          this.spotifyService.transferPlayback().subscribe({
            next: () => console.log('Playback transferred successfully.'),
            error: (err) => console.error('Failed to transfer playback:', err),
          });
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.spotifySubscription) {
      this.spotifySubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSettings(): void {
    const savedWorkDuration = localStorage.getItem('pomodoroWorkDuration');
    const savedBreakDuration = localStorage.getItem('pomodoroBreakDuration');

    this.workDurationMinutes = savedWorkDuration
      ? parseInt(savedWorkDuration, 10)
      : 25;
    this.breakDurationMinutes = savedBreakDuration
      ? parseInt(savedBreakDuration, 10)
      : 5;
  }

  startTimer(): void {
    if (this.timerRunning) return;

    this.timerRunning = true;
    if (this.isLoggedIn && this.isWorkMode) {
      this.spotifyService.playMusic().subscribe({
        error: (err) => console.error('Failed to play music:', err),
      });
    } else if (this.isLoggedIn && !this.isWorkMode) {
      this.spotifyService.pauseMusic().subscribe({
        error: (err) => console.error('Failed to pause music:', err),
      });
    }

    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.updateProgress();
        } else {
          this.switchMode();
        }
      });
  }

  pauseTimer(): void {
    if (!this.timerRunning) return;

    this.timerRunning = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    if (this.isLoggedIn) {
      this.spotifyService.pauseMusic().subscribe({
        error: (err) => console.error('Failed to pause music:', err),
      });
    }
  }

  resetTimer(): void {
    this.pauseTimer();
    this.loadSettings();
    this.isWorkMode = true;
    this.timeLeft = this.workDurationMinutes * 60;
    this.updateProgress();
  }

  switchMode(): void {
    this.pauseTimer();
    this.isWorkMode = !this.isWorkMode;
    this.timeLeft =
      (this.isWorkMode ? this.workDurationMinutes : this.breakDurationMinutes) *
      60;
    this.updateProgress();
    this.startTimer();
  }

  updateProgress(): void {
    const totalDuration =
      (this.isWorkMode ? this.workDurationMinutes : this.breakDurationMinutes) *
      60;
    this.progress = (this.timeLeft / totalDuration) * 100;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  login(): void {
    this.spotifyService.login();
  }

  logout(): void {
    this.spotifyService.logout();
  }
}
