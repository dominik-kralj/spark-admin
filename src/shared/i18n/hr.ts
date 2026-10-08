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
