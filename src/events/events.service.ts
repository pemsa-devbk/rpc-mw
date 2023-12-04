import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { AccountsService } from '../accounts/accounts.service';
import { GroupsService } from '../groups/groups.service';
import { EventSend, EventTopSend, EventsGroupsRequest, EventsRequest, EventsWOAccountRequest, LastEventGroupRequest, LastEventRequest } from './interfaces';
import { CommentSend, Event, EventTop, FilterRequest, HorarioSend, Partition } from '../common/interfaces';
import { GroupsResponse } from '../groups/interfaces/groups-response.interface';
import { AccountResponse } from '../accounts/interfaces/account-response.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class EventsService {

    constructor(
        private readonly dbService: DbService,
        private readonly accountsService: AccountsService,
        private readonly groupService: GroupsService
    ) { }

    async getEventsWithAccounts(data: EventsRequest) {
       
        const { accounts, dateEnd, dateStart, endQuery, filterIsExclude, filters, includeComments, includeScheduled, order, separatePartitions, startQuery, state } = data;
        // * Valida que las fechas establecidas en la consulta sean validas 
        const tablesEvents = this.getRangeTableEvent(dateStart, dateEnd);
        await Promise.all(tablesEvents.map(table => this.dbService.existTable(table)));

        const uniqueAccounts = accounts ? accounts.map(acc => acc.toString()) : [];

        const dataAccounts = await this.accountsService.searchAccounts({ accounts: accounts || [], state: state || 0 });

        const cleanEvents = await this.getEvents(uniqueAccounts, dateStart, dateEnd, state, filters, filterIsExclude, startQuery, endQuery, order);

        const [partitions, comments, scheduleds] = await this.getMoredataForEvent(uniqueAccounts, separatePartitions, includeComments, includeScheduled, dateStart, dateEnd, startQuery, endQuery);

        return this.responseAccount(dataAccounts, cleanEvents, partitions || [], comments || [], scheduleds || []);

    }
    async getEventsFromGroup(data: EventsGroupsRequest) {

        const { groups, state, filters, filterIsExclude, dateStart, dateEnd, endQuery, startQuery, order, includeComments, includeScheduled, separatePartitions } = data;

        // * Valida que las fechas establecidas en la consulta sean validas 
        const tablesEvents = this.getRangeTableEvent(dateStart, dateEnd);

        await Promise.all(tablesEvents.map(table => this.dbService.existTable(table)));

        const dataFromGroups = await this.groupService.searchGroups({ includeAccounts: true, state, groups });

        const uniqueAccounts = this.uniqueAccounts(dataFromGroups.flatMap(gr => gr.accounts.map(acc => acc.CodigoCte)));

        
        const cleanEvents = await this.getEvents(uniqueAccounts, dateStart, dateEnd, state, filters, filterIsExclude, startQuery, endQuery, order);

        const [partitions, comments, scheduleds] = await this.getMoredataForEvent(uniqueAccounts, separatePartitions, includeComments, includeScheduled, dateStart, dateEnd, startQuery, endQuery);

        return this.responseForGroups(dataFromGroups, cleanEvents, partitions || [], comments || [], scheduleds || []);
    }
    async getLastEventsGroups(data: LastEventGroupRequest) {

        const { groups, state, filters, filterIsExclude, dateStart, dateEnd, endQuery, startQuery, separatePartitions } = data;
        
        const dataFromGroups = await this.groupService.searchGroups({ includeAccounts: true, state, groups });

        const allAccounts = dataFromGroups.flatMap(gr => gr.accounts);
        const uniqueAccounts: Array<AccountResponse> = allAccounts.reduce( (res: Array<AccountResponse>, accountV: AccountResponse) => {
            if(!res.some(account => account.CodigoCte === accountV.CodigoCte)){
                res.push(accountV);
            }
            return res;
        }, []);
        const uniqueClientsId = this.uniqueAccounts(uniqueAccounts.map(account => account.CodigoCte));


        const partitions = separatePartitions ? await this.dbService.getPartitions(uniqueClientsId) : [];

        const formatEvents = await this.getLastEvents(allAccounts, partitions, separatePartitions, filters, filterIsExclude, dateStart, dateEnd, startQuery, endQuery);

        return this.responseTopForGroups(dataFromGroups, formatEvents, partitions);
    }
    async getLastEventsWithAccounts(data: LastEventRequest) {
        const { accounts, dateEnd, dateStart, endQuery, filterIsExclude, filters, separatePartitions, startQuery, state } = data;


        const uniqueAccounts = accounts ? accounts.map(acc => acc.toString()) : [];

        const dataAccounts = await this.accountsService.searchAccounts({ accounts: accounts || [], state: state || 0 });


        const partitions = separatePartitions ? await this.dbService.getPartitions(uniqueAccounts) : [];

        const formatEvents = await this.getLastEvents(dataAccounts, partitions, separatePartitions, filters, filterIsExclude, dateStart, dateEnd, startQuery, endQuery);

        return this.responseTopAccount(dataAccounts, formatEvents, partitions);        

    }
    async getEventsWOAccount(data: EventsWOAccountRequest) {
        const { dateEnd, dateStart, endQuery, filterIsExclude, filters, order, startQuery } = data;

        // * Valida que las fechas establecidas en la consulta sean validas 
        const tablesEvents = this.getRangeTableEvent(dateStart, dateEnd);
        await Promise.all(tablesEvents.map(table => this.dbService.existTable(table)));


        const cleanEvents = await this.getEvents([], dateStart, dateEnd, 0, filters, filterIsExclude, startQuery, endQuery, order);
        
        return cleanEvents;


    }

    // * Para obtener los top events de cuentas
    private async getLastEvents(accounts: AccountResponse[], partitions: Partition[], separatePartitions: boolean,filters?: FilterRequest[], filterIsExclude? : boolean, 
        dateStart?: string,dateEnd?: string,startQuery?: string,endQuery?: string){
        let accountsForQuery = accounts.map(account => ({
            CodigoAbonado: account.CodigoAbonado,
            CodigoReceptora: account.CodigoReceptora,
            partitions: partitions.filter(partition => partition.CodigoCte === account.CodigoCte)
        }))

        let tableEvents: Array<string>;
        if (dateStart && dateEnd) {
            tableEvents = this.getRangeTableEvent(dateStart, dateEnd);
        } else {
            tableEvents = await this.dbService.getTablesEvents();
        }

        let events: Array<EventTop> = [];

        for await (const table of tableEvents) {

            const newEvents = await this.dbService.lastEvents(table, separatePartitions, filters || [], filterIsExclude, dateStart || "", dateEnd || "", startQuery, endQuery);

            accountsForQuery = accountsForQuery.filter(account => {
                if (account.partitions.length > 0) {
                    return account.partitions.every(part => {
                        const inNewEvents = newEvents.some(event => event.CodigoAbonado === account.CodigoAbonado && event.CodigoReceptora == account.CodigoReceptora && event.Particion === part.CodigoParticion);
                        const inLastEvents = newEvents.some(event => event.CodigoAbonado === account.CodigoAbonado && event.CodigoReceptora == account.CodigoReceptora && event.Particion === part.CodigoParticion);

                        return (inNewEvents || inLastEvents);
                    })
                }
                return !newEvents.some(event => event.CodigoAbonado === account.CodigoAbonado && event.CodigoReceptora == account.CodigoReceptora);
            });
            events = [...events, ...newEvents];
            if (accountsForQuery.length == 0) break;
        }

        return this.formatTopEvents(events);
    }
    // * Para obtener los eventos de las cuentas
    private async getEvents(accounts: Array<string>, dateStart: string, dateEnd: string, state?: number, filters?: Array<FilterRequest>, filterIsExclude?: boolean, startQuery?: string, endQuery?: string, order?: number){
        const tablesEvents = this.getRangeTableEvent(dateStart, dateEnd);

        const events = await Promise.all(tablesEvents.map(tableName => this.dbService.getEvents(accounts, tableName, state || 0, filters || [], filterIsExclude, dateStart, dateEnd, startQuery || '00:00', endQuery || '23:59', order || 1)));
        return  this.formatEvents(events.flatMap(ev => ev));
    }
    // * Para obtener mas informacion del evento o la cuenta
    private async getMoredataForEvent(accounts: Array<string>, separatePartitions: boolean, includeComments: boolean, includeScheduled: boolean, dateStart: string, dateEnd: string, startQuery?: string, endQuery?: string): Promise<[Partition[], CommentSend[], HorarioSend[]]> {

        let promises: [Promise<Partition[]>, Promise<CommentSend[]>, Promise<HorarioSend[]>] = [
            separatePartitions ? this.dbService.getPartitions(accounts) : null,
            includeComments ? this.dbService.getComments(accounts, dateStart, dateEnd, startQuery || '00:00', endQuery || '23:59') : null,
            includeScheduled ? this.dbService.getScheduled(accounts) : null,
        ];

        return await Promise.all(promises);
        
    }
    // * Format the top events
    private formatTopEvents(events: EventTop[]): EventTopSend[] {
        return events.map(event => {
            const { CodigoZona, NombreUsuario, Descripcion, FechaHora, ...rest } = event;
            if (event.CodigoAlarma === 'O' || event.CodigoAlarma === 'OS' || event.CodigoAlarma === 'C' || event.CodigoAlarma === 'CS') {
                return {
                    ...rest,
                    CodigoZona: '',
                    DescripcionZona: '',
                    CodigoUsuario: CodigoZona,
                    NombreUsuario: (CodigoZona === "0") ? 'Sistema/llavero' : NombreUsuario,
                    FechaOriginal: FechaHora.substring(0, 10),
                    Hora: FechaHora.substring(11, 19),
                }
            }
            return {
                ...rest,
                CodigoZona: CodigoZona,
                DescripcionZona: Descripcion,
                CodigoUsuario: '',
                NombreUsuario: '',
                FechaOriginal: FechaHora.substring(0, 10),
                Hora: event.FechaHora.substring(11, 19)
            }
        })
    }

    private responseForGroups(groups: GroupsResponse[], eventos: EventSend[], partitions: Partition[], comments: CommentSend[], schedules: HorarioSend[]) {
        return groups.map(group => {
            const { accounts, ...rest } = group;
            const eventsForAccount = this.responseAccount(accounts, eventos, partitions, comments, schedules);
            return {
                ...rest,
                cuentas: eventsForAccount
            }
        })
    }
    private responseTopForGroups(groups: GroupsResponse[], eventos: EventTopSend[], partitions: Partition[]) {
        return groups.map(group => {
            const { accounts, ...rest } = group;
            const eventsForAccount = this.responseTopAccount(accounts, eventos, partitions);
            return {
                ...rest,
                cuentas: eventsForAccount
            }
        })
    }
    private responseAccount(accounts: AccountResponse[], eventos: EventSend[], partitions: Partition[], comments: CommentSend[], schedules: HorarioSend[]) {
        return accounts.flatMap(account => {
            const accountPartitions = partitions.filter(partition => partition.CodigoCte === account.CodigoCte);
            const commentsForAccount = comments.filter(cm => cm.CodigoCliente === account.CodigoCte);
            const scheduledForAccount = schedules.find(sh => sh.CodigoCte === account.CodigoCte);

            if (accountPartitions.length === 0) { // * Todo se va a la particion principal
                const events = eventos.filter(ev => ev.CodigoCte === account.CodigoCte);
                return {
                    ...account,
                    eventos: events,
                    comentarios: commentsForAccount,
                    horario: scheduledForAccount
                }

            }
            return accountPartitions.flatMap(partition => {
                const events = eventos.filter(ev => (ev.CodigoCte === account.CodigoCte && ev.Particion === partition.CodigoParticion));
                return {
                    ...account,
                    Nombre: partition.NombreParticion,
                    eventos: events,
                    comentarios: commentsForAccount,
                    horario: scheduledForAccount
                }
            })
        });
    }
    private responseTopAccount(accounts: AccountResponse[], eventos: EventTopSend[], partitions: Partition[]) {
        return accounts.flatMap(account => {
            const accountPartitions = partitions.filter(partition => partition.CodigoCte === account.CodigoCte);
            if (accountPartitions.length === 0) { // * Todo a la particion principal
                const event = eventos.find(ev => (ev.CodigoAbonado === account.CodigoAbonado && ev.CodigoReceptora === account.CodigoReceptora))
                return {
                    ...account,
                    evento: event,
                }
            }
            return accountPartitions.flatMap(partition => {
                const event = eventos.find(ev => (ev.CodigoAbonado === account.CodigoAbonado && ev.CodigoReceptora === account.CodigoReceptora && ev.Particion === partition.CodigoParticion));
                return {
                    ...account,
                    Nombre: partition.NombreParticion,
                    evento: event,
                }
            })
        })
    }
    private formatEvents(events: Event[]): EventSend[] {
        return events.map(event => {
            const { CodigoZona, NombreUsuario, Descripcion, FechaHora, FechaHoraFinalizo, FechaHoraPrimeraToma, ...rest } = event;
            if (event.CodigoAlarma === 'O' || event.CodigoAlarma === 'OS' || event.CodigoAlarma === 'C' || event.CodigoAlarma === 'CS') {
                return {
                    ...rest,
                    CodigoZona: '',
                    DescripcionZona: '',
                    CodigoUsuario: CodigoZona,
                    NombreUsuario: (CodigoZona === "0") ? 'Sistema/llavero' : NombreUsuario,
                    FechaOriginal: FechaHora.substring(0, 10),
                    Hora: FechaHora.substring(11, 19),
                    FechaPrimeraToma: FechaHoraPrimeraToma ? FechaHoraPrimeraToma.substring(0, 10) : FechaHora.substring(0, 10),
                    HoraPrimeraToma: FechaHoraPrimeraToma ? FechaHoraPrimeraToma.substring(11, 19) : FechaHora.substring(11, 19),
                    FechaFinalizo: FechaHoraFinalizo ? FechaHoraFinalizo.substring(0, 10) : FechaHora.substring(0, 10),
                    HoraFinalizo: FechaHoraFinalizo ? FechaHoraFinalizo.substring(11, 19) : FechaHora.substring(0, 10)
                }
            }
            return {
                ...rest,
                CodigoZona: CodigoZona,
                DescripcionZona: Descripcion,
                CodigoUsuario: '',
                NombreUsuario: '',
                FechaOriginal: FechaHora.substring(0, 10),
                Hora: event.FechaHora.substring(11, 19),
                FechaPrimeraToma: FechaHoraPrimeraToma ? FechaHoraPrimeraToma.substring(0, 10) : FechaHora.substring(0, 10),
                HoraPrimeraToma: FechaHoraPrimeraToma ? FechaHoraPrimeraToma.substring(11, 19) : FechaHora.substring(11, 19),
                FechaFinalizo: FechaHoraFinalizo ? FechaHoraFinalizo.substring(0, 10) : FechaHora.substring(0, 10),
                HoraFinalizo: FechaHoraFinalizo ? FechaHoraFinalizo.substring(11, 19) : FechaHora.substring(0, 10)
            }
        })
    }
    private uniqueAccounts(accounts: string[]) {
        return Array.from(new Set(accounts));
    }
    private getRangeTableEvent(dateStart: string, dateEnd: string) {
        const [yearStart, ...rest] = dateStart.split('-');
        const [yearEnd, ...rest2] = dateEnd.split('-');
        let years: Array<string> = [];
        for (let i = Number(yearEnd); i >= Number(yearStart); i--) {
            years = [...years, `Evento${i}`]
        }
        return years;
    }
}
