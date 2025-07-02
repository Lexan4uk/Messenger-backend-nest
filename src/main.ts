// prettier-ignore
import 'reflect-metadata'

import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	app.use(cookieParser())
	app.enableCors({
		origin: 'http://localhost:3000',
		credentials: true,
		exposedHeaders: ['set-cookie']
	})
	// whitelist - разрешает только те поля, которые указаны в DTO, forbidNonWhitelisted - кидает ошибку при передаче лишних полей
	// так же пропись пайпсов именно здесь применяет их глобально ко всем контроллерам. Если надо изменить - просто у контроллера сделать новый экземпляр ValidationPipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true
		})
	)
	const config = new DocumentBuilder()
		.setTitle('Tegram API')
		.setDescription('API documentation for Tegram')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT'
			},
			'access-token'
		)
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/docs', app, document)
	await app.listen(4201)
}
bootstrap()
