import { Msg } from '../email.service';

export interface AuthorMsg extends Msg {
  conferenceName: string;
  conferenceSlug: string;
  submissionId: string;
  submissionName: string;
  submissionAbstract: string;
  submissionKeywords: string[];
  hostname: string;
}
