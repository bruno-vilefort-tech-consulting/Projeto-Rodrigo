import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import * as serviceworker from './serviceWorker';
import App from "./App";

window.Buffer = Buffer;

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root"),
	() => {
		// Verifica se a função existe antes de chamar para evitar erros
		if (typeof window.finishProgress === 'function') {
			window.finishProgress();
		}
	}
);

serviceworker.unregister();
