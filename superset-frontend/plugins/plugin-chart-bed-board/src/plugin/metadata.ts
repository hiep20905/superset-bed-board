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
import { ChartMetadata } from '@superset-ui/core';

const thumbnail =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f5f7fa"/%3E%3Cg fill="%23fff" stroke="%23d9dfe8" stroke-width="3"%3E%3Crect x="35" y="55" width="100" height="70" rx="8"/%3E%3Crect x="150" y="55" width="100" height="70" rx="8"/%3E%3Crect x="265" y="55" width="100" height="70" rx="8"/%3E%3Crect x="35" y="145" width="155" height="100" rx="8"/%3E%3Crect x="210" y="145" width="155" height="100" rx="8"/%3E%3C/g%3E%3Cg fill="%234f6fae"%3E%3Crect x="50" y="72" width="70" height="12" rx="6"/%3E%3Crect x="165" y="72" width="70" height="12" rx="6"/%3E%3Crect x="280" y="72" width="70" height="12" rx="6"/%3E%3C/g%3E%3Cg fill="%23d7e4f7"%3E%3Crect x="52" y="166" width="120" height="22" rx="5"/%3E%3Crect x="52" y="202" width="120" height="22" rx="5"/%3E%3Crect x="227" y="166" width="120" height="22" rx="5"/%3E%3Crect x="227" y="202" width="120" height="22" rx="5"/%3E%3C/g%3E%3C/svg%3E';

const metadata = new ChartMetadata({
  name: t('Bed Board'),
  description: t('Hospital bed and inpatient status board'),
  category: t('Healthcare'),
  tags: [t('Healthcare'), t('Hospital'), t('Bed'), t('Patient'), t('Table')],
  thumbnail,
});

export default metadata;
