import { CreateContractDto } from '../../application/dto/create-contract.dto';

export class ContractCreatedEvent {
  constructor(public readonly contract: CreateContractDto) {}
} 