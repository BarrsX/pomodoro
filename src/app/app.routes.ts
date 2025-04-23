import { Routes } from '@angular/router';
import { TimerComponent } from './components/timer/timer.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

export const routes: Routes = [
  { path: '', component: TimerComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: '**', redirectTo: '' }, // Redirect unknown paths to the timer
];
