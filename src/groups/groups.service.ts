import { Injectable } from '@nestjs/common';
import { GroupRequest, GroupsResponse, SearchRequest } from './interfaces';
import { AccountsService } from 'src/accounts/accounts.service';
import { Group } from '../common/interfaces';
import { AccountResponse, SearchAccountsRequest } from '../accounts/interfaces';
import { DbService } from '../db/db.service';


@Injectable()
export class GroupsService {
    constructor(
        private readonly dbService: DbService,
        private readonly accountsService: AccountsService,
    ) { }

    async getGroup(groupRequest: GroupRequest): Promise<GroupsResponse> {
        const { group, includeAccounts, ...requestAccounts } = groupRequest;
        if (group.type === 2) { // Es un grupo de monitoring works
            const groupFind = await this.dbService.getGroups([group.id], includeAccounts);
            const dataToSend = { // * Data para enviar al cliente
                Codigo: groupFind[0].Codigo,
                Nombre: groupFind[0].Nombre,
                Tipo: 2,
            }
            if (includeAccounts) {

                const accounts = groupFind.map(gr => Number(gr.CodigoCte));
                return {
                    ...dataToSend,
                    accounts: await this.getInformationAccounts({ ...requestAccounts, accounts })
                }

            }
            return dataToSend;


        } else { // Es un dealer de monitoring works
            const groupFind = await this.dbService.getDealers([group.id], includeAccounts);

            const dataToSend = { // * Data para enviar al cliente
                Codigo: groupFind[0].Codigo,
                Nombre: groupFind[0].Nombre,
                Tipo: 3,
            }
            if (includeAccounts) {
                const accounts = groupFind.map(gr => Number(gr.CodigoCte));
                return {
                    ...dataToSend,
                    accounts: await this.getInformationAccounts({ ...requestAccounts, accounts })
                }
            }
            return dataToSend;
        }
    }

    private async getInformationAccounts(requestAccounts: SearchAccountsRequest) {
        return this.accountsService.searchAccounts(requestAccounts);
    }

    async searchGroups(groupsRequest: SearchRequest): Promise<GroupsResponse[]> {
        const { groups: groupsToFind, includeAccounts, ...requestAccounts } = groupsRequest;
        
        
        const acGroups = groupsToFind ? groupsToFind.filter(group => group.type === 2).map(gr => gr.id) : [-1];
        const acDealers = groupsToFind ? groupsToFind.filter(group => group.type === 3).map(gr => gr.id) : [-1];

        


        const [groups, dealers]: [Array<Group>, Array<Group>] = await Promise.all([
            (acGroups.length === 0) ? [] : this.dbService.getGroups(acGroups.includes(-1) ? [] : acGroups, includeAccounts),
            (acDealers.length === 0) ? [] : this.dbService.getDealers(acDealers.includes(-1) ? [] : acDealers, includeAccounts)
        ]);

        if (includeAccounts) {
            // ? Obtener todas las cuentas y unificarlas
            const allAccounts = Array.from(new Set([
                ...groups.map(group => Number(group.CodigoCte)),
                ...dealers.map(dealer => Number(dealer.CodigoCte))
            ]));
            const respAccounts = await this.accountsService.searchAccounts({ ...requestAccounts, accounts: allAccounts });

            // ? Obtener todos los grupos (Sin cuentas)
            let hash = {};
            const allGroups = groups.filter(o => hash[o.Codigo] ? false : hash[o.Codigo] = true);
            const formatGroups = allGroups.map(group => {
                const accountsFromGroup = groups.filter(gr => gr.Codigo === group.Codigo).map(gr => gr.CodigoCte);
                const dataAccounts = accountsFromGroup.reduce((result: AccountResponse[], item) => {
                    if (respAccounts.find(account => account.CodigoCte === item)) result = [...result, respAccounts.find(account => account.CodigoCte === item)]
                    return result;
                }, []);
                return {
                    Codigo: group.Codigo,
                    Nombre: group.Nombre,
                    Tipo: 2,
                    accounts: dataAccounts
                }
            });

            // ? Obtener todos los dealer (Sin cuentas)
            hash = {};
            const allDealers = dealers.filter(o => hash[o.Codigo] ? false : hash[o.Codigo] = true);
            const formatDealers = allDealers.map(group => {
                const accountsFromGroup = dealers.filter(gr => gr.Codigo === group.Codigo).map(gr => gr.CodigoCte);
                const dataAccounts = accountsFromGroup.reduce((result: AccountResponse[], item) => {
                    if (respAccounts.find(account => account.CodigoCte === item)) result = [...result, respAccounts.find(account => account.CodigoCte === item)]
                    return result;
                }, []);
                return {
                    Codigo: group.Codigo,
                    Nombre: group.Nombre,
                    Tipo: 3,
                    accounts: dataAccounts
                }
            });

            // ? Separar los grupos 
            return [
                ...formatGroups,
                ...formatDealers
            ]
        }

        return [...groups.map((group) => ({ ...group, Tipo: 2, accounts: [] })), ...dealers.map(dealer => ({ ...dealer, Tipo: 3, accounts: [] }))]

    }

}
