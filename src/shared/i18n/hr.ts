const appName = 'SPARK Admin'

/**
 * Every user-visible string in the app, including aria-labels, validation
 * messages and toasts. Components import from here; they hold no literals.
 * Screens add their own section as they are built.
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
    format: {
        currency: 'EUR',
    },
    notFound: {
        title: 'Stranica nije pronađena',
        description:
            'Adresa koju ste otvorili ne postoji. Provjerite poveznicu ili se vratite na početnu stranicu.',
        home: 'Na početnu',
    },
} as const
