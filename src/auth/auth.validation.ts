export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export const validators = {
  username: (username: string): void => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;

    if (!username) {
      throw new ValidationError("username", "Username is required");
    }

    if (!usernameRegex.test(username)) {
      throw new ValidationError(
        "username",
        "Username must be 3-50 characters long and contain only letters, numbers, and underscores",
      );
    }
  },

  email: (email: string): void => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      throw new ValidationError("email", "Email is required");
    }

    if (!emailRegex.test(email)) {
      throw new ValidationError("email", "Invalid email format");
    }
  },

  password: (password: string): void => {
    if (!password) {
      throw new ValidationError("password", "Password is required");
    }

    if (password.length < 8) {
      throw new ValidationError(
        "password",
        "Password must be at least 8 characters long",
      );
    }

    if (password.length > 20) {
      throw new ValidationError(
        "password",
        "Password must not exceed 20 characters",
      );
    }
  },
};

export const validateRegisterInput = (data: any) => {
  validators.username(data.username);
  validators.email(data.email);
  validators.password(data.password);
};

export const validateLoginInput = (data: any) => {
  if (!data.identifier) {
    throw new ValidationError("identifier", "Email or username is required");
  }

  if (!data.password) {
    throw new ValidationError("password", "Password is required");
  }
};
