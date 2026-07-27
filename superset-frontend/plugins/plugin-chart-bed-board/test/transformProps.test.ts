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
import { supersetTheme } from '@apache-superset/core/theme';
import { ChartProps } from '@superset-ui/core';
import transformProps from '../src/transformProps';

test('maps note summary and notes URLs without requiring summary columns', () => {
  const chartProps = new ChartProps({
    width: 900,
    height: 600,
    theme: supersetTheme,
    formData: {
      datasource: '1__table',
      viz_type: 'bed_board',
      notes_base_url: 'https://notes.example/notes',
      notes_api_base_url: 'https://notes.example/api/v1',
    },
    queriesData: [
      {
        data: [
          {
            room: '403',
            bed_code: 'NYC.G6-1',
            bed_status: 'occupied',
            encounter_id: 'ENC-001',
            patient_name: 'Người bệnh A',
            note_count: '3',
            latest_note_at: '2026-07-26T15:15:00+00:00',
          },
          {
            room: '404',
            bed_code: 'NYC.G6-2',
            bed_status: 'empty',
          },
        ],
      },
    ],
  });

  const result = transformProps(chartProps);

  expect(result.notesBaseUrl).toBe('https://notes.example/notes');
  expect(result.notesApiBaseUrl).toBe('https://notes.example/api/v1');
  expect(result.data[0]).toEqual(
    expect.objectContaining({
      encounterId: 'ENC-001',
      noteCount: 3,
      latestNoteAt: '2026-07-26T15:15:00+00:00',
    }),
  );
  expect(result.data[1]).toEqual(
    expect.objectContaining({
      noteCount: 0,
      latestNoteAt: null,
    }),
  );
});

test('treats reserved beds as occupied', () => {
  const chartProps = new ChartProps({
    width: 1200,
    height: 800,
    theme: supersetTheme,
    formData: {},
    queriesData: [
      {
        data: [
          {
            bed_id: 'BED-03',
            bed_code: 'NYC.G6.5',
            bed_status: 'reserved',
            encounter_id: 'ENC-03',
            patient_name: 'Phạm Thị Dung',
          },
        ],
      },
    ],
  });

  const result = transformProps(chartProps);

  expect(result.data[0].bedStatus).toBe('occupied');
});
