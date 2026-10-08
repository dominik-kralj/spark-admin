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
            tooLong: (maxLength: number) => `Upišite najviše ${String(maxLength)} znakova.`,
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
        validation: {
            required: 'Ovo polje je obavezno.',
            plateInvalid:
                'Upišite registraciju u obliku ZG 1234-AB: dva slova, tri ili četiri znamenke te jedno ili dva slova (bez Q, W, X i Y).',
            oibInvalid: 'OIB mora imati točno 11 znamenki.',
            pinInvalid: 'PIN može imati najviše 4 znamenke.',
            dateFormat: 'Upišite datum u obliku DD.MM.GGGG, npr. 31.12.2026.',
            dateInvalid: 'Taj datum ne postoji. Provjerite dan i mjesec.',
        },
        serverFieldErrors: {
            invalid: 'Poslužitelj nije prihvatio ovu vrijednost. Provjerite unos.',
            duplicate: 'Ova vrijednost već postoji. Upišite drugu.',
        },
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
    notFound: {
        title: 'Stranica nije pronađena',
        description:
            'Adresa koju ste otvorili ne postoji. Provjerite poveznicu ili se vratite na početnu stranicu.',
        home: 'Na početnu',
    },
} as const
