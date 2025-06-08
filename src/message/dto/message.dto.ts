import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class MessageDto {
	@IsString()
	chatId: string

	@IsString()
	senderId: string

	@IsString()
	content: string
}
export class CreateMessageDto {
	@IsString()
	chatId: string

	@IsString()
	content: string
}

export class GetMessagesDto {
	@IsString()
	chatId: string

	@IsOptional()
	@IsString()
	lastMessage?: string

	@IsOptional()
	@Transform(({ value }) => {
		if (!value) return undefined
		const parsed = parseInt(value)
		return isNaN(parsed) ? undefined : parsed
	})
	@IsNumber()
	take?: number
}
