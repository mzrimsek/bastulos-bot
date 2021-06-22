export abstract class Client<ClientType> {
  abstract getClient(): Promise<ClientType>;
}
