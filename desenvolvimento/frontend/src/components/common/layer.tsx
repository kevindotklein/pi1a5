import React, { ReactNode } from "react";

interface Props {
  children: ReactNode | any;
  day: string;
  count: number;
}

export default function Layer({ children, day, count }: Props) {
  return (
    <div className="flex flex-col gap-1 min-w-[200px] bg-neutral-200 rounded-sm w-60 justify-start items-center py-3 px-3 tablet:h-full">
      <div className="w-full flex items-end gap-2 mb-3">
        <p className="text-xl font-bold text-blue-800 select-none">{day}</p>
        <p className="text-lg font-bold text-blue-400 select-none">{count}</p>
      </div>
      {children}
    </div>
  );
}
