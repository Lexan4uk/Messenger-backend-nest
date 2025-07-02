import { Type } from '@prisma/client'
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'

export class CreateChatDto {
	@IsEnum(Type)
	type: Type

	@IsString()
	title: string

	@IsOptional()
	@IsString()
	description?: string
}

export class CreateDMDto {
	@IsString()
	companionLogin: string
}

export class GetChatMiniaturesDto {
	@IsArray()
	@IsString({ each: true })
	ids: string[]
}
export class LeaveChatDto {
	@IsString()
	chatId: string
}
export class GetChatUsersDto {
	@IsString()
	chatId: string
}
export class KickUserFromChatDto {
	@IsString()
	chatId: string
	@IsString()
	userLogin: string
}
