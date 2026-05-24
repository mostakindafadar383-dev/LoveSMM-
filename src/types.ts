/**
 * SMM Panel Domain Model Types
 */

export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  spent: number;
  apiKey: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
}

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  status: 'active' | 'inactive';
}

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number; // local selling price per 1000
  originalPrice: number; // upstream provider price per 1000
  minQuantity: number;
  maxQuantity: number;
  apiProviderId: number | null; // null means manual placement
  apiServiceId: number | null; // provider service ID
  status: 'active' | 'inactive';
}

export interface Order {
  id: number;
  username: string; // for admin log checking
  serviceId: number;
  serviceName: string;
  categoryName: string;
  link: string;
  quantity: number;
  charge: number;
  startCount: number;
  remains: number;
  status: 'pending' | 'inprogress' | 'completed' | 'partial' | 'canceled' | 'processing';
  apiProviderId: number | null;
  apiOrderId: number | null;
  source: 'web' | 'api';
  createdAt: string;
}

export interface Ticket {
  id: number;
  username: string; // for admin view
  subject: string;
  status: 'open' | 'pending' | 'answered' | 'closed';
  createdAt: string;
  replies: TicketReply[];
}

export interface TicketReply {
  id: number;
  author: 'user' | 'admin';
  message: string;
  createdAt: string;
}

export interface APIProvider {
  id: number;
  name: string;
  apiUrl: string;
  apiKey: string;
  balance: number;
  status: 'active' | 'inactive';
}

export interface PlatformSettings {
  siteName: string;
  siteCurrencySymbol: string;
  ticketSystemStatus: 'enabled' | 'disabled';
  maintenanceMode: 'enabled' | 'disabled';
}

export interface SMMFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: SMMFile[];
}
