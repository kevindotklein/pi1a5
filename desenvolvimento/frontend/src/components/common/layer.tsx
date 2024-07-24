import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  day: string;
}

export default function Layer({ children, day }: Props) {
  return (
    <div className="flex flex-col space-y-4 border border-sky-500 w-60 justify-center items-center">
      <p className="text-xl font-bold text-blue-800">{day}</p>
      {children}
    </div>
  );
}
