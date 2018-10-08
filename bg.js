// awscr@ian.mn

var declared_services;
var compiled;
var go_first_output;

function notifyBlocked() {
    console.log("Calling notify");
    chrome.notifications.create(null, {
        type: "basic",
        title: "Console Recorder",
        message: "An AWS console request was blocked.",
        iconUrl: "icon-128.png",
        buttons: [
            {
                'title': 'View Outputs'
            }
        ]
    });
}

function ensureInitDeclaredBoto3(service, region) {
    if (!declared_services['boto3'].includes(service)) {
        declared_services['boto3'].push(service);
        return `
${service}_client = boto3.client('${service}', region_name='${region}')

`;
    }
    return '';
}

function ensureInitDeclaredGo(service, region) {
    if (!declared_services['go'].includes(service)) {
        declared_services['go'].push(service);
        return `
${service}svc := ${service}.New(session.New(&aws.Config{Region: aws.String("${region}")}))

`;
    }
    return '';
}

function processCfnParameter(param, spacing) {
    var paramitems = [];

    if (param === undefined || param === null)
        return undefined;
    if (typeof param == "boolean") {
        if (param)
            return '"true"';
        return '"false"';
    }
    if (typeof param == "number")
        return `${param}`;
    if (typeof param == "string")
        return `"${param}"`;
    if (Array.isArray(param)) {
        if (param.length == 0) {
            return '[]';
        }

        param.forEach(paramitem => {
            paramitems.push(processCfnParameter(paramitem, spacing + 4));
        });

        return `
` + ' '.repeat(spacing + 2) + "- " + paramitems.join(`
` + ' '.repeat(spacing + 2) + "- ")
    }
    if (typeof param == "object") {
        Object.keys(param).forEach(function (key) {
            paramitems.push(key + ": " + processCfnParameter(param[key], spacing + 4));
        });

        return `
` + ' '.repeat(spacing + 4) + paramitems.join(`
` + ' '.repeat(spacing + 4))
    }
    
    return undefined;
}

function processBoto3Parameter(param, spacing) {
    var paramitems = [];

    if (param === undefined || param === null)
        return undefined;
    if (typeof param == "boolean") {
        if (param)
            return "True";
        return "False";
    }
    if (typeof param == "number")
        return `${param}`;
    if (typeof param == "string")
        return `'${param}'`;
    if (Array.isArray(param)) {
        if (param.length == 0) {
            return '[]';
        }

        param.forEach(paramitem => {
            var item = processBoto3Parameter(paramitem, spacing + 4);
            if (item !== undefined) {
                paramitems.push(item);
            }
        });

        return `[
` + ' '.repeat(spacing + 4) + paramitems.join(`,
` + ' '.repeat(spacing + 4)) + `
` + ' '.repeat(spacing) + ']';
    }
    if (typeof param == "object") {
        Object.keys(param).forEach(function (key) {
            var item = processBoto3Parameter(param[key], spacing + 4);
            if (item !== undefined) {
                paramitems.push(key + "=" + processBoto3Parameter(param[key], spacing + 4));
            }
        });

        return `{
` + ' '.repeat(spacing + 4) + paramitems.join(`,
` + ' '.repeat(spacing + 4)) + `
` + ' '.repeat(spacing) + '}';
    }
    
    return undefined;
}

function processGoParameter(paramkey, param, spacing) {
    var paramitems = [];

    if (param === undefined || param === null)
        return undefined;
    if (typeof param == "boolean") {
        if (param)
            return "aws.Bool(true)";
        return "aws.Bool(false)";
    }
    if (typeof param == "number")
        return `aws.Int64(${param})`;
    if (typeof param == "string")
        return `aws.String('${param}')`;
    if (Array.isArray(param)) {
        return "";
    }
    if (typeof param == "object") {
        return "";
    }
    
    return undefined;
}

function outputMapBoto3(service, method, options, region, was_blocked) {
    var output = ensureInitDeclaredBoto3(service, region);
    var params = '';

    if (Object.keys(options).length) {
        for (option in options) {
            if (options[option] !== undefined) {
                var optionvalue = processBoto3Parameter(options[option], 4);
                params += `
    ${option}=${optionvalue},`;
            }
        }
        params = params.substring(0, params.length - 1) + `
`; // remove last comma
    }

    output += `response = ${service}_client.${method}(${params})${was_blocked ? ' # blocked' : ''}
`

    return output;
}

function outputMapGo(service, method, options, region, was_blocked) {
    var output = ensureInitDeclaredGo(service, region);
    var params = '';

    if (Object.keys(options).length) {
        for (option in options) {
            if (options[option] !== undefined) {
                var optionvalue = processGoParameter(option, options[option], 4);
                params += `
        ${option}:  ${optionvalue},`;
            }
        }
        params += `
`;
    }

    output += `_, err ${go_first_output ? ':' : ''}= ${service}svc.${method}(&${service}.${method}Input{${params}})${was_blocked ? ' // blocked' : ''}
`

    go_first_output = false;

    return output;
}

function genRandomChars() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";
  
    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

function outputMapCfn(service, type, options, region, was_blocked) {
    var output = '';
    var params = '';

    if (Object.keys(options).length) {
        for (option in options) {
            if (options[option] !== undefined) {
                var optionvalue = processCfnParameter(options[option], 12);
                params += `
            ${option}: ${optionvalue}`;
            }
        }
        params += `
`;
    }

    var resource_name = service + genRandomChars();

    output += `    ${resource_name}:${was_blocked ? ' # blocked' : ''}
        Type: "${type}"
        Properties:${params}
`

    return output;
}

function outputMapCli(service, method, options, region, was_blocked) {
    var params = '';

    if (Object.keys(options).length) {
        if ('_' in options) {
            options['_'].forEach(arg => {
                params += ` ${arg}`
            });
            delete options['_'];
        }
        if ('_service' in options) {
            service = options['_service'];
            delete options['_service'];
        }
        for (option in options) {
            if (options[option] === null)
                params += ` ${option}`
            else {
                var optionvalue = JSON.stringify(options[option]);
                if (typeof options[option] == "object")
                    optionvalue = "'" + optionvalue + "'";
                params += ` ${option} ${optionvalue}`
            }
        }
    }

    output = `aws ${service} ${method}${params} --region ${region}${was_blocked ? ' # blocked' : ''}
`

    return output;
}

function compileOutputs() {
    if (!outputs.length) {
        return {
            'boto3': '# No recorded actions yet',
            'go': '// No recorded actions yet',
            'cfn': '# No recorded actions yet',
            'cli': '# No recorded actions yet',
            'raw': ''
        };
    }

    var services = {
        'go': []
    }
    for (var i=0; i<outputs.length; i++) {
        if (!services['go'].includes(outputs[i].service)) {
            services['go'].push(outputs[i].service);
        }
    }

    var region = outputs[0].region;
    compiled = {
        'boto3': `# pip install boto3

import boto3
`,
        'go': `// go get -u github.com/aws/aws-sdk-go/...

package main

import (
${services.go.map(service => `    "github.com/aws/aws-sdk-go/service/${service}"`).join(`
`)}
)
`,
        'cfn': `${tracked_resources.length == 0 ? '# No resources created in recording' : `AWSTemplateFormatVersion: "2010-09-09"
Metadata:
    Generator: "console-recorder"
Description: ""
Resources:
`}`,
        'cli': `# pip install awscli --upgrade --user

`
    }
    declared_services = {
        'boto3': [],
        'go': []
    }
    go_first_output = true;

    compiled['raw'] = JSON.stringify({
        'outputs': outputs,
        'tracked_resources': tracked_resources
    });

    for (var i=0; i<outputs.length; i++) {
        compiled['boto3'] += outputMapBoto3(outputs[i].service, outputs[i].method.boto3, outputs[i].options.boto3, outputs[i].region, outputs[i].was_blocked);
        compiled['go'] += outputMapGo(outputs[i].service, outputs[i].method.api, outputs[i].options.go, outputs[i].region, outputs[i].was_blocked);
        compiled['cli'] += outputMapCli(outputs[i].service, outputs[i].method.cli, outputs[i].options.cli, outputs[i].region, outputs[i].was_blocked);
    }

    for (var i=0; i<tracked_resources.length; i++) {
        compiled['cfn'] += outputMapCfn(tracked_resources[i].service, tracked_resources[i].type, tracked_resources[i].options.cfn, tracked_resources[i].region, tracked_resources[i].was_blocked);
    }

    return compiled;
}

function convertApiToCli(str) {
    var i = 1;
    var character = '';
    var next_char = '';
    var prev_char = '';
    var outputstr = str.substring(0,1).toLowerCase();
    
    while (i <= str.length) {
        character = str.charAt(i);
        next_char = str.charAt(i+1);
        prev_char = str.charAt(i-1);
        if (character == character.toUpperCase() && character != "" && (next_char != next_char.toUpperCase() || prev_char != prev_char.toUpperCase())) {
            outputstr += "-";
        }
        outputstr += character.toLowerCase();
        i++;
    }

    return outputstr;
}

function recursiveParamsFromXml(node) {
    var ret = {};

    for (var child in node.children) {
        if (node.children[child].tagName) {
            if (node.children[child].children && node.children[child].children.length > 0) {
                ret[node.children[child].tagName] = recursiveParamsFromXml(node.children[child]);
            } else {
                ret[node.children[child].tagName] = node.children[child].textContent;
            }
        }
    }

    return ret;
}

function addToParamsFromXml(params, xml) {
    var xmlobj = new DOMParser().parseFromString(xml, "text/xml");
    var root = xmlobj.firstChild;
    var tagname = root.tagName;
    var value = recursiveParamsFromXml(xmlobj);

    params.boto3[tagname] = value[tagname];
    params.cli['--' + convertApiToCli(tagname)] = JSON.stringify(value[tagname]);

    return params;
}

chrome.webRequest.onBeforeRequest.addListener(
    analyseRequest,
    {urls: ["<all_urls>"]},
    ["requestBody","blocking"]
);

chrome.webRequest.onBeforeRequest.addListener(
    analyseRequest,
    {urls: ["<all_urls>"]},
    ["requestBody","blocking"]
);

chrome.browserAction.onClicked.addListener(
    function(){
        chrome.tabs.create({
            url: chrome.extension.getURL("main.html")
        });
    }
);

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.action == "getCompiledOutputs") {
            sendResponse(compileOutputs());
        }
        if (message.action == "setBlockingOn") {
            blocking = true;
            sendResponse(true);
        }
        if (message.action == "setBlockingOff") {
            blocking = false;
            sendResponse(true);
        }
        if (message.action == "getBlockingStatus") {
            sendResponse(blocking);
        }
        if (message.action == "clearData") {
            outputs = [];
            tracked_resources = [];
            sendResponse(true);
        }
    }
);

/******/

var outputs = [];
var tracked_resources = [];
var blocking = false;

function analyseRequest(details) {
    var reqParams = {
        'boto3': {},
        'go': {},
        'cfn': {},
        'cli': {}
    };
    var requestBody = "";
    var jsonRequestBody = {};
    var region = 'us-west-2';

    try {
        requestBody = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes)));
        jsonRequestBody = JSON.parse(requestBody);

        // check for string objects
        for (var prop in jsonRequestBody) {
            if (typeof jsonRequestBody[prop] == "string") {
                try {
                    var parsed = JSON.parse(jsonRequestBody[prop]);
                    jsonRequestBody[prop] = parsed;
                } catch(e) {;}
            }
        }
    } catch(e) {;}

    //--CloudFormation--//

    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cloudformation\/service\/stacks\?/g)) {
        console.log("TODO - CFN");
    }

    //--EC2--//
    
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getMergedInstanceList\?/g)) {
        if ('filters' in jsonRequestBody) {
            reqParams.cli['--filters'] = jsonRequestBody.filters;
            reqParams.boto3['Filter'] = [];
            jsonRequestBody['filters'].forEach(filter => {
                reqParams.boto3['Filter'].push({
                    'Name': filter['name'],
                    'Values': filter['values']
                });
            });
        }
        reqParams.boto3['MaxResults'] = jsonRequestBody.count;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeInstances',
                'boto3': 'describe_instances',
                'cli': 'describe-instances'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getPrivateImageList\?/g)) {
        if (jsonRequestBody['publicAndPrivate'] != true) {
            reqParams.boto3['Owner'] = ['self'];
            reqParams.cli['--owners'] = "self";
        }

        if ('imageType' in jsonRequestBody) {
            if (jsonRequestBody['filters'] === undefined)
                jsonRequestBody['filters'] = [];
            jsonRequestBody.filters['imageType'] = jsonRequestBody.imageType;
        }
        
        if ('filters' in jsonRequestBody) {
            reqParams.cli['--filters'] = jsonRequestBody.filters;
            reqParams.boto3['Filter'] = [];
            jsonRequestBody['filters'].forEach(filter => {
                reqParams.boto3['Filter'].push({
                    'Name': filter['name'],
                    'Values': filter['values']
                });
            });
        }
        reqParams.boto3['MaxResults'] = jsonRequestBody.count;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeImages',
                'boto3': 'describe_images',
                'cli': 'describe-images'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=searchAmis\?/g)) {
        reqParams.boto3['MaxResults'] = jsonRequestBody.count;
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeImages',
                'boto3': 'describe_images',
                'cli': 'describe-images'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getVpcs\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getSubnets\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getSdkResources_Hosts\?/g)) {
        if ('filters' in jsonRequestBody) {
            reqParams.cli['--filters'] = jsonRequestBody.filters;
            reqParams.boto3['Filter'] = [];
            jsonRequestBody['filters'].forEach(filter => {
                reqParams.boto3['Filter'].push({
                    'Name': filter['name'],
                    'Values': filter['values']
                });
            });
        }

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeHosts',
                'boto3': 'describe_hosts',
                'cli': 'describe-hosts'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getInstanceProfileList\?/g)) {
        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListInstanceProfiles',
                'boto3': 'list_instance_profiles',
                'cli': 'list-instance-profiles'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getNetworkInterfaces\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeNetworkInterfaces',
                'boto3': 'describe_network_interfaces',
                'cli': 'describe-network-interfaces'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getAvailabilityZones\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeAvailabilityZones',
                'boto3': 'describe_availability_zones',
                'cli': 'describe-availability-zones'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getSecurityGroups\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSecurityGroups',
                'boto3': 'describe_security_groups',
                'cli': 'describe-security-groups'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getKeyPairList\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeKeyPairs',
                'boto3': 'describe_key_pairs',
                'cli': 'describe-key-pairs'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=createSecurityGroup\?/g)) {
        reqParams.boto3['GroupDescription'] = jsonRequestBody.groupDescription;
        reqParams.boto3['GroupName'] = jsonRequestBody.groupName;
        reqParams.cli['--description'] = jsonRequestBody.groupDescription;
        reqParams.cli['--group-name'] = jsonRequestBody.groupName;
        reqParams.cfn['GroupDescription'] = jsonRequestBody.groupDescription;
        reqParams.cfn['GroupName'] = jsonRequestBody.groupName;
        if ('vpcId' in jsonRequestBody) {
            reqParams.boto3['VpcId'] = jsonRequestBody.vpcId;
            reqParams.cli['--vpc-id'] = jsonRequestBody.vpcId;
            reqParams.cfn['VpcId'] = jsonRequestBody.vpcId;
        }

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateSecurityGroup',
                'boto3': 'create_security_group',
                'cli': 'create-security-group'
            },
            'options': reqParams,
            'was_blocked': blocking
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::SecurityGroup',
            'options': reqParams,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=authorizeIngress\?/g)) {
        if ('groupId' in jsonRequestBody) {
            reqParams.boto3['GroupId'] = jsonRequestBody.groupId;
            reqParams.cli['--group-id'] = jsonRequestBody.groupId;
        }
        reqParams.boto3['IpPermissions'] = [];
        reqParams.cli['--ip-permissions'] = [];
        jsonRequestBody['ipPermissions'].forEach(ipPermission => {
            var ipRangeObjects = [];
            ipPermission['ipRangeObjects'].forEach(ipRangeObject => {
                ipRangeObjects.push({
                    'Description': ipRangeObject['description'],
                    'CidrIp': ipRangeObject['cidrIp']
                });
            });
            var ipv6RangeObjects = [];
            ipPermission['ipv6RangeObjects'].forEach(ipv6RangeObject => {
                ipv6RangeObjects.push({
                    'Description': ipv6RangeObject['description'],
                    'CidrIpv6': ipv6RangeObject['CidrIpv6']
                });
            });
            reqParams.boto3['IpPermissions'].push({
                'IpProtocol': ipPermission['ipProtocol'],
                'FromPort': ipPermission['fromPort'],
                'ToPort': ipPermission['toPort'],
                'IpRanges': ipRangeObjects,
                'Ipv6Ranges': ipv6RangeObjects
            });
            reqParams.cli['--ip-permissions'].push({
                'IpProtocol': ipPermission['ipProtocol'],
                'FromPort': ipPermission['fromPort'],
                'ToPort': ipPermission['toPort'],
                'IpRanges': ipRangeObjects,
                'Ipv6Ranges': ipv6RangeObjects
            });
        });

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'AuthorizeSecurityGroupIngress',
                'boto3': 'authorize_security_group_ingress',
                'cli': 'authorize-security-group-ingress'
            },
            'options': reqParams,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call\=com.amazonaws.ec2.AmazonEC2.RunInstances\?/g)) {
        reqParams.boto3['ImageId'] = jsonRequestBody.ImageId;
        reqParams.boto3['MaxCount'] = jsonRequestBody.MaxCount;
        reqParams.boto3['MinCount'] = jsonRequestBody.MinCount;
        reqParams.boto3['KeyName'] = jsonRequestBody.KeyName;
        reqParams.boto3['SecurityGroupId'] = jsonRequestBody.SecurityGroupIds;
        reqParams.boto3['InstanceType'] = jsonRequestBody.InstanceType;
        reqParams.boto3['Placement'] = jsonRequestBody.Placement;
        reqParams.boto3['Monitoring'] = jsonRequestBody.Monitoring;
        reqParams.boto3['DisableApiTermination'] = jsonRequestBody.DisableApiTermination;
        reqParams.boto3['InstanceInitiatedShutdownBehavior'] = jsonRequestBody.InstanceInitiatedShutdownBehavior;
        reqParams.boto3['CreditSpecification'] = jsonRequestBody.CreditSpecification;
        reqParams.boto3['TagSpecification'] = jsonRequestBody.TagSpecifications;
        reqParams.boto3['EbsOptimized'] = jsonRequestBody.EbsOptimized;
        reqParams.boto3['BlockDeviceMapping'] = jsonRequestBody.BlockDeviceMappings;

        reqParams.cfn['ImageId'] = jsonRequestBody.ImageId;
        reqParams.cfn['MaxCount'] = jsonRequestBody.MaxCount;
        reqParams.cfn['MinCount'] = jsonRequestBody.MinCount;
        reqParams.cfn['KeyName'] = jsonRequestBody.KeyName;
        reqParams.cfn['SecurityGroupId'] = jsonRequestBody.SecurityGroupIds;
        reqParams.cfn['InstanceType'] = jsonRequestBody.InstanceType;
        reqParams.cfn['Placement'] = jsonRequestBody.Placement;
        reqParams.cfn['Monitoring'] = jsonRequestBody.Monitoring;
        reqParams.cfn['DisableApiTermination'] = jsonRequestBody.DisableApiTermination;
        reqParams.cfn['InstanceInitiatedShutdownBehavior'] = jsonRequestBody.InstanceInitiatedShutdownBehavior;
        reqParams.cfn['CreditSpecification'] = jsonRequestBody.CreditSpecification;
        reqParams.cfn['TagSpecification'] = jsonRequestBody.TagSpecifications;
        reqParams.cfn['EbsOptimized'] = jsonRequestBody.EbsOptimized;
        reqParams.cfn['BlockDeviceMapping'] = jsonRequestBody.BlockDeviceMappings;

        reqParams.cli['--image-id'] = jsonRequestBody.ImageId;
        if (jsonRequestBody.MaxCount == jsonRequestBody.MinCount) {
            reqParams.cli['--count'] = jsonRequestBody.MinCount;
        } else {
            reqParams.cli['--count'] = jsonRequestBody.MinCount + ":" + jsonRequestBody.MaxCount;
        }
        reqParams.cli['--key-name'] = jsonRequestBody.KeyName;
        reqParams.cli['--security-group-ids'] = jsonRequestBody.SecurityGroupIds;
        reqParams.cli['--instance-type'] = jsonRequestBody.InstanceType;
        reqParams.cli['--placement'] = jsonRequestBody.Placement;
        reqParams.cli['--monitoring'] = jsonRequestBody.Monitoring;
        if (jsonRequestBody.DisableApiTermination === true)
            reqParams.cli['--disable-api-termination'] = null;
        else if (jsonRequestBody.DisableApiTermination === false)
            reqParams.cli['--enable-api-termination'] = null;
        reqParams.cli['--instance-initiated-shutdown-behavior'] = jsonRequestBody.InstanceInitiatedShutdownBehavior;
        reqParams.cli['--credit-specification'] = jsonRequestBody.CreditSpecification;
        reqParams.cli['--tag-specifications'] = jsonRequestBody.TagSpecifications;

        if (jsonRequestBody.EbsOptimized === true)
            reqParams.cli['--ebs-optimized'] = null;
        else if (jsonRequestBody.EbsOptimized === false)
            reqParams.cli['--no-ebs-optimized'] = null;
        reqParams.cli['--block-device-mappings'] = jsonRequestBody.BlockDeviceMappings;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'RunInstances',
                'boto3': 'run_instances',
                'cli': 'run-instances'
            },
            'options': reqParams,
            'was_blocked': blocking
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::Instance',
            'options': reqParams,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=terminateInstances\?/g)) {
        reqParams.boto3['InstanceIds'] = jsonRequestBody.instanceIds;
        reqParams.cli['--instance-ids'] = jsonRequestBody.instanceIds;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'TerminateInstances',
                'boto3': 'terminate_instances',
                'cli': 'terminate-instances'
            },
            'options': reqParams,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call\=com.amazonaws.ec2.AmazonEC2.DescribeLaunchTemplates\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeLaunchTemplates',
                'boto3': 'describe_launch_templates',
                'cli': 'describe-launch-templates'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call\=com.amazonaws.directoryservice.+.DescribeDirectories\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ds',
            'method': {
                'api': 'DescribeDirectories',
                'boto3': 'describe_directories',
                'cli': 'describe-directories'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call\=com.amazonaws.ec2.AmazonEC2.DescribePlacementGroups\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribePlacementGroups',
                'boto3': 'describe_placement_groups',
                'cli': 'describe-placement-groups'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getCurrentSpotPrice\?/g)) {
        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSpotPriceHistory',
                'boto3': 'describe_spot_price_history',
                'cli': 'describe-spot-price-history'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getTags\?/g)) {
        reqParams.boto3['Filter'] = [];
        reqParams.cli['--filter'] = [];

        if (jsonRequestBody['key']) {
            if (jsonRequestBody['key'].length > 0) {
                reqParams.boto3['Filter'].push({
                    'Name': 'key',
                    'Values': [jsonRequestBody['key']]
                });
                reqParams.cli['--filter'].push({
                    'Name': 'key',
                    'Values': [jsonRequestBody['key']]
                });
            }
        }
        if (jsonRequestBody['value']) {
            if (jsonRequestBody['value'].length > 0) {
                reqParams.boto3['Filter'].push({
                    'Name': 'value',
                    'Values': [jsonRequestBody['value']]
                });
                reqParams.cli['--filter'].push({
                    'Name': 'value',
                    'Values': [jsonRequestBody['value']]
                });
            }
        }
        if (reqParams.boto3['Filter'].length == 0) {
            delete reqParams.boto3['Filter'];
            delete reqParams.cli['--filter'];
        }

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeTags',
                'boto3': 'describe_tags',
                'cli': 'describe-tags'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getTerminationProtection\?/g)) {
        reqParams.boto3['InstanceId'] = jsonRequestBody.instanceId;
        reqParams.boto3['Attribute'] = "disableApiTermination";
        reqParams.cli['--instance-id'] = jsonRequestBody.instanceId;
        reqParams.cli['--attribute'] = "disableApiTermination";

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeInstanceAttribute',
                'boto3': 'describe_instance_attribute',
                'cli': 'describe-instance-attribute'
            },
            'options': reqParams
        });

        return {};
    }

    //--S3--//

    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "CreateBucket") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";
        reqParams.cfn['BucketName'] = jsonRequestBody.path;

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'CreateBucket',
                'boto3': 'create_bucket',
                'cli': 'create-bucket'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 's3',
            'type': 'AWS::S3::Bucket',
            'options': reqParams,
            'was_blocked': blocking
        });

        return {};
    }
        
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "PutBucketVersioning") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";
        reqParams = addToParamsFromXml(reqParams, jsonRequestBody.contentString);

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'PutBucketVersioning',
                'boto3': 'put_bucket_versioning',
                'cli': 'put-bucket-versioning'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "PutBucketMetrics") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";
        reqParams = addToParamsFromXml(reqParams, jsonRequestBody.contentString);

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'PutBucketMetricsConfiguration',
                'boto3': 'put_bucket_metrics_configuration',
                'cli': 'put-bucket-metrics-configuration'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "PutBucketTagging") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";
        reqParams = addToParamsFromXml(reqParams, jsonRequestBody.contentString);

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'PutBucketTagging',
                'boto3': 'put_bucket_tagging',
                'cli': 'put-bucket-tagging'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "PutBucketAcl") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";
        reqParams = addToParamsFromXml(reqParams, jsonRequestBody.contentString);

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'PutBucketAcl',
                'boto3': 'put_bucket_acl',
                'cli': 'put-bucket-acl'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "PutBucketLogging") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";
        reqParams = addToParamsFromXml(reqParams, jsonRequestBody.contentString);

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'PutBucketLogging',
                'boto3': 'put_bucket_logging',
                'cli': 'put-bucket-logging'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "DeleteBucket") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'DeleteBucket',
                'boto3': 'delete_bucket',
                'cli': 'delete-bucket'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "ListObjects") {
        reqParams.boto3['BucketName'] = jsonRequestBody.path;
        reqParams.boto3['Prefix'] = jsonRequestBody.params.prefix;
        reqParams.cli['_'] = [
            `s3://${jsonRequestBody.path}/${jsonRequestBody.params.prefix}`
        ]

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'ListObjects',
                'boto3': 'list_objects',
                'cli': 'ls'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketVersioning") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketVersioning',
                'boto3': 'get_bucket_versioning',
                'cli': 'get-bucket-versioning'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketLogging") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketLogging',
                'boto3': 'get_bucket_logging',
                'cli': 'get-bucket-logging'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketTagging") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketTagging',
                'boto3': 'get_bucket_tagging',
                'cli': 'get-bucket-tagging'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketNotification") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketNotificationConfiguration',
                'boto3': 'get_bucket_notification_configuration',
                'cli': 'get-bucket-notification-configuration'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketWebsite") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketWebsite',
                'boto3': 'get_bucket_website',
                'cli': 'get-bucket-website'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketRequestPayment") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketRequestPayment',
                'boto3': 'get_bucket_request_payment',
                'cli': 'get-bucket-request-payment'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketAccelerate") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketAccelerateConfiguration',
                'boto3': 'get_bucket_accelerate_configuration',
                'cli': 'get-bucket-accelerate-configuration'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketDefaultEncryption") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketEncryption',
                'boto3': 'get_bucket_encryption',
                'cli': 'get-bucket-encryption'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketReplication") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketReplication',
                'boto3': 'get_bucket_replication',
                'cli': 'get-bucket-replication'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketMetrics") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketMetricsConfiguration',
                'boto3': 'get_bucket_metrics_configuration',
                'cli': 'get-bucket-metrics-configuration'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketAnalytics") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketAnalyticsConfiguration',
                'boto3': 'get_bucket_analytics_configuration',
                'cli': 'get-bucket-analytics-configuration'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetLifecycleConfiguration") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketLifecycleConfiguration',
                'boto3': 'get_bucket_lifecycle_configuration',
                'cli': 'get-bucket-lifecycle-configuration'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketCORS") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketCORS',
                'boto3': 'get_bucket_cors',
                'cli': 'get-bucket-cors'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketPolicy") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketPolicy',
                'boto3': 'get_bucket_policy',
                'cli': 'get-bucket-policy'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "GetBucketAcl") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;
        reqParams.cli['_service'] = "s3api";

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'GetBucketAcl',
                'boto3': 'get_bucket_acl',
                'cli': 'get-bucket-acl'
            },
            'options': reqParams
        });

        return {};
    }
    
    if (details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy$/g) && jsonRequestBody.operation == "ListAllMyBuckets") {
        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'ListBuckets',
                'boto3': 'list_buckets',
                'cli': 'ls'
            },
            'options': reqParams
        });

        return {};
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/s3\/cloudtrail-proxy$/g) && jsonRequestBody.operation == "DescribeTrails") {
        reqParams.boto3['includeShadowTrails'] = jsonRequestBody.content.includeShadowTrails;
        reqParams.boto3['trailNameList'] = jsonRequestBody.content.trailNameList;
        if (jsonRequestBody.content.includeShadowTrails === true)
            reqParams.cli['--include-shadow-trails'] = null;
        else if (jsonRequestBody.content.includeShadowTrails === true)
            reqParams.cli['--no-include-shadow-trails'] = null;
        reqParams.cli['--trail-name-list'] = jsonRequestBody.content.trailNameList;
        

        outputs.push({
            'region': region,
            'service': 'cloudtrail',
            'method': {
                'api': 'DescribeTrails',
                'boto3': 'describe_trails',
                'cli': 'describe-trails'
            },
            'options': reqParams
        });

        return {};
    }
    


    /* Start Auto */

    // autogen:cloud9.DescribeEnvironmentMemberships
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloud9\/api\/cloud9$/g) && jsonRequestBody.operation == "describeEnvironmentMemberships" && jsonRequestBody.method == "POST") {
        reqParams.boto3['Permissions'] = jsonRequestBody.contentString.permissions;
        reqParams.cli['--permissions'] = jsonRequestBody.contentString.permissions;
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.contentString.maxResults;

        outputs.push({
            'region': region,
            'service': 'cloud9',
            'method': {
                'api': 'DescribeEnvironmentMemberships',
                'boto3': 'describe_environment_memberships',
                'cli': 'describe-environment-memberships'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloud9.DescribeEnvironments
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloud9\/api\/cloud9$/g) && jsonRequestBody.operation == "describeEnvironments" && jsonRequestBody.method == "POST") {
        reqParams.boto3['EnvironmentIds'] = jsonRequestBody.contentString.environmentIds;
        reqParams.cli['--environment-ids'] = jsonRequestBody.contentString.environmentIds;

        outputs.push({
            'region': region,
            'service': 'cloud9',
            'method': {
                'api': 'DescribeEnvironments',
                'boto3': 'describe_environments',
                'cli': 'describe-environments'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloud9.ListEnvironments
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloud9\/api\/cloud9$/g) && jsonRequestBody.operation == "listEnvironments" && jsonRequestBody.method == "POST") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.contentString.maxResults;

        outputs.push({
            'region': region,
            'service': 'cloud9',
            'method': {
                'api': 'ListEnvironments',
                'boto3': 'list_environments',
                'cli': 'list-environments'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloud9.UpdateEnvironment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloud9\/api\/cloud9$/g) && jsonRequestBody.operation == "describeEC2Remote" && jsonRequestBody.method == "POST" && jsonRequestBody.operation == "updateEnvironment" && jsonRequestBody.method == "POST") {
        reqParams.boto3['EnvironmentId'] = jsonRequestBody.contentString.environmentId;
        reqParams.cli['--environment-id'] = jsonRequestBody.contentString.environmentId;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.description;

        outputs.push({
            'region': region,
            'service': 'cloud9',
            'method': {
                'api': 'UpdateEnvironment',
                'boto3': 'update_environment',
                'cli': 'update-environment'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloud9\/api\/ec2$/g) && jsonRequestBody.operation == "describeVpcs" && jsonRequestBody.method == "POST") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloud9\/api\/ec2$/g) && jsonRequestBody.operation == "describeSubnets" && jsonRequestBody.method == "POST") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloud9.CreateEnvironmentEC2
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloud9\/api\/cloud9$/g) && jsonRequestBody.operation == "createEnvironmentEC2" && jsonRequestBody.method == "POST") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.description;
        reqParams.boto3['InstanceType'] = jsonRequestBody.contentString.instanceType;
        reqParams.cli['--instance-type'] = jsonRequestBody.contentString.instanceType;
        reqParams.boto3['AutomaticStopTimeMinutes'] = jsonRequestBody.contentString.automaticStopTimeMinutes;
        reqParams.cli['--automatic-stop-time-minutes'] = jsonRequestBody.contentString.automaticStopTimeMinutes;
        reqParams.boto3['SubnetId'] = jsonRequestBody.contentString.subnetId;
        reqParams.cli['--subnet-id'] = jsonRequestBody.contentString.subnetId;
        reqParams.boto3['ClientRequestToken'] = jsonRequestBody.contentString.clientRequestToken;
        reqParams.cli['--client-request-token'] = jsonRequestBody.contentString.clientRequestToken;

        outputs.push({
            'region': region,
            'service': 'cloud9',
            'method': {
                'api': 'CreateEnvironmentEC2',
                'boto3': 'create_environment_ec2',
                'cli': 'create-environment-ec2'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloud9.DeleteEnvironment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloud9\/api\/cloud9$/g) && jsonRequestBody.operation == "deleteEnvironment" && jsonRequestBody.method == "POST") {
        reqParams.boto3['EnvironmentId'] = jsonRequestBody.contentString.environmentId;
        reqParams.cli['--environment-id'] = jsonRequestBody.contentString.environmentId;

        outputs.push({
            'region': region,
            'service': 'cloud9',
            'method': {
                'api': 'DeleteEnvironment',
                'boto3': 'delete_environment',
                'cli': 'delete-environment'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:medialive.ListInputSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/medialive\/api\/inputSecurityGroups$/g) && jsonRequestBody.method == "GET") {

        outputs.push({
            'region': region,
            'service': 'medialive',
            'method': {
                'api': 'ListInputSecurityGroups',
                'boto3': 'list_input_security_groups',
                'cli': 'list-input-security-groups'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:medialive.ListChannels
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/medialive\/api\/channels$/g) && jsonRequestBody.method == "GET") {

        outputs.push({
            'region': region,
            'service': 'medialive',
            'method': {
                'api': 'ListChannels',
                'boto3': 'list_channels',
                'cli': 'list-channels'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:medialive.CreateInputSecurityGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/medialive\/api\/inputSecurityGroups$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.method == "POST") {
        reqParams.boto3['WhitelistRules'] = jsonRequestBody.contentString.whitelistRules;
        reqParams.cli['--whitelist-rules'] = jsonRequestBody.contentString.whitelistRules;

        outputs.push({
            'region': region,
            'service': 'medialive',
            'method': {
                'api': 'CreateInputSecurityGroup',
                'boto3': 'create_input_security_group',
                'cli': 'create-input-security-group'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ssm.GetParametersByPath
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/medialive\/api\/ssm$/g) && jsonRequestBody.operation == "getParametersByPath" && jsonRequestBody.method == "POST") {
        reqParams.boto3['Path'] = jsonRequestBody.contentString.Path;
        reqParams.cli['--path'] = jsonRequestBody.contentString.Path;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'GetParametersByPath',
                'boto3': 'get_parameters_by_path',
                'cli': 'get-parameters-by-path'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam.ListRoles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/medialive\/api\/iam$/g) && jsonRequestBody.operation == "listRoles") {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListRoles',
                'boto3': 'list_roles',
                'cli': 'list-roles'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam.GetRolePolicy
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/medialive\/api\/iam$/g) && jsonRequestBody.operation == "getRolePolicy") {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'GetRolePolicy',
                'boto3': 'get_role_policy',
                'cli': 'get-role-policy'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:medialive.CreateChannel
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/medialive\/api\/channels$/g) && jsonRequestBody.operation == "createChannels" && jsonRequestBody.method == "POST") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['InputAttachments'] = jsonRequestBody.contentString.inputAttachments;
        reqParams.cli['--input-attachments'] = jsonRequestBody.contentString.inputAttachments;
        reqParams.boto3['InputSpecification'] = jsonRequestBody.contentString.inputSpecification;
        reqParams.cli['--input-specification'] = jsonRequestBody.contentString.inputSpecification;
        reqParams.boto3['Destinations'] = jsonRequestBody.contentString.destinations;
        reqParams.cli['--destinations'] = jsonRequestBody.contentString.destinations;
        reqParams.boto3['EncoderSettings'] = jsonRequestBody.contentString.encoderSettings;
        reqParams.cli['--encoder-settings'] = jsonRequestBody.contentString.encoderSettings;
        reqParams.boto3['RequestId'] = jsonRequestBody.contentString.requestId;
        reqParams.cli['--request-id'] = jsonRequestBody.contentString.requestId;
        reqParams.boto3['LogLevel'] = jsonRequestBody.contentString.logLevel;
        reqParams.cli['--log-level'] = jsonRequestBody.contentString.logLevel;
        reqParams.boto3['RoleArn'] = jsonRequestBody.contentString.roleArn;
        reqParams.cli['--role-arn'] = jsonRequestBody.contentString.roleArn;

        outputs.push({
            'region': region,
            'service': 'medialive',
            'method': {
                'api': 'CreateChannel',
                'boto3': 'create_channel',
                'cli': 'create-channel'
            },
            'options': reqParams
        });
        
        return {};
    }

}
