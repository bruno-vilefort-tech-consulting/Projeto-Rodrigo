import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import {
  Badge,
  Tooltip,
  Typography,
  Button,
  TextField,
  Box,
} from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";
import BackdropLoading from "../../components/BackdropLoading";
import { FEATURES } from "../../config/featureFlags";

// Hooks customizados
import useKanbanTags from "../../hooks/useKanbanTags";
import useKanbanTickets from "../../hooks/useKanbanTickets";
import useSocketKanban from "../../hooks/useSocketKanban";
import useMoveTicket from "../../hooks/useMoveTicket";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  kanbanContainer: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  connectionTag: {
    background: "green",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: "bold",
    borderRadius: 3,
    fontSize: "0.6em",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.text.secondary,
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginLeft: "auto",
  },
  cardButton: {
    marginRight: theme.spacing(1),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  dateInput: {
    marginRight: theme.spacing(2),
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const jsonString =
    user.queues?.map((queue) => queue.UserQueue?.queueId) || [];

  // Hooks de data fetching
  const { tags, loading: tagsLoading, refetch: refetchTags } = useKanbanTags();
  const {
    tickets,
    loading: ticketsLoading,
    refetch: refetchTickets,
  } = useKanbanTickets(jsonString, startDate, endDate);
  const { moveTicket, loading: moveLoading } = useMoveTicket();

  // Socket.IO real-time
  useSocketKanban(socket, user.companyId, refetchTickets);

  const loading = tagsLoading || ticketsLoading;

  const handleSearchClick = () => {
    refetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return (
          <Facebook
            style={{
              color: "#3b5998",
              verticalAlign: "middle",
              fontSize: "16px",
            }}
          />
        );
      case "instagram":
        return (
          <Instagram
            style={{
              color: "#e1306c",
              verticalAlign: "middle",
              fontSize: "16px",
            }}
          />
        );
      case "whatsapp":
        return (
          <WhatsApp
            style={{
              color: "#25d366",
              verticalAlign: "middle",
              fontSize: "16px",
            }}
          />
        );
      default:
        return i18n.t("kanban.iconChannelError");
    }
  };

  const popularCards = () => {
    const filteredTickets = tickets.filter(
      (ticket) => ticket.tags?.length === 0,
    );

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map((ticket) => ({
          id: ticket.id.toString(),
          label: i18n.t("kanban.ticketNumber") + ticket.id.toString(),
          description: (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{ticket.contact?.number}</span>
                <Typography
                  className={
                    Number(ticket.unreadMessages) > 0
                      ? classes.lastMessageTimeUnread
                      : classes.lastMessageTime
                  }
                  component="span"
                  variant="body2"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              </div>
              <div style={{ textAlign: "left" }}>
                {ticket.lastMessage || " "}
              </div>
              <Button
                className={`${classes.button} ${classes.cardButton}`}
                onClick={() => handleCardClick(ticket.uuid)}
              >
                {i18n.t("kanban.viewTicket")}
              </Button>
              <span style={{ marginRight: "8px" }} />
              {ticket?.user && (
                <Badge
                  style={{ backgroundColor: "#000000" }}
                  className={classes.connectionTag}
                >
                  {ticket.user?.name.toUpperCase()}
                </Badge>
              )}
            </div>
          ),
          title: (
            <>
              <Tooltip title={ticket.whatsapp?.name || ""}>
                {IconChannel(ticket.channel)}
              </Tooltip>{" "}
              {ticket.contact?.name}
            </>
          ),
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...tags.map((tag) => {
        const filteredTickets = tickets.filter((ticket) => {
          const tagIds = ticket.tags?.map((t) => t.id) || [];
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map((ticket) => ({
            id: ticket.id.toString(),
            label: i18n.t("kanban.ticketNumber") + ticket.id.toString(),
            description: (
              <div>
                <p>
                  {ticket.contact?.number}
                  <br />
                  {ticket.lastMessage || " "}
                </p>
                <Button
                  className={`${classes.button} ${classes.cardButton}`}
                  onClick={() => handleCardClick(ticket.uuid)}
                >
                  {i18n.t("kanban.viewTicket")}
                </Button>
                <span style={{ marginRight: "8px" }} />
                <p>
                  {ticket?.user && (
                    <Badge
                      style={{ backgroundColor: "#000000" }}
                      className={classes.connectionTag}
                    >
                      {ticket.user?.name.toUpperCase()}
                    </Badge>
                  )}
                </p>
              </div>
            ),
            title: (
              <>
                <Tooltip title={ticket.whatsapp?.name || ""}>
                  {IconChannel(ticket.channel)}
                </Tooltip>{" "}
                {ticket.contact?.name}
              </>
            ),
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: { backgroundColor: tag.color, color: "white" },
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push("/tickets/" + uuid);
  };

  useEffect(() => {
    if (tags.length >= 0 && tickets.length >= 0) {
      popularCards();
    }
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      const ticketId = parseInt(cardId);

      // Corrigir lógica: sourceLaneId = tagId atual, targetLaneId = tagId destino
      // Se sourceLaneId for "lane0", não há tag antiga
      // Se targetLaneId for "lane0", não deve adicionar tag

      const oldTagId = sourceLaneId === "lane0" ? null : sourceLaneId;
      const newTagId = targetLaneId === "lane0" ? null : targetLaneId;

      await moveTicket(ticketId, oldTagId, newTagId);

      // Atualizar UI
      await refetchTickets();
    } catch (err) {
      console.error("handleCardMove error:", err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push("/tagsKanban");
  };

  // Loading state
  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextField
            label={i18n.t("kanban.startDate")}
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            className={classes.dateInput}
          />
          <Box mx={1} />
          <TextField
            label={i18n.t("kanban.endDate")}
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            className={classes.dateInput}
          />
          <Box mx={1} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
          >
            {i18n.t("kanban.search")}
          </Button>
        </div>
        {FEATURES.KANBAN_V2 && (
          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddConnectionClick}
              >
                {i18n.t("kanban.addColumns")}
              </Button>
            )}
          />
        )}
      </div>
      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ backgroundColor: "rgba(252, 252, 252, 0.03)" }}
          draggable={!moveLoading}
        />
      </div>
    </div>
  );
};

export default Kanban;
