# Bed Board Chart Plugin

Plugin biểu đồ Apache Superset dùng để hiển thị tình trạng giường, người bệnh
nội trú và ghi chú lâm sàng theo `encounter_id`.

## Chức năng

- Nhóm giường theo khoa và phòng.
- Hiển thị thông tin người bệnh, chẩn đoán, bác sĩ và cấp chăm sóc.
- Hiển thị các chỉ báo thuốc, xét nghiệm và hồ sơ chưa ký.
- Mở mini-web để thêm ghi chú lâm sàng.
- Đọc các ghi chú gần nhất trong bảng thông tin người bệnh.
- Xem các trạng thái `reserved`, `waiting`, `pending` và “chờ tiếp nhận” như
  `occupied`.

## Các cột dữ liệu

Dataset Superset cần cung cấp các cột sau:

| Cột                  | Ý nghĩa                    |
| -------------------- | -------------------------- |
| `ward`               | Khoa                       |
| `room`               | Phòng                      |
| `bed_code`           | Mã giường                  |
| `bed_status`         | Trạng thái giường          |
| `encounter_id`       | ID lần điều trị            |
| `patient_id`         | ID người bệnh              |
| `patient_name`       | Tên người bệnh             |
| `age`                | Tuổi                       |
| `gender`             | Giới tính                  |
| `admission_time`     | Thời gian nhập viện        |
| `diagnosis_code`     | Mã chẩn đoán               |
| `diagnosis`          | Chẩn đoán                  |
| `care_level`         | Cấp chăm sóc               |
| `doctor`             | Bác sĩ phụ trách           |
| `nurse`              | Điều dưỡng phụ trách       |
| `medication_pending` | Số thuốc đang chờ          |
| `lab_pending`        | Số xét nghiệm đang chờ     |
| `unsigned_docs`      | Số hồ sơ chưa ký           |
| `note_count`         | Tổng số ghi chú            |
| `latest_note_at`     | Thời gian ghi chú mới nhất |

Nếu trạng thái không được nhận diện nhưng bản ghi có `encounter_id`,
`patient_id` hoặc `patient_name`, plugin xem giường là `occupied`.

## Cấu hình Notes

Trong phần cấu hình biểu đồ:

- **Notes Mini Web URL**: mặc định `http://localhost:8001/notes`.
- **Notes API URL**: mặc định `http://localhost:8001/api/v1`.

Superset và Notes API phải dùng cùng hostname để cookie phiên được gửi, ví dụ:

- Superset: `http://localhost:8088`
- Notes API: `http://localhost:8001`

Notes API xác thực cookie qua `/api/v1/me/roles/` của Superset. API lấy
`userId`, họ tên và role của tài khoản đang đăng nhập, kiểm tra quyền rồi lưu
`userId` vào `notes_module.clinical_note.author_user_id`. Frontend không gửi và
không được phép tự đặt ID người tạo ghi chú.

Các role Notes mặc định:

- `Admin` hoặc `NotesAdmin`: đọc, ghi và đính chính.
- `NotesWriter`: đọc và ghi.
- `NotesCorrector`: đọc, ghi và đính chính.
- `NotesReader`, `Alpha`, `Gamma`: chỉ đọc.

Việc ánh xạ role được cấu hình trong Notes API bằng:

- `SUPERSET_NOTES_READ_ROLES`
- `SUPERSET_NOTES_WRITE_ROLES`
- `SUPERSET_NOTES_CORRECTION_ROLES`

## Build

Từ thư mục plugin:

```powershell
npm run build
```

Để tạo lại toàn bộ bundle production của Superset:

```powershell
cd ..\..\..
npm run build
```

Sau đó restart riêng web container:

```powershell
docker restart superset-superset-recovery
```

## Kiểm thử

Chạy từ `superset-frontend`:

```powershell
npm run test -- --testRegex "plugins/plugin-chart-bed-board/test/(BedBoard|transformProps)[.]test[.]tsx?$"
```

Kiểm tra định dạng:

```powershell
npx prettier --check `
  plugins/plugin-chart-bed-board/src `
  plugins/plugin-chart-bed-board/test
```

## Mở Superset

```text
http://localhost:8088
```

Nếu trình duyệt vẫn dùng bundle cũ, nhấn `Ctrl + F5`.
