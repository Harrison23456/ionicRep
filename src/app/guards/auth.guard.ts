import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root',
})
export class authGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token === null) {
        this.router.navigate(['/login']);
        return false;
      }

      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken.type === 'userweb') {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      return false;
    }
  }
}
