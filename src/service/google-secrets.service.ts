import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
const secretmanagerClient = new SecretManagerServiceClient({});

export class GoogleSecretService {
    static async getParsed<U>(secretName: string): Promise<U> {
        //name: `projects/PROJECT_NUMBER/secrets/SECRET_NAME/versions/latest`
        const name = `projects/eco501c3/secrets/${secretName}/versions/latest`;
        const [version] = await secretmanagerClient.accessSecretVersion({
            name
        });

        return JSON.parse(
            (version as any).payload?.data?.toString('utf8') || '{}'
        ) as U;
    }
}
