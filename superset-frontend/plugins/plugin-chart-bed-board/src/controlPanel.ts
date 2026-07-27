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
import { t } from '@apache-superset/core/translation';
import { ControlPanelConfig } from '@superset-ui/chart-controls';
import { DEFAULT_NOTES_API_BASE_URL, DEFAULT_NOTES_BASE_URL } from './types';

const controlPanel: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['row_limit'],
        [
          {
            name: 'notes_base_url',
            config: {
              type: 'TextControl',
              label: t('Notes Mini Web URL'),
              default: DEFAULT_NOTES_BASE_URL,
              renderTrigger: true,
              description: t(
                'Base URL used to open the clinical notes mini web.',
              ),
            },
          },
        ],
        [
          {
            name: 'notes_api_base_url',
            config: {
              type: 'TextControl',
              label: t('Notes API URL'),
              default: DEFAULT_NOTES_API_BASE_URL,
              renderTrigger: true,
              description: t(
                'Base URL used to read clinical notes in the patient drawer.',
              ),
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    row_limit: {
      default: 5000,
    },
  },
};

export default controlPanel;
