// Shared by the shell's city name, Izvještaji and Postavke grada, so a settings save can refresh the others.
export const tenantKeys = {
    name: ['tenant', 'name'] as const,
    settings: ['tenant', 'settings'] as const,
    reportRecipient: ['tenant', 'reportRecipient'] as const,
}
