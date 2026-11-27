// fixtures.ts — dữ liệu mẫu dùng chung cho mọi file test.
import type { Post } from '../src/posts.js';

// Dữ liệu mẫu: giống data/posts.json của các topic trước
export const POSTS: Post[] = [
  { id: 'p1', title: 'Xe may Wave Alpha', price: 9500000,
    status: 'available', sellerId: 'u1' },
  { id: 'p2', title: 'Sach Clean Code', price: 150000,
    status: 'available', sellerId: 'u2' },
  { id: 'p3', title: 'Tu lanh Panasonic 180L', price: 2800000,
    status: 'available', sellerId: 'u1' },
  { id: 'p4', title: 'Ban hoc go soi', price: 1200000,
    status: 'reserved', sellerId: 'u3' },
  { id: 'p5', title: 'Dien thoai iPhone 11', price: 4500000,
    status: 'available', sellerId: 'u2' },
  { id: 'p6', title: 'Ghe xoay van phong', price: 700000,
    status: 'sold', sellerId: 'u3' },
  { id: 'p7', title: 'Noi com dien Sharp', price: 350000,
    status: 'available', sellerId: 'u1' },
  { id: 'p8', title: 'Tai nghe Sony WH-1000XM4', price: 3200000,
    status: 'available', sellerId: 'u2' },
];
