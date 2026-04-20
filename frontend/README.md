# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# FoodOrder
A modern Food Ordering Web Application developed using React and Vite, featuring responsive UI, shopping cart, and order management

## Cài đặt và chạy

```bash
git clone <LINK_REPO>
cd FoodOrder
npm install
npm run dev
```

## 🛠 Quy trình làm việc nhóm (Git Workflow)
### Quy tắc đặt tên nhánh

- Bắt buộc đặt tên nhánh theo tên cá nhân (viết liền, không dấu, ngăn cách bằng dấu `-`).
- Ví dụ: `nguyen-quoc-dat`.

### Workflow 
1. **Trước khi code, luôn cập nhật `main` mới nhất:**

```bash
git checkout main
git pull origin main
```

2. **Tạo nhánh cá nhân theo đúng quy tắc tên:**

```bash
git checkout -b nguyen-quoc-dat (-b là tạo nhánh trên git, tạo rồi thì bỏ -b đi. VD: git checkout nguyen-quoc-dat)
```

3. **Code tính năng, sau đó add và commit rõ ràng:**

```bash
git add .
git commit -m "feat: mo ta thay doi"
```

4. **Đẩy nhánh cá nhân lên GitHub:**

```bash
git push origin nguyen-quoc-dat
```

5. **Tạo Pull Request (PR) để Leader review và merge vào `main`.**

### Lưu ý quan trọng

- Không bao giờ push trực tiếp lên `main`.
- Luôn kiểm tra và xử lý conflict trước khi merge PR.
