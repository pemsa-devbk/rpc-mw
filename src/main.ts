import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {readFileSync } from 'fs';
import { ServerCredentials } from '@grpc/grpc-js';

async function bootstrap() {

  const credentials = ServerCredentials.createSsl(
    readFileSync(join(__dirname, 'certs', 'ca.crt')), [
    {
      cert_chain: readFileSync(join(__dirname, 'certs', 'server.crt')),
      private_key: readFileSync(join(__dirname, 'certs', 'server.key'))
    }
  ], true
  );
  
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      logger: ['warn', 'error'],
      transport: Transport.GRPC,
      options:{
        url: '0.0.0.0:9000',
        package: 'db',
        protoPath: join(__dirname, './main.proto'),
        credentials,
        maxSendMessageLength: 1024 * 1024 * 10
      },
    }
  );
  await app.listen();
  console.log('Service start');
}
bootstrap();
