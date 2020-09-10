## About

This demo showcases how to use the Amazon Chime SDK to support role-based smart video sending control.

There are two different roles: student and instructor.

- For students, they will always have their local video tile and the instructor’s video once the instructor turns it on.
- The instructor, on the other hand, will have options to turn on/off remote videos of each individual student once they turn on their video.

## To run the app locally:

1. Install dependencies: `npm install`

2. Start the webpack server and the node server concurrently: `npm run start`

3. Open https://0.0.0.0:9000/ in your browser

## To deploy the serverless device demo

### Install aws and sam command line tools

- [Install the AWS CLI version 2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

- [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

### Run deployment script

The following will create a CloudFormation stack containing a Lambda and
API Gateway deployment that runs the demo.

```
cd serverless
node ./deploy.js -r us-east-1 -b <YOUR-S3-BUCKET-NAME> -s <YOUR-CLOUDFORMATION-STACK-NAME>
```

The script will create an S3 bucket and CloudFormation stack
with Lambda and API Gateway resources required to run the demo. After the script
finishes, it will output a URL that can be opened in a browser.

### Clean up

To remove all the resources from this project, simply delete the CloudFormation stack.

## Disclaimer

Deploying the Amazon Chime SDK Smart Video demo application contained in this repository will cause your AWS Account to be billed for services, including the Amazon Chime SDK, used by the application.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
