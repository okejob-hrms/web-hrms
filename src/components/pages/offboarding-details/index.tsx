import React from "react";

interface Props {
  id: number;
}

export const OffboardingDetail = React.memo(function OffboardingDetail({
  id,
}: Props) {
  console.log("#id ", id);

  return <div className="w-full flex flex-col gap-4"></div>;
});
