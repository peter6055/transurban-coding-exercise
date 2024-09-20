# Transurban-coding-exercise

## Deploying the CDK stack

### Prerequisites

Notes: The following steps assume you already have AWS CDK CLI installed and configured with your AWS account.

Please refer to the following link for more information:https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_configure

In case your AWS CDK CLI is not initialized, you can run the following command to initialize the CDK project:

```bash
aws configure sso 
aws sso login  
```

### Getting Started

**Please continue the following process after completing prerequisites**

1. Install the dependencies
   ```bash
   npm install
   ```

2. Create a S3 bucket to store the CDK assets, `ACCOUNT-NUMBER` and `REGION` are your AWS account number and the region
   where you want to deploy the CDK stack.
   ```bash
   cdk bootstrap aws://ACCOUNT-NUMBER/REGION
   ```

3. Deploy the CDK stack
   ```bash
   cdk deploy
   ```

4. Find the output of the API Gateway URL and API Key in the terminal output after the deployment is completed.
   ```
   TransurbanCodingExerciseStack.APIKeyID = XXXX
   TransurbanCodingExerciseStack.RestAPIEndpointB14C3C54 = https://XXXX.amazonaws.com/prod/
   ```

5. Retrieve the API Key value from api gateway, `XXXX` is the `APIKeyID` from the output of the CDK deployment.
    ```bash
    aws apigateway get-api-key --api-key XXXX --include-value
    ```

## Assumptions

- The API key is created when deploying the CDK stack, a formal way of doing it in production environment is to
  automatically generate it when user try to login with their credential.
- The find address API `POST /address/find`, params "suburb" and "state" are optional, the expression is OR between
  suburb and state.

## Infrastructure Diagram


## API Documentation
### Endpoints
| Method | URL               | Description                                                               |
|--------|-------------------|---------------------------------------------------------------------------|
| `POST` | `/address/find`   | Find address using user ID, and an optional filter of Suburb and Postcode |
| `POST` | `/address/create` | Create address under a specific user                                      |

### Details Request and Response
https://documenter.getpostman.com/view/30661295/2sAXqs7NAg

### Response Status Code
| Code  | Title                     | Description                                                                            |
| ----- | ------------------------- |----------------------------------------------------------------------------------------|
| `200` | `OK`                      | When a request was successfully processed                                              |
| `201` | `Created`                 | Every time a record has been added to the database                                     |
| `400` | `Bad request`             | When the request could not be understood (e.g. invalid syntax).                        |
| `401` | `Unauthorized`            | When authentication failed. (no key/key invalid)                                       |
| `403` | `Forbidden`               | When an authenticated user is trying to perform an action does not have permission to. |
| `404` | `Not found`               | When URL or entity is not found.                                                       |
| `500` | `Internal server error`   | When an internal error has happened                                                    |
Notes: Inspired by https://github.com/ml-archive/readme/blob/master/Documentation/how-to-write-apis.md?plain=1



## QA
- Type Coverage `type-coverage` is used to check the type coverage of the project.
- 
