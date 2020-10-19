import React from "react";
import { useHistory } from "react-router-dom";

import { Container, Button } from "reactstrap";

function MyWork() {
	const history = useHistory();
	
	return(
		<Container>

			<h1>NASTENKA</h1>
			<Button onClick={() => history.push("/")} outline color="primary">Späť</Button>
					
		</Container>
	);
}

export default MyWork;