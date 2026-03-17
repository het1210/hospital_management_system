import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  hospitalId: number;
  roles: string[];
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private tokenKey = 'jwt_token';
  private refreshTokenKey = 'refresh_token';
  private roleKey = 'user_role';
  private userIdKey = 'user_id';
  private hospitalIdKey = 'hospital_id';
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  //login 
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          this.setSession(response);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  //storing data in local stroage
  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.tokenKey, authResult.accessToken);
    localStorage.setItem(this.refreshTokenKey, authResult.refreshToken);
    localStorage.setItem(this.userIdKey, authResult.userId.toString());
    localStorage.setItem(this.hospitalIdKey, authResult.hospitalId.toString());
    localStorage.setItem('username', authResult.username || '');
    
    const role = this.mapRoleToInternal(authResult.roles[0]);
    localStorage.setItem(this.roleKey, role);
    
    const user = {
      userId: authResult.userId,
      hospitalId: authResult.hospitalId,
      roles: authResult.roles,
      username: authResult.username
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  private mapRoleToInternal(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ROLE_SUPER_ADMIN': 'superadmin',
      'ROLE_HOSPITAL_ADMIN': 'hospitaladmin',
      'ROLE_DOCTOR': 'doctor',
      'ROLE_NURSE': 'nurse',
      'ROLE_FRONTDESK': 'frontdesk',
      'ROLE_LAB_TECHNICIAN': 'labtechnician',
      'ROLE_PHARMACIST': 'pharmacist',
      'ROLE_PATIENT': 'patient'
    };
    return roleMap[role] || 'patient';
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  //logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.hospitalIdKey);
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getUserId(): number | null {
    const id = localStorage.getItem(this.userIdKey);
    return id ? parseInt(id) : null;
  }

  getHospitalId(): number | null {
    const id = localStorage.getItem(this.hospitalIdKey);
    return id ? parseInt(id) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    const userRole = this.getRole();
    return userRole ? roles.includes(userRole) : false;
  }
}
