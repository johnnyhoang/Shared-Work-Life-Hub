# ⚙️ MODULE SPECS: MORE & WORKSPACE SETTINGS

> **Location:** `src/components/more/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Mở rộng & Cài đặt (More & Settings)** quản lý các tính năng cấp hệ thống của không gian làm việc hiện tại:
1. Quản lý danh sách thành viên trong nhóm (`TeamMembersModal`).
2. Mời thành viên mới qua email và quản lý lời mời đang chờ (`InviteMemberModal`).
3. Phân quyền vai trò Quản trị viên (`admin`) và Thành viên (`member`).
4. Cài đặt thông báo (Telegram bot, Morning Digest Cron Job, Email).
5. Quản lý Kho kiến thức (`KnowledgeBaseModal`) và Sổ tay quyết định (`DecisionsModal`).

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`MoreScreen.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/more/MoreScreen.tsx) | Component | Menu cài đặt tổng hợp, danh sách nhóm, thông tin cá nhân, chuyển đổi ngôn ngữ |
| [`TeamMembersModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/more/TeamMembersModal.tsx) | Component | Modal xem danh sách thành viên, chuyển quyền admin/member, xóa thành viên |
| [`InviteMemberModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/more/InviteMemberModal.tsx) | Component | Modal nhập email mời tham gia không gian làm việc, hiển thị danh sách lời mời đang chờ |
| [`KnowledgeBaseModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/more/KnowledgeBaseModal.tsx) | Component | Quản lý sổ tay ghi chú và tài liệu kiến thức nhóm |
| [`DecisionsModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/more/DecisionsModal.tsx) | Component | Quản lý nhật ký quyết định quan trọng của nhóm |
| [`NotificationsModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/more/NotificationsModal.tsx) | Component | Cấu hình Telegram bot token, chat ID và thời gian gửi Morning Digest hàng ngày |

---

## 3. Quy tắc Bảo mật & Phân quyền
- Chỉ Quản trị viên (`admin`) hoặc Chủ sở hữu (`owner_id`) mới có quyền:
  - Gửi lời mời thành viên mới.
  - Hủy lời mời đang chờ.
  - Thay đổi vai trò thành viên khác giữa `admin` $\leftrightarrow$ `member`.
  - Xóa thành viên khỏi không gian làm việc.
- Tuyệt đối không hiển thị UUID hoặc Database IDs trong danh sách thành viên hay lời mời.
