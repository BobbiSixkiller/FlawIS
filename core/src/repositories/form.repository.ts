import { Service } from "typedi";
import {
  Form,
  FormAnswer,
  FormAnswerRevision,
  FormBinding,
  FormDefinition,
} from "../entitites/Form";
import { Repository } from "./base.repository";

@Service()
export class FormRepository extends Repository<typeof Form> {
  constructor() {
    super(Form);
  }
}
@Service()
export class FormDefinitionRepository extends Repository<
  typeof FormDefinition
> {
  constructor() {
    super(FormDefinition);
  }
}
@Service()
export class FormBindingRepository extends Repository<typeof FormBinding> {
  constructor() {
    super(FormBinding);
  }
}
@Service()
export class AnswerRepository extends Repository<typeof FormAnswer> {
  constructor() {
    super(FormAnswer);
  }
}
@Service()
export class AnswerRevisionRepository extends Repository<
  typeof FormAnswerRevision
> {
  constructor() {
    super(FormAnswerRevision);
  }
}
