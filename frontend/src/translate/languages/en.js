const messages = {
  en: {
    translations: {
      signup: {
        title: "Sign Up",
        toasts: {
          success: "User created successfully! Log in now!!!",
          fail: "Error creating user. Please check the provided information.",
          userCreationDisabled: "New user registration is disabled.",
          verificationError: "Error verifying registration permissions.",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
          company: "Organization Name",
          phone: "WhatsApp (AREA CODE + NUMBER)",
          plan: "Plan",
          planDetails: {
            attendants: "Agents",
            whatsapp: "WhatsApp",
            queues: "Queues",
            currency: "$",
          },
        },
        buttons: {
          submit: "Register",
          login: "Already have an account? Log in!",
        },
      },
      validation: {
        tooShort: "Too short!",
        tooLong: "Too long!",
        required: "Required",
        invalidEmail: "Invalid email",
      },
      login: {
        title: "Login",
        logoAlt: "Logo",
        emailLabel: "Email",
        passwordLabel: "Password",
        rememberMe: "Remember me",
        loginButton: "Log In",
        signupButton: "Sign up",
        forgotPassword: "Forgot password?",
        whatsappLabel: "Chat with us on WhatsApp",
        whatsappTitle: "Chat with us on WhatsApp",
        form: {
          email: "Email",
          password: "Password",
          button: "Access",
        },
        buttons: {
          submit: "Log In",
          register: "Don't have an account? Sign up!",
        },
      },
      companies: {
        title: "Companies",
        form: {
          name: "Company Name",
          plan: "Plan",
          token: "Token",
          submit: "Register",
          success: "Company created successfully!",
        },
      },
      auth: {
        toasts: {
          success: "Login successful!",
        },
        dueDate: {
          expiration: "Your subscription expires in",
          days: "days!",
          day: "day!",
          expirationToday: "Your subscription expires today!",
        },
        token: "Token",
      },
      forgotPassword: {
        title: "Reset Password",
        form: {
          emailLabel: "Enter your email",
          submitButton: "Send Reset Link",
          backToLogin: "Back to Login",
        },
        loading: {
          sending: "Sending...",
          sent: "Sent!",
        },
        toasts: {
          success: "Password reset link sent successfully",
        },
      },
      resetPassword: {
        title: "Reset Password",
        form: {
          newPassword: "New Password",
          confirmPassword: "Confirm Password",
        },
        buttons: {
          submit: "Reset Password",
          submitting: "Resetting...",
          submitted: "Reset!",
          backToLogin: "Back to Login",
        },
        errors: {
          passwordMismatch: "Passwords do not match",
          passwordTooShort: "Password must be at least 6 characters long",
          invalidToken: "Reset token is missing or invalid. Please request a new reset link.",
          resetError: "Error resetting password. Please try again.",
        },
        toasts: {
          success: "Password reset successfully",
          passwordMismatch: "Passwords do not match",
          passwordTooShort: "Password must be at least 6 characters long",
        },
      },
      financeiro: {
        title: "Invoices",
        table: {
          details: "Details",
          users: "Users",
          connections: "Connections",
          queues: "Queues",
          value: "Value",
          dueDate: "Due Date",
          status: "Status",
          action: "Action"
        },
        tooltips: {
          details: "Invoice details",
          users: "Number of users",
          connections: "Number of connections",
          queues: "Number of queues",
          value: "Invoice value",
          dueDate: "Due date"
        },
        status: {
          paid: "Paid",
          overdue: "Overdue",
          open: "Open",
          yes: "Yes",
          no: "No",
          overdueFor: "Overdue for {{days}} days",
          dueToday: "Due today",
          dueIn: "Due in {{days}} days"
        },
        buttons: {
          pay: "PAY",
          paid: "PAID",
          payNow: "PAY NOW"
        },
        checkout: {
          title: "Almost there!",
          steps: {
            data: "Data",
            customize: "Customize",
            review: "Review"
          },
          messages: {
            notFound: "Not Found",
            paymentNotice: "After making the payment, refresh the page!",
            subscriptionSuccess: "Subscription completed successfully! Awaiting payment processing"
          },
          buttons: {
            back: "BACK",
            pay: "PAY",
            next: "NEXT"
          },
          pricing: {
            users: "Users",
            connection: "Connection",
            queues: "Queues",
            select: "SELECT",
            perMonth: "/month"
          },
          review: {
            title: "Subscription summary"
          },
          success: {
            total: "TOTAL",
            copied: "Copied",
            copyQr: "Copy QR code",
            finalizeMessage: "To complete, just make the payment by scanning or pasting the Pix code above :)",
            licenseRenewed: "Your license has been renewed until"
          },
          planDetails: {
            title: "Plan details",
            billing: "Billing: Monthly"
          },
          paymentInfo: {
            title: "Payment information",
            email: "Email:",
            name: "Name:",
            document: "CPF/CNPJ:",
            total: "Total:"
          }
        }
      },
      dashboard: {
        title: "Dashboard",
        buttons: {
          filter: "Filter"
        },
        tabs: {
          indicators: "Indicators",
          assessments: "NPS",
          attendants: "Agents",
          performance: "Performances"
        },
        charts: {
          hourlyServices: "Services per hour",
          ticketsLabel: "Tickets",
          score: "Score",
          perDay: {
            title: "Services today: ",
          },
          errorFetchingTickets: "Error fetching ticket information",
          noDataAvailable: "No data available for the selected period.",
        },
        cards: {
          inAttendance: "In Service",
          waiting: "Waiting",
          activeAttendants: "Active Agents",
          finalized: "Completed",
          newContacts: "New Contacts",
          totalReceivedMessages: "Messages Received",
          totalSentMessages: "Messages Sent",
          averageServiceTime: "Avg. Service Time",
          averageWaitingTime: "Avg. Waiting Time",
          status: "Status (Current)",
          activeTickets: "Active Tickets",
          passiveTickets: "Passive Tickets",
          groups: "Groups",
        },
        users: {
          name: "Name",
          numberAppointments: "Number of Services",
          statusNow: "Current",
          totalCallsUser: "Total services per user",
          totalAttendances: "Total services",
          totalLabel: "Total attendances: {{count}}",
          queues: "Queues",
          defaultQueue: "Default Connection",
          workingHours: "Working Hours",
          startWork: "Start Work",
          endWork: "End Work",
          farewellMessage: "Farewell Message",
          theme: "Default Theme",
          menu: "Default Menu",
        },
        date: {
          initialDate: "Start Date",
          finalDate: "End Date",
        },
        licence: {
          available: "Available until",
        },
        assessments: {
          totalCalls: "Total Services",
          callsWaitRating: "Services awaiting rating",
          callsWithoutRating: "Services without rating",
          ratedCalls: "Rated Services",
          evaluationIndex: "Evaluation Index",
          score: "Score",
          prosecutors: "Promoters",
          neutral: "Neutral",
          detractors: "Detractors",
          generalScore: "Overall NPS Score",
        },
        status: {
          online: "Online",
          offline: "Offline",
        },
        filters: {
          title: "Filters",
          initialDate: "Initial",
          finalDate: "Final",
          filterButton: "Filter",
        },
        errors: {
          loadData: "Failed to load dashboard data.",
          exportExcel: "Error exporting to Excel.",
        },
        export: {
          sheetName: "AgentReport",
          fileName: "agent-report.xlsx",
        },
        nps: {
          overallScore: "Overall NPS Score",
        },
      },
      reports: {
        title: "Survey Reports",
        operator: "Operator",
        period: "Period",
        until: "Until",
        date: "Date",
        reportTitle: "Reports",
        calls: "Services",
        search: "Surveys",
        durationCalls: "Service Duration",
        grupoSessions: "Group Services",
        groupTicketsReports: {
          timezone: "America/Sao_Paulo",
          msgToast: "Generating compressed report, please wait.",
          errorToast: "Error generating report",
          back: "Back",
          groupServiceReport: "Group Service Report",
          loading: "Loading...",
          contact: "Contact",
          dateOpen: "Opening Date",
          dateLastUpdated: "Last Updated Date",
          agent: "Who Attended",
          agentClosed: "Who Closed",
          waitingAssistance: "Awaiting Assistance",
          process: "In Service",
        },
        researchReports: {
          response: "response",
          active: "(Active)",
          inactive: "(Inactive)",
          quantity: "Quantity",
          percentage: "percentage",
          title: "Survey Reports",
          activeSearch: "Active Survey",
          inactiveSearch: "Inactive Survey",
        },
        ticketDurationDetail: {
          msgToast: "Generating compressed report, please wait.",
          title: "Service Duration Report",
          startService: "Service Start",
          lastUpdated: "Last Updated",
          lastAgent: "Last Agent",
          durationFinished: "Duration After Completion",
        },
        ticketDuration: {
          title: "Service Duration Report",
          contact: "Contact",
          open: "Open",
          pending: "Pending",
          finished: "Completed",
          durationFinished: "Completed Duration",
          durationAfterFinished: "Duration After Completion",
          actions: "Actions",
        },
        ticketReports: {
          msgToast: "Generating compressed report, please wait.",
          title: "Service Report",
        },
        pdf: {
          title: "List of Completed Services",
          exportTitle: "List of Completed Group Services",
        },
        form: {
          initialDate: "Initial Date",
          finalDate: "Final Date",
        },
        excel: {
          connection: "Connection",
          contact: "Contact",
          user: "User",
          queue: "Queue",
          status: "Status",
          lastMessage: "LastMessage",
          dateOpen: "OpenDate",
          timeOpen: "OpenTime",
          dateClose: "CloseDate",
          timeClose: "CloseTime",
          supportTime: "SupportTime",
          nps: "nps",
          fileName: "service-report.xlsx",
          sheetName: "ServiceReport",
        },
        tooltips: {
          ticketLogs: "Ticket Logs",
          accessTicket: "Access Ticket",
          exportExcel: "Export to Excel",
        },
      },
      todo: {
        newTask: "New Task",
        add: "Add",
        save: "Save",
        task: "Tasks",
      },
      contactImportWpModal: {
        modalTitle: "Export / Import Contacts",
        title: "Export Contacts to Excel",
        buttons: {
          downloadModel: "Download Excel template for import",
          closed: "Close",
          import: "Select the Excel file to import Contacts",
        },
        form: {
          connection: "WhatsApp Connection",
          connectionPlaceholder: "Select connection...",
          importType: "Import type",
          importAll: "Import all contacts",
          importSelected: "Import selected contacts",
          overwriteExisting: "Overwrite existing contacts"
        },
        validation: {
          connectionRequired: "You must select a connection",
          noContactsFound: "No contacts found to import"
        },
        progress: {
          importing: "Importing contacts...",
          imported: "Contacts imported: {count}",
          duplicated: "Duplicate contacts: {count}",
          failed: "Failed contacts: {count}"
        }
      },
      tagsContainer: {
        title: "Contact Tags",
        placeholder: "Add tag...",
        add: "Add",
        remove: "Remove",
        noTags: "No tags assigned",
        createNew: "Create new tag",
        searchPlaceholder: "Search tags...",
        buttons: {
          save: "Save Tags",
          cancel: "Cancel",
          clear: "Clear All"
        },
        validation: {
          tagRequired: "Tag name is required",
          tagExists: "This tag already exists",
          maxTags: "Maximum {max} tags allowed"
        }
      },
      allConnections: {
        errors: {
          loadCompanies: "Could not load the list of records",
          unknownChannel: "error"
        },
        subtitle: "Connect your service channels to receive messages and start conversations with your customers.",
        channels: {
          whatsapp: "WhatsApp",
          facebook: "Facebook",
          instagram: "Instagram"
        },
        table: {
          client: "Client",
          connectedConnections: "Connected Connections",
          disconnectedConnections: "Disconnected Connections",
          totalConnections: "Total Connections",
          total: "Total"
        }
      },
      companyWhatsapps: {
        title: "Connections of: {{companyName}}",
        table: {
          channel: "Channel"
        }
      },
      channels: {
        whatsapp: "WhatsApp",
        facebook: "Facebook",
        instagram: "Instagram"
      },
      connections: {
        title: "Connections",
        waitConnection: "Wait... Your connections will be restarted!",
        newConnection: "New Connection",
        restartConnections: "Restart Connections",
        callSupport: "Call Support",
        toasts: {
          deleted: "Connection deleted successfully!",
          closedimported:
            "We are closing the imported tickets, please wait a moment",
        },
        confirmationModal: {
          closedImportedTitle: "Close imported tickets",
          closedImportedMessage:
            "If you confirm, all imported tickets will be closed",
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? This action cannot be undone.",
          disconnectTitle: "Disconnect",
          disconnectMessage:
            "Are you sure? You will need to scan the QR code again.",
        },
        buttons: {
          add: "Add Connection",
          disconnect: "disconnect",
          tryAgain: "Try Again",
          qrcode: "QR CODE",
          newQr: "NEW QR CODE",
          closedImported: "Close all Imported tickets",
          preparing: "Preparing messages for import",
          importing: "Importing WhatsApp Messages",
          processed: "Processed",
          in: "of",
          connecting: "Connecting",
        },
        typography: {
          processed: "Processed",
          in: "of",
          date: "Message date",
        },
        toolTips: {
          disconnected: {
            title: "Failed to start WhatsApp session",
            content:
              "Ensure your phone is connected to the internet and try again, or request a new QR code",
          },
          qrcode: {
            title: "Waiting for QR code scan",
            content:
              "Click the 'QR CODE' button and scan the QR code with your phone to start the session",
          },
          connected: {
            title: "Connection established!",
          },
          timeout: {
            title: "Connection to the phone was lost",
            content:
              "Ensure your phone is connected to the internet and WhatsApp is open, or click 'Disconnect' to get a new QR code",
          },
        },
        table: {
          name: "Name",
          status: "Status",
          lastUpdate: "Last Update",
          default: "Default",
          actions: "Actions",
          session: "Session",
          number: "WhatsApp Number",
          channel: "Channel",
        },
        iconChannel: {
          error: "Error",
        },
      },
      showTicketOpenModal: {
        title: {
          header: "Existing Service",
        },
        form: {
          message: "This contact is already being served:",
          user: "Agent",
          queue: "Queue",
          messageWait:
            "This contact is already waiting for service. Check the Waiting tab!",
          ticketId: "Ticket ID",
          status: "Status",
          createdAt: "Created at",
          updatedAt: "Updated at"
        },
        buttons: {
          goToTicket: "Go to Ticket",
          close: "Close",
          transferTicket: "Transfer Ticket"
        },
        status: {
          open: "Open",
          pending: "Pending",
          closed: "Closed"
        }
      },
      showTicketLogModal: {
        title: {
          header: "Logs",
        },
        options: {
          create: "Ticket created.",
          chatBot: "ChatBot started.",
          queue: " - Queue defined.",
          open: " started the service.",
          access: "accessed the ticket.",
          transfered: "transferred the ticket.",
          receivedTransfer: "received the transferred ticket.",
          pending: "returned to queue.",
          closed: "closed the ticket",
          reopen: "reopened the ticket",
          redirect: "- redirected"
        },
        close: "Close",
      },
      statusFilter: {
        title: "Status Filter",
        groups: "Groups",
      },
      whatsappModal: {
        title: {
          add: "Add Connection",
          edit: "Edit Connection",
        },
        tabs: {
          general: "General",
          messages: "Messages",
          assessments: "NPS",
          integrations: "Integrations",
          schedules: "Business Hours",
          chatbot: "Chatbot",
          defaultFlow: "Default Flow",
        },
        form: {
          importOldMessagesEnable: "Import messages from device",
          importOldMessages: "Import start date",
          importRecentMessages: "Import end date",
          importOldMessagesGroups: "Import group messages",
          closedTicketsPostImported: "Close tickets after import",
          name: "Name",
          queueRedirection: "Queue Redirection",
          queueRedirectionDesc:
            "Select a queue to redirect contacts without an assigned queue",
          default: "Default",
          group: "Allow groups",
          timeSendQueue: "Time in minutes to redirect to queue",
          importAlert:
            "ATTENTION: Upon saving, your connection will be closed, and you will need to scan the QR code again to import messages",
          groupAsTicket: "Treat groups as tickets",
          timeCreateNewTicket: "Create new ticket in x minutes",
          maxUseBotQueues: "Send bot x times",
          timeUseBotQueues: "Send bot in x minutes",
          expiresTicket: "Close open chats after x minutes",
          expiresTicketNPS:
            "Close chats awaiting rating after x minutes",
          maxUseBotQueuesNPS:
            "Maximum number of times the rating will be sent",
          closeLastMessageOptions1: "From agent/Client",
          closeLastMessageOptions2: "From agent",
          outOfHoursMessage: "Out-of-hours message",
          greetingMessage: "Greeting message",
          complationMessage: "Completion message",
          lgpdLinkPrivacy: "Privacy policy link",
          lgpdMessage: "LGPD greeting message",
          lgpdDeletedMessages: "Hide message deleted by contact",
          lgpdSendMessage: "Always request contact confirmation",
          ratingMessage: "Rating message - Scale must be from 0 to 10",
          token: "Token for external integration",
          sendIdQueue: "Queue",
          inactiveMessage: "Inactivity message",
          timeInactiveMessage:
            "Time in minutes to send inactivity warning",
          whenExpiresTicket:
            "Close open chats when the last message is",
          expiresInactiveMessage: "Inactivity closure message",
          prompt: "Prompt",
          collectiveVacationEnd: "End date",
          collectiveVacationStart: "Start date",
          collectiveVacationMessage: "Collective vacation message",
          queueIdImportMessages: "Queue to import messages"
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        menuItem: {
          enabled: "Enabled",
          disabled: "Disabled",
          minutes: "minutes",
        },
        messages: {
          clickSaveToRegister: "Click save to register changes",
        },
        flowBuilder: {
          welcomeFlow: "Welcome flow",
          welcomeFlowDescription: "This flow is triggered only for new contacts, people you don't have on your contact list and who sent a message",
          defaultResponseFlow: "Default response flow",
          defaultResponseFlowDescription: "Default Response is sent with any character different from a keyword. ATTENTION! It will be triggered if the service is already closed and 6 hours have passed since its closure.",
          title: "Default flow",
          save: "Save",
          updatedSuccess: "Default flows updated",
          deleteConfirmation: "Are you sure you want to delete this flow? All related integrations will be lost.",
        },
        success: "Connection saved successfully.",
        errorSendQueue:
          "A time to redirect to queue was provided, but no queue was selected. Both fields must be filled.",
        errorExpiresNPS:
          "You must specify a time for rating when using NPS.",
        errorRatingMessage:
          "You must provide a rating message when using NPS.",
      },
      qrCode: {
        message: "Scan the QR code to start the session",
      },
      qrcodeModal: {
        waiting: "Waiting for QR Code"
      },
      forbiddenPage: {
        accessDenied: "Oops! Access Denied!",
        buttons: {
          back: "Back"
        }
      },
      contacts: {
        title: "Contacts",
        toasts: {
          deleted: "Contact deleted successfully!",
        },
        searchPlaceholder: "Search...",
        confirmationModal: {
          deleteTitle: "Delete ",
          importTitlte: "Import contacts",
          exportContact: "Export contacts",
          deleteMessage:
            "Are you sure you want to delete this contact? All related services will be lost.",
          blockContact: "Are you sure you want to block this contact?",
          unblockContact: "Are you sure you want to unblock this contact?",
          importMessage: "Do you want to import all contacts from the phone?",
          importChat: "Import Chats",
          wantImport: "Do you want to import all chats from the phone?",
        },
        buttons: {
          import: "Import Contacts",
          add: "Add Contact",
          export: "Export Contact",
        },
        table: {
          name: "Name",
          whatsapp: "Connection",
          email: "Email",
          actions: "Actions",
          lastMessage: "Last Message",
          status: "Status",
          selectAll: "Select all contacts",
          selectContact: "Select contact {{name}}",
        },
        menu: {
          importYourPhone: "Import from default device",
          importToExcel: "Import/Export from Excel",
          importExport: "Import/Export"
        },
        bulkActions: {
          deleteSelected: "Delete Selected ({{count}})",
          deleteConfirmTitle: "Are you sure you want to delete {{count}} selected contacts?",
          deleteConfirmMessage: "This action is irreversible.",
          deleteSuccess: "Selected contacts deleted successfully!",
          blockContact: "Contact blocked",
          unblockContact: "Contact unblocked",
          selectConnectionToImport: "Choose which connection to import from"
        },
        tagsFilter: {
          title: "Filter by Tags",
          placeholder: "Select tags...",
          noTags: "No tags available",
          clearFilters: "Clear filters",
          selectedTags: "Selected tags"
        },
        validation: {
          nameRequired: "Name is required",
          numberRequired: "Number is required",
          emailRequired: "Email is required",
          invalidEmail: "Invalid email",
          numberExists: "This number already exists",
          emailExists: "This email already exists",
          invalidNumber: "Invalid number",
          numberTooShort: "Number too short",
          numberTooLong: "Number too long",
          nameTooShort: "Name too short",
          nameTooLong: "Name too long",
          tooShort: "Too short!",
          tooLong: "Too long!",
          required: "Required"
        },
      },
      contactImport: {
        title: "Import contacts from file",
        validation: {
          noNumberField: "No contact number field was selected",
          noNameField: "No contact name field was selected",
          noContactsSelected: "No contact selected",
          fieldAlreadySelected: "The field {{field}} has already been selected."
        },
        messages: {
          successComplete: "Import completed successfully",
          successWithErrors: "Import completed successfully, but there were some errors",
          importing: "Importing... Please wait",
          processing: "Processing file...",
          invalidFile: "Invalid file!",
          contactsCreated: "contacts created",
          contactsIgnored: "contacts ignored (invalid number or not marked for update)"
        },
        fields: {
          name: "Name",
          number: "Number",
          email: "E-mail",
          tags: "Tags"
        },
        buttons: {
          validateWhatsApp: "Validate contacts on WhatsApp",
          importContacts: "Import contacts",
          cancel: "Cancel",
          back: "Back"
        },
        dropzone: {
          clickOrDrag: "Click or drag a file",
          importantNote: "* Important: Only files with these extensions are accepted: xls, xlsx, csv, txt"
        }
      },
      forwardMessage: {
        text: "Forwarded",
      },
      forwardMessageModal: {
        title: "Forward message",
        buttons: {
          ok: "Forward",
        },
      },
      promptModal: {
        form: {
          name: "Name",
          prompt: "Prompt",
          voice: "Voice",
          max_tokens: "Maximum Tokens in response",
          temperature: "Temperature",
          apikey: "API Key",
          max_messages: "Maximum messages in History",
          voiceKey: "Voice API Key",
          voiceRegion: "Voice Region",
          model: "Model",
        },
        success: "Prompt saved successfully!",
        title: {
          add: "Add Prompt",
          edit: "Edit Prompt",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        validation: {
          tooShort: "Too short!",
          tooLong: "Too long!",
          required: "Required",
          promptDescription: "Describe the training for Artificial Intelligence",
          invalidModel: "Invalid model",
          informModel: "Enter the model",
          minTokens: "Minimum 10 tokens",
          maxTokens: "Maximum 4096 tokens",
          informMaxTokens: "Enter the maximum number of tokens",
          minZero: "Minimum 0",
          maxOne: "Maximum 1",
          informTemperature: "Enter the temperature",
          informApiKey: "Enter the API Key",
          informQueue: "Enter the queue",
          minMessages: "Minimum 1 message",
          maxMessages: "Maximum 50 messages",
          informMaxMessages: "Enter the maximum number of messages",
          informVoiceMode: "Enter the voice mode"
        },
        errors: {
          savePrompt: "Error saving the prompt"
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
          text: "Text",
          francisca: "Francisca",
          antonio: "Antonio",
          brenda: "Brenda",
          donato: "Donato",
          elza: "Elza",
          fabio: "Fabio",
          giovanna: "Giovanna",
          humberto: "Humberto",
          julio: "Julio",
          leila: "Leila",
          leticia: "Leticia",
          manuela: "Manuela",
          nicolau: "Nicolau",
          valerio: "Valerio",
          yara: "Yara"
        }
      },
      prompts: {
        title: "Prompts",
        table: {
          name: "Name",
          queue: "Department/Queue",
          max_tokens: "Maximum Response Tokens",
          actions: "Actions",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? This action cannot be undone!",
        },
        buttons: {
          add: "Add Prompt",
        },
        errors: {
          noPermission: "This company does not have permission to access this page! We are redirecting you."
        },
      },
      contactModal: {
        title: {
          add: "Add contact",
          edit: "Edit contact",
        },
        form: {
          mainInfo: "Contact details",
          extraInfo: "Additional information",
          name: "Name",
          number: "WhatsApp Number",
          email: "Email",
          extraName: "Field name",
          extraValue: "Value",
          chatBotContact: "Disable chatbot",
          termsLGDP: "LGPD terms accepted on:",
          whatsapp: "Source Connection: ",
          numberPlaceholder: "5513912344321",
          emailPlaceholder: "Email address"
        },
        buttons: {
          addExtraInfo: "Add information",
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Contact saved successfully.",
      },
      contactTagListModal: {
        title: "Contacts",
        table: {
          id: "ID",
          name: "Name",
          number: "Number",
          actions: "Actions"
        }
      },
      flowbuilder: {
        title: "Conversation Flows",
        subMenus: {
          campaign: "Campaign Flow",
          conversation: "Conversation Flow"
        },
        buttons: {
          add: "Add Flow",
          editName: "Edit name",
          editFlow: "Edit flow",
          duplicate: "Duplicate",
          delete: "Delete"
        },
        table: {
          status: "Status"
        },
        status: {
          active: "Active",
          inactive: "Inactive"
        },
        toasts: {
          deleteSuccess: "Flow deleted successfully",
          duplicateSuccess: "Flow duplicated successfully"
        },
        confirmationModal: {
          deleteTitle: "Are you sure you want to delete this flow? All related integrations will be lost.",
          duplicateTitle: "Do you want to duplicate the flow {flowName}?",
          duplicateMessage: "Are you sure you want to duplicate this flow?"
        }
      },
      flowbuilderModal: {
        flowNotIdPhrase: "Default flow",
        title: {
          add: "Add Flow",
          edit: "Edit Flow"
        },
        validation: {
          tooShort: "Too short!",
          tooLong: "Too long!",
          required: "Enter a name!"
        }
      },
      queueModal: {
        title: {
          queueData: "Queue data",
          text: "Service hours",
          add: "Add queue",
          edit: "Edit queue",
          confirmationDelete:
            "Are you sure? All integration options will be deleted.",
        },
        form: {
          name: "Name",
          color: "Color",
          orderQueue: "Queue order (Bot)",
          rotate: "Rotation",
          timeRotate: "Rotation Time",
          greetingMessage: "Greeting message",
          complationMessage: "Completion message",
          outOfHoursMessage: "Out-of-hours message",
          token: "Token",
          integrationId: "Integration",
          fileListId: "File list",
          closeTicket: "Close ticket",
          queueType: "Menu type",
          message: "Return message",
          queue: "Queue for transfer",
          integration: "Integration",
          file: "File list",
          selectFile: "Select a file",
          timeOptions: {
            minutes2: "2 minutes",
            minutes5: "5 minutes",
            minutes10: "10 minutes",
            minutes15: "15 minutes",
            minutes30: "30 minutes",
            minutes45: "45 minutes",
            minutes60: "60 minutes",
          },
        },
        validations: {
          tooShort: "Too short!",
          tooLong: "Too long!",
          required: "Required",
          mustHaveFriends: "Must have friends",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        bot: {
          title: "Options",
          toolTipTitle: "Add options to build a chatbot",
          toolTip:
            "If there is only one option, it will be chosen automatically, causing the bot to respond with the option's message and proceed",
          selectOption: "Select an option",
          text: "Text",
          attendent: "Agent",
          queue: "Queue",
          integration: "Integration",
          file: "File",
          toolTipMessageTitle:
            "The message is mandatory to proceed to the next level",
          toolTipMessageContent:
            "The message is mandatory to proceed to the next level",
          selectUser: "Select a User",
          selectQueue: "Select a Queue",
          selectIntegration: "Select an Integration",
          addOptions: "Add options",
          confirmationDelete: "Are you sure? All internal options will also be deleted",
          messageLabel: "Message:",
          toolTipMessage: "The message is mandatory to proceed to the next level",
          toolTipContent: "If the message is not defined, the bot will not proceed",
        },
        serviceHours: {
          dayWeek: "Day of the week",
          startTimeA: "Start Time - Shift A",
          endTimeA: "End Time - Shift A",
          startTimeB: "Start Time - Shift B",
          endTimeB: "End Time - Shift B",
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday",
        },
        general: {
          none: "None",
          message: "Message:",
        },
      },
      colorBoxModal: {
        title: "Choose a color",
        buttons: {
          cancel: "Cancel",
          ok: "OK",
        },
      },
      queueIntegrationModal: {
        title: {
          add: "Add project",
          edit: "Edit project",
        },
        form: {
          id: "ID",
          type: "Type",
          name: "Name",
          projectName: "Project Name",
          language: "Language",
          jsonContent: "JsonContent",
          urlN8N: "URL",
          typebotSlug: "Typebot - Slug",
          typebotExpires: "Time in minutes for a conversation to expire",
          typebotKeywordFinish: "Word to close the ticket",
          typebotKeywordRestart: "Word to restart the flow",
          typebotRestartMessage: "Message on restarting the conversation",
          typebotUnknownMessage: "Invalid option message",
          typebotDelayMessage: "Interval (ms) between messages",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
          test: "Test Bot",
        },
        languages: {
          "pt-BR": "Portuguese",
          "en": "English",
          "es": "Spanish",
        },
        messages: {
          testSuccess: "Integration tested successfully!",
          addSuccess: "Integration added successfully.",
          editSuccess: "Integration edited successfully.",
        },
      },
      userModal: {
        warning:
          "To import messages, you need to scan the QR code again!!!",
        title: {
          add: "Add user",
          edit: "Edit user",
          updateImage: "Update image",
          removeImage: "Delete image",
        },
        form: {
          name: "Name",
          none: "None",
          email: "Email",
          password: "Password",
          farewellMessage: "Farewell message",
          profile: "Profile",
          startWork: "Work start",
          endWork: "Work end",
          whatsapp: "Default Connection",
          allTicketEnable: "Enabled",
          allTicketDisable: "Disabled",
          allTicket: "View tickets without queue",
          allowGroup: "Allow Groups",
          defaultMenuOpen: "Open",
          defaultMenuClosed: "Closed",
          defaultMenu: "Default menu",
          defaultTheme: "Default Theme",
          defaultThemeDark: "Dark",
          defaultThemeLight: "Light",
          allHistoric: "View conversations from other queues",
          allHistoricEnabled: "Enabled",
          allHistoricDisabled: "Disabled",
          allUserChat: "View other users' conversations",
          userClosePendingTicket: "Allow closing pending tickets",
          showDashboard: "View Dashboard",
          allowRealTime: "View Service Panel",
          allowConnections: "Allow actions on connections",
        },
        tabs: {
          general: "General",
          permissions: "Permissions",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
          addImage: "Add Image",
          editImage: "Edit Image",
        },
        success: "User saved successfully.",
      },
      companyModal: {
        title: {
          add: "Add company",
          edit: "Edit company",
        },
        form: {
          name: "Name",
          email: "Email",
          passwordDefault: "Password",
          numberAttendants: "Users",
          numberConections: "Connections",
          status: "Active",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Company saved successfully.",
        validations: {
          nameRequired: "Name is required",
          emailInvalid: "Email is invalid",
          emailRequired: "E-mail is required",
          passwordRequired: "Password is required",
          tooShort: "Too short!",
          tooLong: "Too long!",
        },
      },
      scheduleModal: {
        title: {
          add: "New Schedule",
          edit: "Edit Schedule",
        },
        form: {
          body: "Message",
          contact: "Contact",
          sendAt: "Schedule Date",
          sentAt: "Sent Date",
          assinar: "Send Signature"
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
          addSchedule: "Add schedule"
        },
        success: "Schedule saved successfully.",
        validations: {
          tooShort: "Message too short",
          required: "Required"
        },
        toasts: {
          deleted: "Media removed successfully."
        },
        confirmationModal: {
          deleteTitle: "Delete Media",
          deleteMessage: "Are you sure you want to delete this media?"
        },
        status: {
          sending: "Sending",
          pending: "Pending",
          sent: "Sent",
          error: "Send Error"
        },
        recurrence: {
          title: "Recurrence",
          description: "You can choose to send the message recurrently and choose the interval. If it's a one-time message, don't change anything in this section.",
          interval: "Interval",
          intervalValue: "Interval Value",
          sendTimes: "Send how many times",
          intervalTypes: {
            days: "Days",
            weeks: "Weeks",
            months: "Months",
            minutes: "Minutes"
          },
          businessDays: {
            normal: "Send normally on non-working days",
            before: "Send one working day before",
            after: "Send one working day after"
          }
        },
        calendar: {
          messages: {
            date: "Date",
            time: "Time",
            event: "Event",
            allDay: "All Day",
            week: "Week",
            work_week: "Schedules",
            day: "Day",
            month: "Month",
            previous: "Previous",
            next: "Next",
            yesterday: "Yesterday",
            tomorrow: "Tomorrow",
            today: "Today",
            agenda: "Agenda",
            noEventsInRange: "No schedules in the period.",
            showMore: "more"
          }
        },
        permissions: {
          noAccess: "This company doesn't have permission to access this page! We are redirecting you."
        }
      },
      tagModal: {
        title: {
          add: "New Tag",
          edit: "Edit Tag",
          addKanban: "New Lane",
          editKanban: "Edit Lane",
        },
        form: {
          name: "Name",
          color: "Color",
          timeLane: "Time in hours to redirect to lane",
          nextLaneId: "Lane",
          greetingMessageLane: "Lane greeting message",
          rollbackLaneId: "Return to Lane after resuming service"
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        validation: {
          tooShort: "Too short!",
          required: "Required"
        },
        success: "Tag saved successfully.",
        successKanban: "Lane saved successfully.",
      },
      fileModal: {
        title: {
          add: "Add file list",
          edit: "Edit file list",
        },
        buttons: {
          okAdd: "Save",
          okEdit: "Edit",
          cancel: "Cancel",
          fileOptions: "Add file",
        },
        form: {
          name: "File list name",
          message: "List details",
          fileOptions: "File list",
          extraName: "Message to send with file",
          extraValue: "Option value",
        },
        success: "File list saved successfully!",
      },
      chat: {
        noTicketMessage: "Select a ticket to start chatting.",
        deleteConversationTitle: "Delete Conversation",
        deleteConversationMessage: "This action cannot be reversed, confirm?",
        messagePlaceholder: "Type your message...",
        sendButtonTooltip: "Send message",
        noMessagesYet: "No messages yet. Start the conversation!",
        loadingMessages: "Loading messages...",
        popover: {
          buttonTooltip: "Internal conversations",
          loading: "Loading conversations...",
          noChats: "No conversations available",
          notificationNotSupported: "This browser doesn't support notifications",
          accessibilityLabel: "Internal conversations list",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop:
            "⬇️ DRAG AND DROP FILES IN THE FIELD BELOW ⬇️",
          titleFileList: "File(s) list",
        },
      },
      chatInternal: {
        new: "New",
        tabs: {
          chats: "Chats",
          messages: "Messages",
        },
        form: {
          titleLabel: "Title",
          titlePlaceholder: "Title",
        },
        modal: {
          conversation: "Conversation",
          title: "Title",
          filterUsers: "Filter by Users",
          cancel: "Close",
          save: "Save",
        },
        modalDelete: {
          title: "Delete Conversation",
          message: "This action cannot be undone, confirm?",
        },
      },
      ticketsManager: {
        questionCloseTicket: "DO YOU WANT TO CLOSE ALL TICKETS?",
        yes: "YES",
        not: "NO",
        buttons: {
          newTicket: "New",
          resolveAll: "Resolve All",
          close: "Close",
          new: "New",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Queues",
      },
      tickets: {
        inbox: {
          closedAllTickets: "Close all tickets?",
          closedAll: "Close All",
          newTicket: "New Ticket",
          yes: "YES",
          no: "NO",
          open: "Open",
          resolved: "Resolved",
        },
        toasts: {
          deleted: "The service you were in was deleted.",
        },
        notification: {
          message: "Message from",
        },
        tabs: {
          open: { title: "Open" },
          closed: { title: "Resolved" },
          search: { title: "Search" },
        },
        search: {
          placeholder: "Search services and messages",
          filterConnections: "Filter by Connection",
          filterConnectionsOptions: {
            open: "Open",
            closed: "Closed",
            pending: "Pending",
          },
          filterUsers: "Filter by Users",
          filterContacts: "Filter by Contacts",
          ticketsPerPage: "Tickets per page",
        },
        buttons: {
          showAll: "All",
          returnQueue: "Return to Queue",
          schedule: "Schedule",
          deleteTicket: "Delete Ticket",
          quickMessageFlash: "Quick responses",
        },
        noContactName: "(no contact)",
        noDepartment: "No department",
        group: "Group",
        transferTooltip: "Transfer Ticket",
        closedTicket: {
          closedMessage: "Close Ticket with Farewell Message",
          closedNotMessage: "Close Ticket without Farewell Message",
        },
      },
      messages: {
        download: "Download",
        today: "TODAY",
        contact: "Contact",
        forwarded: "Forwarded",
        deletedByContact: "🚫 This message was deleted by contact &nbsp;",
        deletedMessage: "🚫 _Deleted message_ ",
        deletedBySender: "🚫 This message was deleted &nbsp;",
        youReacted: "You reacted... ",
        sayHello: "Say hello to your new contact!",
        dropFile: "Drop file here",
        facebookPolicy: "You have 24h to respond after receiving a message, according to Facebook's policies.",
        defaultMetaMessage: "Hello! I'm interested and would like more information, please.",
      },
      ticketsResponsive: {
        search: {
          searchInMessagesTooltip: "Check to also search message contents (slower)",
        },
        filter: {
          all: "All",
        },
        sort: {
          ascending: "Ascending",
          descending: "Descending",
        },
      },
      contactForm: {
        validation: {
          tooShort: "Too short!",
          tooLong: "Too long!",
          required: "Required",
          invalidEmail: "Invalid email",
        },
        placeholders: {
          number: "5513912344321",
          email: "Email address",
        },
      },
      common: {
        image: "image",
      },
      messageInputResponsive: {
        privateMessage: {
          suffix: "Private Message",
        },
        type: {
          document: "Document",
          buttons: "Buttons",
        },
        tooltip: {
          toggleSignature: "Enable/Disable Signature",
          toggleComments: "Enable/Disable Comments",
        },
      },
      transferTicketModal: {
        title: "Transfer Ticket",
        fieldLabel: "Type to search for users",
        fieldQueueLabel: "Transfer to queue",
        fieldQueuePlaceholder: "Select a queue",
        fieldWhatsapp: "Select a WhatsApp",
        noOptions: "No user found with this name",
        msgTransfer: "Notes - internal message, not sent to the client",
        buttons: {
          ok: "Transfer",
          cancel: "Cancel",
        },
      },
      ticketsList: {
        called: "Called",
        today: "Today",
        missedCall: "Missed voice/video call at",
        pendingHeader: "Waiting",
        assignedHeader: "Serving",
        groupingHeader: "Groups",
        noTicketsTitle: "Nothing here!",
        noTicketsMessage:
          "No service found with this status or search term",
        noQueue: "No Queue",
        buttons: {
          accept: "Accept",
          cancel: "Cancel",
          start: "start",
          closed: "Close",
          reopen: "Reopen",
          transfer: "Transfer",
          ignore: "Ignore",
          exportAsPDF: "Export to PDF",
          kanbanActions: "Kanban Options"
        },
        acceptModal: {
          title: "Accept Chat",
          queue: "Select department",
        },
      },
      newTicketModal: {
        title: "Create Ticket",
        fieldLabel: "Type to search for contact",
        add: "Add",
        buttons: {
          ok: "Save",
          cancel: "Cancel",
        },
        form: {
          contact: "Contact",
          queue: "Queue",
          message: "Initial message",
          contactPlaceholder: "Search contact...",
          queuePlaceholder: "Select queue...",
          messagePlaceholder: "Optional initial message..."
        },
        validation: {
          contactRequired: "You must select a contact",
          queueRequired: "You must select a queue"
        }
      },
      SendContactModal: {
        title: "Send contact",
        fieldLabel: "Type to search for contact",
        add: "Add",
        buttons: {
          ok: "Send",
          cancel: "Cancel",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Connections",
          chatsTempoReal: "Panel",
          tickets: "Services",
          quickMessages: "Quick Responses",
          contacts: "Contacts",
          queues: "Queues & Chatbot",
          flowbuilder: "Flowbuilder",
          tags: "Tags",
          administration: "Administration",
          companies: "Companies",
          users: "Users",
          settings: "Settings",
          files: "File List",
          helps: "Help",
          messagesAPI: "API",
          schedules: "Schedules",
          campaigns: "Campaigns",
          announcements: "Announcements",
          chats: "Internal Chat",
          financeiro: "Financial",
          queueIntegration: "Integrations",
          version: "Version",
          kanban: "Kanban",
          prompts: "Prompts",
          allConnections: "Manage connections",
          reports: "Reports",
          management: "Management"
        },
        appBar: {
          user: {
            profile: "Profile",
            logout: "Log out",
            message: "Hello",
            messageEnd: "welcome to",
            active: "Active until",
            goodMorning: "Hi,",
            myName: "my name is",
            continuity: "and I will continue your service.",
            virtualAssistant: "Virtual Assistant",
            token:
              "Invalid token, please contact the platform administrator.",
          },
          message: {
            location: "Location",
            contact: "Contact",
          },
          notRegister: "No record",
          refresh: "Refresh",
        },
      },
      languages: {
        undefined: "Language",
        "pt-BR": "Portuguese",
        es: "Spanish",
        en: "English",
        tr: "Turkish",
      },
      messagesAPI: {
        title: "API",
        textMessage: {
          number: "Number",
          body: "Message",
          token: "Registered Token",
          userId: "User/Agent ID",
          queueId: "Queue ID",
        },
        mediaMessage: {
          number: "Number",
          body: "File name",
          media: "File",
          token: "Registered Token",
        },
        API: {
          title: "Documentation for sending messages",
          methods: {
            title: "Sending Methods",
            messagesText: "Text Messages",
            messagesMedia: "Media Messages",
          },
          instructions: {
            title: "Instructions",
            comments: "Important Notes",
            comments1:
              "Before sending messages, you must register the token linked to the connection that will send the messages. <br />To register, go to the 'Connections' menu, click the edit button for the connection, and enter the token in the appropriate field.",
            comments2:
              "The number for sending must not have a mask or special characters and must consist of:",
            codeCountry: "Country Code",
            code: "Area Code",
            number: "Number",
          },
          text: {
            title: "1. Text Messages",
            instructions:
              "Below is the list of information required to send text messages:",
          },
          media: {
            title: "2. Media Messages",
            instructions:
              "Below is the list of information required to send media messages:",
          },
        },
        messages: {
          noPermission: "This company does not have permission to access this page! We are redirecting you.",
          success: "Message sent successfully",
        },
        form: {
          send: "Send",
          testSend: "Send Test",
        },
        documentation: {
          endpoint: "Endpoint: ",
          method: "Method: ",
          post: "POST",
          headers: "Headers: ",
          headersTextAuth: "Authorization Bearer (registered token) and Content-Type (application/json)",
          headersMediaAuth: "Authorization Bearer (registered token) and Content-Type (multipart/form-data)",
          body: "Body: ",
          formData: "FormData: ",
          bodyExample: "{\n  \"number\": \"558599999999\",\n  \"body\": \"Message\",\n  \"userId\": \"User ID or \\\"\\\"\",\n  \"queueId\": \"Queue ID or \\\"\\\"\",\n  \"sendSignature\": \"Sign message - true/false\",\n  \"closeTicket\": \"Close ticket - true/false\"\n}",
          formDataFields: {
            number: "number: 558599999999",
            body: "body: Message",
            userId: "userId: User ID or \\\"\\\"",
            queueId: "queueId: Queue ID or \\\"\\\"",
            medias: "medias: file",
            sendSignature: "sendSignature: Sign message true/false",
            closeTicket: "closeTicket: Close ticket true/false",
          },
        },
      },
      notifications: {
        noTickets: "No notifications.",
      },
      quickMessages: {
        title: "Quick Responses",
        searchPlaceholder: "Search...",
        noAttachment: "No attachment",
        confirmationModal: {
          deleteTitle: "Deletion",
          deleteMessage: "This action is irreversible! Do you wish to proceed?",
        },
        buttons: {
          add: "Add",
          attach: "Attach File",
          cancel: "Cancel",
          edit: "Edit",
        },
        toasts: {
          success: "Shortcut added successfully!",
          deleted: "Shortcut removed successfully!",
        },
        dialog: {
          title: "Quick Message",
          shortcode: "Shortcut",
          message: "Response",
          save: "Save",
          cancel: "Cancel",
          geral: "Allow editing",
          add: "Add",
          edit: "Edit",
          visao: "Allow viewing",
        },
        table: {
          shortcode: "Shortcut",
          message: "Message",
          actions: "Actions",
          mediaName: "File Name",
          status: "Status",
        },
      },
      contactLists: {
        title: "Contact Lists",
        table: {
          name: "Name",
          contacts: "Contacts",
          actions: "Actions",
        },
        buttons: {
          add: "New List",
          downloadSample: "Download Sample Spreadsheet",
        },
        dialog: {
          name: "Name",
          company: "Company",
          okEdit: "Edit",
          okAdd: "Add",
          add: "Add",
          edit: "Edit",
          cancel: "Cancel",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "This action cannot be undone.",
        },
        toasts: {
          deleted: "Record deleted",
        },
      },
      contactListItems: {
        title: "Contacts",
        searchPlaceholder: "Search",
        buttons: {
          add: "New",
          lists: "Lists",
          import: "Import",
        },
        dialog: {
          name: "Name",
          number: "Number",
          whatsapp: "WhatsApp",
          email: "Email",
          okEdit: "Edit",
          okAdd: "Add",
          add: "Add",
          edit: "Edit",
          cancel: "Cancel",
        },
        table: {
          name: "Name",
          number: "Number",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "Actions",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "This action cannot be undone.",
          importMessage: "Do you want to import the contacts from this sheet? ",
          importTitlte: "Import",
        },
        toasts: {
          deleted: "Record deleted",
        },
        downloadTemplate: "Click here to download sample spreadsheet.",
        whatsappValid: "Valid WhatsApp",
        whatsappInvalid: "Invalid WhatsApp",
      },
      kanban: {
        title: "Kanban",
        subtitle: "Ticket visualization in Kanban format",
        searchPlaceholder: "Search",
        subMenus: {
          list: "Panel",
          tags: "Lanes",
        },
        ticketNumber: "Ticket #",
        viewTicket: "View Ticket",
        startDate: "Start Date",
        endDate: "End Date",
        search: "Search",
        addColumns: "+ Add Columns",
        ticketTagRemoved: "Ticket Tag Removed!",
        ticketTagAdded: "Ticket Tag Added Successfully!",
        ticketMoveError: "Error moving ticket",
        iconChannelError: "Error",
        noTickets: "No tickets",
        emptyStateTags: "No Kanban tags created",
        emptyStateTagsDescription: "Create your first Kanban tag to start organizing tickets",
        createFirstTag: "Create First Tag",
        emptyStateTickets: "No tickets found",
        emptyStateTicketsDescription: "Adjust date filters or create new tickets",
        errorTitle: "Error loading Kanban",
        errorDescription: "An error occurred while fetching data. Please try again.",
        retry: "Try Again",
      },
      campaigns: {
        status: {
          inactive: "Inactive",
          scheduled: "Scheduled",
          inProgress: "In Progress",
          cancelled: "Canceled",
          finished: "Finished",
        },
        common: {
          none: "None",
          notDefined: "Not defined",
          noSchedule: "No schedule",
          notCompleted: "Not completed",
          enabled: "Enabled",
          disabled: "Disabled",
        },
        modal: {
          tabLabels: {
            msg1: "Msg. 1",
            msg2: "Msg. 2",
            msg3: "Msg. 3",
            msg4: "Msg. 4",
            msg5: "Msg. 5",
          },
          helpText: "Use variables like {name}, {number}, {email}, or define custom variables.",
        },
        title: "Campaigns",
        searchPlaceholder: "Search",
        subMenus: {
          list: "List",
          listContacts: "Contact List",
          settings: "Settings",
        },
        settings: {
          randomInterval: "Random Sending Interval",
          noBreak: "No Break",
          intervalGapAfter: "Larger interval after",
          undefined: "Not defined",
          messages: "messages",
          laggerTriggerRange: "Larger sending interval",
          addVar: "Add variable",
          save: "Save",
          close: "Close",
          add: "Add",
          shortcut: "Shortcut",
          content: "Content",
        },
        buttons: {
          add: "New Campaign",
          contactLists: "Contact Lists",
          stopCampaign: "Stop Campaign",
        },
        table: {
          name: "Name",
          whatsapp: "Connection",
          contactList: "Contact List",
          option: "None",
          disabled: "Disabled",
          enabled: "Enabled",
          status: "Status",
          scheduledAt: "Scheduled",
          completedAt: "Completed",
          confirmation: "Confirmation",
          actions: "Actions",
        },
        dialog: {
          new: "New Campaign",
          update: "Edit Campaign",
          readonly: "View Only",
          help: "Use variables like {name}, {number}, {email}, or define custom variables.",
          form: {
            name: "Name",
            message1: "Message 1",
            message2: "Message 2",
            message3: "Message 3",
            message4: "Message 4",
            message5: "Message 5",
            confirmationMessage1: "Confirmation Message 1",
            confirmationMessage2: "Confirmation Message 2",
            confirmationMessage3: "Confirmation Message 3",
            confirmationMessage4: "Confirmation Message 4",
            confirmationMessage5: "Confirmation Message 5",
            messagePlaceholder: "Message content",
            whatsapp: "Connection",
            status: "Status",
            scheduledAt: "Scheduled",
            confirmation: "Confirmation",
            contactList: "Contact List",
            tagList: "Tags",
            statusTicket: "Ticket Status",
            openTicketStatus: "Open",
            pendingTicketStatus: "Pending",
            closedTicketStatus: "Closed",
            enabledOpenTicket: "Enabled",
            disabledOpenTicket: "Disabled",
            openTicket: "Open ticket",
          },
          buttons: {
            add: "Add",
            edit: "Update",
            okadd: "Ok",
            cancel: "Cancel Sending",
            restart: "Restart Sending",
            close: "Close",
            attach: "Attach File",
          },
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "This action cannot be undone.",
        },
        toasts: {
          success: "Operation completed successfully",
          cancel: "Campaign canceled",
          restart: "Campaign restarted",
          deleted: "Record deleted",
        },
        noPermission: "This company does not have permission to access this page! We are redirecting you.",
      },
      campaignReport: {
        title: "Report of",
        inactive: "Inactive",
        scheduled: "Scheduled",
        process: "In Progress",
        cancelled: "Canceled",
        finished: "Finished",
        campaign: "Campaign",
        validContacts: "Valid Contacts",
        confirmationsRequested: "Confirmations Requested",
        confirmations: "Confirmations",
        deliver: "Delivered",
        connection: "Connection",
        contactLists: "Contact List",
        schedule: "Scheduling",
        conclusion: "Conclusion",
        noPermission: "This company does not have permission to access this page! We are redirecting you.",
        status: "Status:",
        of: "of",
      },
      announcements: {
        title: "Announcements",
        searchPlaceholder: "Search",
        active: "Active",
        inactive: "Inactive",
        buttons: {
          add: "New Announcement",
          contactLists: "Announcement Lists",
        },
        table: {
          priority: "Priority",
          title: "Title",
          text: "Text",
          mediaName: "File",
          status: "Status",
          actions: "Actions",
        },
        dialog: {
          edit: "Edit Announcement",
          add: "New Announcement",
          update: "Edit Announcement",
          readonly: "View Only",
          form: {
            priority: "Priority",
            title: "Title",
            text: "Text",
            mediaPath: "File",
            status: "Status",
            high: "High",
            medium: "Medium",
            low: "Low",
            active: "Active",
            inactive: "Inactive",
          },
          buttons: {
            add: "Add",
            edit: "Update",
            okadd: "Ok",
            cancel: "Cancel",
            close: "Close",
            attach: "Attach File",
          },
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "This action cannot be undone.",
        },
        toasts: {
          success: "Operation completed successfully",
          deleted: "Record deleted",
          noPermission: "This company does not have permission to access this page! We are redirecting you.",
        },
      },
      campaignsConfig: {
        title: "Campaign Settings",
        noPermissionMessage: "This company does not have permission to access this page! We are redirecting you.",
        settingsSaved: "Settings saved",
        intervals: "Intervals",
        seconds: "seconds",
      },
      campaignsPhrase: {
        title: "Campaigns",
        phraseDeleted: "Phrase deleted",
        phraseUpdated: "Phrase successfully updated!",
        phraseCreated: "Phrase successfully created!",
        addCampaign: "Campaign",
        table: {
          name: "Name",
          status: "Status",
          active: "Active",
          inactive: "Inactive",
          empty: "No phrase campaigns found",
        },
        modal: {
          editTitle: "Edit phrase flow campaign",
          newTitle: "New phrase flow campaign",
          nameLabel: "Phrase trigger name",
          flowLabel: "Choose a flow",
          flowPlaceholder: "Choose a flow",
          connectionPlaceholder: "Select a Connection",
          phraseLabel: "Which phrase triggers the flow?",
          matchTypeLabel: "Match type",
          matchTypeExact: "Exact Match",
          matchTypeContains: "Contains word",
          matchTypeTooltip: "Exact: message must exactly match the word. Contains: word can appear anywhere in the message",
          statusLabel: "Status",
          cancelButton: "Cancel",
          saveButton: "Save campaign",
          createButton: "Create campaign",
        },
      },
      queues: {
        title: "Queues & Chatbot",
        table: {
          name: "Name",
          color: "Color",
          greeting: "Greeting message",
          orderQueue: "Queue sorting (bot)",
          actions: "Actions",
          ID: "ID",
        },
        buttons: {
          add: "Add queue",
        },
        toasts: {
          success: "Queue saved successfully",
          deleted: "Queue deleted successfully",
          queueDeleted: "Queue deleted successfully!",
          botSaved: "Bot saved successfully",
          clickToSave: "Click save to register changes",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "Are you sure? This action cannot be undone! Services in this queue will still exist but will no longer have a queue assigned.",
        },
      },
      queue: {
        queueData: "Data",
      },
      queueSelect: {
        inputLabel: "Queues",
        inputLabelRO: "Read-only queues",
        withoutQueue: "No queue",
        undefined: "Queue not found",
        errors: {
          loadError: "QUEUESELETSINGLE >>>"
        }
      },
      queueIntegration: {
        title: "Integrations",
        table: {
          id: "ID",
          type: "Type",
          name: "Name",
          projectName: "Project Name",
          language: "Language",
          lastUpdate: "Last Update",
          actions: "Actions",
        },
        buttons: {
          add: "Add Project",
        },
        searchPlaceholder: "Search...",
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "Are you sure? This action cannot be undone! It will be removed from linked queues and connections",
        },
        toasts: {
          deleted: "Integration deleted successfully!",
        },
        messages: {
          noPermission: "This company does not have permission to access this page! We are redirecting you.",
        },
      },
      users: {
        title: "Users",
        table: {
          status: "Status",
          avatar: "Avatar",
          name: "Name",
          email: "Email",
          profile: "Profile",
          startWork: "Work Start",
          endWork: "Work End",
          actions: "Actions",
          ID: "ID",
        },
        profile: {
          admin: "Admin",
          user: "User",
        },
        status: {
          enabled: "Enabled",
          disabled: "Disabled",
        },
        upload: {
          avatar: "Upload Avatar",
        },
        buttons: {
          add: "Add user",
        },
        toasts: {
          deleted: "User deleted successfully.",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "All user data will be lost. Open services from this user will be moved to the queue.",
        },
      },
      companies: {
        title: "Companies",
        table: {
          ID: "ID",
          status: "Active",
          name: "Name",
          email: "Email",
          password: "Password",
          phone: "Phone",
          plan: "Plan",
          active: "Active",
          numberAttendants: "Agents",
          numberConnections: "Connections",
          value: "Value",
          namePlan: "Plan Name",
          numberQueues: "Queues",
          useCampaigns: "Campaigns",
          useExternalApi: "Rest API",
          useFacebook: "Facebook",
          useInstagram: "Instagram",
          useWhatsapp: "WhatsApp",
          useInternalChat: "Internal Chat",
          useSchedules: "Scheduling",
          createdAt: "Created At",
          dueDate: "Due Date",
          lastLogin: "Last Login",
          actions: "Actions",
          money: "$",
          yes: "Yes",
          no: "No",
          folderSize: "Folder size",
          totalFiles: "Total files",
          lastUpdate: "Last update",
          document: "CNPJ/CPF",
          recurrence: "Recurrence",
          monthly: "Monthly",
          bimonthly: "Bimonthly",
          quarterly: "Quarterly",
          semester: "Semiannual",
          yearly: "Annual",
          clear: "Clear",
          delete: "Delete",
          user: "User",
          save: "Save",
        },
        buttons: {
          add: "Add company",
        },
        toasts: {
          deleted: "Company deleted successfully.",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "All company data will be lost. Open tickets from this user will be moved to the queue.",
        },
        notifications: {
          noPermission: "This company does not have permission to access this page! We are redirecting you.",
        },
      },
      compaies: {
        title: "Companies",
        form: {
          documentLabel: "Tax ID (optional)",
          documentPlaceholder: "000.000.000-00 or 00.000.000/0000-00",
          documentInvalid: "Invalid Tax ID",
          documentDuplicate: "Tax ID already registered",
          documentNotProvided: "Not provided",
          nameRequired: "Name is required",
          emailRequired: "Email is required",
        },
        table: {
          ID: "ID",
          status: "Active",
          name: "Name",
          email: "Email",
          password: "Password",
          phone: "Phone",
          plan: "Plan",
          active: "Active",
          numberAttendants: "Agents",
          numberConections: "Connections",
          value: "Value",
          namePlan: "Plan Name",
          numberQueues: "Queues",
          useCampaigns: "Campaigns",
          useExternalApi: "Rest API",
          useFacebook: "Facebook",
          useInstagram: "Instagram",
          useWhatsapp: "Whatsapp",
          useInternalChat: "Internal Chat",
          useSchedules: "Scheduling",
          createdAt: "Created At",
          dueDate: "Due Date",
          lastLogin: "Last Login",
          actions: "Actions",
          money: "$",
          yes: "Yes",
          no: "No",
          folderSize: "Folder size",
          totalFiles: "Total files",
          lastUpdate: "Last update",
          document: "CNPJ/CPF",
          recurrence: "Recurrence",
          monthly: "Monthly",
          bimonthly: "Bimonthly",
          quarterly: "Quarterly",
          semester: "Semiannual",
          yearly: "Annual",
          clear: "Clear",
          delete: "Delete",
          user: "User",
          save: "Save",
        },
        searchPlaceholder: "Search companies...",
        searchLabel: "Company search field",
        clearSearch: "Clear search",
        buttons: {
          add: "Add company",
        },
        toasts: {
          deleted: "Company deleted successfully.",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "All company data will be lost. Open tickets from this user will be moved to the queue.",
        },
        notifications: {
          noPermission: "This company does not have permission to access this page! We are redirecting you.",
        },
      },
      plans: {
        form: {
          name: "Name",
          users: "Users",
          connections: "Connections",
          campaigns: "Campaigns",
          schedules: "Schedules",
          enabled: "Enabled",
          disabled: "Disabled",
          clear: "Cancel",
          delete: "Delete",
          save: "Save",
          yes: "Yes",
          no: "No",
          money: "$",
          public: "Public"
        },
      },
      helps: {
        title: "Help Center",
        thumbnail: "Thumbnail",
        videoPlayerTitle: "YouTube video player",
        settings: {
          codeVideo: "Video Code",
          description: "Description",
          clear: "Clear",
          delete: "Delete",
          save: "Save",
        },
      },
      schedules: {
        title: "Schedules",
        confirmationModal: {
          deleteTitle: "Are you sure you want to delete this Schedule?",
          deleteMessage: "This action cannot be undone.",
        },
        table: {
          contact: "Contact",
          body: "Message",
          sendAt: "Schedule Date",
          sentAt: "Sent Date",
          status: "Status",
          actions: "Actions",
        },
        buttons: {
          add: "New Schedule",
        },
        toasts: {
          deleted: "Schedule deleted successfully.",
        },
      },
      tags: {
        title: "Tags",
        confirmationModal: {
          deleteTitle: "Are you sure you want to delete this Tag?",
          deleteMessage: "This action cannot be undone.",
        },
        table: {
          id: "ID",
          name: "Name",
          kanban: "Kanban",
          color: "Color",
          tickets: "Tag Records",
          contacts: "Contacts",
          actions: "Actions",
        },
        buttons: {
          add: "New Tag",
        },
        toasts: {
          deleted: "Tag deleted successfully.",
        },
      },
      tagsKanban: {
        title: "Lanes",
        laneDefault: "Open",
        confirmationModal: {
          deleteTitle: "Are you sure you want to delete this Lane?",
          deleteMessage: "This action cannot be undone.",
        },
        table: {
          name: "Name",
          color: "Color",
          tickets: "Tickets",
          actions: "Actions",
        },
        buttons: {
          add: "New Lane",
          backToKanban: "Back to Kanban",
        },
        toasts: {
          deleted: "Lane deleted successfully.",
        },
      },
      files: {
        title: "File List",
        table: {
          name: "Name",
          contacts: "Contacts",
          actions: "Action",
        },
        toasts: {
          deleted: "List deleted successfully!",
          deletedAll: "All lists deleted successfully!",
        },
        buttons: {
          add: "Add",
          deleteAll: "Delete All",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteAllTitle: "Delete All",
          deleteMessage: "Are you sure you want to delete this list?",
          deleteAllMessage: "Are you sure you want to delete all lists?",
        },
      },
      settings: {
        success: "Settings saved successfully.",
        title: "Settings",
        tabs: {
          options: "Options",
          schedules: "Schedules",
          companies: "Companies",
          plans: "Plans",
          helps: "Help",
          whitelabel: "Whitelabel",
          timezone: "Time Zone",
        },
        settingsConfig: {
          userCreation: {
            name: "User creation",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          options: {
            disabled: "Disabled",
            enabled: "Enabled",
            updating: "Updating...",
            creationCompanyUser: "Company/User Creation",
            evaluations: "Evaluations",
            officeScheduling: "Office Scheduling",
            queueManagement: "Queue Management",
            companyManagement: "Company Management",
            connectionManagement: "Connection Management",
            sendGreetingAccepted: "Send greeting upon accepting ticket",
            sendMsgTransfTicket:
              "Send transfer message for department/agent",
            checkMsgIsGroup: "Ignore Group Messages",
            chatBotType: "Bot Type",
            userRandom: "Choose random agent",
            buttons: "Buttons",
            acceptCallWhatsapp: "Inform that calls are not accepted on WhatsApp?",
            sendSignMessage: "Allow agent to choose SEND Signature",
            sendGreetingMessageOneQueues:
              "Send greeting when there is only one queue",
            sendQueuePosition: "Send message with queue position",
            sendFarewellWaitingTicket:
              "Send farewell message in Waiting",
            acceptAudioMessageContact:
              "Accept audio from all contacts?",
            enableLGPD: "Enable LGPD handling",
            requiredTag: "Mandatory tag to close ticket",
            closeTicketOnTransfer: "Close ticket when transferring to another queue",
            DirectTicketsToWallets: "Automatically move client to wallet",
            showNotificationPending: "Show notification for pending tickets"
          },
          customMessages: {
            sendQueuePositionMessage: "Queue position message",
            AcceptCallWhatsappMessage: "Message to inform calls are not accepted",
            greetingAcceptedMessage: "Greeting message upon accepting ticket",
            transferMessage: "Transfer message - ${queue.name} = destination queue",
          },
          LGPD: {
            title: "LGPD",
            welcome: "Welcome message (LGPD)",
            linkLGPD: "Privacy policy link",
            obfuscateMessageDelete: "Hide deleted message",
            alwaysConsent: "Always request consent",
            obfuscatePhoneUser: "Hide phone number for users",
            enabled: "Enabled",
            disabled: "Disabled",
          },
        },
        toasts: {
          schedulesSavedSuccess: "Schedules updated successfully.",
          operationUpdatedSuccess: "Operation updated successfully.",
          recordsLoadError: "Unable to load records list",
          operationSuccess: "Operation performed successfully!",
          operationError: "Unable to perform operation. Check if a record with the same name already exists or if all fields are filled correctly",
          operationDeleteError: "Unable to perform operation",
          imageUploadProgress: "Image is {{progress}}% uploaded...",
          imageUploadError: "There was a problem uploading the image.",
          companyOperationError: "Unable to perform operation. Check if a company with the same name already exists or if all fields are filled correctly",
          planOperationError: "Unable to perform operation. Check if a plan with the same name already exists or if all fields are filled correctly",
          helpOperationError: "Unable to perform operation. Check if a help with the same name already exists or if all fields are filled correctly",
        },
        whitelabel: {
          primaryColorLight: "Light Mode Primary Color",
          primaryColorDark: "Dark Mode Primary Color",
          systemName: "System Name",
          lightLogo: "Light Logo",
          darkLogo: "Dark Logo",
          favicon: "Favicon",
        },
        timezone: {
          companyTimezone: {
            title: "Company Time Zone",
            selectLabel: "Select time zone",
            customHelperText: "Custom time zone for this company",
            inheritedHelperText: "Using system default time zone",
          },
          defaultTimezone: {
            title: "System Default Time Zone",
            selectLabel: "Select default time zone",
            helperText: "This time zone will be used by default for all companies that don't have a custom time zone",
          },
          buttons: {
            save: "Save",
            useDefault: "Use Default",
            saveDefault: "Save Default",
          },
          preview: {
            currentTime: "Current Time",
            defaultTime: "Default Time",
          },
          status: {
            custom: "Custom",
            inherited: "Inherited",
          },
          errors: {
            fetchAvailableTimezones: "Error loading available time zones",
            fetchCompanyTimezone: "Error loading company time zone",
            updateDefaultTimezone: "Error updating default time zone",
            updateCompanyTimezone: "Error updating company time zone",
          },
          success: {
            defaultTimezoneUpdated: "Default time zone updated successfully",
            companyTimezoneUpdated: "Company time zone updated successfully",
            companyTimezoneReset: "Company time zone reset successfully",
          },
        },
        chatBotType: {
          text: "Text",
        },
        modals: {
          deleteTitle: "Delete Record",
          deleteConfirmation: "Do you really want to delete this record?",
        },
        managers: {
          common: {
            yes: "Yes",
            no: "No",
          },
          companies: {
            recurrence: "Recurrence",
          },
          plans: {
            queues: "Queues",
            value: "Value",
            whatsapp: "WhatsApp",
            facebook: "Facebook",
            instagram: "Instagram",
            internalChat: "Internal Chat",
            externalAPI: "External API",
            kanban: "Kanban",
            talkAI: "Prompts",
            integrations: "Integrations",
          },
          helps: {
            title: "Title",
            video: "Video",
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Assigned to:",
          dialogRatingTitle:
            "Would you like to leave a service rating for the client?",
          dialogClosingTitle: "Closing the service with the client!",
          dialogRatingCancel: "Resolve WITH Farewell Message",
          dialogRatingSuccess: "Resolve and Send Rating",
          dialogRatingWithoutFarewellMsg: "Resolve WITHOUT Farewell Message",
          ratingTitle: "Choose a rating menu",
          notMessage: "No message selected",
          amount: "Prospecting value",
          buttons: {
            return: "Return",
            resolve: "Resolve",
            reopen: "Reopen",
            accept: "Accept",
            rating: "Send Rating",
            enableIntegration: "Enable integration",
            disableIntegration: "Disable integration",
            logTicket: "Ticket Logs",
            requiredTag: "You must assign a tag before closing the ticket.",
          },
        },
      },
      messagesInput: {
        placeholderPrivateMessage:
          "Type a message or press / for quick responses",
        placeholderOpen:
          "Type a message or press / for quick responses",
        placeholderClosed:
          "Reopen or accept this ticket to send a message.",
        signMessage: "Sign",
        privateMessage: "Private Message",
      },
      contactDrawer: {
        header: "Contact details",
        buttons: {
          edit: "Edit contact",
          block: "Block",
          unblock: "Unblock",
          blockContact: "Block contact",
          unblockContact: "Unblock contact",
        },
        toasts: {
          contactBlocked: "Contact blocked",
          contactUnblocked: "Contact unblocked",
        },
        confirmationModal: {
          blockMessage: "Do you really want to block this contact? You will no longer receive messages from them.",
          unblockMessage: "Do you really want to unblock this contact? You will be able to start receiving messages from them.",
        },
        extraInfo: "Other information",
      },
      messageVariablesPicker: {
        label: "Available variables",
        vars: {
          contactFirstName: "First Name",
          contactName: "Name",
          user: "Agent",
          greeting: "Greeting",
          protocolNumber: "Protocol",
          date: "Date",
          hour: "Hour",
          ticket_id: "Ticket Number",
          queue: "Department",
          connection: "Connection",
        },
      },
      ticketOptionsMenu: {
        schedule: "Schedule",
        delete: "Delete",
        transfer: "Transfer",
        registerAppointment: "Contact Notes",
        resolveWithNoFarewell: "Close without farewell",
        acceptAudioMessage: "Accept audios from contact?",
        appointmentsModal: {
          title: "Ticket Notes",
          textarea: "Note",
          placeholder: "Enter the information you want to record here",
        },
        confirmationModal: {
          title: "Delete the contact's ticket",
          titleFrom: "from contact ",
          message:
            "Attention! All messages related to the ticket will be lost.",
        },
        buttons: {
          delete: "Delete",
          cancel: "Cancel",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancel",
        },
      },
      messageInput: {
        tooltip: {
          signature: "Enable/Disable Signature",
          privateMessage: "Enable/Disable Private Message",
          meet: "Send link for video conference",
        },
        type: {
          imageVideo: "Photos and videos",
          cam: "Camera",
          contact: "Contact",
          meet: "Video call",
        },
      },
      messageOptionsMenu: {
        delete: "Delete",
        reply: "Reply",
        edit: "Edit",
        forward: "Forward",
        toForward: "Forward",
        talkTo: "Talk To",
        react: "React",
        confirmationModal: {
          title: "Delete message?",
          message: "This action cannot be undone.",
        },
      },
      invoices: {
        table: {
          invoices: "Invoices",
          details: "Details",
          users: "Users",
          connections: "Connections",
          queue: "Queues",
          value: "Value",
          expirationDate: "Due Date",
          action: "Action",
        },
      },
      userStatus: {
        online: "Online",
        offline: "Offline",
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "There must be at least one default WhatsApp.",
        ERR_NO_DEF_WAPP_FOUND:
          "No default WhatsApp found. Check the connections page.",
        ERR_WAPP_NOT_INITIALIZED:
          "This WhatsApp session was not initialized. Check the connections page.",
        ERR_WAPP_CHECK_CONTACT:
          "Could not verify WhatsApp contact. Check the connections page",
        ERR_WAPP_INVALID_CONTACT: "This is not a valid WhatsApp number.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Could not download media from WhatsApp. Check the connections page.",
        ERR_INVALID_CREDENTIALS:
          "Authentication error. Please try again.",
        ERR_SENDING_WAPP_MSG:
          "Error sending WhatsApp message. Check the connections page.",
        ERR_DELETE_WAPP_MSG: "Could not delete the WhatsApp message.",
        ERR_OTHER_OPEN_TICKET: "There is already an open ticket for this contact.",
        ERR_TICKET_ALREADY_ACCEPTED: "This ticket has already been accepted by another agent.",
        ERR_SESSION_EXPIRED: "Session expired. Please log in.",
        ERR_USER_CREATION_DISABLED:
          "User creation was disabled by the administrator.",
        ERR_NO_PERMISSION: "You do not have permission to access this resource.",
        ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
        ERR_NO_SETTING_FOUND: "No setting found with this ID.",
        ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
        ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
        ERR_NO_USER_FOUND: "No user found with this ID.",
        ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
        ERR_CREATING_MESSAGE: "Error creating message in the database.",
        ERR_CREATING_TICKET: "Error creating ticket in the database.",
        ERR_FETCH_WAPP_MSG:
          "Error fetching the message from WhatsApp; it may be too old.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "This color is already in use; choose another.",
        ERR_WAPP_GREETING_REQUIRED:
          "The greeting message is mandatory when there is more than one queue.",
        ERR_OUT_OF_HOURS: "Outside Business Hours!",
        ERR_GENERIC_ERROR: "An error occurred!",
      },
      flowBuilderConfig: {
        title: "Design your flow",
        actions: {
          import: "Import",
          export: "Export",
          save: "Save"
        },
        messages: {
          flowStart: "Flow start",
          interval: "Interval {{seconds}} sec.",
          rememberSave: "Don't forget to save your flow!",
          flowSaved: "Flow saved successfully"
        },
        nodes: {
          start: "Start",
          content: "Content",
          menu: "Menu",
          optionFormat: "[{{number}}] {{value}}",
          randomizer: "Randomizer",
          interval: "Interval",
          ticket: "Ticket",
          typebot: "TypeBot",
          openai: "OpenAI",
          question: "Question",
          image: "Image",
          video: "Video",
          audioNode: {
            title: "Audio",
            recordedLive: "Live recorded",
            audioSent: "Audio sent",
            browserNotSupported: "your browser does not support HTML5"
          }
        },
        nodeDescriptions: {
          startFlow: "This block marks the start of your flow!"
        },
        edges: {
          edgeWithoutOnDelete: "Edge without onDelete configured:",
          errorDeletingEdge: "Error deleting edge:",
          removeEdgeTooltip: "Remove connection"
        },
        units: {
          seconds: "seconds"
        },
        validation: {
          tooShort: "Too short!",
          tooLong: "Too long!",
          enterName: "Enter a name!",
          enterMessage: "Enter a message!",
          required: "Required",
          describeAiTraining: "Describe the training for Artificial Intelligence",
          invalidModel: "Invalid model",
          informModel: "Enter the model",
          minTokens: "Minimum 10 tokens",
          maxTokens: "Maximum 4096 tokens",
          informMaxTokens: "Enter the maximum number of tokens",
          minZero: "Minimum 0",
          maxOne: "Maximum 1",
          informTemperature: "Enter the temperature",
          informApiKey: "Enter the API Key",
          minOneMessage: "Minimum 1 message",
          maxFiftyMessages: "Maximum 50 messages",
          informMaxMessages: "Enter the maximum number of messages",
          informVoiceMode: "Enter the voice mode"
        },
        buttons: {
          add: "Add",
          save: "Save",
          edit: "Edit"
        },
        modals: {
          condition: {
            addTitle: "Add condition to flow",
            editTitle: "Edit condition",
            fieldLabel: "Condition field (Enter only 1 key)",
            validationRule: "Validation rule",
            conditionValue: "Condition value to be analyzed"
          },
          ticket: {
            addQueueError: "Add a queue",
            addTitle: "Add a queue to the flow",
            editTitle: "Edit queue",
            selectConnection: "Select a Connection"
          },
          randomizer: {
            addIntervalError: "Add the interval value",
            maxTimeError: "Maximum time reached 120 seconds",
            addTitle: "Add a randomizer to the flow",
            editTitle: "Edit randomizer"
          },
          openai: {
            addTitle: "Add OpenAI/Gemini to flow",
            editTitle: "Edit OpenAI/Gemini of flow"
          },
          question: {
            addTitle: "Add Question to flow",
            editTitle: "Edit Question",
            createTitle: "Create Question in flow",
            messageLabel: "Message",
            saveAnswer: "Save answer"
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
          text: "Text",
          francisca: "Francisca",
          antonio: "Antonio",
          brenda: "Brenda",
          donato: "Donato",
          elza: "Elza",
          fabio: "Fabio",
          giovanna: "Giovanna",
          humberto: "Humberto",
          julio: "Julio",
          leila: "Leila",
          leticia: "Leticia",
          manuela: "Manuela",
          nicolau: "Nicolau",
          valerio: "Valerio",
          yara: "Yara"
        }
      },
      flowBuilderModals: {
        textModal: {
          titleAdd: "Add message to flow",
          titleEdit: "Edit flow message",
          buttonAdd: "Add",
          buttonSave: "Save",
          fields: {
            message: "Message"
          },
          validation: {
            tooShort: "Too short!",
            tooLong: "Too long!",
            required: "Enter a name!",
            messageRequired: "Enter a message!"
          }
        },
        intervalModal: {
          titleAdd: "Add an interval to the flow",
          titleEdit: "Edit interval",
          buttonAdd: "Add",
          buttonEdit: "Edit",
          fields: {
            timeInSeconds: "Time in seconds"
          },
          validation: {
            addValue: "Add the interval value",
            maxTime: "Maximum time reached 120 seconds"
          }
        },
        menuModal: {
          titleAdd: "Add menu to flow",
          titleEdit: "Edit menu",
          buttonAdd: "Add",
          buttonSave: "Save",
          fields: {
            explanationMessage: "Menu explanation message",
            addOption: "Add Option",
            typeOption: "Type {{number}}",
            optionPlaceholder: "Type option"
          }
        },
        singleBlockModal: {
          titleAdd: "Add content to flow",
          titleEdit: "Edit content",
          buttonAdd: "Add",
          buttonSave: "Save",
          elements: {
            text: "Text",
            interval: "Interval",
            image: "Image",
            audio: "Audio",
            video: "Video",
            document: "Document"
          },
          fields: {
            message: "Message",
            timeInSeconds: "Time in seconds",
            sendAsRecordedAudio: "Send as recorded audio",
            noFileSelected: "No file selected"
          },
          buttons: {
            sendImage: "Send image",
            sendAudio: "Send audio",
            sendVideo: "Send video",
            sendDocument: "Send Document"
          },
          validation: {
            emptyMessageFields: "Empty message fields!",
            intervalValidation: "Interval cannot be 0 or greater than 120!",
            fileTooLarge2MB: "File too large! 2MB maximum",
            fileTooLarge5MB: "File too large! 5MB maximum",
            fileTooLarge20MB: "File too large! 20MB maximum",
            fileTooLarge15MB: "File too large! 15MB maximum",
            deleteEmptyCards: "Delete empty cards or send pending files.",
            browserNotSupported: "your browser does not support HTML5",
            onlyMp4Videos: "ATTENTION! Only MP4 videos!"
          },
          messages: {
            contentAddedSuccess: "Content added successfully!",
            uploadingFiles: "Uploading files and creating content...",
            variables: "Variables"
          }
        },
        randomizerModal: {
          titleAdd: "Add a randomizer to the flow",
          titleEdit: "Edit randomizer",
          buttonAdd: "Add",
          buttonEdit: "Edit"
        },
        ticketModal: {
          titleAdd: "Add a queue to the flow",
          titleEdit: "Edit queue",
          buttonAdd: "Add",
          buttonEdit: "Edit",
          fields: {
            selectConnection: "Select a Connection"
          },
          validation: {
            addQueue: "Add a queue"
          }
        },
        typebotModal: {
          titleAdd: "Add Typebot to flow",
          titleEdit: "Edit Typebot to flow",
          titleEditFlow: "Edit Typebot of flow",
          buttonAdd: "Add",
          buttonSave: "Save"
        },
        openaiModal: {
          titleAdd: "Add OpenAI/Gemini to flow",
          titleEdit: "Edit OpenAI/Gemini of flow",
          buttonAdd: "Add",
          buttonSave: "Save",
          models: {
            gpt35: "GPT 3.5 Turbo",
            gpt4o: "GPT 4o",
            gemini15flash: "Gemini 1.5 Flash",
            gemini15pro: "Gemini 1.5 Pro",
            gemini20flash: "Gemini 2.0 Flash",
            gemini20pro: "Gemini 2.0 Pro"
          },
          voices: {
            text: "Text",
            francisca: "Francisca",
            antonio: "Antonio",
            brenda: "Brenda",
            donato: "Donato",
            elza: "Elza",
            fabio: "Fabio",
            giovanna: "Giovanna",
            humberto: "Humberto",
            julio: "Julio",
            leila: "Leila",
            leticia: "Leticia",
            manuela: "Manuela",
            nicolau: "Nicolau",
            valerio: "Valerio",
            yara: "Yara"
          },
          validation: {
            tooShort: "Too short!",
            tooLong: "Too long!",
            required: "Required",
            promptRequired: "Describe the training for Artificial Intelligence",
            invalidModel: "Invalid model",
            minTokens: "Minimum 10 tokens",
            maxTokens: "Maximum 4096 tokens",
            tokensRequired: "Inform the maximum number of tokens",
            temperatureRequired: "Inform the temperature",
            temperatureMin: "Minimum 0",
            temperatureMax: "Maximum 1",
            apiKeyRequired: "Inform the API Key",
            messagesMin: "Minimum 1 message",
            messagesMax: "Maximum 50 messages",
            messagesRequired: "Inform the maximum number of messages",
            voiceRequired: "Inform the voice mode"
          }
        },
        questionModal: {
          titleAdd: "Add Question to flow",
          titleEdit: "Edit Question of flow",
          titleCreate: "Create Question in flow",
          buttonAdd: "Add",
          buttonSave: "Save",
          fields: {
            message: "Message",
            saveAnswer: "Save answer"
          }
        }
      },
      moments: {
        title: "Service Panel",
        pending: "Pending",
        attendances: "Attendances: ",
        noQueue: "NO QUEUE",
        accessTicket: "Access Ticket"
      },
      flowBuilderNodes: {
        message: "Message",
        condition: "Condition",
        image: "Image"
      },
      subscription: {
        title: "Subscription",
        form: {
          licenseLabel: "License Period",
          licenseExpiresIn: "Your license expires in {{days}} days!",
          licenseExpiresToday: "Your license expires today!",
          billingEmailLabel: "Billing email",
          subscribeButton: "Subscribe Now!"
        },
        checkout: {
          form: {
            fullName: "Full name*",
            fullNameRequired: "Full name is required",
            lastName: "Last name*",
            lastNameRequired: "Last name is required",
            address: "Address*",
            addressRequired: "Address is required",
            city: "City*",
            cityRequired: "City is required",
            state: "State*",
            stateRequired: "State is required",
            document: "Tax ID*",
            documentRequired: "Tax ID is required",
            documentInvalid: "Invalid Tax ID format",
            country: "Country*",
            countryRequired: "Country is required",
            useAddressForPayment: "Use this address for payment details",
            nameOnCard: "Name on card*",
            nameOnCardRequired: "Name on card is required",
            cardNumber: "Card number*",
            cardNumberRequired: "Card number is required",
            cardNumberInvalid: "Card number is not valid (e.g. 4111111111111)",
            expiryDate: "Expiry date*",
            expiryDateRequired: "Expiry date is required",
            expiryDateInvalid: "Expiry date is not valid",
            cvv: "CVV*",
            cvvRequired: "CVV is required",
            cvvInvalid: "CVV is invalid (e.g. 357)"
          }
        }
      },
      ticketsResponsive: {
        actions: {
          selectTicket: "Select Ticket",
          transferTicket: "Transfer Ticket",
          spyConversation: "Spy Conversation"
        },
        tabs: {
          ticket: "Ticket",
          assistance: "Assistance"
        },
        search: {
          searchInMessagesTooltip: "Check to also search in message contents (slower)"
        },
        filter: {
          all: "All"
        },
        sort: {
          ascending: "Ascending",
          descending: "Descending"
        },
        dialog: {
          spyingConversation: "Spying conversation",
          loadingMessages: "Loading messages..."
        },
        status: {
          noQueue: "NO QUEUE"
        }
      },
      messagesResponsive: {
        types: {
          location: "Location",
          contact: "Contact"
        },
        actions: {
          download: "Download",
          dropFileHere: "Drop file here"
        },
        status: {
          forwarded: "Forwarded",
          deletedByContact: "🚫 This message was deleted by contact",
          deletedMessage: "🚫 _Deleted message_",
          deletedByMe: "🚫 This message was deleted",
          edited: "Edited"
        },
        reactions: {
          youReacted: "You reacted...",
          contactReacted: " reacted... "
        },
        timestamp: {
          today: "TODAY"
        },
        placeholder: {
          sayHello: "Say hello to your new contact!"
        },
        ads: {
          adClick: "Ad Click",
          defaultUserMessage: "Hello! I'm interested and would like more information, please."
        },
        warnings: {
          facebookPolicy: "You have 24 hours to respond after receiving a message, according to Facebook's policies."
        }
      },
      messageInputResponsive: {
        type: {
          document: "Document",
          buttons: "Buttons"
        },
        tooltip: {
          toggleSignature: "Enable/Disable Signature",
          toggleComments: "Enable/Disable Comments"
        },
        privateMessage: {
          suffix: "Private Message"
        }
      },
      tagsResponsive: {
        validation: {
          tooShort: "Tag too short!"
        },
        placeholder: "Tags"
      },
      showTicketOpenModal: {
        buttons: {
          close: "Close"
        }
      },
      reactions: {
        successMessage: "Reaction sent successfully"
      },
      vcardPreview: {
        chatButton: "Chat"
      },
      locationPreview: {
        viewButton: "View"
      },
      contactNotes: {
        addedSuccess: "Note added successfully!",
        deletedSuccess: "Note deleted successfully!",
        deleteTitle: "Delete Record",
        deleteConfirmation: "Do you really want to delete this record?",
        cancelButton: "Cancel",
        saveButton: "Save"
      },
      validationResponsive: {
        ratingRequired: "Rating required"
      }
    }
  }
};

export { messages };