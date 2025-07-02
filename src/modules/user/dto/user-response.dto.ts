import { ApiProperty } from '@nestjs/swagger'
import { ChatUsers } from '@prisma/client'

export class UserResponseDto {
	@ApiProperty({ description: 'Уникальный логин пользователя' })
	login: string

	@ApiProperty({
		description:
			'Имя пользователя (если не задано, в сервисе будет рассчитано как @login)'
	})
	name: string

	@ApiProperty({ description: 'URL аватарки', nullable: true })
	imgUrl: string | null
}

export class ProfileResponseDto {
	@ApiProperty({
		description: 'Данные текущего пользователя',
		type: () => UserResponseDto,
		examples: {
			default: {
				value: {
					login: 'john123',
					name: '@john123',
					imgUrl: null,
					chats: [{ chatId: 'cuid1', role: 'admin', hidden: false }]
				}
			}
		}
	})
	user: UserResponseDto & {
		chats: Omit<ChatUsers, 'userId'>[]
	}
}
