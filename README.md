

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
