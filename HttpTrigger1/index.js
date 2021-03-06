const identity = require("@azure/identity");
const msRestNodeauth = require("@azure/ms-rest-nodeauth");

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  process.env.AZURE_LOG_LEVEL = "verbose";
  const managedIdentityClientId = "bf031ca3-5eac-4592-a92f-a08a77cbc610";

  // console.log("Trying the DefaultAzureCredential");
  // try {
  //   let credential = new identity.DefaultAzureCredential({
  //     managedIdentityClientId,
  //   });
  //   const result = await credential.getToken("https://vault.azure.net/");
  //   console.log("DefaultAzureCredential", result);
  // } catch (e) {
  //   console.error("DefaultAzureCredential error", e.message);
  // }
// 
  // console.log("Trying the ManagedIdentityCredential");
  // try {
  //   let credential = new identity.ManagedIdentityCredential(
  //     managedIdentityClientId
  //   );
  //   const result = await credential.getToken("https://vault.azure.net/");
  //   console.log("ManagedIdentityCredential", result);
  // } catch (e) {
  //   console.error("ManagedIdentityCredential error", e.message);
  // }

  const tries = 10;
  let totalTokensFound = 0;

  console.log(`Trying ${tries} times with the DefaultAzureCredential without parameters`);
  try {
    let credential = new identity.DefaultAzureCredential();
    const promises = [];
    for (let i = 0; i < tries; i++) {
      promises.push(credential.getToken("https://graph.microsoft.com/.default"));
    }
    for (promise of promises) {
      const result = await promise;
      if (result && result.token) {
        console.log("RESULT", totalTokensFound, result.token);
        totalTokensFound++;
      }
    }
  } catch (e) {
    console.log(`${tries} times DefaultAzureCredential without parameters error somewhere`, e);
  }

  console.log(`Total tokens found: ${totalTokensFound}`);

  console.log(`Trying ${tries} times with the ManagedIdentityCredential without parameters`);
  try {
    let credential = new identity.ManagedIdentityCredential();
    const promises = [];
    for (let i = 0; i < tries; i++) {
      promises.push(credential.getToken("https://graph.microsoft.com/.default"));
    }
    for (promise of promises) {
      const result = await promise;
      if (result && result.token) {
        totalTokensFound++;
      }
    }
  } catch (e) {
    console.log(`${tries} times ManagedIdentityCredential without parameters error somewhere`, e);
  }
  console.log(`Total tokens found: ${totalTokensFound}`);

  console.log(`Trying ${tries} times with the ManagedIdentityCredential`);
  try {
    let credential = new identity.ManagedIdentityCredential(
      managedIdentityClientId
    );
    const promises = [];
    for (let i = 0; i < tries; i++) {
      promises.push(credential.getToken("https://vault.azure.net/"));
    }
    for (promise of promises) {
      const result = await promise;
      if (result && result.token) {
        totalTokensFound++;
      }
    }
  } catch (e) {
    console.log(`${tries} times ManagedIdentityCredential error somewhere`, e);
  }

  // console.log("Trying the loginWithAppServiceMSI");
  // try {
  //   let credential = await msRestNodeauth.loginWithAppServiceMSI({
  //     clientId: managedIdentityClientId,
  //   });
  //   const result = await credential.getToken("https://vault.azure.net/");
  //   console.log("loginWithAppServiceMSI", result);
  // } catch (e) {
  //   console.error("loginWithAppServiceMSI error", e.message);
  // }

  console.log(`Total tokens found: ${totalTokensFound}`);

  console.log(`Trying ${tries} times with the loginWithAppServiceMSI`);
  try {
    let credential = await msRestNodeauth.loginWithAppServiceMSI({
      clientId: managedIdentityClientId,
    });
    const promises = [];
    for (let i = 0; i < tries; i++) {
      promises.push(credential.getToken("https://vault.azure.net/"));
    }
    for (promise of promises) {
      const result = await promise;
      if (result) {
        totalTokensFound++;
      }
    }
  } catch (e) {
    console.log(`${tries} times loginWithAppServiceMSI error somewhere`, e);
  }

  console.log(`Total tokens found: ${totalTokensFound}`);

  const name = req.query.name || (req.body && req.body.name);
  const responseMessage = name
    ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};
