# 🌐 MODULE SPECS: REST API ROUTES

> **Location:** `src/app/api/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Next.js App Router API Routes** cung cấp các REST endpoints cho client tương tác với database Supabase và dịch vụ lưu trữ Backblaze B2, đảm bảo xác thực phiên người dùng (`auth.getUser()`) và phân quyền.

---

## 2. Danh sách Endpoints Map 1:1

| Endpoint Path | Methods | File mã nguồn | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `/api/hub` | `GET` | [`src/app/api/hub/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/hub/route.ts) | Nạp toàn bộ trạng thái hệ sinh thái cho workspace hiện tại |
| `/api/attachments` | `GET, POST` | [`src/app/api/attachments/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/attachments/route.ts) | `GET`: Lấy danh sách tệp đính kèm (có presigned url). `POST`: Upload file lên B2 & lưu DB |
| `/api/attachments/[id]`| `GET, DELETE`| [`src/app/api/attachments/[id]/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/attachments/%5Bid%5D/route.ts) | `GET`: Sinh link tải presigned. `DELETE`: Xóa file trên B2 & DB |
| `/api/tasks` | `GET, POST` | [`src/app/api/tasks/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/tasks/route.ts) | Lấy danh sách và tạo mới công việc |
| `/api/tasks/[id]` | `PATCH, DELETE` | [`src/app/api/tasks/[id]/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/tasks/%5Bid%5D/route.ts) | Cập nhật thông tin công việc hoặc xóa việc |
| `/api/projects` | `GET, POST` | [`src/app/api/projects/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/projects/route.ts) | Quản lý dự án |
| `/api/projects/[id]` | `PATCH, DELETE`| [`src/app/api/projects/[id]/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/projects/%5Bid%5D/route.ts) | Cập nhật hoặc xóa dự án |
| `/api/ideas` | `GET, POST` | [`src/app/api/ideas/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/ideas/route.ts) | Lấy danh sách và tạo ý tưởng mới |
| `/api/ideas/[id]` | `PATCH, DELETE` | [`src/app/api/ideas/[id]/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/ideas/%5Bid%5D/route.ts) | Cập nhật trạng thái ý tưởng hoặc biến thành task |
| `/api/workspaces` | `GET, POST` | [`src/app/api/workspaces/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/workspaces/route.ts) | Lấy danh sách workspace của user & tạo workspace mới |
| `/api/workspaces/invitations` | `GET, POST` | [`src/app/api/workspaces/invitations/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/workspaces/invitations/route.ts) | Gửi và xem lời mời tham gia workspace |
| `/api/workspaces/members` | `GET, DELETE` | [`src/app/api/workspaces/members/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/workspaces/members/route.ts) | Quản lý danh sách thành viên trong workspace |
| `/api/comments` | `GET, POST` | [`src/app/api/comments/route.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/app/api/comments/route.ts) | Đọc và gửi bình luận trao đổi |

---

## 3. Quy chuẩn Xử lý Lỗi & Phản hồi
- **Mã lỗi chuẩn**: `400` (Thiếu tham số), `401` (Chưa đăng nhập), `403` (Không có quyền), `404` (Không tìm thấy), `500` (Lỗi máy chủ).
- **Thông điệp thân thiện**: Mọi thông báo lỗi trả về trong JSON `{ error: "..." }` đều phải là tiếng Việt/Anh thân thiện, không bao giờ để lọt raw SQL error.
