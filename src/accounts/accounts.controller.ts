import {  Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';
import { AccountRequest, SearchAccountsRequest } from './interfaces';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @GrpcMethod('DbService')
  async findOneAccount(data: AccountRequest) {
    if (!data.account) {
      throw new RpcException('Debe de proporcionar una cuenta a buscar');
    }
    return await this.accountsService.getAccount(data);
  }

  @GrpcMethod('DbService')
  async searchAccounts(data: SearchAccountsRequest) {
    const response = await this.accountsService.searchAccounts(data);
    return {
      accounts: response,
    };
  }

}
