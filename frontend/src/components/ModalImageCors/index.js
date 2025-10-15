import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	messageMedia: {
		objectFit: "cover",
		width: 250,
		height: "auto", // Redimensionar automaticamente a altura para manter a proporção
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	}
}));

const ModalImageCors = ({ imageUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");
	const [error, setError] = useState(false);

	// Função para corrigir URLs malformadas
	const fixMalformedUrl = (url) => {
		if (!url || typeof url !== 'string') return null;

		// Corrige porta duplicada (ex: localhost:8080:8080 -> localhost:8080)
		const fixedUrl = url.replace(/(:(\d+)):(\d+)/, ':$2');

		return fixedUrl.trim();
	};

	useEffect(() => {
		if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
			setError(true);
			setFetching(false);
			return;
		}

		// Corrige URL malformada antes de usar
		const fixedUrl = fixMalformedUrl(imageUrl);

		if (!fixedUrl) {
			setError(true);
			setFetching(false);
			return;
		}

		let isMounted = true; // Previne atualização de estado se componente desmontar

		const fetchImage = async () => {
			try {
				const { data, headers } = await api.get(fixedUrl, {
					responseType: "blob",
				});

				if (isMounted) {
					const url = window.URL.createObjectURL(
						new Blob([data], { type: headers["content-type"] })
					);
					setBlobUrl(url);
					setFetching(false);
					setError(false);
				}
			} catch (err) {
				console.error("Error fetching image:", err);
				if (isMounted) {
					setError(true);
					setFetching(false);
				}
			}
		};

		fetchImage();

		// Cleanup function
		return () => {
			isMounted = false;
		};
	}, [imageUrl]);

	// Não renderiza se não houver URL válida
	if (!imageUrl || error) {
		return null;
	}

	// Não renderiza se ainda está carregando e não tem blobUrl
	if (fetching && !blobUrl) {
		return null;
	}

	return (
		<ModalImage
			className={classes.messageMedia}
			smallSrcSet={blobUrl || fixMalformedUrl(imageUrl)}
			medium={blobUrl || fixMalformedUrl(imageUrl)}
			large={blobUrl || fixMalformedUrl(imageUrl)}
			alt={i18n.t("common.image")}
			showRotate={true}
		/>
	);
};

export default ModalImageCors;
