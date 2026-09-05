# 📡 MODULE SPECS: ACTIVITY FEED & TEAM UPDATES

> **Location:** `src/components/feed/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Bảng tin hoạt động (Activity Feed)** cung cấp dòng thời gian đồng bộ liên tục về mọi tương tác diễn ra trong Không gian làm việc:
- Tạo / cập nhật / hoàn thành công việc.
- Giao việc cho thành viên khác.
- Thêm ý tưởng mới, chuyển đổi ý tưởng thành công việc.
- Bình luận trao đổi và tải lên tệp đính kèm.

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`ActivityFeedScreen.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/feed/ActivityFeedScreen.tsx) | Component | Hiển thị toàn bộ dòng hoạt động nhóm, lọc theo loại hoạt động, tính năng tương tác |

---

## 3. Cấu trúc dữ liệu `Activity`
Dữ liệu được nạp từ bảng `sw_activities`:
- `actor_id`, `actor_name`, `actor_avatar`: Thông tin người thực hiện hành động.
- `target_user_id`: Người nhận (nếu là hành động giao việc).
- `entity_type`: `'task' | 'idea' | 'project' | 'comment' | 'attachment'`.
- `entity_id`: ID của đối tượng liên quan.
- `action_type`: `'created' | 'updated' | 'completed' | 'assigned' | 'commented' | 'uploaded'`.
- `summary`: Mô tả hành động thân thiện với người dùng (Zero-Tech info).
- `created_at`: Thời điểm diễn ra hành động.
