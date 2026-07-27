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
import { css, styled } from '@apache-superset/core/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import type {
  BedBoardProps,
  BedRow,
  BedStatus,
  CareLevel,
  ClinicalNote,
  NotesListResponse,
} from './types';

const Root = styled.div<{ height: number; width: number }>`
  ${({ height, width }) => css`
    position: relative;
    box-sizing: border-box;
    width: ${width}px;
    max-width: 100%;
    height: ${height}px;
    min-height: min(600px, ${height}px);
    overflow: hidden;
    background: #eef1f4;
    color: #172033;
    font-family: inherit;
  `}
`;

const BoardContent = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 12px;
  overflow-x: hidden;
  overflow-y: auto;
`;

const RoomGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  align-items: start;
  gap: 14px;
  width: 100%;
  min-width: 0;
`;

const RoomCard = styled.section`
  box-sizing: border-box;
  min-width: 0;
  min-height: 220px;
  padding: 10px;
  border: 1px solid #d8dde3;
  border-radius: 8px;
  background: #e7eaed;
`;

const RoomTitle = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  margin: -4px 0 6px;
  padding: 4px 8px;
  color: #172033;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
`;

const BedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

interface BedCardStyleProps {
  $bedStatus: BedStatus;
  $careLevel: CareLevel;
}

const getLeftBorderColor = ({ $bedStatus, $careLevel }: BedCardStyleProps) => {
  if ($bedStatus === 'empty') return '#4c9a68';
  if ($bedStatus === 'reserved') return '#8062c6';
  if ($careLevel === 'I') return '#cf2233';
  if ($careLevel === 'II') return '#c97800';
  if ($careLevel === 'III') return '#27864b';
  return '#8b95a5';
};

const BedCard = styled.article<BedCardStyleProps>`
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 76px;
  padding: 10px 12px;
  overflow: hidden;
  border: 1px solid #d2d7de;
  border-left: 5px solid ${getLeftBorderColor};
  border-radius: 8px;
  background: ${({ $bedStatus }) => {
    if ($bedStatus === 'empty') return '#f5fbf7';
    if ($bedStatus === 'reserved') return '#faf8ff';
    return '#ffffff';
  }};
  color: #172033;
  font: inherit;
  text-align: left;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease,
    transform 120ms ease;
`;

const PatientOpenButton = styled.button`
  display: block;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    outline: none;
  }

  &:focus-visible {
    border-radius: 4px;
    outline: 2px solid #1677ff;
    outline-offset: 3px;
  }
`;

const InteractiveBedCard = styled(BedCard)`
  &:hover {
    border-color: #aeb7c2;
    box-shadow: 0 3px 9px rgb(24 39 60 / 10%);
    transform: translateY(-1px);
  }
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 7px;
  padding-top: 6px;
  border-top: 1px solid #edf0f3;
`;

const NotesLink = styled.a`
  color: #55439a;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
  text-decoration: none;

  &:hover {
    color: #3f2d83;
    text-decoration: underline;
  }

  &:focus-visible {
    border-radius: 3px;
    outline: 2px solid #1677ff;
    outline-offset: 2px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const PatientIdentity = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
`;

const BedCode = styled.span`
  flex: 0 0 auto;
  overflow: hidden;
  color: #526071;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PatientName = styled.strong`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: #172033;
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BadgeRow = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 10px;
  background: #ede9ff;
  color: #55439a;
  font-size: 10px;
  font-weight: 650;
  line-height: 1.25;
  white-space: nowrap;
`;

const CardMetadata = styled.div`
  min-width: 0;
  margin-top: 5px;
  overflow: hidden;
  color: #5f6b7c;
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardDoctor = styled.div`
  min-width: 0;
  margin-top: 5px;
  overflow: hidden;
  color: #647084;
  font-size: 11px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusOnly = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 650;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 280px;
  padding: 24px;
  color: #6f7b8d;
  text-align: center;
`;

const EmptyStateTitle = styled.div`
  color: #4f5c6d;
  font-size: 15px;
  font-weight: 650;
`;

const EmptyStateHint = styled.div`
  margin-top: 6px;
  font-size: 12px;
`;

const Backdrop = styled.button`
  position: absolute;
  z-index: 20;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: rgba(20, 28, 40, 0.38);
  cursor: pointer;
`;

const Drawer = styled.aside`
  position: absolute;
  z-index: 21;
  top: 0;
  right: 0;
  box-sizing: border-box;
  width: min(480px, 92vw);
  max-width: 92%;
  height: 100%;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: #f6f7f9;
  box-shadow: -12px 0 28px rgb(20 28 40 / 18%);

  @media (max-width: 700px) {
    width: 94%;
    max-width: 94%;
  }
`;

const DrawerHeader = styled.header`
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid #e1e5ea;
  background: #ffffff;
`;

const DrawerHeading = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const DrawerName = styled.h3`
  margin: 0;
  overflow-wrap: anywhere;
  color: #172033;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.25;
`;

const DrawerSubtitle = styled.div`
  margin-top: 5px;
  color: #8791a1;
  font-size: 12px;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #657185;
  font: inherit;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: #f0f2f5;
    color: #172033;
  }

  &:focus-visible {
    outline: 2px solid #1677ff;
    outline-offset: 1px;
  }
`;

const DrawerBody = styled.div`
  box-sizing: border-box;
  padding: 14px;
  background: #f6f7f9;
`;

const CareAlert = styled.div<{ $careLevel: CareLevel }>`
  box-sizing: border-box;
  margin-bottom: 12px;
  padding: 13px 14px;
  border: 1px solid
    ${({ $careLevel }) => {
      if ($careLevel === 'I') return '#f0c5ca';
      if ($careLevel === 'II') return '#efd7ad';
      if ($careLevel === 'III') return '#bfdfca';
      return '#dfe3e8';
    }};
  border-radius: 8px;
  background: ${({ $careLevel }) => {
    if ($careLevel === 'I') return '#fff1f2';
    if ($careLevel === 'II') return '#fff6e6';
    if ($careLevel === 'III') return '#eef9f1';
    return '#eef1f4';
  }};
  color: ${({ $careLevel }) => {
    if ($careLevel === 'I') return '#b51f30';
    if ($careLevel === 'II') return '#b26800';
    if ($careLevel === 'III') return '#247441';
    return '#687486';
  }};
  font-size: 13px;
  font-weight: 700;
`;

const DetailSection = styled.section`
  box-sizing: border-box;
  margin-bottom: 12px;
  padding: 13px 14px;
  border: 1px solid #e0e5eb;
  border-radius: 8px;
  background: #ffffff;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4<{ $compact?: boolean }>`
  margin: 0 0 ${({ $compact }) => ($compact ? 0 : '12px')};
  color: #8c97a8;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.02em;
  line-height: 1.3;
  text-transform: uppercase;
`;

const DetailGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
  margin: 0;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const DetailField = styled.div`
  min-width: 0;

  dt {
    margin: 0 0 4px;
    color: #919baa;
    font-size: 11px;
    line-height: 1.3;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
    color: #263247;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.4;
  }
`;

const DiagnosisText = styled.div`
  color: #263247;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.5;
  overflow-wrap: anywhere;
`;

const TrackingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const TrackingItem = styled.div<{ $tone: 'medication' | 'lab' | 'document' }>`
  min-width: 0;

  span {
    display: block;
    color: #919baa;
    font-size: 11px;
    line-height: 1.35;
  }

  strong {
    display: block;
    margin-top: 5px;
    color: ${({ $tone }) => {
      if ($tone === 'medication') return '#bd2e68';
      if ($tone === 'lab') return '#294f9d';
      return '#6249a6';
    }};
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  }
`;

const NotesSectionHeading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
`;

const NotesActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
`;

const RefreshButton = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: #526071;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    color: #245aa5;
  }

  &:focus-visible {
    border-radius: 3px;
    outline: 2px solid #1677ff;
    outline-offset: 2px;
  }
`;

const AllNotesLink = styled.a`
  color: #55439a;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: #3f2d83;
    text-decoration: underline;
  }

  &:focus-visible {
    border-radius: 3px;
    outline: 2px solid #1677ff;
    outline-offset: 2px;
  }
`;

const NotesStatus = styled.div`
  padding: 12px 0;
  color: #6f7b8d;
  font-size: 12px;
  line-height: 1.5;
`;

const ClinicalNotesList = styled.div`
  display: grid;
  gap: 9px;
`;

const ClinicalNoteCard = styled.article`
  padding: 10px 11px;
  border: 1px solid #e4e7ec;
  border-radius: 7px;
  background: #f9fafb;
`;

const ClinicalNoteMeta = styled.div`
  color: #667286;
  font-size: 10px;
  line-height: 1.4;
`;

const ClinicalNoteType = styled.div`
  margin-top: 3px;
  color: #55439a;
  font-size: 11px;
  font-weight: 700;
`;

const ClinicalNoteContent = styled.p`
  margin: 8px 0 0;
  color: #263247;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

const CorrectionInfo = styled.div`
  margin-top: 7px;
  color: #7a647e;
  font-size: 10px;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

const roomCollator = new Intl.Collator('vi', {
  numeric: true,
  sensitivity: 'base',
});

const hasPatient = (bed: BedRow) =>
  Boolean(bed.encounterId || bed.patientId || bed.patientName);

const joinNonEmpty = (values: string[]) => values.filter(Boolean).join(' · ');

const displayValue = (value: string) => value || '-';

const formatDiagnosis = (bed: BedRow) =>
  [bed.diagnosisCode, bed.diagnosis].filter(Boolean).join(' - ') ||
  'Chưa có chẩn đoán';

const formatDateTime = (value: string) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const parts = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '';

  return `${getPart('day')}/${getPart('month')}/${getPart(
    'year',
  )} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
};

const NOTE_TYPE_LABELS: Record<string, string> = {
  PROGRESS: 'Diễn biến',
  TREATMENT: 'Điều trị',
  OBSERVATION: 'Theo dõi',
  HANDOVER: 'Bàn giao',
  CORRECTION: 'Đính chính',
  OTHER: 'Khác',
};

const SEVERITY_LABELS: Record<string, string> = {
  NORMAL: 'Bình thường',
  ATTENTION: 'Cần lưu ý',
  URGENT: 'Khẩn',
};

type NotesViewState =
  | 'loading'
  | 'empty'
  | 'success'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'error';

class NotesApiError extends Error {
  status: number;

  constructor(status: number) {
    super(`Notes API returned ${status}`);
    this.status = status;
  }
}

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const buildMiniWebUrl = (baseUrl: string, encounterId: string) => {
  const normalizedBaseUrl = trimTrailingSlashes(baseUrl.trim());
  const normalizedEncounterId = encounterId.trim();
  if (!normalizedBaseUrl || !normalizedEncounterId) return null;
  return `${normalizedBaseUrl}/encounters/${encodeURIComponent(
    normalizedEncounterId,
  )}`;
};

const openNotesPopup = (event: MouseEvent<HTMLAnchorElement>, url: string) => {
  const width = Math.round(window.screen.availWidth / 2);
  const height = Math.round(window.screen.availHeight / 2);
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  const popup = window.open(
    url,
    'clinicalNotes',
    [
      'popup=yes',
      `width=${width}`,
      `height=${height}`,
      `left=${Math.round(left)}`,
      `top=${Math.round(top)}`,
      'resizable=yes',
      'scrollbars=yes',
    ].join(','),
  );

  if (!popup) return;

  event.preventDefault();
  popup.opener = null;
  popup.focus();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringValue = (value: unknown) =>
  typeof value === 'string' ? value : '';

const nullableStringValue = (value: unknown) =>
  typeof value === 'string' ? value : null;

const mapClinicalNote = (value: unknown): ClinicalNote | null => {
  if (!isRecord(value)) return null;
  const noteId = stringValue(value.note_id);
  const encounterId = stringValue(value.encounter_id);
  const createdAt = stringValue(value.created_at);
  if (!noteId || !encounterId || !createdAt) return null;

  return {
    noteId,
    encounterId,
    authorUserId: stringValue(value.author_user_id),
    authorDisplayName: stringValue(value.author_display_name),
    noteType: stringValue(value.note_type),
    severityLevel: nullableStringValue(value.severity_level),
    noteContent: stringValue(value.note_content),
    referenceNoteId: nullableStringValue(value.reference_note_id),
    relationType: nullableStringValue(value.relation_type),
    createdAt,
  };
};

const fetchClinicalNotes = async (
  apiBaseUrl: string,
  encounterId: string,
  signal: AbortSignal,
): Promise<NotesListResponse> => {
  const response = await fetch(
    `${trimTrailingSlashes(
      apiBaseUrl.trim(),
    )}/encounters/${encodeURIComponent(encounterId.trim())}/notes?limit=5`,
    {
      credentials: 'include',
      signal,
    },
  );
  if (!response.ok) {
    throw new NotesApiError(response.status);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new NotesApiError(500);
  }
  const items = payload.items
    .map(mapClinicalNote)
    .filter((note): note is ClinicalNote => note !== null);
  const totalValue = Number(payload.total);

  return {
    encounterId: stringValue(payload.encounter_id) || encounterId,
    total: Number.isFinite(totalValue) ? totalValue : items.length,
    items,
  };
};

interface PatientCardContentProps {
  bed: BedRow;
  reserved?: boolean;
}

function PatientCardContent({
  bed,
  reserved = false,
}: PatientCardContentProps) {
  const demographics = joinNonEmpty([
    bed.age > 0 ? `${bed.age} tuổi` : '',
    bed.gender,
  ]);
  const metadata = joinNonEmpty([
    reserved ? 'Chờ tiếp nhận' : '',
    demographics,
    bed.diagnosis || 'Chưa có chẩn đoán',
  ]);
  const doctor = bed.doctor || 'Chưa phân công bác sĩ';

  return (
    <>
      <CardHeader>
        <PatientIdentity>
          <BedCode>{bed.bedCode || 'Giường'}</BedCode>
          <PatientName>
            {bed.patientName || bed.patientId || 'Người bệnh'}
          </PatientName>
        </PatientIdentity>
        {(bed.labPending > 0 || bed.unsignedDocs > 0) && (
          <BadgeRow>
            {bed.labPending > 0 && (
              <Badge
                title={`Cận lâm sàng chưa thực hiện: ${bed.labPending}`}
                aria-label={`Cận lâm sàng chưa thực hiện: ${bed.labPending}`}
              >
                CLS {bed.labPending}
              </Badge>
            )}
            {bed.unsignedDocs > 0 && (
              <Badge
                title={`Hồ sơ chưa ký: ${bed.unsignedDocs}`}
                aria-label={`Hồ sơ chưa ký: ${bed.unsignedDocs}`}
              >
                HS {bed.unsignedDocs}
              </Badge>
            )}
          </BadgeRow>
        )}
      </CardHeader>
      <CardMetadata title={metadata}>{metadata}</CardMetadata>
      <CardDoctor title={doctor}>Bác sĩ: {doctor}</CardDoctor>
    </>
  );
}

interface PatientDrawerProps {
  bed: BedRow;
  notesApiBaseUrl: string;
  notesBaseUrl: string;
  onClose: () => void;
  onNoteTotalChange: (encounterId: string, total: number) => void;
}

function PatientDrawer({
  bed,
  notesApiBaseUrl,
  notesBaseUrl,
  onClose,
  onNoteTotalChange,
}: PatientDrawerProps) {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [notesState, setNotesState] = useState<NotesViewState>('loading');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const careLabel = bed.careLevel
    ? `Cấp chăm sóc ${bed.careLevel}`
    : 'Chưa xác định cấp chăm sóc';
  const subtitle =
    joinNonEmpty([
      bed.patientId,
      bed.age > 0 ? `${bed.age} tuổi` : '',
      bed.gender,
    ]) || 'Chưa có thông tin nhân khẩu';
  const bedAndRoom = joinNonEmpty([bed.bedCode || 'Giường', bed.room]) || '-';
  const miniWebUrl = buildMiniWebUrl(notesBaseUrl, bed.encounterId);

  useEffect(() => {
    const encounterId = bed.encounterId.trim();
    if (!encounterId || !notesApiBaseUrl.trim()) {
      setNotes([]);
      setNotesState('error');
      return undefined;
    }

    const controller = new AbortController();
    setNotesState('loading');
    fetchClinicalNotes(notesApiBaseUrl, encounterId, controller.signal)
      .then(response => {
        if (controller.signal.aborted) return;
        setNotes(response.items);
        setNotesState(response.items.length ? 'success' : 'empty');
        onNoteTotalChange(encounterId, response.total);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setNotes([]);
        if (error instanceof NotesApiError) {
          if (error.status === 401) setNotesState('unauthorized');
          else if (error.status === 403) setNotesState('forbidden');
          else if (error.status === 404) setNotesState('not-found');
          else setNotesState('error');
        } else {
          setNotesState('error');
        }
      });

    return () => controller.abort();
  }, [bed.encounterId, notesApiBaseUrl, onNoteTotalChange, refreshVersion]);

  useEffect(() => {
    if (!bed.encounterId.trim()) return undefined;
    const handleFocus = () => setRefreshVersion(version => version + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [bed.encounterId]);

  const renderNotes = () => {
    if (notesState === 'loading') {
      return <NotesStatus>Đang tải ghi chú...</NotesStatus>;
    }
    if (notesState === 'empty') {
      return <NotesStatus>Chưa có ghi chú cho lần điều trị này.</NotesStatus>;
    }
    if (notesState === 'unauthorized') {
      return <NotesStatus>Phiên đăng nhập Notes không hợp lệ.</NotesStatus>;
    }
    if (notesState === 'forbidden') {
      return <NotesStatus>Bạn không có quyền xem ghi chú.</NotesStatus>;
    }
    if (notesState === 'not-found') {
      return <NotesStatus>Không tìm thấy lần điều trị.</NotesStatus>;
    }
    if (notesState === 'error') {
      return <NotesStatus>Không thể tải ghi chú lâm sàng.</NotesStatus>;
    }

    return (
      <ClinicalNotesList>
        {notes.map(note => (
          <ClinicalNoteCard key={note.noteId}>
            <ClinicalNoteMeta>
              {note.authorDisplayName || note.authorUserId || 'Không xác định'}{' '}
              · {formatDateTime(note.createdAt)}
            </ClinicalNoteMeta>
            <ClinicalNoteType>
              {NOTE_TYPE_LABELS[note.noteType] || note.noteType || 'Ghi chú'} ·{' '}
              {(note.severityLevel &&
                (SEVERITY_LABELS[note.severityLevel] || note.severityLevel)) ||
                'Không xác định'}
            </ClinicalNoteType>
            <ClinicalNoteContent>{note.noteContent}</ClinicalNoteContent>
            {note.referenceNoteId && (
              <CorrectionInfo>
                {note.relationType === 'CORRECTS'
                  ? 'Đính chính ghi chú'
                  : 'Tham chiếu ghi chú'}{' '}
                {note.referenceNoteId}
              </CorrectionInfo>
            )}
          </ClinicalNoteCard>
        ))}
      </ClinicalNotesList>
    );
  };

  return (
    <>
      <Backdrop
        type="button"
        aria-label="Đóng thông tin bệnh nhân bằng nền phủ"
        onClick={onClose}
      />
      <Drawer
        role="dialog"
        aria-modal="true"
        aria-label={`Thông tin bệnh nhân ${bed.patientName || bed.patientId}`}
      >
        <DrawerHeader>
          <DrawerHeading>
            <DrawerName>
              {bed.patientName || bed.patientId || 'Người bệnh'}
            </DrawerName>
            <DrawerSubtitle>{subtitle}</DrawerSubtitle>
          </DrawerHeading>
          <CloseButton
            type="button"
            aria-label="Đóng thông tin bệnh nhân"
            onClick={onClose}
          >
            ×
          </CloseButton>
        </DrawerHeader>

        <DrawerBody>
          <CareAlert $careLevel={bed.careLevel}>{careLabel}</CareAlert>

          <DetailSection>
            <SectionTitle>Thông tin nằm viện</SectionTitle>
            <DetailGrid>
              <DetailField>
                <dt>Giường · Phòng</dt>
                <dd>{bedAndRoom}</dd>
              </DetailField>
              <DetailField>
                <dt>Mã lần điều trị</dt>
                <dd>{displayValue(bed.encounterId)}</dd>
              </DetailField>
              <DetailField>
                <dt>Ngày nhập viện</dt>
                <dd>{formatDateTime(bed.admissionTime)}</dd>
              </DetailField>
              <DetailField>
                <dt>Khoa</dt>
                <dd>{displayValue(bed.ward)}</dd>
              </DetailField>
              <DetailField>
                <dt>Bác sĩ phụ trách</dt>
                <dd>{displayValue(bed.doctor)}</dd>
              </DetailField>
              <DetailField>
                <dt>Điều dưỡng phụ trách</dt>
                <dd>{displayValue(bed.nurse)}</dd>
              </DetailField>
            </DetailGrid>
          </DetailSection>

          <DetailSection>
            <SectionTitle>Chẩn đoán chính</SectionTitle>
            <DiagnosisText>{formatDiagnosis(bed)}</DiagnosisText>
          </DetailSection>

          <DetailSection>
            <SectionTitle>Theo dõi y lệnh, hồ sơ và tờ điều trị</SectionTitle>
            <TrackingGrid>
              <TrackingItem $tone="medication">
                <span>Y lệnh thuốc chưa thực hiện</span>
                <strong>{bed.medicationPending}</strong>
              </TrackingItem>
              <TrackingItem $tone="lab">
                <span>Cận lâm sàng chưa thực hiện</span>
                <strong>{bed.labPending}</strong>
              </TrackingItem>
              <TrackingItem $tone="document">
                <span>Hồ sơ chưa ký</span>
                <strong>{bed.unsignedDocs}</strong>
              </TrackingItem>
            </TrackingGrid>
          </DetailSection>

          <DetailSection>
            <NotesSectionHeading>
              <SectionTitle $compact>Ghi chú lâm sàng</SectionTitle>
              <NotesActions>
                <RefreshButton
                  type="button"
                  onClick={() => setRefreshVersion(version => version + 1)}
                >
                  Làm mới
                </RefreshButton>
                {miniWebUrl && (
                  <AllNotesLink
                    href={miniWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={event => openNotesPopup(event, miniWebUrl)}
                  >
                    Xem tất cả / Thêm ghi chú
                  </AllNotesLink>
                )}
              </NotesActions>
            </NotesSectionHeading>
            {renderNotes()}
          </DetailSection>
        </DrawerBody>
      </Drawer>
    </>
  );
}

interface RoomSectionProps {
  beds: BedRow[];
  noteCounts: Record<string, number>;
  notesBaseUrl: string;
  roomName: string;
  onSelectPatient: (bed: BedRow) => void;
}

function RoomSection({
  beds,
  noteCounts,
  notesBaseUrl,
  roomName,
  onSelectPatient,
}: RoomSectionProps) {
  return (
    <RoomCard>
      <RoomTitle>{roomName}</RoomTitle>
      <BedList>
        {beds.map(bed => {
          const patientAvailable = hasPatient(bed);

          if (bed.bedStatus === 'empty') {
            return (
              <BedCard
                key={bed.id}
                $bedStatus={bed.bedStatus}
                $careLevel={bed.careLevel}
              >
                <StatusOnly>{bed.bedCode || 'Giường'} · Trống</StatusOnly>
              </BedCard>
            );
          }

          if (bed.bedStatus === 'reserved' && !patientAvailable) {
            return (
              <BedCard
                key={bed.id}
                $bedStatus={bed.bedStatus}
                $careLevel={bed.careLevel}
              >
                <StatusOnly>
                  {bed.bedCode || 'Giường'} · Chờ tiếp nhận
                </StatusOnly>
              </BedCard>
            );
          }

          if (!patientAvailable) {
            return (
              <BedCard
                key={bed.id}
                $bedStatus={bed.bedStatus}
                $careLevel={bed.careLevel}
              >
                <StatusOnly>
                  {bed.bedCode || 'Giường'} · Đang sử dụng
                </StatusOnly>
              </BedCard>
            );
          }

          const encounterId = bed.encounterId.trim();
          const notesUrl =
            bed.bedStatus === 'occupied' && encounterId
              ? buildMiniWebUrl(notesBaseUrl, encounterId)
              : null;
          const noteTotal = noteCounts[encounterId] ?? bed.noteCount;

          return (
            <InteractiveBedCard
              key={bed.id}
              $bedStatus={bed.bedStatus}
              $careLevel={bed.careLevel}
            >
              <PatientOpenButton
                type="button"
                aria-label={`Mở thông tin bệnh nhân ${
                  bed.patientName || bed.patientId
                }`}
                onClick={() => onSelectPatient(bed)}
              >
                <PatientCardContent
                  bed={bed}
                  reserved={bed.bedStatus === 'reserved'}
                />
              </PatientOpenButton>
              {notesUrl && (
                <CardActions>
                  <NotesLink
                    href={notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={event => openNotesPopup(event, notesUrl)}
                  >
                    {noteTotal > 0 ? `Ghi chú (${noteTotal})` : '+ Ghi chú'}
                  </NotesLink>
                </CardActions>
              )}
            </InteractiveBedCard>
          );
        })}
      </BedList>
    </RoomCard>
  );
}

export default function BedBoard({
  data,
  height,
  notesApiBaseUrl,
  notesBaseUrl,
  width,
}: BedBoardProps) {
  const [selectedPatient, setSelectedPatient] = useState<BedRow | null>(null);
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});

  const handleNoteTotalChange = useCallback(
    (encounterId: string, total: number) => {
      setNoteCounts(currentCounts =>
        currentCounts[encounterId] === total
          ? currentCounts
          : {
              ...currentCounts,
              [encounterId]: total,
            },
      );
    },
    [],
  );

  const groupedRooms = useMemo(() => {
    const roomMap = new Map<string, BedRow[]>();
    data.forEach(bed => {
      const roomName = bed.room || 'Chưa xác định';
      const roomBeds = roomMap.get(roomName);
      if (roomBeds) {
        roomBeds.push(bed);
      } else {
        roomMap.set(roomName, [bed]);
      }
    });

    return [...roomMap.entries()]
      .sort(([left], [right]) => roomCollator.compare(left, right))
      .map(
        ([roomName, beds]) =>
          [
            roomName,
            [...beds].sort((left, right) =>
              roomCollator.compare(left.bedCode, right.bedCode),
            ),
          ] as const,
      );
  }, [data]);

  const activePatient = useMemo(() => {
    if (!selectedPatient) return null;
    return data.find(candidate => candidate.id === selectedPatient.id) ?? null;
  }, [data, selectedPatient]);

  useEffect(() => {
    if (selectedPatient && !activePatient) {
      setSelectedPatient(null);
    }
  }, [activePatient, selectedPatient]);

  useEffect(() => {
    if (!activePatient) return undefined;

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedPatient(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activePatient]);

  const columnCount = width >= 1200 ? 3 : width >= 760 ? 2 : 1;

  return (
    <Root width={width} height={height}>
      <BoardContent>
        {data.length === 0 ? (
          <EmptyState>
            <div>
              <EmptyStateTitle>Không có dữ liệu giường bệnh</EmptyStateTitle>
              <EmptyStateHint>
                Kiểm tra bộ lọc hoặc dữ liệu của dataset.
              </EmptyStateHint>
            </div>
          </EmptyState>
        ) : (
          <RoomGrid $columns={columnCount}>
            {groupedRooms.map(([roomName, beds]) => (
              <RoomSection
                key={roomName}
                roomName={roomName}
                beds={beds}
                noteCounts={noteCounts}
                notesBaseUrl={notesBaseUrl}
                onSelectPatient={setSelectedPatient}
              />
            ))}
          </RoomGrid>
        )}
      </BoardContent>

      {activePatient && (
        <PatientDrawer
          bed={activePatient}
          notesApiBaseUrl={notesApiBaseUrl}
          notesBaseUrl={notesBaseUrl}
          onClose={() => setSelectedPatient(null)}
          onNoteTotalChange={handleNoteTotalChange}
        />
      )}
    </Root>
  );
}
