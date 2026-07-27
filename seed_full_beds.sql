BEGIN;

-- =====================================================
-- 1. Thêm 6 bệnh nhân mới
-- =====================================================

INSERT INTO warehouse.patient (
    patient_id,
    patient_name,
    age,
    gender
)
VALUES
    ('BN-0007', 'Vũ Minh Đức',      45, 'Nam'),
    ('BN-0008', 'Nguyễn Thị Lan',   61, 'Nữ'),
    ('BN-0009', 'Phan Văn Hùng',    53, 'Nam'),
    ('BN-0010', 'Trần Thu Hà',      39, 'Nữ'),
    ('BN-0011', 'Đặng Quốc Bảo',    70, 'Nam'),
    ('BN-0012', 'Lê Thị Hương',     58, 'Nữ')
ON CONFLICT (patient_id)
DO UPDATE SET
    patient_name = EXCLUDED.patient_name,
    age = EXCLUDED.age,
    gender = EXCLUDED.gender;


-- =====================================================
-- 2. Tạo 6 lần điều trị
-- Lấy care_level hợp lệ từ dữ liệu hiện có
-- =====================================================

WITH valid_levels AS (
    SELECT encounter_id, care_level
    FROM warehouse.encounter
    WHERE encounter_id IN (
        'ENC-2026-001',
        'ENC-2026-002',
        'ENC-2026-003',
        'ENC-2026-004',
        'ENC-2026-005',
        'ENC-2026-006'
    )
)
INSERT INTO warehouse.encounter (
    encounter_id,
    patient_id,
    admission_time,
    diagnosis_code,
    diagnosis,
    care_level
)
VALUES
    (
        'ENC-2026-007',
        'BN-0007',
        NOW() - INTERVAL '3 days',
        'J18.9',
        'Viêm phổi, không xác định tác nhân',
        (
            SELECT care_level
            FROM valid_levels
            WHERE encounter_id = 'ENC-2026-005'
        )
    ),
    (
        'ENC-2026-008',
        'BN-0008',
        NOW() - INTERVAL '2 days',
        'I10',
        'Tăng huyết áp nguyên phát',
        (
            SELECT care_level
            FROM valid_levels
            WHERE encounter_id = 'ENC-2026-004'
        )
    ),
    (
        'ENC-2026-009',
        'BN-0009',
        NOW() - INTERVAL '30 hours',
        'K29.7',
        'Viêm dạ dày, không xác định',
        (
            SELECT care_level
            FROM valid_levels
            WHERE encounter_id = 'ENC-2026-002'
        )
    ),
    (
        'ENC-2026-010',
        'BN-0010',
        NOW() - INTERVAL '20 hours',
        'E11.9',
        'Đái tháo đường type 2',
        (
            SELECT care_level
            FROM valid_levels
            WHERE encounter_id = 'ENC-2026-005'
        )
    ),
    (
        'ENC-2026-011',
        'BN-0011',
        NOW() - INTERVAL '12 hours',
        'J44.1',
        'Bệnh phổi tắc nghẽn mạn tính đợt cấp',
        (
            SELECT care_level
            FROM valid_levels
            WHERE encounter_id = 'ENC-2026-003'
        )
    ),
    (
        'ENC-2026-012',
        'BN-0012',
        NOW() - INTERVAL '6 hours',
        'I50.9',
        'Suy tim, không xác định',
        (
            SELECT care_level
            FROM valid_levels
            WHERE encounter_id = 'ENC-2026-001'
        )
    )
ON CONFLICT (encounter_id)
DO UPDATE SET
    patient_id = EXCLUDED.patient_id,
    admission_time = EXCLUDED.admission_time,
    diagnosis_code = EXCLUDED.diagnosis_code,
    diagnosis = EXCLUDED.diagnosis,
    care_level = EXCLUDED.care_level;

-- =====================================================
-- 3. Đưa bệnh nhân vào 3 giường đang trống/chờ tiếp nhận
-- =====================================================

UPDATE warehouse.current_bed
SET
    encounter_id = 'ENC-2026-007',
    bed_status = 'occupied',
    doctor = 'BS. Nguyễn Mai',
    nurse = 'ĐD. Thu Trang',
    medication_pending = 2,
    lab_pending = 1,
    unsigned_docs = 1
WHERE bed_code = 'NYC.G6.3';


UPDATE warehouse.current_bed
SET
    encounter_id = 'ENC-2026-008',
    bed_status = 'occupied',
    doctor = 'BS. Đặng Thành',
    nurse = 'ĐD. Minh Anh',
    medication_pending = 1,
    lab_pending = 2,
    unsigned_docs = 0
WHERE bed_code = 'NYC.G6.6';


UPDATE warehouse.current_bed
SET
    encounter_id = 'ENC-2026-009',
    bed_status = 'occupied',
    doctor = 'BS. Trần Minh',
    nurse = 'ĐD. Hải Yến',
    medication_pending = 2,
    lab_pending = 1,
    unsigned_docs = 1
WHERE bed_code = 'NYC.G6.8';


-- =====================================================
-- 4. Thêm giường NYC.G6.10
-- =====================================================

INSERT INTO warehouse.current_bed (
    bed_id,
    ward,
    room,
    bed_code,
    bed_status,
    encounter_id,
    doctor,
    nurse,
    medication_pending,
    lab_pending,
    unsigned_docs
)
SELECT
    COALESCE(MAX(bed_id), 0) + 1,
    'Khoa Nội Tổng hợp',
    '406',
    'NYC.G6.10',
    'occupied',
    'ENC-2026-010',
    'BS. Hoàng Anh',
    'ĐD. Ngọc Mai',
    3,
    2,
    1
FROM warehouse.current_bed
HAVING NOT EXISTS (
    SELECT 1
    FROM warehouse.current_bed
    WHERE bed_code = 'NYC.G6.10'
);


-- =====================================================
-- 5. Thêm giường NYC.G6.11
-- =====================================================

INSERT INTO warehouse.current_bed (
    bed_id,
    ward,
    room,
    bed_code,
    bed_status,
    encounter_id,
    doctor,
    nurse,
    medication_pending,
    lab_pending,
    unsigned_docs
)
SELECT
    COALESCE(MAX(bed_id), 0) + 1,
    'Khoa Nội Tổng hợp',
    '406',
    'NYC.G6.11',
    'occupied',
    'ENC-2026-011',
    'BS. Đặng Thành',
    'ĐD. Thu Trang',
    4,
    3,
    2
FROM warehouse.current_bed
HAVING NOT EXISTS (
    SELECT 1
    FROM warehouse.current_bed
    WHERE bed_code = 'NYC.G6.11'
);


-- =====================================================
-- 6. Thêm giường NYC.G6.12
-- =====================================================

INSERT INTO warehouse.current_bed (
    bed_id,
    ward,
    room,
    bed_code,
    bed_status,
    encounter_id,
    doctor,
    nurse,
    medication_pending,
    lab_pending,
    unsigned_docs
)
SELECT
    COALESCE(MAX(bed_id), 0) + 1,
    'Khoa Nội Tổng hợp',
    '406',
    'NYC.G6.12',
    'occupied',
    'ENC-2026-012',
    'BS. Nguyễn Mai',
    'ĐD. Minh Anh',
    2,
    4,
    1
FROM warehouse.current_bed
HAVING NOT EXISTS (
    SELECT 1
    FROM warehouse.current_bed
    WHERE bed_code = 'NYC.G6.12'
);

COMMIT;