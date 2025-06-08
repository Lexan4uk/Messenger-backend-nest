import { ApiProperty } from '@nestjs/swagger'
import { ChatUsers } from '@prisma/client'

export class UserResponseDto {
	@ApiProperty()
	id: string
	@ApiProperty()
	createdAt: Date
	@ApiProperty()
	updatedAt: Date
	@ApiProperty()
	login: string
	@ApiProperty()
	password: string
	@ApiProperty({ nullable: true })
	name: string | null
	@ApiProperty({ nullable: true })
	imgUrl: string | null
	chats?: ChatUsers[]
}

export class ProfileResponseDto {
	user: {
		id: string
		createdAt: Date
		updatedAt: Date
		login: string
		name: string | null
		imgUrl: string | null
		chats: Omit<ChatUsers, 'userId'>[]
	}
}
