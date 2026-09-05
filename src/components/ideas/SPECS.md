# 💡 MODULE SPECS: IDEAS FUNNEL

> **Location:** `src/components/ideas/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Phễu Ý tưởng (Ideas Funnel)** là nơi nảy mầm và nuôi dưỡng các sáng kiến của nhóm qua 4 giai đoạn tiến hóa tự nhiên mà không gây áp lực công việc ngay từ đầu:

$$\text{Ý tưởng nhen nhóm (idea)} \longrightarrow \text{Cân nhắc/Để sau (maybe)} \longrightarrow \text{Lên kế hoạch (planned)} \longrightarrow \text{Biến thành công việc (converted)}$$

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`IdeasScreen.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/ideas/IdeasScreen.tsx) | Component | Hiển thị 4 phân nhóm ý tưởng, thanh tạo ý tưởng nhanh, nút chuyển trạng thái, nút chuyển thành task, và ngăn mở rộng tệp đính kèm (`AttachmentGallery`) |

---

## 3. Quy trình chuyển đổi & Tệp đính kèm

1. **Thao tác chuyển đổi trạng thái**:
   - `idea` $\rightarrow$ `maybe` (Cân nhắc).
   - `maybe` $\rightarrow$ `planned` (Đã lên kế hoạch).
   - `Biến thành công việc (Convert to Task)`: Tự động tạo một Task mới trong `sw_tasks` với tiêu đề và mô tả của ý tưởng, đồng thời đánh dấu ý tưởng là `converted`.
2. **Đính kèm tệp tin cho Ý tưởng**:
   - Mỗi thẻ ý tưởng tích hợp nút **"📎 Tệp đính kèm"** để mở rộng trực tiếp component [`AttachmentGallery`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/components/common/AttachmentGallery.tsx) với `entityType="idea"`, `entityId={idea.id}`.
   - Hỗ trợ lưu trữ tài liệu tham khảo, mockup ảnh, bản vẽ phác thảo trên Backblaze B2.
