import { injectable } from "inversify";
import { CommandExecutor } from "../command-executor";
import { SignUpUserCommand } from "../../../../shared/messages/commands";
import { UserRepository } from "../../../repositories/users/user-repository";

@injectable()
export class SignUpUserExecutor implements CommandExecutor<SignUpUserCommand> {

  constructor(private userRepository: UserRepository) {
  }

  async execute(command: SignUpUserCommand) {

    await this.userRepository.createUser(command.id, command.email, command.password);

  }

}