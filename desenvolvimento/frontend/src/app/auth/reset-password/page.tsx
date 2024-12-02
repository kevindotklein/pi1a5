"use client";

import { confirmPasswordReset, getAuth, verifyPasswordResetCode } from "firebase/auth";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPassword({ searchParams }: any) {

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isCodeValid, setIsCodeValid] = useState<boolean>(false);
  const [invalidMessage, setInvalidMessage] = useState<string>("");

  useEffect(() => {
    const queryOobCode = searchParams?.oobCode || null;
    setOobCode(queryOobCode);
  }, [searchParams]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setSuccess(false);
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setSuccess(false);
      return;
    }

    if (oobCode) {
      verifyPasswordResetCode(getAuth(), oobCode)
        .then(() => {
          setIsCodeValid(true);
        })
        .catch(() => {
          setInvalidMessage("O código de redefinição de senha é inválido ou expirou.");
          setError("");
          setSuccess(false);
          return;
        })
    } else{
      setInvalidMessage("O código de redefinição está ausente, por favor tente redefinir sua senha novamente.");
      setError("");
      setSuccess(false);
      return;
    }

    confirmPasswordReset(getAuth(), oobCode, password)
      .then(() => {
        setError("");
        setSuccess(true);
      })
      .catch(() => {
        setError("Erro ao redefinir a senha.")
        setSuccess(false);
        return;
      })

  };

  return (
    <>
      <div className="h-full flex flex-col gap-1 tablet:w-full w-[400px]">
        <h3 className="text-3xl font-bold flex gap-2 items-center text-neutral-100">
          studyflow
        </h3>
        <h2 className="font-bold text-red-600">
          {invalidMessage}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-4 text-white"
        >
          <h2 className="text-secondary-200 text-neutral-300">
            Redefinir Senha
          </h2>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Nova Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua nova senha"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="confirmPassword"
            >
              Confirme sua Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirme sua nova senha"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-green-500">
              Senha redefinida com sucesso!
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-md  p-2 text-white font-semibold focus:outline-none bg-slate-950 hover:bg-slate-900"
          >
            Redefinir Senha
          </button>
        </form>
      </div>
    </>
  );
}
