# lambda-tube

Access to youtube via AWS lambda functions and S3 storage.

This project has no purpose whatsoever.

## Deploying

Create a `config.json` file in root with the values for the variables specified in the `env.js` file.

Create a `~/.aws/credentials` file with your credentials for claudia.

Then, you can deploy using the scripts from `packages.json` to deploy to your own account.

## AWS Config

Create a bucket just for this and set public read access CLA.

Then, add the following permissions to your lambda executor role:

```json
{
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObjectAcl",
                "s3:GetObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::*/*",
                "<your bucket's arn>"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "s3:HeadBucket",
            "Resource": "*"
        }
    ]
}
```