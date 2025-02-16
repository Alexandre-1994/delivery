export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'consumer' | 'restaurant' | 'delivery' | 'admin';
  address?: Address;
}
