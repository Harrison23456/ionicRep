import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  ngOnInit() {
  }
  usermobile: string = '';
  passwordmobile: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.http.post('http://localhost:3000/api/mobileroute/login', { usermobile: this.usermobile, passwordmobile: this.passwordmobile })
      .subscribe((response: any) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/consulta-dni']);
      }, error => {
        console.error('Login failed:', error);
      });
  }

}
