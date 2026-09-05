# 🌐 MODULE SPECS: INTERNATIONALIZATION (i18n)

> **Location:** `src/lib/i18n/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Đa ngôn ngữ (i18n)** đảm bảo toàn bộ giao diện, thông báo và nhãn trạng thái đều hỗ trợ song ngữ Tiếng Việt (`vi`) và Tiếng Anh (`en`), có thể chuyển đổi tức thì không cần tải lại trang.

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`index.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/i18n/index.tsx) | Context & Hook | `I18nProvider`, hook `useI18n()`, lưu lựa chọn ngôn ngữ vào `localStorage` |
| [`vi.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/i18n/vi.ts) | Từ điển | Bộ từ điển Tiếng Việt hoàn chỉnh cho toàn bộ ứng dụng |
| [`en.ts`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/lib/i18n/en.ts) | Từ điển | Bộ từ điển Tiếng Anh tương ứng chuẩn 1:1 theo các key |

---

## 3. Quy chuẩn Bổ sung Translation Keys
- Mọi key mới thêm vào `vi.ts` **bắt buộc** phải được thêm đồng thời vào `en.ts` với cùng cấu trúc đối tượng (object shape).
- Khi sử dụng trong component:
  ```tsx
  const { t, language, setLanguage } = useI18n();
  // Sử dụng: t.work.taskTitle, t.projects.tabAttachments, ...
  ```
