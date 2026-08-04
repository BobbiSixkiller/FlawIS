import { EmailService } from './email.service';
import { Invoice } from './templates/invoice';

const invoice: Invoice = {
  body: {
    type: 'Invoice',
    issueDate: new Date('2026-08-03T00:00:00.000Z'),
    vatDate: new Date('2026-08-03T00:00:00.000Z'),
    dueDate: new Date('2026-08-18T00:00:00.000Z'),
    price: 80,
    vat: 19,
    body: 'Course registration fee',
    comment: 'Pay by the due date',
  },
  issuer: {
    name: 'Issuer',
    address: {
      street: 'Street 1',
      city: 'Bratislava',
      postal: '811 01',
      country: 'Slovakia',
    },
    ICO: '123',
    DIC: '456',
    ICDPH: 'SK456',
    variableSymbol: '20260001',
    IBAN: 'SK0000000000000000000000',
    SWIFT: 'TESTSKBX',
  },
  payer: {
    name: 'Payer',
    address: {
      street: 'Street 2',
      city: 'Bratislava',
      postal: '811 02',
      country: 'Slovakia',
    },
    ICO: '',
    DIC: '',
    ICDPH: '',
  },
};

function fixture() {
  const sendMail = jest.fn().mockResolvedValue(undefined);
  const service = new EmailService(
    { sendMail } as any,
    { t: jest.fn((key: string) => key) } as any,
  );
  const message = {
    locale: 'en' as const,
    hostname: 'courses.example.test',
    name: 'Payer',
    email: 'payer@example.com',
    courseId: 'course-id',
    course: 'Course',
  };

  return { message, sendMail, service };
}

describe('course application invoice attachments', () => {
  const originalFetch = global.fetch;
  const originalSecret = process.env.INVOICE_RENDER_SECRET;

  beforeEach(() => {
    process.env.INVOICE_RENDER_SECRET = 'render-secret';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.INVOICE_RENDER_SECRET = originalSecret;
    jest.restoreAllMocks();
  });

  it('does not render or attach an invoice for a free course', async () => {
    const { message, sendMail, service } = fixture();
    global.fetch = jest.fn() as any;

    await service.sendCourseAttendeeApplied(message);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ attachments: undefined }),
    );
  });

  it('renders and attaches an invoice for a paid course', async () => {
    const { message, sendMail, service } = fixture();
    global.fetch = jest.fn().mockResolvedValue(
      new Response(new Uint8Array([37, 80, 68, 70]), { status: 200 }),
    ) as any;

    await service.sendCourseAttendeeApplied({ ...message, invoice });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://client:3000/api/internal/invoices/render',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-invoice-render-secret': 'render-secret',
        }),
      }),
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({ filename: 'invoice-20260001.pdf' }),
        ],
      }),
    );
  });

  it('does not send the paid-course email when rendering fails', async () => {
    const { message, sendMail, service } = fixture();
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response('renderer failed', { status: 500 })) as any;

    await expect(
      service.sendCourseAttendeeApplied({ ...message, invoice }),
    ).rejects.toThrow(/renderer failed/i);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
