export interface LoginResponse {
    success: boolean;
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'user' | 'admin' | 'career_coach';
    };
  }