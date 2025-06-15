// Add this type helper somewhere in your project (e.g., types/axios.d.ts)
interface AxiosError<T = any> extends Error {
    config: any;
    code?: string;
    request?: any;
    response?: {
      data: T;
      status: number;
      headers: any;
    };
    isAxiosError: boolean;
  }
  
  function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError)?.isAxiosError === true;
  }