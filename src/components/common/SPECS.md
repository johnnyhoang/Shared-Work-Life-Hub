# 🧩 MODULE SPECS: SHARED UI COMPONENTS

> **Location:** `src/components/common/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Các thành phần giao diện dùng chung (Shared UI Components)** cung cấp các khối xây dựng cốt lõi được tái sử dụng xuyên suốt toàn bộ ứng dụng:
- Quản lý tệp đính kèm và phòng trưng bày hình ảnh Backblaze B2 (`AttachmentGallery`).
- Trình xem ảnh phóng to toàn màn hình (`ImageLightboxModal`).
- Trợ lý gợi ý gõ `@Mention` và thanh chọn avatar người nhận việc (`MentionAutocomplete`).
- Thẻ đại diện người dùng (`UserAvatar`) hỗ trợ hình ảnh, emoji và chữ cái đầu.
- Modal tạo nhanh việc / ý tưởng (`QuickActionModal`).
- Modal tạo không gian làm việc mới (`CreateWorkspaceModal`).

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`AttachmentGallery.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/AttachmentGallery.tsx) | Component | Lưới hiển thị thumbnail 16:9 cho ảnh & thẻ tài liệu, kéo thả tải file lên B2, xóa file, tải về 1 chạm |
| [`ImageLightboxModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/ImageLightboxModal.tsx) | Component | Modal zoom ảnh full-screen qua React Portal (`document.body`), nút Next / Prev, Download, bàn phím mũi tên & Esc |
| [`MentionAutocomplete.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/MentionAutocomplete.tsx) | Hook & Components | Hook `useMention`, popover gợi ý `MentionDropdown`, thanh chọn avatar `AssigneePickerChips` |
| [`UserAvatar.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/UserAvatar.tsx) | Component | Hiển thị avatar tròn nhất quán: hỗ trợ link ảnh URL, icon Emoji, hoặc chữ cái viết tắt của tên |
| [`QuickActionModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/QuickActionModal.tsx) | Component | Modal thêm nhanh Công việc hoặc Ý tưởng với `@Mention`, thanh chọn thành viên, hạn chót và dự án |
| [`CreateWorkspaceModal.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/CreateWorkspaceModal.tsx) | Component | Modal tạo không gian nhóm mới, tự động tạo slug và chuyển hướng không gian |

---

## 3. Quy chuẩn kỹ thuật chi tiết

### `AttachmentGallery` & `ImageLightboxModal`:
- Tích hợp chuẩn **AWS S3 SDK Client** hướng tới **Backblaze B2 Bucket**.
- Hỗ trợ tải tệp tối đa **25MB/tệp**.
- Ảnh được hiển thị bằng thumbnail tỉ lệ 16:9 với hiệu ứng hover zoom và nút phóng to `ZoomIn`.
- Khi tải về, nếu gặp lỗi CORS trình duyệt, tự động fallback gọi API `/api/attachments/[id]` để lấy **Presigned Download URL** trực tiếp từ Backblaze B2.

### `MentionAutocomplete`:
- Hook `useMention({ users, onSelectUser })`:
  - Quét chuỗi văn bản trước vị trí con trỏ tìm pattern `(?:^|\s)@([^\s@]*)`.
  - Hỗ trợ phím `ArrowDown`, `ArrowUp`, `Enter`, `Tab`, `Escape`.
  - Tự động thay thế `@query` thành `@TênThànhViên ` và tự động cập nhật `assignee_id`.
- Component `AssigneePickerChips`:
  - Thanh cuộn ngang các avatar chip thành viên, cho phép click 1 chạm để đổi người làm việc ngay lập tức.
