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
import { BuildQuery, buildQueryContext } from '@superset-ui/core';
import { BedBoardQueryFormData } from './types';

const BED_BOARD_COLUMNS = [
  'ward',
  'room',
  'bed_code',
  'bed_status',
  'encounter_id',
  'patient_id',
  'patient_name',
  'age',
  'gender',
  'admission_time',
  'diagnosis_code',
  'diagnosis',
  'care_level',
  'doctor',
  'nurse',
  'medication_pending',
  'lab_pending',
  'unsigned_docs',
  'note_count',
  'latest_note_at',
];

const DEFAULT_ROW_LIMIT = 5000;

const buildQuery: BuildQuery<BedBoardQueryFormData> = formData =>
  buildQueryContext(formData, baseQueryObject => {
    const configuredRowLimit = Number(formData.row_limit);
    const rowLimit =
      Number.isFinite(configuredRowLimit) && configuredRowLimit > 0
        ? configuredRowLimit
        : DEFAULT_ROW_LIMIT;

    return [
      {
        ...baseQueryObject,
        columns: BED_BOARD_COLUMNS,
        metrics: [],
        row_limit: rowLimit,
      },
    ];
  });

export default buildQuery;
