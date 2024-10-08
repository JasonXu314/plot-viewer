import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: 'dist/client/assets',
			serveRoot: '/__app'
		}),
		ServeStaticModule.forRoot({
			rootPath: 'src/client/public',
			serveRoot: '/'
		})
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}

