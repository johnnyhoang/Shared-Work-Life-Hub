# 📁 MODULE SPECS: PROJECTS & ECOSYSTEMS

> **Location:** `src/components/projects/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Dự án (Projects)** đóng vai trò là chiếc hộp chứa đựng các mục tiêu, nhiệm vụ, ý tưởng, tài liệu tri thức, quyết định và tệp tin liên quan đến một phạm vi công việc nhất định.

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`ProjectsScreen.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/projects/ProjectsScreen.tsx) | Component | Danh sách các dự án trong workspace, tiến độ công việc theo dự án, nút tạo dự án mới |
| [`ProjectDetailModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/projects/ProjectDetailModal.tsx) | Component | Modal chi tiết dự án với hệ thống tab: Công việc, Ý tưởng, Tệp đính kèm (Backblaze B2), Kiến thức, Quyết định, Nhật ký |

---

## 3. Cấu trúc Tabs trong Chi tiết Dự án (`ProjectDetailModal`)

1. **Tab `tasks` (Công việc)**:
   - Liệt kê các công việc có `task.project_id === selectedProject.id`.
   - Nút `+ Thêm công việc` gán trực tiếp vào dự án này.
2. **Tab `ideas` (Ý tưởng)**:
   - Các ý tưởng gắn với dự án.
3. **Tab `files` (Tệp đính kèm)**:
   - Tích hợp [`AttachmentGallery`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/AttachmentGallery.tsx) với `entityType="project"`, `entityId={selectedProject.id}`.
   - Quản lý toàn bộ tài liệu thiết kế, file báo cáo, hình ảnh của dự án.
4. **Tab `knowledge` (Kiến thức)**:
   - Ghi chú tài liệu, hướng dẫn (Guides), wiki nội bộ.
5. **Tab `decisions` (Quyết định)**:
   - Nhật ký các quyết định quan trọng (ADR / Decision Log) đã được chốt.
6. **Tab `activity` (Nhật ký)**:
   - Lịch sử thao tác liên quan tới dự án.

---

## 4. RLS & Quyền hạn
- Bất kỳ thành viên trong workspace đều có thể xem và đóng góp vào dự án.
- Chỉ Quản trị viên (`admin`) hoặc Người tạo dự án mới có quyền xóa hoặc đổi thông tin quan trọng của dự án.
