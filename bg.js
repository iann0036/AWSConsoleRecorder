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
        return undefined; // TODO
        return "";
    }
    if (typeof param == "object") {
        return undefined; // TODO
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

    console.dir(options);
    if (Object.keys(options).length) {
        for (option in options) {
            if (options[option] !== undefined) {
                var optionvalue = processGoParameter(option, options[option], 4);
                params += `
        ${option}: ${optionvalue},`;
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
            if (options[option] !== undefined) {
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
        compiled['go'] += outputMapGo(outputs[i].service, outputs[i].method.api, outputs[i].options.boto3, outputs[i].region, outputs[i].was_blocked);
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

function getUrlValue(url, key) {
    var url = new URL(url);
    return url.searchParams.get(key);
}

function getPipeSplitField(str, index) {
    var pipesplit = str.split("|");

    return pipesplit[index];
}

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
    
    // manual:ec2:ec2.DescribeInstances
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

    // manual:ec2:ec2.DescribeImages
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

    // manual:ec2:ec2.DescribeImages
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

    // manual:ec2:ec2.DescribeVpcs
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

    // manual:ec2:ec2.DescribeSubnets
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

    // manual:ec2:ec2.DescribeHosts
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

    // manual:ec2:iam.ListInstanceProfiles
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

    // manual:ec2:ec2.DescribeNetworkInterfaces
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

    // manual:ec2:ec2.DescribeAvailabilityZones
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

    // manual:ec2:ec2.DescribeSecurityGroups
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

    // manual:ec2:ec2.DescribeKeyPairs
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

    // manual:ec2:ec2.CreateSecurityGroup
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

    // manual:ec2:ec2.AuthorizeSecurityGroupIngress
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=authorizeIngress\?/g)) {
        if ('groupId' in jsonRequestBody) {
            reqParams.boto3['GroupId'] = jsonRequestBody.groupId;
            reqParams.cli['--group-id'] = jsonRequestBody.groupId;
        }
        reqParams.boto3['IpPermissions'] = [];
        reqParams.cli['--ip-permissions'] = [];
        if (jsonRequestBody['ipPermissions']) {
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
        }

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

    // manual:ec2:ec2.RunInstances
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
        reqParams.cfn['KeyName'] = jsonRequestBody.KeyName;
        reqParams.cfn['SecurityGroupIds'] = jsonRequestBody.SecurityGroupIds;
        reqParams.cfn['InstanceType'] = jsonRequestBody.InstanceType;
        if (jsonRequestBody.Placement && jsonRequestBody.Placement.Tenancy) {
            reqParams.cfn['Tenancy'] = jsonRequestBody.Placement.Tenancy;
        }
        reqParams.cfn['Monitoring'] = jsonRequestBody.Monitoring.Enabled;
        reqParams.cfn['DisableApiTermination'] = jsonRequestBody.DisableApiTermination;
        reqParams.cfn['InstanceInitiatedShutdownBehavior'] = jsonRequestBody.InstanceInitiatedShutdownBehavior;
        if (jsonRequestBody.CreditSpecification) {
            reqParams.cfn['CreditSpecification'] = {
                'CPUCredits': jsonRequestBody.CreditSpecification.CpuCredits
            }
        }
        reqParams.cfn['Tags'] = jsonRequestBody.TagSpecifications;
        reqParams.cfn['EbsOptimized'] = jsonRequestBody.EbsOptimized;
        reqParams.cfn['BlockDeviceMappings'] = jsonRequestBody.BlockDeviceMappings;

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

    // manual:ec2:ec2.TerminateInstances
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

    // manual:ec2:ec2.DescribeLaunchTemplates
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

    // manual:ec2:ds.DescribeDirectories
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

    // manual:ec2:ec2.DescribePlacementGroups
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

    // manual:ec2:ec2.DescribeSpotPriceHistory
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

    // manual:ec2:ec2.DescribeTags
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

    // manual:ec2:ec2.DescribeInstanceAttribute
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

    // manual:s3:s3.CreateBucket
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
    
    // manual:s3:s3.PutBucketVersioning
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
    
    // manual:s3:s3.PutBucketMetricsConfiguration
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
    
    // manual:s3:s3.PutBucketTagging
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
    
    // manual:s3:s3.PutBucketAcl
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
    
    // manual:s3:s3.PutBucketLogging
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
    
    // manual:s3:s3.DeleteBucket
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
    
    // manual:s3:s3.ListObjects
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
    
    // manual:s3:s3.GetBucketVersioning
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
    
    // manual:s3:s3.GetBucketLogging
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
    
    // manual:s3:s3.GetBucketTagging
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
    
    // manual:s3:s3.GetBucketNotificationConfiguration
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
    
    // manual:s3:s3.GetBucketWebsite
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
    
    // manual:s3:s3.GetBucketRequestPayment
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
    
    // manual:s3:s3.GetBucketAccelerateConfiguration
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
    
    // manual:s3:s3.GetBucketEncryption
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
    
    // manual:s3:s3.GetBucketReplication
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
    
    // manual:s3:s3.GetBucketMetricsConfiguration
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
    
    // manual:s3:s3.GetBucketAnalyticsConfiguration
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
    
    // manual:s3:s3.GetBucketLifecycleConfiguration
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

    // manual:s3:s3.GetBucketCORS
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
    
    // manual:s3:s3.GetBucketPolicy
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
    
    // manual:s3:s3.GetBucketAcl
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
    
    // manual:s3:s3.ListBuckets
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

    // manual:s3:cloudtrail.DescribeTrails
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

    // autogen:cloud9:cloud9.DescribeEnvironmentMemberships
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

    // autogen:cloud9:cloud9.DescribeEnvironments
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

    // autogen:cloud9:cloud9.ListEnvironments
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

    // autogen:cloud9:cloud9.UpdateEnvironment
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

    // autogen:cloud9:ec2.DescribeVpcs
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

    // autogen:cloud9:ec2.DescribeSubnets
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

    // autogen:cloud9:cloud9.CreateEnvironmentEC2
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

    // autogen:cloud9:cloud9.DeleteEnvironment
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

    // autogen:medialive:medialive.ListInputSecurityGroups
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

    // autogen:medialive:medialive.ListChannels
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

    // autogen:medialive:medialive.CreateInputSecurityGroup
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

    // autogen:medialive:ssm.GetParametersByPath
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

    // autogen:medialive:iam.ListRoles
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

    // autogen:medialive:iam.GetRolePolicy
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

    // autogen:medialive:medialive.CreateChannel
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

    // autogen:efs:efs.DescribeFileSystems
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=describeFileSystems$/g)) {

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'DescribeFileSystems',
                'boto3': 'describe_file_systems',
                'cli': 'describe-file-systems'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:efs:kms.ListKeys
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=listKeys$/g)) {

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'ListKeys',
                'boto3': 'list_keys',
                'cli': 'list-keys'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:efs:kms.DescribeKey
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=describeKey$/g)) {
        reqParams.boto3['KeyId'] = jsonRequestBody.kmsKeyId;
        reqParams.cli['--key-id'] = jsonRequestBody.kmsKeyId;

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'DescribeKey',
                'boto3': 'describe_key',
                'cli': 'describe-key'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:efs:efs.CreateFileSystem
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=createFileSystem$/g)) {
        reqParams.boto3['PerformanceMode'] = jsonRequestBody.performanceMode;
        reqParams.cli['--performance-mode'] = jsonRequestBody.performanceMode;
        reqParams.boto3['Encrypted'] = jsonRequestBody.encrypted;
        reqParams.cli['--encrypted'] = jsonRequestBody.encrypted;
        reqParams.boto3['KmsKeyId'] = jsonRequestBody.kmsKeyId;
        reqParams.cli['--kms-key-id'] = jsonRequestBody.kmsKeyId;
        reqParams.boto3['ThroughputMode'] = jsonRequestBody.throughputMode;
        reqParams.cli['--throughput-mode'] = jsonRequestBody.throughputMode;
        reqParams.boto3['ProvisionedThroughputInMibps'] = jsonRequestBody.provisionedThroughputInMibps;
        reqParams.cli['--provisioned-throughput-in-mibps'] = jsonRequestBody.provisionedThroughputInMibps;

        reqParams.cfn['PerformanceMode'] = jsonRequestBody.performanceMode;
        reqParams.cfn['Encrypted'] = jsonRequestBody.encrypted;
        reqParams.cfn['KmsKeyId'] = jsonRequestBody.kmsKeyId;
        reqParams.cfn['ThroughputMode'] = jsonRequestBody.throughputMode;
        reqParams.cfn['ProvisionedThroughputInMibps'] = jsonRequestBody.provisionedThroughputInMibps;

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'CreateFileSystem',
                'boto3': 'create_file_system',
                'cli': 'create-file-system'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'efs',
            'type': 'AWS::EFS::FileSystem',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:efs:efs.CreateMountTarget
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=createMountTarget$/g)) {
        reqParams.boto3['FileSystemId'] = jsonRequestBody.fileSystemId;
        reqParams.cli['--file-system-id'] = jsonRequestBody.fileSystemId;
        reqParams.boto3['SubnetId'] = jsonRequestBody.mountTargetConfig.subnetId;
        reqParams.cli['--subnet-id'] = jsonRequestBody.mountTargetConfig.subnetId;
        reqParams.boto3['SecurityGroups'] = jsonRequestBody.mountTargetConfig.securityGroups;
        reqParams.cli['--security-groups'] = jsonRequestBody.mountTargetConfig.securityGroups;

        reqParams.cfn['FileSystemId'] = jsonRequestBody.fileSystemId;
        reqParams.cfn['SubnetId'] = jsonRequestBody.mountTargetConfig.subnetId;
        reqParams.cfn['SecurityGroups'] = jsonRequestBody.mountTargetConfig.securityGroups;

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'CreateMountTarget',
                'boto3': 'create_mount_target',
                'cli': 'create-mount-target'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'efs',
            'type': 'AWS::EFS::MountTarget',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:efs:efs.DescribeMountTargets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=describeMountTargets$/g)) {
        reqParams.boto3['FileSystemId'] = jsonRequestBody.fileSystemId;
        reqParams.cli['--file-system-id'] = jsonRequestBody.fileSystemId;

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'DescribeMountTargets',
                'boto3': 'describe_mount_targets',
                'cli': 'describe-mount-targets'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:efs:efs.DescribeTags
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=describeTags$/g)) {
        reqParams.boto3['FileSystemId'] = jsonRequestBody.fileSystemId;
        reqParams.cli['--file-system-id'] = jsonRequestBody.fileSystemId;

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'DescribeTags',
                'boto3': 'describe_tags',
                'cli': 'describe-tags'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:efs:efs.UpdateFileSystem
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=modifyThroughputMode$/g)) {
        reqParams.boto3['FileSystemId'] = jsonRequestBody.fileSystemId;
        reqParams.cli['--file-system-id'] = jsonRequestBody.fileSystemId;
        reqParams.boto3['ThroughputMode'] = jsonRequestBody.throughputMode;
        reqParams.cli['--throughput-mode'] = jsonRequestBody.throughputMode;
        reqParams.boto3['ProvisionedThroughputInMibps'] = jsonRequestBody.provisionedThroughputInMibps;
        reqParams.cli['--provisioned-throughput-in-mibps'] = jsonRequestBody.provisionedThroughputInMibps;

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'UpdateFileSystem',
                'boto3': 'update_file_system',
                'cli': 'update-file-system'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:efs:efs.DeleteMountTarget
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=deleteMountTarget$/g)) {
        reqParams.boto3['MountTargetId'] = jsonRequestBody.mountTargetId;
        reqParams.cli['--mount-target-id'] = jsonRequestBody.mountTargetId;

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'DeleteMountTarget',
                'boto3': 'delete_mount_target',
                'cli': 'delete-mount-target'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:efs:efs.DeleteFileSystem
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?region=.+&type=deleteFileSystem$/g)) {
        reqParams.boto3['FileSystemId'] = jsonRequestBody.fileSystemId;
        reqParams.cli['--file-system-id'] = jsonRequestBody.fileSystemId;

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'DeleteFileSystem',
                'boto3': 'delete_file_system',
                'cli': 'delete-file-system'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloudtrail:cloudtrail.GetEventSelectors
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cloudtrail\/service\/getEventSelectors\?/g)) {
        reqParams.boto3['TrailName'] = getUrlValue(details.url, 'trailArn');
        reqParams.cli['--trail-name'] = getUrlValue(details.url, 'trailArn');

        outputs.push({
            'region': region,
            'service': 'cloudtrail',
            'method': {
                'api': 'GetEventSelectors',
                'boto3': 'get_event_selectors',
                'cli': 'get-event-selectors'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloudtrail:cloudtrail.DescribeTrails
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cloudtrail\/service\/resources\/trails\?/g)) {
        reqParams.boto3['IncludeShadowTrails'] = getUrlValue(details.url, 'includeShadowTrails');
        reqParams.cli['--include-shadow-trails'] = getUrlValue(details.url, 'includeShadowTrails');

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

    // autogen:cloudtrail:cloudtrail.LookupEvents
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cloudtrail\/service\/lookupEvents\?/g)) {
        reqParams.boto3['EndTime'] = getUrlValue(details.url, 'endTime');
        reqParams.cli['--end-time'] = getUrlValue(details.url, 'endTime');
        reqParams.boto3['StartTime'] = getUrlValue(details.url, 'startTime');
        reqParams.cli['--start-time'] = getUrlValue(details.url, 'startTime');

        outputs.push({
            'region': region,
            'service': 'cloudtrail',
            'method': {
                'api': 'LookupEvents',
                'boto3': 'lookup_events',
                'cli': 'lookup-events'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloudtrail:sns.ListTopics
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cloudtrail\/service\/getSnsTopicNameToArnMapByRegion\?/g)) {

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'ListTopics',
                'boto3': 'list_topics',
                'cli': 'list-topics'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloudtrail:lambda.ListFunctions
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cloudtrail\/service\/listLambdaFunctions\?/g)) {

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'ListFunctions',
                'boto3': 'list_functions',
                'cli': 'list-functions'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloudtrail:cloudtrail.CreateTrail
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudtrail\/service\/subscribe\?/g)) {
        reqParams.boto3['Name'] = getUrlValue(details.url, 'configName');
        reqParams.cli['--name'] = getUrlValue(details.url, 'configName');
        reqParams.boto3['IncludeGlobalServiceEvents'] = getUrlValue(details.url, 'isIncludeGlobalServiceEvents');
        reqParams.cli['--include-global-service-events'] = getUrlValue(details.url, 'isIncludeGlobalServiceEvents');
        reqParams.boto3['IsMultiRegionTrail'] = getUrlValue(details.url, 'isMultiRegionTrail');
        reqParams.cli['--is-multi-region-trail'] = getUrlValue(details.url, 'isMultiRegionTrail');
        reqParams.boto3['KmsKeyId'] = getUrlValue(details.url, 'kmsKeyId');
        reqParams.cli['--kms-key-id'] = getUrlValue(details.url, 'kmsKeyId');
        reqParams.boto3['EnableLogFileValidation'] = getUrlValue(details.url, 'logFileValidation');
        reqParams.cli['--enable-log-file-validation'] = getUrlValue(details.url, 'logFileValidation');
        reqParams.boto3['S3BucketName'] = getUrlValue(details.url, 's3BucketName');
        reqParams.cli['--s3-bucket-name'] = getUrlValue(details.url, 's3BucketName');
        reqParams.boto3['S3KeyPrefix'] = getUrlValue(details.url, 's3KeyPrefix');
        reqParams.cli['--s3-key-prefix'] = getUrlValue(details.url, 's3KeyPrefix');
        reqParams.boto3['SnsTopicName'] = getUrlValue(details.url, 'snsTopicArn');
        reqParams.cli['--sns-topic-name'] = getUrlValue(details.url, 'snsTopicArn');

        reqParams.cfn['TrailName'] = getUrlValue(details.url, 'configName');
        reqParams.cfn['IncludeGlobalServiceEvents'] = getUrlValue(details.url, 'isIncludeGlobalServiceEvents');
        reqParams.cfn['IsMultiRegionTrail'] = getUrlValue(details.url, 'isMultiRegionTrail');
        reqParams.cfn['KMSKeyId'] = getUrlValue(details.url, 'kmsKeyId');
        reqParams.cfn['EnableLogFileValidation'] = getUrlValue(details.url, 'logFileValidation');
        reqParams.cfn['S3BucketName'] = getUrlValue(details.url, 's3BucketName');
        reqParams.cfn['S3KeyPrefix'] = getUrlValue(details.url, 's3KeyPrefix');
        reqParams.cfn['SnsTopicName'] = getUrlValue(details.url, 'snsTopicArn');

        outputs.push({
            'region': region,
            'service': 'cloudtrail',
            'method': {
                'api': 'CreateTrail',
                'boto3': 'create_trail',
                'cli': 'create-trail'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'cloudtrail',
            'type': 'AWS::CloudTrail::Trail',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:cloudtrail:cloudtrail.GetTrailStatus
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cloudtrail\/service\/resources\/status\?/g)) {
        reqParams.boto3['Name'] = getUrlValue(details.url, 'trailArn');
        reqParams.cli['--name'] = getUrlValue(details.url, 'trailArn');

        outputs.push({
            'region': region,
            'service': 'cloudtrail',
            'method': {
                'api': 'GetTrailStatus',
                'boto3': 'get_trail_status',
                'cli': 'get-trail-status'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:cloudtrail:cloudtrail.ListTags
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cloudtrail\/service\/listTags\?/g)) {
        reqParams.boto3['ResourceIdList'] = [getUrlValue(details.url, 'trailArn')];
        reqParams.cli['--resource-id-list'] = [getUrlValue(details.url, 'trailArn')];

        outputs.push({
            'region': region,
            'service': 'cloudtrail',
            'method': {
                'api': 'ListTags',
                'boto3': 'list_tags',
                'cli': 'list-tags'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:config:config.DescribePendingAggregationRequests
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/aggregationAuthorization\/describePendingAggregationRequests\?/g)) {

        outputs.push({
            'region': region,
            'service': 'config',
            'method': {
                'api': 'DescribePendingAggregationRequests',
                'boto3': 'describe_pending_aggregation_requests',
                'cli': 'describe-pending-aggregation-requests'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:config:config.DescribeConfigurationRecorders
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/listConfigurationRecorders\?/g)) {

        outputs.push({
            'region': region,
            'service': 'config',
            'method': {
                'api': 'DescribeConfigurationRecorders',
                'boto3': 'describe_configuration_recorders',
                'cli': 'describe-configuration-recorders'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:config:config.DescribeDeliveryChannels
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/listDeliveryChannels\?/g)) {

        outputs.push({
            'region': region,
            'service': 'config',
            'method': {
                'api': 'DescribeDeliveryChannels',
                'boto3': 'describe_delivery_channels',
                'cli': 'describe-delivery-channels'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:config:iam.ListRoles
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/iam\/listRoles\?/g)) {

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

    // autogen:config:s3.ListBuckets
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/listS3Buckets\?/g)) {

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'ListBuckets',
                'boto3': 'list_buckets',
                'cli': 'list-buckets'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:config:sns.ListTopics
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/listSnsTopics\?/g)) {

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'ListTopics',
                'boto3': 'list_topics',
                'cli': 'list-topics'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:config:iam.CreateServiceLinkedRole
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/createServiceLinkedRole\?/g)) {
        reqParams.boto3['AWSServiceName'] = 'elasticbeanstalk.amazonaws.com';
        reqParams.cli['--aws-service-name'] = 'elasticbeanstalk.amazonaws.com';

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'CreateServiceLinkedRole',
                'boto3': 'create_service_linked_role',
                'cli': 'create-service-linked-role'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:config:s3.CreateBucket
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/createS3BucketForConfiguration\?/g)) {
        reqParams.boto3['Bucket'] = jsonRequestBody.s3BucketName;
        reqParams.cli['--bucket'] = jsonRequestBody.s3BucketName;

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
        
        return {};
    }

    // autogen:guardduty:guardduty.ListDetectors
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "ListDetectors" && jsonRequestBody.method == "GET") {

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'ListDetectors',
                'boto3': 'list_detectors',
                'cli': 'list-detectors'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.GetInvitationsCount
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "GetInvitationsCount" && jsonRequestBody.method == "GET") {

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'GetInvitationsCount',
                'boto3': 'get_invitations_count',
                'cli': 'get-invitations-count'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.CreateDetector
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "CreateDetector" && jsonRequestBody.method == "POST") {
        reqParams.boto3['Enable'] = jsonRequestBody.contentString.enable;
        reqParams.cli['--enable'] = jsonRequestBody.contentString.enable;

        reqParams.cfn['Enable'] = jsonRequestBody.contentString.enable;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'CreateDetector',
                'boto3': 'create_detector',
                'cli': 'create-detector'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'guardduty',
            'type': 'AWS::GuardDuty::Detector',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.ListFindings
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "ListFindings" && jsonRequestBody.method == "POST") {
        reqParams.boto3['FindingCriteria'] = jsonRequestBody.contentString.findingCriteria;
        reqParams.cli['--finding-criteria'] = jsonRequestBody.contentString.findingCriteria;
        reqParams.boto3['SortCriteria'] = jsonRequestBody.contentString.sortCriteria;
        reqParams.cli['--sort-criteria'] = jsonRequestBody.contentString.sortCriteria;
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.maxResults;
        reqParams.boto3['NextToken'] = jsonRequestBody.contentString.nextToken;
        reqParams.cli['--next-token'] = jsonRequestBody.contentString.nextToken;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'ListFindings',
                'boto3': 'list_findings',
                'cli': 'list-findings'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.GetMasterAccount
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "GetMasterAccount" && jsonRequestBody.method == "GET") {

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'GetMasterAccount',
                'boto3': 'get_master_account',
                'cli': 'get-master-account'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.ListMembers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "ListMembers" && jsonRequestBody.method == "GET") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.params.maxResults;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'ListMembers',
                'boto3': 'list_members',
                'cli': 'list-members'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.GetDetector
    // modified for path split
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "GetDetector" && jsonRequestBody.method == "GET") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'GetDetector',
                'boto3': 'get_detector',
                'cli': 'get-detector'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.GetFindingsStatistics
    // modified for path split
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "GetFindingsStatistics" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['FindingCriteria'] = jsonRequestBody.contentString.findingCriteria;
        reqParams.cli['--finding-criteria'] = jsonRequestBody.contentString.findingCriteria;
        reqParams.boto3['FindingStatisticTypes'] = jsonRequestBody.contentString.findingStatisticTypes;
        reqParams.cli['--finding-statistic-types'] = jsonRequestBody.contentString.findingStatisticTypes;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'GetFindingsStatistics',
                'boto3': 'get_findings_statistics',
                'cli': 'get-findings-statistics'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.ListFilters
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "ListFilters" && jsonRequestBody.method == "GET") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.params.maxResults;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'ListFilters',
                'boto3': 'list_filters',
                'cli': 'list-filters'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.CreateMembers
    // modified for path split
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "CreateMembers" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['AccountDetails'] = jsonRequestBody.contentString.accountDetails;
        reqParams.cli['--account-details'] = jsonRequestBody.contentString.accountDetails;

        reqParams.cfn['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cfn['MemberId'] = jsonRequestBody.contentString.accountDetails.AccountId;
        reqParams.cfn['Email'] = jsonRequestBody.contentString.accountDetails.Email;
        
        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'CreateMembers',
                'boto3': 'create_members',
                'cli': 'create-members'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'guardduty',
            'type': 'AWS::GuardDuty::Member',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.DeleteMembers
    // modified for path split
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "DeleteMembers" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['AccountIds'] = jsonRequestBody.contentString.accountIds;
        reqParams.cli['--account-ids'] = jsonRequestBody.contentString.accountIds;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'DeleteMembers',
                'boto3': 'delete_members',
                'cli': 'delete-members'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.ListIPSets
    // modified for path split
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "ListIPSets" && jsonRequestBody.method == "GET") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.params.maxResults;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'ListIPSets',
                'boto3': 'list_ip_sets',
                'cli': 'list-ip-sets'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.ListThreatIntelSets
    // modified for path split
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "ListThreatIntelSets" && jsonRequestBody.method == "GET") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.params.maxResults;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'ListThreatIntelSets',
                'boto3': 'list_threat_intel_sets',
                'cli': 'list-threat-intel-sets'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:iam.ListPolicyVersions
    // modified for policyarn split
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/iam$/g) && jsonRequestBody.operation == "ListPolicyVersions" && jsonRequestBody.method == "POST") {
        reqParams.boto3['PolicyArn'] = jsonRequestBody.contentString.match(/PolicyArn\=(.+)\&Version/g)[1];
        reqParams.cli['--policy-arn'] = jsonRequestBody.contentString.match(/PolicyArn\=(.+)\&Version/g)[1]; // "Action=ListPolicyVersions&PolicyArn=arn:aws:iam::aws:policy/aws-service-role/AmazonGuardDutyServiceRolePolicy&Version=2010-05-08"

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListPolicyVersions',
                'boto3': 'list_policy_versions',
                'cli': 'list-policy-versions'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.CreateIPSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "CreateIPSet" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path;
        reqParams.cli['--detector-id'] = jsonRequestBody.path;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['Location'] = jsonRequestBody.contentString.location;
        reqParams.cli['--location'] = jsonRequestBody.contentString.location;
        reqParams.boto3['Format'] = jsonRequestBody.contentString.format;
        reqParams.cli['--format'] = jsonRequestBody.contentString.format;
        reqParams.boto3['Activate'] = jsonRequestBody.contentString.activate;
        reqParams.cli['--activate'] = jsonRequestBody.contentString.activate;

        reqParams.cfn['DetectorId'] = jsonRequestBody.path;
        reqParams.cfn['Name'] = jsonRequestBody.contentString.name;
        reqParams.cfn['Location'] = jsonRequestBody.contentString.location;
        reqParams.cfn['Format'] = jsonRequestBody.contentString.format;
        reqParams.cfn['Activate'] = jsonRequestBody.contentString.activate;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'CreateIPSet',
                'boto3': 'create_ip_set',
                'cli': 'create-ip-set'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'guardduty',
            'type': 'AWS::GuardDuty::IPSet',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.ListIPSets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "ListIPSets" && jsonRequestBody.method == "GET") {
        reqParams.boto3['DetectorId'] =jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.params.maxResults;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'ListIPSets',
                'boto3': 'list_ip_sets',
                'cli': 'list-ip-sets'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.GetIPSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "GetIPSet" && jsonRequestBody.method == "GET") {
        reqParams.boto3['IpSetId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--ip-set-id'] = jsonRequestBody.path.split("/")[4];
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'GetIPSet',
                'boto3': 'get_ip_set',
                'cli': 'get-ip-set'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.UpdateIPSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "UpdateIPSet" && jsonRequestBody.method == "POST") {
        reqParams.boto3['IpSetId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--ip-set-id'] = jsonRequestBody.path.split("/")[4];
        reqParams.boto3['DetectorId'] =jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['Activate'] = jsonRequestBody.contentString.activate;
        reqParams.cli['--activate'] = jsonRequestBody.contentString.activate;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'UpdateIPSet',
                'boto3': 'update_ip_set',
                'cli': 'update-ip-set'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.ArchiveFindings
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "ArchiveFindings" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['FindingIds'] = jsonRequestBody.contentString.findingIds;
        reqParams.cli['--finding-ids'] = jsonRequestBody.contentString.findingIds;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'ArchiveFindings',
                'boto3': 'archive_findings',
                'cli': 'archive-findings'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.UnarchiveFindings
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "UnarchiveFindings" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['FindingIds'] = jsonRequestBody.contentString.findingIds;
        reqParams.cli['--finding-ids'] = jsonRequestBody.contentString.findingIds;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'UnarchiveFindings',
                'boto3': 'unarchive_findings',
                'cli': 'unarchive-findings'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.GetFindings
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "GetFindings" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['FindingIds'] = jsonRequestBody.contentString.findingIds;
        reqParams.cli['--finding-ids'] = jsonRequestBody.contentString.findingIds;
        reqParams.boto3['SortCriteria'] = jsonRequestBody.contentString.sortCriteria;
        reqParams.cli['--sort-criteria'] = jsonRequestBody.contentString.sortCriteria;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'GetFindings',
                'boto3': 'get_findings',
                'cli': 'get-findings'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:iam.ListAttachedRolePolicies
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/iam$/g) && jsonRequestBody.operation == "ListAttachedRolePolicies" && jsonRequestBody.method == "POST") {
        reqParams.boto3['RoleName'] = jsonRequestBody.contentString.match(/RoleName\=(.+)\&Version/g)[1];;
        reqParams.cli['--role-name'] = jsonRequestBody.contentString.match(/RoleName\=(.+)\&Version/g)[1];;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListAttachedRolePolicies',
                'boto3': 'list_attached_role_policies',
                'cli': 'list-attached-role-policies'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.CreateSampleFindings
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "CreateSampleFindings" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'CreateSampleFindings',
                'boto3': 'create_sample_findings',
                'cli': 'create-sample-findings'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.UpdateDetector
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/guardduty\/api\/guardduty$/g) && jsonRequestBody.operation == "UpdateDetector" && jsonRequestBody.method == "POST") {
        reqParams.boto3['DetectorId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--detector-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['Enable'] = jsonRequestBody.contentString.enable;
        reqParams.cli['--enable'] = jsonRequestBody.contentString.enable;
        reqParams.boto3['FindingPublishingFrequency'] = jsonRequestBody.contentString.findingPublishingFrequency;
        reqParams.cli['--finding-publishing-frequency'] = jsonRequestBody.contentString.findingPublishingFrequency;

        outputs.push({
            'region': region,
            'service': 'guardduty',
            'method': {
                'api': 'UpdateDetector',
                'boto3': 'update_detector',
                'cli': 'update-detector'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:efs:efs.CreateTags
    // autogen:efs:efs.DeleteTags
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?/g) && getUrlValue(details.url, 'type') == "modifyTags") {
        reqParams.boto3['FileSystemId'] = jsonRequestBody.fileSystemId;
        reqParams.cli['--file-system-id'] = jsonRequestBody.fileSystemId;
        if (jsonRequestBody.addTags.length) {
            reqParams.boto3['Tags'] = jsonRequestBody.addTags;
            reqParams.cli['--tags'] = jsonRequestBody.addTags;

            outputs.push({
                'region': region,
                'service': 'efs',
                'method': {
                    'api': 'CreateTags',
                    'boto3': 'create_tags',
                    'cli': 'create-tags'
                },
                'options': reqParams
            });
        }
        if (jsonRequestBody.removeKeys.length) {
            reqParams.boto3['TagKeys'] = jsonRequestBody.removeKeys;
            reqParams.cli['--tag-keys'] = jsonRequestBody.removeKeys;

            outputs.push({
                'region': region,
                'service': 'efs',
                'method': {
                    'api': 'DeleteTags',
                    'boto3': 'delete_tags',
                    'cli': 'delete-tags'
                },
                'options': reqParams
            });
        }
        
        return {};
    }

    // autogen:efs:efs.ModifyMountTargetSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/efs\/ajax\/api\?/g) && getUrlValue(details.url, 'type') == "modifySecurityGroups") {
        reqParams.boto3['MountTargetId'] = jsonRequestBody.mountTargetId;
        reqParams.cli['--mount-target-id'] = jsonRequestBody.mountTargetId;
        reqParams.boto3['SecurityGroups'] = jsonRequestBody.securityGroups;
        reqParams.cli['--security-groups'] = jsonRequestBody.securityGroups;

        outputs.push({
            'region': region,
            'service': 'efs',
            'method': {
                'api': 'ModifyMountTargetSecurityGroups',
                'boto3': 'modify_mount_target_security_groups',
                'cli': 'modify-mount-target-security-groups'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:mq:mq.ListBrokers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/mq$/g) && jsonRequestBody.path == "/brokers" && jsonRequestBody.method == "GET") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.params.maxResults;

        outputs.push({
            'region': region,
            'service': 'mq',
            'method': {
                'api': 'ListBrokers',
                'boto3': 'list_brokers',
                'cli': 'list-brokers'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:mq:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/ec2$/g) && jsonRequestBody.params.Action == "DescribeVpcs") {

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

    // autogen:mq:mq.ListConfigurations
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/mq$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path == "/configurations") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.params.maxResults;
        reqParams.boto3['NextToken'] = jsonRequestBody.params.nextToken;
        reqParams.cli['--next-token'] = jsonRequestBody.params.nextToken;

        outputs.push({
            'region': region,
            'service': 'mq',
            'method': {
                'api': 'ListConfigurations',
                'boto3': 'list_configurations',
                'cli': 'list-configurations'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:mq:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/ec2$/g) && jsonRequestBody.params.Action == "DescribeSubnets") {

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

    // autogen:mq:ec2.DescribeSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/ec2$/g) && jsonRequestBody.params.Action == "DescribeSecurityGroups") {

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

    // autogen:mq:mq.CreateBroker
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/mq$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path == "/brokers") {
        reqParams.boto3['BrokerName'] = jsonRequestBody.contentString.brokerName;
        reqParams.cli['--broker-name'] = jsonRequestBody.contentString.brokerName;
        reqParams.boto3['EngineType'] = jsonRequestBody.contentString.engineType;
        reqParams.cli['--engine-type'] = jsonRequestBody.contentString.engineType;
        reqParams.boto3['EngineVersion'] = jsonRequestBody.contentString.engineVersion;
        reqParams.cli['--engine-version'] = jsonRequestBody.contentString.engineVersion;
        reqParams.boto3['HostInstanceType'] = jsonRequestBody.contentString.hostInstanceType;
        reqParams.cli['--host-instance-type'] = jsonRequestBody.contentString.hostInstanceType;
        reqParams.boto3['DeploymentMode'] = jsonRequestBody.contentString.deploymentMode;
        reqParams.cli['--deployment-mode'] = jsonRequestBody.contentString.deploymentMode;
        reqParams.boto3['SecurityGroups'] = jsonRequestBody.contentString.securityGroups;
        reqParams.cli['--security-groups'] = jsonRequestBody.contentString.securityGroups;
        reqParams.boto3['SubnetIds'] = jsonRequestBody.contentString.subnetIds;
        reqParams.cli['--subnet-ids'] = jsonRequestBody.contentString.subnetIds;
        reqParams.boto3['PubliclyAccessible'] = jsonRequestBody.contentString.publiclyAccessible;
        reqParams.cli['--publicly-accessible'] = jsonRequestBody.contentString.publiclyAccessible;
        reqParams.boto3['AutoMinorVersionUpgrade'] = jsonRequestBody.contentString.autoMinorVersionUpgrade;
        reqParams.cli['--auto-minor-version-upgrade'] = jsonRequestBody.contentString.autoMinorVersionUpgrade;
        reqParams.boto3['Users'] = jsonRequestBody.contentString.users;
        reqParams.cli['--users'] = jsonRequestBody.contentString.users;
        reqParams.boto3['MaintenanceWindowStartTime'] = jsonRequestBody.contentString.maintenanceWindowStartTime;
        reqParams.cli['--maintenance-window-start-time'] = jsonRequestBody.contentString.maintenanceWindowStartTime;
        reqParams.boto3['Configuration'] = jsonRequestBody.contentString.configuration;
        reqParams.cli['--configuration'] = jsonRequestBody.contentString.configuration;
        reqParams.boto3['Logs'] = jsonRequestBody.contentString.logs;
        reqParams.cli['--logs'] = jsonRequestBody.contentString.logs;

        reqParams.cfn['BrokerName'] = jsonRequestBody.contentString.brokerName;
        reqParams.cfn['EngineType'] = jsonRequestBody.contentString.engineType;
        reqParams.cfn['EngineVersion'] = jsonRequestBody.contentString.engineVersion;
        reqParams.cfn['HostInstanceType'] = jsonRequestBody.contentString.hostInstanceType;
        reqParams.cfn['DeploymentMode'] = jsonRequestBody.contentString.deploymentMode;
        reqParams.cfn['SecurityGroups'] = jsonRequestBody.contentString.securityGroups;
        reqParams.cfn['SubnetIds'] = jsonRequestBody.contentString.subnetIds;
        reqParams.cfn['PubliclyAccessible'] = jsonRequestBody.contentString.publiclyAccessible;
        reqParams.cfn['AutoMinorVersionUpgrade'] = jsonRequestBody.contentString.autoMinorVersionUpgrade;
        reqParams.cfn['Users'] = jsonRequestBody.contentString.users;
        reqParams.cfn['MaintenanceWindowStartTime'] = jsonRequestBody.contentString.maintenanceWindowStartTime;
        reqParams.cfn['Configuration'] = jsonRequestBody.contentString.configuration;
        reqParams.cfn['Logs'] = jsonRequestBody.contentString.logs;

        outputs.push({
            'region': region,
            'service': 'mq',
            'method': {
                'api': 'CreateBroker',
                'boto3': 'create_broker',
                'cli': 'create-broker'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'mq',
            'type': 'AWS::AmazonMQ::Broker',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:mq:mq.CreateConfiguration
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/mq$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path == "/configurations") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['EngineType'] = jsonRequestBody.contentString.engineType;
        reqParams.cli['--engine-type'] = jsonRequestBody.contentString.engineType;
        reqParams.boto3['EngineVersion'] = jsonRequestBody.contentString.engineVersion;
        reqParams.cli['--engine-version'] = jsonRequestBody.contentString.engineVersion;

        reqParams.cfn['Name'] = jsonRequestBody.contentString.name;
        reqParams.cfn['EngineType'] = jsonRequestBody.contentString.engineType;
        reqParams.cfn['EngineVersion'] = jsonRequestBody.contentString.engineVersion;

        outputs.push({
            'region': region,
            'service': 'mq',
            'method': {
                'api': 'CreateConfiguration',
                'boto3': 'create_configuration',
                'cli': 'create-configuration'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'mq',
            'type': 'AWS::AmazonMQ::Configuration',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:mq:mq.DescribeConfiguration
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/mq$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path.match(/\/configurations\/.+/g)) {
        reqParams.boto3['ConfigurationId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--configuration-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'mq',
            'method': {
                'api': 'DescribeConfiguration',
                'boto3': 'describe_configuration',
                'cli': 'describe-configuration'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:mq:mq.DescribeConfigurationRevision
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/amazon-mq\/api\/mq$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path.match(/\/configurations\/.+\/revisions\/.+/g)) {
        reqParams.boto3['ConfigurationId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--configuration-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['ConfigurationRevision'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--configuration-revision'] = jsonRequestBody.path.split("/")[4];

        outputs.push({
            'region': region,
            'service': 'mq',
            'method': {
                'api': 'DescribeConfigurationRevision',
                'boto3': 'describe_configuration_revision',
                'cli': 'describe-configuration-revision'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeLaunchTemplateVersions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeLaunchTemplateVersions\?/g)) {
        reqParams.boto3['LaunchTemplateId'] = jsonRequestBody.LaunchTemplateId;
        reqParams.cli['--launch-template-id'] = jsonRequestBody.LaunchTemplateId;
        reqParams.boto3['MaxResults'] = jsonRequestBody.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeLaunchTemplateVersions',
                'boto3': 'describe_launch_template_versions',
                'cli': 'describe-launch-template-versions'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeKeyPairs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeKeyPairs\?/g)) {

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

    // autogen:ec2:ec2.DescribeAvailabilityZones
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeAvailabilityZones\?/g)) {

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

    // autogen:ec2:ec2.DescribeHosts
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeHosts\?/g)) {

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

    // autogen:ec2:ec2.DescribeSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeSecurityGroups\?/g)) {

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

    // autogen:ec2:ec2.DescribeSnapshots
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getSnapshotsAutoUpdate\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSnapshots',
                'boto3': 'describe_snapshots',
                'cli': 'describe-snapshots'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVolumes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getMergedVolumesAutoUpdate\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVolumes',
                'boto3': 'describe_volumes',
                'cli': 'describe-volumes'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeTags
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getTagsAutoUpdate\?/g)) {

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

    // autogen:ec2:ec2.CreateLaunchTemplate
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateLaunchTemplate\?/g)) {
        reqParams.boto3['LaunchTemplateName'] = jsonRequestBody.LaunchTemplateName;
        reqParams.cli['--launch-template-name'] = jsonRequestBody.LaunchTemplateName;
        reqParams.boto3['VersionDescription'] = jsonRequestBody.VersionDescription;
        reqParams.cli['--version-description'] = jsonRequestBody.VersionDescription;
        reqParams.boto3['LaunchTemplateData'] = jsonRequestBody.LaunchTemplateData;
        reqParams.cli['--launch-template-data'] = jsonRequestBody.LaunchTemplateData;
        reqParams.boto3['ClientToken'] = jsonRequestBody.ClientToken;
        reqParams.cli['--client-token'] = jsonRequestBody.ClientToken;

        reqParams.cfn['LaunchTemplateName'] = jsonRequestBody.LaunchTemplateName;
        reqParams.cfn['LaunchTemplateData'] = jsonRequestBody.LaunchTemplateData;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateLaunchTemplate',
                'boto3': 'create_launch_template',
                'cli': 'create-launch-template'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::LaunchTemplate',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateTags
    // autogen:ec2:ec2.DeleteTags
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=updateTags\?/g)) {

        if (jsonRequestBody.addTags.length) {
            reqParams.boto3['Tags'] = jsonRequestBody.addTags;
            reqParams.cli['--tags'] = jsonRequestBody.addTags;

            outputs.push({
                'region': region,
                'service': 'ec2',
                'method': {
                    'api': 'CreateTags',
                    'boto3': 'create_tags',
                    'cli': 'create-tags'
                },
                'options': reqParams
            });
        }
        if (jsonRequestBody.removeKeys.length) {
            reqParams.boto3['TagKeys'] = jsonRequestBody.removeKeys;
            reqParams.cli['--tag-keys'] = jsonRequestBody.removeKeys;

            outputs.push({
                'region': region,
                'service': 'ec2',
                'method': {
                    'api': 'DeleteTags',
                    'boto3': 'delete_tags',
                    'cli': 'delete-tags'
                },
                'options': reqParams
            });
        }
        
        return {};
    }

    // autogen:ec2:ec2.CreateKeyPair
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=createKeyPair\?/g)) {
        reqParams.boto3['KeyName'] = jsonRequestBody.keyName;
        reqParams.cli['--key-name'] = jsonRequestBody.keyName;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateKeyPair',
                'boto3': 'create_key_pair',
                'cli': 'create-key-pair'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteKeyPair
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=deleteKeyPair\?/g)) {
        reqParams.boto3['KeyName'] = jsonRequestBody.keyName;
        reqParams.cli['--key-name'] = jsonRequestBody.keyName;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteKeyPair',
                'boto3': 'delete_key_pair',
                'cli': 'delete-key-pair'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.ImportKeyPair
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=importKeyPair\?/g)) {
        reqParams.boto3['KeyName'] = jsonRequestBody.keyName;
        reqParams.cli['--key-name'] = jsonRequestBody.keyName;
        reqParams.boto3['PublicKeyMaterial'] = jsonRequestBody.publicKeyMaterial;
        reqParams.cli['--public-key-material'] = jsonRequestBody.publicKeyMaterial;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'ImportKeyPair',
                'boto3': 'import_key_pair',
                'cli': 'import-key-pair'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateNetworkInterface
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateNetworkInterface\?/g)) {
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['Groups'] = jsonRequestBody.groups;
        reqParams.cli['--groups'] = jsonRequestBody.groups;
        reqParams.boto3['SubnetId'] = jsonRequestBody.subnetId;
        reqParams.cli['--subnet-id'] = jsonRequestBody.subnetId;

        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.boto3['GroupSet'] = jsonRequestBody.groups;
        reqParams.boto3['SubnetId'] = jsonRequestBody.subnetId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateNetworkInterface',
                'boto3': 'create_network_interface',
                'cli': 'create-network-interface'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::NetworkInterface',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeFlowLogs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getSdkResources_FlowLog\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeFlowLogs',
                'boto3': 'describe_flow_logs',
                'cli': 'describe-flow-logs'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteNetworkInterface
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=deleteNetworkInterface\?/g)) {
        reqParams.boto3['NetworkInterfaceId'] = jsonRequestBody.networkInterfaceId;
        reqParams.cli['--network-interface-id'] = jsonRequestBody.networkInterfaceId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteNetworkInterface',
                'boto3': 'delete_network_interface',
                'cli': 'delete-network-interface'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeAddresses
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeAddresses\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeAddresses',
                'boto3': 'describe_addresses',
                'cli': 'describe-addresses'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.AllocateAddress
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.AllocateAddress\?/g)) {
        reqParams.boto3['Domain'] = jsonRequestBody.Domain;
        reqParams.cli['--domain'] = jsonRequestBody.Domain;

        reqParams.cfn['Domain'] = jsonRequestBody.Domain;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'AllocateAddress',
                'boto3': 'allocate_address',
                'cli': 'allocate-address'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::EIP',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeInstances
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeInstances\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.filters;
        reqParams.cli['--filters'] = jsonRequestBody.filters;

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

    // autogen:ec2:ec2.DescribeNetworkInterfaces
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeNetworkInterfaces\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.filters;
        reqParams.cli['--filters'] = jsonRequestBody.filters;

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

    // autogen:ec2:ec2.AssociateAddress
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.AssociateAddress\?/g)) {
        reqParams.boto3['AllocationId'] = jsonRequestBody.AllocationId;
        reqParams.cli['--allocation-id'] = jsonRequestBody.AllocationId;
        reqParams.boto3['InstanceId'] = jsonRequestBody.InstanceId;
        reqParams.cli['--instance-id'] = jsonRequestBody.InstanceId;
        reqParams.boto3['AllowReassociation'] = jsonRequestBody.allowReassociation;
        reqParams.cli['--allow-reassociation'] = jsonRequestBody.allowReassociation;
        reqParams.boto3['PrivateIpAddress'] = jsonRequestBody.PrivateIpAddress;
        reqParams.cli['--private-ip-address'] = jsonRequestBody.PrivateIpAddress;

        reqParams.cfn['AllocationId'] = jsonRequestBody.AllocationId;
        reqParams.cfn['InstanceId'] = jsonRequestBody.InstanceId;
        reqParams.cfn['PrivateIpAddress'] = jsonRequestBody.PrivateIpAddress;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'AssociateAddress',
                'boto3': 'associate_address',
                'cli': 'associate-address'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::EIPAssociation',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DisassociateAddress
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DisassociateAddress\?/g)) {
        reqParams.boto3['AssociationId'] = jsonRequestBody.AssociationId;
        reqParams.cli['--association-id'] = jsonRequestBody.AssociationId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DisassociateAddress',
                'boto3': 'disassociate_address',
                'cli': 'disassociate-address'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.ReleaseAddress
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.ReleaseAddress\?/g)) {
        reqParams.boto3['AllocationId'] = jsonRequestBody.AllocationId;
        reqParams.cli['--allocation-id'] = jsonRequestBody.AllocationId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'ReleaseAddress',
                'boto3': 'release_address',
                'cli': 'release-address'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:config.DescribeConfigurationRecorders
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.config\.AmazonConfig\.DescribeConfigurationRecorders\?/g)) {

        outputs.push({
            'region': region,
            'service': 'config',
            'method': {
                'api': 'DescribeConfigurationRecorders',
                'boto3': 'describe_configuration_recorders',
                'cli': 'describe-configuration-recorders'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.AllocateHosts
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.AllocateHosts\?/g)) {
        reqParams.boto3['InstanceType'] = jsonRequestBody.instanceType;
        reqParams.cli['--instance-type'] = jsonRequestBody.instanceType;
        reqParams.boto3['AvailabilityZone'] = jsonRequestBody.availabilityZone;
        reqParams.cli['--availability-zone'] = jsonRequestBody.availabilityZone;
        reqParams.boto3['AutoPlacement'] = jsonRequestBody.autoPlacement;
        reqParams.cli['--auto-placement'] = jsonRequestBody.autoPlacement;
        reqParams.boto3['Quantity'] = jsonRequestBody.quantity;
        reqParams.cli['--quantity'] = jsonRequestBody.quantity;
        reqParams.boto3['TagSpecifications'] = jsonRequestBody.TagSpecification;
        reqParams.cli['--tag-specifications'] = jsonRequestBody.TagSpecification;

        reqParams.cfn['InstanceType'] = jsonRequestBody.instanceType;
        reqParams.cfn['AvailabilityZone'] = jsonRequestBody.availabilityZone;
        reqParams.cfn['AutoPlacement'] = jsonRequestBody.autoPlacement;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'AllocateHosts',
                'boto3': 'allocate_hosts',
                'cli': 'allocate-hosts'
            },
            'options': reqParams
        });

        for (var i=0; i<jsonRequestBody.quantity; i++) {
            tracked_resources.push({
                'region': region,
                'service': 'ec2',
                'type': 'AWS::EC2::Host',
                'options': reqParams,
                'was_blocked': blocking
            });
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeRegions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService" && getPipeSplitField(requestBody, 8) == "getRegions") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRegions',
                'boto3': 'describe_regions',
                'cli': 'describe-regions'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeAccountAttributes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeAccountAttributes\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeAccountAttributes',
                'boto3': 'describe_account_attributes',
                'cli': 'describe-account-attributes'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeDhcpOptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "getDHCPOptions" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeDhcpOptions',
                'boto3': 'describe_dhcp_options',
                'cli': 'describe-dhcp-options'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcAttribute
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService" && getPipeSplitField(requestBody, 8) == "getVpcAttributes") {
        reqParams.boto3['VpcId'] = getPipeSplitField(requestBody, 17);
        reqParams.cli['--vpc-id'] = getPipeSplitField(requestBody, 17);

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcAttribute',
                'boto3': 'describe_vpc_attribute',
                'cli': 'describe-vpc-attribute'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeFlowLogs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=getSdkResources_FlowLog\?/g) && jsonRequestBody.methodName == "describeFlowLogs" && jsonRequestBody.clientType == "com.amazonaws.services.ec2.AmazonEC2Client") {
        reqParams.boto3['Filter'] = jsonRequestBody.filters;
        reqParams.cli['--filter'] = jsonRequestBody.filters;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeFlowLogs',
                'boto3': 'describe_flow_logs',
                'cli': 'describe-flow-logs'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2ux\.elasticconsole\.generated\.ElasticConsoleBackendGenerated\.MergedDescribeSubnets\?/g) && getPipeSplitField(requestBody, 8) == "getVpcs") {

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

    // autogen:ec2:ec2.DescribeRouteTables
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService" && getPipeSplitField(requestBody, 8) == "getRouteTables") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRouteTables',
                'boto3': 'describe_route_tables',
                'cli': 'describe-route-tables'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeInternetGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.elasticconsole\.backend\.master\.ElasticConsoleBackendService\.GetMergedResources\?/g) && jsonRequestBody.operation == "DescribeInternetGateways" && jsonRequestBody.service == "com.amazonaws.ec2.AmazonEC2") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeInternetGateways',
                'boto3': 'describe_internet_gateways',
                'cli': 'describe-internet-gateways'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeEgressOnlyInternetGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.elasticconsole\.backend\.master\.ElasticConsoleBackendService\.GetMergedResources\?/g) && jsonRequestBody.service == "com.amazonaws.ec2.AmazonEC2" && jsonRequestBody.operation == "DescribeEgressOnlyInternetGateways") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeEgressOnlyInternetGateways',
                'boto3': 'describe_egress_only_internet_gateways',
                'cli': 'describe-egress-only-internet-gateways'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeDhcpOptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "getDHCPOptions" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeDhcpOptions',
                'boto3': 'describe_dhcp_options',
                'cli': 'describe-dhcp-options'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeAddresses
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeAddresses\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeAddresses',
                'boto3': 'describe_addresses',
                'cli': 'describe-addresses'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcEndpoints
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2ux\.elasticconsole\.generated\.ElasticConsoleBackendGenerated\.MergedDescribeVpcEndpoints\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcEndpoints',
                'boto3': 'describe_vpc_endpoints',
                'cli': 'describe-vpc-endpoints'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcEndpointServiceConfigurations
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeVpcEndpointServiceConfigurations\?/g)) {
        reqParams.boto3['MaxResults'] = jsonRequestBody.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcEndpointServiceConfigurations',
                'boto3': 'describe_vpc_endpoint_service_configurations',
                'cli': 'describe-vpc-endpoint-service-configurations'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeNatGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2ux\.elasticconsole\.generated\.ElasticConsoleBackendGenerated\.MergedDescribeNatGateways\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeNatGateways',
                'boto3': 'describe_nat_gateways',
                'cli': 'describe-nat-gateways'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeAccountAttributes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeAccountAttributes\?/g)) {
        reqParams.boto3['AttributeNames'] = jsonRequestBody.attributeNames;
        reqParams.cli['--attribute-names'] = jsonRequestBody.attributeNames;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeAccountAttributes',
                'boto3': 'describe_account_attributes',
                'cli': 'describe-account-attributes'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcPeeringConnections
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.elasticconsole\.backend\.master\.ElasticConsoleBackendService\.GetMergedResources\?/g) && jsonRequestBody.operation == "DescribeVpcPeeringConnections" && jsonRequestBody.service == "com.amazonaws.ec2.AmazonEC2") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcPeeringConnections',
                'boto3': 'describe_vpc_peering_connections',
                'cli': 'describe-vpc-peering-connections'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeNetworkAcls
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "getNetworkACLs" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeNetworkAcls',
                'boto3': 'describe_network_acls',
                'cli': 'describe-network-acls'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeStaleSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=callSdk_com\.amazonaws\.services\.ec2\.AmazonEC2Client_describeStaleSecurityGroups\?/g) && jsonRequestBody.clientType == "com.amazonaws.services.ec2.AmazonEC2Client" && jsonRequestBody.methodName == "describeStaleSecurityGroups") {
        reqParams.boto3['VpcId'] = jsonRequestBody.request.vpcId;
        reqParams.cli['--vpc-id'] = jsonRequestBody.request.vpcId;
        reqParams.boto3['MaxResults'] = jsonRequestBody.request.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.request.maxResults;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeStaleSecurityGroups',
                'boto3': 'describe_stale_security_groups',
                'cli': 'describe-stale-security-groups'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeCustomerGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2ux\.elasticconsole\.generated\.ElasticConsoleBackendGenerated\.MergedDescribeCustomerGateways\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeCustomerGateways',
                'boto3': 'describe_customer_gateways',
                'cli': 'describe-customer-gateways'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpnGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2ux\.elasticconsole\.generated\.ElasticConsoleBackendGenerated\.MergedDescribeVpnGateways\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpnGateways',
                'boto3': 'describe_vpn_gateways',
                'cli': 'describe-vpn-gateways'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpnConnections
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2ux\.elasticconsole\.generated\.ElasticConsoleBackendGenerated\.MergedDescribeVpnConnections\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpnConnections',
                'boto3': 'describe_vpn_connections',
                'cli': 'describe-vpn-connections'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateVpc
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "createVpc" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {
        reqParams.boto3['CidrBlock'] = getPipeSplitField(requestBody, 18);
        reqParams.cli['--cidr-block'] = getPipeSplitField(requestBody, 18);
        reqParams.boto3['InstanceTenancy'] = getPipeSplitField(requestBody, 19);
        reqParams.cli['--instance-tenancy'] = getPipeSplitField(requestBody, 19);

        reqParams.cfn['CidrBlock'] = getPipeSplitField(requestBody, 18);
        reqParams.cfn['InstanceTenancy'] = getPipeSplitField(requestBody, 19);

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateVpc',
                'boto3': 'create_vpc',
                'cli': 'create-vpc'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::VPC',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:logs.DescribeLogGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.logs\.v20140328\.Logs_20140328\.DescribeLogGroups\?/g)) {

        outputs.push({
            'region': region,
            'service': 'logs',
            'method': {
                'api': 'DescribeLogGroups',
                'boto3': 'describe_log_groups',
                'cli': 'describe-log-groups'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:iam.ListRoles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazon\.webservices\.auth\.identity\.v20100508\.AWSIdentityManagementV20100508\.ListRoles\?/g)) {
        reqParams.boto3['MaxItems'] = jsonRequestBody.MaxItems;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxItems;

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

    // autogen:ec2:ec2.CreateFlowLogs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateFlowLogs\?/g)) {
        reqParams.boto3['ResourceIds'] = jsonRequestBody.ResourceIds;
        reqParams.cli['--resource-ids'] = jsonRequestBody.ResourceIds;
        reqParams.boto3['TrafficType'] = jsonRequestBody.TrafficType;
        reqParams.cli['--traffic-type'] = jsonRequestBody.TrafficType;
        reqParams.boto3['ResourceType'] = jsonRequestBody.ResourceType;
        reqParams.cli['--resource-type'] = jsonRequestBody.ResourceType;
        reqParams.boto3['LogDestinationType'] = jsonRequestBody.LogDestinationType;
        reqParams.cli['--log-destination-type'] = jsonRequestBody.LogDestinationType;
        reqParams.boto3['LogDestination'] = jsonRequestBody.LogDestination;
        reqParams.cli['--log-destination'] = jsonRequestBody.LogDestination;
        reqParams.boto3['DeliverLogsPermissionArn'] = jsonRequestBody.DeliverLogsPermissionArn;
        reqParams.cli['--deliver-logs-permission-arn'] = jsonRequestBody.DeliverLogsPermissionArn;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateFlowLogs',
                'boto3': 'create_flow_logs',
                'cli': 'create-flow-logs'
            },
            'options': reqParams
        });
        
        for (var resource_id in jsonRequestBody.ResourceIds) {
            reqParams.cfn['ResourceId'] = resource_id;
            reqParams.cfn['TrafficType'] = jsonRequestBody.TrafficType;
            reqParams.cfn['ResourceType'] = jsonRequestBody.ResourceType;
            reqParams.cfn['LogDestinationType'] = jsonRequestBody.LogDestinationType;
            reqParams.cfn['LogDestination'] = jsonRequestBody.LogDestination;
            reqParams.cfn['DeliverLogsPermissionArn'] = jsonRequestBody.DeliverLogsPermissionArn;

            tracked_resources.push({
                'region': region,
                'service': 'ec2',
                'type': 'AWS::EC2::FlowLog',
                'options': reqParams,
                'was_blocked': blocking
            });
        }
        
        return {};
    }

    // autogen:ec2:ec2.DeleteFlowLogs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=callSdk_com\.amazonaws\.services\.ec2\.AmazonEC2Client_deleteFlowLogs\?/g)) {
        reqParams.boto3['FlowLogIds'] = jsonRequestBody.request.flowLogIds;
        reqParams.cli['--flow-log-ids'] = jsonRequestBody.request.flowLogIds;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteFlowLogs',
                'boto3': 'delete_flow_logs',
                'cli': 'delete-flow-logs'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DisassociateVpcCidrBlock
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DisassociateVpcCidrBlock\?/g)) {
        reqParams.boto3['AssociationId'] = jsonRequestBody.associationId;
        reqParams.cli['--association-id'] = jsonRequestBody.associationId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DisassociateVpcCidrBlock',
                'boto3': 'disassociate_vpc_cidr_block',
                'cli': 'disassociate-vpc-cidr-block'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeInstances
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "modifyDHCPOptions" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService" && getPipeSplitField(requestBody, 8) == "getInstancesForVPC" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {

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

    // autogen:ec2:ec2.DeleteVpc
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "deleteVpc" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {
        reqParams.boto3['VpcId'] = getPipeSplitField(requestBody, 18);
        reqParams.cli['--vpc-id'] = getPipeSplitField(requestBody, 18);

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteVpc',
                'boto3': 'delete_vpc',
                'cli': 'delete-vpc'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateRouteTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "createRouteTable" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {
        reqParams.boto3['VpcId'] = getPipeSplitField(requestBody, 17);
        reqParams.cli['--vpc-id'] = getPipeSplitField(requestBody, 17);

        reqParams.cfn['VpcId'] = getPipeSplitField(requestBody, 17);

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateRouteTable',
                'boto3': 'create_route_table',
                'cli': 'create-route-table'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::RouteTable',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeRouteTables
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "getRouteTables" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRouteTables',
                'boto3': 'describe_route_tables',
                'cli': 'describe-route-tables'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteEgressOnlyInternetGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DeleteEgressOnlyInternetGateway\?/g)) {
        reqParams.boto3['EgressOnlyInternetGatewayId'] = jsonRequestBody.EgressOnlyInternetGatewayId;
        reqParams.cli['--egress-only-internet-gateway-id'] = jsonRequestBody.EgressOnlyInternetGatewayId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteEgressOnlyInternetGateway',
                'boto3': 'delete_egress_only_internet_gateway',
                'cli': 'delete-egress-only-internet-gateway'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateEgressOnlyInternetGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateEgressOnlyInternetGateway\?/g)) {
        reqParams.boto3['VpcId'] = jsonRequestBody.VpcId;
        reqParams.cli['--vpc-id'] = jsonRequestBody.VpcId;

        reqParams.cfn['VpcId'] = jsonRequestBody.VpcId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateEgressOnlyInternetGateway',
                'boto3': 'create_egress_only_internet_gateway',
                'cli': 'create-egress-only-internet-gateway'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::EgressOnlyInternetGateway',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteInternetGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DeleteInternetGateway\?/g)) {
        reqParams.boto3['InternetGatewayId'] = jsonRequestBody.internetGatewayId;
        reqParams.cli['--internet-gateway-id'] = jsonRequestBody.internetGatewayId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteInternetGateway',
                'boto3': 'delete_internet_gateway',
                'cli': 'delete-internet-gateway'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateTags
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=createTags\?/g)) {
        reqParams.boto3['Resources'] = jsonRequestBody.resources;
        reqParams.cli['--resources'] = jsonRequestBody.resources;
        reqParams.boto3['Tags'] = jsonRequestBody.tags;
        reqParams.cli['--tags'] = jsonRequestBody.tags;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateTags',
                'boto3': 'create_tags',
                'cli': 'create-tags'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateInternetGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateInternetGateway\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateInternetGateway',
                'boto3': 'create_internet_gateway',
                'cli': 'create-internet-gateway'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::InternetGateway',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteRouteTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "deleteRouteTable" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {
        reqParams.boto3['RouteTableId'] = getPipeSplitField(requestBody, 17);
        reqParams.cli['--route-table-id'] = getPipeSplitField(requestBody, 17);

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteRouteTable',
                'boto3': 'delete_route_table',
                'cli': 'delete-route-table'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteDhcpOptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=callSdk_com\.amazonaws\.services\.ec2\.AmazonEC2Client_deleteDhcpOptions\?/g)) {
        reqParams.boto3['DhcpOptionsId'] = jsonRequestBody.request.dhcpOptionsId;
        reqParams.cli['--dhcp-options-id'] = jsonRequestBody.request.dhcpOptionsId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteDhcpOptions',
                'boto3': 'delete_dhcp_options',
                'cli': 'delete-dhcp-options'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateNatGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateNatGateway\?/g)) {
        reqParams.boto3['SubnetId'] = jsonRequestBody.SubnetId;
        reqParams.cli['--subnet-id'] = jsonRequestBody.SubnetId;
        reqParams.boto3['AllocationId'] = jsonRequestBody.AllocationId;
        reqParams.cli['--allocation-id'] = jsonRequestBody.AllocationId;

        reqParams.cfn['SubnetId'] = jsonRequestBody.SubnetId;
        reqParams.cfn['AllocationId'] = jsonRequestBody.AllocationId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateNatGateway',
                'boto3': 'create_nat_gateway',
                'cli': 'create-nat-gateway'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::NatGateway',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteNatGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DeleteNatGateway\?/g)) {
        reqParams.boto3['NatGatewayId'] = jsonRequestBody.NatGatewayId;
        reqParams.cli['--nat-gateway-id'] = jsonRequestBody.NatGatewayId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteNatGateway',
                'boto3': 'delete_nat_gateway',
                'cli': 'delete-nat-gateway'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateNetworkAcl
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "createNetworkACL" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {
        reqParams.boto3['VpcId'] = getPipeSplitField(requestBody, 17);
        reqParams.cli['--vpc-id'] = getPipeSplitField(requestBody, 17);

        reqParams.cfn['VpcId'] = getPipeSplitField(requestBody, 17);

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateNetworkAcl',
                'boto3': 'create_network_acl',
                'cli': 'create-network-acl'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::NetworkAcl',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteNetworkAcl
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && getPipeSplitField(requestBody, 8) == "deleteNetworkACL" && getPipeSplitField(requestBody, 7) == "amazonaws.console.vpc.client.VpcConsoleService") {
        reqParams.boto3['NetworkAclId'] = getPipeSplitField(requestBody, 17);
        reqParams.cli['--network-acl-id'] = getPipeSplitField(requestBody, 17);

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteNetworkAcl',
                'boto3': 'delete_network_acl',
                'cli': 'delete-network-acl'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateCustomerGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateCustomerGateway\?/g)) {
        reqParams.boto3['PublicIp'] = jsonRequestBody.PublicIp;
        reqParams.cli['--public-ip'] = jsonRequestBody.PublicIp;
        reqParams.boto3['Type'] = jsonRequestBody.Type;
        reqParams.cli['--type'] = jsonRequestBody.Type;

        reqParams.cfn['IpAddress'] = jsonRequestBody.PublicIp;
        reqParams.cfn['Type'] = jsonRequestBody.Type;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateCustomerGateway',
                'boto3': 'create_customer_gateway',
                'cli': 'create-customer-gateway'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::CustomerGateway',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteCustomerGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DeleteCustomerGateway\?/g)) {
        reqParams.boto3['CustomerGatewayId'] = jsonRequestBody.CustomerGatewayId;
        reqParams.cli['--customer-gateway-id'] = jsonRequestBody.CustomerGatewayId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteCustomerGateway',
                'boto3': 'delete_customer_gateway',
                'cli': 'delete-customer-gateway'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateVpnGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateVpnGateway\?/g)) {
        reqParams.boto3['Type'] = jsonRequestBody.Type;
        reqParams.cli['--type'] = jsonRequestBody.Type;

        reqParams.cfn['Type'] = jsonRequestBody.Type;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateVpnGateway',
                'boto3': 'create_vpn_gateway',
                'cli': 'create-vpn-gateway'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::VPNGateway',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteVpnGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DeleteVpnGateway\?/g)) {
        reqParams.boto3['VpnGatewayId'] = jsonRequestBody.VpnGatewayId;
        reqParams.cli['--vpn-gateway-id'] = jsonRequestBody.VpnGatewayId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteVpnGateway',
                'boto3': 'delete_vpn_gateway',
                'cli': 'delete-vpn-gateway'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:sqs:sqs.ListQueues
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonSQS$/g) && getPipeSplitField(requestBody, 7) == "com.amazonaws.console.sqs.shared.services.AmazonSQSService" && getPipeSplitField(requestBody, 8) == "listQueues") {

        outputs.push({
            'region': region,
            'service': 'sqs',
            'method': {
                'api': 'ListQueues',
                'boto3': 'list_queues',
                'cli': 'list-queues'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:sqs:kms.ListKeys
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonKMS$/g) && getPipeSplitField(requestBody, 8) == "listKeys" && getPipeSplitField(requestBody, 7) == "com.amazonaws.console.sqs.shared.services.AmazonKMSService") {

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'ListKeys',
                'boto3': 'list_keys',
                'cli': 'list-keys'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:sqs:sqs.DeleteQueue
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonSQS$/g) && getPipeSplitField(requestBody, 8) == "createQueue" && getPipeSplitField(requestBody, 7) == "com.amazonaws.console.sqs.shared.services.AmazonSQSService" && getPipeSplitField(requestBody, 8) == "deleteQueue" && getPipeSplitField(requestBody, 7) == "com.amazonaws.console.sqs.shared.services.AmazonSQSService") {
        reqParams.boto3['QueueUrl'] = getPipeSplitField(requestBody, 10);
        reqParams.cli['--queue-url'] = getPipeSplitField(requestBody, 10);

        outputs.push({
            'region': region,
            'service': 'sqs',
            'method': {
                'api': 'DeleteQueue',
                'boto3': 'delete_queue',
                'cli': 'delete-queue'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.ListGroups
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/groups$/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListGroups',
                'boto3': 'list_groups',
                'cli': 'list-groups'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.ListUsers
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users$/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListUsers',
                'boto3': 'list_users',
                'cli': 'list-users'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.ListPolicies
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/policies$/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListPolicies',
                'boto3': 'list_policies',
                'cli': 'list-policies'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.CreateUser
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users$/g)) {
        reqParams.boto3['UserName'] = jsonRequestBody.name;
        reqParams.cli['--user-name'] = jsonRequestBody.name;
        reqParams.boto3['Path'] = '/';
        reqParams.cli['--path'] = '/';

        reqParams.cfn['UserName'] = jsonRequestBody.name;
        reqParams.cfn['Path'] = '/';

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'CreateUser',
                'boto3': 'create_user',
                'cli': 'create-user'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::IAM::User',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:iam:iam.AttachUserPolicy
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/attachments$/g)) {
        reqParams.boto3['PolicyArn'] = jsonRequestBody.policyArn;
        reqParams.cli['--policy-arn'] = jsonRequestBody.policyArn;
        reqParams.boto3['UserName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];
        reqParams.cli['--user-name'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'AttachUserPolicy',
                'boto3': 'attach_user_policy',
                'cli': 'attach-user-policy'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.AddUserToGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/groups\/.+\/members$/g)) {
        reqParams.boto3['UserName'] = jsonRequestBody.userName;
        reqParams.cli['--user-name'] = jsonRequestBody.userName;
        reqParams.boto3['GroupName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/groups\/(.+)\//g)[1];
        reqParams.cli['--group-name'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/groups\/(.+)\//g)[1];

        reqParams.cfn['Users'] = [jsonRequestBody.userName];
        reqParams.cfn['GroupName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/groups\/(.+)\//g)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'AddUserToGroup',
                'boto3': 'add_user_to_group',
                'cli': 'add-user-to-group'
            },
            'options': reqParams
        });

        tracked_resources.push({
            'region': region,
            'service': 'ec2',
            'type': 'AWS::IAM::UserToGroupAddition',
            'options': reqParams,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:iam:iam.ListGroupsForUser
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/groups$/g)) {
        reqParams.boto3['UserName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];
        reqParams.cli['--user-name'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListGroupsForUser',
                'boto3': 'list_groups_for_user',
                'cli': 'list-groups-for-user'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.ListAccessKeys
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/accessKeys$/g)) {
        reqParams.boto3['UserName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];
        reqParams.cli['--user-name'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListAccessKeys',
                'boto3': 'list_access_keys',
                'cli': 'list-access-keys'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.GetLoginProfile
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/loginProfile$/g)) {
        reqParams.boto3['UserName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];
        reqParams.cli['--user-name'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'GetLoginProfile',
                'boto3': 'get_login_profile',
                'cli': 'get-login-profile'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.CreateLoginProfile
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/loginProfile$/g)) {
        reqParams.boto3['UserName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];
        reqParams.cli['--user-name'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g)[1];
        reqParams.boto3['Password'] = jsonRequestBody.password;
        reqParams.cli['--password'] = jsonRequestBody.password;
        reqParams.boto3['PasswordResetRequired'] = jsonRequestBody.resetRequired;
        reqParams.cli['--password-reset-required'] = jsonRequestBody.resetRequired;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'CreateLoginProfile',
                'boto3': 'create_login_profile',
                'cli': 'create-login-profile'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.ListAccountAliases
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/aliases$/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListAccountAliases',
                'boto3': 'list_account_aliases',
                'cli': 'list-account-aliases'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.GetUser
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+$/g)) {
        reqParams.boto3['UserName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)$/g)[1];
        reqParams.cli['--user-name'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)$/g)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'GetUser',
                'boto3': 'get_user',
                'cli': 'get-user'
            },
            'options': reqParams
        });
        
        return {};
    }

    // autogen:iam:iam.DeleteUser
    if (details.method == "DELETE" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+$/g)) {
        reqParams.boto3['UserName'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)$/g)[1];
        reqParams.cli['--user-name'] = details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)$/g)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'DeleteUser',
                'boto3': 'delete_user',
                'cli': 'delete-user'
            },
            'options': reqParams
        });
        
        return {};
    }

}
