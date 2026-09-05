# 🔄 MODULE SPECS: GLOBAL CONTEXT STATE

> **Location:** `src/context/`  
> **Core Spec Link:** [CORE_SPECS.md](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/docs/CORE_SPECS.md)

---

## 1. Mục đích & Vai trò
Module **Global Context State (`HubContext`)** là trung tâm quản lý trạng thái, đồng bộ dữ liệu theo thời gian thực và cung cấp các hàm nghiệp vụ (Actions) cho toàn bộ ứng dụng.

---

## 2. Danh sách File mã nguồn Map 1:1

| File | Loại | Trách nhiệm |
| :--- | :--- | :--- |
| [`HubContext.tsx`](file:///d:/Hoa%20Hoang/Apps/share_work_life_hub/src/context/HubContext.tsx) | React Context Provider | Khởi tạo state, cơ chế Polling đồng bộ, quản lý Workspace hiện tại, cung cấp các hàm CRUD Task/Project/Idea/Workspace |

---

## 3. Cấu trúc State cốt lõi (`HubState`)

```typescript
interface HubState {
  currentUser: User;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  ideas: Idea[];
  knowledge: KnowledgeTopic[];
  decisions: Decision[];
  recentActivities: Activity[];
  pendingInvitations: WorkspaceInvitation[];
  attention: {
    actionRequired: { task: Task; reason: string }[];
    waitingOnOthers: { task: Task; reason: string }[];
  };
}
```

---

## 4. Cơ chế Đồng bộ & Cập nhật dữ liệu
1. **Initial Hydration**: Gọi API `GET /api/hub?workspace_id=...` để nạp toàn bộ dữ liệu của workspace được chọn.
2. **Polling Loop**: Định kỳ mỗi 30 giây tự động gọi làm mới dữ liệu nền mà không làm gián đoạn tương tác của người dùng.
3. **Optimistic Updates**: Khi thực hiện các thao tác nhanh (như `toggleTaskStatus`), state được cập nhật cục bộ ngay lập tức trên UI trước khi nhận phản hồi từ server.
