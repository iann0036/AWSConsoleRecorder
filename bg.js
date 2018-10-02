// awscr@ian.mn

var outputs = [];
var blocking = false;
var declared_services;
var compiled;
var go_first_output;

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

function processBoto3Parameter(param, spacing) {
    var paramitems = [];

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
            paramitems.push(processBoto3Parameter(paramitem, spacing + 4));
        });

        return `[
` + ' '.repeat(spacing + 4) + paramitems.join(`,
` + ' '.repeat(spacing + 4)) + `
` + ' '.repeat(spacing) + ']';
    }
    if (typeof param == "object") {
        Object.keys(param).forEach(function (key) {
            paramitems.push(key + "=" + processBoto3Parameter(param[key], spacing + 4));
        });

        return `{
` + ' '.repeat(spacing + 4) + paramitems.join(`,
` + ' '.repeat(spacing + 4)) + `
` + ' '.repeat(spacing) + '}';
    }
    
    return `'${param}' # unprocessable parameter type ` + (typeof param);
}

function processGoParameter(paramkey, param, spacing) {
    var paramitems = [];

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
    
    return `aws.String('${param}') // unprocessable parameter type ` + (typeof param);
}

function outputMapBoto3(service, method, options, region, was_blocked) {
    var output = ensureInitDeclaredBoto3(service, region);
    var params = '';

    if (Object.keys(options).length) {
        for (option in options) {
            var optionvalue = processBoto3Parameter(options[option], 4);
            params += `
    ${option}=${optionvalue},`
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
            var optionvalue = processGoParameter(option, options[option], 4);
            params += `
    ${option}:  ${optionvalue},`;
        }
        params += `
`;
    }

    output += `_, err ${go_first_output ? ':' : ''}= ${service}svc.${method}(&${service}.${method}Input{${params}})${was_blocked ? ' // blocked' : ''}
`

    go_first_output = false;

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
            //outputs = []; // TODO: Remove this possibly
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
    }
);

function compileOutputs() {
    console.log(outputs);

    if (!outputs.length) {
        return {
            'boto3': '# No recorded actions yet',
            'go': '// No recorded actions yet',
            'cli': '# No recorded actions yet'
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
        'cli': `# pip install awscli --upgrade --user

`
    }
    declared_services = {
        'boto3': [],
        'go': []
    }
    go_first_output = true;

    compiled['raw'] = JSON.stringify(outputs);

    for (var i=0; i<outputs.length; i++) {
        compiled['boto3'] += outputMapBoto3(outputs[i].service, outputs[i].method.boto3, outputs[i].options.boto3, outputs[i].region, outputs[i].was_blocked);
        compiled['go'] += outputMapGo(outputs[i].service, outputs[i].method.api, outputs[i].options.go, outputs[i].region, outputs[i].was_blocked);
        compiled['cli'] += outputMapCli(outputs[i].service, outputs[i].method.cli, outputs[i].options.cli, outputs[i].region, outputs[i].was_blocked);
    }

    return compiled;
}

function analyseRequest(details) {
    var reqParams = {
        'boto3': {},
        'go': {},
        'cli': {}
    };
    var requestBody = null;
    var jsonRequestBody = null;
    var region = 'ap-southeast-2';

    try {
        requestBody = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes)));
        jsonRequestBody = JSON.parse(requestBody);
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
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=getPrivateImageList\?/g)) {
        if (jsonRequestBody['publicAndPrivate'] != true) {
            reqParams.boto3['Owner'] = ['self'];
            reqParams.cli['--owners'] = "self";
        }

        if ('imageType' in jsonRequestBody) {
            if (!'filters' in jsonRequestBody)
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
    }

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call\=createSecurityGroup\?/g)) {
        reqParams.boto3['GroupDescription'] = jsonRequestBody.groupDescription;
        reqParams.boto3['GroupName'] = jsonRequestBody.groupName;
        reqParams.cli['--description'] = jsonRequestBody.groupDescription;
        reqParams.cli['--group-name'] = jsonRequestBody.groupName;
        if ('vpcId' in jsonRequestBody) {
            reqParams.boto3['VpcId'] = jsonRequestBody.vpcId;
            reqParams.cli['--vpc-id'] = jsonRequestBody.vpcId;
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

        if (blocking)
            return {cancel: true};
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
            reqParams.boto3['IpPermissions'].push({
                'IpProtocol': ipPermission['ipProtocol'],
                'FromPort': ipPermission['fromPort'],
                'ToPort': ipPermission['toPort']
            });
            reqParams.cli['--ip-permissions'].push({
                'IpProtocol': ipPermission['ipProtocol'],
                'FromPort': ipPermission['fromPort'],
                'ToPort': ipPermission['toPort']
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

        if (blocking)
            return {cancel: true};
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

        if (blocking)
            return {cancel: true};
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

        if (blocking)
            return {cancel: true};
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
    }

    //--S3--//

    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/s3\/proxy/g)) {
        if (jsonRequestBody.operation == "ListObjects") {
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
        }
    }
}
