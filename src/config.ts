// function main(name) {
//   // [START secretmanager_v1_generated_SecretManagerService_GetSecret_async]
//   /**
//    * This snippet has been automatically generated and should be regarded as a code template only.
//    * It will require modifications to work.
//    * It may require correct/in-range values for request initialization.
//    * TODO(developer): Uncomment these variables before running the sample.
//    */
//   /**
//    *  Required. The resource name of the Secret google.cloud.secretmanager.v1.Secret, in the format `projects/* /secrets/*`.
//    */
//   // const name = 'abc123'

//   // Imports the Secretmanager library
//   const {SecretManagerServiceClient} = require('@google-cloud/secret-manager').v1;

//   // Instantiates a client
//   const secretmanagerClient = new SecretManagerServiceClient();

//   async function callGetSecret() {
//     // Construct request
//     const request = {
//       name,
//     };

//     // Run request
//     const response = await secretmanagerClient.getSecret(request);
//     console.log(response);
//   }

//   callGetSecret();
//   // [END secretmanager_v1_generated_SecretManagerService_GetSecret_async]
// }

// process.on('unhandledRejection', err => {
//   console.error(err.message);
//   process.exitCode = 1;
// });
// main(...process.argv.slice(2));

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

interface NmConfig {
    googleApi: {
        type: string;
        project_id: string;
        private_key_id: string;
        private_key: string;
        client_email: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_x509_cert_url: string;
    };
    discordConfig: {};
}

export const Config = async (): {} => {};
