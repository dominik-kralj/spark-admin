// Relative: the Playwright specs import this file without the @/ alias.
import { plural } from '../lib/plural'

const appName = 'SPARK Admin'

/**
 * Every user-visible string in the app, including aria-labels, validation
 * messages and toasts: the default language, and the shape en.ts must match.
 * Components read it through useStrings(); screens add their section as they are built.
 */
export const hr = {
    app: {
        name: appName,
        brand: 'SPARK',
        product: 'Admin',
        documentTitle: (page: string) => `${page} – ${appName}`,
    },
    login: {
        title: 'Prijava',
        username: 'Korisničko ime',
        password: 'Lozinka',
        showPassword: 'Prikaži lozinku',
        submit: 'Prijava',
        usernameRequired: 'Upišite korisničko ime.',
        passwordRequired: 'Upišite lozinku.',
        errorTitle: 'Prijava nije uspjela.',
        sessionExpired: 'Sesija je istekla. Prijavite se ponovno.',
        errors: {
            unauthorized:
                'Korisničko ime ili lozinka nisu točni. Provjerite unos i pokušajte ponovno.',
            rateLimited: 'Previše pokušaja prijave. Pričekajte minutu pa pokušajte ponovno.',
            network: 'Poslužitelj nije dostupan. Provjerite internetsku vezu i pokušajte ponovno.',
            server: 'Došlo je do pogreške na poslužitelju. Pokušajte ponovno za nekoliko minuta.',
        },
    },
    shell: {
        signOut: 'Odjava',
        skipToContent: 'Preskoči na sadržaj',
        homeLink: `${appName}, početna stranica`,
        mainNav: 'Glavna navigacija',
        menu: 'Izbornik',
        openMenu: 'Otvori izbornik',
        closeMenu: 'Zatvori izbornik',
        expandMenu: 'Proširi izbornik',
        collapseMenu: 'Sažmi izbornik',
        placeholder: 'Sadržaj stranice',
    },
    nav: {
        tickets: 'Karte',
        dailyTickets: 'DPK',
        zones: 'Zone',
        privilegedOwners: 'Povlašteni korisnici',
        inspectors: 'Kontrolori',
        reports: 'Izvještaji',
        citySettings: 'Postavke grada',
        adminUsers: 'Korisnici',
    },
    tickets: {
        listLabel: 'Plaćene karte',
        columns: {
            createdAt: 'Vrijeme',
            plate: 'Registracija',
            zone: 'Zona',
            duration: 'Trajanje',
            amount: 'Iznos',
            validUntil: 'Vrijedi do',
            payment: 'Plaćanje',
            fiscal: 'Fiskalizacija',
        },
        moreInDetail: 'Vrijeme kupnje, trajanje i iznos nalaze se u detaljima karte.',
        loading: 'Učitavanje karata…',
        errorTitle: 'Karte nije moguće učitati',
        empty: {
            title: 'Još nema plaćenih karata',
            description: 'Ovdje će se prikazati karte čim ih vozači plate putem WhatsAppa.',
        },
        pastEnd: {
            title: 'Ova stranica je prazna',
            description: 'Popis karata ima manje stranica. Vratite se na prvu stranicu.',
            action: 'Na prvu stranicu',
        },
        filters: {
            label: 'Filteri karata',
            noResults: {
                title: 'Nema karata za odabrane filtere',
                description: 'Promijenite ili uklonite filtere da vidite više karata.',
            },
        },
        newTickets: {
            count: (count: number) =>
                `${String(count)} ${plural(count, { one: 'nova karta', few: 'nove karte', other: 'novih karata' })} od zadnjeg učitavanja`,
            countShort: (count: number) =>
                `${String(count)} ${plural(count, { one: 'nova karta', few: 'nove karte', other: 'novih karata' })}`,
            show: 'Prikaži nove karte',
            showShort: 'Prikaži nove',
        },
        detail: {
            title: (plate: string) => `Karta ${plate}`,
            fallbackTitle: 'Detalji karte',
            close: 'Zatvori detalje karte',
            back: 'Natrag na karte',
            ticketSection: 'Podaci o karti',
            transactionSection: 'Transakcija i fiskalizacija',
            fields: {
                plate: 'Registracija',
                zone: 'Zona',
                createdAt: 'Vrijeme kupnje',
                validUntil: 'Vrijedi do',
                duration: 'Trajanje',
                amount: 'Iznos',
                vatBase: 'Osnovica',
                vatRate: 'Stopa PDV-a',
                vatAmount: 'Iznos PDV-a',
                transactionId: 'Broj transakcije',
                jir: 'JIR',
                zki: 'ZKI',
                fiscalizedAt: 'Vrijeme fiskalizacije',
                fiscalError: 'Odgovor sustava',
            },
            copy: {
                transactionId: 'Kopiraj broj transakcije',
                jir: 'Kopiraj JIR',
                zki: 'Kopiraj ZKI',
            },
            copied: 'Kopirano',
            loading: 'Učitavanje karte…',
            errorTitle: 'Kartu nije moguće učitati',
            notFound: {
                title: 'Karta nije pronađena',
                description:
                    'Karta ne postoji ili ne pripada vašem gradu. Provjerite poveznicu ili se vratite na popis karata.',
            },
        },
    },
    dailyTickets: {
        description: 'Dnevne parkirne karte koje su izdali kontrolori.',
        listLabel: 'Dnevne parkirne karte',
        columns: {
            createdAt: 'Vrijeme',
            plate: 'Registracija',
            zone: 'Zona',
            address: 'Adresa',
            inspector: 'Kontrolor',
            amount: 'Iznos',
            fiscal: 'Fiskalizacija',
            action: 'Radnja',
        },
        moreInDetail: 'Adresa, kontrolor i iznos nalaze se u detaljima dnevne karte.',
        loading: 'Učitavanje dnevnih karata…',
        errorTitle: 'Dnevne karte nije moguće učitati',
        empty: {
            title: 'Još nema dnevnih karata',
            description: 'Ovdje će se prikazati dnevne karte čim ih kontrolori izdaju na terenu.',
        },
        pastEnd: {
            title: 'Ova stranica je prazna',
            description: 'Popis dnevnih karata ima manje stranica. Vratite se na prvu stranicu.',
            action: 'Na prvu stranicu',
        },
        filters: {
            label: 'Filteri dnevnih karata',
            noResults: {
                title: 'Nema dnevnih karata za odabrane filtere',
                description: 'Promijenite ili uklonite filtere da vidite više dnevnih karata.',
            },
        },
        fiscalize: {
            action: 'Fiskaliziraj ponovno',
            actionFor: (plate: string) => `Fiskaliziraj ponovno DPK za ${plate}`,
            confirmTitle: (plate: string) => `Fiskalizirati ponovno DPK za ${plate}?`,
            confirmDescription:
                'Račun se ponovno šalje Poreznoj upravi. Odgovor može stići tek za nekoliko sekundi.',
            done: (plate: string) => `DPK za ${plate} je fiskaliziran.`,
            failedAgain: (plate: string) => `Fiskalizacija DPK-a za ${plate} ponovno nije uspjela.`,
            failedAgainDescription:
                'Odgovor sustava nalazi se u detaljima karte. Ako se pogreška ponavlja, provjerite certifikat i postavke grada.',
            started: (plate: string) =>
                `Fiskalizacija DPK-a za ${plate} je u obradi. Status će se promijeniti kad Porezna uprava odgovori.`,
            failed: 'Fiskalizacija nije pokrenuta.',
            errors: {
                network:
                    'Poslužitelj nije odgovorio. Provjerite internetsku vezu i pokušajte ponovno.',
                notFound: 'Dnevna karta više ne postoji.',
                conflict:
                    'Stanje fiskalizacije se u međuvremenu promijenilo. Popis i detalji su osvježeni.',
                forbidden:
                    'Nemate ovlasti za fiskalizaciju. Ako mislite da biste je trebali moći pokrenuti, javite se administratoru sustava.',
                server: 'Došlo je do pogreške na poslužitelju. Pokušajte ponovno za nekoliko minuta.',
            },
        },
        detail: {
            title: (plate: string) => `Dnevna karta ${plate}`,
            fallbackTitle: 'Detalji dnevne karte',
            close: 'Zatvori detalje dnevne karte',
            back: 'Natrag na DPK',
            ticketSection: 'Podaci o dnevnoj karti',
            photosSection: (count: number) => `Fotografije vozila (${String(count)})`,
            fiscalSection: 'Fiskalizacija',
            fields: {
                plate: 'Registracija',
                zone: 'Zona',
                createdAt: 'Vrijeme izdavanja',
                amount: 'Iznos',
                address: 'Adresa',
                inspector: 'Kontrolor',
                status: 'Status',
                jir: 'JIR',
                zki: 'ZKI',
            },
            jirMissing: 'Nije dodijeljen',
            failure: {
                title: 'Fiskalizacija nije uspjela.',
                description: 'Račun nije prijavljen Poreznoj upravi.',
                response: (text: string) => `Odgovor sustava: ${text}`,
                advice: 'Pokušajte ponovno; ako ne uspije, provjerite certifikat i postavke grada.',
            },
            photos: {
                hint: 'Fotografije je snimio kontrolor pri izdavanju karte. Odaberite fotografiju za prikaz u punoj veličini.',
                hintTouch:
                    'Fotografije je snimio kontrolor pri izdavanju karte. Dodirnite fotografiju za prikaz u punoj veličini.',
                enlarge: (index: number, total: number) =>
                    `Povećaj fotografiju ${String(index)} od ${String(total)}`,
                alt: (plate: string, index: number, total: number) =>
                    `Fotografija vozila ${plate}, ${String(index)} od ${String(total)}`,
                viewerTitle: (index: number, total: number) =>
                    `Fotografija ${String(index)} od ${String(total)}`,
                closeViewer: 'Zatvori fotografiju',
                unavailable: 'Fotografija nije dostupna',
                none: 'Uz ovu kartu nema fotografija vozila.',
            },
            loading: 'Učitavanje dnevne karte…',
            errorTitle: 'Dnevnu kartu nije moguće učitati',
            notFound: {
                title: 'Dnevna karta nije pronađena',
                description:
                    'Dnevna karta ne postoji ili ne pripada vašem gradu. Provjerite poveznicu ili se vratite na popis dnevnih karata.',
            },
        },
    },
    zones: {
        add: 'Dodaj zonu',
        listLabel: 'Parkirne zone',
        columns: {
            code: 'Šifra',
            name: 'Naziv',
            price: 'Cijena',
            dailyTicketPrice: 'Dnevna karta',
            durationMinutes: 'Trajanje',
            maxExtensions: 'Najviše produljenja',
            dpkIssueDelayMinutes: 'Čekanje za DPK',
        },
        actions: 'Radnje',
        edit: 'Uredi',
        editZone: (code: string) => `Uredi zonu ${code}`,
        form: {
            intro: 'Sva su polja obavezna.',
            labels: {
                code: 'Šifra',
                name: 'Naziv',
                price: 'Cijena (EUR)',
                dailyTicketPrice: 'Cijena dnevne karte (EUR)',
                durationMinutes: 'Trajanje (min)',
                maxExtensions: 'Najviše produljenja',
                dpkIssueDelayMinutes: 'Čekanje za DPK (min)',
            },
            errors: {
                required: 'Ovo polje je obavezno.',
                tooLong: 'Upišite najviše 20 znakova.',
                notAmount: 'Upišite iznos u eurima, samo znamenke i decimalni zarez, npr. 0,70.',
                tooManyDecimals: 'Iznos može imati najviše dvije decimale, npr. 0,70.',
                tooLarge: 'Upisani broj je prevelik.',
                notWholeNumber: 'Upišite cijeli broj, samo znamenke.',
                notPositive: 'Upišite broj veći od 0.',
            },
            duplicate: {
                code: 'Zona s ovom šifrom već postoji. Upišite drugu šifru.',
                name: 'Zona s ovim nazivom već postoji. Upišite drugi naziv.',
            },
            notSaved: 'Zona nije spremljena. Ispravite označena polja.',
            saved: (code: string) => `Zona ${code} je spremljena`,
        },
        delete: {
            button: 'Obriši',
            deleteZone: (code: string) => `Obriši zonu ${code}`,
            formButton: 'Obriši zonu',
            title: (code: string) => `Obrisati zonu ${code}?`,
            description: (code: string, name: string) =>
                `Zona ${code} (${name}) trajno će se obrisati. Ovu radnju nije moguće poništiti.`,
            confirm: 'Obriši zonu',
            deleted: (code: string) => `Zona ${code} je obrisana`,
            failed: 'Zona nije obrisana.',
            errors: {
                network:
                    'Poslužitelj nije odgovorio. Provjerite internetsku vezu i pokušajte ponovno.',
                forbidden: 'Nemate ovlasti za brisanje zona.',
                server: 'Došlo je do pogreške na poslužitelju. Pokušajte ponovno za nekoliko minuta.',
            },
        },
        loading: 'Učitavanje zona…',
        empty: {
            title: 'Još nema zona',
            description:
                'Dodajte prvu zonu kako bi vozači mogli plaćati parkiranje, a kontrolori izdavati dnevne karte.',
        },
        errorTitle: 'Zone nije moguće učitati',
        total: (count: number) =>
            `Ukupno ${String(count)} ${plural(count, { one: 'zona', few: 'zone', other: 'zona' })}`,
    },
    privilegedOwners: {
        description: 'Vozila koja parkiraju bez naplate, na primjer stanari.',
        add: 'Dodaj korisnika',
        addLong: 'Dodaj povlaštenog korisnika',
        listLabel: 'Povlašteni korisnici',
        search: {
            label: 'Registracija',
            placeholder: 'npr. ZG1234AB',
        },
        validity: {
            label: 'Valjanost',
            all: 'Svi',
            valid: 'Važeći',
            expired: 'Istekli',
            withCount: (label: string, count: number) => `${label} (${String(count)})`,
        },
        columns: {
            plate: 'Registracija',
            validUntil: 'Vrijedi do',
            status: 'Status',
            ownerName: 'Vlasnik',
            address: 'Adresa',
        },
        status: {
            valid: 'Važeće',
            expired: 'Isteklo',
        },
        actions: 'Radnje',
        edit: 'Uredi',
        editOwner: (plate: string) => `Uredi korisnika ${plate}`,
        shown: (shown: number, total: number) => `Prikazano ${String(shown)} od ${String(total)}`,
        loading: 'Učitavanje povlaštenih korisnika…',
        errorTitle: 'Povlaštene korisnike nije moguće učitati',
        empty: {
            title: 'Još nema povlaštenih korisnika',
            description: 'Dodajte vozila koja parkiraju bez naplate, na primjer vozila stanara.',
        },
        noMatch: {
            title: 'Nema korisnika s tom registracijom',
            description: 'Provjerite unos ili dodajte vozilo kao novog povlaštenog korisnika.',
            clear: 'Očisti pretragu',
        },
        emptyTab: {
            valid: {
                title: 'Nema važećih korisnika',
                description: 'Povlaštenje je isteklo svim upisanim vozilima.',
            },
            expired: {
                title: 'Nema isteklih korisnika',
                description: 'Povlaštenje vrijedi za sva upisana vozila.',
            },
        },
        form: {
            intro: 'Sva su polja obavezna.',
            labels: {
                plate: 'Registracija',
                validUntil: 'Vrijedi do',
                ownerName: 'Ime i prezime vlasnika',
                street: 'Adresa',
                houseNo: 'Kućni broj',
                zipCode: 'Poštanski broj',
                city: 'Mjesto',
            },
            plateHelp: 'Upišite kako želite, npr. zg 1234-ab. Sprema se kao ZG1234AB.',
            dateHelp: 'Oblik: DD.MM.GGGG',
            expired: (date: string) => `Isteklo ${date}.`,
            expiredNote:
                'Vozilo se trenutačno naplaćuje kao i svako drugo. Upišite novi datum da ponovno vrijedi.',
            notSaved: 'Korisnik nije spremljen. Ispravite označena polja.',
            saved: (plate: string) => `Korisnik ${plate} je spremljen`,
        },
        delete: {
            deleteOwner: (plate: string) => `Obriši korisnika ${plate}`,
            formButton: 'Obriši korisnika',
            title: (plate: string) => `Obrisati korisnika ${plate}?`,
            description: (plate: string, ownerName: string) =>
                `Vozilo ${plate} (${ownerName}) više neće parkirati bez naplate. Ovu radnju nije moguće poništiti.`,
            confirm: 'Obriši korisnika',
            deleted: (plate: string) => `Korisnik ${plate} je obrisan`,
            failed: 'Korisnik nije obrisan.',
            errors: {
                network:
                    'Poslužitelj nije odgovorio. Provjerite internetsku vezu i pokušajte ponovno.',
                forbidden: 'Nemate ovlasti za brisanje povlaštenih korisnika.',
                server: 'Došlo je do pogreške na poslužitelju. Pokušajte ponovno za nekoliko minuta.',
            },
        },
    },
    inspectors: {
        description:
            'Kontrolori se u aplikaciju Inspector prijavljuju PIN-om. Neaktivni se ne mogu prijaviti.',
        add: 'Dodaj kontrolora',
        listLabel: 'Kontrolori',
        columns: {
            name: 'Ime',
            surname: 'Prezime',
            oib: 'OIB',
            status: 'Status',
        },
        status: {
            active: 'Aktivan',
            inactive: 'Neaktivan',
        },
        actions: 'Radnje',
        edit: 'Uredi',
        editInspector: (name: string) => `Uredi kontrolora ${name}`,
        loading: 'Učitavanje kontrolora…',
        errorTitle: 'Kontrolore nije moguće učitati',
        empty: {
            title: 'Još nema kontrolora',
            description:
                'Dodajte kontrolora kako bi se mogao prijaviti u aplikaciju Inspector i izdavati dnevne karte.',
        },
        total: (count: number, active: number) =>
            `Ukupno ${String(count)} ${plural(count, { one: 'kontrolor', few: 'kontrolora', other: 'kontrolora' })}, ${String(active)} ${plural(active, { one: 'aktivan', few: 'aktivna', other: 'aktivnih' })}`,
        form: {
            intro: 'Sva su polja obavezna.',
            labels: {
                name: 'Ime',
                surname: 'Prezime',
                oib: 'OIB',
                pin: 'PIN',
                isActive: 'Aktivan',
            },
            pinHelp: 'Do 4 znamenke. Kontrolor se njime prijavljuje u aplikaciju Inspector.',
            pinLoadError: 'PIN nije moguće učitati',
            showPin: 'Prikaži PIN',
            activeHelp: 'Aktivan kontrolor može se prijaviti i izdavati dnevne karte.',
            yes: 'Da',
            no: 'Ne',
            duplicateOib: 'Kontrolor s ovim OIB-om već postoji. Provjerite upisani OIB.',
            notSaved: 'Kontrolor nije spremljen. Ispravite označena polja.',
            saved: (name: string) => `Kontrolor ${name} je spremljen`,
        },
        delete: {
            button: 'Obriši',
            deleteInspector: (name: string) => `Obriši kontrolora ${name}`,
            formButton: 'Obriši kontrolora',
            onlyDeactivate: (count: number) =>
                `Izdao je ${String(count)} ${plural(count, { one: 'kartu', few: 'karte', other: 'karata' })}, pa ga se može samo deaktivirati.`,
            title: (name: string) => `Obrisati kontrolora ${name}?`,
            description: (name: string) =>
                `${name} trajno će se obrisati i više se neće moći prijaviti u aplikaciju Inspector. Ovu radnju nije moguće poništiti.`,
            confirm: 'Obriši kontrolora',
            deleted: (name: string) => `Kontrolor ${name} je obrisan`,
            failed: 'Kontrolor nije obrisan.',
            errors: {
                network:
                    'Poslužitelj nije odgovorio. Provjerite internetsku vezu i pokušajte ponovno.',
                forbidden: 'Nemate ovlasti za brisanje kontrolora.',
                conflict:
                    'Kontrolor je izdao karte ili zabilježio vozila, pa ga se ne može obrisati. Možete ga deaktivirati.',
                server: 'Došlo je do pogreške na poslužitelju. Pokušajte ponovno za nekoliko minuta.',
            },
        },
        deactivate: {
            title: (name: string) => `Deaktivirati kontrolora ${name}?`,
            description: (name: string) =>
                `${name} više se neće moći prijaviti u aplikaciju Inspector. Karte koje je izdao ostaju spremljene. Možete ga ponovno aktivirati kad god želite.`,
            confirm: 'Deaktiviraj',
        },
    },
    citySettings: {
        intro: 'Sva su polja obavezna. Podaci se ispisuju na računima i šalju pri fiskalizaciji.',
        sections: {
            city: 'Podaci o gradu',
            fiscalization: 'Fiskalizacija',
        },
        labels: {
            name: 'Naziv',
            oib: 'OIB',
            street: 'Adresa',
            houseNo: 'Kućni broj',
            zipCode: 'Poštanski broj',
            city: 'Mjesto',
            iban: 'IBAN',
            premisesCode: 'Oznaka poslovnog prostora',
            cashRegisterCode: 'Oznaka naplatnog uređaja',
            vatRate: 'Stopa PDV-a (%)',
        },
        oibHelp: '11 znamenki',
        ibanHelp: 'Počinje s HR i ima 21 znak. Razmaci se uklanjaju pri spremanju.',
        validation: {
            cashRegisterInvalid: 'Upišite samo znamenke, bez nule na početku.',
            vatRateInvalid: 'Upišite postotak od 0 do 100, s najviše dvije decimale.',
        },
        save: 'Spremi promjene',
        saved: 'Postavke grada su spremljene',
        savedDescription: 'Promjene vrijede za sve nove račune.',
        notSaved: 'Postavke nisu spremljene',
        errorSummary: (count: number) =>
            `Postavke nisu spremljene. Ispravite ${String(count)} ${plural(count, { one: 'polje', few: 'polja', other: 'polja' })}:`,
        loading: 'Učitavanje postavki grada…',
        errorTitle: 'Postavke grada nije moguće učitati',
    },
    forms: {
        close: 'Zatvori obrazac',
        cancel: 'Odustani',
        save: 'Spremi',
        discard: {
            title: 'Odbaciti nespremljene promjene?',
            description: 'Promjene nisu spremljene. Ako sada izađete, izgubit ćete ih.',
            confirm: 'Odbaci promjene',
            keepEditing: 'Nastavi uređivati',
        },
        datePicker: {
            locale: 'hr-HR',
            open: (field: string) => `Otvori kalendar: ${field}`,
            close: (field: string) => `Zatvori kalendar: ${field}`,
            calendar: 'Kalendar',
            selected: (date: string) => `Odabrani datum: ${date}`,
            previous: {
                day: 'Prethodni mjesec',
                month: 'Prethodna godina',
                year: 'Prethodno desetljeće',
            },
            next: { day: 'Sljedeći mjesec', month: 'Sljedeća godina', year: 'Sljedeće desetljeće' },
            show: { day: 'Prikaži dane', month: 'Prikaži mjesece', year: 'Prikaži godine' },
        },
        validation: {
            required: 'Ovo polje je obavezno.',
            plateInvalid:
                'Upišite registraciju u obliku ZG 1234-AB: dva slova, tri ili četiri znamenke te jedno ili dva slova (bez Q, W, X i Y).',
            oibInvalid: 'OIB mora imati točno 11 znamenki.',
            pinInvalid: 'PIN može imati najviše 4 znamenke.',
            ibanInvalid: 'IBAN mora početi s HR i imati 21 znak.',
            dateFormat: 'Upišite datum u obliku DD.MM.GGGG, npr. 31.12.2026.',
            dateInvalid: 'Taj datum ne postoji. Provjerite dan i mjesec.',
            dateRangeOrder: 'Datum do ne može biti prije datuma od.',
        },
        serverFieldErrors: {
            invalid: 'Poslužitelj nije prihvatio ovu vrijednost. Provjerite unos.',
            duplicate: 'Ova vrijednost već postoji. Upišite drugu.',
        },
        tooLong: (maxLength: number) => `Upišite najviše ${String(maxLength)} znakova.`,
        saveFailed: 'Promjene nisu spremljene.',
        errors: {
            network:
                'Poslužitelj nije odgovorio. Vaš je unos ostao u obrascu. Provjerite internetsku vezu i pokušajte ponovno.',
            validation: 'Poslužitelj nije prihvatio unos. Provjerite polja i pokušajte ponovno.',
            forbidden:
                'Nemate ovlasti za ovu promjenu. Ako mislite da biste je trebali moći napraviti, javite se administratoru sustava.',
            notFound: 'Zapis više ne postoji. Možda ga je netko u međuvremenu obrisao.',
            conflict:
                'Zapis je u međuvremenu promijenjen. Zatvorite obrazac, otvorite ga ponovno i ponovite izmjenu.',
            server: 'Došlo je do pogreške na poslužitelju. Vaš je unos ostao u obrascu. Pokušajte ponovno za nekoliko minuta.',
        },
    },
    ticketFilters: {
        plate: 'Registracija',
        platePlaceholder: 'npr. ZG1234AB',
        clearPlate: 'Obriši registraciju',
        from: 'Datum od',
        to: 'Datum do',
        zone: 'Zona',
        allZones: 'Sve zone',
        fiscal: 'Fiskalizacija',
        allStatuses: 'Svi statusi',
        search: 'Pretraži',
        notApplied: 'Filteri nisu primijenjeni.',
        clear: 'Očisti filtere',
        clearAll: 'Očisti sve',
        open: 'Filteri',
        openWithCount: (count: number) =>
            `Filteri, ${String(count)} ${plural(count, { one: 'aktivan', few: 'aktivna', other: 'aktivnih' })}`,
        drawerTitle: 'Filteri',
        close: 'Zatvori filtere',
        apply: 'Prikaži rezultate',
        tags: {
            range: (from: string, to: string) => `Razdoblje: ${from} – ${to}`,
            rangeFrom: (from: string) => `Razdoblje: od ${from}`,
            rangeTo: (to: string) => `Razdoblje: do ${to}`,
            zone: (code: string) => `Zona: ${code}`,
            fiscal: (status: string) => `Fiskalizacija: ${status}`,
        },
        remove: (tag: string) => `Ukloni filter ${tag}`,
    },
    details: {
        open: 'Detalji',
        close: 'Zatvori',
        missing: 'Nema podatka',
    },
    processingStatus: {
        payment: {
            pending: 'Na čekanju',
            processing: 'U obradi',
            done: 'Plaćeno',
            failed: 'Neuspjelo',
        },
        fiscal: {
            pending: 'Na čekanju',
            processing: 'U obradi',
            done: 'Fiskalizirano',
            failed: 'Neuspjelo',
        },
    },
    pagination: {
        shown: (from: number, to: number, total: number) =>
            `Prikazano ${String(from)}–${String(to)} od ${String(total)}`,
        shownShort: (from: number, to: number, total: number) =>
            `${String(from)}–${String(to)} od ${String(total)}`,
        tableLabel: 'Stranice tablice',
        listLabel: 'Stranice popisa',
        previous: 'Prethodna stranica',
        next: 'Sljedeća stranica',
        page: (page: number) => `Stranica ${String(page)}`,
        pageOfTotal: (page: number, total: number) =>
            `Stranica ${String(page)} od ${String(total)}`,
    },
    notifications: {
        close: 'Zatvori obavijest',
    },
    listStates: {
        retry: 'Pokušaj ponovno',
        errors: {
            network:
                'Provjerite internetsku vezu i pokušajte ponovno. Ako se pogreška ponavlja, javite se administratoru sustava.',
            forbidden:
                'Nemate ovlasti za pregled ovih podataka. Ako mislite da biste ih trebali vidjeti, javite se administratoru sustava.',
            server: 'Došlo je do pogreške na poslužitelju. Pokušajte ponovno za nekoliko minuta. Ako se pogreška ponavlja, javite se administratoru sustava.',
        },
    },
    errorPage: {
        title: 'Nešto je pošlo po zlu',
        description:
            'Stranicu nije moguće prikazati. Učitajte je ponovno; ako se pogreška ponovi, javite se administratoru sustava.',
        reload: 'Učitaj ponovno',
        home: 'Na početnu stranicu',
    },
    notFound: {
        title: 'Stranica nije pronađena',
        description:
            'Adresa koju ste otvorili ne postoji. Provjerite poveznicu ili se vratite na početnu stranicu.',
        home: 'Na početnu',
    },
} as const
