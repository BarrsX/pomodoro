import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar'; // Import MatToolbarModule

@Component({
  selector: 'app-root',
  standalone: true, // Make it standalone
  imports: [
    RouterOutlet,
    MatToolbarModule, // Add MatToolbarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Pomodoro'; // Update title
}
