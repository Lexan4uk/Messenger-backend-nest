import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Query,
	ValidationPipe
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { Auth } from 'src/modules/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator'
import { MessageResponseDto, MessageSentDto } from './dto/message-response.dto'
import { CreateMessageDto, GetMessagesDto } from './dto/message.dto'
import { MessageService } from './message.service'

@ApiTags('message')
@ApiBearerAuth('access-token')
@Auth()
@Controller('message')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Post()
	@HttpCode(200)
	@ApiOperation({ summary: 'Создать сообщение' })
	@ApiResponse({ status: 200, type: MessageSentDto })
	async createMessage(
		@Body() dto: CreateMessageDto,
		@CurrentUser('id') userId: string
	): Promise<MessageSentDto> {
		return this.messageService.newMessage({
			chatId: dto.chatId,
			content: dto.content,
			senderId: userId
		})
	}

	@Get('chat')
	@HttpCode(200)
	@ApiOperation({ summary: 'Получить список сообщений чата' })
	@ApiResponse({ status: 200, type: [MessageResponseDto] })
	async getMessages(
		@Query(new ValidationPipe({ transform: true })) dto: GetMessagesDto
	): Promise<MessageResponseDto[]> {
		return this.messageService.getChatMessages(dto)
	}
}
