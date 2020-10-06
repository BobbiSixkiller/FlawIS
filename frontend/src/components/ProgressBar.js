import React from "react";

import { Progress } from "reactstrap";

function ProgressBar(props) {
	const { step, steps } = props;

	return(
		<div className="text-center">
			<div>{step + " / " + steps}</div>
			<Progress animated value={step / steps * 100} />
		</div>
	);
}

export default ProgressBar;