import React from "react";
import { Tooltip, makeStyles } from "@material-ui/core";
import { green, grey } from '@material-ui/core/colors';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    on: {
        color: green[600],
        fontSize: '20px'
    },
    off: {
        color: grey[600],
        fontSize: '20px'
    }
}));

const UserStatusIcon = ({ user }) => {
    const classes = useStyles();
    return user.online ?
        <Tooltip title={i18n.t("userStatus.online")}>
            <CheckCircleIcon className={classes.on} />
        </Tooltip>
        :
        <Tooltip title={i18n.t("userStatus.offline")}>
            <ErrorIcon className={classes.off} />
        </Tooltip>
}

export default UserStatusIcon;