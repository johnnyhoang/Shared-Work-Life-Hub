# 🛠️ MODULE SPECS: BACKEND & STORAGE SERVICES

> **Location:** `src/lib/services/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Backend & Storage Services** chịu trách nhiệm xử lý các tác vụ tầng dưới:
1. Giao tiếp với **Backblaze B2 Cloud Storage qua AWS S3 SDK** (`b2StorageService.ts`).
2. Thực thi các phép biến đổi dữ liệu (Mutations / Transactions) trên **Supabase PostgreSQL** (`supabaseMutations.ts`).
3. Tính toán và định dạng thời gian thân thiện (`dateUtils.ts`).

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`b2StorageService.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/services/b2StorageService.ts) | Service | Cấu hình S3 Client kết nối Backblaze B2, hàm `uploadFileToB2`, `deleteFileFromB2`, `getPresignedDownloadUrl`, `isB2Configured` |
| [`supabaseMutations.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/services/supabaseMutations.ts) | Service | Toàn bộ logic tương tác cơ sở dữ liệu Supabase: CRUD Tasks, Projects, Ideas, Comments, Workspaces, Invitations, Activities |
| [`dateUtils.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/dateUtils.ts) | Utility | Định dạng thời gian tương đối (`formatRelativeTime`), phân tích hạn chót (`formatDueDate`), kiểm tra quá hạn |

---

## 3. Chi tiết dịch vụ Backblaze B2 (`b2StorageService.ts`)

- **Hỗ trợ biến môi trường**: Tương thích cả tiền tố `S3_*` và `B2_*`:
  - `S3_ENDPOINT` (hoặc `B2_ENDPOINT`)
  - `S3_REGION` (hoặc `B2_REGION`)
  - `S3_ACCESS_KEY_ID` (hoặc `B2_KEY_ID`)
  - `S3_SECRET_ACCESS_KEY` (hoặc `B2_APPLICATION_KEY`)
  - `S3_BUCKET_NAME` (hoặc `B2_BUCKET_NAME`)
- **Tải lên an toàn (`uploadFileToB2`)**:
  - Chuẩn hóa tên file, tạo đường dẫn độc nhất: `attachments/{entityType}/{entityId}/{timestamp}_{random}_{cleanName}`.
  - Sử dụng `PutObjectCommand` đẩy trực tiếp Buffer lên B2 Bucket.
- **Tải về an toàn (`getPresignedDownloadUrl`)**:
  - Dùng `getSignedUrl` từ `@aws-sdk/s3-request-presigner` để tạo link truy cập tạm thời cho Private Bucket (mặc định 3600s hoặc 86400s).
- **Xóa tệp (`deleteFileFromB2`)**:
  - Dùng `DeleteObjectCommand` xóa file vật lý trên B2 khi người dùng xóa tệp đính kèm.
