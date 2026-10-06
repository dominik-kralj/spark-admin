/**
 * Every user-visible string in the app, including aria-labels, validation
 * messages and toasts. Components import from here; they hold no literals.
 * Screens add their own section as they are built.
 */
export const hr = {
    app: {
        name: 'SPARK Admin',
        brand: 'SPARK',
        product: 'Admin',
    },
    login: {
        username: 'Korisničko ime',
        password: 'Lozinka',
        showPassword: 'Prikaži lozinku',
        submit: 'Prijava',
        usernameRequired: 'Upišite korisničko ime.',
        passwordRequired: 'Upišite lozinku.',
        errorTitle: 'Prijava nije uspjela.',
        errors: {
            unauthorized:
                'Korisničko ime ili lozinka nisu točni. Provjerite unos i pokušajte ponovno.',
            rateLimited: 'Previše pokušaja prijave. Pričekajte minutu pa pokušajte ponovno.',
            network: 'Poslužitelj nije dostupan. Provjerite internetsku vezu i pokušajte ponovno.',
            server: 'Došlo je do pogreške na poslužitelju. Pokušajte ponovno za nekoliko minuta.',
        },
    },
} as const
