import React, { useEffect, useState } from "react";

import { Progress } from "reactstrap";

function ProgressBar({ step, steps }) {
  const [value, setValue] = useState(1);

  useEffect(() => {
    console.log((step + 1 / steps) * 100);
    setValue((step + 1 / steps) * 100);
  }, [step, steps, setValue]);

  return (
    <div className="my-5">
      <div className="text-center">{`${step + 1} / ${steps}`}</div>
      <Progress value={value} />
    </div>
  );
}

export default ProgressBar;
