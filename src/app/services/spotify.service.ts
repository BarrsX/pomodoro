import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private clientId = 'client id'; // <-- Replace with your Client ID
  private redirectUri = 'https://localhost:4200'; // Must match exactly what's in Spotify Dashboard
  private scope =
    'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state';

  private accessToken = new BehaviorSubject<string | null>(
    localStorage.getItem('spotify_access_token')
  );
  private refreshToken = new BehaviorSubject<string | null>(
    localStorage.getItem('spotify_refresh_token')
  );
  private player: Spotify.Player | null = null;
  private deviceId: string | null = null;

  accessToken$ = this.accessToken.asObservable();
  isLoggedIn$ = new BehaviorSubject<boolean>(!!this.accessToken.value);

  constructor(private http: HttpClient, private router: Router) {
    this.loadSpotifySdk();
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private generateRandomString(length: number): string {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async login() {
    const codeVerifier = this.generateRandomString(128);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateRandomString(16);

    localStorage.setItem('spotify_code_verifier', codeVerifier);

    const args = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: this.scope,
      redirect_uri: this.redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    window.location.href = 'https://accounts.spotify.com/authorize?' + args;
  }

  logout() {
    this.accessToken.next(null);
    this.refreshToken.next(null);
    this.isLoggedIn$.next(false);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_code_verifier');
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
    this.deviceId = null;
    this.router.navigate(['/']);
  }

  async exchangeCodeForToken(code: string) {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      console.error('Code verifier not found!');
      this.router.navigate(['/']);
      return;
    }

    const body = new HttpParams()
      .set('client_id', this.clientId)
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('code_verifier', codeVerifier);

    try {
      const response: any = await this.http
        .post('https://accounts.spotify.com/api/token', body.toString(), {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
        .toPromise();

      if (response && response.access_token && response.refresh_token) {
        this.storeTokens(response.access_token, response.refresh_token);
        this.initializePlayer(response.access_token);
        this.router.navigate(['/']);
      } else {
        console.error('Failed to exchange code for token:', response);
        this.logout();
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      this.logout();
    } finally {
      localStorage.removeItem('spotify_code_verifier');
    }
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    this.accessToken.next(accessToken);
    this.refreshToken.next(refreshToken);
    this.isLoggedIn$.next(true);
    localStorage.setItem('spotify_access_token', accessToken);
    localStorage.setItem('spotify_refresh_token', refreshToken);
  }

  private loadSpotifySdk() {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('Spotify SDK ready.');
      const token = this.accessToken.value;
      if (token) {
        this.initializePlayer(token);
      }
    };
  }

  private initializePlayer(token: string) {
    if (this.player) {
      console.log('Player already initialized.');
      return;
    }
    if (!window.Spotify) {
      console.error('Spotify SDK not loaded yet.');
      setTimeout(() => this.initializePlayer(token), 1000);
      return;
    }

    this.player = new Spotify.Player({
      name: 'Pomodoro Spotify Player',
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.5,
    });

    this.player.addListener('initialization_error', ({ message }) => {
      console.error('Initialization Error:', message);
    });
    this.player.addListener('authentication_error', ({ message }) => {
      console.error('Authentication Error:', message);
      this.logout();
    });
    this.player.addListener('account_error', ({ message }) => {
      console.error('Account Error:', message);
    });
    this.player.addListener('playback_error', ({ message }) => {
      console.error('Playback Error:', message);
    });

    this.player.addListener('player_state_changed', (state) => {
      if (!state) {
        console.warn('User is no longer connected to the player.');
        return;
      }
      console.log('Player state changed:', state);
    });

    this.player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      this.deviceId = device_id;
    });

    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
      if (this.deviceId === device_id) {
        this.deviceId = null;
      }
    });

    this.player.connect().then((success) => {
      if (success) {
        console.log('The Web Playback SDK successfully connected to Spotify!');
      } else {
        console.error('The Web Playback SDK failed to connect to Spotify.');
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.accessToken.value;
    if (!token) {
      console.error('Access token not available');
      this.logout();
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  transferPlayback(): Observable<any> {
    if (!this.deviceId) {
      console.error('Device ID not available for playback transfer.');
      return new Observable((observer) =>
        observer.error('Device ID not available')
      );
    }
    const body = { device_ids: [this.deviceId], play: false };
    return this.http.put('https://api.spotify.com/v1/me/player', body, {
      headers: this.getHeaders(),
    });
  }

  playMusic(): Observable<any> {
    if (!this.deviceId) {
      console.error('Device ID not available for playing music.');
      return new Observable((observer) =>
        observer.error('Device ID not available')
      );
    }
    return this.http.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  pauseMusic(): Observable<any> {
    if (!this.deviceId) {
      console.error('Device ID not available for pausing music.');
      return new Observable((observer) =>
        observer.error('Device ID not available')
      );
    }
    return this.http.put(
      `https://api.spotify.com/v1/me/player/pause?device_id=${this.deviceId}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
