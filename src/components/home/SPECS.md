# 🏠 MODULE SPECS: HOME & DASHBOARD OVERVIEW

> **Location:** `src/components/home/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Màn hình **Tổng quan (Home Dashboard)** là trung tâm điều hướng và nắm bắt thông tin quan trọng nhất trong ngày của người dùng, bao gồm:
1. Lời chào cá nhân hóa theo thời gian thực (Sáng / Chiều / Tối).
2. Biểu ngữ quản lý lời mời tham gia không gian làm việc (`InvitationBanner`).
3. Khối nhiệm vụ khẩn cấp cần bạn hành động ngay (`Needs Your Action`).
4. Khối nhật ký hoạt động gần đây của toàn nhóm (`Recent Activities`) có khả năng nhấp chuột để mở chi tiết công việc hoặc dự án.

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`HomeScreen.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/home/HomeScreen.tsx) | Component | Render toàn bộ giao diện dashboard, logic phân loại việc cần xử lý và nhật ký |
| [`InvitationBanner.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/home/InvitationBanner.tsx) | Component | Hiển thị thông báo khi có lời mời vào workspace mới, chấp nhận / từ chối |

---

## 3. Luồng dữ liệu & Tương tác

1. **Khối "Cần bạn xử lý ngay" (`actionRequired`)**:
   - Lọc từ `hubState.attention.actionRequired` với điều kiện:
     - `task.assignee_id === currentUser.id` (Chỉ những việc giao cho bạn).
     - `task.status !== 'done'` VÀ (`task.priority === 'urgent'` HOẶC `isOverdue` HOẶC `task.status === 'inbox'`).
   - Nhấp vào một công việc $\rightarrow$ kích hoạt `setSelectedTask(task)` mở [`TaskDetailModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/work/TaskDetailModal.tsx).
   - Nhấp vào nút tick tròn $\bigcirc$ $\rightarrow$ gọi `toggleTaskStatus(task)` để hoàn thành ngay.

2. **Khối "Nhật ký gần đây" (`recentActivities`)**:
   - Hiển thị 6 hoạt động mới nhất từ `hubState.recentActivities`.
   - Mỗi dòng hiển thị: Avatar người thực hiện, tóm tắt hành động, dự án liên quan, thời gian tương đối (`formatRelativeTime`).
   - Nhấp vào dòng nhật ký:
     - Nếu là `entity_type === 'task'` $\rightarrow$ tìm task tương ứng và gọi `setSelectedTask(task)`.
     - Nếu là `entity_type === 'project'` $\rightarrow$ chuyển hướng sang màn hình Dự án.

---

## 4. Quy tắc UI & i18n
- Mọi chuỗi ký tự đều sử dụng qua `t.home.*` trong [`src/lib/i18n/`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/i18n).
- Tuyệt đối không hiển thị UUID hoặc mã kỹ thuật khi render danh sách lời mời hoặc công việc.
