import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'maingame',
  },

  {
    path: 'maingame',
    loadChildren: () =>
      import('./pages/main-game/main-game.routes').then((x) => x.mainGameRoutes),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
