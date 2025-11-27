// src/app/app.routes.server.ts
import { ServerRoute, RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
 

  {
    path: 'products/:id',
    renderMode: RenderMode.Server,

  },


  {
    path: '**',
    renderMode: RenderMode.Server,
  }
];
