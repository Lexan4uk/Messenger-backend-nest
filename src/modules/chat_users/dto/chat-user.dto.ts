import { Role } from '@prisma/client'
import { IsEnum, IsString } from 'class-validator'

export class CreateChatUserDto {
	@IsString()
	chatId: string

	@IsString()
	userId: string

	@IsEnum(Role)
	role: Role
}
export class CutChatUserDto {
	@IsString()
	chatId: string

	@IsString()
	userId: string
}
export class KickUserDto {
	@IsString()
	chatId: string

	@IsString()
	requesterId: string

	@IsString()
	targetLogin: string
}
