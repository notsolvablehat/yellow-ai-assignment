import { ticketHandlers } from './tickets';
import { messageHandlers } from './messages';
import { searchHandlers } from './search';

export const handlers = [...ticketHandlers, ...messageHandlers, ...searchHandlers];
