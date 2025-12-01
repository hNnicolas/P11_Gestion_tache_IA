export type ValidationError = { field: string; message: string };

/** Vérifie que l'email est valide */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/** Vérifie que le mot de passe est valide */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/** Vérifie que la date ISO est valide */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const validateRegisterData = (data: {
  email: string;
  password: string;
  name?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Email
  if (!data.email) {
    errors.push({ field: "email", message: "L'email est requis" });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: "email", message: "Format d'email invalide" });
  }

  // Mot de passe
  if (!data.password) {
    errors.push({ field: "password", message: "Le mot de passe est requis" });
  } else if (!isValidPassword(data.password)) {
    errors.push({
      field: "password",
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule et un chiffre",
    });
  }

  // Nom (optionnel)
  if (data.name && data.name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Le nom doit contenir au moins 2 caractères",
    });
  }

  return errors;
};

export const validateLoginData = (data: {
  email: string;
  password: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.email)
    errors.push({ field: "email", message: "L'email est requis" });
  else if (!isValidEmail(data.email))
    errors.push({ field: "email", message: "Format d'email invalide" });

  if (!data.password)
    errors.push({ field: "password", message: "Le mot de passe est requis" });

  return errors;
};

export const validateUpdateProfileData = (data: {
  name?: string;
  email?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Email
  if (data.email !== undefined) {
    if (!data.email.trim()) {
      errors.push({ field: "email", message: "L'email ne peut pas être vide" });
    } else if (!isValidEmail(data.email)) {
      errors.push({ field: "email", message: "Format d'email invalide" });
    }
  }

  // Name
  if (data.name !== undefined && data.name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Le nom doit contenir au moins 2 caractères",
    });
  }

  return errors;
};

export const validateUpdatePasswordData = (data: {
  currentPassword: string;
  newPassword: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.currentPassword)
    errors.push({
      field: "currentPassword",
      message: "Le mot de passe actuel est requis",
    });

  if (!data.newPassword)
    errors.push({
      field: "newPassword",
      message: "Le nouveau mot de passe est requis",
    });
  else if (!isValidPassword(data.newPassword))
    errors.push({
      field: "newPassword",
      message:
        "Le nouveau mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule et un chiffre",
    });

  if (
    data.currentPassword &&
    data.newPassword &&
    data.currentPassword === data.newPassword
  ) {
    errors.push({
      field: "newPassword",
      message: "Le nouveau mot de passe doit être différent de l'actuel",
    });
  }

  return errors;
};

export const validateUpdateTaskData = (data: {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assigneeIds?: string[];
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Title
  if (data.title !== undefined) {
    const trimmed = data.title.trim();
    if (!trimmed)
      errors.push({
        field: "title",
        message: "Le titre ne peut pas être vide",
      });
    else if (trimmed.length < 2)
      errors.push({
        field: "title",
        message: "Le titre doit contenir au moins 2 caractères",
      });
    else if (trimmed.length > 200)
      errors.push({
        field: "title",
        message: "Le titre ne peut pas dépasser 200 caractères",
      });
  }

  // Description
  if (data.description !== undefined && data.description.trim().length > 1000) {
    errors.push({
      field: "description",
      message: "La description ne peut pas dépasser 1000 caractères",
    });
  }

  // Status
  if (
    data.status &&
    !["TODO", "IN_PROGRESS", "DONE", "CANCELLED"].includes(data.status)
  )
    errors.push({
      field: "status",
      message: "Le statut doit être TODO, IN_PROGRESS, DONE ou CANCELLED",
    });

  // Priority
  if (
    data.priority &&
    !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(data.priority)
  )
    errors.push({
      field: "priority",
      message: "La priorité doit être LOW, MEDIUM, HIGH ou URGENT",
    });

  // Due date
  if (data.dueDate !== undefined && data.dueDate && !isValidDate(data.dueDate))
    errors.push({ field: "dueDate", message: "Format de date invalide" });

  // Assignees
  if (data.assigneeIds !== undefined && !Array.isArray(data.assigneeIds))
    errors.push({
      field: "assigneeIds",
      message: "Les assignations doivent être un tableau",
    });

  return errors;
};
export const validateUpdateCommentData = (data: {
  content?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.content || data.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Le contenu du commentaire est requis",
    });
  } else if (data.content.trim().length < 2) {
    errors.push({
      field: "content",
      message: "Le commentaire doit contenir au moins 2 caractères",
    });
  } else if (data.content.trim().length > 1000) {
    errors.push({
      field: "content",
      message: "Le commentaire ne peut pas dépasser 1000 caractères",
    });
  }

  return errors;
};
