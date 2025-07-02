import { ApiProperty } from '@nestjs/swagger'
import { InviteStatus } from '@prisma/client'

/**
 * Универсальный ответ с сообщением
 */
export class InviteResponseMessageDto {
	@ApiProperty({
		description: 'Короткое информационное сообщение по результату операции'
	})
	message: string
}

/**
 * Детали созданного приглашения
 */
export class InviteDetailsDto {
	@ApiProperty({ description: 'ID чата, в который приглашают' })
	chatId: string

	@ApiProperty({ description: 'Логин отправителя приглашения' })
	senderLogin: string

	@ApiProperty({ description: 'Логин получателя приглашения' })
	targetLogin: string

	@ApiProperty({
		description: 'Текущий статус приглашения',
		enum: InviteStatus
	})
	status: InviteStatus
}

/**
 * Ответ при создании / восстановлении DM-приглашения
 * или при создании группового приглашения
 */
export class InviteResponseDto extends InviteResponseMessageDto {
	@ApiProperty({
		type: () => InviteDetailsDto,
		description: 'Данные по приглашению',
		nullable: true
	})
	invite?: InviteDetailsDto
}

/**
 * Один элемент списка входящих приглашений
 */
export class UserInviteItemDto {
	@ApiProperty({ description: 'ID приглашения' })
	id: string

	@ApiProperty({
		description: 'Название (title) чата, из которого пришло приглашение'
	})
	chatName: string

	@ApiProperty({ description: 'Имя отправителя приглашения' })
	senderName: string
}

/**
 * Ответ для GET /invite — список приглашений
 */
export class UserInvitesResponseDto {
	@ApiProperty({
		description: 'Список текущих входящих приглашений',
		type: () => UserInviteItemDto,
		isArray: true
	})
	invites: UserInviteItemDto[]
}
