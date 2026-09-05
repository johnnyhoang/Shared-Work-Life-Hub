# 📜 RULES & DEVELOPMENT GUIDELINES

> **Tài liệu tham chiếu quy chuẩn phát triển dành cho Developer và AI Agents.**

---

## 1. 🛡️ Quy tắc giao diện người dùng (Zero-Technical Info UI)

- **Mục tiêu**: Đảm bảo trải nghiệm người dùng cuối chuyên nghiệp, sạch sẽ và an toàn.
- **Quy chuẩn**:
  - **KHÔNG BAO GIỜ** hiển thị UUID, database IDs (như `ws-12345...`, `prof-67890...`), khóa ngoại, hoặc chuỗi ID ngẫu nhiên trên bất kỳ thành phần UI nào.
  - **KHÔNG BAO GIỜ** hiển thị raw error messages hoặc stack traces từ PostgreSQL/Supabase (ví dụ `violates foreign key constraint...`).
  - **LUÔN LUÔN** hiển thị thông tin bằng:
    - Tên hiển thị người dùng (`user.name`), Email (`user.email`).
    - Tên không gian (`workspace.name`), Tên dự án (`project.name`).
    - Thông báo lỗi thân thiện, dễ hiểu bằng Tiếng Việt hoặc Tiếng Anh tương ứng với ngôn ngữ đang chọn.

---

## 2. 🌿 Quy tắc quản trị mã nguồn (Git Rules)

- **KHÔNG TỰ Ý COMMIT HOẶC PUSH**: Tuyệt đối không tự động chạy `git commit` hoặc `git push` trong bất kỳ tình huống nào nếu người dùng không đưa ra yêu cầu cụ thể.
- Giữ cây thư mục mã nguồn sạch sẽ, không commit các file rác, file `.env` chứa mật khẩu thực tế hoặc artifact tạm.

---

## 3. ☁️ Quy tắc lưu trữ tệp tin & Đa phương tiện (Backblaze B2 S3 API)

- **Cấu hình S3 Client**: Sử dụng `@aws-sdk/client-s3` và `@aws-sdk/s3-request-presigner`.
- **Hỗ trợ biến môi trường**: Tương thích cả tiền tố `S3_*` và `B2_*`:
  - `S3_ENDPOINT` / `B2_ENDPOINT`
  - `S3_REGION` / `B2_REGION`
  - `S3_ACCESS_KEY_ID` / `B2_KEY_ID`
  - `S3_SECRET_ACCESS_KEY` / `B2_APPLICATION_KEY`
  - `S3_BUCKET_NAME` / `B2_BUCKET_NAME`
- **Quy chuẩn đặt tên đường dẫn lưu trữ**:
  `attachments/{entity_type}/{entity_id}/{timestamp}_{randomSuffix}_{cleanFilename}`
- **Bảo mật Private Bucket**:
  - Vì bucket mặc định được đặt ở chế độ `Private`, mọi URL truy cập ảnh hoặc tải file phải sử dụng **Presigned URLs** có thời hạn (24h khi nạp danh sách hoặc sinh on-demand khi tải về).
- **Trải nghiệm hiển thị**:
  - Ảnh đính kèm phải hiển thị thumbnail tỉ lệ 16:9 rõ ràng, click vào ảnh phải mở `ImageLightboxModal` toàn màn hình có Next / Prev / Download.
  - File tài liệu (PDF, Word, Excel, ZIP) phải hiển thị icon nhận diện theo loại file và cho phép tải về 1 chạm.

---

## 4. 👥 Quy tắc phân quyền & Cô lập dữ liệu (Multi-Workspace Isolation)

- Toàn bộ các bảng trong cơ sở dữ liệu (`sw_tasks`, `sw_projects`, `sw_ideas`, `sw_attachments`, `sw_knowledge`, `sw_decisions`, `sw_comments`) **bắt buộc** phải chứa cột `workspace_id`.
- Mọi truy vấn đọc/ghi đều phải được lọc theo `workspace_id` của workspace đang được chọn (`activeWorkspace.id`).
- Vai trò thành viên gồm:
  - `admin`: Người tạo workspace hoặc được cấp quyền quản trị (được quyền mời thành viên, đổi quyền, đổi tên workspace, xóa tệp/dự án).
  - `member`: Thành viên tham gia (xem, tạo và cập nhật công việc, ý tưởng, tệp đính kèm).

---

## 5. 🌐 Quy chuẩn Đa ngôn ngữ (i18n Standard)

- Tất cả chuỗi văn bản giao diện phải được khai báo trong [`src/lib/i18n/vi.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/i18n/vi.ts) và [`src/lib/i18n/en.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/i18n/en.ts).
- Sử dụng hook `useI18n()` để lấy đối tượng `t` và `language`.
- Khi bổ sung tính năng mới, phải cập nhật đồng thời cả hai bộ từ điển `vi` và `en`.

---

## 6. 🎨 Quy chuẩn Thiết kế UI/UX Tinh gọn & Nhất quán (Minimalist UI & Style Invariants)

1. **Giao diện cực kỳ đơn giản & Style nhất quán ở mọi nơi**:
   - Tất cả các màn hình, popup, thẻ (cards), thanh điều hướng đều phải tuân theo một hệ thống style chung: bo góc tròn mềm mại (`rounded-2xl`, `rounded-3xl`), border mỏng tinh tế (`border-zinc-200 dark:border-zinc-800`), đổ bóng nhẹ nhàng (`shadow-xs` / `shadow-sm`).
2. **Gom gọn tránh chiếm không gian & Tuyệt đối tránh "Box trong Box" (No Box-in-Box Nesting)**:
   - Hạn chế tối đa việc lồng ghép nhiều khung viền / card con bên trong card mẹ gây rối mắt và lãng phí diện tích hiển thị.
   - Tối ưu khoảng cách padding và margin gọn gàng, liền mạch, ưu tiên giao diện phẳng và thoáng đãng.
3. **Chữ nghĩa ngắn gọn — Ưu tiên Icon trực quan (Icon-First & Minimal Text)**:
   - Cắt giảm câu chữ rườm rà, giải thích dài dòng trên giao diện; tập trung vào nội dung cốt lõi của người dùng.
   - Sử dụng các biểu tượng (Lucide Icons) có ý nghĩa rõ ràng, dễ hiểu ngay từ cái nhìn đầu tiên (ví dụ: 📎 tệp đính kèm, 💬 bình luận, 🚩 ưu tiên, 📁 dự án, 📅 hạn chót).
4. **Dùng màu sắc chuẩn để phân loại & nhận biết trạng thái tức thì (Color-Coded Status & Semantics)**:
   - 🔴 **Đỏ / Rose (`text-rose-500`, `bg-rose-50`)**: Khẩn cấp (Urgent), quá hạn (Overdue), xóa, cảnh báo.
   - 🟠 **Cam / Amber (`text-amber-500`, `bg-amber-50`)**: Đang làm (In Progress), ý tưởng mới (Raw Idea), mức ưu tiên cao.
   - 🔵 **Xanh dương / Blue (`text-blue-500`, `bg-blue-50`)**: Cần làm (Todo), công việc, thông tin chung, nút hành động chính (Primary Action).
   - 🟢 **Xanh lá / Emerald (`text-emerald-500`, `bg-emerald-50`)**: Đã xong (Done), hoàn thành, trạng thái thành công, ý tưởng đã chuyển đổi.
   - 🟣 **Tím / Purple (`text-purple-500`, `bg-purple-50`)**: Đã lên kế hoạch (Planned), quyết định quan trọng.
   - ⚪ **Xám / Zinc (`text-zinc-500`, `bg-zinc-100 dark:bg-zinc-800`)**: Hộp thư (Inbox), mức thấp (Low priority), thông tin phụ.

