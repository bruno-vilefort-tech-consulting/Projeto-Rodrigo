const messages = {
  tr: {
    translations: {
      signup: {
        title: "Kaydol",
        toasts: {
          success: "Kullanıcı başarıyla oluşturuldu! Giriş yapın!!!",
          fail: "Kullanıcı oluşturulurken hata oluştu. Lütfen girilen verileri kontrol edin.",
          userCreationDisabled: "Yeni kullanıcı kaydı devre dışı bırakıldı.",
          verificationError: "Kayıt izinleri doğrulanırken hata oluştu.",
        },
        form: {
          name: "Ad",
          email: "E-posta",
          password: "Şifre",
          company: "Organizasyon Adı",
          phone: "Whatsapp (Alan Kodu + Numara)",
          plan: "Plan",
          planDetails: {
            attendants: "Temsilciler",
            whatsapp: "WhatsApp",
            queues: "Kuyruğa",
            currency: "₺",
          },
        },
        buttons: {
          submit: "Kaydol",
          login: "Zaten bir hesabınız var mı? Giriş yapın!",
        },
      },
      validation: {
        tooShort: "Çok kısa!",
        tooLong: "Çok uzun!",
        required: "Gerekli",
        invalidEmail: "Geçersiz e-posta",
      },
      login: {
        title: "Giriş",
        logoAlt: "Logo",
        emailLabel: "E-posta",
        passwordLabel: "Şifre",
        rememberMe: "Beni hatırla",
        loginButton: "Giriş Yap",
        signupButton: "Kaydol",
        forgotPassword: "Şifrenizi mi unuttunuz?",
        whatsappLabel: "WhatsApp'ta bizimle sohbet edin",
        whatsappTitle: "WhatsApp'ta bizimle sohbet edin",
        form: {
          email: "E-posta",
          password: "Şifre",
          button: "Erişim",
        },
        buttons: {
          submit: "Giriş Yap",
          register: "Hesabınız yok mu? Kaydolun!",
        },
      },
      companies: {
        title: "Şirketler",
        form: {
          name: "Şirket Adı",
          plan: "Plan",
          token: "Token",
          submit: "Kaydet",
          success: "Şirket başarıyla oluşturuldu!",
        },
      },
      auth: {
        toasts: {
          success: "Başarılı giriş!",
        },
        dueDate: {
          expiration: "Aboneliğiniz sona eriyor",
          days: "gün!",
          day: "gün!",
          expirationToday: "Aboneliğiniz bugün sona eriyor!",
        },
        token: "Token",
      },
      forgotPassword: {
        title: "Şifreyi Sıfırla",
        form: {
          emailLabel: "E-postanızı girin",
          submitButton: "Sıfırlama Bağlantısı Gönder",
          backToLogin: "Girişe Geri Dön",
        },
        loading: {
          sending: "Gönderiliyor...",
          sent: "Gönderildi!",
        },
        toasts: {
          success: "Şifre sıfırlama bağlantısı başarıyla gönderildi",
        },
      },
      resetPassword: {
        title: "Şifreyi Sıfırla",
        form: {
          newPassword: "Yeni Şifre",
          confirmPassword: "Şifreyi Onayla",
        },
        buttons: {
          submit: "Şifreyi Sıfırla",
          submitting: "Sıfırlanıyor...",
          submitted: "Sıfırlandı!",
          backToLogin: "Girişe Geri Dön",
        },
        errors: {
          passwordMismatch: "Şifreler eşleşmiyor",
          passwordTooShort: "Şifre en az 6 karakter olmalıdır",
          invalidToken: "Sıfırlama token'ı eksik veya geçersiz. Lütfen yeni bir sıfırlama bağlantısı isteyin.",
          resetError: "Şifre sıfırlanırken hata oluştu. Lütfen tekrar deneyin.",
        },
        toasts: {
          success: "Şifre başarıyla sıfırlandı",
          passwordMismatch: "Şifreler eşleşmiyor",
          passwordTooShort: "Şifre en az 6 karakter olmalıdır",
        },
      },
      financeiro: {
        title: "Faturalar",
        table: {
          details: "Detaylar",
          users: "Kullanıcılar",
          connections: "Bağlantılar",
          queues: "Sıralar",
          value: "Değer",
          dueDate: "Vade Tarihi",
          status: "Durum",
          action: "Eylem"
        },
        tooltips: {
          details: "Fatura detayları",
          users: "Kullanıcı sayısı",
          connections: "Bağlantı sayısı",
          queues: "Sıra sayısı",
          value: "Fatura değeri",
          dueDate: "Vade tarihi"
        },
        status: {
          paid: "Ödendi",
          overdue: "Vadesi Geçti",
          open: "Açık",
          yes: "Evet",
          no: "Hayır",
          overdueFor: "{{days}} gün vadesi geçti",
          dueToday: "Bugün vadesi dolacak",
          dueIn: "{{days}} gün içinde vadesi dolacak"
        },
        buttons: {
          pay: "ÖDE",
          paid: "ÖDENDİ",
          payNow: "ŞİMDİ ÖDE"
        },
        checkout: {
          title: "Neredeyse tamam!",
          steps: {
            data: "Veriler",
            customize: "Özelleştir",
            review: "İncele"
          },
          messages: {
            notFound: "Bulunamadı",
            paymentNotice: "Ödeme yaptıktan sonra sayfayı yenileyin!",
            subscriptionSuccess: "Abonelik başarıyla tamamlandı! Ödeme işlemi bekleniyor"
          },
          buttons: {
            back: "GERİ",
            pay: "ÖDE",
            next: "İLERİ"
          },
          pricing: {
            users: "Kullanıcılar",
            connection: "Bağlantı",
            queues: "Sıralar",
            select: "SEÇ",
            perMonth: "/ay"
          },
          review: {
            title: "Abonelik özeti"
          },
          success: {
            total: "TOPLAM",
            copied: "Kopyalandı",
            copyQr: "QR kodu kopyala",
            finalizeMessage: "Tamamlamak için, yukarıdaki Pix kodunu tarayarak veya yapıştırarak ödeme yapmanız yeterli :)",
            licenseRenewed: "Lisansınız şu tarihe kadar yenilendi:"
          },
          planDetails: {
            title: "Plan detayları",
            billing: "Faturalandırma: Aylık"
          },
          paymentInfo: {
            title: "Ödeme bilgileri",
            email: "E-posta:",
            name: "İsim:",
            document: "CPF/CNPJ:",
            total: "Toplam:"
          }
        }
      },
      dashboard: {
        title: "Kontrol Paneli",
        buttons: {
          filter: "Filtrele"
        },
        tabs: {
          indicators: "Göstergeler",
          assessments: "NPS",
          attendants: "Katılımcılar",
          performance: "Performanslar"
        },
        charts: {
          performance: "Grafikler",
          userPerformance: "Kullanıcı Grafikleri",
          hourlyServices: "Saatlik Hizmetler",
          ticketsLabel: "Biletler",
          score: "Puan",
          perDay: {
            title: "Bugünkü Görüşmeler: ",
          },
          errorFetchingTickets: "Bilet bilgileri alınırken hata oluştu",
          noDataAvailable: "Seçilen dönem için veri bulunamadı.",
        },
        cards: {
          inAttendance: "Görüşmede",
          waiting: "Bekliyor",
          activeAttendants: "Aktif Katılımcılar",
          finalized: "Tamamlandı",
          newContacts: "Yeni Kişiler",
          totalReceivedMessages: "Alınan Mesajlar",
          totalSentMessages: "Gönderilen Mesajlar",
          averageServiceTime: "Ort. Hizmet Süresi",
          averageWaitingTime: "Ort. Bekleme Süresi",
          status: "Durum (Güncel)",
          activeTickets: "Aktif Ticketlar",
          passiveTickets: "Pasif Ticketlar",
          groups: "Gruplar",
        },
        users: {
          name: "Ad",
          numberAppointments: "Görüşme Sayısı",
          statusNow: "Şu Anki Durum",
          totalCallsUser: "Kullanıcı Başına Toplam Görüşme",
          totalAttendances: "Toplam Görüşme",
          totalLabel: "Toplam görüşme: {{count}}",
          queues: "Sıralar",
          defaultQueue: "Varsayılan Bağlantı",
          workingHours: "Çalışma Saatleri",
          startWork: "Çalışma Başlangıcı",
          endWork: "Çalışma Sonu",
          farewellMessage: "Veda Mesajı",
          theme: "Varsayılan Tema",
          menu: "Varsayılan Menü"
        },
        date: {
          initialDate: "Başlangıç Tarihi",
          finalDate: "Bitiş Tarihi",
        },
        licence: {
          available: "Şuna Kadar Mevcut",
        },
        assessments: {
          totalCalls: "Toplam Görüşme",
          callsWaitRating: "Değerlendirme Bekleyen Görüşmeler",
          callsWithoutRating: "Değerlendirilmemiş Görüşmeler",
          ratedCalls: "Değerlendirilen Görüşmeler",
          evaluationIndex: "Değerlendirme Endeksi",
          score: "Puan",
          prosecutors: "Destekleyiciler",
          neutral: "Tarafsızlar",
          detractors: "Kötüleyenler",
          generalScore: "Genel NPS Puanı",
        },
        status: {
          online: "Çevrimiçi",
          offline: "Çevrimdışı",
        },
        filters: {
          title: "Filtreler",
          initialDate: "Başlangıç",
          finalDate: "Bitiş",
          filterButton: "Filtrele",
        },
        errors: {
          loadData: "Dashboard verileri yüklenemedi.",
          exportExcel: "Excel'e aktarma hatası.",
        },
        export: {
          sheetName: "TemsilciRaporu",
          fileName: "temsilci-raporu.xlsx",
        },
        nps: {
          overallScore: "Genel NPS Puanı",
        },
      },
      reports: {
        title: "Yapılan Anket Raporu",
        operator: "Operatör",
        period: "Dönem",
        until: "Şu Ana Kadar",
        date: "Tarih",
        reportTitle: "Raporlar",
        calls: "Görüşmeler",
        search: "Aramalar",
        durationCalls: "Görüşme Süreleri",
        grupoSessions: "Grup Görüşmeleri",
        groupTicketsReports: {
          timezone: "America/Sao_Paulo",
          msgToast: "Sıkıştırılmış rapor oluşturuluyor, lütfen bekleyin.",
          errorToast: "Rapor oluşturulurken hata oluştu",
          back: "Geri",
          groupServiceReport: "Grup Hizmet Raporu",
          loading: "Yükleniyor...",
          contact: "Kişi",
          dateOpen: "Açılış Tarihi",
          dateLastUpdated: "Son Güncelleme Tarihi",
          agent: "Kim Görüşme Yaptı",
          agentClosed: "Kim Kapattı",
          waitingAssistance: "Yardım Bekliyor",
          process: "Görüşmede",
        },
        researchReports: {
          response: "cevap",
          active: "(Aktif)",
          inactive: "(Pasif)",
          quantity: "Miktar",
          percentage: "yüzde",
          title: "Yapılan Anket Raporu",
          activeSearch: "Aktif Arama",
          inactiveSearch: "Pasif Arama",
        },
        ticketDurationDetail: {
          msgToast: "Sıkıştırılmış rapor oluşturuluyor, lütfen bekleyin.",
          title: "Görüşme Süresi Raporu",
          startService: "Hizmet Başlangıcı",
          lastUpdated: "Son Güncelleme",
          lastAgent: "Son Katılımcı",
          durationFinished: "Tamamlandıktan Sonraki Süre",
        },
        ticketDuration: {
          title: "Görüşme Süresi Raporu",
          contact: "Kişi",
          open: "Açık",
          pending: "Beklemede",
          finished: "Tamamlandı",
          durationFinished: "Tamamlananların Süresi",
          durationAfterFinished: "Tamamlandıktan Sonraki Süre",
          actions: "Eylemler",
        },
        ticketReports: {
          msgToast: "Sıkıştırılmış rapor oluşturuluyor, lütfen bekleyin.",
          title: "Hizmet Raporu",
        },
        pdf: {
          title: "Yapılan Görüşmeler Listesi",
          exportTitle: "Yapılan Grup Görüşmeleri Listesi",
        },
        form: {
          initialDate: "Başlangıç Tarihi",
          finalDate: "Bitiş Tarihi",
        },
        excel: {
          connection: "Bağlantı",
          contact: "Kişi",
          user: "Kullanıcı",
          queue: "Kuyruk",
          status: "Durum",
          lastMessage: "SonMesaj",
          dateOpen: "AçılmaTarihi",
          timeOpen: "AçılmaZamanı",
          dateClose: "KapanmaTarihi",
          timeClose: "KapanmaZamanı",
          supportTime: "DestekSüresi",
          nps: "nps",
          fileName: "hizmet-raporu.xlsx",
          sheetName: "HizmetRaporu",
        },
        tooltips: {
          ticketLogs: "Bilet Günlükleri",
          accessTicket: "Bilete Erişim",
          exportExcel: "Excel'e Aktar",
        },
      },
      todo: {
        newTask: "Yeni Görev",
        add: "Ekle",
        save: "Kaydet",
        task: "Görevler",
      },
      contactImportWpModal: {
        modalTitle: "Kişileri Dışa Aktar / İçe Aktar",
        title: "Kişileri Excel'e Aktar",
        buttons: {
          downloadModel: "Kişi içe aktarma için excel modelini indir",
          closed: "Kapat",
          import: "Kişileri içe aktarmak için excel dosyasını seçin",
        },
        form: {
          connection: "WhatsApp Bağlantısı",
          connectionPlaceholder: "Bağlantı seçin...",
          importType: "İçe aktarma türü",
          importAll: "Tüm kişileri içe aktar",
          importSelected: "Seçili kişileri içe aktar",
          overwriteExisting: "Mevcut kişilerin üzerine yaz"
        },
        validation: {
          connectionRequired: "Bir bağlantı seçmelisiniz",
          noContactsFound: "İçe aktarılacak kişi bulunamadı"
        },
        progress: {
          importing: "Kişiler içe aktarılıyor...",
          imported: "İçe aktarılan kişiler: {count}",
          duplicated: "Tekrar eden kişiler: {count}",
          failed: "Başarısız kişiler: {count}"
        }
      },
      tagsContainer: {
        title: "Kişi Etiketleri",
        placeholder: "Etiket ekle...",
        add: "Ekle",
        remove: "Kaldır",
        noTags: "Atanmış etiket yok",
        createNew: "Yeni etiket oluştur",
        searchPlaceholder: "Etiket ara...",
        buttons: {
          save: "Etiketleri Kaydet",
          cancel: "İptal",
          clear: "Hepsini Temizle"
        },
        validation: {
          tagRequired: "Etiket adı gerekli",
          tagExists: "Bu etiket zaten var",
          maxTags: "Maksimum {max} etiket izinli"
        }
      },
      allConnections: {
        errors: {
          loadCompanies: "Kayıt listesi yüklenemedi",
          unknownChannel: "error"
        },
        subtitle: "Mesaj almak ve müşterilerinizle sohbet başlatmak için hizmet kanallarınızı bağlayın.",
        channels: {
          whatsapp: "WhatsApp",
          facebook: "Facebook",
          instagram: "Instagram"
        },
        table: {
          client: "Müşteri",
          connectedConnections: "Bağlı Bağlantılar",
          disconnectedConnections: "Bağlantısı Kesik Bağlantılar",
          totalConnections: "Toplam Bağlantılar",
          total: "Toplam"
        }
      },
      companyWhatsapps: {
        title: "Bağlantılar: {{companyName}}",
        table: {
          channel: "Kanal"
        }
      },
      channels: {
        whatsapp: "WhatsApp",
        facebook: "Facebook",
        instagram: "Instagram"
      },
      connections: {
        title: "Bağlantılar",
        waitConnection: "Bekleyin... Bağlantılarınız yeniden başlatılıyor!",
        newConnection: "Yeni Bağlantı",
        restartConnections: "Bağlantıları Yeniden Başlat",
        callSupport: "Destek Çağır",
        toasts: {
          deleted: "Bağlantı başarıyla silindi!",
          closedimported:
            "İçe aktarılan ticketlar kapatılıyor, lütfen birkaç dakika bekleyin",
        },
        confirmationModal: {
          closedImportedTitle: "İçe aktarılan ticketları kapat",
          closedImportedMessage:
            "Onaylarsanız içe aktarılan tüm ticketlar kapatılacaktır",
          deleteTitle: "Sil",
          deleteMessage: "Emin misiniz? Bu işlem geri alınamaz.",
          disconnectTitle: "Bağlantıyı Kes",
          disconnectMessage:
            "Emin misiniz? QR Kodu tekrar okutmanız gerekecek.",
        },
        buttons: {
          add: "Bağlantı Ekle",
          disconnect: "Bağlantıyı Kes",
          tryAgain: "Tekrar Dene",
          qrcode: "QR KODU",
          newQr: "Yeni QR KODU",
          closedImported: "Tüm İçe Aktarılan Ticketları Kapat",
          preparing: "İçe aktarma için mesajlar hazırlanıyor",
          importing: "WhatsApp Mesajları İçe Aktarılıyor",
          processed: "İşlendi",
          in: "içinde",
          connecting: "Bağlanıyor",
        },
        typography: {
          processed: "İşlendi",
          in: "içinde",
          date: "Mesaj Tarihi",
        },
        toolTips: {
          disconnected: {
            title: "WhatsApp oturumu başlatılamadı",
            content:
              "Cep telefonunuzun internete bağlı olduğundan emin olun ve tekrar deneyin veya yeni bir QR Kodu isteyin",
          },
          qrcode: {
            title: "QR Kod okuması bekleniyor",
            content:
              "Oturumu başlatmak için 'QR KODU' düğmesine tıklayın ve QR Kodu cep telefonunuzla okutun",
          },
          connected: {
            title: "Bağlantı kuruldu!",
          },
          timeout: {
            title: "Cep telefonuyla bağlantı kesildi",
            content:
              "Cep telefonunuzun internete bağlı olduğundan ve WhatsApp'ın açık olduğundan emin olun veya yeni bir QR Kodu almak için 'Bağlantıyı Kes' düğmesine tıklayın",
          },
        },
        table: {
          name: "Ad",
          status: "Durum",
          lastUpdate: "Son Güncelleme",
          default: "Varsayılan",
          actions: "Eylemler",
          session: "Oturum",
          number: "WhatsApp Numarası",
          channel: "Kanal",
        },
        iconChannel: {
          error: "Hata",
        },
      },
      showTicketOpenModal: {
        title: {
          header: "Mevcut Görüşme",
        },
        form: {
          message: "Bu kişi zaten görüşmede:",
          user: "Katılımcı",
          queue: "Sıra",
          messageWait:
            "Bu kişi zaten görüşme bekliyor. Beklemede sekmesine bakın!",
          ticketId: "Ticket ID",
          status: "Durum",
          createdAt: "Oluşturulma tarihi",
          updatedAt: "Güncellenme tarihi"
        },
        buttons: {
          goToTicket: "Ticket'a Git",
          close: "Kapat",
          transferTicket: "Ticket'ı Transfer Et"
        },
        status: {
          open: "Açık",
          pending: "Beklemede",
          closed: "Kapalı"
        }
      },
      showTicketLogModal: {
        title: {
          header: "Loglar",
        },
        options: {
          create: "Ticket oluşturuldu.",
          chatBot: "ChatBot başlatıldı.",
          queue: " - Sıra tanımlandı.",
          open: " görüşmeyi başlattı.",
          access: "ticketa erişti.",
          transfered: "ticketi transfer etti.",
          receivedTransfer: "transfer edilen ticketi aldı.",
          pending: "sırayı geri verdi.",
          closed: "ticketi kapattı",
          reopen: "ticketi yeniden açtı",
          redirect: "- yeniden yönlendirildi"
        },
        close: "Kapat",
      },
      statusFilter: {
        title: "Durum Filtresi",
        groups: "Gruplar",
      },
      whatsappModal: {
        title: {
          add: "Bağlantı Ekle",
          edit: "Bağlantıyı Düzenle",
        },
        tabs: {
          general: "Genel",
          messages: "Mesajlar",
          assessments: "NPS",
          integrations: "Entegrasyonlar",
          schedules: "Çalışma Saatleri",
          chatbot: "Sohbet Botu",
          defaultFlow: "Varsayılan Akış",
        },
        form: {
          importOldMessagesEnable: "Cihazdan mesajları içe aktar",
          importOldMessages: "İçe Aktarma Başlangıç Tarihi",
          importRecentMessages: "İçe Aktarma Bitiş Tarihi",
          importOldMessagesGroups: "Grup mesajlarını içe aktar",
          closedTicketsPostImported: "İçe aktarıldıktan sonra ticketları kapat",
          name: "Ad",
          queueRedirection: "Sıra Yönlendirme",
          queueRedirectionDesc:
            "Sırası olmayan kişilerin yönlendirileceği bir sıra seçin",
          default: "Varsayılan",
          group: "Gruplara İzin Ver",
          timeSendQueue: "Sıraya yönlendirmek için dakika cinsinden süre",
          importAlert:
            "DİKKAT: Kaydedildiğinde bağlantınız sonlandırılacak, mesajları içe aktarmak için QR Kodu tekrar okumanız gerekecektir",
          groupAsTicket: "Grupları ticket olarak ele al",
          timeCreateNewTicket: "Yeni ticketı x dakika içinde oluştur",
          maxUseBotQueues: "Botu x kez gönder",
          timeUseBotQueues: "Botu x dakika içinde gönder",
          expiresTicket: "Açık sohbetleri x dakika sonra kapat",
          expiresTicketNPS:
            "Değerlendirme bekleyen sohbetleri x dakika sonra kapat",
          maxUseBotQueuesNPS:
            "Değerlendirme gönderme sayısı maksimum",
          closeLastMessageOptions1: "Katılımcı/Müşteri",
          closeLastMessageOptions2: "Katılımcı",
          outOfHoursMessage: "Çalışma Saati Dışı Mesajı",
          greetingMessage: "Karşılama Mesajı",
          complationMessage: "Tamamlama Mesajı",
          lgpdLinkPrivacy: "Gizlilik Politikası Bağlantısı",
          lgpdMessage: "LGPD Karşılama Mesajı",
          lgpdDeletedMessages: "Kişi tarafından silinen mesajları karart",
          lgpdSendMessage: "Her zaman kişiden onay iste",
          ratingMessage: "Değerlendirme Mesajı - Ölçek 0-10 olmalıdır",
          token: "Harici entegrasyon için Token",
          sendIdQueue: "Sıra",
          inactiveMessage: "Etkin Olmayan Mesaj",
          timeInactiveMessage:
            "Etkin olmama uyarısı göndermek için dakika cinsinden süre",
          whenExpiresTicket:
            "Son mesaj olduğunda açık sohbetleri kapat",
          expiresInactiveMessage: "Etkin olmama nedeniyle kapatma mesajı",
          prompt: "Komut",
          collectiveVacationEnd: "Bitiş Tarihi",
          collectiveVacationStart: "Başlangıç Tarihi",
          collectiveVacationMessage: "Toplu Tatil Mesajı",
          queueIdImportMessages: "Mesajları içe aktarmak için sıra"
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
        },
        menuItem: {
          enabled: "Etkin",
          disabled: "Devre Dışı",
          minutes: "dakika",
        },
        messages: {
          clickSaveToRegister: "Değişiklikleri kaydetmek için kaydet'e tıklayın",
        },
        flowBuilder: {
          welcomeFlow: "Karşılama akışı",
          welcomeFlowDescription: "Bu akış sadece yeni kişiler, kişi listenizde olmayan ve mesaj gönderen kişiler için tetiklenir",
          defaultResponseFlow: "Varsayılan yanıt akışı",
          defaultResponseFlowDescription: "Varsayılan Yanıt, bir anahtar kelimeden farklı herhangi bir karakter ile gönderilir. DİKKAT! Hizmet zaten kapanmış ve kapandıktan sonra 6 saat geçmişse tetiklenecektir.",
          title: "Varsayılan akış",
          save: "Kaydet",
          updatedSuccess: "Varsayılan akışlar güncellendi",
          deleteConfirmation: "Bu akışı silmek istediğinizden emin misiniz? Tüm ilişkili entegrasyonlar kaybolacaktır.",
        },
        success: "Bağlantı başarıyla kaydedildi.",
        errorSendQueue:
          "Sırayı yönlendirmek için süre belirtildi, ancak yönlendirilecek bir sıra seçilmedi. Her iki alan da doldurulmalıdır",
        errorExpiresNPS:
          "NPS kullanırken değerlendirme süresi bildirmek zorunludur.",
        errorRatingMessage:
          "NPS kullanırken değerlendirme mesajı bildirmek zorunludur.",
      },
      qrCode: {
        message: "Oturumu başlatmak için QR Kodu okutun",
      },
      qrcodeModal: {
        waiting: "QR Kodu bekleniyor"
      },
      forbiddenPage: {
        accessDenied: "Ups! Erişim Engellendi!",
        buttons: {
          back: "Geri"
        }
      },
      contacts: {
        title: "Kişiler",
        toasts: {
          deleted: "Kişi başarıyla silindi!",
        },
        searchPlaceholder: "Ara...",
        confirmationModal: {
          deleteTitle: "Sil ",
          importTitlte: "Kişileri içe aktar",
          exportContact: "Kişileri dışa aktar",
          deleteMessage:
            "Bu kişiyi silmek istediğinizden emin misiniz? İlgili tüm görüşmeler kaybolacaktır.",
          blockContact: "Bu kişiyi engellemek istediğinizden emin misiniz?",
          unblockContact: "Bu kişinin engellemesini kaldırmak istediğinizden emin misiniz?",
          importMessage: "Telefondaki tüm kişileri içe aktarmak ister misiniz?",
          importChat: "Sohbetleri İçe Aktar",
          wantImport: "Telefondaki tüm sohbetleri içe aktarmak ister misiniz?",
        },
        buttons: {
          import: "Kişileri İçe Aktar",
          add: "Kişi Ekle",
          export: "Kişiyi Dışa Aktar",
        },
        table: {
          name: "Ad",
          whatsapp: "Bağlantı",
          email: "E-posta",
          actions: "Eylemler",
          lastMessage: "Son Mesaj",
          status: "Durum",
          selectAll: "Tüm kişileri seç",
          selectContact: "{{name}} kişisini seç",
        },
        menu: {
          importYourPhone: "Varsayılan telefondan içe aktar",
          importToExcel: "Excel'den İçe Aktar / Dışa Aktar",
          importExport: "İçe / Dışa Aktar"
        },
        bulkActions: {
          deleteSelected: "Seçilenleri Sil ({{count}})",
          deleteConfirmTitle: "{{count}} seçili kişiyi silmek istediğinizden emin misiniz?",
          deleteConfirmMessage: "Bu işlem geri alınamaz.",
          deleteSuccess: "Seçili kişiler başarıyla silindi!",
          blockContact: "Kişi engellendi",
          unblockContact: "Kişi engeli kaldırıldı",
          selectConnectionToImport: "Hangi bağlantıdan içe aktarılacağını seçin"
        },
        tagsFilter: {
          title: "Etiketlere Göre Filtrele",
          placeholder: "Etiketleri seçin...",
          noTags: "Mevcut etiket yok",
          clearFilters: "Filtreleri temizle",
          selectedTags: "Seçili etiketler"
        },
        validation: {
          nameRequired: "Ad gerekli",
          numberRequired: "Numara gerekli",
          emailRequired: "E-posta gerekli",
          invalidEmail: "Geçersiz e-posta",
          numberExists: "Bu numara zaten var",
          emailExists: "Bu e-posta zaten var",
          invalidNumber: "Geçersiz numara",
          numberTooShort: "Numara çok kısa",
          numberTooLong: "Numara çok uzun",
          nameTooShort: "Ad çok kısa",
          nameTooLong: "Ad çok uzun",
          tooShort: "Çok kısa!",
          tooLong: "Çok uzun!",
          required: "Gerekli"
        },
      },
      contactImport: {
        title: "Dosyadan kişileri içe aktar",
        validation: {
          noNumberField: "Kişi numarası alanı seçilmedi",
          noNameField: "Kişi adı alanı seçilmedi",
          noContactsSelected: "Hiçbir kişi seçilmedi",
          fieldAlreadySelected: "{{field}} alanı zaten seçildi."
        },
        messages: {
          successComplete: "İçe aktarma başarıyla tamamlandı",
          successWithErrors: "İçe aktarma başarıyla tamamlandı, ancak bazı hatalar vardı",
          importing: "İçe aktarılıyor... Lütfen bekleyin",
          processing: "Dosya işleniyor...",
          invalidFile: "Geçersiz dosya!",
          contactsCreated: "kişi oluşturuldu",
          contactsIgnored: "kişi göz ardı edildi (geçersiz numara veya güncelleme için işaretlenmemiş)"
        },
        fields: {
          name: "Ad",
          number: "Numara",
          email: "E-posta",
          tags: "Etiketler"
        },
        buttons: {
          validateWhatsApp: "WhatsApp'ta kişileri doğrula",
          importContacts: "Kişileri içe aktar",
          cancel: "İptal",
          back: "Geri"
        },
        dropzone: {
          clickOrDrag: "Bir dosyayı tıklayın veya sürükleyin",
          importantNote: "* Önemli: Yalnızca şu uzantılara sahip dosyalar kabul edilir: xls, xlsx, csv, txt"
        }
      },
      forwardMessage: {
        text: "İletildi",
      },
      forwardMessageModal: {
        title: "Mesajı ilet",
        buttons: {
          ok: "İlet",
        },
      },
      promptModal: {
        form: {
          name: "Ad",
          prompt: "Komut",
          voice: "Ses",
          max_tokens: "Yanıtlamada Maksimum Token",
          temperature: "Sıcaklık",
          apikey: "API Anahtarı",
          max_messages: "Geçmişteki Maksimum Mesaj",
          voiceKey: "Ses API Anahtarı",
          voiceRegion: "Ses Bölgesi",
          model: "Model",
        },
        success: "Komut başarıyla kaydedildi!",
        title: {
          add: "Komut Ekle",
          edit: "Komutu Düzenle",
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
        },
        validation: {
          tooShort: "Çok kısa!",
          tooLong: "Çok uzun!",
          required: "Gerekli",
          promptDescription: "Yapay Zeka için eğitimi tanımlayın",
          invalidModel: "Geçersiz model",
          informModel: "Modeli bildirin",
          minTokens: "Minimum 10 token",
          maxTokens: "Maksimum 4096 token",
          informMaxTokens: "Maksimum token sayısını bildirin",
          minZero: "Minimum 0",
          maxOne: "Maksimum 1",
          informTemperature: "Sıcaklığı bildirin",
          informApiKey: "API Anahtarını bildirin",
          informQueue: "Kuyruğu bildirin",
          minMessages: "Minimum 1 mesaj",
          maxMessages: "Maksimum 50 mesaj",
          informMaxMessages: "Maksimum mesaj sayısını bildirin",
          informVoiceMode: "Ses modunu bildirin"
        },
        errors: {
          savePrompt: "Komutu kaydetme hatası"
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
          text: "Metin",
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
        title: "Komutlar",
        table: {
          name: "Ad",
          queue: "Sektör/Sıra",
          max_tokens: "Maksimum Token Yanıtı",
          actions: "Eylemler",
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage: "Emin misiniz? Bu işlem geri alınamaz!",
        },
        buttons: {
          add: "Komut Ekle",
        },
        errors: {
          noPermission: "Bu şirketin bu sayfaya erişim izni yok! Sizi yönlendiriyoruz."
        },
      },
      contactModal: {
        title: {
          add: "Kişi Ekle",
          edit: "Kişiyi Düzenle",
        },
        form: {
          mainInfo: "Kişi Bilgileri",
          extraInfo: "Ek Bilgiler",
          name: "Ad",
          number: "WhatsApp Numarası",
          email: "E-posta",
          extraName: "Alan Adı",
          extraValue: "Değer",
          chatBotContact: "Chatbot'u devre dışı bırak",
          termsLGDP: "LGPD Şartları kabul edildi:",
          whatsapp: "Kaynak Bağlantı: ",
          numberPlaceholder: "5513912344321",
          emailPlaceholder: "E-posta adresi"
        },
        buttons: {
          addExtraInfo: "Bilgi Ekle",
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
        },
        success: "Kişi başarıyla kaydedildi.",
      },
      contactTagListModal: {
        title: "Kişiler",
        table: {
          id: "ID",
          name: "Ad",
          number: "Numara",
          actions: "Eylemler"
        }
      },
      flowbuilder: {
        title: "Sohbet Akışları",
        subMenus: {
          campaign: "Kampanya Akışı",
          conversation: "Sohbet Akışı"
        },
        buttons: {
          add: "Akış Ekle",
          editName: "Adı düzenle",
          editFlow: "Akışı düzenle",
          duplicate: "Kopyala",
          delete: "Sil"
        },
        table: {
          status: "Durum"
        },
        status: {
          active: "Aktif",
          inactive: "Pasif"
        },
        toasts: {
          deleteSuccess: "Akış başarıyla silindi",
          duplicateSuccess: "Akış başarıyla kopyalandı"
        },
        confirmationModal: {
          deleteTitle: "Bu akışı silmek istediğinizden emin misiniz? İlgili tüm entegrasyonlar kaybolacaktır.",
          duplicateTitle: "{flowName} akışını kopyalamak istiyor musunuz?",
          duplicateMessage: "Bu akışı kopyalamak istediğinizden emin misiniz?"
        }
      },
      flowbuilderModal: {
        flowNotIdPhrase: "Varsayılan Akış",
        title: {
          add: "Akış Ekle",
          edit: "Akışı Düzenle"
        },
        validation: {
          tooShort: "Çok kısa!",
          tooLong: "Çok uzun!",
          required: "Bir ad girin!"
        }
      },
      queueModal: {
        title: {
          queueData: "Sıra Bilgileri",
          text: "Çalışma Saatleri",
          add: "Sıra Ekle",
          edit: "Sırayı Düzenle",
          confirmationDelete:
            "Emin misiniz? Tüm entegrasyon seçenekleri silinecektir.",
        },
        form: {
          name: "Ad",
          color: "Renk",
          orderQueue: "Sıra Sırası (Bot)",
          rotate: "Rotasyon",
          timeRotate: "Rotasyon Süresi",
          greetingMessage: "Karşılama Mesajı",
          complationMessage: "Tamamlama Mesajı",
          outOfHoursMessage: "Çalışma Saati Dışı Mesajı",
          token: "Token",
          integrationId: "Entegrasyon",
          fileListId: "Dosya Listesi",
          closeTicket: "Ticketı Kapat",
          queueType: "Menü Türü",
          message: "Yanıt Mesajı",
          queue: "Transfer Sırası",
          integration: "Entegrasyon",
          file: "Dosya",
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
        },
        bot: {
          title: "Seçenekler",
          toolTipTitle: "Bir chatbot oluşturmak için seçenekler ekleyin",
          toolTip:
            "Yalnızca bir seçenek varsa, otomatik olarak seçilecek, botun seçenek mesajıyla yanıt vermesine ve devam etmesine neden olacaktır",
          selectOption: "Bir Seçenek Seçin",
          text: "Metin",
          attendent: "Katılımcı",
          queue: "Sıra",
          integration: "Entegrasyon",
          file: "Dosya",
          toolTipMessageTitle:
            "Mesaj bir sonraki seviyeye geçmek için zorunludur",
          toolTipMessageContent:
            "Mesaj bir sonraki seviyeye geçmek için zorunludur",
          selectUser: "Bir Kullanıcı Seçin",
          selectQueue: "Bir Sıra Seçin",
          selectIntegration: "Bir Entegrasyon Seçin",
          addOptions: "Seçenekleri Ekle",
        },
        serviceHours: {
          dayWeek: "Haftanın Günü",
          startTimeA: "Başlangıç Saati - Vardiya A",
          endTimeA: "Bitiş Saati - Vardiya A",
          startTimeB: "Başlangıç Saati - Vardiya B",
          endTimeB: "Bitiş Saati - Vardiya B",
          monday: "Pazartesi",
          tuesday: "Salı",
          wednesday: "Çarşamba",
          thursday: "Perşembe",
          friday: "Cuma",
          saturday: "Cumartesi",
          sunday: "Pazar",
        },
      },
      queueIntegrationModal: {
        title: {
          add: "Proje Ekle",
          edit: "Projeyi Düzenle",
        },
        form: {
          id: "ID",
          type: "Tip",
          name: "Ad",
          projectName: "Proje Adı",
          language: "Dil",
          jsonContent: "Json İçeriği",
          urlN8N: "URL",
          typebotSlug: "Typebot - Slug",
          typebotExpires: "Bir konuşmanın sona ermesi için dakika cinsinden süre",
          typebotKeywordFinish: "Akışı sonlandırmak için anahtar kelime",
          typebotKeywordRestart: "Akışı yeniden başlatmak için anahtar kelime",
          typebotRestartMessage: "Konuşma yeniden başlatıldığında mesaj",
          typebotUnknownMessage: "Geçersiz seçenek mesajı",
          typebotDelayMessage: "Mesajlar arası gecikme (ms)",
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
          test: "Botu Test Et",
        },
        languages: {
          "pt-BR": "Portekizce",
          "en": "İngilizce",
          "es": "İspanyolca",
        },
        messages: {
          testSuccess: "Entegrasyon başarıyla test edildi!",
          addSuccess: "Entegrasyon başarıyla eklendi.",
          editSuccess: "Entegrasyon başarıyla düzenlendi.",
        },
      },
      userModal: {
        warning:
          "Mesajları içe aktarmak için QR kodu tekrar okumanız gerekiyor !!!",
        title: {
          add: "Kullanıcı Ekle",
          edit: "Kullanıcıyı Düzenle",
          updateImage: "Görüntüyü Güncelle",
          removeImage: "Görüntüyü Sil",
        },
        form: {
          name: "Ad",
          none: "Hiçbiri",
          email: "E-posta",
          password: "Şifre",
          farewellMessage: "Veda Mesajı",
          profile: "Profil",
          startWork: "Çalışma Başlangıcı",
          endWork: "Çalışma Sonu",
          whatsapp: "Varsayılan Bağlantı",
          allTicketEnable: "Etkin",
          allTicketDisable: "Devre Dışı",
          allTicket: "Sırasız çağrıları görüntüle",
          allowGroup: "Gruplara İzin Ver",
          defaultMenuOpen: "Açık",
          defaultMenuClosed: "Kapalı",
          defaultMenu: "Varsayılan Menü",
          defaultTheme: "Varsayılan Tema",
          defaultThemeDark: "Koyu",
          defaultThemeLight: "Açık",
          allHistoric: "Diğer sıralardaki konuşmaları gör",
          allHistoricEnabled: "Etkin",
          allHistoricDisabled: "Devre Dışı",
          allUserChat: "Diğer kullanıcıların sohbetlerini gör",
          userClosePendingTicket: "Bekleyen ticketları kapatmaya izin ver",
          showDashboard: "Kontrol Paneli Görüntüle",
          allowRealTime: "Gerçek Zamanlı Panel Görüntüle",
          allowConnections: "Bağlantılarda işlemlere izin ver",
        },
        tabs: {
          general: "Genel",
          permissions: "İzinler",
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
          addImage: "Görüntü Ekle",
          editImage: "Görüntüyü Düzenle",
        },
        success: "Kullanıcı başarıyla kaydedildi.",
      },
      companyModal: {
        title: {
          add: "Şirket Ekle",
          edit: "Şirketi Düzenle",
        },
        form: {
          name: "Ad",
          email: "E-posta",
          passwordDefault: "Şifre",
          numberAttendants: "Kullanıcılar",
          numberConections: "Bağlantılar",
          status: "Aktif",
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
        },
        success: "Şirket başarıyla kaydedildi.",
      },
      scheduleModal: {
        title: {
          add: "Yeni Randevu",
          edit: "Randevuyu Düzenle",
        },
        form: {
          body: "Mesaj",
          contact: "Kişi",
          sendAt: "Randevu Tarihi",
          sentAt: "Gönderme Tarihi",
          assinar: "İmza Gönder"
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
          addSchedule: "Randevu Ekle"
        },
        success: "Randevu başarıyla kaydedildi.",
        validations: {
          tooShort: "Mesaj çok kısa",
          required: "Gerekli"
        },
        toasts: {
          deleted: "Medya başarıyla kaldırıldı."
        },
        confirmationModal: {
          deleteTitle: "Medyayı Sil",
          deleteMessage: "Bu medyayı silmek istediğinizden emin misiniz?"
        },
        status: {
          sending: "Gönderiliyor",
          pending: "Bekliyor",
          sent: "Gönderildi",
          error: "Gönderme Hatası"
        },
        recurrence: {
          title: "Tekrarlama",
          description: "Mesajı tekrarlayan şekilde göndermeyi seçebilir ve aralığı seçebilirsiniz. Tek seferlik mesajsa, bu bölümde hiçbir şeyi değiştirmeyin.",
          interval: "Aralık",
          intervalValue: "Aralık Değeri",
          sendTimes: "Kaç kez gönder",
          intervalTypes: {
            days: "Günler",
            weeks: "Haftalar",
            months: "Aylar",
            minutes: "Dakikalar"
          },
          businessDays: {
            normal: "Çalışmayan günlerde normal gönder",
            before: "Bir iş günü önce gönder",
            after: "Bir iş günü sonra gönder"
          }
        },
        calendar: {
          messages: {
            date: "Tarih",
            time: "Saat",
            event: "Etkinlik",
            allDay: "Tüm Gün",
            week: "Hafta",
            work_week: "Randevular",
            day: "Gün",
            month: "Ay",
            previous: "Önceki",
            next: "Sonraki",
            yesterday: "Dün",
            tomorrow: "Yarın",
            today: "Bugün",
            agenda: "Gündem",
            noEventsInRange: "Dönemde randevu yok.",
            showMore: "daha fazla"
          }
        },
        permissions: {
          noAccess: "Bu şirketin bu sayfaya erişim izni yok! Sizi yönlendiriyoruz."
        }
      },
      tagModal: {
        title: {
          add: "Yeni Etiket",
          edit: "Etiketi Düzenle",
          addKanban: "Yeni Şerit",
          editKanban: "Şeridi Düzenle",
        },
        form: {
          name: "Ad",
          color: "Renk",
          timeLane: "Şeride yönlendirmek için saat cinsinden süre",
          nextLaneId: "Şerit",
          greetingMessageLane: "Şerit karşılama mesajı",
          rollbackLaneId: "Görüşmeye devam ettikten sonra şeride geri dön"
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
        },
        validation: {
          tooShort: "Çok kısa!",
          required: "Gerekli"
        },
        success: "Etiket başarıyla kaydedildi.",
        successKanban: "Şerit başarıyla kaydedildi.",
      },
      fileModal: {
        title: {
          add: "Dosya listesi ekle",
          edit: "Dosya listesini düzenle",
        },
        buttons: {
          okAdd: "Kaydet",
          okEdit: "Düzenle",
          cancel: "İptal",
          fileOptions: "Dosya ekle",
        },
        form: {
          name: "Dosya listesi adı",
          message: "Liste Detayları",
          fileOptions: "Dosya Listesi",
          extraName: "Dosya ile gönderilecek mesaj",
          extraValue: "Seçenek Değeri",
        },
        success: "Dosya listesi başarıyla kaydedildi!",
      },
      chat: {
        noTicketMessage: "Konuşmaya başlamak için bir ticket seçin.",
        deleteConversationTitle: "Konuşmayı Sil",
        deleteConversationMessage: "Bu işlem geri alınamaz, onaylıyor musunuz?",
        messagePlaceholder: "Mesajınızı yazın...",
        sendButtonTooltip: "Mesaj gönder",
        noMessagesYet: "Henüz mesaj yok. Konuşmayı başlatın!",
        loadingMessages: "Mesajlar yükleniyor...",
        popover: {
          buttonTooltip: "Dahili konuşmalar",
          loading: "Konuşmalar yükleniyor...",
          noChats: "Mevcut konuşma yok",
          notificationNotSupported: "Bu tarayıcı bildirimleri desteklemiyor",
          accessibilityLabel: "Dahili konuşma listesi",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop:
            "⬇️ DOSYALARI AŞAĞIDAKİ ALANA SÜRÜKLEYİN VE BIRAKIN ⬇️",
          titleFileList: "Dosya Listesi",
        },
      },
      chatInternal: {
        new: "Yeni",
        tabs: {
          chats: "Sohbetler",
          messages: "Mesajlar",
        },
        form: {
          titleLabel: "Başlık",
          titlePlaceholder: "Başlık",
        },
        modal: {
          conversation: "Konuşma",
          title: "Başlık",
          filterUsers: "Kullanıcı Filtresi",
          cancel: "Kapat",
          save: "Kaydet",
        },
        modalDelete: {
          title: "Konuşmayı Sil",
          message: "Bu işlem geri alınamaz, onaylayın mı?",
        },
      },
      ticketsManager: {
        questionCloseTicket: "TÜM TICKETLARI KAPATMAK İSTİYOR MUSUNUZ?",
        yes: "EVET",
        not: "HAYIR",
        buttons: {
          newTicket: "Yeni",
          resolveAll: "Tümünü Çöz",
          close: "Kapat",
          new: "Yeni",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Sıralar",
      },
      tickets: {
        inbox: {
          closedAllTickets: "Tüm ticketları kapat?",
          closedAll: "Tümünü Kapat",
          newTicket: "Yeni Ticket",
          yes: "EVET",
          no: "HAYIR",
          open: "Açık",
          resolverd: "Çözüldü",
        },
        toasts: {
          deleted: "Görüşmede olduğunuz ticket silindi.",
        },
        notification: {
          message: "Mesaj",
        },
        tabs: {
          open: { title: "Açık" },
          closed: { title: "Çözüldü" },
          search: { title: "Ara" },
        },
        search: {
          placeholder: "Görüşme ve mesaj ara",
          filterConections: "Bağlantıya Göre Filtrele",
          filterConectionsOptions: {
            open: "Açık",
            closed: "Kapalı",
            pending: "Beklemede",
          },
          filterUsers: "Kullanıcıya Göre Filtrele",
          filterContacts: "Kişiye Göre Filtrele",
          ticketsPerPage: "Sayfa Başına Ticket",
        },
        buttons: {
          showAll: "Tümü",
          returnQueue: "Sıraya Geri Dön",
          scredule: "Randevu",
          deleteTicket: "Ticketı Sil",
          quickMessageFlash: "Hızlı yanıtlar",
        },
        noContactName: "(kişi yok)",
        noDepartment: "Departman yok",
        group: "Grup",
        transferTooltip: "Ticketı Transfer Et",
        closedTicket: {
          closedMessage: "Veda Mesajı ile Ticketı Kapat",
          closedNotMessage: "Veda Mesajı Olmadan Ticketı Kapat",
        },
      },
      messages: {
        download: "İndir",
        today: "BUGÜN",
        contact: "Kişi",
        forwarded: "İletildi",
        deletedByContact: "🚫 Bu mesaj kişi tarafından silindi &nbsp;",
        deletedMessage: "🚫 _Silinmiş mesaj_ ",
        deletedBySender: "🚫 Bu mesaj silindi &nbsp;",
        youReacted: "Tepki verdiniz... ",
        sayHello: "Yeni kişinize merhaba deyin!",
        dropFile: "Dosyayı buraya bırakın",
        facebookPolicy: "Facebook politikalarına göre, mesaj aldıktan sonra yanıtlamak için 24 saatiniz var.",
        defaultMetaMessage: "Merhaba! İlgileniyorum ve daha fazla bilgi almak istiyorum, lütfen.",
      },
      ticketsResponsive: {
        search: {
          searchInMessagesTooltip: "Mesaj içeriklerinde de arama yapmak için işaretleyin (daha yavaş)",
        },
        filter: {
          all: "Tümü",
        },
        sort: {
          ascending: "Artan",
          descending: "Azalan",
        },
      },
      contactForm: {
        validation: {
          tooShort: "Çok kısa!",
          tooLong: "Çok uzun!",
          required: "Gerekli",
          invalidEmail: "Geçersiz e-posta",
        },
        placeholders: {
          number: "5513912344321",
          email: "E-posta adresi",
        },
      },
      common: {
        image: "görsel",
      },
      messageInputResponsive: {
        privateMessage: {
          suffix: "Özel Mesaj",
        },
        type: {
          document: "Belge",
          buttons: "Düğmeler",
        },
        tooltip: {
          toggleSignature: "İmza Etkinleştir/Devre Dışı Bırak",
          toggleComments: "Yorumları Etkinleştir/Devre Dışı Bırak",
        },
      },
      transferTicketModal: {
        title: "Ticketı Transfer Et",
        fieldLabel: "Kullanıcı aramak için yazın",
        fieldQueueLabel: "Sıraya Transfer Et",
        fieldQueuePlaceholder: "Bir sıra seçin",
        fieldWhatsapp: "Bir whatsapp seçin",
        noOptions: "Bu isimle kullanıcı bulunamadı",
        msgTransfer: "Notlar - dahili mesaj, müşteriye gitmez",
        buttons: {
          ok: "Transfer Et",
          cancel: "İptal",
        },
      },
      ticketsList: {
        called: "Çağrıldı",
        today: "Bugün",
        missedCall: "Cevapsız sesli/görüntülü arama",
        pendingHeader: "Beklemede",
        assignedHeader: "Atanmış",
        groupingHeader: "Gruplar",
        noTicketsTitle: "Burada hiçbir şey yok!",
        noTicketsMessage:
          "Bu durum veya arama terimiyle ilgili hiçbir görüşme bulunamadı",
        noQueue: "Sıra Yok",
        buttons: {
          accept: "Kabul Et",
          cancel: "İptal Et",
          start: "başlat",
          closed: "Kapat",
          reopen: "Yeniden Aç",
          transfer: "Transfer Et",
          ignore: "Yoksay",
          exportAsPDF: "PDF olarak dışa aktar",
          kanbanActions: "Kanban Seçenekleri"
        },
        acceptModal: {
          title: "Sohbeti Kabul Et",
          queue: "Sektör Seç",
        },
      },
      newTicketModal: {
        title: "Ticket Oluştur",
        fieldLabel: "Kişiyi aramak için yazın",
        add: "Ekle",
        buttons: {
          ok: "Kaydet",
          cancel: "İptal",
        },
        form: {
          contact: "Kişi",
          queue: "Sıra",
          message: "İlk mesaj",
          contactPlaceholder: "Kişi ara...",
          queuePlaceholder: "Sıra seç...",
          messagePlaceholder: "İsteğe bağlı ilk mesaj..."
        },
        validation: {
          contactRequired: "Bir kişi seçmelisiniz",
          queueRequired: "Bir sıra seçmelisiniz"
        }
      },
      SendContactModal: {
        title: "Kişi Gönder",
        fieldLabel: "Kişiyi aramak için yazın",
        add: "Ekle",
        buttons: {
          ok: "Gönder",
          cancel: "İptal",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Kontrol Paneli",
          connections: "Bağlantılar",
          chatsTempoReal: "Panel",
          tickets: "Görüşmeler",
          quickMessages: "Hızlı Yanıtlar",
          contacts: "Kişiler",
          queues: "Sıralar ve Chatbot",
          flowbuilder: "Flowbuilder",
          tags: "Etiketler",
          administration: "Yönetim",
          companies: "Şirketler",
          users: "Kullanıcılar",
          settings: "Ayarlar",
          files: "Dosya Listesi",
          helps: "Yardım",
          messagesAPI: "API",
          schedules: "Randevular",
          campaigns: "Kampanyalar",
          annoucements: "Duyurular",
          chats: "Dahili Sohbet",
          financeiro: "Finansal",
          queueIntegration: "Entegrasyonlar",
          version: "Sürüm",
          kanban: "Kanban",
          prompts: "Promptlar",
          allConnections: "Bağlantıları yönet",
          reports: "Raporlar",
          management: "Yönetim"
        },
        appBar: {
          user: {
            profile: "Profil",
            logout: "Çıkış",
            message: "Merhaba",
            messageEnd: "hoş geldiniz",
            active: "Şu Tarihe Kadar Aktif",
            goodMorning: "Merhaba,",
            myName: "benim adım",
            continuity: "ve görüşmenizi ben devam ettireceğim.",
            virtualAssistant: "Sanal Asistan",
            token:
              "Geçersiz token, lütfen platform yöneticisiyle iletişime geçin.",
          },
          message: {
            location: "Konum",
            contact: "Kişi",
          },
          notRegister: "Kayıt Yok",
          refresh: "Yenile",
        },
      },
      languages: {
        undefined: "Dil",
        "pt-BR": "Portekizce",
        es: "İspanyolca",
        en: "İngilizce",
        tr: "Türkçe",
      },
      messagesAPI: {
        title: "Mesaj Gönderme için API",
        textMessage: {
          number: "Numara",
          body: "Mesaj",
          token: "Kayıtlı Token",
          userId: "Kullanıcı/Katılımcı ID'si",
          queueId: "Sıra ID'si",
        },
        mediaMessage: {
          number: "Numara",
          body: "Dosya Adı",
          media: "Dosya",
          token: "Kayıtlı Token",
        },
        API: {
          title: "Mesaj Gönderme Dokümantasyonu",
          methods: {
            title: "Gönderme Yöntemleri",
            messagesText: "Metin Mesajları",
            messagesMidia: "Medya Mesajları",
          },
          instructions: {
            title: "Talimatlar",
            comments: "Önemli Notlar",
            comments1:
              "Mesaj göndermeden önce, mesajları gönderecek bağlantıyla ilişkili tokenı kaydetmek gereklidir. <br />Kaydetmek için 'Bağlantılar' menüsüne gidin, bağlantının düzenle düğmesine tıklayın ve tokenı ilgili alana girin.",
            comments2:
              "Gönderilecek numara maske veya özel karakter içermemelidir ve şunlardan oluşmalıdır:",
            codeCountry: "Ülke Kodu",
            code: "Alan Kodu",
            number: "Numara",
          },
          text: {
            title: "1. Metin Mesajları",
            instructions:
              "Metin mesajları göndermek için gerekli bilgiler aşağıdadır:",
          },
          media: {
            title: "2. Medya Mesajları",
            instructions:
              "Metin mesajları göndermek için gerekli bilgiler aşağıdadır:",
          },
        },
        messages: {
          noPermission: "Bu şirketin bu sayfaya erişim izni yok! Sizi yönlendiriyoruz.",
          success: "Mesaj başarıyla gönderildi",
        },
        form: {
          send: "Gönder",
          testSend: "Test Gönderimi",
        },
        documentation: {
          endpoint: "Endpoint: ",
          method: "Yöntem: ",
          post: "POST",
          headers: "Headers: ",
          headersTextAuth: "Authorization Bearer (kayıtlı token) ve Content-Type (application/json)",
          headersMediaAuth: "Authorization Bearer (kayıtlı token) ve Content-Type (multipart/form-data)",
          body: "Body: ",
          formData: "FormData: ",
          bodyExample: "{\n  \"number\": \"558599999999\",\n  \"body\": \"Message\",\n  \"userId\": \"Kullanıcı ID'si veya \\\"\\\"\",\n  \"queueId\": \"Sıra ID'si veya \\\"\\\"\",\n  \"sendSignature\": \"Mesajı imzala - true/false\",\n  \"closeTicket\": \"Bileti kapat - true/false\"\n}",
          formDataFields: {
            number: "number: 558599999999",
            body: "body: Message",
            userId: "userId: Kullanıcı ID'si veya \\\"\\\"",
            queueId: "queueId: Sıra ID'si veya \\\"\\\"",
            medias: "medias: dosya",
            sendSignature: "sendSignature: Mesajı imzala true/false",
            closeTicket: "closeTicket: Bileti kapat true/false",
          },
        },
      },
      notifications: {
        noTickets: "Bildirim yok.",
      },
      quickMessages: {
        title: "Hızlı Yanıtlar",
        searchPlaceholder: "Ara...",
        noAttachment: "Ek yok",
        confirmationModal: {
          deleteTitle: "Silme",
          deleteMessage: "Bu işlem geri alınamaz! Devam etmek ister misiniz?",
        },
        buttons: {
          add: "Ekle",
          attach: "Dosya Ekle",
          cancel: "İptal",
          edit: "Düzenle",
        },
        toasts: {
          success: "Kısayol başarıyla eklendi!",
          deleted: "Kısayol başarıyla kaldırıldı!",
        },
        dialog: {
          title: "Hızlı Mesaj",
          shortcode: "Kısayol",
          message: "Yanıt",
          save: "Kaydet",
          cancel: "İptal",
          geral: "Düzenlemeye izin ver",
          add: "Ekle",
          edit: "Düzenle",
          visao: "Görünüm izni ver",
        },
        table: {
          shortcode: "Kısayol",
          message: "Mesaj",
          actions: "Eylemler",
          mediaName: "Medya Adı",
          status: "Durum",
        },
      },
      contactLists: {
        title: "Kişi Listeleri",
        table: {
          name: "Ad",
          contacts: "Kişiler",
          actions: "Eylemler",
        },
        buttons: {
          add: "Yeni Liste",
          downloadSample: "Örnek Elektronik Tablo İndir",
        },
        dialog: {
          name: "Ad",
          company: "Şirket",
          okEdit: "Düzenle",
          okAdd: "Ekle",
          add: "Ekle",
          edit: "Düzenle",
          cancel: "İptal",
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage: "Bu işlem geri alınamaz.",
        },
        toasts: {
          deleted: "Kayıt silindi",
        },
      },
      contactListItems: {
        title: "Kişiler",
        searchPlaceholder: "Ara",
        buttons: {
          add: "Yeni",
          lists: "Listeler",
          import: "İçe Aktar",
        },
        dialog: {
          name: "Ad",
          number: "Numara",
          whatsapp: "Whatsapp",
          email: "E-posta",
          okEdit: "Düzenle",
          okAdd: "Ekle",
          add: "Ekle",
          edit: "Düzenle",
          cancel: "İptal",
        },
        table: {
          name: "Ad",
          number: "Numara",
          whatsapp: "Whatsapp",
          email: "E-posta",
          actions: "Eylemler",
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage: "Bu işlem geri alınamaz.",
          importMessage: "Bu çalışma sayfasındaki kişileri içe aktarmak ister misiniz?",
          importTitlte: "İçe Aktar",
        },
        toasts: {
          deleted: "Kayıt silindi",
        },
        downloadTemplate: "Örnek elektronik tablo indirmek için buraya tıklayın.",
        whatsappValid: "Geçerli WhatsApp",
        whatsappInvalid: "Geçersiz WhatsApp",
      },
      kanban: {
        title: "Kanban",
        subtitle: "Bilet görselleştirme Kanban formatında",
        searchPlaceholder: "Ara",
        subMenus: {
          list: "Panel",
          tags: "Şeritler",
        },
        ticketNumber: "Bilet No ",
        viewTicket: "Bileti Görüntüle",
        startDate: "Başlangıç Tarihi",
        endDate: "Bitiş Tarihi",
        search: "Ara",
        addColumns: "+ Sütun Ekle",
        ticketTagRemoved: "Bilet Etiketi Kaldırıldı!",
        ticketTagAdded: "Bilet Etiketi Başarıyla Eklendi!",
        ticketMoveError: "Bilet taşınırken hata oluştu",
        iconChannelError: "Hata",
        noTickets: "Bilet yok",
        emptyStateTags: "Kanban etiketi oluşturulmadı",
        emptyStateTagsDescription: "Biletleri düzenlemeye başlamak için ilk Kanban etiketinizi oluşturun",
        createFirstTag: "İlk Etiketi Oluştur",
        emptyStateTickets: "Bilet bulunamadı",
        emptyStateTicketsDescription: "Tarih filtrelerini ayarlayın veya yeni biletler oluşturun",
        errorTitle: "Kanban yüklenirken hata oluştu",
        errorDescription: "Veri alınırken bir hata oluştu. Lütfen tekrar deneyin.",
        retry: "Tekrar Dene",
      },
      campaigns: {
        status: {
          inactive: "Etkin Değil",
          scheduled: "Planlandı",
          inProgress: "Devam Ediyor",
          cancelled: "İptal Edildi",
          finished: "Tamamlandı",
        },
        common: {
          none: "Hiçbiri",
          notDefined: "Tanımsız",
          noSchedule: "Randevu yok",
          notCompleted: "Tamamlanmadı",
          enabled: "Etkin",
          disabled: "Devre Dışı",
        },
        modal: {
          tabLabels: {
            msg1: "Msg. 1",
            msg2: "Msg. 2",
            msg3: "Msg. 3",
            msg4: "Msg. 4",
            msg5: "Msg. 5",
          },
          helpText: "Değişkenleri {name}, {number}, {email} olarak kullanın veya özel değişkenler tanımlayın.",
        },
        title: "Kampanyalar",
        searchPlaceholder: "Ara",
        subMenus: {
          list: "Liste",
          listContacts: "Kişi Listesi",
          settings: "Ayarlar",
        },
        settings: {
          randomInterval: "Rastgele Gönderme Aralığı",
          noBreak: "Ara Yok",
          intervalGapAfter: "Sonra Daha Büyük Aralık",
          undefined: "Tanımsız",
          messages: "mesajlar",
          laggerTriggerRange: "Daha büyük tetikleme aralığı",
          addVar: "Değişken Ekle",
          save: "Kaydet",
          close: "Kapat",
          add: "Ekle",
          shortcut: "Kısayol",
          content: "İçerik",
        },
        buttons: {
          add: "Yeni Kampanya",
          contactLists: "Kişi Listeleri",
          stopCampaign: "Kampanyayı Durdur",
        },
        table: {
          name: "Ad",
          whatsapp: "Bağlantı",
          contactList: "Kişi Listesi",
          option: "Hiçbiri",
          disabled: "Devre Dışı",
          enabled: "Etkin",
          status: "Durum",
          scheduledAt: "Planlanan Tarih",
          completedAt: "Tamamlandı",
          confirmation: "Onay",
          actions: "Eylemler",
        },
        dialog: {
          new: "Yeni Kampanya",
          update: "Kampanyayı Düzenle",
          readonly: "Salt Okunur",
          help: "Değişkenleri {name}, {number}, {email} olarak kullanın veya özel değişkenler tanımlayın.",
          form: {
            name: "Ad",
            message1: "Mesaj 1",
            message2: "Mesaj 2",
            message3: "Mesaj 3",
            message4: "Mesaj 4",
            message5: "Mesaj 5",
            confirmationMessage1: "Onay Mesajı 1",
            confirmationMessage2: "Onay Mesajı 2",
            confirmationMessage3: "Onay Mesajı 3",
            confirmationMessage4: "Onay Mesajı 4",
            confirmationMessage5: "Onay Mesajı 5",
            messagePlaceholder: "Mesaj İçeriği",
            whatsapp: "Bağlantı",
            status: "Durum",
            scheduledAt: "Planlanan Tarih",
            confirmation: "Onay",
            contactList: "Kişi Listesi",
            tagList: "Etiketler",
            statusTicket: "Ticket Durumu",
            openTicketStatus: "Açık",
            pendingTicketStatus: "Beklemede",
            closedTicketStatus: "Kapalı",
            enabledOpenTicket: "Etkin",
            disabledOpenTicket: "Devre Dışı",
            openTicket: "Ticket Aç",
          },
          buttons: {
            add: "Ekle",
            edit: "Güncelle",
            okadd: "Tamam",
            cancel: "Gönderimi İptal Et",
            restart: "Gönderimi Yeniden Başlat",
            close: "Kapat",
            attach: "Dosya Ekle",
          },
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage: "Bu işlem geri alınamaz.",
        },
        toasts: {
          success: "İşlem başarıyla gerçekleştirildi",
          cancel: "Kampanya iptal edildi",
          restart: "Kampanya yeniden başlatıldı",
          deleted: "Kayıt silindi",
        },
        noPermission: "Bu şirketin bu sayfaya erişim yetkisi yok! Sizi yönlendiriyoruz.",
      },
      campaignReport: {
        title: "Rapor",
        inactive: "Etkin Değil",
        scheduled: "Planlandı",
        process: "Devam Ediyor",
        cancelled: "İptal Edildi",
        finished: "Tamamlandı",
        campaign: "Kampanya",
        validContacts: "Geçerli Kişiler",
        confirmationsRequested: "Onay İstenen",
        confirmations: "Onaylar",
        deliver: "Teslim Edildi",
        connection: "Bağlantı",
        contactLists: "Kişi Listeleri",
        schedule: "Randevu",
        conclusion: "Sonuç",
        noPermission: "Bu şirketin bu sayfaya erişim yetkisi yok! Sizi yönlendiriyoruz.",
        status: "Durum:",
        of: "/'den",
      },
      announcements: {
        title: "Duyurular",
        searchPlaceholder: "Ara",
        active: "Aktif",
        inactive: "Pasif",
        buttons: {
          add: "Yeni Duyuru",
          contactLists: "Duyuru Listeleri",
        },
        table: {
          priority: "Öncelik",
          title: "Başlık",
          text: "Metin",
          mediaName: "Dosya",
          status: "Durum",
          actions: "Eylemler",
        },
        dialog: {
          edit: "Duyuru Düzenleme",
          add: "Yeni Duyuru",
          update: "Duyuruyu Düzenle",
          readonly: "Salt Okunur",
          form: {
            priority: "Öncelik",
            title: "Başlık",
            text: "Metin",
            mediaPath: "Dosya Yolu",
            status: "Durum",
            high: "Yüksek",
            medium: "Orta",
            low: "Düşük",
            active: "Aktif",
            inactive: "Pasif",
          },
          buttons: {
            add: "Ekle",
            edit: "Güncelle",
            okadd: "Tamam",
            cancel: "İptal",
            close: "Kapat",
            attach: "Dosya Ekle",
          },
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage: "Bu işlem geri alınamaz.",
        },
        toasts: {
          success: "İşlem başarıyla gerçekleştirildi",
          deleted: "Kayıt silindi",
          noPermission: "Bu şirketin bu sayfaya erişim yetkisi yok! Sizi yönlendiriyoruz.",
        },
      },
      campaignsConfig: {
        title: "Kampanya Ayarları",
        noPermissionMessage: "Bu şirketin bu sayfaya erişim yetkisi yok! Sizi yönlendiriyoruz.",
        settingsSaved: "Ayarlar kaydedildi",
        intervals: "Aralıklar",
        seconds: "saniye",
      },
      campaignsPhrase: {
        title: "Kampanyalar",
        phraseDeleted: "Kelime silindi",
        phraseUpdated: "Kelime başarıyla güncellendi!",
        phraseCreated: "Kelime başarıyla oluşturuldu!",
        addCampaign: "Kampanya",
        table: {
          name: "Ad",
          status: "Durum",
          active: "Aktif",
          inactive: "Devre Dışı",
          empty: "Kelime kampanyası bulunamadı",
        },
        modal: {
          editTitle: "Kelime akışlı kampanyayı düzenle",
          newTitle: "Yeni kelime akışlı kampanya",
          nameLabel: "Kelime tetikleme adı",
          flowLabel: "Bir akış seçin",
          flowPlaceholder: "Bir akış seçin",
          connectionPlaceholder: "Bir Bağlantı Seçin",
          phraseLabel: "Hangi kelime akışı tetikler?",
          matchTypeLabel: "Eşleşme türü",
          matchTypeExact: "Tam Eşleşme",
          matchTypeContains: "Kelimeyi içerir",
          matchTypeTooltip: "Tam: mesaj kelimeyle tam olarak eşleşmeli. İçerir: kelime mesajın herhangi bir yerinde görünebilir",
          statusLabel: "Durum",
          cancelButton: "İptal",
          saveButton: "Kampanyayı kaydet",
          createButton: "Kampanya oluştur",
        },
      },
      queues: {
        title: "Sıralar ve Chatbot",
        table: {
          name: "Ad",
          color: "Renk",
          greeting: "Karşılama Mesajı",
          orderQueue: "Sıra Sırası (bot)",
          actions: "Eylemler",
          ID: "ID",
        },
        buttons: {
          add: "Sıra Ekle",
        },
        toasts: {
          success: "Sıra başarıyla kaydedildi",
          deleted: "Sıra başarıyla silindi",
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage:
            "Emin misiniz? Bu işlem geri alınamaz! Bu sıradaki görüşmeler devam edecektir ancak artık bir sıraya atanmayacaktır.",
        },
      },
      queue: {
        queueData: "Sıra Verileri",
      },
      queueSelect: {
        inputLabel: "Sıralar",
        inputLabelRO: "Salt okunur sıralar",
        withoutQueue: "Sırasız",
        undefined: "Sıra bulunamadı",
      },
      reports: {
        title: "Görüşme Raporları",
        table: {
          id: "Ticket",
          user: "Kullanıcı",
          dateOpen: "Açılış Tarihi",
          dateClose: "Kapanış Tarihi",
          NPS: "NPS",
          status: "Durum",
          whatsapp: "Bağlantı",
          queue: "Sıra",
          actions: "Eylemler",
          lastMessage: "Son Mesaj",
          contact: "Müşteri",
          supportTime: "Hizmet Süresi",
        },
        buttons: {
          filter: "Filtre Uygula",
          onlyRated: "Yalnızca Değerlendirilenler",
        },
        searchPlaceholder: "Ara...",
      },
      queueIntegration: {
        title: "Entegrasyonlar",
        table: {
          id: "ID",
          type: "Tip",
          name: "Ad",
          projectName: "Proje Adı",
          language: "Dil",
          lastUpdate: "Son Güncelleme",
          actions: "Eylemler",
        },
        buttons: {
          add: "Proje Ekle",
        },
        searchPlaceholder: "Ara...",
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage:
            "Emin misiniz? Bu işlem geri alınamaz! ve ilişkili sıralardan ve bağlantılardan kaldırılacaktır",
        },
        toasts: {
          deleted: "Entegrasyon başarıyla silindi!",
        },
        messages: {
          noPermission: "Bu şirketin bu sayfaya erişim izni yok! Sizi yönlendiriyoruz.",
        },
      },
      users: {
        title: "Kullanıcılar",
        table: {
          status: "Durum",
          avatar: "Avatar",
          name: "Ad",
          email: "E-posta",
          profile: "Profil",
          startWork: "Çalışma Başlangıcı",
          endWork: "Çalışma Sonu",
          actions: "Eylemler",
          ID: "ID",
        },
        profile: {
          admin: "Yönetici",
          user: "Kullanıcı",
        },
        status: {
          enabled: "Etkin",
          disabled: "Devre Dışı",
        },
        upload: {
          avatar: "Avatar Yükle",
        },
        buttons: {
          add: "Kullanıcı Ekle",
        },
        toasts: {
          deleted: "Kullanıcı başarıyla silindi.",
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage:
            "Tüm kullanıcı verileri kaybolacaktır. Bu kullanıcının açık ticketları sıraya taşınacaktır.",
        },
      },
      companies: {
        title: "Şirketler",
        table: {
          ID: "ID",
          status: "Aktif",
          name: "Ad",
          email: "E-posta",
          password: "Şifre",
          phone: "Telefon",
          plan: "Plan",
          active: "Aktif",
          numberAttendants: "Katılımcılar",
          numberConections: "Bağlantılar",
          value: "Değer",
          namePlan: "Plan Adı",
          numberQueues: "Sıralar",
          useCampaigns: "Kampanyaları Kullan",
          useExternalApi: "Rest API Kullan",
          useFacebook: "Facebook Kullan",
          useInstagram: "Instagram Kullan",
          useWhatsapp: "Whatsapp Kullan",
          useInternalChat: "Dahili Sohbet Kullan",
          useSchedules: "Randevuları Kullan",
          createdAt: "Oluşturuldu",
          dueDate: "Vade Tarihi",
          lastLogin: "Son Giriş",
          actions: "Eylemler",
          money: "TL",
          yes: "Evet",
          no: "Hayır",
          document: "CNPJ/CPF",
          recurrence: "Tekrarlama",
          monthly: "Aylık",
          bimonthly: "İki Aylık",
          quarterly: "Üç Aylık",
          semester: "Altı Aylık",
          yearly: "Yıllık",
          clear: "Temizle",
          delete: "Sil",
          user: "Kullanıcı",
          save: "Kaydet",
        },
        buttons: {
          add: "Şirket Ekle",
        },
        toasts: {
          deleted: "Şirket başarıyla silindi.",
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage:
            "Tüm şirket verileri kaybolacaktır. Bu kullanıcının açık ticketları sıraya taşınacaktır.",
        },
        notifications: {
          noPermission: "Bu şirketin bu sayfaya erişim yetkisi yok! Sizi yönlendiriyoruz."
        },
        table: {
          folderSize: "Klasör Boyutu",
          totalFiles: "Toplam Dosya",
          lastUpdate: "Son Güncelleme",
          yes: "Evet",
          no: "Hayır"
        }
      },
      compaies: {
        title: "Şirketler",
        form: {
          documentLabel: "CPF/CNPJ (isteğe bağlı)",
          documentPlaceholder: "000.000.000-00 veya 00.000.000/0000-00",
          documentInvalid: "Geçersiz CPF/CNPJ",
          documentDuplicate: "CPF/CNPJ zaten kayıtlı",
          documentNotProvided: "Belirtilmedi",
          nameRequired: "Ad zorunludur",
          emailRequired: "E-posta zorunludur",
        },
        table: {
          ID: "ID",
          status: "Aktif",
          name: "Ad",
          email: "E-posta",
          password: "Şifre",
          phone: "Telefon",
          plan: "Plan",
          active: "Aktif",
          numberAttendants: "Katılımcılar",
          numberConections: "Bağlantılar",
          value: "Değer",
          namePlan: "Plan Adı",
          numberQueues: "Sıralar",
          useCampaigns: "Kampanyaları Kullan",
          useExternalApi: "Rest API Kullan",
          useFacebook: "Facebook Kullan",
          useInstagram: "Instagram Kullan",
          useWhatsapp: "Whatsapp Kullan",
          useInternalChat: "Dahili Sohbet Kullan",
          useSchedules: "Randevuları Kullan",
          createdAt: "Oluşturuldu",
          dueDate: "Vade Tarihi",
          lastLogin: "Son Giriş",
          actions: "Eylemler",
          money: "TL",
          yes: "Evet",
          no: "Hayır",
          folderSize: "Klasör Boyutu",
          totalFiles: "Toplam Dosya",
          lastUpdate: "Son Güncelleme",
          document: "CNPJ/CPF",
          recurrence: "Tekrarlama",
          monthly: "Aylık",
          bimonthly: "İki Aylık",
          quarterly: "Üç Aylık",
          semester: "Altı Aylık",
          yearly: "Yıllık",
          clear: "Temizle",
          delete: "Sil",
          user: "Kullanıcı",
          save: "Kaydet",
        },
        searchPlaceholder: "Şirket ara...",
        searchLabel: "Şirket arama alanı",
        clearSearch: "Aramayı temizle",
        buttons: {
          add: "Şirket Ekle",
        },
        toasts: {
          deleted: "Şirket başarıyla silindi.",
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage:
            "Tüm şirket verileri kaybolacaktır. Bu kullanıcının açık ticketları sıraya taşınacaktır.",
        },
        notifications: {
          noPermission: "Bu şirketin bu sayfaya erişim yetkisi yok! Sizi yönlendiriyoruz."
        },
      },
      plans: {
        form: {
          name: "Ad",
          users: "Kullanıcılar",
          connections: "Bağlantılar",
          campaigns: "Kampanyalar",
          schedules: "Randevular",
          enabled: "Etkin",
          disabled: "Devre Dışı",
          clear: "Temizle",
          delete: "Sil",
          save: "Kaydet",
          yes: "Evet",
          no: "Hayır",
          money: "TL",
          public: "Herkese Açık"
        },
      },
      helps: {
        title: "Yardım Merkezi",
        thumbnail: "Küçük Resim",
        videoPlayerTitle: "YouTube video oynatıcısı",
        settings: {
          codeVideo: "Video Kodu",
          description: "Açıklama",
          clear: "Temizle",
          delete: "Sil",
          save: "Kaydet",
        },
      },
      schedules: {
        title: "Randevular",
        confirmationModal: {
          deleteTitle: "Bu Randevuyu silmek istediğinizden emin misiniz?",
          deleteMessage: "Bu işlem geri alınamaz.",
        },
        table: {
          contact: "Kişi",
          body: "Mesaj",
          sendAt: "Randevu Tarihi",
          sentAt: "Gönderme Tarihi",
          status: "Durum",
          actions: "Eylemler",
        },
        buttons: {
          add: "Yeni Randevu",
        },
        toasts: {
          deleted: "Randevu başarıyla silindi.",
        },
      },
      tags: {
        title: "Etiketler",
        confirmationModal: {
          deleteTitle: "Bu Etiketi silmek istediğinizden emin misiniz?",
          deleteMessage: "Bu işlem geri alınamaz.",
        },
        table: {
          id: "ID",
          name: "Ad",
          kanban: "Kanban",
          color: "Renk",
          tickets: "Ticket Kayıtları",
          contacts: "Kişiler",
          actions: "Eylemler",
        },
        buttons: {
          add: "Yeni Etiket",
        },
        toasts: {
          deleted: "Etiket başarıyla silindi.",
        },
      },
      tagsKanban: {
        title: "Şeritler",
        laneDefault: "Açık",
        confirmationModal: {
          deleteTitle: "Bu Şeridi silmek istediğinizden emin misiniz?",
          deleteMessage: "Bu işlem geri alınamaz.",
        },
        table: {
          name: "Ad",
          color: "Renk",
          tickets: "Ticketlar",
          actions: "Eylemler",
        },
        buttons: {
          add: "Yeni Şerit",
          backToKanban: "Kanban'a Dön",
        },
        toasts: {
          deleted: "Şerit başarıyla silindi.",
        },
      },
      files: {
        title: "Dosya Listesi",
        table: {
          name: "Ad",
          contacts: "Kişiler",
          actions: "Eylem",
        },
        toasts: {
          deleted: "Liste başarıyla silindi!",
          deletedAll: "Tüm listeler başarıyla silindi!",
        },
        buttons: {
          add: "Ekle",
          deleteAll: "Tümünü Sil",
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteAllTitle: "Tümünü Sil",
          deleteMessage: "Bu listeyi silmek istediğinizden emin misiniz?",
          deleteAllMessage: "Tüm listeleri silmek istediğinizden emin misiniz?",
        },
      },
      settings: {
        success: "Ayarlar başarıyla kaydedildi.",
        title: "Ayarlar",
        tabs: {
          options: "Seçenekler",
          schedules: "Randevular",
          companies: "Şirketler",
          plans: "Planlar",
          helps: "Yardım",
          whitelabel: "Whitelabel",
          timezone: "Saat Dilimi",
        },
        settingsConfig: {
          userCreation: {
            name: "Kullanıcı Oluşturma",
            options: {
              enabled: "Etkin",
              disabled: "Devre Dışı",
            },
          },
          tabs: {
            options: "Seçenekler",
            schedules: "Randevular",
            plans: "Planlar",
            help: "Yardım",
          },
          options: {
            disabled: "Devre Dışı",
            enabled: "Etkin",
            updating: "Güncelleniyor...",
            creationCompanyUser: "Şirket/Kullanıcı Oluşturma",
            evaluations: "Değerlendirmeler",
            officeScheduling: "Ofis Randevu",
            queueManagement: "Sıra Yönetimi",
            companyManagement: "Şirket Yönetimi",
            connectionManagement: "Bağlantı Yönetimi",
            sendGreetingAccepted: "Ticket kabul edildiğinde karşılama gönder",
            sendMsgTransfTicket:
              "Sektör/katılımcı transferi mesajı gönder",
            checkMsgIsGroup: "Grup Mesajlarını Yoksay",
            chatBotType: "Bot Türü",
            userRandom: "Rastgele katılımcı seç",
            buttons: "Düğmeler",
            acceptCallWhatsapp: "Whatsapp'ta aramayı kabul etmediğini bildir?",
            sendSignMessage: "Katılımcının İmza Göndermesine izin ver",
            sendGreetingMessageOneQueues:
              "Sadece 1 sıra olduğunda karşılama mesajı gönder",
            sendQueuePosition: "Sıra pozisyonu mesajı gönder",
            sendFarewellWaitingTicket:
              "Bekleyen ticketta veda mesajı gönder",
            acceptAudioMessageContact:
              "Tüm kişilerden sesli mesaj kabul et?",
            enableLGPD: "LGPD işlemi etkinleştir",
            requiredTag: "Ticketı kapatmak için etiket zorunlu",
            closeTicketOnTransfer: "Başka bir sıraya aktarılırken ticketı kapat",
            DirectTicketsToWallets: "Müşteriyi otomatik olarak cüzdanlara taşı",
            showNotificationPending: "Bekleyen ticketlar için bildirim göster"
          },
          customMessages: {
            sendQueuePositionMessage: "Sıra pozisyonu mesajı",
            AcceptCallWhatsappMessage: "Aramaları kabul etmediğini bildirmek için mesaj",
            greetingAcceptedMessage: "Ticket kabul edildiğinde karşılama mesajı",
            transferMessage: "Transfer mesajı - ${queue.name} = hedef sıra",
          },
          LGPD: {
            title: "LGPD",
            welcome: "Hoş Geldiniz Mesajı (LGPD)",
            linkLGPD: "Gizlilik Politikası Bağlantısı",
            obfuscateMessageDelete: "Silinen mesajı karart",
            alwaysConsent: "Her zaman onay iste",
            obfuscatePhoneUser: "Kullanıcılar için telefon numarasını karart",
            enabled: "Etkin",
            disabled: "Devre Dışı",
          },
        tabs: {
          schedules: "Programlar",
          companies: "Şirketler",
          whitelabel: "Beyaz Etiket",
        },
        toasts: {
          schedulesSavedSuccess: "Programlar başarıyla güncellendi.",
          operationUpdatedSuccess: "İşlem başarıyla güncellendi.",
          recordsLoadError: "Kayıt listesi yüklenemedi",
          operationSuccess: "İşlem başarıyla gerçekleştirildi!",
          operationError: "İşlem gerçekleştirilemedi. Aynı isimde kayıt olup olmadığını veya tüm alanların doğru doldurulduğunu kontrol edin",
          operationDeleteError: "İşlem gerçekleştirilemedi",
          imageUploadProgress: "Resim %{{progress}} yüklendi...",
          imageUploadError: "Resim yüklenirken bir sorun oluştu.",
          companyOperationError: "İşlem gerçekleştirilemedi. Aynı ada sahip bir şirketin zaten mevcut olup olmadığını veya tüm alanların doğru doldurulduğunu kontrol edin",
          planOperationError: "İşlem gerçekleştirilemedi. Aynı ada sahip bir planın zaten mevcut olup olmadığını veya tüm alanların doğru doldurulduğunu kontrol edin",
          helpOperationError: "İşlem gerçekleştirilemedi. Aynı ada sahip bir yardımın zaten mevcut olup olmadığını veya tüm alanların doğru doldurulduğunu kontrol edin",
        },
        timezone: {
          companyTimezone: {
            title: "Şirket Saat Dilimi",
            selectLabel: "Saat dilimi seç",
            customHelperText: "Bu şirket için özel saat dilimi",
            inheritedHelperText: "Sistem varsayılan saat dilimini kullanıyor",
          },
          defaultTimezone: {
            title: "Sistem Varsayılan Saat Dilimi",
            selectLabel: "Varsayılan saat dilimi seç",
            helperText: "Özel saat dilimi olmayan tüm şirketler için bu saat dilimi varsayılan olarak kullanılacak",
          },
          buttons: {
            save: "Kaydet",
            useDefault: "Varsayılanı Kullan",
            saveDefault: "Varsayılan Kaydet",
            cancel: "İptal",
            reset: "Sıfırla",
          },
          preview: {
            title: "Saat Dilimi Önizlemesi",
            currentTime: "Mevcut saat",
            defaultTime: "Varsayılan saat",
            previewTime: "Önizleme saati:",
          },
          status: {
            custom: "Özel",
            inherited: "Devralınan",
            fetchingTimezones: "Saat dilimleri alınıyor...",
            savingChanges: "Değişiklikler kaydediliyor...",
            updatingPreview: "Önizleme güncelleniyor...",
          },
          errors: {
            fetchAvailableTimezones: "Mevcut saat dilimleri alınamadı",
            fetchCompanyTimezone: "Şirket saat dilimi alınamadı",
            updateDefaultTimezone: "Varsayılan saat dilimi güncellenemedi",
            updateCompanyTimezone: "Şirket saat dilimi güncellenemedi",
          },
          success: {
            defaultTimezoneUpdated: "Varsayılan saat dilimi başarıyla güncellendi",
            companyTimezoneUpdated: "Şirket saat dilimi başarıyla güncellendi",
            companyTimezoneReset: "Şirket saat dilimi başarıyla sıfırlandı",
          },
        },
        whitelabel: {
          primaryColorLight: "Açık Mod Ana Rengi",
          primaryColorDark: "Koyu Mod Ana Rengi",
          systemName: "Sistem Adı",
          lightLogo: "Açık Logo",
          darkLogo: "Koyu Logo",
          favicon: "Favicon",
        },
        chatBotType: {
          text: "Metin",
        },
        modals: {
          deleteTitle: "Kaydı Sil",
          deleteConfirmation: "Bu kaydı gerçekten silmek istiyor musunuz?",
        },
        managers: {
          common: {
            yes: "Evet",
            no: "Hayır",
          },
          companies: {
            recurrence: "Tekrarlama",
          },
          plans: {
            queues: "Kuyruklar",
            value: "Değer",
            whatsapp: "WhatsApp",
            facebook: "Facebook",
            instagram: "Instagram",
            internalChat: "İç Sohbet",
            externalAPI: "Harici API",
            kanban: "Kanban",
            talkAI: "Promptlar",
            integrations: "Entegrasyonlar",
          },
          helps: {
            title: "Başlık",
            video: "Video",
          },
        },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Atanan Kişi:",
          dialogRatingTitle:
            "Müşteri için bir hizmet değerlendirmesi bırakmak ister misiniz?",
          dialogClosingTitle: "Müşteriyle görüşme sonlandırılıyor!",
          dialogRatingCancel: "Veda Mesajı ile Çöz",
          dialogRatingSuccess: "Çöz ve Değerlendirme Gönder",
          dialogRatingWithoutFarewellMsg: "Veda Mesajı Olmadan Çöz",
          ratingTitle: "Bir değerlendirme menüsü seçin",
          notMessage: "Mesaj seçilmedi",
          amount: "Maliyet değeri",
          buttons: {
            return: "Geri Dön",
            resolve: "Çöz",
            reopen: "Yeniden Aç",
            accept: "Kabul Et",
            rating: "Değerlendirme Gönder",
            enableIntegration: "Entegrasyonu Etkinleştir",
            disableIntegration: "Entegrasyonu Devre Dışı Bırak",
            logTicket: "Ticket Logları",
            requiredTag: "Ticketı kapatmadan önce bir etiket atamanız gerekiyor.",
          },
        },
      },
      messagesInput: {
        placeholderPrivateMessage:
          "Bir mesaj yazın veya hızlı yanıtlar için / tuşuna basın",
        placeholderOpen:
          "Bir mesaj yazın veya hızlı yanıtlar için / tuşuna basın",
        placeholderClosed:
          "Mesaj göndermek için bu ticketı yeniden açın veya kabul edin.",
        signMessage: "İmza",
        privateMessage: "Özel Mesaj",
      },
      contactDrawer: {
        header: "Kişi Bilgileri",
        buttons: {
          edit: "Kişiyi Düzenle",
          block: "Engelle",
          unblock: "Engellemeyi Kaldır",
          blockContact: "Kişiyi Engelle",
          unblockContact: "Kişinin Engelini Kaldır",
        },
        toasts: {
          contactBlocked: "Kişi engellendi",
          contactUnblocked: "Kişinin engeli kaldırıldı",
        },
        confirmationModal: {
          blockMessage: "Bu kişiyi gerçekten engellemek istiyor musunuz? Artık ondan mesaj almayacaksınız.",
          unblockMessage: "Bu kişinin engelini gerçekten kaldırmak istiyor musunuz? Ondan mesaj almaya başlayabileceksiniz.",
        },
        extraInfo: "Diğer Bilgiler",
      },
      messageVariablesPicker: {
        label: "Mevcut Değişkenler",
        vars: {
          contactFirstName: "İlk Ad",
          contactName: "Ad",
          user: "Katılımcı",
          greeting: "Selam",
          protocolNumber: "Protokol Numarası",
          date: "Tarih",
          hour: "Saat",
          ticket_id: "Çağrı Numarası",
          queue: "Sektör",
          connection: "Bağlantı",
        },
      },
      ticketOptionsMenu: {
        schedule: "Randevu",
        delete: "Sil",
        transfer: "Transfer Et",
        registerAppointment: "Kişi Notları",
        resolveWithNoFarewell: "Veda etmeden sonlandır",
        acceptAudioMessage: "Kişiden sesli mesajları kabul et?",
        appointmentsModal: {
          title: "Ticket Notları",
          textarea: "Not",
          placeholder: "Kaydetmek istediğiniz bilgiyi buraya girin",
        },
        confirmationModal: {
          title: "Kişinin ticketını sil",
          titleFrom: "kişisinden",
          message:
            "Dikkat! Ticket ile ilgili tüm mesajlar kaybolacaktır.",
        },
        buttons: {
          delete: "Sil",
          cancel: "İptal",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Tamam",
          cancel: "İptal",
        },
      },
      messageInput: {
        tooltip: {
          signature: "İmza Etkinleştir/Devre Dışı Bırak",
          privateMessage: "Özel Mesaj Etkinleştir/Devre Dışı Bırak",
          meet: "Video konferans bağlantısı gönder",
        },
        type: {
          imageVideo: "Fotoğraflar ve Videolar",
          cam: "Kamera",
          contact: "Kişi",
          meet: "Görüntülü Arama",
        },
      },
      messageOptionsMenu: {
        delete: "Sil",
        reply: "Yanıtla",
        edit: "Düzenle",
        forward: "İlet",
        toForward: "İlet",
        talkTo: "Konuş",
        react: "Tepki Ver",
        confirmationModal: {
          title: "Mesajı sil?",
          message: "Bu işlem geri alınamaz.",
        },
      },
      invoices: {
        table: {
          invoices: "Faturalar",
          details: "Detaylar",
          users: "Kullanıcılar",
          connections: "Bağlantılar",
          queue: "Sıra",
          value: "Değer",
          expirationDate: "Vade Tarihi",
          action: "Eylem",
        },
      },
      userStatus: {
        online: "Çevrimiçi",
        offline: "Çevrimdışı",
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "En az bir varsayılan WhatsApp olmalıdır.",
        ERR_NO_DEF_WAPP_FOUND:
          "Varsayılan WhatsApp bulunamadı. Bağlantılar sayfasını kontrol edin.",
        ERR_WAPP_NOT_INITIALIZED:
          "Bu WhatsApp oturumu başlatılmadı. Bağlantılar sayfasını kontrol edin.",
        ERR_WAPP_CHECK_CONTACT:
          "WhatsApp kişisi doğrulanamadı. Bağlantılar sayfasını kontrol edin",
        ERR_WAPP_INVALID_CONTACT: "Bu geçerli bir WhatsApp numarası değil.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "WhatsApp'tan medya indirilemedi. Bağlantılar sayfasını kontrol edin.",
        ERR_INVALID_CREDENTIALS:
          "Kimlik doğrulama hatası. Lütfen tekrar deneyin.",
        ERR_SENDING_WAPP_MSG:
          "WhatsApp mesajı gönderilirken hata oluştu. Bağlantılar sayfasını kontrol edin.",
        ERR_DELETE_WAPP_MSG: "WhatsApp mesajı silinemedi.",
        ERR_OTHER_OPEN_TICKET: "Bu kişi için zaten açık bir ticket var.",
        ERR_TICKET_ALREADY_ACCEPTED: "Bu ticket zaten başka bir temsilci tarafından kabul edildi.",
        ERR_SESSION_EXPIRED: "Oturum süresi doldu. Lütfen giriş yapın.",
        ERR_USER_CREATION_DISABLED:
          "Kullanıcı oluşturma yönetici tarafından devre dışı bırakıldı.",
        ERR_NO_PERMISSION: "Bu kaynağa erişim izniniz yok.",
        ERR_DUPLICATED_CONTACT: "Bu numaraya sahip bir kişi zaten var.",
        ERR_NO_SETTING_FOUND: "Bu ID'ye sahip bir ayar bulunamadı.",
        ERR_NO_CONTACT_FOUND: "Bu ID'ye sahip bir kişi bulunamadı.",
        ERR_NO_TICKET_FOUND: "Bu ID'ye sahip bir ticket bulunamadı.",
        ERR_NO_USER_FOUND: "Bu ID'ye sahip bir kullanıcı bulunamadı.",
        ERR_NO_WAPP_FOUND: "Bu ID'ye sahip bir WhatsApp bulunamadı.",
        ERR_CREATING_MESSAGE: "Veritabanında mesaj oluşturulurken hata oluştu.",
        ERR_CREATING_TICKET: "Veritabanında ticket oluşturulurken hata oluştu.",
        ERR_FETCH_WAPP_MSG:
          "WhatsApp'tan mesaj alınırken hata oluştu, belki çok eski.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Bu renk zaten kullanımda, başka bir renk seçin.",
        ERR_WAPP_GREETING_REQUIRED:
          "Birden fazla sıra olduğunda karşılama mesajı zorunludur.",
        ERR_OUT_OF_HOURS: "Çalışma Saatleri Dışı!",
        ERR_GENERIC_ERROR: "Bir hata oluştu!",
      },
      flowBuilderConfig: {
        title: "Akışınızı tasarlayın",
        actions: {
          import: "İçe Aktar",
          export: "Dışa Aktar",
          save: "Kaydet"
        },
        messages: {
          flowStart: "Akış başlangıcı",
          interval: "Aralık {{seconds}} sn.",
          rememberSave: "Akışınızı kaydetmeyi unutmayın!",
          flowSaved: "Akış başarıyla kaydedildi"
        },
        nodes: {
          start: "Başla",
          content: "İçerik",
          menu: "Menü",
          optionFormat: "[{{number}}] {{value}}",
          randomizer: "Rastgele",
          interval: "Aralık",
          ticket: "Ticket",
          typebot: "TypeBot",
          openai: "OpenAI",
          question: "Soru",
          image: "Resim",
          video: "Video",
          audioNode: {
            title: "Ses",
            recordedLive: "Canlı kaydedildi",
            audioSent: "Ses gönderildi",
            browserNotSupported: "tarayıcınız HTML5'i desteklemiyor"
          }
        },
        nodeDescriptions: {
          startFlow: "Bu blok akışınızın başlangıcını işaretler!"
        },
        edges: {
          edgeWithoutOnDelete: "onDelete yapılandırılmamış kenar:",
          errorDeletingEdge: "Kenar silinirken hata:",
          removeEdgeTooltip: "Bağlantıyı kaldır"
        },
        units: {
          seconds: "saniye"
        },
        validation: {
          tooShort: "Çok kısa!",
          tooLong: "Çok uzun!",
          enterName: "Bir isim girin!",
          enterMessage: "Bir mesaj girin!",
          required: "Gerekli",
          describeAiTraining: "Yapay Zeka için eğitimi açıklayın",
          invalidModel: "Geçersiz model",
          informModel: "Modeli bildirin",
          minTokens: "Minimum 10 token",
          maxTokens: "Maksimum 4096 token",
          informMaxTokens: "Maksimum token sayısını bildirin",
          minZero: "Minimum 0",
          maxOne: "Maksimum 1",
          informTemperature: "Sıcaklığı bildirin",
          informApiKey: "API Anahtarını bildirin",
          minOneMessage: "Minimum 1 mesaj",
          maxFiftyMessages: "Maksimum 50 mesaj",
          informMaxMessages: "Maksimum mesaj sayısını bildirin",
          informVoiceMode: "Ses modu için bildirin"
        },
        buttons: {
          add: "Ekle",
          save: "Kaydet",
          edit: "Düzenle"
        },
        modals: {
          condition: {
            addTitle: "Akışa koşul ekle",
            editTitle: "Koşulu düzenle",
            fieldLabel: "Koşul alanı (Sadece 1 anahtar girin)",
            validationRule: "Doğrulama kuralı",
            conditionValue: "Analiz edilecek koşul değeri"
          },
          ticket: {
            addQueueError: "Bir kuyruk ekleyin",
            addTitle: "Akışa bir kuyruk ekle",
            editTitle: "Kuyruğu düzenle",
            selectConnection: "Bir Bağlantı seçin"
          },
          randomizer: {
            addIntervalError: "Aralık değerini ekleyin",
            maxTimeError: "Maksimum süreye ulaşıldı 120 saniye",
            addTitle: "Akışa rastgele ekle",
            editTitle: "Rastgeleyi düzenle"
          },
          openai: {
            addTitle: "Akışa OpenAI/Gemini ekle",
            editTitle: "Akışın OpenAI/Gemini'sini düzenle"
          },
          question: {
            addTitle: "Akışa Soru ekle",
            editTitle: "Soruyu düzenle",
            createTitle: "Akışta Soru oluştur",
            messageLabel: "Mesaj",
            saveAnswer: "Yanıtı kaydet"
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
          text: "Metin",
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
          titleAdd: "Akışa mesaj ekle",
          titleEdit: "Akış mesajını düzenle",
          buttonAdd: "Ekle",
          buttonSave: "Kaydet",
          fields: {
            message: "Mesaj"
          },
          validation: {
            tooShort: "Çok kısa!",
            tooLong: "Çok uzun!",
            required: "Bir isim girin!",
            messageRequired: "Bir mesaj girin!"
          }
        },
        intervalModal: {
          titleAdd: "Akışa aralık ekle",
          titleEdit: "Aralığı düzenle",
          buttonAdd: "Ekle",
          buttonEdit: "Düzenle",
          fields: {
            timeInSeconds: "Saniye cinsinden süre"
          },
          validation: {
            addValue: "Aralık değeri ekleyin",
            maxTime: "Maksimum süre 120 saniyeye ulaşıldı"
          }
        },
        menuModal: {
          titleAdd: "Akışa menü ekle",
          titleEdit: "Menüyü düzenle",
          buttonAdd: "Ekle",
          buttonSave: "Kaydet",
          fields: {
            explanationMessage: "Menü açıklama mesajı",
            addOption: "Seçenek Ekle",
            typeOption: "{{number}} yazın",
            optionPlaceholder: "Seçenek yazın"
          }
        },
        singleBlockModal: {
          titleAdd: "Akışa içerik ekle",
          titleEdit: "İçeriği düzenle",
          buttonAdd: "Ekle",
          buttonSave: "Kaydet",
          elements: {
            text: "Metin",
            interval: "Aralık",
            image: "Resim",
            audio: "Ses",
            video: "Video",
            document: "Belge"
          },
          fields: {
            message: "Mesaj",
            timeInSeconds: "Saniye cinsinden süre",
            sendAsRecordedAudio: "Kayıtlı ses olarak gönder",
            noFileSelected: "Dosya seçilmedi"
          },
          buttons: {
            sendImage: "Resim gönder",
            sendAudio: "Ses gönder",
            sendVideo: "Video gönder",
            sendDocument: "Belge Gönder"
          },
          validation: {
            emptyMessageFields: "Boş mesaj alanları!",
            intervalValidation: "Aralık 0 veya 120'den büyük olamaz!",
            fileTooLarge2MB: "Dosya çok büyük! Maksimum 2MB",
            fileTooLarge5MB: "Dosya çok büyük! Maksimum 5MB",
            fileTooLarge20MB: "Dosya çok büyük! Maksimum 20MB",
            fileTooLarge15MB: "Dosya çok büyük! Maksimum 15MB",
            deleteEmptyCards: "Boş kartları silin veya bekleyen dosyaları gönderin.",
            browserNotSupported: "tarayıcınız HTML5'i desteklemiyor",
            onlyMp4Videos: "DİKKAT! Sadece MP4 videolar!"
          },
          messages: {
            contentAddedSuccess: "İçerik başarıyla eklendi!",
            uploadingFiles: "Dosyalar yükleniyor ve içerik oluşturuluyor...",
            variables: "Değişkenler"
          }
        },
        randomizerModal: {
          titleAdd: "Akışa rastgele ekle",
          titleEdit: "Rastgeleyi düzenle",
          buttonAdd: "Ekle",
          buttonEdit: "Düzenle"
        },
        ticketModal: {
          titleAdd: "Akışa kuyruk ekle",
          titleEdit: "Kuyruğu düzenle",
          buttonAdd: "Ekle",
          buttonEdit: "Düzenle",
          fields: {
            selectConnection: "Bir Bağlantı Seçin"
          },
          validation: {
            addQueue: "Bir kuyruk ekle"
          }
        },
        typebotModal: {
          titleAdd: "Akışa Typebot ekle",
          titleEdit: "Akış Typebot'unu düzenle",
          titleEditFlow: "Akışın Typebot'unu düzenle",
          buttonAdd: "Ekle",
          buttonSave: "Kaydet"
        },
        openaiModal: {
          titleAdd: "Akışa OpenAI/Gemini ekle",
          titleEdit: "Akışın OpenAI/Gemini'sini düzenle",
          buttonAdd: "Ekle",
          buttonSave: "Kaydet",
          models: {
            gpt35: "GPT 3.5 Turbo",
            gpt4o: "GPT 4o",
            gemini15flash: "Gemini 1.5 Flash",
            gemini15pro: "Gemini 1.5 Pro",
            gemini20flash: "Gemini 2.0 Flash",
            gemini20pro: "Gemini 2.0 Pro"
          },
          voices: {
            text: "Metin",
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
            tooShort: "Çok kısa!",
            tooLong: "Çok uzun!",
            required: "Gerekli",
            promptRequired: "Yapay Zeka için eğitimi açıklayın",
            invalidModel: "Geçersiz model",
            minTokens: "Minimum 10 token",
            maxTokens: "Maksimum 4096 token",
            tokensRequired: "Maksimum token sayısını bildirin",
            temperatureRequired: "Sıcaklığı bildirin",
            temperatureMin: "Minimum 0",
            temperatureMax: "Maksimum 1",
            apiKeyRequired: "API Anahtarını bildirin",
            messagesMin: "Minimum 1 mesaj",
            messagesMax: "Maksimum 50 mesaj",
            messagesRequired: "Maksimum mesaj sayısını bildirin",
            voiceRequired: "Ses modunu bildirin"
          }
        },
        questionModal: {
          titleAdd: "Akışa Soru ekle",
          titleEdit: "Akışın Sorusunu düzenle",
          titleCreate: "Akışta Soru oluştur",
          buttonAdd: "Ekle",
          buttonSave: "Kaydet",
          fields: {
            message: "Mesaj",
            saveAnswer: "Cevabı kaydet"
          }
        }
      },
      moments: {
        title: "Hizmet Paneli",
        pending: "Bekleyen",
        attendances: "Katılımlar: ",
        noQueue: "KUYRUK YOK",
        accessTicket: "Bilete Erişim"
      },
      flowBuilderNodes: {
        message: "Mesaj",
        condition: "Koşul",
        image: "Resim"
      },
      subscription: {
        title: "Abonelik",
        form: {
          licenseLabel: "Lisans Süresi",
          licenseExpiresIn: "Lisansınız {{days}} gün içinde sona eriyor!",
          licenseExpiresToday: "Lisansınız bugün sona eriyor!",
          billingEmailLabel: "Fatura e-postası",
          subscribeButton: "Şimdi Abone Ol!"
        },
        checkout: {
          form: {
            fullName: "Ad soyad*",
            fullNameRequired: "Ad soyad zorunludur",
            lastName: "Soyad*",
            lastNameRequired: "Soyad zorunludur",
            address: "Adres*",
            addressRequired: "Adres zorunludur",
            city: "Şehir*",
            cityRequired: "Şehir zorunludur",
            state: "Eyalet*",
            stateRequired: "Eyalet zorunludur",
            document: "Vergi No*",
            documentRequired: "Vergi numarası zorunludur",
            documentInvalid: "Geçersiz vergi numarası formatı",
            country: "Ülke*",
            countryRequired: "Ülke zorunludur",
            useAddressForPayment: "Ödeme detayları için bu adresi kullan",
            nameOnCard: "Karttaki ad*",
            nameOnCardRequired: "Karttaki ad zorunludur",
            cardNumber: "Kart numarası*",
            cardNumberRequired: "Kart numarası zorunludur",
            cardNumberInvalid: "Kart numarası geçersiz (ör. 4111111111111)",
            expiryDate: "Son kullanma tarihi*",
            expiryDateRequired: "Son kullanma tarihi zorunludur",
            expiryDateInvalid: "Son kullanma tarihi geçersiz",
            cvv: "CVV*",
            cvvRequired: "CVV zorunludur",
            cvvInvalid: "CVV geçersiz (ör. 357)"
          }
        }
      },
      ticketsResponsive: {
        actions: {
          selectTicket: "Bilet Seç",
          transferTicket: "Bilet Aktar",
          spyConversation: "Konuşmayı Gözetle"
        },
        tabs: {
          ticket: "Bilet",
          assistance: "Yardım"
        },
        search: {
          searchInMessagesTooltip: "Mesaj içeriğinde de arama yapmak için işaretle (daha yavaş)"
        },
        filter: {
          all: "Tümü"
        },
        sort: {
          ascending: "Artan",
          descending: "Azalan"
        },
        dialog: {
          spyingConversation: "Konuşma gözetleniyor",
          loadingMessages: "Mesajlar yükleniyor..."
        },
        status: {
          noQueue: "KUYRUK YOK"
        }
      },
      messagesResponsive: {
        types: {
          location: "Konum",
          contact: "Kişi"
        },
        actions: {
          download: "İndir",
          dropFileHere: "Dosyayı buraya bırak"
        },
        status: {
          forwarded: "Yönlendirildi",
          deletedByContact: "🚫 Bu mesaj kişi tarafından silindi",
          deletedMessage: "🚫 _Silinen mesaj_",
          deletedByMe: "🚫 Bu mesaj silindi",
          edited: "Düzenlendi"
        },
        reactions: {
          youReacted: "Tepki verdin...",
          contactReacted: " tepki verdi... "
        },
        timestamp: {
          today: "BUGÜN"
        },
        placeholder: {
          sayHello: "Yeni kişinize merhaba deyin!"
        },
        ads: {
          adClick: "Reklam Tıklaması",
          defaultUserMessage: "Merhaba! İlgiliyim ve daha fazla bilgi almak istiyorum, lütfen."
        },
        warnings: {
          facebookPolicy: "Facebook politikalarına göre, mesaj aldıktan sonra yanıtlamak için 24 saatiniz var."
        }
      },
      messageInputResponsive: {
        type: {
          document: "Belge",
          buttons: "Düğmeler"
        },
        tooltip: {
          toggleSignature: "İmzayı Etkinleştir/Devre Dışı Bırak",
          toggleComments: "Yorumları Etkinleştir/Devre Dışı Bırak"
        },
        privateMessage: {
          suffix: "Özel Mesaj"
        }
      },
      tagsResponsive: {
        validation: {
          tooShort: "Etiket çok kısa!"
        },
        placeholder: "Etiketler"
      },
      showTicketOpenModal: {
        buttons: {
          close: "Kapat"
        }
      },
      reactions: {
        successMessage: "Reaksiyon başarıyla gönderildi"
      },
      vcardPreview: {
        chatButton: "Sohbet"
      },
      locationPreview: {
        viewButton: "Görüntüle"
      },
      contactNotes: {
        addedSuccess: "Not başarıyla eklendi!",
        deletedSuccess: "Not başarıyla silindi!",
        deleteTitle: "Kaydı Sil",
        deleteConfirmation: "Bu kaydı gerçekten silmek istiyor musunuz?",
        cancelButton: "İptal",
        saveButton: "Kaydet"
      },
      validationResponsive: {
        ratingRequired: "Değerlendirme gerekli"
      }
    },
  },
};

export { messages };