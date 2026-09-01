import { EmailService } from './email.service';
import { Invoice } from './templates/invoice';
import { resolveTenantHostname } from './tenant-domain';

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
    global.fetch = jest
      .fn()
      .mockResolvedValue(
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
      .mockResolvedValue(
        new Response('renderer failed', { status: 500 }),
      ) as any;

    await expect(
      service.sendCourseAttendeeApplied({ ...message, invoice }),
    ).rejects.toThrow(/renderer failed/i);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('passes a conference logo to the shared invoice renderer', async () => {
    const { message, service } = fixture();
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(new Uint8Array([37, 80, 68, 70]), { status: 200 }),
      ) as any;

    await service.sendConferenceInvoice({
      ...message,
      conferenceLogo: 'http://minio:9000/images/conference-logo.png',
      conferenceName: 'Conference',
      invoice,
    });

    const request = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(JSON.parse(request.body)).toEqual(
      expect.objectContaining({
        logo: 'http://minio:9000/images/conference-logo.png',
      }),
    );
  });
});

describe('course notification tenant links', () => {
  it.each([
    ['flawis.flaw.uniba.sk', 'https://courses.flaw.uniba.sk/en/course-id'],
    [
      'flawis-staging.flaw.uniba.sk',
      'https://courses-staging.flaw.uniba.sk/en/course-id',
    ],
  ])(
    'links accepted attendees from %s to %s',
    async (hostname, expectedUrl) => {
      const { message, sendMail, service } = fixture();

      await service.sendCourseAttendeeAccepted({ ...message, hostname });

      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({ url: expectedUrl }),
        }),
      );
    },
  );

  it('resolves admin tenant domains for both environments', () => {
    expect(resolveTenantHostname('courses.flaw.uniba.sk', 'flawis')).toBe(
      'flawis.flaw.uniba.sk',
    );
    expect(
      resolveTenantHostname('courses-staging.flaw.uniba.sk', 'flawis'),
    ).toBe('flawis-staging.flaw.uniba.sk');
  });
});

describe('mail delivery error handling', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('acknowledges a permanent SMTP rejection after logging it once', async () => {
    const { message, sendMail, service } = fixture();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorLog = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    sendMail.mockRejectedValue(
      Object.assign(new Error('Recipient address rejected'), {
        code: 'EENVELOPE',
        command: 'RCPT TO',
        responseCode: 550,
      }),
    );

    await expect(
      service.sendResetLink({ ...message, token: 'reset-token' }),
    ).resolves.toBeUndefined();

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(log).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(JSON.parse(errorLog.mock.calls[0][0])).toEqual(
      expect.objectContaining({
        event: 'mail.delivery_failed',
        routingKey: 'mail.reset',
        recipient: message.email,
        attempt: 1,
        permanent: true,
        code: 'EENVELOPE',
        command: 'RCPT TO',
        responseCode: 550,
      }),
    );
  });

  it('records which queue accepted a successful co-author message', async () => {
    const { message, sendMail, service } = fixture();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    await service.sendCoauthorLink({
      ...message,
      conferenceName: 'Conference',
      conferenceSlug: 'conference',
      token: 'author-token',
      submissionId: 'submission-id',
      submissionName: 'Submission',
      submissionAbstract: 'Abstract',
      submissionKeywords: ['keyword'],
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(JSON.parse(log.mock.calls[0][0])).toEqual(
      expect.objectContaining({
        event: 'mail.delivery_succeeded',
        routingKey: 'mail.conference.coAuthor',
        recipient: message.email,
        attempt: 1,
      }),
    );
  });
});
