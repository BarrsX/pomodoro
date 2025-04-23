import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Import RouterLink

@Component({
  selector: 'app-settings',
  standalone: true, // Make it standalone
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink, // Add RouterLink
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  workDuration: number = 25; // Default work duration in minutes
  breakDuration: number = 5; // Default break duration in minutes

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    const savedWorkDuration = localStorage.getItem('pomodoroWorkDuration');
    const savedBreakDuration = localStorage.getItem('pomodoroBreakDuration');

    if (savedWorkDuration) {
      this.workDuration = parseInt(savedWorkDuration, 10);
    }
    if (savedBreakDuration) {
      this.breakDuration = parseInt(savedBreakDuration, 10);
    }
  }

  saveSettings(): void {
    // Basic validation
    if (this.workDuration > 0 && this.breakDuration > 0) {
      localStorage.setItem(
        'pomodoroWorkDuration',
        this.workDuration.toString()
      );
      localStorage.setItem(
        'pomodoroBreakDuration',
        this.breakDuration.toString()
      );
      // Optionally, show a success message to the user
      alert('Settings saved!'); // Simple alert for now
    } else {
      alert('Please enter valid durations (greater than 0).');
    }
  }
}
