import { ERROR_MESSAGES, ERROR_TITLES } from "./errors";

export const displayErrorHandler = (err: Error) => {
  const errorMessage = err.message as string;

  const index = Object.keys(ERROR_MESSAGES).find((key) =>
    errorMessage.includes(key)
  ) as string;

  const title = ERROR_TITLES[index] || ERROR_TITLES.default;
  const message = ERROR_MESSAGES[index] || ERROR_MESSAGES.default;

  return {
    title,
    message,
  };
};
