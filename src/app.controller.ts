import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  

  @GrpcMethod('DbService')
  async test(){
    return {
      message: 'OK'
    }
  }
}
