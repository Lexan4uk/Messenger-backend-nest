import { ApiProperty } from '@nestjs/swagger'

export class SenderDto {
	@ApiProperty({ description: 'Отображаемое имя (или @login)' })
	name: string

	@ApiProperty({ description: 'Уникальный логин' })
	login: string

	@ApiProperty({ description: 'URL аватарки', nullable: true })
	imgUrl: string | null
}

export class MessageResponseDto {
	@ApiProperty({ description: 'ID сообщения' })
	id: string

	@ApiProperty({ description: 'Текст сообщения' })
	content: string

	@ApiProperty({ description: 'Дата создания' })
	createdAt: Date

	@ApiProperty({ description: 'Информация об отправителе' })
	sender: SenderDto
}
export class MessageSentDto {
	@ApiProperty({
		description: 'Информационное сообщение об успешной отправке'
	})
	message: string
}
