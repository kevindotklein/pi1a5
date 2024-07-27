import React, { ReactNode } from "react";

interface Props {
  children: ReactNode | any;
  day: string;
}

export default function Layer({ children, day }: Props) {


  return (
    <div className="flex flex-col space-y-4 border border-neutral-500 rounded-sm w-60 justify-start items-center py-4">
      <p className="text-xl font-bold text-blue-800 select-none">{day}</p>
      {children}
    </div>
  );
}
