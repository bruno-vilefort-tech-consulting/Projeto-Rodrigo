import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles } from "@material-ui/core";
import { ChromePicker } from "react-color";
import { i18n } from "../../translate/i18n";


const useStyles = makeStyles((theme) => ({
    btnWrapper: {
        position: "relative",
    },
}));

const ColorBoxModal = ({ onChange, currentColor, handleClose, open }) => {

    const classes = useStyles();
    const [selectedColor, setSelectedColor] = useState(currentColor);

    useEffect(() => {
        setSelectedColor(currentColor);
    }, [currentColor]);

    const handleOk = () => {
        onChange(selectedColor);
        handleClose();
    };

    return (

        <Dialog open={open} onClose={handleClose}>

            <DialogTitle>{i18n.t("colorBoxModal.title")}</DialogTitle>
            <DialogContent>
                <ChromePicker
                    disableAlpha={true}
                    color={selectedColor}
                    onChange={(color) => setSelectedColor(color.hex)} />
            </DialogContent>

            <DialogActions>

                <Button onClick={handleClose} color="primary">
                    {i18n.t("colorBoxModal.buttons.cancel")}
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    className={classes.btnWrapper}
                    onClick={handleOk} >
                    {i18n.t("colorBoxModal.buttons.ok")}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default ColorBoxModal;