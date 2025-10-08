import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Paper, Box } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: 800,
    margin: theme.spacing(2),
  },
}));

const Kanban = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            {i18n.t("kanban.title")}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            A funcionalidade Kanban está temporariamente desabilitada para manutenção.
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
            Em breve esta funcionalidade estará disponível novamente.
          </Typography>
        </Box>
      </Paper>
    </div>
  );
};

export default Kanban;
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{ticket.contact.number}</span>
                <Typography
                  className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
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
              <div style={{ textAlign: 'left' }}>{ticket.lastMessage || " "}</div>
              <Button
                className={`${classes.button} ${classes.cardButton}`}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}>
                {i18n.t("kanban.viewTicket")}
              </Button>
              <span style={{ marginRight: '8px' }} />
              {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
            </div>
          ),
          title: <>
            <Tooltip title={ticket.whatsapp?.name}>
              {IconChannel(ticket.channel)}
            </Tooltip> {ticket.contact.name}</>,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = ticket.tags.map(tag => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: i18n.t("kanban.ticketNumber") + ticket.id.toString(),
            description: (
              <div>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage || " "}
                </p>
                <Button
                  className={`${classes.button} ${classes.cardButton}`}
                  onClick={() => {
                    handleCardClick(ticket.uuid)
                  }}>
                  {i18n.t("kanban.viewTicket")}
                </Button>
                <span style={{ marginRight: '8px' }} />
                <p>
                  {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
                </p>
              </div>
            ),
            title: <>
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip> {ticket.contact.name}
            </>,
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: { backgroundColor: tag.color, color: "white" }
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success(i18n.t('kanban.ticketTagRemoved'));
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success(i18n.t('kanban.ticketTagAdded'));
      await fetchTickets(jsonString);
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/tagsKanban');
  };

  return (
    <div className={classes.root}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', width: '100%', maxWidth: '1200px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
        <Can role={user.profile} perform="dashboard:view" yes={() => (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddConnectionClick}
          >
            {i18n.t("kanban.addColumns")}
          </Button>
        )} />
      </div>
      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ backgroundColor: 'rgba(252, 252, 252, 0.03)' }}
        />
      </div>
    </div>
  );
};

export default Kanban;
