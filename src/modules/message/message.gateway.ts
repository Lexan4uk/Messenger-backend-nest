import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
	cors: {
		origin: 'http://localhost:3000',
		credentials: true
	}
})
export class MessageGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server

	handleConnection(client: Socket) {}

	handleDisconnect(client: Socket) {}

	sendMessageToChat(chatId: string, message: any) {
		this.server.to(chatId).emit('newMessage', message)
	}

	@SubscribeMessage('joinChat')
	handleJoinChat(client: Socket, chatId: string) {
		client.join(chatId)
		//console.log(`Client ${client.id} joined room ${chatId}`)
	}
}
