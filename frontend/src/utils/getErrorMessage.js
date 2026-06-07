export function getErrorMessage(error, fallback = "Something went wrong") {
  if (!error) return fallback;

  const data = error.response?.data;

  if (data == null || data === "") {
    return error.message || fallback;
  }

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed === "object" && parsed !== null) {
        return getErrorMessage({ response: { data: parsed } }, fallback);
      }
    } catch {
      return data;
    }
    return data;
  }

  if (typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }

    if (typeof data.title === "string" && data.title.trim()) {
      if (
        data.title === "One or more validation errors occurred." &&
        data.errors
      ) {
        return formatValidationErrors(data.errors) || data.title;
      }
      return data.title;
    }

    if (data.errors && typeof data.errors === "object") {
      const validationMessage = formatValidationErrors(data.errors);
      if (validationMessage) return validationMessage;
    }
  }

  return fallback;
}

function formatValidationErrors(errors) {
  const messages = [];

  Object.values(errors).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string" && item.trim()) messages.push(item);
      });
    } else if (typeof value === "string" && value.trim()) {
      messages.push(value);
    }
  });

  return messages[0] ?? null;
}
