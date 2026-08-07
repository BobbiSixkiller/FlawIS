import { Service } from "typedi";

import { Section } from "../entitites/Section";
import { Repository } from "./base.repository";

@Service()
export class SectionRepository extends Repository<typeof Section> {
  constructor() {
    super(Section);
  }
}
