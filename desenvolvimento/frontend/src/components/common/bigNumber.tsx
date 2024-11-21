import { useState } from "react";

export default function BigNumber({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  if (!value && value !== 0) return null;

  return (
    <div className="w-fit h-fit rounded-md bg-neutral-200 p-4 flex flex-col gap-2 justify-center items-center shadow-sm">
      <span className="text-sm text-neutral-500">{label}</span>
      <h1 className="text-2xl font-bold text-neutral-800">{value}</h1>
    </div>
  );
}
