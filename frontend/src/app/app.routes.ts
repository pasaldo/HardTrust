import { Routes } from '@angular/router';
import { ListingListComponent } from './features/listings/listing-list.component';
import { ListingDetailComponent } from './features/listings/listing-detail.component';
import { ConversationListComponent } from './features/chat/conversation-list.component';
import { MlPanelComponent } from './features/ml/ml-panel.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'listings' },
  { path: 'listings', component: ListingListComponent },
  { path: 'listings/:id', component: ListingDetailComponent },
  { path: 'chat', component: ConversationListComponent },
  { path: 'ml', component: MlPanelComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent }
];
