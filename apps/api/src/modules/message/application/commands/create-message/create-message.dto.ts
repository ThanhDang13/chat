import { Message } from "@api/modules/message/domain/message.domain";

export type CallbackMessage = Message & { tempId: string };
