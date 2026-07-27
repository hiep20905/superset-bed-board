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
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'spec/helpers/testing-library';
import BedBoard from '../src/BedBoard';
import type { BedBoardProps, BedRow } from '../src/types';

const occupiedBed: BedRow = {
  id: 'ENC/001',
  ward: 'Nội tổng hợp',
  room: '403',
  bedCode: 'NYC.G6-1',
  bedStatus: 'occupied',
  encounterId: 'ENC/001',
  patientId: 'P-001',
  patientName: 'Người bệnh A',
  age: 60,
  gender: 'Nữ',
  admissionTime: '2026-07-26T10:00:00+07:00',
  diagnosisCode: 'D38',
  diagnosis: 'Theo dõi',
  careLevel: 'II',
  doctor: 'Bác sĩ A',
  nurse: 'Điều dưỡng A',
  medicationPending: 0,
  labPending: 1,
  unsignedDocs: 2,
  noteCount: 0,
  latestNoteAt: null,
};

const defaultProps: BedBoardProps = {
  width: 1200,
  height: 700,
  data: [occupiedBed],
  notesBaseUrl: 'http://localhost:8001/notes',
  notesApiBaseUrl: 'http://localhost:8001/api/v1',
};

const notesResponse = (total = 0, items: unknown[] = []) =>
  ({
    ok: true,
    status: 200,
    json: async () => ({
      encounter_id: 'ENC/001',
      total,
      items,
    }),
  }) as Response;

beforeEach(() => {
  jest.restoreAllMocks();
});

test('occupied encounter opens its encoded notes URL in a popup', () => {
  jest.spyOn(window.screen, 'availWidth', 'get').mockReturnValue(1600);
  jest.spyOn(window.screen, 'availHeight', 'get').mockReturnValue(1000);

  const popup = {
    focus: jest.fn(),
    opener: window,
  } as unknown as Window;
  const openMock = jest.spyOn(window, 'open').mockReturnValue(popup);

  render(<BedBoard {...defaultProps} />);

  const link = screen.getByRole('link', { name: '+ Ghi chú' });
  expect(link).toHaveAttribute(
    'href',
    'http://localhost:8001/notes/encounters/ENC%2F001',
  );
  expect(link.closest('button')).toBeNull();
  fireEvent.click(link);

  expect(openMock).toHaveBeenCalledWith(
    'http://localhost:8001/notes/encounters/ENC%2F001',
    'clinicalNotes',
    expect.stringContaining('popup=yes,width=800,height=500'),
  );
  expect(popup.opener).toBeNull();
  expect(popup.focus).toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('empty bed does not expose a notes link or drawer action', () => {
  render(
    <BedBoard
      {...defaultProps}
      data={[
        {
          ...occupiedBed,
          id: 'empty-bed',
          bedStatus: 'empty',
          encounterId: '',
          patientId: '',
          patientName: '',
        },
      ]}
    />,
  );

  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Mở thông tin/ })).toBeNull();
});

test('drawer loads notes for the selected encounter and updates local count', async () => {
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(notesResponse(3));
  render(<BedBoard {...defaultProps} />);

  fireEvent.click(
    screen.getByRole('button', { name: 'Mở thông tin bệnh nhân Người bệnh A' }),
  );

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Đang tải ghi chú...')).toBeInTheDocument();
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8001/api/v1/encounters/ENC%2F001/notes?limit=5',
      expect.objectContaining({ credentials: 'include' }),
    ),
  );
  await waitFor(() =>
    expect(
      screen.getByText('Chưa có ghi chú cho lần điều trị này.'),
    ).toBeInTheDocument(),
  );
  expect(screen.getByRole('link', { name: 'Ghi chú (3)' })).toBeInTheDocument();
});

test('closing drawer aborts its notes request', async () => {
  let requestSignal: AbortSignal | undefined;
  jest.spyOn(global, 'fetch').mockImplementation((_url, init) => {
    requestSignal = init?.signal ?? undefined;
    return new Promise<Response>(() => {});
  });
  render(<BedBoard {...defaultProps} />);

  fireEvent.click(
    screen.getByRole('button', { name: 'Mở thông tin bệnh nhân Người bệnh A' }),
  );
  await waitFor(() => expect(requestSignal).toBeDefined());
  fireEvent.click(
    screen.getByRole('button', { name: 'Đóng thông tin bệnh nhân' }),
  );

  expect(requestSignal?.aborted).toBe(true);
});

test('switching patient aborts the previous encounter notes request', async () => {
  const requestSignals: AbortSignal[] = [];
  jest.spyOn(global, 'fetch').mockImplementation((_url, init) => {
    if (init?.signal) {
      requestSignals.push(init.signal);
    }
    return new Promise<Response>(() => {});
  });
  render(
    <BedBoard
      {...defaultProps}
      data={[
        occupiedBed,
        {
          ...occupiedBed,
          id: 'ENC/002',
          room: '404',
          bedCode: 'NYC.G6-2',
          encounterId: 'ENC/002',
          patientId: 'P-002',
          patientName: 'Người bệnh B',
        },
      ]}
    />,
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Mở thông tin bệnh nhân Người bệnh A',
    }),
  );
  await waitFor(() => expect(requestSignals).toHaveLength(1));
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Mở thông tin bệnh nhân Người bệnh B',
    }),
  );

  await waitFor(() => expect(requestSignals).toHaveLength(2));
  expect(requestSignals[0].aborted).toBe(true);
  expect(requestSignals[1].aborted).toBe(false);
});

test('window focus refetches notes only while drawer is open', async () => {
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(notesResponse());
  render(<BedBoard {...defaultProps} />);

  act(() => {
    window.dispatchEvent(new Event('focus'));
  });
  expect(fetchMock).not.toHaveBeenCalled();

  fireEvent.click(
    screen.getByRole('button', { name: 'Mở thông tin bệnh nhân Người bệnh A' }),
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  act(() => {
    window.dispatchEvent(new Event('focus'));
  });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
});

test('notes API error does not crash the chart', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({}),
  } as Response);
  render(<BedBoard {...defaultProps} />);

  fireEvent.click(
    screen.getByRole('button', { name: 'Mở thông tin bệnh nhân Người bệnh A' }),
  );

  await waitFor(() =>
    expect(
      screen.getByText('Không thể tải ghi chú lâm sàng.'),
    ).toBeInTheDocument(),
  );
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
