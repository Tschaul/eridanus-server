import { ContainerRegistry } from "../container-registry";
import { CryptoWrapperMock } from "./mocks/crypto-warpper-mock";
import { CryptoWrapper } from "../infrastructure/crypto/crypto-wrapper";
import { registerMessageMocks } from "./mocks/mail-mocks";

export function setupContainerRegistry() {
  const containerRegistry =  new ContainerRegistry({
    dataPath: './temp',
    millisecondsPerDay: 5000,
    mailSettings: undefined as any,
    baseUrl: 'http://test',
    developmentMode: false,
    tokenExpirePeriod: 9999999999999,
    telegramBotName: 'telegram-bot-name',
    telegramBotToken: 'telegram-bot-token'
  });

  containerRegistry.globalContainer.unbind(CryptoWrapper);
  containerRegistry.globalContainer.bind(CryptoWrapper).to(CryptoWrapperMock as any);

  registerMessageMocks(containerRegistry.globalContainer);

  return {
    containerRegistry,
  };
}