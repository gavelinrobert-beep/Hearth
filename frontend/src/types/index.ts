export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: string;
  createdAt: Date;
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  ownerId: string;
  channels: Channel[];
  members: ServerMember[];
}

export interface Channel {
  id: string;
  name: string;
  type: string;
  serverId: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  fileUrl?: string;
  moderated: boolean;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export interface DirectMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  fileUrl?: string;
  read: boolean;
  createdAt: Date;
}

export interface ServerMember {
  id: string;
  userId: string;
  serverId: string;
  roleId?: string;
  user: User;
}

export interface VoiceState {
  channelId: string;
  isMuted: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  participants: VoiceParticipant[];
  error?: string;
}

export interface VoiceParticipant {
  userId: string;
  username: string;
  speaking?: boolean;
}
