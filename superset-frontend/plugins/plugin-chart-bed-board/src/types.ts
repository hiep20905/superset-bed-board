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
import type { QueryFormData } from '@superset-ui/core';

export type CareLevel = 'I' | 'II' | 'III' | '';

export type BedStatus = 'occupied' | 'empty' | 'reserved';

export const DEFAULT_NOTES_BASE_URL = 'http://localhost:8001/notes';
export const DEFAULT_NOTES_API_BASE_URL = 'http://localhost:8001/api/v1';

export interface BedRow {
  id: string;
  ward: string;
  room: string;
  bedCode: string;
  bedStatus: BedStatus;
  encounterId: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  admissionTime: string;
  diagnosisCode: string;
  diagnosis: string;
  careLevel: CareLevel;
  doctor: string;
  nurse: string;
  medicationPending: number;
  labPending: number;
  unsignedDocs: number;
  noteCount: number;
  latestNoteAt: string | null;
}

export interface BedBoardProps {
  width: number;
  height: number;
  data: BedRow[];
  notesBaseUrl: string;
  notesApiBaseUrl: string;
}

export interface ClinicalNote {
  noteId: string;
  encounterId: string;
  authorUserId: string;
  authorDisplayName: string;
  noteType: string;
  severityLevel: string | null;
  noteContent: string;
  referenceNoteId: string | null;
  relationType: string | null;
  createdAt: string;
}

export interface NotesListResponse {
  encounterId: string;
  total: number;
  items: ClinicalNote[];
}

export type BedBoardQueryFormData = QueryFormData & {
  row_limit?: string | number | null;
  notes_base_url?: string | null;
  notes_api_base_url?: string | null;
};
