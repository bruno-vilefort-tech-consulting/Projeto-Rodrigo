import React from "react";
import Typography from "@material-ui/core/Typography";

export default function Title(props) {
	return (
		<Typography variant="h6" color="primary" style={{ marginBottom: 0, whiteSpace: "nowrap" }}>
			{props.children}
		</Typography>
	);
}
