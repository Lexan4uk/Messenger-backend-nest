import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/modules/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator'
import { ChatUsersService } from 'src/modules/chat_users/chat-users.service'
import { ChatService } from './chat.service'
import {
	CreateChatDto,
	GetChatMiniaturesDto,
	KickUserFromChatDto,
	LeaveChatDto
} from './dto/chat.dto'

@Controller('chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private chatUsersService: ChatUsersService
	) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async createChat(
		@Body() dto: CreateChatDto,
		@CurrentUser('id') userId: string
	) {
		return this.chatService.createChat(dto, userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('miniatures')
	@Auth()
	async getChatMiniatures(
		@Body() dto: GetChatMiniaturesDto,
		@CurrentUser('id') userId: string
	) {
		return this.chatService.getChatMiniatures(dto, userId)
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('leave')
	@Auth()
	async leaveChat(
		@Body() dto: LeaveChatDto,
		@CurrentUser('id') userId: string
	) {
		return this.chatService.leaveChat(dto, userId)
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Get('users/:id')
	@Auth()
	async getChatUsers(@Param('id') id: string) {
		return this.chatService.getChatUsers({ chatId: id })
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('kick')
	@Auth()
	async kickUserFromChat(
		@Body() dto: KickUserFromChatDto,
		@CurrentUser('id') userId: string
	) {
		return this.chatUsersService.kickUserFromChat({
			chatId: dto.chatId,
			requesterId: userId,
			targetLogin: dto.userLogin
		})
	}
}
