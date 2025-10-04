export type AppError = {
  code: string;
  message: string;
  details?: any;
};

export class ErrorHandler {
  static handle(error: AppError) {
    console.error('Error occurred:', error);
    
    switch (error.code) {
      case 'AUTH_ERROR':
        return {
          message: 'Authentication failed. Please try again.',
          severity: 'error',
        };
      case 'VALIDATION_ERROR':
        return {
          message: 'Please check your input and try again.',
          severity: 'warning',
        };
      case 'NETWORK_ERROR':
        return {
          message: 'Network connection issue. Please check your internet connection.',
          severity: 'error',
        };
      default:
        return {
          message: 'An unexpected error occurred. Please try again later.',
          severity: 'error',
        };
    }
  }
}