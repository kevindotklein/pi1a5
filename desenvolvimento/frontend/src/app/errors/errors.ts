export const ERROR_TITLES: Record<string, any> = {
  default: "Houve um erro!",
};

export const ERROR_MESSAGES: Record<string, any> = {
  required: "this field is required!",
  "auth/weak-password":
    "that password is too weak and should be at least 6 characters long",
  "auth/email-already-in-use": "that email is already in use",
  "auth/invalid-credential":
    "Seu email ou senha estão incorretos, por favor tente novamente",
  default: "something went wrong! please try again later",
};
