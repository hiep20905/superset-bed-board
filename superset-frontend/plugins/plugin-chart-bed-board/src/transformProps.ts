/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import type { ChartProps, DataRecord } from '@superset-ui/core';
import { DEFAULT_NOTES_API_BASE_URL, DEFAULT_NOTES_BASE_URL } from './types';
import type {
  BedBoardProps,
  BedBoardQueryFormData,
  BedRow,
  BedStatus,
  CareLevel,
} from './types';

const toText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value).trim();
};

const toNumber = (value: unknown): number => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return 0;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeText = (value: unknown): string =>
  toText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase('vi')
    .replace(/\s+/g, ' ');

const normalizeCareLevel = (value: unknown): CareLevel => {
  switch (normalizeText(value)) {
    case '1':
    case 'i':
    case 'cap 1':
    case 'cap i':
    case 'level 1':
      return 'I';
    case '2':
    case 'ii':
    case 'cap 2':
    case 'cap ii':
    case 'level 2':
      return 'II';
    case '3':
    case 'iii':
    case 'cap 3':
    case 'cap iii':
    case 'level 3':
      return 'III';
    default:
      return '';
  }
};

const normalizeBedStatus = (row: DataRecord): BedStatus => {
  switch (normalizeText(row.bed_status)) {
    case 'occupied':
    case 'in_use':
    case 'using':
    case 'used':
    case 'dang su dung':
    case 'dang nam':
    case 'co benh nhan':
    case 'reserved':
    case 'waiting':
    case 'pending':
    case 'held':
    case 'cho':
    case 'cho tiep nhan':
    case 'giu giuong':
    case 'da giu':
      return 'occupied';
    case 'empty':
    case 'available':
    case 'vacant':
    case 'free':
    case 'trong':
    case 'san sang':
      return 'empty';
    default:
      return Boolean(
        toText(row.encounter_id) ||
        toText(row.patient_id) ||
        toText(row.patient_name),
      )
        ? 'occupied'
        : 'empty';
  }
};

const isDataRecord = (value: unknown): value is DataRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const transformRow = (row: DataRecord, index: number): BedRow => {
  const ward = toText(row.ward);
  const room = toText(row.room);
  const bedCode = toText(row.bed_code);
  const encounterId = toText(row.encounter_id);
  const patientId = toText(row.patient_id);
  const patientName = toText(row.patient_name);

  return {
    id: encounterId || patientId || `${room}-${bedCode}-${index}`,
    ward,
    room,
    bedCode,
    bedStatus: normalizeBedStatus(row),
    encounterId,
    patientId,
    patientName,
    age: toNumber(row.age),
    gender: toText(row.gender),
    admissionTime: toText(row.admission_time),
    diagnosisCode: toText(row.diagnosis_code),
    diagnosis: toText(row.diagnosis),
    careLevel: normalizeCareLevel(row.care_level),
    doctor: toText(row.doctor),
    nurse: toText(row.nurse),
    medicationPending: toNumber(row.medication_pending),
    labPending: toNumber(row.lab_pending),
    unsignedDocs: toNumber(row.unsigned_docs),
    noteCount: toNumber(row.note_count),
    latestNoteAt: toText(row.latest_note_at) || null,
  };
};

export default function transformProps(chartProps: ChartProps): BedBoardProps {
  const { width, height, queriesData } = chartProps;
  const formData = chartProps.rawFormData as BedBoardQueryFormData;
  const queryData = queriesData?.[0]?.data;
  const data = Array.isArray(queryData)
    ? queryData
        .filter(isDataRecord)
        .map((row, index) => transformRow(row, index))
    : [];

  return {
    width,
    height,
    data,
    notesBaseUrl: toText(formData.notes_base_url) || DEFAULT_NOTES_BASE_URL,
    notesApiBaseUrl:
      toText(formData.notes_api_base_url) || DEFAULT_NOTES_API_BASE_URL,
  };
}
