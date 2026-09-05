# 📐 MODULE SPECS: LAYOUT & NAVIGATION

> **Location:** `src/components/layout/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Khung sườn & Điều hướng (Layout & Navigation)** đảm bảo trải nghiệm người dùng liền mạch trên cả Desktop và Mobile:
1. Thanh tiêu đề phía trên (`Header`) tích hợp bộ chuyển đổi Không gian làm việc (`WorkspaceSwitcher`), thông tin người dùng đang đăng nhập và nút đăng xuất.
2. Thanh điều hướng đa nền tảng (`BottomNav`):
   - Trên **Desktop (màn hình rộng $\ge 768px$)**: Hiển thị dạng Sidebar cố định bên trái (Tổng quan, Công việc, Dự án, Nhật ký, Thêm).
   - Trên **Mobile (màn hình nhỏ $< 768px$)**: Hiển thị dạng Bottom Navigation Bar cố định ở cạnh dưới màn hình.
   - Nút Thao tác nhanh `+` nổi bật ở chính giữa.

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`Header.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/layout/Header.tsx) | Component | Top bar, hiển thị logo, bộ chọn Workspace, avatar người dùng, menu tài khoản |
| [`BottomNav.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/layout/BottomNav.tsx) | Component | Sidebar điều hướng trên Desktop & Bottom Nav Bar trên Mobile, chuyển đổi 5 tab chính |

---

## 3. Quản lý Không gian làm việc (`WorkspaceSwitcher`)
- Hiển thị danh sách tất cả các Workspace mà người dùng đang là Thành viên hoặc Chủ sở hữu.
- Cho phép nhấp chuyển đổi workspace tức thì; hệ thống sẽ lưu `activeWorkspaceId` vào `localStorage` và tự động fetch lại toàn bộ dữ liệu của workspace mới.
- Tích hợp nút `+ Tạo không gian mới` mở [`CreateWorkspaceModal`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/CreateWorkspaceModal.tsx).
