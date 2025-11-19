// Compatible Server Actions et API routes sans Express

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// ---- Succès ----
export const sendSuccess = <T>(
  message: string,
  data?: T,
  statusCode: number = 200
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

// ---- Erreur générale ----
export const sendError = (
  message: string,
  error?: string,
  statusCode: number = 400
): ApiResponse => {
  return {
    success: false,
    message,
    error,
    statusCode,
  };
};

// ---- Erreur de validation ----
export const sendValidationError = (
  message: string,
  errors: any[]
): ApiResponse => {
  return {
    success: false,
    message,
    error: "Validation failed",
    data: { errors },
    statusCode: 400,
  };
};

// ---- Erreur serveur ----
export const sendServerError = (
  message: string = "Erreur interne du serveur",
  error?: string
): ApiResponse => {
  return {
    success: false,
    message,
    error,
    statusCode: 500,
  };
};

// ---- Erreur d'authentification ----
export const sendAuthError = (
  message: string = "Non autorisé"
): ApiResponse => {
  return {
    success: false,
    message,
    error: "Authentication failed",
    statusCode: 401,
  };
};
