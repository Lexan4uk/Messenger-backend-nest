import { InviteStatus } from '@prisma/client'
import { IsEnum, IsString } from 'class-validator'

export class CreateInviteDto {
	@IsString()
	chatId: string

	@IsString()
	targetLogin: string
}
export class CreateDMInviteDto {
	@IsString()
	targetLogin: string
}
export class UpdateInviteDto {
	@IsEnum(InviteStatus)
	status: InviteStatus
}
export class UserInvites {
	@IsString()
	is: string

	@IsString()
	senderName: string

	@IsString()
	chatName: string
}
