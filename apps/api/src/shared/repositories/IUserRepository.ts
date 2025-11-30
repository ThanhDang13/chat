// import { IBaseRepository } from "@api/domain/repositories/IBaseRepository";
// import { User, UserProps } from "@api/domain/models/User";
// import { UserConditionDTO } from "@api/domain/dtos/user";

// export interface IUserRepository extends IBaseRepository<User, UserProps, UserConditionDTO> {
//   existByEmail(email: string): Promise<boolean>;
// }

// export interface IConversationRepository {
//   save(conversation: Conversation): Promise<void>;
//   findById(id: string): Promise<Nullable<Conversation>>;
//   list(paging: PagingDTO): Promise<Paginated<Conversation>>;
//   delete(id: string): Promise<void>;
// }

// export interface IMessageRepository {
//   save(message: Message): Promise<void>;
//   findById(id: number): Promise<Nullable<Message>>;
//   list(paging: PagingDTO): Promise<Paginated<Message>>;
//   delete(id: number): Promise<void>;
// }

// export interface IConversationParticipantRepository {
//   save(participant: ConversationParticipant): Promise<void>;
//   findById(conversationId: string, userId: string): Promise<Nullable<ConversationParticipant>>;
//   delete(conversationId: string, userId: string): Promise<void>;
// }

// export interface IMessageStatusRepository {
//   save(status: MessageStatus): Promise<void>;
//   findById(messageId: number, userId: string): Promise<Nullable<MessageStatus>>;
//   delete(messageId: number, userId: string): Promise<void>;
// }
