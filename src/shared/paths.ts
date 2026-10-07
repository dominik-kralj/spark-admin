const tickets = '/karte'

export const paths = {
    // The start page: where sign-in, the logo and "/" lead.
    home: tickets,
    login: '/prijava',
    tickets,
    dailyTickets: '/dpk',
    zones: '/zone',
    privilegedOwners: '/povlasteni-korisnici',
    inspectors: '/kontrolori',
    reports: '/izvjestaji',
    citySettings: '/postavke-grada',
    adminUsers: '/korisnici',
} as const
