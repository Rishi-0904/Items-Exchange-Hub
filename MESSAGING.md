# Book Exchange Hub - Messaging System

## Overview
The messaging system allows users to communicate about books they're interested in exchanging, lending, or selling.

## Features
- **Real-time messaging**: Send and receive messages instantly
- **Conversation management**: Organize conversations by book
- **Message status**: Track read/unread status
- **User-friendly interface**: Clean, responsive design

## API Endpoints

### Messages
- `GET /api/messages` - Get all conversations for the current user
- `POST /api/messages/conversation` - Create or get existing conversation
- `GET /api/messages/conversation?conversationId={id}` - Get messages for a conversation
- `POST /api/messages/send` - Send a new message
- `PUT /api/messages/send` - Mark messages as read

## Components
- `MessageList` - Displays messages in a conversation
- `MessagingInterface` - Main messaging interface with conversation list
- `MessageButton` - Button to start conversations from book listings

## Usage
1. Browse books on the main page
2. Click "Message [Owner Name] about this book" on any book card
3. Start chatting about the book
4. Access all conversations from the Messages page

## Database Models
- `Message` - Individual messages with sender, content, and read status
- `Conversation` - Groups messages between users about specific books
