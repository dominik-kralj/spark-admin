import type { Dictionary } from './dictionary'

const appName = 'SPARK Admin'

export const en: Dictionary = {
    app: {
        name: appName,
        brand: 'SPARK',
        product: 'Admin',
        documentTitle: (page: string) => `${page} – ${appName}`,
    },
    login: {
        title: 'Sign in',
        username: 'Username',
        password: 'Password',
        showPassword: 'Show password',
        submit: 'Sign in',
        usernameRequired: 'Enter your username.',
        passwordRequired: 'Enter your password.',
        errorTitle: 'Sign-in failed.',
        sessionExpired: 'Your session has expired. Please sign in again.',
        errors: {
            unauthorized: 'The username or password is incorrect. Check them and try again.',
            rateLimited: 'Too many sign-in attempts. Wait a minute and try again.',
            network: 'The server is unavailable. Check your internet connection and try again.',
            server: 'Something went wrong on the server. Try again in a few minutes.',
        },
    },
    shell: {
        signOut: 'Sign out',
        skipToContent: 'Skip to content',
        homeLink: `${appName}, home page`,
        mainNav: 'Main navigation',
        menu: 'Menu',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        expandMenu: 'Expand menu',
        collapseMenu: 'Collapse menu',
        placeholder: 'Page content',
    },
    nav: {
        tickets: 'Tickets',
        dailyTickets: 'Daily tickets',
        zones: 'Zones',
        privilegedOwners: 'Privileged users',
        inspectors: 'Inspectors',
        reports: 'Reports',
        citySettings: 'City settings',
        adminUsers: 'Users',
    },
    zones: {
        add: 'Add zone',
        listLabel: 'Parking zones',
        columns: {
            code: 'Code',
            name: 'Name',
            price: 'Price',
            dailyTicketPrice: 'Daily ticket',
            durationMinutes: 'Duration',
            maxExtensions: 'Max. extensions',
            dpkIssueDelayMinutes: 'Daily ticket delay',
        },
        actions: 'Actions',
        edit: 'Edit',
        editZone: (code: string) => `Edit zone ${code}`,
        form: {
            intro: 'All fields are required.',
            labels: {
                code: 'Code',
                name: 'Name',
                price: 'Price (EUR)',
                dailyTicketPrice: 'Daily ticket price (EUR)',
                durationMinutes: 'Duration (min)',
                maxExtensions: 'Maximum extensions',
                dpkIssueDelayMinutes: 'Daily ticket delay (min)',
            },
            errors: {
                required: 'This field is required.',
                tooLong: 'Enter at most 20 characters.',
                notAmount: 'Enter an amount in euros, digits and a decimal comma only, e.g. 0,70.',
                tooManyDecimals: 'An amount can have at most two decimals, e.g. 0,70.',
                tooLarge: 'The number is too large.',
                notWholeNumber: 'Enter a whole number, digits only.',
                notPositive: 'Enter a number greater than 0.',
            },
            duplicate: {
                code: 'A zone with this code already exists. Enter a different code.',
                name: 'A zone with this name already exists. Enter a different name.',
            },
            notSaved: 'The zone was not saved. Fix the marked fields.',
            saved: (code: string) => `Zone ${code} saved`,
        },
        delete: {
            button: 'Delete',
            deleteZone: (code: string) => `Delete zone ${code}`,
            formButton: 'Delete zone',
            title: (code: string) => `Delete zone ${code}?`,
            description: (code: string, name: string) =>
                `Zone ${code} (${name}) will be deleted permanently. This cannot be undone.`,
            confirm: 'Delete zone',
            deleted: (code: string) => `Zone ${code} deleted`,
            failed: 'The zone was not deleted.',
            errors: {
                network:
                    'The server did not respond. Check your internet connection and try again.',
                forbidden: 'You do not have permission to delete zones.',
                notFound:
                    'This zone no longer exists. Someone may have deleted it in the meantime.',
                server: 'Something went wrong on the server. Try again in a few minutes.',
            },
        },
        loading: 'Loading zones…',
        empty: {
            title: 'No zones yet',
            description:
                'Add the first zone so drivers can pay for parking and inspectors can issue daily tickets.',
        },
        errorTitle: 'Zones could not be loaded',
        total: (count: number) => `${String(count)} ${count === 1 ? 'zone' : 'zones'} in total`,
    },
    forms: {
        close: 'Close form',
        cancel: 'Cancel',
        save: 'Save',
        discard: {
            title: 'Discard unsaved changes?',
            description: 'Your changes have not been saved. If you leave now, you will lose them.',
            confirm: 'Discard changes',
            keepEditing: 'Keep editing',
        },
        serverFieldErrors: {
            invalid: 'The server did not accept this value. Check what you entered.',
            duplicate: 'This value already exists. Enter a different one.',
        },
        saveFailed: 'Your changes were not saved.',
        errors: {
            network:
                'The server did not respond. What you entered is still in the form. Check your internet connection and try again.',
            validation: 'The server did not accept the form. Check the fields and try again.',
            forbidden:
                'You do not have permission to make this change. If you think you should, contact your system administrator.',
            notFound: 'This record no longer exists. Someone may have deleted it in the meantime.',
            conflict:
                'This record was changed in the meantime. Close the form, open it again and redo your change.',
            server: 'Something went wrong on the server. What you entered is still in the form. Try again in a few minutes.',
        },
    },
    notifications: {
        close: 'Close notification',
    },
    listStates: {
        retry: 'Try again',
        errors: {
            network:
                'Check your internet connection and try again. If the error persists, contact your system administrator.',
            forbidden:
                'You do not have permission to view this data. If you think you should, contact your system administrator.',
            server: 'Something went wrong on the server. Try again in a few minutes. If the error persists, contact your system administrator.',
        },
    },
    notFound: {
        title: 'Page not found',
        description:
            'The address you opened does not exist. Check the link or go back to the home page.',
        home: 'Go to the home page',
    },
}
