export interface TypeMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  property_id: number;
  content: string;
  sent_at: string;
  status: "SEND" | "READ";
}
