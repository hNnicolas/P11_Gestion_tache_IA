export type ValidationError = { field: string; message: string };

export const isValidDate = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
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

  if (data.title !== undefined) {
    if (!data.title.trim())
      errors.push({
        field: "title",
        message: "Le titre ne peut pas être vide",
      });
    else if (data.title.trim().length < 2)
      errors.push({
        field: "title",
        message: "Le titre doit contenir au moins 2 caractères",
      });
    else if (data.title.trim().length > 200)
      errors.push({
        field: "title",
        message: "Le titre ne peut pas dépasser 200 caractères",
      });
  }

  if (data.description !== undefined && data.description.trim().length > 1000)
    errors.push({
      field: "description",
      message: "La description ne peut pas dépasser 1000 caractères",
    });

  if (
    data.status &&
    !["TODO", "IN_PROGRESS", "DONE", "CANCELLED"].includes(data.status)
  )
    errors.push({
      field: "status",
      message: "Le statut doit être TODO, IN_PROGRESS, DONE ou CANCELLED",
    });

  if (
    data.priority &&
    !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(data.priority)
  )
    errors.push({
      field: "priority",
      message: "La priorité doit être LOW, MEDIUM, HIGH ou URGENT",
    });

  if (data.dueDate !== undefined && data.dueDate && !isValidDate(data.dueDate))
    errors.push({ field: "dueDate", message: "Format de date invalide" });

  if (data.assigneeIds !== undefined && !Array.isArray(data.assigneeIds))
    errors.push({
      field: "assigneeIds",
      message: "Les assignations doivent être un tableau",
    });

  return errors;
};
