import { Msg } from '../email.service';

export interface AuthorMsg extends Msg {
  conferenceName: string;
  conferenceSlug: string;
  token: string;
  submissionId: string;
  ticketId: string;
  submissionName: string;
  submissionAbstract: string;
  submissionKeywords: string[];
}
