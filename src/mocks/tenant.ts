import { http, HttpResponse } from 'msw'

import { apiUrl } from './url'

export const mockTenant = {
    tenantName: 'Grad Samobor',
    vatID: '12345678903',
    address: 'Trg kralja Tomislava',
    houseNo: '5',
    zipCode: '10430',
    city: 'Samobor',
    iban: 'HR1210010051863000160',
    premisesCode: 'SAMOBOR1',
    cashRegisterCode: '1',
    stopaPDV: 25,
    reportEmail: 'promet@samobor.hr',
}

export const tenantHandlers = [http.get(apiUrl('/tenant'), () => HttpResponse.json(mockTenant))]
