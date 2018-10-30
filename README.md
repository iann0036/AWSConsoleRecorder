# Console Recorder for AWS

> Records actions made in the AWS Management Console and outputs the equivalent CLI/SDK commands and CloudFormation template.


![Screenshot](assets/screen1.png)

:exclamation: **CAUTION:** This project is currently in alpha stages. Many components may not work as expected.


## Installation

### Google Chrome

You can download the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/console-recorder/ganlhgooidfbijjidcpkeaohjnkeicba) or load the extension manually via chrome://extensions/.

### Mozilla Firefox

You can download the extension from [Firefox Add-ons](https://addons.mozilla.org/en-GB/firefox/addon/console-recorder/) or load the extension manually via about:addons. If loaded manually, replace the `manifest.json` file with the `firefoxManifest.json` file before loading.

## Usage

Click the orange _Console Recorder for AWS_ icon in the top-right corner of your browser window. If you do not see it, you may find it by clicking the three vertical dots and checking the top row. Once the popup is presented, click the **Start Recording** button.

![Screenshot](assets/screen2.png)

All supported actions will be recorded up until the point in which you click the icon again and select the **Stop Recording** button, at which point you will be presented with the dashboard for you to copy code from.

## Settings

In the Settings section, there are a number of options you can set. These options take effect as soon as you change them.

### Block Mutable Requests

This option will stop any mutable requests (most things that aren't a `Get*` or `List*` action) from executing in the console, whilst still logging the generated outputs in the dashboard.

### Intercept Responses

This option will record the response body from all AWS calls. Setting this allows CloudFormation to correlate actions between resources and allows the `!Ref` and `!GetAtt` intrinsic functions to be used to reference resource identifiers within the template.

:warning: **Note:** When Intercept Responses is set in Google Chrome, a notification telling you the extension is debugging the browser is shown for the duration of the recording for security purposes.

## Coverage

Not all actions and resources are supported yet, check [this page](https://github.com/iann0036/AWSConsoleRecorderGenerator/blob/master/coverage.md) for an up-to-date overview of supported actions and resources. This page is automatically generated.

## Bugs

Given the nature of the extension, and the frequency in which the AWS team make updates, bugs will be frequent and inevitable. If you find these bugs, check [the issues page](https://github.com/iann0036/AWSConsoleRecorder/issues) to see if it has already been raised and if not, feel free to raise it.
