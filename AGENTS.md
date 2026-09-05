<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Git Rules
- **Không tự ý commit/push:** Tuyệt đối không tự động chạy `git commit` hoặc `git push` nếu người dùng không có yêu cầu cụ thể.

# Global UI Rules
- **Không bao giờ hiển thị thông tin kỹ thuật trên UI:** Tuyệt đối không hiển thị UUIDs, database IDs (`prof-xxx`, `ws-xxx`), khóa ngoại, hoặc chuỗi raw SQL errors.
- **Giao diện cực kỳ đơn giản & Style nhất quán (Consistent Minimalist UI):** Đảm bảo phong cách tinh gọn, nhất quán trên tất cả màn hình, popup, thẻ và danh sách.
- **Gom gọn & Tránh Box trong Box (No Box-in-Box Nesting):** Không lồng ghép nhiều khung viền/hộp con bên trong hộp mẹ gây rối mắt và tốn diện tích. Khoảng cách padding/margin gọn gàng, phẳng và thoáng.
- **Chữ nghĩa ít thôi — Ưu tiên Icon trực quan (Icon-First & Minimal Text):** Giảm thiểu văn bản rườm rà, ưu tiên biểu tượng (Lucide icons) có ngữ nghĩa cao và dễ hiểu.
- **Dùng màu sắc để phân loại & nhận biết trạng thái (Color-Coded Status):**
  - 🔴 Đỏ / Rose: Khẩn cấp (Urgent), quá hạn (Overdue), xóa, cảnh báo.
  - 🟠 Cam / Amber: Đang làm (In Progress), ý tưởng mới (Idea), ưu tiên cao.
  - 🔵 Xanh dương / Blue: Cần làm (Todo), công việc, primary action.
  - 🟢 Xanh lá / Emerald: Đã xong (Done), thành công, ý tưởng đã chuyển đổi.
  - 🟣 Tím / Purple: Đã lên kế hoạch (Planned), quyết định quan trọng.
  - ⚪ Xám / Zinc: Hộp thư (Inbox), ưu tiên thấp, thông tin phụ.

# 📚 Architecture & Spec Map (1:1 Co-located Specs)
- **Core Architecture Blueprint**: Đọc tài liệu tại [docs/CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)
- **Development Rules & Guidelines**: Đọc tài liệu tại [docs/RULES_AND_GUIDELINES.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/RULES_AND_GUIDELINES.md)
- **Co-located Module Specs**: Mỗi thư mục mã nguồn đều chứa file `SPECS.md` đặc tả chi tiết 1:1:
  - `src/components/home/SPECS.md`
  - `src/components/work/SPECS.md`
  - `src/components/projects/SPECS.md`
  - `src/components/ideas/SPECS.md`
  - `src/components/feed/SPECS.md`
  - `src/components/more/SPECS.md`
  - `src/components/common/SPECS.md`
  - `src/components/layout/SPECS.md`
  - `src/context/SPECS.md`
  - `src/lib/services/SPECS.md`
  - `src/lib/i18n/SPECS.md`
  - `src/app/api/SPECS.md`

