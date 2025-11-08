import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeatSelectionComponent } from './seat/seat-selection/seat-selection.component';

const routes: Routes = [
  { path: '', component: SeatSelectionComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }