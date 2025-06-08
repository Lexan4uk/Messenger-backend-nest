import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CreateMessageDto, GetMessagesDto } from './dto/message.dto'
import { MessageService } from './message.service'

@Controller('message')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async createMessage(
		@Body() dto: CreateMessageDto,
		@CurrentUser('id') userId: string
	) {
		return this.messageService.newMessage({
			chatId: dto.chatId,
			content: dto.content,
			senderId: userId
		})
	}
	@UsePipes(new ValidationPipe({ transform: true }))
	@HttpCode(200)
	@Get('chat')
	@Auth()
	async getMessages(@Query() dto: GetMessagesDto) {
		return this.messageService.getChatMessages(dto)
	}
}
