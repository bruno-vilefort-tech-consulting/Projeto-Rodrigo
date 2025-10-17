const messages = {
  pt: {
    translations: {
      signup: {
        title: "Cadastre-se",
        toasts: {
          success: "Usuário criado com sucesso! Faça seu login!!!.",
          fail: "Erro ao criar usuário. Verifique os dados informados.",
          userCreationDisabled: "Cadastro de novos usuários está desabilitado.",
          verificationError: "Erro ao verificar permissão de cadastro.",
        },
        form: {
          name: "Nome",
          email: "Email",
          password: "Senha",
          company: "Nome da Organização",
          phone: "Whatsapp (DDD + NÚMERO)",
          plan: "Plano",
          planDetails: {
            attendants: "Atendentes",
            whatsapp: "WhatsApp",
            queues: "Filas",
            currency: "R$",
          },
        },
        buttons: {
          submit: "Cadastrar",
          login: "Já tem uma conta? Entre!",
        },
      },
      validation: {
        tooShort: "Muito curto!",
        tooLong: "Muito longo!",
        required: "Obrigatório",
        invalidEmail: "Email inválido",
      },
      login: {
        title: "Login",
        logoAlt: "Logo",
        emailLabel: "Email",
        passwordLabel: "Senha",
        rememberMe: "Lembrar de mim",
        loginButton: "Entrar",
        signupButton: "Cadastre-se",
        forgotPassword: "Esqueceu a senha?",
        whatsappLabel: "Fale conosco no WhatsApp",
        whatsappTitle: "Fale conosco no WhatsApp",
        form: {
          email: "Email",
          password: "Senha",
          button: "Acessar",
        },
        buttons: {
          submit: "Entrar",
          register: "Não tem um conta? Cadastre-se!",
        },
      },
      companies: {
        title: "Empresas",
        form: {
          name: "Nome da Empresa",
          plan: "Plano",
          token: "Token",
          submit: "Cadastrar",
          success: "Empresa criada com sucesso!",
        },
      },
      auth: {
        toasts: {
          success: "Login efetuado com sucesso!",
        },
        dueDate: {
          expiration: "Sua assinatura expira em",
          days: "dias!",
          day: "dia!",
          expirationToday: "Sua assinatura expira hoje!",
        },
        token: "Token",
      },
      forgotPassword: {
        title: "Redefinir Senha",
        form: {
          emailLabel: "Digite seu e-mail",
          submitButton: "Enviar Link de Redefinição",
          backToLogin: "Voltar ao Login",
        },
        loading: {
          sending: "Enviando...",
          sent: "Enviado!",
        },
        toasts: {
          success: "Link de redefinição de senha enviado com sucesso",
        },
      },
      resetPassword: {
        title: "Redefinir Senha",
        form: {
          newPassword: "Nova Senha",
          confirmPassword: "Confirmar Senha",
        },
        buttons: {
          submit: "Redefinir Senha",
          submitting: "Redefinindo...",
          submitted: "Redefinido!",
          backToLogin: "Voltar ao Login",
        },
        errors: {
          passwordMismatch: "As senhas não coincidem",
          passwordTooShort: "A senha deve ter pelo menos 6 caracteres",
          invalidToken: "Token de redefinição ausente ou inválido. Por favor, solicite um novo link de redefinição.",
          resetError: "Erro ao redefinir senha. Tente novamente.",
        },
        toasts: {
          success: "Senha redefinida com sucesso",
          passwordMismatch: "As senhas não coincidem",
          passwordTooShort: "A senha deve ter pelo menos 6 caracteres",
        },
      },
      financeiro: {
        title: "Faturas",
        table: {
          details: "Detalhes",
          users: "Usuários",
          connections: "Conexões",
          queues: "Filas",
          value: "Valor",
          dueDate: "Vencimento",
          status: "Status",
          action: "Ação"
        },
        tooltips: {
          details: "Detalhes da fatura",
          users: "Número de usuários",
          connections: "Número de conexões",
          queues: "Número de filas",
          value: "Valor da fatura",
          dueDate: "Data de vencimento"
        },
        status: {
          paid: "Pago",
          overdue: "Vencido",
          open: "Em Aberto",
          yes: "Sim",
          no: "Não",
          overdueFor: "Vencido há {{days}} dias",
          dueToday: "Vence hoje",
          dueIn: "Vence em {{days}} dias"
        },
        buttons: {
          pay: "PAGAR",
          paid: "PAGO",
          payNow: "PAGAR AGORA"
        },
        checkout: {
          title: "Falta pouco!",
          steps: {
            data: "Dados",
            customize: "Personalizar",
            review: "Revisar"
          },
          messages: {
            notFound: "Not Found",
            paymentNotice: "Ao realizar o pagamento, atualize a página!",
            subscriptionSuccess: "Assinatura realizada com sucesso!, aguardando a realização do pagamento"
          },
          buttons: {
            back: "VOLTAR",
            pay: "PAGAR",
            next: "PRÓXIMO"
          },
          pricing: {
            users: "Usuários",
            connection: "Conexão",
            queues: "Filas",
            select: "SELECIONAR",
            perMonth: "/mês"
          },
          review: {
            title: "Resumo da assinatura"
          },
          success: {
            total: "TOTAL",
            copied: "Copiado",
            copyQr: "Copiar código QR",
            finalizeMessage: "Para finalizar, basta realizar o pagamento escaneando ou colando o código Pix acima :)",
            licenseRenewed: "Sua licença foi renovada até"
          },
          planDetails: {
            title: "Detalhes do plano",
            billing: "Cobrança: Mensal"
          },
          paymentInfo: {
            title: "Informação de pagamento",
            email: "Email:",
            name: "Nome:",
            document: "CPF/CNPJ:",
            total: "Total:"
          }
        }
      },
      dashboard: {
        title: "Dashboard",
        buttons: {
          filter: "Filtrar"
        },
        tabs: {
          indicators: "Indicadores",
          assessments: "NPS",
          attendants: "Atendentes",
          performance: "Performances"
        },
        charts: {
          performance: "Graficos",
          userPerformance: "Grafico dos Usuarios",
          hourlyServices: "Atendimentos por hora",
          ticketsLabel: "Tickets",
          score: "Pontuação",
          perDay: {
            title: "Atendimentos hoje: ",
          },
          errorFetchingTickets: "Erro ao buscar informações dos tickets",
          noDataAvailable: "Nenhum dado disponível para o período selecionado.",
        },
        cards: {
          inAttendance: "Em Atendimento",
          waiting: "Aguardando",
          activeAttendants: "Atendentes Ativos",
          finalized: "Finalizados",
          newContacts: "Novos Contatos",
          totalReceivedMessages: "Mensagens Recebidas",
          totalSentMessages: "Mensagens Enviadas",
          averageServiceTime: "T.M. de Atendimento",
          averageWaitingTime: "T.M. de Espera",
          status: "Status (Atual)",
          activeTickets: "Tickets Ativos",
          passiveTickets: "Tickets Passivos",
          groups: "Grupos",
        },
        users: {
          name: "Nome",
          numberAppointments: "Quantidade de Atendimentos",
          statusNow: "Atual",
          totalCallsUser: "Total de atendimentos por usuario",
          totalAttendances: "Total de atendimentos",
          totalLabel: "Total de atendimentos: {{count}}",
          queues: "Filas",
          defaultQueue: "Conexão Padrão",
          workingHours: "Horário de trabalho",
          startWork: "Início de trabalho",
          endWork: "Fim de trabalho",
          farewellMessage: "Mensagem de despedida",
          theme: "Tema Padrão",
          menu: "Menu padrão"
        },
        date: {
          initialDate: "Data Inicial",
          finalDate: "Data Final",
        },
        licence: {
          available: "Disponível até",
        },
        assessments: {
          totalCalls: "Total de Atendimentos",
          callsWaitRating: "Atendimentos aguardando avaliação",
          callsWithoutRating: "Atendimentos sem avaliação",
          ratedCalls: "Atendimentos avaliados",
          evaluationIndex: "Índice de avaliação",
          score: "Pontuação",
          prosecutors: "Promotores",
          neutral: "Neutros",
          detractors: "Detratores",
          generalScore: "NPS Score Geral",
        },
        status: {
          online: "Online",
          offline: "Offline",
        },
        filters: {
          title: "Filtros",
          initialDate: "Inicial",
          finalDate: "Final",
          filterButton: "Filtrar",
        },
        errors: {
          loadData: "Não foi possível carregar os dados do dashboard.",
          exportExcel: "Erro ao exportar para Excel.",
        },
        export: {
          sheetName: "RelatorioDeAtendentes",
          fileName: "relatorio-de-atendentes.xlsx",
        },
        nps: {
          overallScore: "NPS Score Geral",
        },
      },
      reports: {
        title: "Relatório de Pesquisas Realizadas",
        operator: "Operador",
        period: "Período",
        until: "Até",
        date: "Data",
        reportTitle: "Relatórios",
        calls: "Atendimentos",
        search: "Pesquisas",
        durationCalls: "Duracão dos atendimentos",
        grupoSessions: "Atendimentos em grupos",
        groupTicketsReports: {
          timezone: "America/Sao_Paulo",
          msgToast: "Gerando relatório compactado, por favor aguarde.",
          errorToast: "Erro ao gerar o relatório",
          back: "Voltar",
          groupServiceReport: "Relatório de Atendimento em Grupos",
          loading: "Carregando...",
          contact: "Contato",
          dateOpen: "Data abertura",
          dateLastUpdated: "Data Última Atualização",
          agent: "Quem atendeu",
          agentClosed: "Quem fechou",
          waitingAssistance: "Aguardando atendimento",
          process: "Em atendimento",
        },
        researchReports: {
          response: "resposta",
          active: "(Ativa)",
          inactive: "(Inativa)",
          quantity: "Quantidade",
          percentage: "porcentagem",
          title: "Relatório de Pesquisas Realizadas",
          activeSearch: "Pesquisa ativa",
          inactiveSearch: "Pesquisa inativa",
        },
        ticketDurationDetail: {
          msgToast: "Gerando relatório compactado, por favor aguarde.",
          title: "Relatório de Duração do Atendimento",
          startService: "Início do atendimento",
          lastUpdated: "Última atualização",
          lastAgent: "Último atendente",
          durationFinished: "Duração após finalizado",
        },
        ticketDuration: {
          title: "Relatório de Duração dos Atendimento",
          contact: "Contato",
          open: "Abertos",
          pending: "Pendentes",
          finished: "Finalizados",
          durationFinished: "Duração dos finalizados",
          durationAfterFinished: "Duração após finalizado",
          actions: "Ações",
        },
        ticketReports: {
          msgToast: "Gerando relatório compactado, por favor aguarde.",
          title: "Relatório de Atendimento",
        },
        pdf: {
          title: "Relação de Atendimentos Realizados",
          exportTitle: "Relação de Atendimentos em Grupos Realizados",
        },
        form: {
          initialDate: "Data Inicial",
          finalDate: "Data Final",
        },
        excel: {
          connection: "Conexão",
          contact: "Contato",
          user: "Usuário",
          queue: "Fila",
          status: "Status",
          lastMessage: "ÚltimaMensagem",
          dateOpen: "DataAbertura",
          timeOpen: "HoraAbertura",
          dateClose: "DataFechamento",
          timeClose: "HoraFechamento",
          supportTime: "TempoDeAtendimento",
          nps: "nps",
          fileName: "relatorio-de-atendimentos.xlsx",
          sheetName: "RelatorioDeAtendimentos",
        },
        tooltips: {
          ticketLogs: "Logs do Ticket",
          accessTicket: "Acessar Ticket",
          exportExcel: "Exportar para Excel",
        },
      },
      todo: {
        newTask: "Nova Tarefa",
        add: "Adicionar",
        save: "Salvar",
        task: "Tarefas",
      },
      allConnections: {
        errors: {
          loadCompanies: "Não foi possível carregar a lista de registros",
          unknownChannel: "error"
        },
        subtitle: "Conecte seus canais de atendimento para receber mensagens e iniciar conversas com seus clientes.",
        channels: {
          whatsapp: "WhatsApp",
          facebook: "Facebook",
          instagram: "Instagram"
        },
        table: {
          client: "Cliente",
          connectedConnections: "Conexões conectadas",
          disconnectedConnections: "Conexões desconectadas",
          totalConnections: "Total de Conexões",
          total: "Total"
        }
      },
      companyWhatsapps: {
        title: "Conexões de: {{companyName}}",
        table: {
          channel: "Canal"
        }
      },
      channels: {
        whatsapp: "WhatsApp",
        facebook: "Facebook",
        instagram: "Instagram"
      },
      connections: {
        title: "Conexões",
        waitConnection: "Aguarde... Suas conexões serão reiniciadas!",
        newConnection: "Nova Conexão",
        restartConnections: "Reiniciar Conexões",
        callSupport: "Chamar Suporte",
        toasts: {
          deleted: "Conexão excluída com sucesso!",
          closedimported:
            "Estamos fechando os tickets importados, por favor aguarde uns instantes",
        },
        confirmationModal: {
          closedImportedTitle: "Fechar tickets importados",
          closedImportedMessage:
            "Se você confirmar todos os tickets importados serão fechados",
          deleteTitle: "Deletar",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida.",
          disconnectTitle: "Desconectar",
          disconnectMessage:
            "Tem certeza? Você precisará ler o QR Code novamente.",
        },
        buttons: {
          add: "Adicionar Conexão",
          disconnect: "desconectar",
          tryAgain: "Tentar novamente",
          qrcode: "QR CODE",
          newQr: "Novo QR CODE",
          closedImported: "Fechar todos os tickets Importados",
          preparing: "Preparando mensagens para importação",
          importing: "Importando Mensagens do WhatsApp",
          processed: "Processado",
          in: "de",
          connecting: "Conectando",
        },
        typography: {
          processed: "Processado",
          in: "de",
          date: "Data da mensagem",
        },
        toolTips: {
          disconnected: {
            title: "Falha ao iniciar sessão do WhatsApp",
            content:
              "Certifique-se de que seu celular esteja conectado à internet e tente novamente, ou solicite um novo QR Code",
          },
          qrcode: {
            title: "Esperando leitura do QR Code",
            content:
              "Clique no botão 'QR CODE' e leia o QR Code com o seu celular para iniciar a sessão",
          },
          connected: {
            title: "Conexão estabelecida!",
          },
          timeout: {
            title: "A conexão com o celular foi perdida",
            content:
              "Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto, ou clique no botão 'Desconectar' para obter um novo QR Code",
          },
        },
        table: {
          name: "Nome",
          status: "Status",
          lastUpdate: "Última atualização",
          default: "Padrão",
          actions: "Ações",
          session: "Sessão",
          number: "Número do Whatsapp",
          channel: "Canal",
        },
        iconChannel: {
          error: "Erro",
        },
      },
      showTicketOpenModal: {
        title: {
          header: "Atendimento Existente",
        },
        form: {
          message: "Este contato já está em atendimento:",
          user: "Atendente",
          queue: "Fila",
          messageWait:
            "Este contato já está aguardando atendimento. Veja na aba Aguardando!",
        },
      },
      showTicketLogModal: {
        title: {
          header: "Logs",
        },
        options: {
          create: "Ticket criado.",
          chatBot: "ChatBot iniciado.",
          queue: " - Fila definida.",
          open: " iniciou o atendimento.",
          access: "acessou o ticket.",
          transfered: "transferiu o ticket.",
          receivedTransfer: "recebeu o ticket transferido.",
          pending: "devolveu a fila.",
          closed: "fechou o ticket",
          reopen: "reabriu o ticket",
          redirect: "- redirecionado"
        },
        close: "Fechar",
      },
      statusFilter: {
        title: "Filtro por Status",
        groups: "Grupos",
      },
      whatsappModal: {
        title: {
          add: "Adicionar Conexão",
          edit: "Editar Conexão",
        },
        tabs: {
          general: "Geral",
          messages: "Mensagens",
          assessments: "NPS",
          integrations: "Integrações",
          schedules: "Horário de expediente",
          chatbot: "Chatbot",
          defaultFlow: "Fluxo Padrão",
        },
        form: {
          importOldMessagesEnable: "Importar mensagens do aparelho",
          importOldMessages: "Data de inicio da importação",
          importRecentMessages: "Data de termino da importação",
          importOldMessagesGroups: "Importar mensagens de grupo",
          closedTicketsPostImported: "Encerrar tickets após importação",
          name: "Nome",
          queueRedirection: "Redirecionamento de Fila",
          queueRedirectionDesc:
            "Selecione uma fila para os contatos que não possuem fila serem redirecionados",
          default: "Padrão",
          group: "Permitir grupos",
          timeSendQueue: "Tempo em minutos para redirecionar para fila",
          importAlert:
            "ATENÇÃO: Ao salvar, sua conexão será encerrada, será necessário ler novamente o QR Code para importar as mensagens",
          groupAsTicket: "Tratar grupos como ticket",
          timeCreateNewTicket: "Criar novo ticket em x minutos",
          maxUseBotQueues: "Enviar bot x vezes",
          timeUseBotQueues: "Enviar bot em x minutos",
          expiresTicket: "Encerrar chats abertos após x minutos",
          expiresTicketNPS:
            "Encerrar chats aguardando avaliação após x minutos",
          maxUseBotQueuesNPS:
            "Quantidade máxima de vezes que a avaliaçao vai ser enviada",
          closeLastMessageOptions1: "Do atendente/Cliente",
          closeLastMessageOptions2: "Do atendente",
          outOfHoursMessage: "Mensagem de fora de expediente",
          greetingMessage: "Mensagem de saudação",
          complationMessage: "Mensagem de conclusão",
          lgpdLinkPrivacy: "Link para política de privacidade",
          lgpdMessage: "Mensagem de saudaçao LGPD",
          lgpdDeletedMessages: "Ofuscar mensagem apagada pelo contato",
          lgpdSendMessage: "Sempre solicitar confirmação do contato",
          ratingMessage: "Mensagem de avaliaçao - Escala deve ser de 0 a 10",
          token: "Token para integração externa",
          sendIdQueue: "Fila",
          inactiveMessage: "Mensagem de inatividade",
          timeInactiveMessage:
            "Tempo em minutos para envio do aviso de inatividade",
          whenExpiresTicket:
            "Encerrar chats abertos quando última mensagem for",
          expiresInactiveMessage: "Mensagem de encerramento por inatividade",
          prompt: "Prompt",
          collectiveVacationEnd: "Data final",
          collectiveVacationStart: "Data inicial",
          collectiveVacationMessage: "Mensagem de férias coletivas",
          queueIdImportMessages: "Fila para importar as mensagens"
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        menuItem: {
          enabled: "Habilitado",
          disabled: "Desabilitado",
          minutes: "minutos",
        },
        messages: {
          clickSaveToRegister: "Clique em salvar para registrar as alterações",
        },
        flowBuilder: {
          welcomeFlow: "Fluxo de boas vindas",
          welcomeFlowDescription: "Este fluxo é disparado apenas para novos contatos, pessoas que voce não possui em sua lista de contatos e que mandaram uma mensagem",
          defaultResponseFlow: "Fluxo de resposta padrão",
          defaultResponseFlowDescription: "Resposta Padrão é enviada com qualquer caractere diferente de uma palavra chave. ATENÇÃO! Será disparada se o atendimento ja estiver fechado e passado 6 horas do seu fechamento.",
          title: "Fluxo padrão",
          save: "Salvar",
          updatedSuccess: "Fluxos padrões atualizados",
          deleteConfirmation: "Tem certeza que deseja deletar este fluxo? Todas as integrações relacionados serão perdidos.",
        },
        success: "Conexão salvo com sucesso.",
        errorSendQueue:
          "Foi informado tempo para redirecionar fila, porém não foi selecionada fila para redirecionar. Os dois campos precisam estar preenchidos",
        errorExpiresNPS:
          "É obrigado informar um tempo para avaliação quando se utiliza o NPS.",
        errorRatingMessage:
          "É obrigado informar uma mensagem de avaliação quando se utiliza o NPS.",
      },
      qrCode: {
        message: "Leia o QrCode para iniciar a sessão",
      },
      qrcodeModal: {
        waiting: "Aguardando pelo QR Code"
      },
      forbiddenPage: {
        accessDenied: "Oops! Acesso Negado!",
        buttons: {
          back: "Voltar"
        }
      },
      contacts: {
        title: "Contatos",
        toasts: {
          deleted: "Contato excluído com sucesso!",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Deletar ",
          importTitlte: "Importar contatos",
          exportContact: "Exportar contatos",
          deleteMessage:
            "Tem certeza que deseja deletar este contato? Todos os atendimentos relacionados serão perdidos.",
          blockContact: "Tem certeza que deseja bloquear este contato?",
          unblockContact: "Tem certeza que deseja desbloquear este contato?",
          importMessage: "Deseja importar todos os contatos do telefone?",
          importChat: "Importar Conversas",
          wantImport: "Deseja importar todas as conversas do telefone?",
        },
        buttons: {
          import: "Importar Contatos",
          add: "Adicionar Contato",
          export: "Exportar Contato",
        },
        table: {
          name: "Nome",
          whatsapp: "WhatsApp",
          email: "Email",
          connection: "Conexão",
          actions: "Ações",
          lastMessage: "Última Mensagem",
          status: "Status",
          source: "Origem",
          selectAll: "Selecionar todos os contatos",
          selectContact: "Selecionar contato {{name}}",
        },
        menu: {
          importYourPhone: "Importar do aparelho padrão",
          importToExcel: "Importar / Exportar do Excel",
          importExport: "Importar / Exportar",
        },
        bulkActions: {
          deleteSelected: "Deletar Selecionados ({{count}})",
          deleteConfirmTitle: "Tem certeza que deseja deletar {{count}} contatos selecionados?",
          deleteConfirmMessage: "Essa ação é irreversível.",
          deleteSuccess: "Contatos selecionados deletados com sucesso!",
          blockContact: "Contato bloqueado",
          unblockContact: "Contato desbloqueado",
          selectConnectionToImport: "Escolha de qual conexão deseja importar",
        },
        filters: {
          showLabel: "Exibir",
          showOnlyAgenda: "Somente minha agenda",
          showAll: "Todos os contatos",
          source: "Origem",
          sourceAll: "Todos",
          sourceManual: "Manual",
          sourceWhatsappRoster: "WhatsApp (agenda)",
          sourceExcelImport: "Excel/CSV",
          sourceAutoCreated: "Auto-criados",
          sourceChatImport: "Chats"
        },
        source: {
          manual: "Criado manualmente",
          whatsappRoster: "Importado do WhatsApp",
          excelImport: "Importado de Excel/CSV",
          autoCreated: "Auto-criado por mensagem",
          chatImport: "Importado de chats"
        },
      },
      tagsFilter: {
        placeholder: "Filtro por Tags",
      },
      newTicketModal: {
        selectQueue: "Selecione uma fila",
        selectConnection: "Selecione uma Conexão",
        queueError: "Selecione uma fila",
        close: "Fechar",
      },
      contactImportWpModal: {
        modalTitle: "Exportar / Importar Contatos",
        title: "Exportar Contatos para o Excel",
        buttons: {
          downloadModel: "Download modelo do excel para importação",
          closed: "Fechar",
          import: "Selecione o arquivo do excel para importar Contatos",
        },
        form: {
          connection: "Conexão do WhatsApp",
          connectionPlaceholder: "Selecionar conexão...",
          importType: "Tipo de importação",
          importAll: "Importar todos os contatos",
          importSelected: "Importar contatos selecionados",
          overwriteExisting: "Sobrescrever contatos existentes"
        },
        validation: {
          connectionRequired: "Você deve selecionar uma conexão",
          noContactsFound: "Nenhum contato encontrado para importar"
        },
        progress: {
          importing: "Importando contatos...",
          imported: "Contatos importados: {count}",
          duplicated: "Contatos duplicados: {count}",
          failed: "Contatos com falha: {count}"
        },
        importComplete: "Importação concluída com sucesso",
        importInProgress: "Importação em andamento {current} de {total} - não saia desta tela até concluir a importação",
        sampleContact: {
          name: "João",
          number: "5599999999999",
        },
      },
      tagsContainer: {
        tagTooShort: "Tag muito curta!",
        placeholder: "Tags",
      },
      validation: {
        required: "Obrigatório",
        tooShort: "Muito curto!",
        tooLong: "Muito longo!",
        invalidEmail: "Email inválido",
        emailPlaceholder: "Endereço de email",
        phonePlaceholder: "Ex: +55 13 91234-4321 (opcional)",
      },
      contactImport: {
        title: "Importar contatos de arquivo",
        validation: {
          noNumberField: "Não foi selecionado o campo de número do contato",
          noNameField: "Não foi selecionado o campo de nome do contato",
          noContactsSelected: "Nenhum contato selecionado",
          fieldAlreadySelected: "O campo {{field}} já foi selecionado."
        },
        messages: {
          successComplete: "Importação realizada com sucesso",
          successWithErrors: "Importação realizada com sucesso, mas houveram alguns erros",
          importing: "Importando... Aguarde",
          processing: "Processando arquivo...",
          invalidFile: "Arquivo inválido!",
          contactsCreated: "contatos criados",
          contactsIgnored: "contatos ignorados (número inválido ou não marcados para atualizar)"
        },
        fields: {
          name: "Nome",
          number: "Número",
          email: "E-mail",
          tags: "Tags"
        },
        buttons: {
          validateWhatsApp: "Validar contatos no WhatsApp",
          importContacts: "Importar contatos",
          cancel: "Cancelar",
          back: "Voltar"
        },
        dropzone: {
          clickOrDrag: "Clique ou arraste um arquivo",
          importantNote: "* Importante: Arquivos somente com extensões são aceitas: xls, xslx, csv, txt"
        }
      },
      forwardMessage: {
        text: "Encaminhada",
      },
      forwardMessageModal: {
        title: "Encaminhar mensagem",
        buttons: {
          ok: "Encaminhar",
        },
      },
      promptModal: {
        form: {
          name: "Nome",
          prompt: "Prompt",
          voice: "Voz",
          max_tokens: "Máximo de Tokens na resposta",
          temperature: "Temperatura",
          apikey: "API Key",
          max_messages: "Máximo de mensagens no Histórico",
          voiceKey: "Chave da API de Voz",
          voiceRegion: "Região de Voz",
          model: "Modelo",
        },
        success: "Prompt salvo com sucesso!",
        title: {
          add: "Adicionar Prompt",
          edit: "Editar Prompt",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        validation: {
          tooShort: "Muito curto!",
          tooLong: "Muito longo!",
          required: "Obrigatório",
          promptDescription: "Descreva o treinamento para Inteligência Artificial",
          invalidModel: "Modelo inválido",
          informModel: "Informe o modelo",
          minTokens: "Mínimo 10 tokens",
          maxTokens: "Máximo 4096 tokens",
          informMaxTokens: "Informe o número máximo de tokens",
          minZero: "Mínimo 0",
          maxOne: "Máximo 1",
          informTemperature: "Informe a temperatura",
          informApiKey: "Informe a API Key",
          informQueue: "Informe a fila",
          minMessages: "Mínimo 1 mensagem",
          maxMessages: "Máximo 50 mensagens",
          informMaxMessages: "Informe o número máximo de mensagens",
          informVoiceMode: "Informe o modo para Voz"
        },
        errors: {
          savePrompt: "Erro ao salvar o prompt"
        },
        models: {
          gpt35: "GPT 3.5 Turbo",
          gpt4o: "GPT 4o",
          gemini15flash: "Gemini 1.5 Flash",
          gemini15pro: "Gemini 1.5 Pro",
          gemini20flash: "Gemini 2.0 Flash",
          gemini20pro: "Gemini 2.0 Pro"
        },
        voices: {
          text: "Texto",
          francisca: "Francisca",
          antonio: "Antônio",
          brenda: "Brenda",
          donato: "Donato",
          elza: "Elza",
          fabio: "Fábio",
          giovanna: "Giovanna",
          humberto: "Humberto",
          julio: "Julio",
          leila: "Leila",
          leticia: "Letícia",
          manuela: "Manuela",
          nicolau: "Nicolau",
          valerio: "Valério",
          yara: "Yara"
        }
      },
      prompts: {
        title: "Prompts",
        table: {
          name: "Nome",
          queue: "Setor/Fila",
          max_tokens: "Máximo Tokens Resposta",
          actions: "Ações",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida!",
        },
        buttons: {
          add: "Adicionar Prompt",
        },
        errors: {
          noPermission: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando."
        },
      },
      contactModal: {
        title: {
          add: "Adicionar contato",
          edit: "Editar contato",
        },
        form: {
          mainInfo: "Dados do contato",
          extraInfo: "Informações adicionais",
          name: "Nome",
          number: "Número do Whatsapp",
          email: "Email",
          extraName: "Nome do campo",
          extraValue: "Valor",
          chatBotContact: "Desabilitar chatbot",
          termsLGDP: "Termos LGPD aceito em:",
          whatsapp: "Conexão Origem: ",
          numberPlaceholder: "5513912344321",
          emailPlaceholder: "Endereço de email"
        },
        buttons: {
          addExtraInfo: "Adicionar informação",
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Contato salvo com sucesso.",
      },
      contactTagListModal: {
        title: "Contatos",
        table: {
          id: "ID",
          name: "Nome",
          number: "Número",
          actions: "Ações"
        }
      },
      flowbuilder: {
        title: "Fluxos de conversa",
        subMenus: {
          campaign: "Fluxo de Campanha",
          conversation: "Fluxo de Conversa"
        },
        buttons: {
          add: "Adicionar Fluxo",
          editName: "Editar nome",
          editFlow: "Editar fluxo",
          duplicate: "Duplicar",
          delete: "Excluir"
        },
        table: {
          status: "Status"
        },
        status: {
          active: "Ativo",
          inactive: "Desativado"
        },
        toasts: {
          deleteSuccess: "Fluxo excluído com sucesso",
          duplicateSuccess: "Fluxo duplicado com sucesso"
        },
        confirmationModal: {
          deleteTitle: "Tem certeza que deseja deletar este fluxo? Todas as integrações relacionados serão perdidos.",
          duplicateTitle: "Deseja duplicar o fluxo {flowName}?",
          duplicateMessage: "Tem certeza que deseja duplicar este fluxo?"
        }
      },
      flowbuilderModal: {
        flowNotIdPhrase: "Fluxo padrão",
        title: {
          add: "Adicionar Fluxo",
          edit: "Editar Fluxo"
        },
        validation: {
          tooShort: "Muito curto!",
          tooLong: "Muito longo!",
          required: "Digite um nome!"
        }
      },
      queueModal: {
        title: {
          queueData: "Dados da fila",
          text: "Horários de atendimento",
          add: "Adicionar fila",
          edit: "Editar fila",
          confirmationDelete:
            "Tem certeza? Todas as opções de integrações serão deletadas.",
        },
        form: {
          name: "Nome",
          color: "Cor",
          orderQueue: "Ordem da fila (Bot)",
          rotate: "Rodízio",
          timeRotate: "Tempo de Rodízio",
          greetingMessage: "Mensagem de saudação",
          complationMessage: "Mensagem de conclusão",
          outOfHoursMessage: "Mensagem de fora de expediente",
          token: "Token",
          integrationId: "Integração",
          fileListId: "Lista de arquivos",
          closeTicket: "Fechar ticket",
          queueType: "Tipo de menu",
          message: "Mensagem de retorno",
          queue: "Fila para transferência",
          integration: "Integração",
          file: "Lista de arquivos",
          selectFile: "Selecione um arquivo",
          timeOptions: {
            minutes2: "2 minutos",
            minutes5: "5 minutos",
            minutes10: "10 minutos",
            minutes15: "15 minutos",
            minutes30: "30 minutos",
            minutes45: "45 minutos",
            minutes60: "60 minutos",
          },
        },
        validations: {
          tooShort: "Muito curto!",
          tooLong: "Muito longo!",
          required: "Obrigatório",
          mustHaveFriends: "Deve ter amigos",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        bot: {
          title: "Opções",
          toolTipTitle: "Adicione opções para construir um chatbot",
          toolTip:
            "Se houver apenas uma opção, ela será escolhida automaticamente, fazendo com que o bot responda com a mensagem da opção e siga adiante",
          selectOption: "Selecione uma opção",
          text: "Texto",
          attendent: "Atendente",
          queue: "Fila",
          integration: "Integração",
          file: "Arquivo",
          toolTipMessageTitle:
            "A mensagem é obrigatória para seguir ao próximo nível",
          toolTipMessageContent:
            "A mensagem é obrigatória para seguir ao próximo nível",
          selectUser: "Selecione um Usuário",
          selectQueue: "Selecione uma Fila",
          selectIntegration: "Selecione uma Integração",
          addOptions: "Adicionar opções",
          confirmationDelete: "Tem certeza? Todas as opções internas também serão excluídas",
          messageLabel: "Mensagem:",
          toolTipMessage: "A mensagem é obrigatória para seguir ao próximo nível",
          toolTipContent: "Se a mensagem não estiver definida, o bot não seguirá adiante",
        },
        serviceHours: {
          dayWeek: "Dia da semana",
          startTimeA: "Hora Inicial - Turno A",
          endTimeA: "Hora Final - Turno A",
          startTimeB: "Hora Inicial - Turno B",
          endTimeB: "Hora Final - Turno B",
          monday: "Segunda-feira",
          tuesday: "Terça-feira",
          wednesday: "Quarta-feira",
          thursday: "Quinta-feira",
          friday: "Sexta-feira",
          saturday: "Sábado",
          sunday: "Domingo",
        },
        general: {
          none: "Nenhum",
          message: "Mensagem:",
        },
      },
      colorBoxModal: {
        title: "Escolha uma cor",
        buttons: {
          cancel: "Cancelar",
          ok: "OK",
        },
      },
      queueIntegrationModal: {
        title: {
          add: "Adicionar projeto",
          edit: "Editar projeto",
        },
        form: {
          id: "ID",
          type: "Tipo",
          name: "Nome",
          projectName: "Nome do Projeto",
          language: "Linguagem",
          jsonContent: "JsonContent",
          urlN8N: "URL",
          typebotSlug: "Typebot - Slug",
          typebotExpires: "Tempo em minutos para expirar uma conversa",
          typebotKeywordFinish: "Palavra para finalizar o ticket",
          typebotKeywordRestart: "Palavra para reiniciar o fluxo",
          typebotRestartMessage: "Mensagem ao reiniciar a conversa",
          typebotUnknownMessage: "Mensagem de opção inválida",
          typebotDelayMessage: "Intervalo (ms) entre mensagens",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
          test: "Testar Bot",
        },
        languages: {
          "pt-BR": "Português",
          "en": "Inglês",
          "es": "Español",
        },
        messages: {
          testSuccess: "Integração testada com sucesso!",
          addSuccess: "Integração adicionada com sucesso.",
          editSuccess: "Integração editada com sucesso.",
        },
      },
      userModal: {
        warning:
          "Para fazer a importação das mensagens é necessário ler o qrCode novamente !!!",
        title: {
          add: "Adicionar usuário",
          edit: "Editar usuário",
          updateImage: "Atualizar imagem",
          removeImage: "Excluir imagem",
        },
        form: {
          name: "Nome",
          canViewAllContacts: "Visualizar Todos os Contatos",
          none: "Nenhuma",
          email: "Email",
          password: "Senha",
          farewellMessage: "Mensagem de despedida",
          profile: "Perfil",
          startWork: "Inicio de trabalho",
          endWork: "Fim de trabalho",
          whatsapp: "Conexão Padrão",
          allTicketEnable: "Habilitado",
          allTicketDisable: "Desabilitado",
          allTicket: "Visualizar chamados sem fila",
          allowGroup: "Permitir Grupos",
          defaultMenuOpen: "Aberto",
          defaultMenuClosed: "Fechado",
          defaultMenu: "Menu padrão",
          defaultTheme: "Tema Padrão",
          defaultThemeDark: "Escuro",
          defaultThemeLight: "Claro",
          allHistoric: "Ver conversas de outras filas",
          allHistoricEnabled: "Habilitado",
          allHistoricDisabled: "Desabilitado",
          allUserChat: "Ver conversas de outros usuários",
          userClosePendingTicket: "Permitir fechar tickets pendentes",
          showDashboard: "Ver Dashboard",
          allowRealTime: "Ver Painel de Atendimentos",
          allowConnections: "Permitir ações nas conexões",
        },
        tabs: {
          general: "Geral",
          permissions: "Permissões",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
          addImage: "Adicionar Imagem",
          editImage: "Editar Imagem",
        },
        success: "Usuário salvo com sucesso.",
      },
      companyModal: {
        title: {
          add: "Adicionar empresa",
          edit: "Editar empresa",
        },
        form: {
          name: "Nome",
          email: "Email",
          passwordDefault: "Senha",
          numberAttendants: "Usuários",
          numberConections: "Conexões",
          status: "Ativo",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Empresa salvo com sucesso.",
        validations: {
          nameRequired: "Nome é obrigatório",
          emailInvalid: "Email é inválido",
          emailRequired: "E-mail é obrigatório",
          passwordRequired: "Senha é obrigatória",
          tooShort: "Muito curto!",
          tooLong: "Muito longo!",
        },
      },
      scheduleModal: {
        title: {
          add: "Novo Agendamento",
          edit: "Editar Agendamento",
        },
        form: {
          body: "Mensagem",
          contact: "Contato",
          sendAt: "Data de Agendamento",
          sentAt: "Data de Envio",
          assinar: "Enviar Assinatura"
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
          addSchedule: "Adicionar agendamento"
        },
        success: "Agendamento salvo com sucesso.",
        validations: {
          tooShort: "Mensagem muito curta",
          required: "Obrigatório"
        },
        toasts: {
          deleted: "Mídia removida com sucesso."
        },
        confirmationModal: {
          deleteTitle: "Excluir Mídia",
          deleteMessage: "Tem certeza que deseja excluir esta mídia?"
        },
        status: {
          sending: "Enviando",
          pending: "Pendente",
          sent: "Enviado",
          error: "Erro de Envio"
        },
        recurrence: {
          title: "Recorrência",
          description: "Você pode escolher enviar a mensagem de forma recorrente e escolher o intervalo. Caso seja uma mensagem a ser enviada uma unica vez, não altere nada nesta seção.",
          interval: "Intervalo",
          intervalValue: "Valor do Intervalo",
          sendTimes: "Enviar quantas vezes",
          intervalTypes: {
            days: "Dias",
            weeks: "Semanas",
            months: "Meses",
            minutes: "Minutos"
          },
          businessDays: {
            normal: "Enviar normalmente em dias não úteis",
            before: "Enviar um dia útil antes",
            after: "Enviar um dia útil depois"
          }
        },
        calendar: {
          messages: {
            date: "Data",
            time: "Hora",
            event: "Evento",
            allDay: "Dia Todo",
            week: "Semana",
            work_week: "Agendamentos",
            day: "Dia",
            month: "Mês",
            previous: "Anterior",
            next: "Próximo",
            yesterday: "Ontem",
            tomorrow: "Amanhã",
            today: "Hoje",
            agenda: "Agenda",
            noEventsInRange: "Não há agendamentos no período.",
            showMore: "mais"
          }
        },
        permissions: {
          noAccess: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando."
        }
      },
      tagModal: {
        title: {
          add: "Nova Tag",
          edit: "Editar Tag",
          addKanban: "Nova Lane",
          editKanban: "Editar Lane",
        },
        form: {
          name: "Nome",
          color: "Cor",
          timeLane: "Tempo em horas para redirecionar para lane",
          nextLaneId: "Lane",
          greetingMessageLane: "Mensagem de saudação da lane",
          rollbackLaneId: "Voltar para Lane após retomar atendimento"
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        validation: {
          tooShort: "Mensagem muito curta",
          required: "Obrigatório"
        },
        success: "Tag salva com sucesso.",
        successKanban: "Lane salva com sucesso.",
      },
      fileModal: {
        title: {
          add: "Adicionar lista de arquivos",
          edit: "Editar lista de arquivos",
        },
        buttons: {
          okAdd: "Salvar",
          okEdit: "Editar",
          cancel: "Cancelar",
          fileOptions: "Adicionar arquivo",
        },
        form: {
          name: "Nome da lista de arquivos",
          message: "Detalhes da lista",
          fileOptions: "Lista de arquivos",
          extraName: "Mensagem para enviar com arquivo",
          extraValue: "Valor da opção",
        },
        success: "Lista de arquivos salva com sucesso!",
      },
      chat: {
        noTicketMessage: "Selecione um ticket para começar a conversar.",
        deleteConversationTitle: "Excluir Conversa",
        deleteConversationMessage: "Esta ação não pode ser revertida, confirmar?",
        messagePlaceholder: "Digite sua mensagem...",
        sendButtonTooltip: "Enviar mensagem",
        noMessagesYet: "Nenhuma mensagem ainda. Comece a conversa!",
        loadingMessages: "Carregando mensagens...",
        popover: {
          buttonTooltip: "Conversas internas",
          loading: "Carregando conversas...",
          noChats: "Nenhuma conversa disponível",
          notificationNotSupported: "Este navegador não suporta notificações",
          accessibilityLabel: "Lista de conversas internas",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop:
            "⬇️ ARRASTE E SOLTE ARQUIVOS NO CAMPO ABAIXO ⬇️",
          titleFileList: "Lista de arquivo(s)",
        },
      },
      chatInternal: {
        new: "Nova",
        tabs: {
          chats: "Chats",
          messages: "Mensagens",
        },
        form: {
          titleLabel: "Título",
          titlePlaceholder: "Título",
        },
        modal: {
          conversation: "Conversa",
          title: "Título",
          filterUsers: "Filtro por Usuários",
          cancel: "Fechar",
          save: "Salvar",
        },
        modalDelete: {
          title: "Excluir Conversa",
          message: "Esta ação não pode ser revertida, confirmar?",
        },
      },
      ticketsManager: {
        questionCloseTicket: "VOCÊ DESEJA FECHAR TODOS OS TICKETS?",
        yes: "SIM",
        not: "NÃO",
        buttons: {
          newTicket: "Novo",
          resolveAll: "Resolver Todos",
          close: "Fechar",
          new: "Novo",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Filas",
      },
      tickets: {
        inbox: {
          closedAllTickets: "Fechar todos os tickets?",
          closedAll: "Fechar Todos",
          newTicket: "Novo Ticket",
          yes: "SIM",
          no: "NÃO",
          open: "Abertos",
          resolverd: "Resolvidos",
        },
        toasts: {
          deleted: "O atendimento que você estava foi deletado.",
        },
        notification: {
          message: "Mensagem de",
        },
        tabs: {
          open: { title: "Abertas" },
          closed: { title: "Resolvidos" },
          search: { title: "Busca" },
        },
        search: {
          placeholder: "Buscar atendimento e mensagens",
          filterConections: "Filtro por Conexão",
          filterConectionsOptions: {
            open: "Aberto",
            closed: "Fechado",
            pending: "Pendente",
          },
          filterUsers: "Filtro por Usuarios",
          filterContacts: "Filtro por Contatos",
          ticketsPerPage: "Tickets por página",
        },
        buttons: {
          showAll: "Todos",
          returnQueue: "Devolver a Fila",
          scredule: "Agendamento",
          deleteTicket: "Deletar Ticket",
          quickMessageFlash: "Respostas rápidas",
        },
        noContactName: "(sem contato)",
        noDepartment: "Sem departamento",
        group: "Grupo",
        transferTooltip: "Transferir Ticket",
        closedTicket: {
          closedMessage: "Fechar Ticket Com Mensagem de Despedida",
          closedNotMessage: "Fechar Ticket Sem Mensagem de Despedida",
        },
      },
      messages: {
        download: "Download",
        today: "HOJE",
        contact: "Contato",
        forwarded: "Encaminhada",
        deletedByContact: "🚫 Essa mensagem foi apagada pelo contato &nbsp;",
        deletedMessage: "🚫 _Mensagem apagada_ ",
        deletedBySender: "🚫 Essa mensagem foi apagada &nbsp;",
        youReacted: "Você reagiu... ",
        sayHello: "Diga olá para seu novo contato!",
        dropFile: "Solte o arquivo aqui",
        facebookPolicy: "Você tem 24h para responder após receber uma mensagem, de acordo com as políticas do Facebook.",
        defaultMetaMessage: "Olá! Tenho interesse e queria mais informações, por favor.",
      },
      ticketsResponsive: {
        search: {
          searchInMessagesTooltip: "Marque para pesquisar também nos conteúdos das mensagens (mais lento)",
        },
        filter: {
          all: "Todos",
        },
        sort: {
          ascending: "Crescente",
          descending: "Decrescente",
        },
      },
      contactForm: {
        validation: {
          tooShort: "Muito curto!",
          tooLong: "Muito longo!",
          required: "Obrigatório",
          invalidEmail: "Email inválido",
        },
        placeholders: {
          number: "5513912344321",
          email: "Endereço de email",
        },
      },
      common: {
        image: "imagem",
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Digite para buscar usuários",
        fieldQueueLabel: "Transferir para fila",
        fieldQueuePlaceholder: "Selecione uma fila",
        fieldWhatsapp: "Selecione um whatsapp",
        noOptions: "Nenhum usuário encontrado com esse nome",
        msgTransfer: "Observações - mensagem interna, não vai para o cliente",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        called: "Chamado",
        today: "Hoje",
        missedCall: "Chamada de voz/vídeo perdida às",
        pendingHeader: "Aguardando",
        assignedHeader: "Atendendo",
        groupingHeader: "Grupos",
        noTicketsTitle: "Nada aqui!",
        noTicketsMessage:
          "Nenhum atendimento encontrado com esse status ou termo pesquisado",
        noQueue: "Sem Fila",
        buttons: {
          accept: "Aceitar",
          cancel: "Cancelar",
          start: "iniciar",
          closed: "Fechar",
          reopen: "Reabrir",
          transfer: "Transferir",
          ignore: "Ignorar",
          exportAsPDF: "Exportar para PDF",
          kanbanActions: "Opções de Kanban"
        },
        acceptModal: {
          title: "Aceitar Chat",
          queue: "Selecionar setor",
        },
      },
      newTicketModal: {
        title: "Criar Ticket",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        buttons: {
          ok: "Salvar",
          cancel: "Cancelar",
        },
        form: {
          contact: "Contato",
          queue: "Fila",
          message: "Mensagem inicial",
          contactPlaceholder: "Buscar contato...",
          queuePlaceholder: "Selecione uma fila...",
          connectionPlaceholder: "Selecione uma Conexão...",
          messagePlaceholder: "Mensagem inicial opcional..."
        },
        validation: {
          contactRequired: "Você deve selecionar um contato",
          queueRequired: "Selecione uma fila"
        }
      },
      SendContactModal: {
        title: "Enviar contato",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        buttons: {
          ok: "Enviar",
          cancel: "Cancelar",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Conexões",
          chatsTempoReal: "Painel",
          tickets: "Atendimentos",
          quickMessages: "Respostas rápidas",
          contacts: "Contatos",
          queues: "Filas & Chatbot",
          flowbuilder: "Flowbuilder",
          tags: "Tags",
          administration: "Administração",
          companies: "Empresas",
          users: "Usuários",
          settings: "Configurações",
          files: "Lista de arquivos",
          helps: "Ajuda",
          messagesAPI: "API",
          schedules: "Agendamentos",
          campaigns: "Campanhas",
          annoucements: "Informativos",
          chats: "Chat Interno",
          financeiro: "Financeiro",
          queueIntegration: "Integrações",
          version: "Versão",
          kanban: "Kanban",
          prompts: "Prompts",
          allConnections: "Gerenciar conexões",
          reports: "Relatórios",
          management: "Gerência"
        },
        appBar: {
          user: {
            profile: "Perfil",
            logout: "Sair",
            message: "Olá",
            messageEnd: "seja bem-vindo a",
            active: "Ativo até",
            goodMorning: "Oi,",
            myName: "meu nome é",
            continuity: "e darei continuidade em seu atendimento.",
            virtualAssistant: "Assistente Virtual",
            token:
              "Token inválido, por favor entre em contato com o administrador da plataforma.",
          },
          message: {
            location: "Localização",
            contact: "Contato",
          },
          notRegister: "Nenhum registro",
          refresh: "Atualizar",
        },
      },
      languages: {
        undefined: "Idioma",
        "pt-BR": "Português",
        es: "Espanhol",
        en: "Inglês",
        tr: "Turco",
      },
      messagesAPI: {
        title: "API",
        textMessage: {
          number: "Número",
          body: "Mensagem",
          token: "Token cadastrado",
          userId: "ID do usuário/atendente",
          queueId: "ID da Fila",
        },
        mediaMessage: {
          number: "Número",
          body: "Nome do arquivo",
          media: "Arquivo",
          token: "Token cadastrado",
        },
        API: {
          title: "Documentação para envio de mensagens",
          methods: {
            title: "Métodos de Envío",
            messagesText: "Mensagens de Texto",
            messagesMidia: "Mensagens de Media",
          },
          instructions: {
            title: "Instruções",
            comments: "Observações Importantes",
            comments1:
              "Antes de enviar mensagens, é necessário o cadastro do token vinculado à conexão que enviará as mensagens. <br />Para realizar o cadastro acesse o menu 'Conexões', clique no botão editar da conexão e insira o token no devido campo.",
            comments2:
              "O número para envio não deve ter mascara ou caracteres especiais e deve ser composto por:",
            codeCountry: "Código do País",
            code: "DDD",
            number: "Número",
          },
          text: {
            title: "1. Mensagens de Texto",
            instructions:
              "Seguem abaixo a lista de informações necessárias para envio das mensagens de texto:",
          },
          media: {
            title: "2. Mensagens de Media",
            instructions:
              "Seguem abaixo a lista de informações necessárias para envio das mensagens de texto:",
          },
        },
        messages: {
          noPermission: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.",
          success: "Mensagem enviada com sucesso",
        },
        form: {
          send: "Enviar",
          testSend: "Teste de Envio",
        },
        documentation: {
          endpoint: "Endpoint: ",
          method: "Método: ",
          post: "POST",
          headers: "Headers: ",
          headersTextAuth: "Authorization Bearer (token registrado) e Content-Type (application/json)",
          headersMediaAuth: "Authorization Bearer (token cadastrado) e Content-Type (multipart/form-data)",
          body: "Body: ",
          formData: "FormData: ",
          bodyExample: "{\n  \"number\": \"558599999999\",\n  \"body\": \"Message\",\n  \"userId\": \"ID usuário ou \\\"\\\"\",\n  \"queueId\": \"ID Fila ou \\\"\\\"\",\n  \"sendSignature\": \"Assinar mensagem - true/false\",\n  \"closeTicket\": \"Encerrar o ticket - true/false\"\n}",
          formDataFields: {
            number: "number: 558599999999",
            body: "body: Message",
            userId: "userId: ID usuário ou \\\"\\\"",
            queueId: "queueId: ID da fila ou \\\"\\\"",
            medias: "medias: arquivo",
            sendSignature: "sendSignature: Assinar mensagem true/false",
            closeTicket: "closeTicket: Encerrar ticket true/false",
          },
        },
      },
      notifications: {
        noTickets: "Nenhuma notificação.",
      },
      quickMessages: {
        title: "Respostas Rápidas",
        searchPlaceholder: "Pesquisar...",
        noAttachment: "Sem anexo",
        confirmationModal: {
          deleteTitle: "Exclusão",
          deleteMessage: "Esta ação é irreversível! Deseja prosseguir?",
        },
        buttons: {
          add: "Adicionar",
          attach: "Anexar Arquivo",
          cancel: "Cancelar",
          edit: "Editar",
        },
        toasts: {
          success: "Atalho adicionado com sucesso!",
          deleted: "Atalho removido com sucesso!",
        },
        dialog: {
          title: "Mensagem Rápida",
          shortcode: "Atalho",
          message: "Resposta",
          save: "Salvar",
          cancel: "Cancelar",
          geral: "Permitir editar",
          add: "Adicionar",
          edit: "Editar",
          visao: "Permitir visão",
        },
        table: {
          shortcode: "Atalho",
          message: "Mensagem",
          actions: "Ações",
          mediaName: "Nome do Arquivo",
          status: "Status",
        },
      },
      contactLists: {
        title: "Listas de Contatos",
        table: {
          name: "Nome",
          contacts: "Contatos",
          actions: "Ações",
        },
        buttons: {
          add: "Nova Lista",
          downloadSample: "Baixar Planilha Exemplo",
        },
        dialog: {
          name: "Nome",
          company: "Empresa",
          okEdit: "Editar",
          okAdd: "Adicionar",
          add: "Adicionar",
          edit: "Editar",
          cancel: "Cancelar",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        toasts: {
          deleted: "Registro excluído",
          noPermission: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.",
        },
      },
      contactListItems: {
        title: "Contatos",
        searchPlaceholder: "Pesquisa",
        buttons: {
          add: "Novo",
          lists: "Listas",
          import: "Importar",
        },
        dialog: {
          name: "Nome",
          number: "Número",
          whatsapp: "Whatsapp",
          email: "E-mail",
          okEdit: "Editar",
          okAdd: "Adicionar",
          add: "Adicionar",
          edit: "Editar",
          cancel: "Cancelar",
        },
        table: {
          name: "Nome",
          number: "Número",
          whatsapp: "Whatsapp",
          email: "E-mail",
          actions: "Ações",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Esta ação não pode ser revertida.",
          importMessage: "Deseja importar os contatos desta planilha? ",
          importTitlte: "Importar",
        },
        toasts: {
          deleted: "Registro excluído",
        },
        downloadTemplate: "Clique aqui para baixar planilha exemplo.",
        whatsappValid: "Whatsapp Válido",
        whatsappInvalid: "Whatsapp Inválido",
      },
      kanban: {
        title: "Kanban",
        subtitle: "Visualização de tickets em formato Kanban",
        searchPlaceholder: "Pesquisa",
        subMenus: {
          list: "Painel",
          tags: "Lanes",
        },
        ticketNumber: "Ticket nº ",
        viewTicket: "Ver Ticket",
        startDate: "Data de início",
        endDate: "Data de fim",
        search: "Buscar",
        addColumns: "+ Adicionar colunas",
        ticketTagRemoved: "Ticket Tag Removido!",
        ticketTagAdded: "Ticket Tag Adicionado com Sucesso!",
        ticketMoveError: "Erro ao mover ticket",
        iconChannelError: "Erro",
        noTickets: "Nenhum ticket",
        emptyStateTags: "Nenhuma tag Kanban criada",
        emptyStateTagsDescription: "Crie sua primeira tag Kanban para começar a organizar tickets",
        createFirstTag: "Criar Primeira Tag",
        emptyStateTickets: "Nenhum ticket encontrado",
        emptyStateTicketsDescription: "Ajuste os filtros de data ou crie novos tickets",
        errorTitle: "Erro ao carregar Kanban",
        errorDescription: "Ocorreu um erro ao buscar dados. Tente novamente.",
        retry: "Tentar Novamente",
      },
      campaigns: {
        title: "Campanhas",
        searchPlaceholder: "Pesquisa",
        subMenus: {
          list: "Listagem",
          listContacts: "Lista de contatos",
          settings: "Configurações",
        },
        status: {
          inactive: "Inativa",
          scheduled: "Programada",
          inProgress: "Em Andamento",
          cancelled: "Cancelada",
          finished: "Finalizada",
        },
        common: {
          none: "Nenhuma",
          notDefined: "Não definida",
          noSchedule: "Sem agendamento",
          notCompleted: "Não concluída",
          enabled: "Habilitada",
          disabled: "Desabilitada",
        },
        modal: {
          tabLabels: {
            msg1: "Msg. 1",
            msg2: "Msg. 2",
            msg3: "Msg. 3",
            msg4: "Msg. 4",
            msg5: "Msg. 5",
          },
          helpText: "Utilize variáveis como {nome}, {numero}, {email} ou defina variáveis personalizadas.",
        },
        settings: {
          randomInterval: "Intervalo Randômico de Disparo",
          noBreak: "Sem Intervalo",
          intervalGapAfter: "Intervalo maior após",
          undefined: "Não definido",
          messages: "mensagens",
          laggerTriggerRange: "Intervalo de disparo maior",
          addVar: "Adicionar variável",
          save: "Salvar",
          close: "Fechar",
          add: "Adicionar",
          shortcut: "Atalho",
          content: "Conteúdo",
        },
        buttons: {
          add: "Nova Campanha",
          contactLists: "Listas de Contatos",
          stopCampaign: "Parar Campanha",
        },
        table: {
          name: "Nome",
          whatsapp: "Conexão",
          contactList: "Lista de Contatos",
          option: "Nenhuma",
          disabled: "Desabilitada",
          enabled: "Habilitada",
          status: "Status",
          scheduledAt: "Agendamento",
          completedAt: "Concluída",
          confirmation: "Confirmação",
          actions: "Ações",
        },
        dialog: {
          new: "Nova Campanha",
          update: "Editar Campanha",
          readonly: "Apenas Visualização",
          help: "Utilize variáveis como {nome}, {numero}, {email} ou defina variáveis personalizadas.",
          form: {
            name: "Nome",
            message1: "Mensagem 1",
            message2: "Mensagem 2",
            message3: "Mensagem 3",
            message4: "Mensagem 4",
            message5: "Mensagem 5",
            confirmationMessage1: "Mensagem de Confirmação 1",
            confirmationMessage2: "Mensagem de Confirmação 2",
            confirmationMessage3: "Mensagem de Confirmação 3",
            confirmationMessage4: "Mensagem de Confirmação 4",
            confirmationMessage5: "Mensagem de Confirmação 5",
            messagePlaceholder: "Conteúdo da mensagem",
            whatsapp: "Conexão",
            status: "Status",
            scheduledAt: "Agendamento",
            confirmation: "Confirmação",
            contactList: "Lista de Contato",
            tagList: "Tags",
            statusTicket: "Status do Ticket",
            openTicketStatus: "Aberto",
            pendingTicketStatus: "Pendente",
            closedTicketStatus: "Fechado",
            enabledOpenTicket: "Habilitado",
            disabledOpenTicket: "Desabilitado",
            openTicket: "Abrir ticket",
          },
          buttons: {
            add: "Adicionar",
            edit: "Atualizar",
            okadd: "Ok",
            cancel: "Cancelar Disparos",
            restart: "Reiniciar Disparos",
            close: "Fechar",
            attach: "Anexar Arquivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        toasts: {
          success: "Operação realizada com sucesso",
          cancel: "Campanha cancelada",
          restart: "Campanha reiniciada",
          deleted: "Registro excluído",
        },
        noPermission: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.",
      },
      campaignReport: {
        title: "Relatório de",
        inactive: "Inativa",
        scheduled: "Programada",
        process: "Em Andamento",
        cancelled: "Cancelada",
        finished: "Finalizada",
        campaign: "Campanha",
        validContacts: "Contatos Válidos",
        confirmationsRequested: "Confirmações Solicitadas",
        confirmations: "Confirmações",
        deliver: "Entregues",
        connection: "Conexão",
        contactLists: "Lista de Contatos",
        schedule: "Agendamento",
        conclusion: "Conclusão",
        noPermission: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.",
        status: "Status:",
        of: "de",
      },
      announcements: {
        title: "Informativos",
        searchPlaceholder: "Pesquisa",
        active: "Ativo",
        inactive: "Inativo",
        buttons: {
          add: "Novo Informativo",
          contactLists: "Listas de Informativos",
        },
        table: {
          priority: "Prioridade",
          title: "Title",
          text: "Texto",
          mediaName: "Arquivo",
          status: "Status",
          actions: "Ações",
        },
        dialog: {
          edit: "Edição de Informativo",
          add: "Novo Informativo",
          update: "Editar Informativo",
          readonly: "Apenas Visualização",
          form: {
            priority: "Prioridade",
            title: "Title",
            text: "Texto",
            mediaPath: "Arquivo",
            status: "Status",
            high: "Alta",
            medium: "Média",
            low: "Baixa",
            active: "Ativo",
            inactive: "Inativo",
          },
          buttons: {
            add: "Adicionar",
            edit: "Atualizar",
            okadd: "Ok",
            cancel: "Cancelar",
            close: "Fechar",
            attach: "Anexar Arquivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        toasts: {
          success: "Operação realizada com sucesso",
          deleted: "Registro excluído",
        },
      },
      campaignsConfig: {
        title: "Configurações de Campanhas",
        noPermissionMessage: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.",
        settingsSaved: "Configurações salvas",
        intervals: "Intervalos",
        seconds: "segundos",
      },
      campaignsPhrase: {
        title: "Campanhas",
        phraseDeleted: "Frase deletada",
        phraseUpdated: "Frase alterada com sucesso!",
        phraseCreated: "Frase criada com sucesso!",
        addCampaign: "Campanha",
        table: {
          name: "Nome",
          status: "Status",
          active: "Ativo",
          inactive: "Desativado",
          empty: "Nenhuma campanha por frase encontrada",
        },
        modal: {
          editTitle: "Editar campanha com fluxo por frase",
          newTitle: "Nova campanha com fluxo por frase",
          nameLabel: "Nome do disparo por frase",
          flowLabel: "Escolha um fluxo",
          flowPlaceholder: "Escolha um fluxo",
          connectionPlaceholder: "Selecione uma Conexão",
          phraseLabel: "Qual frase dispara o fluxo?",
          matchTypeLabel: "Tipo de correspondência",
          matchTypeExact: "Correspondência Exata",
          matchTypeContains: "Contém a palavra",
          matchTypeTooltip: "Exata: mensagem deve ser igual à palavra. Contém: palavra pode aparecer em qualquer parte da mensagem",
          statusLabel: "Status",
          cancelButton: "Cancelar",
          saveButton: "Salvar campanha",
          createButton: "Criar campanha",
        },
      },
      queues: {
        title: "Filas & Chatbot",
        table: {
          name: "Nome",
          color: "Cor",
          greeting: "Mensagem de saudação",
          orderQueue: "Ordenação da fila (bot)",
          actions: "Ações",
          ID: "ID",
        },
        buttons: {
          add: "Adicionar fila",
        },
        toasts: {
          success: "Fila salva com sucesso",
          deleted: "Fila excluída com sucesso",
          queueDeleted: "Fila excluída com sucesso!",
          botSaved: "Bot salvo com sucesso",
          clickToSave: "Clique em salvar para registrar as alterações",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Você tem certeza? Essa ação não pode ser revertida! Os atendimentos dessa fila continuarão existindo, mas não terão mais nenhuma fila atribuída.",
        },
      },
      queue: {
        queueData: "Dados",
      },
      queueSelect: {
        inputLabel: "Filas",
        inputLabelRO: "Filas somente leitura",
        withoutQueue: "Sem fila",
        undefined: "Fila não encontrada",
        errors: {
          loadError: "QUEUESELETSINGLE >>>"
        }
      },
      reports: {
        title: "Relatórios de Atendimentos",
        table: {
          id: "Ticket",
          user: "Usuário",
          dateOpen: "Data Abertura",
          dateClose: "Data Fechamento",
          NPS: "NPS",
          status: "Status",
          whatsapp: "Conexão",
          queue: "Fila",
          actions: "Ações",
          lastMessage: "Últ. Mensagem",
          contact: "Cliente",
          supportTime: "Tempo de Atendimento",
        },
        buttons: {

          filter: "Aplicar Filtro",
          onlyRated: "Apenas Avaliados",
        },
        searchPlaceholder: "Pesquisar...",

      },
      queueIntegration: {
        title: "Integrações",
        table: {
          id: "ID",
          type: "Tipo",
          name: "Nome",
          projectName: "Nome do Projeto",
          language: "Linguagem",
          lastUpdate: "Ultima atualização",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar Projeto",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Você tem certeza? Essa ação não pode ser revertida! e será removida das filas e conexões vinculadas",
        },
        toasts: {
          deleted: "Integração deletada com sucesso!",
        },
        messages: {
          noPermission: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.",
        },
      },
      users: {
        title: "Usuários",
        table: {
          status: "Status",
          avatar: "Avatar",
          name: "Nome",
          email: "Email",
          profile: "Perfil",
          startWork: "Inicio de trabalho",
          endWork: "Fim de trabalho",
          actions: "Ações",
          ID: "ID",
        },
        profile: {
          admin: "Admin",
          user: "Usuário",
        },
        status: {
          enabled: "Habilitado",
          disabled: "Desabilitado",
        },
        upload: {
          avatar: "Enviar Avatar",
        },
        buttons: {
          add: "Adicionar usuário",
        },
        toasts: {
          deleted: "Usuário excluído com sucesso.",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Todos os dados do usuário serão perdidos. Os atendimento abertos deste usuário serão movidos para a fila.",
        },
      },
      compaies: {
        title: "Empresas",
        form: {
          documentLabel: "CPF/CNPJ (opcional)",
          documentPlaceholder: "000.000.000-00 ou 00.000.000/0000-00",
          documentInvalid: "CPF/CNPJ inválido",
          documentDuplicate: "CPF/CNPJ já cadastrado no sistema",
          documentNotProvided: "Não informado",
          nameRequired: "Nome é obrigatório",
          emailRequired: "E-mail é obrigatório",
        },
        table: {
          ID: "ID",
          status: "Ativo",
          name: "Nome",
          email: "Email",
          password: "Senha",
          phone: "Telefone",
          plan: "Plano",
          active: "Ativo",
          numberAttendants: "Atendentes",
          numberConections: "Conexões",
          value: "Valor",
          namePlan: "Nome Plano",
          numberQueues: "Filas",
          useCampaigns: "Campanhas",
          useExternalApi: "Rest API",
          useFacebook: "Facebook",
          useInstagram: "Instagram",
          useWhatsapp: "Whatsapp",
          useInternalChat: "Chat Interno",
          useSchedules: "Agendamento",
          createdAt: "Criada Em",
          dueDate: "Vencimento",
          lastLogin: "Ult. Login",
          actions: "Ações",
          money: "R$",
          yes: "Sim",
          no: "Não",
          folderSize: "Tamanho da pasta",
          totalFiles: "Total de arquivos",
          lastUpdate: "Ultimo update",
          document: "CNPJ/CPF",
          recurrence: "Recorrência",
          monthly: "Mensal",
          bimonthly: "Bimestral",
          quarterly: "Trimestral",
          semester: "Semestral",
          yearly: "Anual",
          clear: "Limpar",
          delete: "Excluir",
          user: "Usuário",
          save: "Salvar",
        },
        searchPlaceholder: "Buscar empresas...",
        searchLabel: "Campo de busca de empresas",
        clearSearch: "Limpar busca",
        buttons: {
          add: "Adicionar empresa",
        },
        toasts: {
          deleted: "Empresa excluído com sucesso.",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Todos os dados da empresa serão perdidos. Os tickets abertos deste usuário serão movidos para a fila.",
        },
        notifications: {
          noPermission: "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.",
        },
      },
      plans: {
        form: {
          name: "Nome",
          users: "Usuários",
          connections: "Conexões",
          campaigns: "Campanhas",
          schedules: "Agendamentos",
          enabled: "Habilitadas",
          disabled: "Desabilitadas",
          clear: "Cancelar",
          delete: "Excluir",
          save: "Salvar",
          yes: "Sim",
          no: "Não",
          money: "R$",
          public: "Público"
        },
      },
      helps: {
        title: "Central de Ajuda",
        thumbnail: "Miniatura",
        videoPlayerTitle: "Player de vídeo do YouTube",
        settings: {
          codeVideo: "Código do Video",
          description: "Descrição",
          clear: "Limpar",
          delete: "Excluir",
          save: "Salvar",
        },
      },
      schedules: {
        title: "Agendamentos",
        confirmationModal: {
          deleteTitle: "Você tem certeza que quer excluir este Agendamento?",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        table: {
          contact: "Contato",
          body: "Mensagem",
          sendAt: "Data de Agendamento",
          sentAt: "Data de Envio",
          status: "Status",
          actions: "Ações",
        },
        buttons: {
          add: "Novo Agendamento",
        },
        toasts: {
          deleted: "Agendamento excluído com sucesso.",
        },
      },
      tags: {
        title: "Tags",
        confirmationModal: {
          deleteTitle: "Você tem certeza que quer excluir esta Tag?",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        table: {
          id: "ID",
          name: "Nome",
          kanban: "Kanban",
          color: "Cor",
          tickets: "Registros Tags",
          contacts: "Contatos",
          actions: "Ações",
        },
        buttons: {
          add: "Nova Tag",
        },
        toasts: {
          deleted: "Tag excluído com sucesso.",
        },
      },
      tagsKanban: {
        title: "Lanes",
        laneDefault: "Em aberto",
        confirmationModal: {
          deleteTitle: "Você tem certeza que quer excluir esta Lane?",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        table: {
          name: "Nome",
          color: "Cor",
          tickets: "Tickets",
          actions: "Ações",
        },
        buttons: {
          add: "Nova Lane",
          backToKanban: "Voltar para o Kanban",
        },
        toasts: {
          deleted: "Lane excluída com sucesso.",
        },
      },
      files: {
        title: "Lista de arquivos",
        table: {
          name: "Nome",
          contacts: "Contatos",
          actions: "Ação",
        },
        toasts: {
          deleted: "Lista excluída com sucesso!",
          deletedAll: "Todas as listas foram excluídas com sucesso!",
        },
        buttons: {
          add: "Adicionar",
          deleteAll: "Deletar Todos",
        },
        confirmationModal: {
          deleteTitle: "Deletar",
          deleteAllTitle: "Deletar Todos",
          deleteMessage: "Tem certeza que deseja deletar esta lista?",
          deleteAllMessage: "Tem certeza que deseja deletar todas as listas?",
        },
      },
      settings: {
        success: "Configurações salvas com sucesso.",
        currency: "Moeda",
        title: "Configurações",
        tabs: {
          options: "Opções",
          schedules: "Horários",
          companies: "Empresas",
          plans: "Planos",
          helps: "Ajuda",
          whitelabel: "Whitelabel",
          timezone: "Fuso Horário",
        },
        settingsConfig: {
          userCreation: {
            name: "Criação de usuário",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          options: {
            disabled: "Desabilitado",
            enabled: "Habilitado",
            updating: "Atualizando...",
            creationCompanyUser: "Criação de Company/Usuário",
            evaluations: "Avaliações",
            officeScheduling: "Agendamento de Expediente",
            queueManagement: "Gerenciamento por Fila",
            companyManagement: "Gerenciamento por Empresa",
            connectionManagement: "Gerenciamento por Conexão",
            sendGreetingAccepted: "Enviar saudação ao aceitar o ticket",
            sendMsgTransfTicket:
              "Enviar mensagem transferência de setor/atendente",
            checkMsgIsGroup: "Ignorar Mensagens de Grupos",
            chatBotType: "Tipo do Bot",
            userRandom: "Escolher atendente aleatório",
            buttons: "Botões",
            acceptCallWhatsapp: "Informar que não aceita ligação no whatsapp?",
            sendSignMessage: "Permite atendente escolher ENVIAR Assinatura",
            sendGreetingMessageOneQueues:
              "Enviar saudação quando houver somente 1 fila",
            sendQueuePosition: "Enviar mensagem com a posição da fila",
            sendFarewellWaitingTicket:
              "Enviar mensagem de despedida no Aguardando",
            acceptAudioMessageContact:
              "Aceita receber audio de todos contatos?",
            enableLGPD: "Habilitar tratamento LGPD",
            requiredTag: "Tag obrigatoria para fechar ticket",
            closeTicketOnTransfer: "Fechar ticket ao transferir para outra fila",
            DirectTicketsToWallets: "Mover automaticamente cliente para carteira",
            showNotificationPending: "Mostrar notificação para tickets pendentes"
          },
          customMessages: {
            sendQueuePositionMessage: "Mensagem de posição na fila",
            AcceptCallWhatsappMessage: "Mensagem para informar que não aceita ligações",
            greetingAcceptedMessage: "Mensagem de Saudação ao aceitar ticket",
            transferMessage: "Mensagem de transferência - ${queue.name} = fila destino",
          },
          LGPD: {
            title: "LGPD",
            welcome: "Mensagem de boas vindas(LGPD)",
            linkLGPD: "Link da política de privacidade",
            obfuscateMessageDelete: "Ofuscar mensagem apagada",
            alwaysConsent: "Sempre solicitar consentimento",
            obfuscatePhoneUser: "Ofuscar número telefone para usuários",
            enabled: "Habilitado",
            disabled: "Desabilitado",
          },
        },
        toasts: {
          schedulesSavedSuccess: "Horários atualizados com sucesso.",
          operationUpdatedSuccess: "Operação atualizada com sucesso.",
          recordsLoadError: "Não foi possível carregar a lista de registros",
          operationSuccess: "Operação realizada com sucesso!",
          operationError: "Não foi possível realizar a operação. Verifique se já existe um registro com o mesmo nome ou se os campos foram preenchidos corretamente",
          operationDeleteError: "Não foi possível realizar a operação",
          imageUploadProgress: "A imagem está {{progress}}% carregada...",
          imageUploadError: "Houve um problema ao realizar o upload da imagem.",
          companyOperationError: "Não foi possível realizar a operação. Verifique se já existe uma empresa com o mesmo nome ou se os campos foram preenchidos corretamente",
          planOperationError: "Não foi possível realizar a operação. Verifique se já existe uma plano com o mesmo nome ou se os campos foram preenchidos corretamente",
          helpOperationError: "Não foi possível realizar a operação. Verifique se já existe uma helpo com o mesmo nome ou se os campos foram preenchidos corretamente",
        },
        whitelabel: {
          primaryColorLight: "Cor Primária Modo Claro",
          primaryColorDark: "Cor Primária Modo Escuro",
          systemName: "Nome do sistema",
          lightLogo: "Logotipo claro",
          darkLogo: "Logotipo escuro",
          favicon: "Favicon",
        },
        timezone: {
          companyTimezone: {
            title: "Fuso Horário da Empresa",
            selectLabel: "Selecione o fuso horário",
            customHelperText: "Fuso horário personalizado para esta empresa",
            inheritedHelperText: "Usando o fuso horário padrão do sistema",
          },
          defaultTimezone: {
            title: "Fuso Horário Padrão do Sistema",
            selectLabel: "Selecione o fuso horário padrão",
            helperText: "Este fuso horário será usado por padrão para todas as empresas que não tiverem um fuso horário personalizado",
          },
          buttons: {
            save: "Salvar",
            useDefault: "Usar Padrão",
            saveDefault: "Salvar Padrão",
          },
          preview: {
            currentTime: "Horário Atual",
            defaultTime: "Horário Padrão",
          },
          status: {
            custom: "Personalizado",
            inherited: "Herdado",
          },
          errors: {
            fetchAvailableTimezones: "Erro ao carregar fusos horários disponíveis",
            fetchCompanyTimezone: "Erro ao carregar fuso horário da empresa",
            updateDefaultTimezone: "Erro ao atualizar fuso horário padrão",
            updateCompanyTimezone: "Erro ao atualizar fuso horário da empresa",
          },
          success: {
            defaultTimezoneUpdated: "Fuso horário padrão atualizado com sucesso",
            companyTimezoneUpdated: "Fuso horário da empresa atualizado com sucesso",
            companyTimezoneReset: "Fuso horário da empresa redefinido com sucesso",
          },
        },
        chatBotType: {
          text: "Texto",
        },
        modals: {
          deleteTitle: "Exclusão de Registro",
          deleteConfirmation: "Deseja realmente excluir esse registro?",
        },
        managers: {
          common: {
            yes: "Sim",
            no: "Não",
          },
          companies: {
            recurrence: "Recorrência",
          },
          plans: {
            queues: "Filas",
            value: "Valor",
            whatsapp: "Whatsapp",
            facebook: "Facebook",
            instagram: "Instagram",
            internalChat: "Chat Interno",
            externalAPI: "API Externa",
            kanban: "Kanban",
            talkAI: "Prompts",
            integrations: "Integrações",
          },
          helps: {
            title: "Título",
            video: "Video",
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Atribuído à:",
          dialogRatingTitle:
            "Deseja deixar uma avaliação de atendimento para o cliente?",
          dialogClosingTitle: "Finalizando o atendimento com o cliente!",
          dialogRatingCancel: "Resolver COM Mensagem de Despedida",
          dialogRatingSuccess: "Resolver e Enviar Avaliação",
          dialogRatingWithoutFarewellMsg: "Resolver SEM Mensagem de Despedida",
          ratingTitle: "Escolha um menu de avaliação",
          notMessage: "Nenhuma mensagem selecionada",
          amount: "Valor de prospecção",
          buttons: {
            return: "Retornar",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceitar",
            rating: "Enviar Avaliação",
            enableIntegration: "Habilitar integração",
            disableIntegration: "Desabilitar integração",
            logTicket: "Logs do Ticket",
            requiredTag: "Você deve atribuir uma tag antes de fechar o ticket.",
          },
        },
      },
      messagesInput: {
        placeholderPrivateMessage:
          "Digite uma mensagem ou aperte / para respostas rápidas",
        placeholderOpen:
          "Digite uma mensagem ou aperte / para respostas rápidas",
        placeholderClosed:
          "Reabra ou aceite esse ticket para enviar uma mensagem.",
        signMessage: "Assinar",
        privateMessage: "Mensagem Privada",
      },
      contactDrawer: {
        header: "Dados do contato",
        buttons: {
          edit: "Editar contato",
          block: "Bloquear",
          unblock: "Desbloquear",
          blockContact: "Bloquear contato",
          unblockContact: "Desbloquear contato",
        },
        toasts: {
          contactBlocked: "Contato bloqueado",
          contactUnblocked: "Contato desbloqueado",
        },
        confirmationModal: {
          blockMessage: "Você realmente deseja bloquear esse contato? Você não receberá mais nenhuma mensagem dele.",
          unblockMessage: "Você realmente deseja desbloquear esse contato? Você poderá começar a receber mensagem dele.",
        },
        extraInfo: "Outras informações",
      },
      messageVariablesPicker: {
        label: "Variavéis disponíveis",
        vars: {
          contactFirstName: "Primeiro Nome",
          contactName: "Nome",
          user: "Atendente",
          greeting: "Saudação",
          protocolNumber: "Protocolo",
          date: "Data",
          hour: "Hora",
          ticket_id: "Nº do Chamado",
          queue: "Setor",
          connection: "Conexão",
        },
      },
      ticketOptionsMenu: {
        schedule: "Agendamento",
        delete: "Deletar",
        transfer: "Transferir",
        registerAppointment: "Observações do Contato",
        resolveWithNoFarewell: "Finalizar sem despedida",
        acceptAudioMessage: "Aceitar áudios do contato?",
        appointmentsModal: {
          title: "Observações do Ticket",
          textarea: "Observação",
          placeholder: "Insira aqui a informação que deseja registrar",
        },
        confirmationModal: {
          title: "Deletar o ticket do contato",
          titleFrom: "do contato ",
          message:
            "Atenção! Todas as mensagens relacionadas ao ticket serão perdidas.",
        },
        buttons: {
          delete: "Excluir",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageInput: {
        tooltip: {
          signature: "Habilitar/Desabilitar Assinatura",
          privateMessage: "Habilitar/Desabilitar Mensagem Privada",
          meet: "Enviar link para videoconferencia",
        },
        type: {
          imageVideo: "Fotos e vídeos",
          cam: "Câmera",
          contact: "Contato",
          meet: "Vídeo chamada",
        },
      },
      messageOptionsMenu: {
        delete: "Deletar",
        reply: "Responder",
        edit: "Editar",
        forward: "Encaminhar",
        toForward: "Encaminhar",
        talkTo: "Conversar Com",
        react: "Reagir",
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta ação não pode ser revertida.",
        },
      },
      invoices: {
        table: {
          invoices: "Faturas",
          details: "Detalhes",
          users: "Usuários",
          connections: "Conexões",
          queue: "Filas",
          value: "Valor",
          expirationDate: "Data Venc.",
          action: "Ação",
        },
      },
      userStatus: {
        online: "Online",
        offline: "Offline",
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
        ERR_NO_DEF_WAPP_FOUND:
          "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.",
        ERR_WAPP_CHECK_CONTACT:
          "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões",
        ERR_WAPP_INVALID_CONTACT: "Este não é um número de Whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
        ERR_INVALID_CREDENTIALS:
          "Erro de autenticação. Por favor, tente novamente.",
        ERR_SENDING_WAPP_MSG:
          "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
        ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Já existe um tíquete aberto para este contato.",
        ERR_TICKET_ALREADY_ACCEPTED: "Este ticket já foi aceito por outro agente.",
        ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
        ERR_USER_CREATION_DISABLED:
          "A criação do usuário foi desabilitada pelo administrador.",
        ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
        ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_TICKET_FOUND: "Nenhum tíquete encontrado com este ID.",
        ERR_NO_USER_FOUND: "Nenhum usuário encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar tíquete no banco de dados.",
        ERR_FETCH_WAPP_MSG:
          "Erro ao buscar a mensagem no WhtasApp, talvez ela seja muito antiga.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Esta cor já está em uso, escolha outra.",
        ERR_WAPP_GREETING_REQUIRED:
          "A mensagem de saudação é obrigatório quando há mais de uma fila.",
        ERR_OUT_OF_HOURS: "Fora do Horário de Expediente!",
        ERR_GENERIC_ERROR: "Ocorreu um erro!",
      },
      flowBuilderConfig: {
        title: "Desenhe seu fluxo",
        actions: {
          import: "Importar",
          export: "Exportar",
          save: "Salvar"
        },
        messages: {
          flowStart: "Inicio do fluxo",
          interval: "Intervalo {{seconds}} seg.",
          rememberSave: "Não se esqueça de salvar seu fluxo!",
          flowSaved: "Fluxo salvo com sucesso"
        },
        nodes: {
          start: "Inicio",
          content: "Conteúdo",
          menu: "Menu",
          optionFormat: "[{{number}}] {{value}}",
          randomizer: "Randomizador",
          interval: "Intervalo",
          ticket: "Ticket",
          typebot: "TypeBot",
          openai: "OpenAI",
          question: "Pergunta",
          image: "Imagem",
          video: "Vídeo",
          audioNode: {
            title: "Audio",
            recordedLive: "Gravado na hora",
            audioSent: "Audio enviado",
            browserNotSupported: "seu navegador não suporta HTML5"
          }
        },
        nodeDescriptions: {
          startFlow: "Este bloco marca o inicio do seu fluxo!"
        },
        edges: {
          edgeWithoutOnDelete: "Edge sem onDelete configurado:",
          errorDeletingEdge: "Erro ao deletar edge:",
          removeEdgeTooltip: "Remover conexão"
        },
        units: {
          seconds: "segundos"
        },
        validation: {
          tooShort: "Muito curto!",
          tooLong: "Muito longo!",
          enterName: "Digite um nome!",
          enterMessage: "Digite uma mensagem!",
          required: "Obrigatório",
          describeAiTraining: "Descreva o treinamento para Inteligência Artificial",
          invalidModel: "Modelo inválido",
          informModel: "Informe o modelo",
          minTokens: "Mínimo 10 tokens",
          maxTokens: "Máximo 4096 tokens",
          informMaxTokens: "Informe o número máximo de tokens",
          minZero: "Mínimo 0",
          maxOne: "Máximo 1",
          informTemperature: "Informe a temperatura",
          informApiKey: "Informe a API Key",
          minOneMessage: "Mínimo 1 mensagem",
          maxFiftyMessages: "Máximo 50 mensagens",
          informMaxMessages: "Informe o número máximo de mensagens",
          informVoiceMode: "Informe o modo para Voz"
        },
        buttons: {
          add: "Adicionar",
          save: "Salvar",
          edit: "Editar"
        },
        modals: {
          condition: {
            addTitle: "Adicionar condição ao fluxo",
            editTitle: "Editar condição",
            fieldLabel: "Campo da condição (Digite apenas 1 chave)",
            validationRule: "Regra de validação",
            conditionValue: "Valor da condição a ser analisada"
          },
          ticket: {
            addQueueError: "Adicione uma fila",
            addTitle: "Adicionar uma fila ao fluxo",
            editTitle: "Editar fila",
            selectConnection: "Selecione uma Conexão"
          },
          randomizer: {
            addIntervalError: "Adicione o valor de intervalo",
            maxTimeError: "Máximo de tempo atingido 120 segundos",
            addTitle: "Adicionar um randomizador ao fluxo",
            editTitle: "Editar randomizador"
          },
          openai: {
            addTitle: "Adicionar OpenAI/Gemini ao fluxo",
            editTitle: "Editar OpenAI/Gemini do fluxo"
          },
          question: {
            addTitle: "Adicionar Pergunta ao fluxo",
            editTitle: "Editar Pergunta",
            createTitle: "Criar Pergunta no fluxo",
            messageLabel: "Mensagem",
            saveAnswer: "Salvar resposta"
          }
        },
        models: {
          gpt35turbo: "GPT 3.5 Turbo",
          gpt4o: "GPT 4o",
          gemini15flash: "Gemini 1.5 Flash",
          gemini15pro: "Gemini 1.5 Pro",
          gemini20flash: "Gemini 2.0 Flash",
          gemini20pro: "Gemini 2.0 Pro"
        },
        voice: {
          text: "Texto",
          francisca: "Francisca",
          antonio: "Antônio",
          brenda: "Brenda",
          donato: "Donato",
          elza: "Elza",
          fabio: "Fábio",
          giovanna: "Giovanna",
          humberto: "Humberto",
          julio: "Julio",
          leila: "Leila",
          leticia: "Letícia",
          manuela: "Manuela",
          nicolau: "Nicolau",
          valerio: "Valério",
          yara: "Yara"
        }
      },
      flowBuilderModals: {
        textModal: {
          titleAdd: "Adicionar mensagem ao fluxo",
          titleEdit: "Editar mensagem ao fluxo",
          buttonAdd: "Adicionar",
          buttonSave: "Salvar",
          fields: {
            message: "Mensagem"
          },
          validation: {
            tooShort: "Muito curto!",
            tooLong: "Muito longo!",
            required: "Digite um nome!",
            messageRequired: "Digite uma mensagem!"
          }
        },
        intervalModal: {
          titleAdd: "Adicionar um intervalo ao fluxo",
          titleEdit: "Editar intervalo",
          buttonAdd: "Adicionar",
          buttonEdit: "Editar",
          fields: {
            timeInSeconds: "Tempo em segundos"
          },
          validation: {
            addValue: "Adicione o valor de intervalo",
            maxTime: "Máximo de tempo atingido 120 segundos"
          }
        },
        menuModal: {
          titleAdd: "Adicionar menu ao fluxo",
          titleEdit: "Editar menu",
          buttonAdd: "Adicionar",
          buttonSave: "Salvar",
          fields: {
            explanationMessage: "Mensagem de explicação do menu",
            addOption: "Adicionar Opção",
            typeOption: "Digite {{number}}",
            optionPlaceholder: "Digite opção"
          }
        },
        singleBlockModal: {
          titleAdd: "Adicionar conteúdo ao fluxo",
          titleEdit: "Editar conteúdo",
          buttonAdd: "Adicionar",
          buttonSave: "Salvar",
          elements: {
            text: "Texto",
            interval: "Intervalo",
            image: "Imagem",
            audio: "Audio",
            video: "Video",
            document: "Documento"
          },
          fields: {
            message: "Mensagem",
            timeInSeconds: "Tempo em segundos",
            sendAsRecordedAudio: "Enviar como audio gravado na hora",
            noFileSelected: "Nenhum arquivo selecionado"
          },
          buttons: {
            sendImage: "Enviar imagem",
            sendAudio: "Enviar audio",
            sendVideo: "Enviar video",
            sendDocument: "Enviar Documento"
          },
          validation: {
            emptyMessageFields: "Campos de mensagem vazio!",
            intervalValidation: "Intervalo não pode ser 0 ou maior que 120!",
            fileTooLarge2MB: "Arquivo é muito grande! 2MB máximo",
            fileTooLarge5MB: "Arquivo é muito grande! 5MB máximo",
            fileTooLarge20MB: "Arquivo é muito grande! 20MB máximo",
            fileTooLarge15MB: "Arquivo é muito grande! 15MB máximo",
            deleteEmptyCards: "Delete os cards vazios ou envie os arquivos pendentes.",
            browserNotSupported: "seu navegador não suporta HTML5",
            onlyMp4Videos: "ATENÇÃO! Apenas vídeos em MP4!"
          },
          messages: {
            contentAddedSuccess: "Conteúdo adicionada com sucesso!",
            uploadingFiles: "Subindo os arquivos e criando o conteúdo...",
            variables: "Variáveis"
          }
        },
        randomizerModal: {
          titleAdd: "Adicionar um randomizador ao fluxo",
          titleEdit: "Editar randomizador",
          buttonAdd: "Adicionar",
          buttonEdit: "Editar"
        },
        ticketModal: {
          titleAdd: "Adicionar uma fila ao fluxo",
          titleEdit: "Editar fila",
          buttonAdd: "Adicionar",
          buttonEdit: "Editar",
          fields: {
            selectConnection: "Selecione uma Conexão"
          },
          validation: {
            addQueue: "Adicione uma fila"
          }
        },
        typebotModal: {
          titleAdd: "Adicionar Typebot ao fluxo",
          titleEdit: "Editar Typebot ao fluxo",
          titleEditFlow: "Editar Typebot do fluxo",
          buttonAdd: "Adicionar",
          buttonSave: "Salvar"
        },
        openaiModal: {
          titleAdd: "Adicionar OpenAI/Gemini ao fluxo",
          titleEdit: "Editar OpenAI/Gemini do fluxo",
          buttonAdd: "Adicionar",
          buttonSave: "Salvar",
          models: {
            gpt35: "GPT 3.5 Turbo",
            gpt4o: "GPT 4o",
            gemini15flash: "Gemini 1.5 Flash",
            gemini15pro: "Gemini 1.5 Pro",
            gemini20flash: "Gemini 2.0 Flash",
            gemini20pro: "Gemini 2.0 Pro"
          },
          voices: {
            text: "Texto",
            francisca: "Francisca",
            antonio: "Antônio",
            brenda: "Brenda",
            donato: "Donato",
            elza: "Elza",
            fabio: "Fábio",
            giovanna: "Giovanna",
            humberto: "Humberto",
            julio: "Julio",
            leila: "Leila",
            leticia: "Letícia",
            manuela: "Manuela",
            nicolau: "Nicolau",
            valerio: "Valério",
            yara: "Yara"
          },
          validation: {
            tooShort: "Muito curto!",
            tooLong: "Muito longo!",
            required: "Obrigatório",
            promptRequired: "Descreva o treinamento para Inteligência Artificial",
            invalidModel: "Modelo inválido",
            minTokens: "Mínimo 10 tokens",
            maxTokens: "Máximo 4096 tokens",
            tokensRequired: "Informe o número máximo de tokens",
            temperatureRequired: "Informe a temperatura",
            temperatureMin: "Mínimo 0",
            temperatureMax: "Máximo 1",
            apiKeyRequired: "Informe a API Key",
            messagesMin: "Mínimo 1 mensagem",
            messagesMax: "Máximo 50 mensagens",
            messagesRequired: "Informe o número máximo de mensagens",
            voiceRequired: "Informe o modo para Voz"
          }
        },
        questionModal: {
          titleAdd: "Adicionar Perguta ao fluxo",
          titleEdit: "Editar Perguta do fluxo",
          titleCreate: "Cria Perguta no fluxo",
          buttonAdd: "Adicionar",
          buttonSave: "Salvar",
          fields: {
            message: "Mensagem",
            saveAnswer: "Salvar resposta"
          }
        }
      },
      moments: {
        title: "Painel de Atendimentos",
        pending: "Pendentes",
        attendances: "Atendimentos: ",
        noQueue: "SEM FILA",
        accessTicket: "Acessar Ticket"
      },
      flowBuilderNodes: {
        message: "Mensagem",
        condition: "Condição",
        image: "Imagem"
      },
      subscription: {
        title: "Assinatura",
        form: {
          licenseLabel: "Período de Licença",
          licenseExpiresIn: "Sua licença vence em {{days}} dias!",
          licenseExpiresToday: "Sua licença vence hoje!",
          billingEmailLabel: "Email de cobrança",
          subscribeButton: "Assine Agora!"
        },
        checkout: {
          form: {
            fullName: "Nome completo*",
            fullNameRequired: "O nome completo é obrigatório",
            lastName: "Sobrenome*",
            lastNameRequired: "O sobrenome é obrigatório",
            address: "Endereço*",
            addressRequired: "O endereço é obrigatório",
            city: "Cidade*",
            cityRequired: "A cidade é obrigatória",
            state: "Estado*",
            stateRequired: "O estado é obrigatório",
            document: "CPF/CNPJ*",
            documentRequired: "CPF/CNPJ é obrigatório",
            documentInvalid: "Formato de CPF/CNPJ inválido",
            country: "País*",
            countryRequired: "País é obrigatório",
            useAddressForPayment: "Usar este endereço para detalhes de pagamento",
            nameOnCard: "Nome no cartão*",
            nameOnCardRequired: "Nome no cartão é obrigatório",
            cardNumber: "Número do cartão*",
            cardNumberRequired: "Número do cartão é obrigatório",
            cardNumberInvalid: "Número do cartão não é válido (ex: 4111111111111)",
            expiryDate: "Data de expiração*",
            expiryDateRequired: "Data de expiração é obrigatória",
            expiryDateInvalid: "Data de expiração não é válida",
            cvv: "CVV*",
            cvvRequired: "CVV é obrigatório",
            cvvInvalid: "CVV é inválido (ex: 357)"
          }
        }
      },
      ticketsResponsive: {
        actions: {
          selectTicket: "Selecionar Ticket",
          transferTicket: "Transferir Ticket",
          spyConversation: "Espiar Conversa"
        },
        tabs: {
          ticket: "Ticket",
          assistance: "Atendimentos"
        },
        search: {
          searchInMessagesTooltip: "Marque para pesquisar também nos conteúdos das mensagens (mais lento)"
        },
        filter: {
          all: "Todos"
        },
        sort: {
          ascending: "Crescente",
          descending: "Decrescente"
        },
        dialog: {
          spyingConversation: "Espiando a conversa",
          loadingMessages: "Carregando mensagens..."
        },
        status: {
          noQueue: "SEM FILA"
        }
      },
      messagesResponsive: {
        types: {
          location: "Localização",
          contact: "Contato"
        },
        actions: {
          download: "Download",
          dropFileHere: "Solte o arquivo aqui"
        },
        status: {
          forwarded: "Encaminhada",
          deletedByContact: "🚫 Essa mensagem foi apagada pelo contato",
          deletedMessage: "🚫 _Mensagem apagada_",
          deletedByMe: "🚫 Essa mensagem foi apagada",
          edited: "Editada"
        },
        reactions: {
          youReacted: "Você reagiu...",
          contactReacted: " reagiu... "
        },
        timestamp: {
          today: "HOJE"
        },
        placeholder: {
          sayHello: "Diga olá para seu novo contato!"
        },
        ads: {
          adClick: "Clique de Anúncio",
          defaultUserMessage: "Olá! Tenho interesse e queria mais informações, por favor."
        },
        warnings: {
          facebookPolicy: "Você tem 24h para responder após receber uma mensagem, de acordo com as políticas do Facebook."
        }
      },
      messageInputResponsive: {
        type: {
          document: "Documento",
          buttons: "Botões"
        },
        tooltip: {
          toggleSignature: "Habilitar/Desabilitar Assinatura",
          toggleComments: "Habilitar/Desabilitar Comentários"
        },
        privateMessage: {
          suffix: "Mensagem Privada"
        }
      },
      tagsResponsive: {
        validation: {
          tooShort: "Tag muito curta!"
        },
        placeholder: "Tags"
      },
      showTicketOpenModal: {
        buttons: {
          close: "Fechar"
        }
      },
      reactions: {
        successMessage: "Reação enviada com sucesso"
      },
      vcardPreview: {
        chatButton: "Conversar"
      },
      locationPreview: {
        viewButton: "Visualizar"
      },
      contactNotes: {
        addedSuccess: "Observação adicionada com sucesso!",
        deletedSuccess: "Observação excluída com sucesso!",
        deleteTitle: "Excluir Registro",
        deleteConfirmation: "Deseja realmente excluir este registro?",
        cancelButton: "Cancelar",
        saveButton: "Salvar"
      },
      validationResponsive: {
        ratingRequired: "Avaliação obrigatória"
      }
    },
  },
};

export { messages };