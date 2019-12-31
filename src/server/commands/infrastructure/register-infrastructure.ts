import { Container } from "inversify";
import { GlobalErrorHandler } from "./error-handling/global-error-handler";
import { CryptoWrapper } from "./crypto/crypto-wrapper";
import { Initializer } from "./initialisation/initializer";

export function registerGlobalInfrastructure(container: Container) {
  container.bind(GlobalErrorHandler).toSelf();
  container.bind(CryptoWrapper).toSelf();
  container.bind(Initializer).toSelf();
}