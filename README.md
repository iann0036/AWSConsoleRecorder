# Console Recorder for AWS

> Records actions made in the AWS Management Console and outputs the equivalent CLI/SDK commands and CloudFormation template.

![Screenshot](assets/screen1.png)

:exclamation: **CAUTION:** This project is currently in alpha stages. Many components may not work as expected.

## Installation

You can download the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/awsconsolerecorder/djhgeeodemlfdpmcccdekfalbhllcoim) or load the extension manually.

## Usage

You can click the orange Console Recorder for AWS icon in the top-right corner of your Chrome window. If you do not see it, you may find it by clicking the three vertical dots and checking the top row. Once the popup is presented, click the **Start Recording** button.

![Screenshot](assets/screen2.png)

All supported actions will be recorded up until the point in which you click the icon again and select the **Stop Recording** button, at which point you will be presented with the dashboard for you to copy code from.

## Coverage

Not all actions and resources are supported yet, check [this page](https://github.com/iann0036/AWSConsoleRecorderGenerator/blob/master/coverage.md) for an up-to-date overview of supported actions and resources. This page is automatically generated.

## Bugs

Given the nature of the extension, and the frequency in which the AWS team make updates, bugs will be frequent and inevitable. If you find these bugs, check [the issues page](https://github.com/iann0036/AWSConsoleRecorder/issues) to see if it has already been raised and if not, feel free to raise it.
