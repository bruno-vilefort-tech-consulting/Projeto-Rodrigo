import React, { useState, useEffect, useReducer, useContext, useMemo } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
// import { SocketContext } from "../../context/Socket/SocketContext"; //

import { makeStyles } from "@material-ui/core/styles"; //
import Paper from "@material-ui/core/Paper"; //
import Table from "@material-ui/core/Table"; //
import TableBody from "@material-ui/core/TableBody"; //
import TableCell from "@material-ui/core/TableCell"; //
import TableHead from "@material-ui/core/TableHead"; //
import TableRow from "@material-ui/core/TableRow"; //
import IconButton from "@material-ui/core/IconButton"; // Adicionado para os botões de ação na tabela
import TextField from "@material-ui/core/TextField"; // Adicionado para o campo de busca
import InputAdornment from "@material-ui/core/InputAdornment"; // Adicionado para o ícone de busca

import SearchIcon from "@material-ui/icons/Search"; // Adicionado para o ícone de busca
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline"; // Adicionado para o ícone de deletar
import ClearIcon from "@material-ui/icons/Clear"; // Adicionado para o ícone de limpar busca

import MainContainer from "../../components/MainContainer"; //
import MainHeader from "../../components/MainHeader"; //
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper"; // Adicionado, presumindo que é um componente que você tem

import Title from "../../components/Title"; //

import api from "../../services/api"; //
import { i18n } from "../../translate/i18n"; //
import TableRowSkeleton from "../../components/TableRowSkeleton"; //
import ConfirmationModal from "../../components/ConfirmationModal"; //
import toastError from "../../errors/toastError"; //
import { AuthContext } from "../../context/Auth/AuthContext"; //
import { useDate } from "../../hooks/useDate"; //
import { useCurrencyContext } from "../../context/Currency/CurrencyContext";
import usePlans from "../../hooks/usePlans"; // // Importação mantida, mesmo que não usada diretamente
import moment from "moment"; //
import { normalizeDocument } from "../../utils/documentValidator";
import { formatDocument } from "../../utils/documentFormatter";

const reducer = (state, action) => {
    if (action.type === "LOAD_COMPANIES") {
        const companies = action.payload; //
        const newCompanies = []; //

        companies.forEach((company) => { //
            const companyIndex = state.findIndex((u) => u.id === company.id); //
            if (companyIndex !== -1) { //
                state[companyIndex] = company; //
            } else { //
                newCompanies.push(company); //
            }
        });

        return [...state, ...newCompanies]; //
    }

    if (action.type === "UPDATE_COMPANIES") {
        const company = action.payload; //
        const companyIndex = state.findIndex((u) => u.id === company.id); //

        if (companyIndex !== -1) { //
            state[companyIndex] = company; //
            return [...state]; //
        } else { //
            return [company, ...state]; //
        }
    }

    if (action.type === "DELETE_COMPANIES") {
        const companyId = action.payload; //

        const companyIndex = state.findIndex((u) => u.id === companyId); //
        if (companyIndex !== -1) { //
            state.splice(companyIndex, 1); //
        }
        return [...state]; //
    }

    if (action.type === "RESET") {
        return []; //
    }
    return state; // Retorne o estado atual se a ação não for reconhecida, para evitar undefined.
};

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        width: "100%",
        overflowY: "scroll",
        overflowX: "auto",
        ...theme.scrollbarStyles,
    },
}));

const Companies = () => {
    const classes = useStyles(); //
    const history = useHistory(); //

    const [loading, setLoading] = useState(false); //
    const [pageNumber, setPageNumber] = useState(1); //
    const [hasMore, setHasMore] = useState(false); //
    const [deletingCompany, setDeletingCompany] = useState(null); //
    const [confirmModalOpen, setConfirmModalOpen] = useState(false); //
    const [searchParam, setSearchParam] = useState(""); //
    const [companies, dispatch] = useReducer(reducer, []); //
    const { dateToClient, datetimeToClient } = useDate(); //
    const { formatCurrency } = useCurrencyContext();

    // const { getPlanCompany } = usePlans(); //
    //   const socketManager = useContext(SocketContext); //
    const { user, socket } = useContext(AuthContext); //

    // Busca local usando useMemo para filtrar empresas
    const filteredCompanies = useMemo(() => {
        if (!searchParam) return companies;

        const term = searchParam.toLowerCase();
        const termNormalized = normalizeDocument(term); // Normalizar busca

        return companies.filter(company =>
            company.name?.toLowerCase().includes(term) ||
            company.email?.toLowerCase().includes(term) ||
            (termNormalized && company.document?.includes(termNormalized)) || // Busca normalizada
            company.phone?.includes(term)
        );
    }, [companies, searchParam]);

    useEffect(() => {
        async function fetchData() {
            if (!user.super) { //
                toast.error(i18n.t("compaies.notifications.noPermission")); //
                setTimeout(() => { //
                    history.push(`/`) //
                }, 1000); //
            }
        }
        fetchData(); //
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); //

    // Removido o reset quando searchParam muda, pois agora a busca é local
    // useEffect(() => {
    //     dispatch({ type: "RESET" }); //
    //     setPageNumber(1); //
    // }, [searchParam]); //

    useEffect(() => {
        setLoading(true); //
        const delayDebounceFn = setTimeout(() => { //
            const fetchCompanies = async () => {
                try {
                    const { data } = await api.get("/companiesPlan/", { //
                        params: { pageNumber }, //
                    });
                    dispatch({ type: "LOAD_COMPANIES", payload: data.companies }); //
                    setHasMore(data.hasMore); //
                    setLoading(false); //
                } catch (err) {
                    toastError(err); //
                }
            };
            fetchCompanies(); //
        }, 500); //
        return () => clearTimeout(delayDebounceFn); //
    }, [pageNumber]); //

    // // Evento de socket para atualização de empresas
    // useEffect(() => {
    //     if (socket) {
    //         socket.on("company", (data) => {
    //             if (data.action === "update" || data.action === "create") {
    //                 dispatch({ type: "UPDATE_COMPANIES", payload: data.company });
    //             } else if (data.action === "delete") {
    //                 dispatch({ type: "DELETE_COMPANIES", payload: data.companyId });
    //             }
    //         });
    //     }
    //     return () => {
    //         if (socket) {
    //             socket.off("company");
    //         }
    //     };
    // }, [socket]);


    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase()); //
    };

    const handleClearSearch = () => {
        setSearchParam("");
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            await api.delete(`/companies/${companyId}`); //
            toast.success(i18n.t("compaies.toasts.deleted")); //
        } catch (err) {
            toastError(err); //
        }
        setDeletingCompany(null); //
        // Recarrega a lista após deletar
        dispatch({ type: "DELETE_COMPANIES", payload: companyId }); //
    };

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1); //
    };

    const handleScroll = (e) => {
        if (!hasMore || loading) return; //
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget; //
        if (scrollHeight - (scrollTop + 100) < clientHeight) { //
            loadMore(); //
        }
    };

    const renderStatus = (status) => { // Renomeado de 'row' para 'status' para clareza
        return status === false ? i18n.t("compaies.table.no") : i18n.t("compaies.table.yes"); //
    };

    const renderPlanValue = (company) => { // Renomeado de 'row' para 'company' para clareza
        if (company.planId !== null && company.plan && company.plan.amount) {
            return formatCurrency(company.plan.amount);
        }
        return formatCurrency(0);
    };

    const renderWhatsapp = (useWhatsapp) => { // Renomeado de 'row' para 'useWhatsapp' para clareza
        return useWhatsapp === false ? i18n.t("compaies.table.no") : i18n.t("compaies.table.yes"); //
    };

    const renderFacebook = (useFacebook) => { // Renomeado de 'row' para 'useFacebook' para clareza
        return useFacebook === false ? i18n.t("compaies.table.no") : i18n.t("compaies.table.yes"); //
    };

    const renderInstagram = (useInstagram) => { // Renomeado de 'row' para 'useInstagram' para clareza
        return useInstagram === false ? i18n.t("compaies.table.no") : i18n.t("compaies.table.yes"); //
    };

    const renderCampaigns = (useCampaigns) => { // Renomeado de 'row' para 'useCampaigns' para clareza
        return useCampaigns === false ? i18n.t("compaies.table.no") : i18n.t("compaies.table.yes"); //
    };

    const renderSchedules = (useSchedules) => { // Renomeado de 'row' para 'useSchedules' para clareza
        return useSchedules === false ? i18n.t("compaies.table.no") : i18n.t("compaies.table.yes"); //
    };

    const renderInternalChat = (useInternalChat) => { // Renomeado de 'row' para 'useInternalChat' para clareza
        return useInternalChat === false ? i18n.t("compaies.table.no") : i18n.t("compaies.table.yes"); //
    };

    const renderExternalApi = (useExternalApi) => { // Renomeado de 'row' para 'useExternalApi' para clareza
        return useExternalApi === false ? i18n.t("compaies.table.no") : i18n.t("compaies.table.yes"); //
    };

    const rowStyle = (record) => {
        if (moment(record.dueDate).isValid()) { //
            const now = moment(); //
            const dueDate = moment(record.dueDate); //
            const diff = dueDate.diff(now, "days"); //
            if (diff >= 1 && diff <= 5) { //
                return { backgroundColor: "#fffead" }; //
            }
            if (diff <= 0) { //
                return { backgroundColor: "#fa8c8c" }; //
            }
        }
        return {}; //
    };

    return (
        <MainContainer maxWidth={false}>
            <ConfirmationModal
                title={
                    deletingCompany &&
                    `${i18n.t("compaies.confirmationModal.deleteTitle")} ${deletingCompany.name}?` //
                }
                open={confirmModalOpen} //
                onClose={() => setConfirmModalOpen(false)} // Função para fechar o modal
                onConfirm={() => handleDeleteCompany(deletingCompany.id)} //
            >
                {i18n.t("compaies.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <MainHeader>
                <Title>{i18n.t("compaies.title")} ({filteredCompanies.length})</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder={i18n.t("compaies.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        variant="outlined"
                        fullWidth
                        margin="dense"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchParam && (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleClearSearch}
                                        size="small"
                                        aria-label={i18n.t("compaies.clearSearch")}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        aria-label={i18n.t("compaies.searchLabel")}
                    />
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{i18n.t("compaies.table.ID")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.status")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.name")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.email")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.namePlan")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.value")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.createdAt")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.dueDate")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.lastLogin")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.folderSize")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.totalFiles")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.lastUpdate")}</TableCell>
                            {/* Descomentado a coluna de ações */}
                            <TableCell align="center">{i18n.t("compaies.table.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {filteredCompanies.map((company) => (
                                <TableRow style={rowStyle(company)} key={company.id}>
                                    <TableCell align="center">{company.id}</TableCell>
                                    <TableCell align="center">{renderStatus(company.status)}</TableCell>
                                    <TableCell align="center">{company.name}</TableCell>
                                    <TableCell align="center">{company.email}</TableCell>
                                    <TableCell align="center">{company?.plan?.name}</TableCell> {/* Acesso seguro a plan.name */}
                                    <TableCell align="center">{renderPlanValue(company)}</TableCell>
                                    <TableCell align="center">{dateToClient(company.createdAt)}</TableCell>
                                    <TableCell align="center">{dateToClient(company.dueDate)}<br /><span>{company.recurrence}</span></TableCell>
                                    <TableCell align="center">{datetimeToClient(company.lastLogin)}</TableCell>
                                    <TableCell align="center">{company.folderSize}</TableCell>
                                    <TableCell align="center">{company.numberFileFolder}</TableCell>
                                    <TableCell align="center">{datetimeToClient(company.updatedAtFolder)}</TableCell>
                                    {/* Descomentado os botões de ação */}
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => { // Modificado para não passar o evento 'e' se não for usado
                                                setConfirmModalOpen(true); //
                                                setDeletingCompany(company); //
                                            }}
                                        >
                                            <DeleteOutlineIcon style={{ color: "red" }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={4} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Companies;