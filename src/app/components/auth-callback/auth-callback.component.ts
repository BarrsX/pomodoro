import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule

@Component({
  selector: 'app-auth-callback',
  standalone: true, // Make it standalone
  imports: [
    CommonModule, // Add CommonModule
    MatProgressSpinnerModule, // Add MatProgressSpinnerModule
  ],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.scss',
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];

      // TODO: Add state validation if you implemented it during login

      if (error) {
        this.error = `Spotify login error: ${error}`;
        this.loading = false;
        console.error(this.error);
        // Optionally redirect to an error page or home
        // setTimeout(() => this.router.navigate(['/']), 5000);
      } else if (code) {
        this.spotifyService
          .exchangeCodeForToken(code)
          .then(() => {
            // Success handled within the service (redirects to '/')
            this.loading = false; // Keep loading indicator until redirect happens
          })
          .catch((err) => {
            this.error = 'Failed to exchange Spotify code for token.';
            this.loading = false;
            console.error(this.error, err);
            // Optionally redirect
            // setTimeout(() => this.router.navigate(['/']), 5000);
          });
      } else {
        // No code or error, something went wrong or direct access
        this.error = 'Invalid callback state.';
        this.loading = false;
        console.error(this.error);
        this.router.navigate(['/']); // Redirect home immediately
      }
    });
  }
}
