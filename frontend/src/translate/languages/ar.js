const messages = {
  ar: {
    translations: {
      signup: {
        title: "تسجيل",
        toasts: {
          success: "تم إنشاء المستخدم بنجاح! قم بتسجيل الدخول!!!",
          fail: "خطأ في إنشاء المستخدم. تحقق من البيانات المدخلة.",
          userCreationDisabled: "تم تعطيل تسجيل المستخدمين الجدد.",
          verificationError: "خطأ في التحقق من أذونات التسجيل.",
        },
        form: {
          name: "الاسم",
          email: "البريد الإلكتروني",
          password: "كلمة المرور",
          company: "اسم المؤسسة",
          phone: "واتساب (كود المنطقة + الرقم)",
          plan: "الخطة",
          planDetails: {
            attendants: "الوكلاء",
            whatsapp: "واتساب",
            queues: "الصفوف",
            currency: "ر.س",
          },
        },
        buttons: {
          submit: "تسجيل",
          login: "هل لديك حساب؟ سجل الدخول!",
        },
      },
      validation: {
        tooShort: "قصير جداً!",
        tooLong: "طويل جداً!",
        required: "مطلوب",
        invalidEmail: "بريد إلكتروني غير صحيح",
      },
      login: {
        title: "تسجيل الدخول",
        logoAlt: "الشعار",
        emailLabel: "البريد الإلكتروني",
        passwordLabel: "كلمة المرور",
        rememberMe: "تذكرني",
        loginButton: "تسجيل الدخول",
        signupButton: "سجل",
        forgotPassword: "نسيت كلمة المرور؟",
        whatsappLabel: "تحدث معنا على واتساب",
        whatsappTitle: "تحدث معنا على واتساب",
        form: {
          email: "البريد الإلكتروني",
          password: "كلمة المرور",
          button: "دخول",
        },
        buttons: {
          submit: "تسجيل الدخول",
          register: "ليس لديك حساب؟ سجل!",
        },
      },
      auth: {
        toasts: {
          success: "تم تسجيل الدخول بنجاح!",
        },
        dueDate: {
          expiration: "انتهاء صلاحية اشتراكك في",
          days: "أيام!",
          day: "يوم!",
          expirationToday: "ينتهي اشتراكك اليوم!",
        },
        token: "الرمز المميز",
      },
      companies: {
        title: "الشركات",
        form: {
          name: "اسم الشركة",
          plan: "الخطة",
          token: "الرمز المميز",
          submit: "تسجيل",
          success: "تم إنشاء الشركة بنجاح!",
        },
      },
      forgotPassword: {
        title: "إعادة تعيين كلمة المرور",
        form: {
          emailLabel: "أدخل بريدك الإلكتروني",
          submitButton: "إرسال رابط إعادة التعيين",
          backToLogin: "العودة لتسجيل الدخول",
        },
        loading: {
          sending: "جاري الإرسال...",
          sent: "تم الإرسال!",
        },
        toasts: {
          success: "تم إرسال رابط إعادة تعيين كلمة المرور بنجاح",
        },
      },
      resetPassword: {
        title: "إعادة تعيين كلمة المرور",
        form: {
          newPassword: "كلمة المرور الجديدة",
          confirmPassword: "تأكيد كلمة المرور",
        },
        buttons: {
          submit: "إعادة تعيين كلمة المرور",
          submitting: "جاري إعادة التعيين...",
          submitted: "تم إعادة التعيين!",
          backToLogin: "العودة لتسجيل الدخول",
        },
        errors: {
          passwordMismatch: "كلمات المرور غير متطابقة",
          passwordTooShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
          invalidToken: "رمز إعادة التعيين مفقود أو غير صحيح. يرجى طلب رابط إعادة تعيين جديد.",
          resetError: "خطأ في إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.",
        },
        toasts: {
          success: "تم إعادة تعيين كلمة المرور بنجاح",
          passwordMismatch: "كلمات المرور غير متطابقة",
          passwordTooShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        },
      },
      financeiro: {
        title: "الفواتير",
        table: {
          details: "التفاصيل",
          users: "المستخدمون",
          connections: "الاتصالات",
          queues: "قوائم الانتظار",
          value: "القيمة",
          dueDate: "تاريخ الاستحقاق",
          status: "الحالة",
          action: "الإجراء"
        },
        tooltips: {
          details: "تفاصيل الفاتورة",
          users: "عدد المستخدمين",
          connections: "عدد الاتصالات",
          queues: "عدد قوائم الانتظار",
          value: "قيمة الفاتورة",
          dueDate: "تاريخ الاستحقاق"
        },
        status: {
          paid: "مدفوع",
          overdue: "منتهي الصلاحية",
          open: "مفتوح",
          yes: "نعم",
          no: "لا",
          overdueFor: "منتهي الصلاحية منذ {{days}} أيام",
          dueToday: "مستحق اليوم",
          dueIn: "مستحق خلال {{days}} أيام"
        },
        buttons: {
          pay: "ادفع",
          paid: "مدفوع",
          payNow: "ادفع الآن"
        },
        checkout: {
          title: "تقريباً انتهينا!",
          steps: {
            data: "البيانات",
            customize: "تخصيص",
            review: "مراجعة"
          },
          messages: {
            notFound: "غير موجود",
            paymentNotice: "بعد الدفع، قم بتحديث الصفحة!",
            subscriptionSuccess: "تم الاشتراك بنجاح! في انتظار معالجة الدفع"
          },
          buttons: {
            back: "عودة",
            pay: "ادفع",
            next: "التالي"
          },
          pricing: {
            users: "المستخدمون",
            connection: "الاتصال",
            queues: "قوائم الانتظار",
            select: "حدد",
            perMonth: "/شهر"
          },
          review: {
            title: "ملخص الاشتراك"
          },
          success: {
            total: "الإجمالي",
            copied: "تم النسخ",
            copyQr: "نسخ رمز QR",
            finalizeMessage: "لإكمال العملية، ما عليك سوى الدفع عن طريق مسح أو لصق رمز Pix أعلاه :)",
            licenseRenewed: "تم تجديد ترخيصك حتى"
          },
          planDetails: {
            title: "تفاصيل الخطة",
            billing: "الفوترة: شهرية"
          },
          paymentInfo: {
            title: "معلومات الدفع",
            email: "البريد الإلكتروني:",
            name: "الاسم:",
            document: "CPF/CNPJ:",
            total: "الإجمالي:"
          }
        }
      },
      dashboard: {
        title: "لوحة التحكم",
        buttons: {
          filter: "تصفية"
        },
        tabs: {
          indicators: "المؤشرات",
          assessments: "NPS",
          attendants: "الوكلاء",
          performance: "الأداء"
        },
        charts: {
          performance: "الرسوم البيانية",
          userPerformance: "رسوم بيانية للمستخدمين",
          hourlyServices: "الخدمات في الساعة",
          ticketsLabel: "التذاكر",
          score: "النقاط",
          perDay: {
            title: "الخدمات اليوم: ",
          },
          errorFetchingTickets: "خطأ في جلب معلومات التذاكر",
          noDataAvailable: "لا توجد بيانات متاحة للفترة المحددة.",
        },
        cards: {
          inAttendance: "في الخدمة",
          waiting: "انتظار",
          activeAttendants: "وكلاء نشطون",
          finalized: "مكتملة",
          newContacts: "جهات اتصال جديدة",
          totalReceivedMessages: "رسائل مستلمة",
          totalSentMessages: "رسائل مرسلة",
          averageServiceTime: "متوسط وقت الخدمة",
          averageWaitingTime: "متوسط وقت الانتظار",
          status: "الحالة (الحالية)",
          activeTickets: "تذاكر نشطة",
          passiveTickets: "تذاكر خاملة",
          groups: "مجموعات",
        },
        users: {
          name: "الاسم",
          numberAppointments: "عدد الخدمات",
          statusNow: "الحالي",
          totalCallsUser: "إجمالي الخدمات لكل مستخدم",
          totalAttendances: "إجمالي الخدمات",
          totalLabel: "إجمالي الخدمات: {{count}}",
          queues: "طوابير",
          defaultQueue: "الاتصال الافتراضي",
          workingHours: "ساعات العمل",
          startWork: "بداية العمل",
          endWork: "نهاية العمل",
          farewellMessage: "رسالة وداع",
          theme: "الموضوع الافتراضي",
          menu: "القائمة الافتراضية"
        },
        date: {
          initialDate: "التاريخ الأولي",
          finalDate: "التاريخ النهائي",
        },
        licence: {
          available: "متاح حتى",
        },
        assessments: {
          totalCalls: "إجمالي الخدمات",
          callsWaitRating: "خدمات في انتظار التقييم",
          callsWithoutRating: "خدمات بدون تقييم",
          ratedCalls: "خدمات مقيمة",
          evaluationIndex: "مؤشر التقييم",
          score: "النتيجة",
          prosecutors: "المحامون",
          neutral: "محايد",
          detractors: "منتقدون",
          generalScore: "نتيجة NPS الإجمالية",
        },
        status: {
          online: "متصل",
          offline: "غير متصل",
        },
        filters: {
          title: "الفلاتر",
          initialDate: "البداية",
          finalDate: "النهاية",
          filterButton: "تصفية",
        },
        errors: {
          loadData: "لم نتمكن من تحميل بيانات لوحة التحكم.",
          exportExcel: "خطأ في التصدير إلى Excel.",
        },
        export: {
          sheetName: "تقرير الوكلاء",
          fileName: "agent-report.xlsx",
        },
        nps: {
          overallScore: "نتيجة NPS الإجمالية",
        },
      },
      reports: {
        title: "تقارير الاستطلاعات المنجزة",
        operator: "المشغل",
        period: "الفترة",
        until: "حتى",
        date: "التاريخ",
        reportTitle: "التقارير",
        calls: "الخدمات",
        search: "الاستطلاعات",
        durationCalls: "مدة الخدمات",
        grupoSessions: "خدمات الجماعات",
        groupTicketsReports: {
          timezone: "America/Sao_Paulo",
          msgToast: "جاري إنشاء تقرير مضغوط، يرجى الانتظار.",
          errorToast: "خطأ في إنشاء التقرير",
          back: "العودة",
          groupServiceReport: "تقرير خدمات الجماعات",
          loading: "جاري التحميل...",
          contact: "جهة الاتصال",
          dateOpen: "تاريخ الافتتاح",
          dateLastUpdated: "تاريخ آخر تحديث",
          agent: "من قدم الخدمة",
          agentClosed: "من أغلق",
          waitingAssistance: "في انتظار المساعدة",
          process: "في الخدمة",
        },
        researchReports: {
          response: "الاستجابة",
          active: "(نشط)",
          inactive: "(غير نشط)",
          quantity: "الكمية",
          percentage: "النسبة المئوية",
          title: "تقارير الاستطلاعات المنجزة",
          activeSearch: "البحث النشط",
          inactiveSearch: "البحث غير النشط",
        },
        ticketDurationDetail: {
          msgToast: "جاري إنشاء تقرير مضغوط، يرجى الانتظار.",
          title: "تقرير مدة الخدمة",
          startService: "بداية الخدمة",
          lastUpdated: "آخر تحديث",
          lastAgent: "آخر وكيل",
          durationFinished: "المدة بعد الانتهاء",
        },
        ticketDuration: {
          title: "تقرير مدة الخدمات",
          contact: "جهة الاتصال",
          open: "مفتوح",
          pending: "معلق",
          finished: "مكتمل",
          durationFinished: "مدة المكتملة",
          durationAfterFinished: "المدة بعد الانتهاء",
          actions: "الإجراءات",
        },
        ticketReports: {
          msgToast: "جاري إنشاء تقرير مضغوط، يرجى الانتظار.",
          title: "تقرير الخدمة",
        },
        pdf: {
          title: "قائمة الخدمات المكتملة",
          exportTitle: "قائمة خدمات المجموعات المكتملة",
        },
        form: {
          initialDate: "التاريخ الأولي",
          finalDate: "التاريخ النهائي",
        },
        excel: {
          connection: "الاتصال",
          contact: "جهة الاتصال",
          user: "المستخدم",
          queue: "الطابور",
          status: "الحالة",
          lastMessage: "آخرRسالة",
          dateOpen: "تاريخالافتتاح",
          timeOpen: "وقتالافتتاح",
          dateClose: "تاريخالإغلاق",
          timeClose: "وقتالإغلاق",
          supportTime: "وقتالدعم",
          nps: "nps",
          fileName: "تقرير-الخدمات.xlsx",
          sheetName: "تقريرالخدمات",
        },
        tooltips: {
          ticketLogs: "سجلات التذكرة",
          accessTicket: "الوصول للتذكرة",
          exportExcel: "تصدير إلى Excel",
        },
      },
      kanban: {
        title: "كانبان",
        subtitle: "تصور التذاكر بتنسيق كانبان",
        searchPlaceholder: "بحث",
        subMenus: {
          list: "اللوحة",
          tags: "المسارات",
        },
        ticketNumber: "تذكرة رقم ",
        viewTicket: "عرض التذكرة",
        startDate: "تاريخ البداية",
        endDate: "تاريخ النهاية",
        search: "بحث",
        addColumns: "+ إضافة أعمدة",
        ticketTagRemoved: "تم إزالة علامة التذكرة!",
        ticketTagAdded: "تم إضافة علامة التذكرة بنجاح!",
        ticketMoveError: "خطأ في نقل التذكرة",
        iconChannelError: "خطأ",
        noTickets: "لا توجد تذاكر",
        emptyStateTags: "لم يتم إنشاء علامات كانبان",
        emptyStateTagsDescription: "أنشئ علامة كانبان الأولى لبدء تنظيم التذاكر",
        createFirstTag: "إنشاء العلامة الأولى",
        emptyStateTickets: "لم يتم العثور على تذاكر",
        emptyStateTicketsDescription: "اضبط مرشحات التاريخ أو أنشئ تذاكر جديدة",
        errorTitle: "خطأ في تحميل كانبان",
        errorDescription: "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.",
        retry: "حاول مرة أخرى",
      },
      campaigns: {
        title: "الحملات",
        searchPlaceholder: "بحث",
        subMenus: {
          list: "قائمة",
          listContacts: "قائمة جهات الاتصال",
          settings: "الإعدادات",
        },
        status: {
          inactive: "غير نشطة",
          scheduled: "مجدولة",
          inProgress: "قيد التنفيذ",
          cancelled: "ملغاة",
          finished: "منتهية",
        },
        common: {
          none: "لا شيء",
          notDefined: "غير محدد",
          noSchedule: "لا يوجد جدولة",
          notCompleted: "غير مكتملة",
          enabled: "مفعلة",
          disabled: "معطلة",
        },
        modal: {
          tabLabels: {
            msg1: "رسالة 1",
            msg2: "رسالة 2",
            msg3: "رسالة 3",
            msg4: "رسالة 4",
            msg5: "رسالة 5",
          },
          helpText: "استخدم متغيرات مثل {nome}, {numero}, {email} أو حدد متغيرات مخصصة.",
        },
        settings: {
          randomInterval: "فترة إرسال عشوائية",
          noBreak: "بلا فاصل",
          intervalGapAfter: "فترة أكبر بعد",
          undefined: "غير محدد",
          messages: "رسائل",
          laggerTriggerRange: "فترة إطلاق أكبر",
          addVar: "إضافة متغير",
          save: "حفظ",
          close: "إغلاق",
          add: "إضافة",
          shortcut: "اختصار",
          content: "المحتوى",
        },
        buttons: {
          add: "حملة جديدة",
          contactLists: "قوائم جهات الاتصال",
          stopCampaign: "إيقاف الحملة",
        },
        table: {
          name: "الاسم",
          whatsapp: "الاتصال",
          contactList: "قائمة جهات الاتصال",
          option: "لا شيء",
          disabled: "معطلة",
          enabled: "مفعلة",
          status: "الحالة",
          scheduledAt: "مجدولة",
          completedAt: "مكتملة",
          confirmation: "التأكيد",
          actions: "الإجراءات",
        },
        dialog: {
          new: "حملة جديدة",
          update: "تحرير الحملة",
          readonly: "للعرض فقط",
          help: "استخدم متغيرات مثل {nome}, {numero}, {email} أو حدد متغيرات مخصصة.",
          form: {
            name: "الاسم",
            message1: "رسالة 1",
            message2: "رسالة 2",
            message3: "رسالة 3",
            message4: "رسالة 4",
            message5: "رسالة 5",
            confirmationMessage1: "رسالة تأكيد 1",
            confirmationMessage2: "رسالة تأكيد 2",
            confirmationMessage3: "رسالة تأكيد 3",
            confirmationMessage4: "رسالة تأكيد 4",
            confirmationMessage5: "رسالة تأكيد 5",
            messagePlaceholder: "محتوى الرسالة",
            whatsapp: "الاتصال",
            status: "الحالة",
            scheduledAt: "مجدولة",
            confirmation: "التأكيد",
            contactList: "قائمة جهات الاتصال",
            tagList: "العلامات",
            statusTicket: "حالة التذكرة",
            openTicketStatus: "مفتوح",
            pendingTicketStatus: "معلق",
            closedTicketStatus: "مغلق",
            enabledOpenTicket: "مفعل",
            disabledOpenTicket: "معطل",
            openTicket: "فتح تذكرة",
          },
          buttons: {
            add: "إضافة",
            edit: "تحديث",
            okadd: "موافق",
            cancel: "إلغاء الإرسال",
            restart: "إعادة تشغيل الإرسال",
            close: "إغلاق",
            attach: "إرفاق ملف",
          },
        },
        confirmationModal: {
          deleteTitle: "حذف",
          deleteMessage: "هذا الإجراء لا يمكن التراجع عنه.",
        },
        toasts: {
          success: "تم تنفيذ العملية بنجاح",
          cancel: "تم إلغاء الحملة",
          restart: "تم إعادة تشغيل الحملة",
          deleted: "تم حذف السجل",
        },
        noPermission: "هذه الشركة لا تملك إذن الوصول لهذه الصفحة! نحن نقوم بإعادة توجيهك.",
      },
      campaignsConfig: {
        title: "إعدادات الحملات",
        noPermissionMessage: "هذه الشركة لا تملك إذن الوصول لهذه الصفحة! نحن نقوم بإعادة توجيهك.",
        settingsSaved: "تم حفظ الإعدادات",
        intervals: "الفترات",
        seconds: "ثوانٍ",
      },
      campaignsPhrase: {
        title: "الحملات",
        phraseDeleted: "تم حذف العبارة",
        phraseUpdated: "تم تحديث العبارة بنجاح!",
        phraseCreated: "تم إنشاء العبارة بنجاح!",
        addCampaign: "حملة",
        table: {
          name: "الاسم",
          status: "الحالة",
          active: "نشط",
          inactive: "غير نشط",
          empty: "لم يتم العثور على حملات عبارات",
        },
        modal: {
          editTitle: "تحرير حملة تدفق بالعبارة",
          newTitle: "حملة تدفق جديدة بالعبارة",
          nameLabel: "اسم مشغل العبارة",
          flowLabel: "اختر تدفقًا",
          flowPlaceholder: "اختر تدفقًا",
          connectionPlaceholder: "اختر اتصالًا",
          phraseLabel: "أي عبارة تشغل التدفق؟",
          matchTypeLabel: "نوع المطابقة",
          matchTypeExact: "مطابقة تامة",
          matchTypeContains: "يحتوي على الكلمة",
          matchTypeTooltip: "تامة: يجب أن تطابق الرسالة الكلمة تمامًا. يحتوي: يمكن أن تظهر الكلمة في أي مكان في الرسالة",
          statusLabel: "الحالة",
          cancelButton: "إلغاء",
          saveButton: "حفظ الحملة",
          createButton: "إنشاء حملة",
        },
      },
      compaies: {
        title: "الشركات",
        form: {
          documentLabel: "(اختياري) CPF/CNPJ",
          documentPlaceholder: "000.000.000-00 أو 00.000.000/0000-00",
          documentInvalid: "CPF/CNPJ غير صالح",
          documentDuplicate: "CPF/CNPJ مسجل بالفعل",
          documentNotProvided: "غير متوفر",
          nameRequired: "الاسم مطلوب",
          emailRequired: "البريد الإلكتروني مطلوب",
        },
        searchPlaceholder: "البحث عن الشركات...",
        searchLabel: "حقل البحث عن الشركات",
        clearSearch: "مسح البحث",
        notifications: {
          noPermission: "هذه الشركة لا تملك إذن الوصول لهذه الصفحة! نحن نقوم بإعادة توجيهك."
        },
        toasts: {
          deleted: "تم حذف الشركة"
        },
        buttons: {
          add: "إضافة شركة"
        },
        table: {
          ID: "معرّف",
          status: "الحالة",
          name: "الاسم",
          email: "البريد الإلكتروني",
          namePlan: "الخطة",
          value: "القيمة",
          createdAt: "تم إنشاؤها في",
          dueDate: "تاريخ الاستحقاق",
          lastLogin: "آخر دخول",
          folderSize: "حجم المجلد",
          totalFiles: "إجمالي الملفات",
          lastUpdate: "آخر تحديث",
          actions: "الإجراءات",
          yes: "نعم",
          no: "لا"
        },
        confirmationModal: {
          deleteTitle: "حذف الشركة",
          deleteMessage: "هذا الإجراء لا يمكن التراجع عنه."
        }
      },
      contactModal: {
        title: {
          add: "إضافة جهة اتصال",
          edit: "تحرير جهة اتصال",
        },
        form: {
          mainInfo: "بيانات جهة الاتصال",
          extraInfo: "معلومات إضافية",
          name: "الاسم",
          number: "رقم واتساب",
          email: "البريد الإلكتروني",
          extraName: "اسم الحقل",
          extraValue: "القيمة",
          chatBotContact: "إلغاء تنشيط الشات بوت",
          termsLGDP: "تم قبول شروط LGPD في:",
          whatsapp: "اتصال المصدر: ",
          numberPlaceholder: "5513912344321",
          emailPlaceholder: "عنوان البريد الإلكتروني"
        },
        buttons: {
          addExtraInfo: "إضافة معلومة",
          okAdd: "إضافة",
          okEdit: "حفظ",
          cancel: "إلغاء",
        },
        success: "تم حفظ جهة الاتصال بنجاح.",
      },
      flowbuilder: {
        title: "تدفقات المحادثة",
        subMenus: {
          campaign: "تدفق الحملة",
          conversation: "تدفق المحادثة"
        },
        buttons: {
          add: "إضافة تدفق",
          editName: "تحرير الاسم",
          editFlow: "تحرير التدفق",
          duplicate: "تكرار",
          delete: "حذف"
        },
        table: {
          status: "الحالة"
        },
        status: {
          active: "نشط",
          inactive: "غير نشط"
        },
        toasts: {
          deleteSuccess: "تم حذف التدفق بنجاح",
          duplicateSuccess: "تم تكرار التدفق بنجاح"
        },
        confirmationModal: {
          deleteTitle: "هل أنت متأكد من أنك تريد حذف هذا التدفق؟ سيتم فقدان جميع التكاملات ذات الصلة.",
          duplicateTitle: "هل تريد تكرار التدفق {flowName}؟",
          duplicateMessage: "هل أنت متأكد من أنك تريد تكرار هذا التدفق؟"
        }
      },
      flowbuilderModal: {
        flowNotIdPhrase: "التدفق الافتراضي",
        title: {
          add: "إضافة تدفق",
          edit: "تحرير التدفق"
        },
        validation: {
          tooShort: "قصير جداً!",
          tooLong: "طويل جداً!",
          required: "أدخل اسماً!"
        }
      },
      companyModal: {
        title: {
          add: "إضافة شركة",
          edit: "تحرير الشركة"
        },
        form: {
          name: "الاسم",
          email: "البريد الإلكتروني",
          passwordDefault: "كلمة المرور",
          numberAttendants: "المستخدمون",
          numberConections: "الاتصالات",
          status: "نشط"
        },
        buttons: {
          okAdd: "إضافة",
          okEdit: "حفظ",
          cancel: "إلغاء"
        },
        success: "تم حفظ الشركة بنجاح."
      },
      channels: {
        whatsapp: "واتساب",
        facebook: "فيسبوك",
        instagram: "إنستغرام"
      },
      connections: {
        title: "الاتصالات",
        waitConnection: "انتظر... سيتم إعادة تشغيل اتصالاتك!",
        newConnection: "اتصال جديد",
        restartConnections: "إعادة تشغيل الاتصالات",
        callSupport: "اتصال بالدعم",
        toasts: {
          deleted: "تم حذف الاتصال بنجاح!",
          closedimported: "نحن نغلق التذاكر المستوردة، يرجى الانتظار لحظة"
        },
        confirmationModal: {
          closedImportedTitle: "إغلاق التذاكر المستوردة",
          closedImportedMessage: "إذا أكدت، سيتم إغلاق جميع التذاكر المستوردة",
          deleteTitle: "حذف",
          deleteMessage: "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.",
          disconnectTitle: "قطع الاتصال",
          disconnectMessage: "هل أنت متأكد؟ ستحتاج إلى مسح رمز QR مرة أخرى."
        },
        buttons: {
          add: "إضافة اتصال",
          disconnect: "قطع الاتصال",
          tryAgain: "حاول مرة أخرى",
          qrcode: "رمز QR",
          newQr: "رمز QR جديد",
          closedImported: "إغلاق جميع التذاكر المستوردة",
          preparing: "تحضير الرسائل للاستيراد",
          importing: "استيراد رسائل واتساب",
          processed: "تمت المعالجة",
          in: "من",
          connecting: "جاري الاتصال"
        },
        typography: {
          processed: "تمت المعالجة",
          in: "من",
          date: "تاريخ الرسالة"
        },
        toolTips: {
          disconnected: {
            title: "فشل في بدء جلسة واتساب",
            content: "تأكد من أن هاتفك متصل بالإنترنت وحاول مرة أخرى، أو اطلب رمز QR جديد"
          },
          qrcode: {
            title: "في انتظار مسح رمز QR",
            content: "انقر على زر 'رمز QR' وامسح رمز QR بهاتفك لبدء الجلسة"
          },
          connected: {
            title: "تم إنشاء الاتصال!"
          },
          timeout: {
            title: "فُقد الاتصال بالهاتف",
            content: "تأكد من أن هاتفك متصل بالإنترنت وأن واتساب مفتوح، أو انقر على 'قطع الاتصال' للحصول على رمز QR جديد"
          }
        },
        table: {
          name: "الاسم",
          status: "الحالة",
          lastUpdate: "آخر تحديث",
          default: "افتراضي",
          actions: "الإجراءات",
          session: "الجلسة",
          number: "رقم واتساب",
          channel: "القناة"
        },
        iconChannel: {
          error: "خطأ"
        }
      },
      flowBuilder: {
        welcomeFlow: "تدفق الترحيب",
        welcomeFlowDescription: "يتم تشغيل هذا التدفق فقط لجهات الاتصال الجديدة، الأشخاص الذين ليسوا في قائمة جهات الاتصال الخاصة بك والذين أرسلوا رسالة",
        defaultResponseFlow: "تدفق الرد الافتراضي",
        defaultResponseFlowDescription: "يتم إرسال الرد الافتراضي مع أي حرف مختلف عن الكلمة المفتاحية. انتباه! سيتم تشغيله إذا كانت الخدمة مغلقة بالفعل ومضى 6 ساعات على إغلاقها.",
        title: "التدفق الافتراضي",
        save: "حفظ",
        updatedSuccess: "تم تحديث التدفقات الافتراضية",
        deleteConfirmation: "هل أنت متأكد من أنك تريد حذف هذا التدفق؟ ستفقد جميع التكاملات ذات الصلة.",
      },
      contactImport: {
        title: "استيراد جهات الاتصال من ملف",
        validation: {
          noNumberField: "لم يتم اختيار حقل رقم جهة الاتصال",
          noNameField: "لم يتم اختيار حقل اسم جهة الاتصال",
          noContactsSelected: "لا توجد جهة اتصال مختارة",
          fieldAlreadySelected: "تم اختيار الحقل {{field}} مسبقاً."
        },
        messages: {
          successComplete: "تم الاستيراد بنجاح",
          successWithErrors: "تم الاستيراد بنجاح، ولكن كانت هناك بعض الأخطاء",
          importing: "جاري الاستيراد... يرجى الانتظار",
          processing: "جاري معالجة الملف...",
          invalidFile: "ملف غير صالح!",
          contactsCreated: "جهات اتصال تم إنشاؤها",
          contactsIgnored: "جهات اتصال تم تجاهلها (رقم غير صالح أو غير محدد للتحديث)"
        },
        fields: {
          name: "الاسم",
          number: "الرقم",
          email: "البريد الإلكتروني",
          tags: "العلامات"
        },
        buttons: {
          validateWhatsApp: "التحقق من جهات الاتصال في واتساب",
          importContacts: "استيراد جهات الاتصال",
          cancel: "إلغاء",
          back: "رجوع"
        },
        dropzone: {
          clickOrDrag: "انقر أو اسحب ملف",
          importantNote: "* مهم: يتم قبول الملفات بالامتدادات التالية فقط: xls، xlsx، csv، txt"
        }
      },
      chat: {
        noTicketMessage: "اختر تذكرة لبدء المحادثة.",
        deleteConversationTitle: "حذف المحادثة",
        deleteConversationMessage: "هذا الإجراء لا يمكن التراجع عنه، تأكيد؟",
        messagePlaceholder: "اكتب رسالتك...",
        sendButtonTooltip: "إرسال رسالة",
        noMessagesYet: "لا توجد رسائل بعد. ابدأ المحادثة!",
        loadingMessages: "جاري تحميل الرسائل...",
        popover: {
          buttonTooltip: "المحادثات الداخلية",
          loading: "جاري تحميل المحادثات...",
          noChats: "لا توجد محادثات متاحة",
          notificationNotSupported: "هذا المتصفح لا يدعم الإشعارات",
          accessibilityLabel: "قائمة المحادثات الداخلية",
        },
      },
      userStatus: {
        online: "متصل",
        offline: "غير متصل",
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "يجب أن يكون هناك واتساب افتراضي واحد على الأقل.",
        ERR_NO_DEF_WAPP_FOUND: "لم يتم العثور على واتساب افتراضي. تحقق من صفحة الاتصالات.",
        ERR_WAPP_NOT_INITIALIZED: "لم يتم تهيئة جلسة واتساب هذه. تحقق من صفحة الاتصالات.",
        ERR_WAPP_CHECK_CONTACT: "تعذر التحقق من جهة اتصال واتساب. تحقق من صفحة الاتصالات",
        ERR_WAPP_INVALID_CONTACT: "هذا ليس رقم واتساب صحيح.",
        ERR_WAPP_DOWNLOAD_MEDIA: "تعذر تنزيل الوسائط من واتساب. تحقق من صفحة الاتصالات.",
        ERR_INVALID_CREDENTIALS: "خطأ في المصادقة. حاول مرة أخرى.",
        ERR_SENDING_WAPP_MSG: "خطأ في إرسال رسالة واتساب. تحقق من صفحة الاتصالات.",
        ERR_DELETE_WAPP_MSG: "تعذر حذف رسالة واتساب.",
        ERR_OTHER_OPEN_TICKET: "يوجد بالفعل تذكرة مفتوحة لهذا الاتصال.",
        ERR_TICKET_ALREADY_ACCEPTED: "تم قبول هذه التذكرة بالفعل من قبل وكيل آخر.",
        ERR_SESSION_EXPIRED: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول.",
        ERR_USER_CREATION_DISABLED: "تم إلغاء إنشاء المستخدم من قبل المسؤول.",
        ERR_NO_PERMISSION: "ليس لديك إذن للوصول إلى هذا المورد.",
        ERR_DUPLICATED_CONTACT: "يوجد بالفعل جهة اتصال بهذا الرقم.",
        ERR_NO_SETTING_FOUND: "لم يتم العثور على إعداد بهذا المعرف.",
        ERR_NO_CONTACT_FOUND: "لم يتم العثور على جهة اتصال بهذا المعرف.",
        ERR_NO_TICKET_FOUND: "لم يتم العثور على تذكرة بهذا المعرف.",
        ERR_NO_USER_FOUND: "لم يتم العثور على مستخدم بهذا المعرف.",
        ERR_NO_WAPP_FOUND: "لم يتم العثور على واتساب بهذا المعرف.",
        ERR_CREATING_MESSAGE: "خطأ في إنشاء رسالة في قاعدة البيانات.",
        ERR_CREATING_TICKET: "خطأ في إنشاء تذكرة في قاعدة البيانات.",
        ERR_FETCH_WAPP_MSG: "خطأ في جلب الرسالة من واتساب، ربما تكون قديمة جداً.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS: "هذا اللون قيد الاستخدام بالفعل، اختر آخر.",
        ERR_WAPP_GREETING_REQUIRED: "رسالة الترحيب إجبارية عندما يكون هناك أكثر من طابور واحد.",
        ERR_OUT_OF_HOURS: "خارج ساعات العمل!",
        ERR_GENERIC_ERROR: "حدث خطأ!",
      },
      chatInternal: {
        new: "جديد",
        tabs: {
          chats: "المحادثات",
          messages: "الرسائل",
        },
        form: {
          titleLabel: "العنوان",
          titlePlaceholder: "العنوان",
        },
        modal: {
          conversation: "المحادثة",
          title: "العنوان",
          filterUsers: "تصفية بالمستخدمين",
          cancel: "إغلاق",
          save: "حفظ",
        },
        modalDelete: {
          title: "حذف المحادثة",
          message: "هذا الإجراء لا يمكن التراجع عنه، تأكيد؟",
        },
      },
      contactLists: {
        title: "قوائم جهات الاتصال",
        table: {
          name: "الاسم",
          contacts: "جهات الاتصال",
          actions: "الإجراءات",
        },
        buttons: {
          add: "قائمة جديدة",
          downloadSample: "تحميل نموذج جدول البيانات",
        },
        dialog: {
          name: "الاسم",
          company: "الشركة",
          okEdit: "تحرير",
          okAdd: "إضافة",
          add: "إضافة",
          edit: "تحرير",
          cancel: "إلغاء",
        },
        confirmationModal: {
          deleteTitle: "حذف",
          deleteMessage: "هذا الإجراء لا يمكن التراجع عنه.",
        },
        toasts: {
          deleted: "تم حذف السجل",
        },
      },
      contactListItems: {
        title: "جهات الاتصال",
        searchPlaceholder: "البحث",
        buttons: {
          add: "جديد",
          lists: "القوائم",
          import: "استيراد",
        },
        dialog: {
          name: "الاسم",
          number: "الرقم",
          whatsapp: "واتساب",
          email: "البريد الإلكتروني",
          okEdit: "تحرير",
          okAdd: "إضافة",
          add: "إضافة",
          edit: "تحرير",
          cancel: "إلغاء",
        },
        table: {
          name: "الاسم",
          number: "الرقم",
          whatsapp: "واتساب",
          email: "البريد الإلكتروني",
          actions: "الإجراءات",
        },
        confirmationModal: {
          deleteTitle: "حذف",
          deleteMessage: "لا يمكن التراجع عن هذا الإجراء.",
          importMessage: "هل تريد استيراد جهات الاتصال من هذه الورقة؟ ",
          importTitlte: "استيراد",
        },
        toasts: {
          deleted: "تم حذف السجل",
        },
        downloadTemplate: "انقر هنا لتحميل نموذج جدول البيانات.",
        whatsappValid: "واتساب صحيح",
        whatsappInvalid: "واتساب غير صحيح",
      },
      contacts: {
        title: "جهات الاتصال",
        toasts: {
          deleted: "تم حذف جهة الاتصال بنجاح!"
        },
        searchPlaceholder: "بحث...",
        confirmationModal: {
          deleteTitle: "حذف ",
          importTitlte: "استيراد جهات الاتصال",
          exportContact: "تصدير جهات الاتصال",
          deleteMessage: "هل أنت متأكد من أنك تريد حذف جهة الاتصال هذه؟ ستفقد جميع الخدمات ذات الصلة.",
          blockContact: "هل أنت متأكد من أنك تريد حظر جهة الاتصال هذه؟",
          unblockContact: "هل أنت متأكد من أنك تريد إلغاء حظر جهة الاتصال هذه؟",
          importMessage: "هل تريد استيراد جميع جهات الاتصال من الهاتف؟",
          importChat: "استيراد المحادثات",
          wantImport: "هل تريد استيراد جميع المحادثات من الهاتف؟"
        },
        buttons: {
          import: "استيراد جهات الاتصال",
          add: "إضافة جهة اتصال",
          export: "تصدير جهة الاتصال"
        },
        table: {
          name: "الاسم",
          whatsapp: "الاتصال",
          email: "البريد الإلكتروني",
          actions: "الإجراءات",
          lastMessage: "آخر رسالة",
          status: "الحالة",
          selectAll: "اختيار جميع جهات الاتصال",
          selectContact: "اختيار جهة اتصال {{name}}",
        },
        menu: {
          importYourPhone: "استيراد من الجهاز الافتراضي",
          importToExcel: "استيراد / تصدير من Excel",
          importExport: "استيراد / تصدير"
        },
        bulkActions: {
          deleteSelected: "حذف المختارة ({{count}})",
          deleteConfirmTitle: "هل أنت متأكد من أنك تريد حذف {{count}} جهات اتصال مختارة؟",
          deleteConfirmMessage: "هذا الإجراء لا يمكن التراجع عنه.",
          deleteSuccess: "تم حذف جهات الاتصال المختارة بنجاح!",
          blockContact: "تم حظر جهة الاتصال",
          unblockContact: "تم إلغاء حظر جهة الاتصال",
          selectConnectionToImport: "اختر الاتصال المراد الاستيراد منه"
        },
        tagsFilter: {
          title: "تصفية حسب العلامات",
          placeholder: "اختر العلامات...",
          noTags: "لا توجد علامات متاحة",
          clearFilters: "مسح المرشحات",
          selectedTags: "العلامات المختارة"
        },
        validation: {
          nameRequired: "الاسم مطلوب",
          numberRequired: "الرقم مطلوب",
          emailRequired: "البريد الإلكتروني مطلوب",
          invalidEmail: "بريد إلكتروني غير صحيح",
          numberExists: "هذا الرقم موجود بالفعل",
          emailExists: "هذا البريد الإلكتروني موجود بالفعل",
          invalidNumber: "رقم غير صحيح",
          numberTooShort: "الرقم قصير جداً",
          numberTooLong: "الرقم طويل جداً",
          nameTooShort: "الاسم قصير جداً",
          nameTooLong: "الاسم طويل جداً",
          tooShort: "قصير جداً!",
          tooLong: "طويل جداً!",
          required: "مطلوب"
        }
      },
      tagModal: {
        title: {
          add: "علامة جديدة",
          edit: "تعديل العلامة",
          addKanban: "مسار جديد",
          editKanban: "تعديل المسار",
        },
        form: {
          name: "الاسم",
          color: "اللون",
          timeLane: "الوقت بالساعات لإعادة التوجيه إلى المسار",
          nextLaneId: "المسار",
          greetingMessageLane: "رسالة ترحيب المسار",
          rollbackLaneId: "العودة إلى المسار بعد استئناف الخدمة"
        },
        buttons: {
          okAdd: "إضافة",
          okEdit: "حفظ",
          cancel: "إلغاء",
        },
        validation: {
          tooShort: "قصير جداً!",
          required: "مطلوب"
        },
        success: "تم حفظ العلامة بنجاح.",
        successKanban: "تم حفظ المسار بنجاح.",
      },
      contactTagListModal: {
        title: "جهات الاتصال",
        table: {
          id: "المعرف",
          name: "الاسم",
          number: "الرقم",
          actions: "الإجراءات"
        }
      },
      todo: {
        newTask: "مهمة جديدة",
        add: "إضافة",
        save: "حفظ",
        task: "مهام",
      },
      contactImportWpModal: {
        modalTitle: "تصدير / استيراد جهات الاتصال",
        title: "تصدير جهات الاتصال إلى Excel",
        buttons: {
          downloadModel: "تحميل نموذج Excel للاستيراد",
          closed: "إغلاق",
          import: "اختر ملف Excel لاستيراد جهات الاتصال"
        },
        form: {
          connection: "اتصال واتساب",
          connectionPlaceholder: "اختر الاتصال...",
          importType: "نوع الاستيراد",
          importAll: "استيراد جميع جهات الاتصال",
          importSelected: "استيراد جهات الاتصال المختارة",
          overwriteExisting: "الكتابة فوق جهات الاتصال الموجودة"
        },
        validation: {
          connectionRequired: "يجب اختيار اتصال",
          noContactsFound: "لم يتم العثور على جهات اتصال للاستيراد"
        },
        progress: {
          importing: "جاري استيراد جهات الاتصال...",
          imported: "جهات الاتصال المستوردة: {count}",
          duplicated: "جهات الاتصال المكررة: {count}",
          failed: "جهات الاتصال الفاشلة: {count}"
        }
      },
      tagsContainer: {
        title: "علامات جهة الاتصال",
        placeholder: "إضافة علامة...",
        add: "إضافة",
        remove: "إزالة",
        noTags: "لا توجد علامات مخصصة",
        createNew: "إنشاء علامة جديدة",
        searchPlaceholder: "البحث عن علامات...",
        buttons: {
          save: "حفظ العلامات",
          cancel: "إلغاء",
          clear: "مسح الكل"
        },
        validation: {
          tagRequired: "اسم العلامة مطلوب",
          tagExists: "هذه العلامة موجودة بالفعل",
          maxTags: "الحد الأقصى {max} علامة مسموح"
        }
      },
      tagsKanban: {
        title: "المسارات",
        laneDefault: "مفتوح",
        confirmationModal: {
          deleteTitle: "هل أنت متأكد من حذف هذا المسار؟",
          deleteMessage: "لا يمكن التراجع عن هذا الإجراء.",
        },
        table: {
          name: "الاسم",
          color: "اللون",
          tickets: "التذاكر",
          actions: "الإجراءات",
        },
        buttons: {
          add: "مسار جديد",
          backToKanban: "العودة إلى كانبان",
        },
        toasts: {
          deleted: "تم حذف المسار بنجاح.",
        },
      },
      newTicketModal: {
        title: "إنشاء تذكرة",
        fieldLabel: "اكتب للبحث عن جهة الاتصال",
        add: "إضافة",
        buttons: {
          ok: "حفظ",
          cancel: "إلغاء"
        },
        form: {
          contact: "جهة الاتصال",
          queue: "الطابور",
          message: "الرسالة الأولى",
          contactPlaceholder: "البحث عن جهة اتصال...",
          queuePlaceholder: "اختر الطابور...",
          messagePlaceholder: "رسالة أولى اختيارية..."
        },
        validation: {
          contactRequired: "يجب اختيار جهة اتصال",
          queueRequired: "يجب اختيار طابور"
        }
      },
      showTicketOpenModal: {
        title: {
          header: "خدمة موجودة"
        },
        form: {
          message: "جهة الاتصال هذه قيد الخدمة بالفعل:",
          user: "الوكيل",
          queue: "الطابور",
          messageWait: "جهة الاتصال هذه تنتظر الخدمة بالفعل. تحقق من علامة التبويب في الانتظار!",
          ticketId: "معرف التذكرة",
          status: "الحالة",
          createdAt: "تم إنشاؤها في",
          updatedAt: "تم تحديثها في"
        },
        buttons: {
          goToTicket: "انتقل إلى التذكرة",
          close: "إغلاق",
          transferTicket: "نقل التذكرة"
        },
        status: {
          open: "مفتوح",
          pending: "معلق",
          closed: "مغلق"
        }
      },
      showTicketLogModal: {
        title: {
          header: "السجلات",
        },
        options: {
          create: "تم إنشاء التذكرة.",
          chatBot: "تم تشغيل ChatBot.",
          queue: " - تم تحديد الطابور.",
          open: " بدأ الخدمة.",
          access: "وصل إلى التذكرة.",
          transfered: "نقل التذكرة.",
          receivedTransfer: "استلم التذكرة المنقولة.",
          pending: "أعاد إلى الطابور.",
          closed: "أغلق التذكرة",
          reopen: "أعاد فتح التذكرة",
          redirect: "- تم إعادة التوجيه"
        },
        close: "إغلاق",
      },
      statusFilter: {
        title: "تصفية حسب الحالة",
        groups: "المجموعات",
      },
      flowBuilderConfig: {
        title: "صمم تدفقك",
        actions: {
          import: "استيراد",
          export: "تصدير",
          save: "حفظ"
        },
        messages: {
          flowStart: "بداية التدفق",
          interval: "فترة {{seconds}} ثانية",
          rememberSave: "لا تنسى حفظ تدفقك!",
          flowSaved: "تم حفظ التدفق بنجاح"
        },
        nodes: {
          start: "البداية",
          content: "المحتوى",
          menu: "القائمة",
          optionFormat: "[{{number}}] {{value}}",
          randomizer: "العشوائية",
          interval: "فترة",
          ticket: "التذكرة",
          typebot: "TypeBot",
          openai: "OpenAI",
          question: "سؤال",
          image: "صورة",
          video: "فيديو",
          audioNode: {
            title: "الصوت",
            recordedLive: "مسجل مباشرة",
            audioSent: "تم إرسال الصوت",
            browserNotSupported: "متصفحك لا يدعم HTML5"
          }
        },
        nodeDescriptions: {
          startFlow: "هذا البلوك يحدد بداية تدفقك!"
        },
        edges: {
          edgeWithoutOnDelete: "حافة بدون onDelete مكونة:",
          errorDeletingEdge: "خطأ في حذف الحافة:",
          removeEdgeTooltip: "إزالة الاتصال"
        },
        units: {
          seconds: "ثوانٍ"
        },
        validation: {
          tooShort: "قصير جداً!",
          tooLong: "طويل جداً!",
          enterName: "أدخل اسماً!",
          enterMessage: "أدخل رسالة!",
          required: "مطلوب",
          describeAiTraining: "صف التدريب للذكاء الاصطناعي",
          invalidModel: "نموذج غير صحيح",
          informModel: "أبلغ عن النموذج",
          minTokens: "10 رموز كحد أدنى",
          maxTokens: "4096 رمز كحد أقصى",
          informMaxTokens: "أبلغ عن العدد الأقصى للرموز",
          minZero: "0 كحد أدنى",
          maxOne: "1 كحد أقصى",
          informTemperature: "أبلغ عن درجة الحرارة",
          informApiKey: "أبلغ عن مفتاح API",
          minOneMessage: "رسالة واحدة كحد أدنى",
          maxFiftyMessages: "50 رسالة كحد أقصى",
          informMaxMessages: "أبلغ عن العدد الأقصى للرسائل",
          informVoiceMode: "أبلغ عن وضع الصوت"
        },
        buttons: {
          add: "إضافة",
          save: "حفظ",
          edit: "تحرير"
        },
        modals: {
          condition: {
            addTitle: "إضافة شرط إلى التدفق",
            editTitle: "تحرير الشرط",
            fieldLabel: "حقل الشرط (أدخل مفتاح واحد فقط)",
            validationRule: "قاعدة التحقق",
            conditionValue: "قيمة الشرط المراد تحليلها"
          },
          ticket: {
            addQueueError: "أضف طابور",
            addTitle: "إضافة طابور إلى التدفق",
            editTitle: "تحرير الطابور",
            selectConnection: "اختر اتصال"
          },
          randomizer: {
            addIntervalError: "أضف قيمة الفاصل",
            maxTimeError: "تم الوصول إلى الحد الأقصى للوقت 120 ثانية",
            addTitle: "إضافة عشوائي إلى التدفق",
            editTitle: "تحرير العشوائي"
          },
          openai: {
            addTitle: "إضافة OpenAI/Gemini إلى التدفق",
            editTitle: "تحرير OpenAI/Gemini للتدفق"
          },
          question: {
            addTitle: "إضافة سؤال إلى التدفق",
            editTitle: "تحرير السؤال",
            createTitle: "إنشاء سؤال في التدفق",
            messageLabel: "الرسالة",
            saveAnswer: "حفظ الإجابة"
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
          text: "نص",
          francisca: "فرانسيسكا",
          antonio: "أنطونيو",
          brenda: "بريندا",
          donato: "دوناتو",
          elza: "إلزا",
          fabio: "فابيو",
          giovanna: "جيوفانا",
          humberto: "هومبيرتو",
          julio: "خوليو",
          leila: "ليلى",
          leticia: "ليتيسيا",
          manuela: "مانويلا",
          nicolau: "نيكولاو",
          valerio: "فاليريو",
          yara: "يارا"
        }
      },
      flowBuilderModals: {
        textModal: {
          titleAdd: "إضافة رسالة إلى التدفق",
          titleEdit: "تحرير رسالة التدفق",
          buttonAdd: "إضافة",
          buttonSave: "حفظ",
          fields: {
            message: "الرسالة"
          },
          validation: {
            tooShort: "قصير جداً!",
            tooLong: "طويل جداً!",
            required: "أدخل اسماً!",
            messageRequired: "أدخل رسالة!"
          }
        },
        intervalModal: {
          titleAdd: "إضافة فترة إلى التدفق",
          titleEdit: "تحرير الفترة",
          buttonAdd: "إضافة",
          buttonEdit: "تحرير",
          fields: {
            timeInSeconds: "الوقت بالثواني"
          },
          validation: {
            addValue: "أضف قيمة الفترة",
            maxTime: "تم الوصول للحد الأقصى 120 ثانية"
          }
        },
        menuModal: {
          titleAdd: "إضافة قائمة إلى التدفق",
          titleEdit: "تحرير القائمة",
          buttonAdd: "إضافة",
          buttonSave: "حفظ",
          fields: {
            explanationMessage: "رسالة شرح القائمة",
            addOption: "إضافة خيار",
            typeOption: "اكتب {{number}}",
            optionPlaceholder: "اكتب الخيار"
          }
        },
        singleBlockModal: {
          titleAdd: "إضافة محتوى إلى التدفق",
          titleEdit: "تحرير المحتوى",
          buttonAdd: "إضافة",
          buttonSave: "حفظ",
          elements: {
            text: "نص",
            interval: "فترة",
            image: "صورة",
            audio: "صوت",
            video: "فيديو",
            document: "مستند"
          },
          fields: {
            message: "الرسالة",
            timeInSeconds: "الوقت بالثواني",
            sendAsRecordedAudio: "إرسال كصوت مسجل",
            noFileSelected: "لم يتم اختيار ملف"
          },
          buttons: {
            sendImage: "إرسال صورة",
            sendAudio: "إرسال صوت",
            sendVideo: "إرسال فيديو",
            sendDocument: "إرسال مستند"
          },
          validation: {
            emptyMessageFields: "حقول الرسالة فارغة!",
            intervalValidation: "الفترة لا يمكن أن تكون 0 أو أكبر من 120!",
            fileTooLarge2MB: "الملف كبير جداً! الحد الأقصى 2 ميجابايت",
            fileTooLarge5MB: "الملف كبير جداً! الحد الأقصى 5 ميجابايت",
            fileTooLarge20MB: "الملف كبير جداً! الحد الأقصى 20 ميجابايت",
            fileTooLarge15MB: "الملف كبير جداً! الحد الأقصى 15 ميجابايت",
            deleteEmptyCards: "احذف البطاقات الفارغة أو أرسل الملفات المعلقة.",
            browserNotSupported: "متصفحك لا يدعم HTML5",
            onlyMp4Videos: "انتباه! فقط مقاطع فيديو MP4!"
          },
          messages: {
            contentAddedSuccess: "تم إضافة المحتوى بنجاح!",
            uploadingFiles: "جاري رفع الملفات وإنشاء المحتوى...",
            variables: "المتغيرات"
          }
        },
        randomizerModal: {
          titleAdd: "إضافة عشوائية إلى التدفق",
          titleEdit: "تحرير العشوائية",
          buttonAdd: "إضافة",
          buttonEdit: "تحرير"
        },
        ticketModal: {
          titleAdd: "إضافة طابور إلى التدفق",
          titleEdit: "تحرير الطابور",
          buttonAdd: "إضافة",
          buttonEdit: "تحرير",
          fields: {
            selectConnection: "اختر اتصال"
          },
          validation: {
            addQueue: "أضف طابور"
          }
        },
        typebotModal: {
          titleAdd: "إضافة Typebot إلى التدفق",
          titleEdit: "تحرير Typebot للتدفق",
          titleEditFlow: "تحرير Typebot للتدفق",
          buttonAdd: "إضافة",
          buttonSave: "حفظ"
        },
        openaiModal: {
          titleAdd: "إضافة OpenAI/Gemini إلى التدفق",
          titleEdit: "تحرير OpenAI/Gemini للتدفق",
          buttonAdd: "إضافة",
          buttonSave: "حفظ",
          models: {
            gpt35: "GPT 3.5 Turbo",
            gpt4o: "GPT 4o",
            gemini15flash: "Gemini 1.5 Flash",
            gemini15pro: "Gemini 1.5 Pro",
            gemini20flash: "Gemini 2.0 Flash",
            gemini20pro: "Gemini 2.0 Pro"
          },
          voices: {
            text: "نص",
            francisca: "فرانسيسكا",
            antonio: "أنطونيو",
            brenda: "بريندا",
            donato: "دوناتو",
            elza: "إلزا",
            fabio: "فابيو",
            giovanna: "جيوفانا",
            humberto: "هومبرتو",
            julio: "خوليو",
            leila: "ليلى",
            leticia: "ليتيسيا",
            manuela: "مانويلا",
            nicolau: "نيكولاو",
            valerio: "فاليريو",
            yara: "يارا"
          },
          validation: {
            tooShort: "قصير جداً!",
            tooLong: "طويل جداً!",
            required: "مطلوب",
            promptRequired: "وصف التدريب للذكاء الاصطناعي",
            invalidModel: "نموذج غير صالح",
            minTokens: "الحد الأدنى 10 رموز",
            maxTokens: "الحد الأقصى 4096 رمز",
            tokensRequired: "أخبر بالعدد الأقصى للرموز",
            temperatureRequired: "أخبر بدرجة الحرارة",
            temperatureMin: "الحد الأدنى 0",
            temperatureMax: "الحد الأقصى 1",
            apiKeyRequired: "أخبر بمفتاح API",
            messagesMin: "الحد الأدنى 1 رسالة",
            messagesMax: "الحد الأقصى 50 رسالة",
            messagesRequired: "أخبر بالعدد الأقصى للرسائل",
            voiceRequired: "أخبر بوضع الصوت"
          }
        },
        questionModal: {
          titleAdd: "إضافة سؤال إلى التدفق",
          titleEdit: "تحرير سؤال التدفق",
          titleCreate: "إنشاء سؤال في التدفق",
          buttonAdd: "إضافة",
          buttonSave: "حفظ",
          fields: {
            message: "الرسالة",
            saveAnswer: "حفظ الإجابة"
          }
        }
      },
      messagesAPI: {
        title: "API",
        textMessage: {
          number: "الرقم",
          body: "الرسالة",
          token: "الرمز المسجل",
          userId: "معرف المستخدم/الوكيل",
          queueId: "معرف الطابور",
        },
        mediaMessage: {
          number: "الرقم",
          body: "اسم الملف",
          media: "الملف",
          token: "الرمز المسجل",
        },
        API: {
          title: "توثيق إرسال الرسائل",
          methods: {
            title: "طرق الإرسال",
            messagesText: "الرسائل النصية",
            messagesMidia: "رسائل الوسائط",
          },
          instructions: {
            title: "التعليمات",
            comments: "ملاحظات مهمة",
            comments1:
              "قبل إرسال الرسائل، من الضروري تسجيل الرمز المرتبط بالاتصال الذي سيرسل الرسائل. <br />للتسجيل، انتقل إلى قائمة 'الاتصالات'، انقر على زر تحرير الاتصال وأدخل الرمز في الحقل المناسب.",
            comments2:
              "رقم الإرسال يجب ألا يحتوي على أقنعة أو أحرف خاصة ويجب أن يتكون من:",
            codeCountry: "كود البلد",
            code: "كود المنطقة",
            number: "الرقم",
          },
          text: {
            title: "1. الرسائل النصية",
            instructions:
              "فيما يلي قائمة بالمعلومات المطلوبة لإرسال الرسائل النصية:",
          },
          media: {
            title: "2. رسائل الوسائط",
            instructions:
              "فيما يلي قائمة بالمعلومات المطلوبة لإرسال رسائل الوسائط:",
          },
        },
        messages: {
          noPermission: "هذه الشركة لا تملك إذن الوصول لهذه الصفحة! نحن نقوم بإعادة توجيهك.",
          success: "تم إرسال الرسالة بنجاح",
        },
        form: {
          send: "إرسال",
          testSend: "اختبار الإرسال",
        },
        documentation: {
          endpoint: "نقطة النهاية: ",
          method: "الطريقة: ",
          post: "POST",
          headers: "الرؤوس: ",
          headersTextAuth: "Authorization Bearer (الرمز المسجل) و Content-Type (application/json)",
          headersMediaAuth: "Authorization Bearer (الرمز المسجل) و Content-Type (multipart/form-data)",
          body: "الجسم: ",
          formData: "FormData: ",
          bodyExample: "{\n  \"number\": \"558599999999\",\n  \"body\": \"Message\",\n  \"userId\": \"معرف المستخدم أو \\\"\\\"\",\n  \"queueId\": \"معرف الطابور أو \\\"\\\"\",\n  \"sendSignature\": \"توقيع الرسالة - true/false\",\n  \"closeTicket\": \"إغلاق التذكرة - true/false\"\n}",
          formDataFields: {
            number: "number: 558599999999",
            body: "body: Message",
            userId: "userId: معرف المستخدم أو \\\"\\\"",
            queueId: "queueId: معرف الطابور أو \\\"\\\"",
            medias: "medias: ملف",
            sendSignature: "sendSignature: توقيع الرسالة true/false",
            closeTicket: "closeTicket: إغلاق التذكرة true/false",
          },
        },
      },
      helps: {
        title: "مركز المساعدة",
        thumbnail: "صورة مصغرة",
        videoPlayerTitle: "مشغل فيديو YouTube",
        settings: {
          codeVideo: "كود الفيديو",
          description: "الوصف",
          clear: "مسح",
          delete: "حذف",
          save: "حفظ",
        },
      },
      moments: {
        title: "لوحة الخدمة",
        pending: "في الانتظار",
        attendances: "الحضور: ",
        noQueue: "لا يوجد طابور",
        accessTicket: "الوصول إلى التذكرة"
      },
      queueIntegrationModal: {
        title: {
          add: "إضافة مشروع",
          edit: "تحرير المشروع",
        },
        form: {
          id: "المعرف",
          type: "النوع",
          name: "الاسم",
          projectName: "اسم المشروع",
          language: "اللغة",
          jsonContent: "محتوى Json",
          urlN8N: "الرابط",
          typebotSlug: "Typebot - Slug",
          typebotExpires: "الوقت بالدقائق لانتهاء صلاحية المحادثة",
          typebotKeywordFinish: "كلمة إنهاء التذكرة",
          typebotKeywordRestart: "كلمة إعادة تشغيل التدفق",
          typebotRestartMessage: "رسالة إعادة تشغيل المحادثة",
          typebotUnknownMessage: "رسالة الخيار غير الصالح",
          typebotDelayMessage: "الفاصل الزمني (ms) بين الرسائل",
        },
        buttons: {
          okAdd: "إضافة",
          okEdit: "حفظ",
          cancel: "إلغاء",
          test: "اختبار البوت",
        },
        languages: {
          "pt-BR": "البرتغالية",
          "en": "الإنجليزية",
          "es": "الإسبانية",
        },
        messages: {
          testSuccess: "تم اختبار التكامل بنجاح!",
          addSuccess: "تم إضافة التكامل بنجاح.",
          editSuccess: "تم تحرير التكامل بنجاح.",
        },
      },
      queueIntegration: {
        title: "التكاملات",
        table: {
          id: "المعرف",
          type: "النوع",
          name: "الاسم",
          projectName: "اسم المشروع",
          language: "اللغة",
          lastUpdate: "آخر تحديث",
          actions: "الإجراءات",
        },
        buttons: {
          add: "إضافة مشروع",
        },
        searchPlaceholder: "بحث...",
        confirmationModal: {
          deleteTitle: "حذف",
          deleteMessage:
            "هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه! وسيتم إزالته من الطوابير والاتصالات المرتبطة",
        },
        toasts: {
          deleted: "تم حذف التكامل بنجاح!",
        },
        messages: {
          noPermission: "هذه الشركة ليس لديها إذن للوصول إلى هذه الصفحة! نحن نقوم بإعادة توجيهك.",
        },
      },
      quickMessages: {
        title: "الردود السريعة",
        searchPlaceholder: "بحث...",
        noAttachment: "لا يوجد مرفق",
        confirmationModal: {
          deleteTitle: "حذف",
          deleteMessage: "هذا الإجراء لا يمكن التراجع عنه! هل تريد المتابعة؟",
        },
        buttons: {
          add: "إضافة",
          attach: "إرفاق ملف",
          cancel: "إلغاء",
          edit: "تعديل",
        },
        toasts: {
          success: "تم إضافة الاختصار بنجاح!",
          deleted: "تم حذف الاختصار بنجاح!",
        },
        dialog: {
          title: "رسالة سريعة",
          shortcode: "اختصار",
          message: "الرد",
          save: "حفظ",
          cancel: "إلغاء",
          geral: "السماح بالتعديل",
          add: "إضافة",
          edit: "تعديل",
          visao: "السماح بالعرض",
        },
        table: {
          shortcode: "اختصار",
          message: "الرسالة",
          actions: "الإجراءات",
          mediaName: "اسم الملف",
          status: "الحالة",
        },
      },
      announcements: {
        title: "الإعلانات",
        searchPlaceholder: "بحث",
        active: "نشط",
        inactive: "غير نشط",
        buttons: {
          add: "إعلان جديد",
          contactLists: "قوائم الإعلانات",
        },
        table: {
          priority: "الأولوية",
          title: "العنوان",
          text: "النص",
          mediaName: "الملف",
          status: "الحالة",
          actions: "الإجراءات",
        },
        dialog: {
          title: "إضافة إعلان",
          titleField: "العنوان",
          message: "النص",
          save: "حفظ",
          cancel: "إلغاء",
        },
        toasts: {
          success: "تم إنشاء الإعلان بنجاح!",
          deleted: "تم حذف الإعلان بنجاح!",
        },
        confirmationModal: {
          deleteTitle: "حذف الإعلان",
          deleteMessage: "هل أنت متأكد من رغبتك في حذف هذا الإعلان؟",
        },
      },
      scheduleModal: {
        title: {
          add: "موعد جديد",
          edit: "تحرير الموعد",
        },
        form: {
          body: "الرسالة",
          contact: "جهة الاتصال",
          sendAt: "تاريخ الجدولة",
          sentAt: "تاريخ الإرسال",
          assinar: "إرسال التوقيع"
        },
        buttons: {
          okAdd: "إضافة",
          okEdit: "حفظ",
          cancel: "إلغاء",
          addSchedule: "إضافة موعد"
        },
        success: "تم حفظ الموعد بنجاح.",
        validations: {
          tooShort: "الرسالة قصيرة جداً",
          required: "مطلوب"
        },
        toasts: {
          deleted: "تم حذف الوسائط بنجاح."
        },
        confirmationModal: {
          deleteTitle: "حذف الوسائط",
          deleteMessage: "هل أنت متأكد من أنك تريد حذف هذه الوسائط؟"
        },
        status: {
          sending: "جاري الإرسال",
          pending: "في الانتظار",
          sent: "تم الإرسال",
          error: "خطأ في الإرسال"
        },
        recurrence: {
          title: "التكرار",
          description: "يمكنك اختيار إرسال الرسالة بشكل متكرر واختيار الفترة الزمنية. إذا كانت رسالة لمرة واحدة، فلا تغير شيئاً في هذا القسم.",
          interval: "الفترة",
          intervalValue: "قيمة الفترة",
          sendTimes: "إرسال كم مرة",
          intervalTypes: {
            days: "أيام",
            weeks: "أسابيع",
            months: "شهور",
            minutes: "دقائق"
          },
          businessDays: {
            normal: "إرسال بشكل عادي في الأيام غير العمل",
            before: "إرسال يوم عمل قبل",
            after: "إرسال يوم عمل بعد"
          }
        },
        calendar: {
          messages: {
            date: "التاريخ",
            time: "الوقت",
            event: "الحدث",
            allDay: "طوال اليوم",
            week: "الأسبوع",
            work_week: "المواعيد",
            day: "اليوم",
            month: "الشهر",
            previous: "السابق",
            next: "التالي",
            yesterday: "أمس",
            tomorrow: "غداً",
            today: "اليوم",
            agenda: "جدول الأعمال",
            noEventsInRange: "لا توجد مواعيد في الفترة.",
            showMore: "المزيد"
          }
        },
        permissions: {
          noAccess: "هذه الشركة ليس لديها إذن للوصول إلى هذه الصفحة! نحن نعيد توجيهك."
        }
      },
      contactDrawer: {
        header: "بيانات جهة الاتصال",
        buttons: {
          edit: "تحرير جهة الاتصال",
          block: "حظر",
          unblock: "إلغاء الحظر",
          blockContact: "حظر جهة الاتصال",
          unblockContact: "إلغاء حظر جهة الاتصال",
        },
        toasts: {
          contactBlocked: "تم حظر جهة الاتصال",
          contactUnblocked: "تم إلغاء حظر جهة الاتصال",
        },
        confirmationModal: {
          blockMessage: "هل تريد حقاً حظر جهة الاتصال هذه؟ لن تتلقى المزيد من الرسائل منها.",
          unblockMessage: "هل تريد حقاً إلغاء حظر جهة الاتصال هذه؟ ستتمكن من البدء في تلقي الرسائل منها.",
        },
        extraInfo: "معلومات أخرى",
      },
      messageVariablesPicker: {
        label: "المتغيرات المتاحة",
        vars: {
          contactFirstName: "الاسم الأول",
          contactName: "الاسم",
          user: "المستخدم",
          greeting: "التحية",
          protocolNumber: "البروتوكول",
          date: "التاريخ",
          hour: "الساعة",
          ticket_id: "رقم التذكرة",
          queue: "القطاع",
          connection: "الاتصال",
        },
      },
      settings: {
        LGPD: {
          title: "LGPD",
          welcome: "رسالة ترحيب (LGPD)",
          linkLGPD: "رابط سياسة الخصوصية",
          obfuscateMessageDelete: "إخفاء الرسالة المحذوفة",
          alwaysConsent: "طلب الموافقة دائماً",
          obfuscatePhoneUser: "إخفاء رقم الهاتف للمستخدمين",
          enabled: "مُفعل",
          disabled: "غير مُفعل",
        },
        tabs: {
          schedules: "الجداول",
          companies: "الشركات",
          whitelabel: "العلامة البيضاء",
        },
        toasts: {
          schedulesSavedSuccess: "تم تحديث المواعيد بنجاح.",
          operationUpdatedSuccess: "تم تحديث العملية بنجاح.",
          recordsLoadError: "تعذر تحميل قائمة السجلات",
          operationSuccess: "تمت العملية بنجاح!",
          operationError: "تعذر تنفيذ العملية. تحقق من عدم وجود سجل بنفس الاسم أو من ملء جميع الحقول بشكل صحيح",
          operationDeleteError: "تعذر تنفيذ العملية",
          imageUploadProgress: "تم تحميل الصورة بنسبة {{progress}}%...",
          imageUploadError: "حدثت مشكلة في تحميل الصورة.",
          companyOperationError: "تعذر تنفيذ العملية. تحقق من عدم وجود شركة بنفس الاسم أو من ملء جميع الحقول بشكل صحيح",
          planOperationError: "تعذر تنفيذ العملية. تحقق من عدم وجود خطة بنفس الاسم أو من ملء جميع الحقول بشكل صحيح",
          helpOperationError: "تعذر تنفيذ العملية. تحقق من عدم وجود مساعدة بنفس الاسم أو من ملء جميع الحقول بشكل صحيح",
        },
        whitelabel: {
          primaryColorLight: "اللون الأساسي للوضع الفاتح",
          primaryColorDark: "اللون الأساسي للوضع الداكن",
          systemName: "اسم النظام",
          lightLogo: "الشعار الفاتح",
          darkLogo: "الشعار الداكن",
          favicon: "أيقونة المفضلة",
        },
        chatBotType: {
          text: "نص",
        },
        modals: {
          deleteTitle: "حذف السجل",
          deleteConfirmation: "هل تريد حقاً حذف هذا السجل؟",
        },
        managers: {
          common: {
            yes: "نعم",
            no: "لا",
          },
          companies: {
            recurrence: "التكرار",
          },
          plans: {
            queues: "القوائم",
            value: "القيمة",
            whatsapp: "واتساب",
            facebook: "فيسبوك",
            instagram: "إنستغرام",
            internalChat: "المحادثة الداخلية",
            externalAPI: "API خارجي",
            kanban: "كانبان",
            talkAI: "المطالبات",
            integrations: "التكاملات",
          },
          helps: {
            title: "العنوان",
            video: "فيديو",
          },
        },
      },
      flowBuilderNodes: {
        message: "الرسالة",
        condition: "الشرط",
        image: "الصورة"
      },
      subscription: {
        title: "الاشتراك",
        form: {
          licenseLabel: "فترة الترخيص",
          licenseExpiresIn: "ترخيصك ينتهي خلال {{days}} أيام!",
          licenseExpiresToday: "ترخيصك ينتهي اليوم!",
          billingEmailLabel: "بريد الفواتير الإلكتروني",
          subscribeButton: "اشترك الآن!"
        },
        checkout: {
          form: {
            fullName: "الاسم الكامل*",
            fullNameRequired: "الاسم الكامل مطلوب",
            lastName: "الاسم الأخير*",
            lastNameRequired: "الاسم الأخير مطلوب",
            address: "العنوان*",
            addressRequired: "العنوان مطلوب",
            city: "المدينة*",
            cityRequired: "المدينة مطلوبة",
            state: "الولاية*",
            stateRequired: "الولاية مطلوبة",
            document: "الرقم الضريبي*",
            documentRequired: "الرقم الضريبي مطلوب",
            documentInvalid: "تنسيق الرقم الضريبي غير صحيح",
            country: "البلد*",
            countryRequired: "البلد مطلوب",
            useAddressForPayment: "استخدم هذا العنوان لتفاصيل الدفع",
            nameOnCard: "الاسم على البطاقة*",
            nameOnCardRequired: "الاسم على البطاقة مطلوب",
            cardNumber: "رقم البطاقة*",
            cardNumberRequired: "رقم البطاقة مطلوب",
            cardNumberInvalid: "رقم البطاقة غير صحيح (مثال 4111111111111)",
            expiryDate: "تاريخ انتهاء الصلاحية*",
            expiryDateRequired: "تاريخ انتهاء الصلاحية مطلوب",
            expiryDateInvalid: "تاريخ انتهاء الصلاحية غير صحيح",
            cvv: "CVV*",
            cvvRequired: "CVV مطلوب",
            cvvInvalid: "CVV غير صحيح (مثال 357)"
          }
        }
      },
      ticketsResponsive: {
        actions: {
          selectTicket: "اختيار التذكرة",
          transferTicket: "نقل التذكرة",
          spyConversation: "تتبع المحادثة"
        },
        tabs: {
          ticket: "التذكرة",
          assistance: "المساعدة"
        },
        search: {
          searchInMessagesTooltip: "ضع علامة للبحث في محتويات الرسائل أيضاً (أبطأ)"
        },
        filter: {
          all: "الكل"
        },
        sort: {
          ascending: "تصاعدي",
          descending: "تنازلي"
        },
        dialog: {
          spyingConversation: "تتبع المحادثة",
          loadingMessages: "جاري تحميل الرسائل..."
        },
        status: {
          noQueue: "لا يوجد طابور"
        }
      },
      messagesResponsive: {
        types: {
          location: "الموقع",
          contact: "جهة الاتصال"
        },
        actions: {
          download: "تنزيل",
          dropFileHere: "اسحب الملف هنا"
        },
        status: {
          forwarded: "محولة",
          deletedByContact: "🚫 تم حذف هذه الرسالة من قبل جهة الاتصال",
          deletedMessage: "🚫 _رسالة محذوفة_",
          deletedByMe: "🚫 تم حذف هذه الرسالة",
          edited: "محررة"
        },
        reactions: {
          youReacted: "تفاعلت...",
          contactReacted: " تفاعل... "
        },
        timestamp: {
          today: "اليوم"
        },
        placeholder: {
          sayHello: "قل مرحباً لجهة الاتصال الجديدة!"
        },
        ads: {
          adClick: "نقرة إعلان",
          defaultUserMessage: "مرحباً! أنا مهتم وأرغب في المزيد من المعلومات، من فضلك."
        },
        warnings: {
          facebookPolicy: "لديك 24 ساعة للرد بعد استلام رسالة، وفقاً لسياسات فيسبوك."
        }
      },
      messageInputResponsive: {
        type: {
          document: "مستند",
          buttons: "أزرار"
        },
        tooltip: {
          toggleSignature: "تفعيل/إلغاء التوقيع",
          toggleComments: "تفعيل/إلغاء التعليقات"
        },
        privateMessage: {
          suffix: "رسالة خاصة"
        }
      },
      tagsResponsive: {
        validation: {
          tooShort: "العلامة قصيرة جداً!"
        },
        placeholder: "العلامات"
      },
      tickets: {
        buttons: {
          showAll: "الكل",
          returnQueue: "العودة إلى الطابور",
          scredule: "موعد",
          deleteTicket: "حذف التذكرة",
          quickMessageFlash: "ردود سريعة",
        },
        noContactName: "(لا يوجد جهة اتصال)",
        noDepartment: "لا يوجد قسم",
        group: "مجموعة",
        transferTooltip: "نقل التذكرة",
        closedTicket: {
          closedMessage: "إغلاق التذكرة مع رسالة وداع",
          closedNotMessage: "إغلاق التذكرة بدون رسالة وداع",
        },
      },
      messages: {
        download: "تنزيل",
        today: "اليوم",
        contact: "جهة الاتصال",
        forwarded: "مُعاد توجيهه",
        deletedByContact: "🚫 تم حذف هذه الرسالة بواسطة جهة الاتصال &nbsp;",
        deletedMessage: "🚫 _رسالة محذوفة_ ",
        deletedBySender: "🚫 تم حذف هذه الرسالة &nbsp;",
        youReacted: "لقد تفاعلت... ",
        sayHello: "قل مرحباً لجهة الاتصال الجديدة!",
        dropFile: "اسحب الملف هنا",
        facebookPolicy: "لديك 24 ساعة للرد بعد تلقي رسالة، وفقاً لسياسات فيسبوك.",
        defaultMetaMessage: "مرحباً! أنا مهتم وأرغب في مزيد من المعلومات، من فضلك.",
      },
      ticketsResponsive: {
        search: {
          searchInMessagesTooltip: "ضع علامة للبحث أيضاً في محتويات الرسائل (أبطأ)",
        },
        filter: {
          all: "الكل",
        },
        sort: {
          ascending: "تصاعدي",
          descending: "تنازلي",
        },
      },
      contactForm: {
        validation: {
          tooShort: "قصير جداً!",
          tooLong: "طويل جداً!",
          required: "مطلوب",
          invalidEmail: "بريد إلكتروني غير صحيح",
        },
        placeholders: {
          number: "5513912344321",
          email: "عنوان البريد الإلكتروني",
        },
      },
      common: {
        image: "صورة",
      },
      messageInputResponsive: {
        privateMessage: {
          suffix: "رسالة خاصة",
        },
        type: {
          document: "مستند",
          buttons: "أزرار",
        },
        tooltip: {
          toggleSignature: "تفعيل/إلغاء التوقيع",
          toggleComments: "تفعيل/إلغاء التعليقات",
        },
      },
      showTicketOpenModal: {
        buttons: {
          close: "إغلاق"
        }
      },
      reactions: {
        successMessage: "تم إرسال التفاعل بنجاح"
      },
      vcardPreview: {
        chatButton: "محادثة"
      },
      locationPreview: {
        viewButton: "عرض"
      },
      contactNotes: {
        addedSuccess: "تم إضافة الملاحظة بنجاح!",
        deletedSuccess: "تم حذف الملاحظة بنجاح!",
        deleteTitle: "حذف السجل",
        deleteConfirmation: "هل تريد حقاً حذف هذا السجل؟",
        cancelButton: "إلغاء",
        saveButton: "حفظ"
      },
      users: {
        title: "المستخدمون",
        table: {
          status: "الحالة",
          avatar: "الصورة الشخصية",
          name: "الاسم",
          email: "البريد الإلكتروني",
          profile: "الملف الشخصي",
          startWork: "بداية العمل",
          endWork: "نهاية العمل",
          actions: "الإجراءات",
          ID: "المعرف",
        },
        profile: {
          admin: "مدير",
          user: "مستخدم",
        },
        status: {
          enabled: "مفعل",
          disabled: "معطل",
        },
        upload: {
          avatar: "تحميل الصورة الشخصية",
        },
        buttons: {
          add: "إضافة مستخدم",
        },
        toasts: {
          deleted: "تم حذف المستخدم بنجاح.",
        },
        confirmationModal: {
          deleteTitle: "حذف",
          deleteMessage:
            "سيتم فقدان جميع بيانات المستخدم. ستتم حركة الطلبات المفتوحة لهذا المستخدم إلى الطابور.",
        },
      },
      settings: {
        success: "تم حفظ الإعدادات بنجاح.",
        title: "الإعدادات",
        tabs: {
          options: "الخيارات",
          schedules: "الجداول",
          companies: "الشركات",
          plans: "الخطط",
          helps: "المساعدة",
          whitelabel: "العلامة البيضاء",
          timezone: "المنطقة الزمنية",
        },
        timezone: {
          companyTimezone: {
            title: "المنطقة الزمنية للشركة",
            selectLabel: "اختر المنطقة الزمنية",
            customHelperText: "منطقة زمنية مخصصة لهذه الشركة",
            inheritedHelperText: "استخدام المنطقة الزمنية الافتراضية للنظام",
          },
          defaultTimezone: {
            title: "المنطقة الزمنية الافتراضية للنظام",
            selectLabel: "اختر المنطقة الزمنية الافتراضية",
            helperText: "هذه المنطقة الزمنية ستستخدم افتراضياً لجميع الشركات التي لا تملك منطقة زمنية مخصصة",
          },
          buttons: {
            save: "حفظ",
            useDefault: "استخدام الافتراضي",
            saveDefault: "حفظ الافتراضي",
          },
          preview: {
            currentTime: "الوقت الحالي",
            defaultTime: "الوقت الافتراضي",
          },
          status: {
            custom: "مخصص",
            inherited: "موروث",
          },
          errors: {
            fetchAvailableTimezones: "خطأ في تحميل المناطق الزمنية المتاحة",
            fetchCompanyTimezone: "خطأ في تحميل المنطقة الزمنية للشركة",
            updateDefaultTimezone: "خطأ في تحديث المنطقة الزمنية الافتراضية",
            updateCompanyTimezone: "خطأ في تحديث المنطقة الزمنية للشركة",
          },
          success: {
            defaultTimezoneUpdated: "تم تحديث المنطقة الزمنية الافتراضية بنجاح",
            companyTimezoneUpdated: "تم تحديث المنطقة الزمنية للشركة بنجاح",
            companyTimezoneReset: "تم إعادة تعيين المنطقة الزمنية للشركة بنجاح",
          },
        },
      },
      validationResponsive: {
        ratingRequired: "التقييم مطلوب"
      }
    },
  },
};

export { messages };