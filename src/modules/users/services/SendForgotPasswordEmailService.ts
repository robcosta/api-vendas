import AppError from '@shared/errors/AppError';
import { getCustomRepository } from 'typeorm';
import path from 'path';
import UsersRepository from '../typeorm/repositories/UsersRepository';
import UserTokensRepository from '../typeorm/repositories/UserTokensRepository';
import EtherealMail from '@config/mail/EtherealMail';

interface IRequest {
  email: string;
}

class SendForgotPasswordEmailService {
  public async execute({ email }: IRequest): Promise<void> {
    const userRepository = getCustomRepository(UsersRepository);
    const userTokenRepository = getCustomRepository(UserTokensRepository);

    //Verificando se o email existe
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User does not exists.');
    }

    //Gerando o token do usuário
    const { token } = await userTokenRepository.generate(user.id);

    const forgotPasswordTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'forgot_password.hbs',
    );

    await EtherealMail.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: '[API Vendas] Recuperação de Senha.',
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: user.name,
          token, //link: `http://localhost:3000/reset_password?token=${token}`,
        },
      },
    });
  }
}

export default SendForgotPasswordEmailService;
