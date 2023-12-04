import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Account, Partition, User, Zone, Contact, HorarioSend } from '../common/interfaces';
import { AccountRequest, AccountResponse, AccountSend, SearchAccountsRequest } from './interfaces';
import { DbService } from '../db/db.service';


@Injectable()
export class AccountsService {
    constructor(private readonly dbService: DbService) {}

    async getAccount(accountRequest: AccountRequest): Promise<AccountResponse> {
        const { account, includeGeneralData, includeContacts, includeDeviceZone, includeEmail, includePanel, includePartitions, includeSecurity, includeUsers, includeZones, includeSchedule} = accountRequest;
        const dataAccount = await this.dbService.getAccounts([account.toString()], 0, includeGeneralData, includePanel, includeSecurity, includeEmail);                
        if (dataAccount.length === 0) throw new RpcException('Cuenta no existente');
        const promises:[Promise<Partition[]>, Promise<Zone[]>, Promise<User[]>, Promise<Contact[]>, Promise<HorarioSend[]>] = [
            includePartitions ? this.dbService.getPartitions([account.toString()]) : null,
            includeZones ? this.dbService.getZones([account.toString()], includeDeviceZone) : null,
            includeUsers ? this.dbService.getUsers([account.toString()]) : null,
            includeContacts ? this.dbService.getContacts([account.toString()]) : null,
            includeSchedule ? this.dbService.getScheduled([account.toString()]) : null
        ];

        const [partitions, zones, users, contacts, scheduled] = await Promise.all(promises);
        // const { CodigoCte, ...horario} = scheduled?.find(scheduled => scheduled.CodigoCte === account.toString());
        return {
            ...this.separateAccount(dataAccount[0], includeGeneralData, includePanel, includeSecurity, includeEmail),
            particiones: partitions,
            zonas: zones,
            usuarios: users,
            contactos: contacts,
            horario: scheduled?.find(scheduled => scheduled.CodigoCte === account.toString())
        };
    }

    async searchAccounts(searchAccountsRequest: SearchAccountsRequest): Promise<AccountResponse[]> {
        
        const { accounts: accountsRequest, includeEmail, includeContacts,includeDeviceZone, includeGeneralData, includePanel, includePartitions,includeSecurity, includeUsers, includeZones, state, includeSchedule} = searchAccountsRequest;
        
        
        

        const accounts = accountsRequest ? accountsRequest.map(account => account.toString()) : [];
        const dataAccounts = await this.dbService.getAccounts(accounts, state, includeGeneralData, includePanel, includeSecurity, includeEmail);
        
        
        const promises: [Promise<Partition[]>, Promise<Zone[]>, Promise<User[]>, Promise<Contact[]>, Promise<HorarioSend[]>] = [
            includePartitions ? this.dbService.getPartitions(accounts) : null,
            includeZones ? this.dbService.getZones(accounts, includeDeviceZone) : null,
            includeUsers ? this.dbService.getUsers(accounts) : null,
            includeContacts ? this.dbService.getContacts(accounts) : null,
            includeSchedule ? this.dbService.getScheduled(accounts) : null
        ];
        
        
        const [partitions, zones, users, contacts, scheduleds] = await Promise.all(promises);
        

        return dataAccounts.map(account => {
            // const { CodigoCte, ...horario } = scheduleds?.find(scheduled => scheduled.CodigoCte === account.CodigoCte);
            return {
                ...this.separateAccount(account, includeGeneralData, includePanel, includeSecurity, includeEmail),
                particiones:   partitions?.filter(partition => partition.CodigoCte === account.CodigoCte),
                zonas: zones?.filter(zone => zone.CodigoCte === account.CodigoCte),
                usuarios: users?.filter(user => user.CodigoCte === account.CodigoCte),
                contactos: contacts?.filter(contact => contact.CodigoCte === account.CodigoCte),
                horario: scheduleds?.find(scheduled => scheduled.CodigoCte === account.CodigoCte)
            }
        })

    }

    private separateAccount(account: Account, includeDetail: boolean, includePanel: boolean, includeSecurity: boolean, includeEmail: boolean) {
        const { CodigoAbonado, CodigoCte, CodigoReceptora, Direccion, Nombre, Status } = account;
        let dataStruct: AccountSend = { CodigoAbonado, CodigoCte, CodigoReceptora, Nombre, Direccion, Status };
        if (includePanel) {
            const { Modelo, AccesoPorGPRS, AccesoPorIP, AccesoPorLinea, SinEnlace, CoordGPS } = account;
            dataStruct = { ...dataStruct, panel: { Modelo, AccesoPorGPRS, AccesoPorIP, AccesoPorLinea, SinEnlace, CoordGPS } };
        }
        if (includeDetail) {
            const { Estado, Ubicacion, Municipio } = account;
            dataStruct = { ...dataStruct, datosGeneralesDetallados: { Estado, Ubicacion, Municipio } };
        }
        if (includeSecurity) {
            const { PalabraDeSeg, PalabraDeSegTA, Amago } = account;
            dataStruct = { ...dataStruct, seguridad: { PalabraDeSeg, PalabraDeSegTA, Amago } }
        }
        if(includeEmail){
            const {Email} = account;
            dataStruct = { ...dataStruct, emails: Email ? Email.split(';').map(email => email.trim()) : [] };
        }

        return dataStruct;
    }
}
