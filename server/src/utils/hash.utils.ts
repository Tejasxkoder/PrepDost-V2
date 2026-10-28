
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const hashPassword = async (
  password: string,
): Promise<string> => {
  if (!password) {
    throw new Error("Password is required");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  if (!password || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(password, hashedPassword);
};
