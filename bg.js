// awscr@ian.mn

var declared_services;
var compiled;
var go_first_output;
var recording = false;
var intercept = false;

function interpretGwtArg(tracker) {
    var index = parseInt(tracker.pipesplit[tracker.cursor]);
    if (index == 0) {
        tracker.cursor += 1;
        return {
            'value': null,
            'type': null
        }
    } else if (index < 0) {
        tracker.cursor += 1;
        return tracker.resolvedObjects[Math.abs(index)];
    }

    var arg_type = tracker.params[index];
    tracker.cursor += 1;

    if (arg_type == "amazonaws.console.common.dtos.Regions$Region/2677748408") {
        var ret = {
            'type': arg_type
        };
        tracker.resolvedObjects.push(ret);

        interpretGwtArg(tracker);
        tracker.cursor += 9;
        var region = tracker.params[parseInt(tracker.pipesplit[tracker.cursor])];
        tracker.cursor += 7;

        ret['value'] = region;

        return ret;
    } else if (arg_type == "java.lang.String/2004016611") {
        var ret = {
            'type': arg_type
        }
        tracker.resolvedObjects.push(ret);

        var val = tracker.params[parseInt(tracker.pipesplit[tracker.cursor])];
        tracker.cursor += 1;

        ret['value'] = val;

        return ret;
    } else if (arg_type == "java.util.ArrayList/4159755760") {
        var ret = {
            'type': arg_type
        }
        tracker.resolvedObjects.push(ret);

        var arr = [];
        var array_length = tracker.pipesplit[tracker.cursor];
        tracker.cursor += 1;

        for (var i=0; i<array_length; i++) {
            arr.push(interpretGwtArg(tracker));
        }

        ret['value'] = arr;

        return ret;
    } else if (arg_type == "amazonaws.console.vpc.dtos.FirewallRule/883972025") {
        var ret = {
            'type': arg_type
        }
        tracker.resolvedObjects.push(ret);

        var ruleId = parseInt(tracker.pipesplit[tracker.cursor]);
        tracker.cursor += 1;
        var protocol = parseInt(tracker.pipesplit[tracker.cursor]);
        tracker.cursor += 1;
        var portStart = parseInt(tracker.pipesplit[tracker.cursor]);
        tracker.cursor += 1;
        var portEnd = parseInt(tracker.pipesplit[tracker.cursor]);
        tracker.cursor += 1;
        var cidr = interpretGwtArg(tracker);
        interpretGwtArg(tracker);
        interpretGwtArg(tracker);
        var action = tracker.params[parseInt(tracker.pipesplit[tracker.cursor])];
        tracker.cursor += 1;
        var ruleDirection = tracker.params[parseInt(tracker.pipesplit[tracker.cursor])];
        tracker.cursor += 1;

        ret['value'] = ruleId;
        ret['ruleId'] = ruleId;
        ret['protocol'] = protocol;
        ret['portStart'] = portStart;
        ret['portEnd'] = portEnd;
        ret['cidr'] = cidr;
        ret['action'] = action;
        ret['ruleDirection'] = ruleDirection;

        return ret;
    } else {
        var ret = {
            'type': 'unknown'
        };
        tracker.resolvedObjects.push(ret);

        console.log("Unknown GWT type: " + arg_type);

        var val = tracker.pipesplit[tracker.cursor];
        tracker.cursor += 1;

        ret['value'] = val;

        return ret;
    }
}

function interpretGwtWireRequest(str) {
    var xsrfRequested = false;
    var args = [];

    if (!str) return {};
    if (str.split("|").length < 5) return {};

    var tracker = {
        'params': [null], // 1-indexed
        'cursor': 0,
        'args': [],
        'resolvedObjects': [null],
        'pipesplit': str.split("|")
    }

    if (parseInt(tracker.pipesplit[tracker.cursor]) != 7) {
        return {};
    }
    tracker.cursor += 1;

    if (parseInt(tracker.pipesplit[tracker.cursor]) == 2) {
        xsrfRequested = true;
    }
    tracker.cursor += 1;

    var param_count = parseInt(tracker.pipesplit[tracker.cursor]);

    for (var i=0; i<param_count; i++) {
        tracker.cursor += 1;
        tracker.params.push(tracker.pipesplit[tracker.cursor]);
    }
    tracker.cursor += 1;

    var endpoint = tracker.params[parseInt(tracker.pipesplit[tracker.cursor])];
    tracker.cursor += 1;
    var policy_file = tracker.params[parseInt(tracker.pipesplit[tracker.cursor])];
    tracker.cursor += 1;
    if (xsrfRequested) {
        tracker.cursor += 2;
    }
    var service = tracker.params[parseInt(tracker.pipesplit[tracker.cursor])];
    tracker.cursor += 1;
    var method = tracker.params[parseInt(tracker.pipesplit[tracker.cursor])];
    tracker.cursor += 1;
    var num_args = parseInt(tracker.pipesplit[tracker.cursor]);
    tracker.cursor += 1;

    if (service == "amazonaws.console.vpc.client.VpcConsoleService" && method == "modifyIngressRulesForNetworkACL") {
        args.push({
            'value': interpretGwtArg(tracker),
            'name': 'region'
        });

        args.push({
            'value': tracker.params[parseInt(tracker.pipesplit[tracker.cursor])],
            'name': 'aclId'
        });
        tracker.cursor += 1;

        args.push({
            'value': interpretGwtArg(tracker),
            'name': 'rules'
        });
    } else if (service == "amazonaws.console.vpc.client.VpcConsoleService" && method == "getVpcs") {
        args.push({
            'value': interpretGwtArg(tracker),
            'name': 'region'
        });

        args.push({
            'value': tracker.pipesplit[tracker.cursor],
            'name': 'null'
        });
        tracker.cursor += 1;
    }

    return {
        'endpoint': endpoint,
        'service': service,
        'method': method,
        'params': tracker.params,
        'params': tracker.resolvedObjects,
        'num_args': num_args,
        'args': args
    };
}

function MD5(e) {
    function h(a, b) {
        var c, d, e, f, g;
        e = a & 2147483648;
        f = b & 2147483648;
        c = a & 1073741824;
        d = b & 1073741824;
        g = (a & 1073741823) + (b & 1073741823);
        return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
    }

    function k(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & c | ~b & d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function l(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & d | c & ~d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function m(a, b, d, c, e, f, g) {
        a = h(a, h(h(b ^ d ^ c, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function n(a, b, d, c, e, f, g) {
        a = h(a, h(h(d ^ (b | ~c), e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function p(a) {
        var b = "",
            d = "",
            c;
        for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
        return b
    }
    var f = [],
        q, r, s, t, a, b, c, d;
    e = function(a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
        }
        return b
    }(e);
    f = function(b) {
        var a, c = b.length;
        a = c + 8;
        for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
        a = (g - g % 4) / 4;
        e[a] |= 128 << g % 4 * 8;
        e[d - 2] = c << 3;
        e[d - 1] = c >>> 29;
        return e
    }(e);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
    return (p(a) + p(b) + p(c) + p(d)).toLowerCase()
};

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

function ensureInitDeclaredJs(service, region) {
    if (!declared_services['js'].includes(service)) {
        var mappedservice = mapServiceJs(service);
        declared_services['js'].push(service);
        return `

var ${service} = new AWS.${mappedservice}({region: '${region}'});
`;
    }
    return '';
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

function processCfnParameter(param, spacing, index) {
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
    if (typeof param == "string") {
        if (param.startsWith("!Ref ") || param.startsWith("!GetAtt ")) {
            return `${param}`;
        }

        for (var i=0; i<index; i++) { // correlate
            if (tracked_resources[i].returnValues) {
                if (tracked_resources[i].returnValues.Ref == param) {
                    return "!Ref " + tracked_resources[i].logicalId;
                }
                if (tracked_resources[i].returnValues.GetAtt) {
                    for (var attr_name in tracked_resources[i].returnValues.GetAtt) {
                        if (tracked_resources[i].returnValues.GetAtt[attr_name] == param) {
                            return "!GetAtt " + tracked_resources[i].logicalId + "." + attr_name;
                        }
                    }
                }
            }
        }

        // TODO: Check for multiline |\n + indent

        return `"${param.replace(/\"/g,`\"`)}"`; // TODO: Check this works
    }
    if (Array.isArray(param)) {
        if (param.length == 0) {
            return '[]';
        }

        param.forEach(paramitem => {
            paramitems.push(processCfnParameter(paramitem, spacing + 4, index));
        });

        return `
` + ' '.repeat(spacing + 2) + "- " + paramitems.join(`
` + ' '.repeat(spacing + 2) + "- ")
    }
    if (typeof param == "object") {
        if (Object.keys(param).length === 0 && param.constructor === Object) {
            return "!Ref \"AWS::NoValue\"";
        }

        Object.keys(param).forEach(function (key) {
            var subvalue = processCfnParameter(param[key], spacing + 4, index);
            if (subvalue !== undefined) {
                paramitems.push(key + ": " + subvalue);
            }
        });

        return `
` + ' '.repeat(spacing + 4) + paramitems.join(`
` + ' '.repeat(spacing + 4))
    }
    
    return undefined;
}

function processJsParameter(param, spacing) {
    var paramitems = [];

    if (param === undefined || param === null)
        return undefined;
    if (typeof param == "boolean") {
        if (param)
            return "true";
        return "false";
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
            var item = processJsParameter(paramitem, spacing + 4);
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
            var item = processJsParameter(param[key], spacing + 4);
            if (item !== undefined) {
                paramitems.push(key + ": " + processJsParameter(param[key], spacing + 4));
            }
        });

        return `{
` + ' '.repeat(spacing + 4) + paramitems.join(`,
` + ' '.repeat(spacing + 4)) + `
` + ' '.repeat(spacing) + '}';
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

function outputMapJs(service, method, options, region, was_blocked) {
    var output = ensureInitDeclaredJs(service, region);
    var params = '';

    if (Object.keys(options).length) {
        for (option in options) {
            if (options[option] !== undefined) {
                var optionvalue = processJsParameter(options[option], 4);
                params += `
    ${option}: ${optionvalue},`;
            }
        }
        params = "{" + params.substring(0, params.length - 1) + `
}`; // remove last comma
    }



    output += `
${service}.${method}(${params});${was_blocked ? ' // blocked' : ''}`;

    return output;
}

function getResourceName(service, requestId) {
    return service.replace(/\-/g, "") + MD5(requestId).substring(0,7);
}

function outputMapCfn(index, service, type, options, region, was_blocked, logicalId) {
    var output = '';
    var params = '';

    if (Object.keys(options).length) {
        for (option in options) {
            if (options[option] !== undefined) {
                var optionvalue = processCfnParameter(options[option], 12, index);
                params += `
            ${option}: ${optionvalue}`;
            }
        }
        params += `
`;
    }

    output += `    ${logicalId}:${was_blocked ? ' # blocked' : ''}
        Type: "${type}"
        Properties:${params}
`;

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
`;

    return output;
}

function compileOutputs() {
    if (!outputs.length) {
        return {
            'boto3': '# No recorded actions yet',
            'go': '// No recorded actions yet',
            'cfn': '# No recorded actions yet',
            'cli': '# No recorded actions yet',
            'js': '// No recorded actions yet'
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
// Still a WIP, Request objects not yet implemented

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

`,
        'js': `// npm install aws-sdk

var AWS = require('aws-sdk');`
    }
    declared_services = {
        'boto3': [],
        'go': [],
        'js': []
    }
    go_first_output = true;

    for (var i=0; i<outputs.length; i++) {
        compiled['boto3'] += outputMapBoto3(outputs[i].service, outputs[i].method.boto3, outputs[i].options.boto3, outputs[i].region, outputs[i].was_blocked);
        compiled['go'] += outputMapGo(outputs[i].service, outputs[i].method.api, outputs[i].options.boto3, outputs[i].region, outputs[i].was_blocked);
        compiled['cli'] += outputMapCli(outputs[i].service, outputs[i].method.cli, outputs[i].options.cli, outputs[i].region, outputs[i].was_blocked);
        compiled['js'] += outputMapJs(outputs[i].service, lowerFirstChar(outputs[i].method.api), outputs[i].options.boto3, outputs[i].region, outputs[i].was_blocked);
    }
    compiled['js'] += `\n`;

    for (var i=0; i<tracked_resources.length; i++) {
        compiled['cfn'] += outputMapCfn(i, tracked_resources[i].service, tracked_resources[i].type, tracked_resources[i].options.cfn, tracked_resources[i].region, tracked_resources[i].was_blocked, tracked_resources[i].logicalId);
    }

    return compiled;
}

function mapServiceJs(service) {
    var service_mapping = {
        "acm": "ACM",
        "acm-pca": "ACMPCA",
        "apigateway": "APIGateway",
        "alexaforbusiness": "AlexaForBusiness",
        "appstream": "AppStream",
        "appsync": "AppSync",
        "application-autoscaling": "ApplicationAutoScaling",
        "athena": "Athena",
        "autoscaling": "AutoScaling",
        "autoscaling-plans": "AutoScalingPlans",
        "batch": "Batch",
        "budgets": "Budgets",
        "cur": "CUR",
        "cloud9": "Cloud9",
        "clouddirectory": "CloudDirectory",
        "cloudformation": "CloudFormation",
        "cloudfront": "CloudFront",
        "cloudhsm": "CloudHSM",
        "cloudhsmv2": "CloudHSMV2",
        "cloudsearch": "CloudSearch",
        "cloudsearchdomain": "CloudSearchDomain",
        "cloudsearch": "CloudSearch",
        "cloudtrail": "CloudTrail",
        "cloudwatch": "CloudWatch",
        "cloudwatchevents": "CloudWatchEvents",
        "cloudwatchlogs": "CloudWatchLogs",
        "codebuild": "CodeBuild",
        "codecommit": "CodeCommit",
        "codedeploy": "CodeDeploy",
        "codepipeline": "CodePipeline",
        "codestar": "CodeStar",
        "cognito-identity": "CognitoIdentity",
        "cognito-idp": "CognitoIdentityServiceProvider",
        "cognito-sync": "CognitoSync",
        "comprehend": "Comprehend",
        "config": "Config",
        "configservice": "ConfigService",
        "connect": "Connect",
        "costexplorer": "CostExplorer",
        "dax": "DAX",
        "dlm": "DLM",
        "dms": "DMS",
        "datapipeline": "DataPipeline",
        "devicefarm": "DeviceFarm",
        "directconnect": "DirectConnect",
        "ds": "DirectoryService",
        "discovery": "Discovery",
        "dynamodb": "DynamoDB",
        "dynamodbstreams": "DynamoDBStreams",
        "ec2": "EC2",
        "ecr": "ECR",
        "ecs": "ECS",
        "efs": "EFS",
        "eks": "EKS",
        "elb": "ELB",
        "elbv2": "ELBv2",
        "emr": "EMR",
        "es": "ES",
        "elasticache": "ElastiCache",
        "elasticbeanstalk": "ElasticBeanstalk",
        "elastictranscoder": "ElasticTranscoder",
        "fms": "FMS",
        "firehose": "Firehose",
        "gamelift": "GameLift",
        "glacier": "Glacier",
        "glue": "Glue",
        "greengrass": "Greengrass",
        "guardduty": "GuardDuty",
        "health": "Health",
        "iam": "IAM",
        "importexport": "ImportExport",
        "inspector": "Inspector",
        "iot1click-devices": "IoT1ClickDevicesService",
        "iot1click-projects": "IoT1ClickProjects",
        "iotanalytics": "IoTAnalytics",
        "iot-jobs-data": "IoTJobsDataPlane",
        "iot": "Iot",
        "iot-data": "IotData",
        "kms": "KMS",
        "kinesis": "Kinesis",
        "kinesisanalytics": "KinesisAnalytics",
        "kinesisvideo": "KinesisVideo",
        "kinesis-video-archived-media": "KinesisVideoArchivedMedia",
        "kinesis-video-media": "KinesisVideoMedia",
        "lambda": "Lambda",
        "lambda": "Lambda",
        "lex-models": "LexModelBuildingService",
        "lex-runtime": "LexRuntime",
        "lightsail": "Lightsail",
        "mq": "MQ",
        "mturk": "MTurk",
        "machinelearning": "MachineLearning",
        "macie": "Macie",
        "marketplacecommerceanalytics": "MarketplaceCommerceAnalytics",
        "marketplace-entitlement": "MarketplaceEntitlementService",
        "meteringmarketplace": "MarketplaceMetering",
        "mediaconvert": "MediaConvert",
        "medialive": "MediaLive",
        "mediapackage": "MediaPackage",
        "mediastore": "MediaStore",
        "mediastore-data": "MediaStoreData",
        "mediatailor": "MediaTailor",
        "metadataservice": "MetadataService",
        "mgh": "MigrationHub",
        "mobile": "Mobile",
        "mobileanalytics": "MobileAnalytics",
        "neptune": "Neptune",
        "opsworks": "OpsWorks",
        "opsworkscm": "OpsWorksCM",
        "organizations": "Organizations",
        "pi": "PI",
        "pinpoint": "Pinpoint",
        "polly": "Polly",
        "pricing": "Pricing",
        "rds": "RDS",
        "redshift": "Redshift",
        "rekognition": "Rekognition",
        "resource-groups": "ResourceGroups",
        "resourcegroupstaggingapi": "ResourceGroupsTaggingAPI",
        "route53": "Route53",
        "route53domains": "Route53Domains",
        "s3": "S3",
        "ses": "SES",
        "sms": "SMS",
        "sns": "SNS",
        "sqs": "SQS",
        "ssm": "SSM",
        "sts": "STS",
        "swf": "SWF",
        "sagemaker": "SageMaker",
        "sagemaker-runtime": "SageMakerRuntime",
        "secretsmanager": "SecretsManager",
        "serverlessrepo": "ServerlessApplicationRepository",
        "servicecatalog": "ServiceCatalog",
        "servicediscovery": "ServiceDiscovery",
        "shield": "Shield",
        "simpledb": "SimpleDB",
        "snowball": "Snowball",
        "stepfunctions": "StepFunctions",
        "storagegateway": "StorageGateway",
        "support": "Support",
        "temporarycredentials": "TemporaryCredentials",
        "transcribeservice": "TranscribeService",
        "translate": "Translate",
        "waf": "WAF",
        "waf-regional": "WAFRegional",
        "workdocs": "WorkDocs",
        "workmail": "WorkMail",
        "workspaces": "WorkSpaces",
        "xray": "XRay"
    };

    return service_mapping[service];
}

function lowerFirstChar(str) {
    return str.substring(0,1).toLowerCase() + str.substring(1);
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

function onAttach(tabId) {
    chrome.debugger.sendCommand({ //first enable the Network
        tabId: tabId
    }, "Network.enable");

    chrome.debugger.onEvent.addListener(allEventHandler);
}

function allEventHandler(debuggeeId, message, params) {
    if (message == "Network.requestWillBeSent") { // TODO: Fix race condition and bad potential breakage here
        for (var i=tracked_resources.length-1; i>=0; i--) {
            if (params.request.url == tracked_resources[i].requestDetails.url && Math.abs(params.wallTime-(tracked_resources[i].requestDetails.timeStamp/1000)) < 0.5) { // max 500ms between webRequest and debugger
                tracked_resources[i].debuggerRequestId = params.requestId;
                // dont break here, potentially many tracked resources to one call
            }
        }
    } else if (message == "Network.responseReceived") { // response return 
        chrome.debugger.sendCommand({
            tabId: debuggeeId.tabId
        }, "Network.getResponseBody", {
            "requestId": params.requestId
        }, function(response) {
            var body = response.body;

            if (response.base64Encoded) {
                body = window.atob(response.body);
            }
            
            for (var i=tracked_resources.length-1; i>=0; i--) {
                if (params.requestId == tracked_resources[i].debuggerRequestId) {
                    tracked_resources[i]["response"] = {
                        'timestamp': params.timestamp,
                        'properties': params.response,
                        'body': body
                    };
                    setOutputsForTrackedResource(i);
                }
            }

            for (var i=0; i<outputs.length; i++) { // TODO
                ;
            }
        });
    }
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.action == "getCompiledOutputs") {
            sendResponse(compileOutputs());
        } else if (message.action == "setBlockingOn") {
            blocking = true;
            sendResponse(true);
        } else if (message.action == "setBlockingOff") {
            blocking = false;
            sendResponse(true);
        } else if (message.action == "getBlockingStatus") {
            sendResponse(blocking);
        } else if (message.action == "setInterceptOn") {
            intercept = true;

            /* TODO: Check if required
            chrome.tabs.query(
                {
                    url: [
                        "*://*.console.aws.amazon.com/*",
                        "*://console.aws.amazon.com/*",
                        "*://*.amazonaws.com/*"
                    ]
                },
                function(tabArray) {
                    for (var i=0; i<tabArray.length; i++) {
                        var tab = tabArray[i];
                        chrome.debugger.attach({
                            tabId: tab.id
                        }, "1.2", onAttach.bind(null, tab.id));
                    }
                }
            );
            */

            sendResponse(true);
        } else if (message.action == "setInterceptOff") {
            intercept = false;

            /* TODO: Check if required
            chrome.debugger.onEvent.removeListener(allEventHandler);
            chrome.debugger.getTargets(function(targets) {
                for (var i=0; i<targets.length; i++) {
                    chrome.debugger.detach({ // have to construct the object?!?
                        'tabId': targets[i].tabId,
                        'extensionId': targets[i].extensionId,
                        'targetId': targets[i].id
                    });
                }
            });
            */

            sendResponse(true);
        } else if (message.action == "getInterceptStatus") {
            sendResponse(intercept);
        } else if (message.action == "setRecordingOn") {
            recording = true;

            chrome.webRequest.onBeforeRequest.addListener(
                analyseRequest,
                {urls: ["<all_urls>"]},
                ["requestBody","blocking"]
            );

            if (intercept && navigator.userAgent.search("Firefox") == -1) {
                chrome.tabs.query(
                    {
                        url: [
                            "*://*.console.aws.amazon.com/*",
                            "*://console.aws.amazon.com/*",
                            "*://*.amazonaws.com/*"
                        ]
                    },
                    function(tabArray) {
                        for (var i=0; i<tabArray.length; i++) {
                            var tab = tabArray[i];
                            chrome.debugger.attach({
                                tabId: tab.id
                            }, "1.2", onAttach.bind(null, tab.id));
                        }
                    }
                );
            }

            sendResponse(true);
        } else if (message.action == "setRecordingOff") {
            recording = false;

            chrome.webRequest.onBeforeRequest.removeListener(analyseRequest);

            if (intercept && navigator.userAgent.search("Firefox") == -1) {
                chrome.debugger.onEvent.removeListener(allEventHandler);
                chrome.debugger.getTargets(function(targets) {
                    for (var i=0; i<targets.length; i++) {
                        chrome.debugger.detach({ // have to construct the object?!?
                            'tabId': targets[i].tabId,
                            'extensionId': targets[i].extensionId,
                            'targetId': targets[i].id
                        });
                    }
                });
            }

            sendResponse(true);
        } else if (message.action == "getRecordingStatus") {
            sendResponse(recording);
        } else if (message.action == "clearData") {
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
    if (!str) return null;
    
    var pipesplit = str.split("|");

    var result = pipesplit[parseInt(index)];

    if (isNaN(result)) {
        return result;
    }

    return parseInt(result);
}

function setOutputsForTrackedResource(index) {
    var jsonRequestBody = {};

    try {
        jsonRequestBody = JSON.parse(tracked_resources[index].response.body);

        if (tracked_resources[index].type == "AWS::AmazonMQ::Broker") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.brokerId,
                'GetAtt': {
                    'Arn': jsonRequestBody.brokerArn
                }
            };
        } else if (tracked_resources[index].type == "AWS::AmazonMQ::Configuration") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.id,
                'GetAtt': {
                    'Arn': jsonRequestBody.arn,
                    'Revision': jsonRequestBody.latestRevision.revision
                }
            };
        } else if (tracked_resources[index].type == "AWS::ApiGateway::Account") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::ApiGateway::Authorizer") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.id
            };
        } else if (tracked_resources[index].type == "AWS::ApiGateway::DocumentationPart") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.id
            };
        } else if (tracked_resources[index].type == "AWS::ApiGateway::DomainName") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::ApiGateway::GatewayResponse") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::ApiGateway::Method") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::ApiGateway::Model") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.id
            };
        } else if (tracked_resources[index].type == "AWS::ApiGateway::UsagePlan") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.id
            };
        } else if (tracked_resources[index].type == "AWS::AppSync::ApiKey") {
            tracked_resources[index].returnValues = {
                'Ref': null,
                'GetAtt': {
                    'ApiKey': jsonRequestBody.apiKey.id
                }
            };
        } else if (tracked_resources[index].type == "AWS::AppSync::DataSource") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.dataSource.dataSourceArn,
                'GetAtt': {
                    'DataSourceArn': jsonRequestBody.dataSource.dataSourceArn,
                    'Name': jsonRequestBody.dataSource.name
                }
            };
        } else if (tracked_resources[index].type == "AWS::AppSync::GraphQLApi") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.graphqlApi.arn,
                'GetAtt': {
                    'GraphQLUrl': jsonRequestBody.graphqlApi.uris.GRAPHQL,
                    'Arn': jsonRequestBody.graphqlApi.arn,
                    'ApiId': jsonRequestBody.graphqlApi.apiId
                }
            };
        } else if (tracked_resources[index].type == "AWS::AppSync::GraphQLSchema") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.ApiId + "GraphQLSchema"
            };
        } else if (tracked_resources[index].type == "AWS::AppSync::Resolver") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.resolver.resolverArn,
                'GetAtt': {
                    'TypeName': jsonRequestBody.resolver.typeName,
                    'ResolverArn': jsonRequestBody.resolver.resolverArn,
                    'FieldName': jsonRequestBody.resolver.fieldName
                }
            };
        } else if (tracked_resources[index].type == "AWS::Athena::NamedQuery") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.Name
            };
        } else if (tracked_resources[index].type == "AWS::AutoScaling::AutoScalingGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.AutoScalingGroupName
            };
        } else if (tracked_resources[index].type == "AWS::AutoScaling::LaunchConfiguration") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.LaunchConfigurationName
            };
        } else if (tracked_resources[index].type == "AWS::AutoScaling::LifecycleHook") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.LifecycleHookName
            };
        } else if (tracked_resources[index].type == "AWS::AutoScaling::ScalingPolicy") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.PolicyARN
            };
        } else if (tracked_resources[index].type == "AWS::AutoScaling::ScheduledAction") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.ScheduledActionName
            };
        } else if (tracked_resources[index].type == "AWS::Batch::ComputeEnvironment") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.computeEnvironmentArn
            };
        } else if (tracked_resources[index].type == "AWS::Batch::JobDefinition") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.jobDefinitionArn
            };
        } else if (tracked_resources[index].type == "AWS::Batch::JobQueue") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.jobQueueArn
            };
        } else if (tracked_resources[index].type == "AWS::Budgets::Budget") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::CertificateManager::Certificate") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.certificateArn
            };
        } else if (tracked_resources[index].type == "AWS::CloudTrail::Trail") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.TrailName,
                'GetAtt': {
                    'Arn': jsonRequestBody.data.trailArn,
                    'SnsTopicArn': jsonRequestBody.data.snsTopicArn
                }
            };
        } else if (tracked_resources[index].type == "AWS::CodeDeploy::Application") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.ApplicationName
            };
        } else if (tracked_resources[index].type == "AWS::CodeDeploy::DeploymentConfig") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.DeploymentConfigName
            };
        } else if (tracked_resources[index].type == "AWS::CodeDeploy::DeploymentGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.DeploymentGroupName
            };
        } else if (tracked_resources[index].type == "AWS::CodePipeline::Pipeline") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.Name
            };
        } else if (tracked_resources[index].type == "AWS::Cognito::IdentityPool") {
            tracked_resources[index].returnValues = {
                'Ref': null,
                'GetAtt': {
                    'Name': tracked_resources[index].options.cfn.IdentityPoolName
                }
            };
        } else if (tracked_resources[index].type == "AWS::Cognito::UserPool") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.success.data.id,
                'GetAtt': {
                    //'ProviderName': jsonRequestBody.success.data.,
                    //'ProviderURL': jsonRequestBody.success.data.,
                    'Arn': jsonRequestBody.success.data.arn
                }
            };
        } else if (tracked_resources[index].type == "AWS::Cognito::UserPoolClient") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.success.data.id
            };
        } else if (tracked_resources[index].type == "AWS::Cognito::UserPoolGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.GroupName
            };
        } else if (tracked_resources[index].type == "AWS::Cognito::UserPoolUser") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.Username
            };
        } else if (tracked_resources[index].type == "AWS::Cognito::UserPoolUserToGroupAttachment") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::Config::ConfigurationAggregator") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.ConfigurationAggregatorName
            };
        } else if (tracked_resources[index].type == "AWS::Config::ConfigRule") {
            ; // TODO
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.ConfigRuleName,
                'GetAtt': {
                    //'Arn': jsonRequestBody.,
                    //'ConfigRuleId': jsonRequestBody.,
                    //'Compliance.Type': jsonRequestBody.
                }
            };
        } else if (tracked_resources[index].type == "AWS::DirectoryService::MicrosoftAD") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.DirectoryId
            };
        } else if (tracked_resources[index].type == "AWS::DirectoryService::SimpleAD") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.DirectoryId
            };
        } else if (tracked_resources[index].type == "AWS::EC2::CustomerGateway") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.CustomerGateway.CustomerGatewayId
            };
        } else if (tracked_resources[index].type == "AWS::EC2::EIP") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.PublicIp,
                'GetAtt': {
                    'AllocationId': jsonRequestBody.allocationId
                }
            };
        }  else if (tracked_resources[index].type == "AWS::EC2::EIPAssociation") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.associationId
            };
        } else if (tracked_resources[index].type == "AWS::EC2::EgressOnlyInternetGateway") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.egressOnlyInternetGateway.egressOnlyInternetGatewayId
            };
        } else if (tracked_resources[index].type == "AWS::EC2::FlowLog") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.flowLogIds[0]
            };
        } else if (tracked_resources[index].type == "AWS::EC2::Host") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::EC2::Instance") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.Instances[0].InstanceId,
                'GetAtt': {
                    'AvailabilityZone': jsonRequestBody.Instances[0].Placement.AvailabilityZone,
                    'PrivateDnsName': jsonRequestBody.Instances[0].PrivateDnsName,
                    'PublicDnsName': jsonRequestBody.Instances[0].PublicDnsName,
                    'PrivateIp': jsonRequestBody.Instances[0].PrivateIpAddress
                }
            };
        } else if (tracked_resources[index].type == "AWS::EC2::InternetGateway") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.internetGateway.internetGatewayId
            };
        } else if (tracked_resources[index].type == "AWS::EC2::LaunchTemplate") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.launchTemplate.launchTemplateId,
                'GetAtt': {
                    'LatestVersionNumber': jsonRequestBody.launchTemplate.latestVersionNumber,
                    'DefaultVersionNumber': jsonRequestBody.launchTemplate.defaultVersionNumber
                }
            };
        } else if (tracked_resources[index].type == "AWS::EC2::NatGateway") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.natGateway.natGatewayId
            };
        } else if (tracked_resources[index].type == "AWS::EC2::NetworkAcl") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::EC2::NetworkAclEntry") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::EC2::NetworkInterface") {
            var secondaryIpAddresses = [];
            for (var i=0; i<jsonRequestBody.networkInterface.privateIpAddresses.length; i++) {
                if (!jsonRequestBody.networkInterface.privateIpAddresses[i].primary) {
                    secondaryIpAddresses.push(jsonRequestBody.networkInterface.privateIpAddresses[i].privateIpAddress);
                }
            }

            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.networkInterface.networkInterfaceId,
                'GetAtt': {
                    'PrimaryPrivateIpAddress': jsonRequestBody.networkInterface.privateIpAddress,
                    'SecondaryPrivateIpAddresses': secondaryIpAddresses
                }
            };
        } else if (tracked_resources[index].type == "AWS::EC2::RouteTable") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::EC2::SecurityGroup") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.securityGroupId,
                'GetAtt': {
                    'GroupId': jsonRequestBody.securityGroupId
                }
            };
        } else if (tracked_resources[index].type == "AWS::EC2::Subnet") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.Subnet.SubnetId,
                'GetAtt': {
                    'AvailabilityZone': jsonRequestBody.Subnet.AvailabilityZone,
                    'Ipv6CidrBlocks': jsonRequestBody.Subnet.ipv6CidrBlockAssociationSet,
                    //'NetworkAclAssociationId': jsonRequestBody.Subnet.,
                    'VpcId': jsonRequestBody.Subnet.VpcId
                }
            };
        } else if (tracked_resources[index].type == "AWS::EC2::VPC") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::EC2::VPCCidrBlock") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::EC2::VPCDHCPOptionsAssociation") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::EC2::VPNGateway") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.VpnGateway.VpnGatewayId
            };
        } else if (tracked_resources[index].type == "AWS::EFS::FileSystem") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.fileSystemId
            };
        } else if (tracked_resources[index].type == "AWS::EFS::MountTarget") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.mountTargetId
            };
        } else if (tracked_resources[index].type == "AWS::ElastiCache::CacheCluster") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.actionResponses[0].data.replicationGroupId,
                'GetAtt': {
                    //'ConfigurationEndpoint.Address': jsonRequestBody.actionResponses[0].data.,
                    //'ConfigurationEndpoint.Port': jsonRequestBody.actionResponses[0].data.,
                    //'RedisEndpoint.Address': jsonRequestBody.actionResponses[0].data.,
                    //'RedisEndpoint.Port': jsonRequestBody.actionResponses[0].data.
                }
            };
        } else if (tracked_resources[index].type == "AWS::ElastiCache::ParameterGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.boto3.CacheParameterGroupName
            };
        } else if (tracked_resources[index].type == "AWS::ElastiCache::SubnetGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.boto3.CacheSubnetGroupName
            };
        } else if (tracked_resources[index].type == "AWS::ElasticLoadBalancing::LoadBalancer") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.LoadBalancerName,
                'GetAtt': {
                    //'CanonicalHostedZoneName': jsonRequestBody.securityGroupId,
                    //'CanonicalHostedZoneNameID': jsonRequestBody.securityGroupId,
                    'DNSName': jsonRequestBody.dnsName
                    //'SourceSecurityGroup.GroupName': jsonRequestBody.securityGroupId,
                    //'SourceSecurityGroup.OwnerAlias': jsonRequestBody.securityGroupId
                }
            };
        } else if (tracked_resources[index].type == "AWS::ElasticLoadBalancingV2::Listener") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.listeners[0].listenerArn
            };
        } else if (tracked_resources[index].type == "AWS::ElasticLoadBalancingV2::ListenerRule") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.rules[0].ruleArn
            };
        } else if (tracked_resources[index].type == "AWS::ElasticLoadBalancingV2::LoadBalancer") {
            var lb_name_parts = jsonRequestBody.loadBalancers[0].loadBalancerArn.split("/").shift();
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.loadBalancers[0].loadBalancerArn,
                'GetAtt': {
                    'CanonicalHostedZoneID': jsonRequestBody.loadBalancers[0].hostedZoneId,
                    'DNSName': jsonRequestBody.loadBalancers[0].dnsName,
                    'LoadBalancerFullName': lb_name_parts.join("/"),
                    'LoadBalancerName': jsonRequestBody.loadBalancers[0].loadBalancerName,
                    'SecurityGroups': tracked_resources[index].options.cfn.SecurityGroups
                }
            };
        } else if (tracked_resources[index].type == "AWS::ElasticLoadBalancingV2::TargetGroup") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.targetGroups[0].arn,
                'GetAtt': {
                    'LoadBalancerArns': jsonRequestBody.targetGroups[0].loadBalancerArn,
                    'TargetGroupFullName': jsonRequestBody.targetGroups[0].loadBalancerArn.split(":").pop(),
                    'TargetGroupName': jsonRequestBody.targetGroups[0].name
                }
            };
        } else if (tracked_resources[index].type == "AWS::Elasticsearch::Domain") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.DomainStatus.DomainId,
                'GetAtt': {
                    'DomainArn': jsonRequestBody.DomainStatus.ARN,
                    'DomainEndpoint': jsonRequestBody.DomainStatus.Endpoint
                }
            };
        } else if (tracked_resources[index].type == "AWS::Events::Rule") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::GameLift::Alias") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::GameLift::Build") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::GameLift::Fleet") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::Glue::Classifier") {
            var ref = null;
            if (tracked_resources[index].options.cfn.GrokClassifier) {
                ref = tracked_resources[index].options.cfn.GrokClassifier.Name;
            }
            if (tracked_resources[index].options.cfn.JsonClassifier) {
                ref = tracked_resources[index].options.cfn.JsonClassifier.Name;
            }
            if (tracked_resources[index].options.cfn.XMLClassifier) {
                ref = tracked_resources[index].options.cfn.XMLClassifier.Name;
            }

            tracked_resources[index].returnValues = {
                'Ref': ref
            };
        } else if (tracked_resources[index].type == "AWS::Glue::Connection") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.ConnectionInput
            };
        } else if (tracked_resources[index].type == "AWS::Glue::Table") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.TableInput
            };
        } else if (tracked_resources[index].type == "AWS::GuardDuty::Detector") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.detectorId
            };
        } else if (tracked_resources[index].type == "AWS::GuardDuty::IPSet") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.ipSetId
            };
        } else if (tracked_resources[index].type == "AWS::GuardDuty::Member") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.MemberId
            };
        } else if (tracked_resources[index].type == "AWS::IAM::User") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.name,
                'GetAtt': {
                    //'Arn': jsonRequestBody.
                }
            };
        } else if (tracked_resources[index].type == "AWS::IAM::UserToGroupAddition") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::Inspector::AssessmentTarget") {
            tracked_resources[index].returnValues = {
                'Ref': null,
                'GetAtt': {
                    'Arn': jsonRequestBody.assessmentTargetArn
                }
            };
        } else if (tracked_resources[index].type == "AWS::Inspector::AssessmentTemplate") {
            tracked_resources[index].returnValues = {
                'Ref': null,
                'GetAtt': {
                    'Arn': jsonRequestBody.assessmentTemplateArn
                }
            };
        } else if (tracked_resources[index].type == "AWS::Inspector::ResourceGroup") {
            tracked_resources[index].returnValues = {
                'Ref': null,
                'GetAtt': {
                    'Arn': jsonRequestBody.resourceGroupArn
                }
            };
        } else if (tracked_resources[index].type == "AWS::Kinesis::Stream") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::KinesisFirehose::DeliveryStream") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::Lambda::Alias") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.arn
            };
        } else if (tracked_resources[index].type == "AWS::Lambda::Function") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.FunctionName,
                'GetAtt': {
                    'Arn': jsonRequestBody.FunctionArn
                }
            };
        } else if (tracked_resources[index].type == "AWS::Lambda::Version") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.functionArn,
                'GetAtt': {
                    'Version': jsonRequestBody.version
                }
            };
        } else if (tracked_resources[index].type == "AWS::Logs::LogGroup") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::Logs::LogStream") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::Logs::MetricFilter") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::Logs::SubscriptionFilter") {
            ; // TODO
        } else if (tracked_resources[index].type == "XXXXX") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.StackId,
                'GetAtt': {
                    'GroupId': jsonRequestBody.securityGroupId
                }
            };
        } else if (tracked_resources[index].type == "AWS::OpsWorks::App") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.AppId
            };
        } else if (tracked_resources[index].type == "AWS::OpsWorks::ElasticLoadBalancerAttachment") {
            tracked_resources[index].returnValues = null
        } else if (tracked_resources[index].type == "AWS::OpsWorks::Instance") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.InstanceId
            };
        } else if (tracked_resources[index].type == "AWS::OpsWorks::Layer") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.LayerId
            };
        } else if (tracked_resources[index].type == "AWS::OpsWorks::Stack") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.StackId
            };
        } else if (tracked_resources[index].type == "AWS::OpsWorks::UserProfile") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.IamUserArn,
                'GetAtt': {
                    //'SshUsername': jsonRequestBody.
                }
            };
        } else if (tracked_resources[index].type == "AWS::OpsWorks::Volume") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.VolumeId
            };
        } else if (tracked_resources[index].type == "AWS::RDS::DBClusterParameterGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.boto3.DBClusterParameterGroupName
            };
        } else if (tracked_resources[index].type == "AWS::RDS::DBInstance") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.actionResponses[0].data.DBInstanceIdentifier,
                'GetAtt': {
                    //'Endpoint.Address': jsonRequestBody.,
                    //'Endpoint.Port': jsonRequestBody.
                }
            };
        } else if (tracked_resources[index].type == "AWS::RDS::DBParameterGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.boto3.DBParameterGroupName
            };
        } else if (tracked_resources[index].type == "AWS::RDS::DBSubnetGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.DBSubnetGroupName
            };
        } else if (tracked_resources[index].type == "AWS::RDS::EventSubscription") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.boto3.SubscriptionName
            };
        } else if (tracked_resources[index].type == "AWS::RDS::OptionGroup") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.actionResponses[0].data.optionGroupName
            };
        } else if (tracked_resources[index].type == "AWS::Redshift::Cluster") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.cfn.ClusterIdentifier,
                'GetAtt': {
                    //'Endpoint.Address': jsonRequestBody.
                    //'Endpoint.Port': jsonRequestBody.
                }
            };
        } else if (tracked_resources[index].type == "AWS::Redshift::ClusterParameterGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.boto3.ParameterGroupName
            };
        } else if (tracked_resources[index].type == "AWS::Redshift::ClusterSubnetGroup") {
            tracked_resources[index].returnValues = {
                'Ref': tracked_resources[index].options.boto3.ClusterSubnetGroupName
            };
        } else if (tracked_resources[index].type == "AWS::Route53::HostedZone") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::S3::Bucket") {
            tracked_resources[index].returnValues = {
                'Ref': null,
                'GetAtt': {
                    'Arn': "arn:aws:s3:::" + tracked_resources[index].options.cfn.BucketName
                    //'DomainName': jsonRequestBody.,
                    //'DualStackDomainName': jsonRequestBody.,
                    //'WebsiteURL': jsonRequestBody.
                }
            };
        } else if (tracked_resources[index].type == "AWS::SNS::Subscription") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::SNS::Topic") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.CreateTopicResponse.topicArn,
                'GetAtt': {
                    'TopicName': tracked_resources[index].options.cfn.TopicName
                }
            };
        } else if (tracked_resources[index].type == "AWS::SNS::TopicPolicy") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::SQS::Queue") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SQS::QueuePolicy") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SSM::Association") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SSM::Document") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SSM::MaintenanceWindow") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SSM::MaintenanceWindowTarget") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SSM::MaintenanceWindowTask") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SSM::Parameter") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SSM::PatchBaseline") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::SSM::ResourceDataSync") {
            ; // TODO
        } else if (tracked_resources[index].type == "AWS::ServiceCatalog::CloudFormationProduct") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.provisioningArtifactDetail.id,
                'GetAtt': {
                    'ProductName': jsonRequestBody.provisioningArtifactDetail.name,
                    'ProvisioningArtifactIds': [jsonRequestBody.provisioningArtifactDetail.id],
                    'ProvisioningArtifactNames': [jsonRequestBody.provisioningArtifactDetail.name]
                }
            };
        } else if (tracked_resources[index].type == "AWS::ServiceCatalog::Portfolio") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.portfolioDetail.id,
                'GetAtt': {
                    'PortfolioName': jsonRequestBody.portfolioDetail.displayName
                }
            };
        } else if (tracked_resources[index].type == "AWS::ServiceCatalog::PortfolioPrincipalAssociation") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::ServiceCatalog::PortfolioProductAssociation") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::ServiceCatalog::PortfolioShare") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::ServiceCatalog::TagOption") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.tagOptionDetail.id
            };
        } else if (tracked_resources[index].type == "AWS::ServiceCatalog::TagOptionAssociation") {
            tracked_resources[index].returnValues = null;
        } else if (tracked_resources[index].type == "AWS::WAF::ByteMatchSet") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.ByteMatchSet.ByteMatchSetId
            };
        } else if (tracked_resources[index].type == "AWS::WAF::IPSet") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.IPSet.IPSetId
            };
        } else if (tracked_resources[index].type == "AWS::WAF::Rule") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.Rule.RuleId
            };
        } else if (tracked_resources[index].type == "AWS::WAF::SizeConstraintSet") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.SizeConstraintSet.SizeConstraintSetId
            };
        } else if (tracked_resources[index].type == "AWS::WAF::SqlInjectionMatchSet") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.SqlInjectionMatchSet.SqlInjectionMatchSetId
            };
        } else if (tracked_resources[index].type == "AWS::WAF::WebACL") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.WebACL.WebACLId
            };
        } else if (tracked_resources[index].type == "AWS::WAF::XssMatchSet") {
            tracked_resources[index].returnValues = {
                'Ref': jsonRequestBody.XssMatchSet.XssMatchSetId
            };
        } else if (tracked_resources[index].type == "AWS::WorkSpaces::Workspace") {
            ; // TODO
        }
    } catch(err) {;}
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
    var region = 'us-east-1';
    var gwtRequest = {};

    // Firefox
    if (intercept && navigator.userAgent.search("Firefox") > -1) {
        let filter = browser.webRequest.filterResponseData(details.requestId);
        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();
        var responseBody = "";

        filter.ondata = event => {
            filter.write(event.data);
           
            responseBody += decoder.decode(event.data, {stream: true});
        }

        filter.onstop = event => {
            filter.disconnect();

            console.log(responseBody);

            for (var i=tracked_resources.length-1; i>=0; i--) {
                if (details.requestId == tracked_resources[i].requestDetails.requestId) {
                    tracked_resources[i]["response"] = {
                        'timestamp': null,
                        'properties': null,
                        'body': responseBody
                    };
                    setOutputsForTrackedResource(i);
                }
            }

            for (var i=0; i<outputs.length; i++) { // TODO
                ;
            }
        }
    }

    var region_check = /.+\/\/([a-zA-Z0-9-]+)\.console\.aws\.amazon\.com/g.exec(details.url);
    if (region_check && region_check[1]) {
        region = region_check[1];
    } else {
        region_check = /.+\/\/[a-z0-9-]+.([a-zA-Z0-9-]+)\.amazonaws\.com/g.exec(details.url);
        if (region_check && region_check[1]) {
            region = region_check[1];
        }
    }

    try {
        try {
            requestBody = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes)));
            requestBody = requestBody.replace(/\"X-CSRF-TOKEN\"\:\"\[\{[a-zA-Z0-9-_",=+:/]+\}\]\"\,/g,""); // double-quote bug, remove CSRF token
        } catch(e) {
            try {
                requestBody = JSON.stringify(details.requestBody.formData);
            } catch(e) {;}
        }
    
        try {
            jsonRequestBody = JSON.parse(requestBody);
        } catch(e) {
            gwtRequest = interpretGwtWireRequest(requestBody);
        }

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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'requestDetails': details,
            'was_blocked': blocking
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::SecurityGroup',
            'options': reqParams,
            'requestDetails': details,
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
            'requestDetails': details,
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
            'requestDetails': details,
            'was_blocked': blocking
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::Instance',
            'options': reqParams,
            'requestDetails': details,
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
            'requestDetails': details,
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('s3', details.requestId),
            'region': region,
            'service': 's3',
            'type': 'AWS::S3::Bucket',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        return {};
    }

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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('efs', details.requestId),
            'region': region,
            'service': 'efs',
            'type': 'AWS::EFS::FileSystem',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('efs', details.requestId),
            'region': region,
            'service': 'efs',
            'type': 'AWS::EFS::MountTarget',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('cloudtrail', details.requestId),
            'region': region,
            'service': 'cloudtrail',
            'type': 'AWS::CloudTrail::Trail',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('guardduty', details.requestId),
            'region': region,
            'service': 'guardduty',
            'type': 'AWS::GuardDuty::Detector',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.GetDetector
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.GetFindingsStatistics
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.CreateMembers
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('guardduty', details.requestId),
            'region': region,
            'service': 'guardduty',
            'type': 'AWS::GuardDuty::Member',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:guardduty:guardduty.DeleteMembers
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:guardduty:guardduty.ListIPSets
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:guardduty:guardduty.ListThreatIntelSets
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:guardduty:iam.ListPolicyVersions
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('guardduty', details.requestId),
            'region': region,
            'service': 'guardduty',
            'type': 'AWS::GuardDuty::IPSet',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
                'options': reqParams,
            'requestDetails': details
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
                'options': reqParams,
            'requestDetails': details
            });
        }

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('mq', details.requestId),
            'region': region,
            'service': 'mq',
            'type': 'AWS::AmazonMQ::Broker',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('mq', details.requestId),
            'region': region,
            'service': 'mq',
            'type': 'AWS::AmazonMQ::Configuration',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::LaunchTemplate',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
                'options': reqParams,
            'requestDetails': details
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
                'options': reqParams,
            'requestDetails': details
            });
        }

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::NetworkInterface',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::EIP',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::EIPAssociation',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        for (var i=0; i<jsonRequestBody.quantity; i++) {
            tracked_resources.push({
                'logicalId': getResourceName('ec2', details.requestId),
                'region': region,
                'service': 'ec2',
                'type': 'AWS::EC2::Host',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });
        }

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeRegions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService" && gwtRequest['method'] == "getRegions") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRegions',
                'boto3': 'describe_regions',
                'cli': 'describe-regions'
            },
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeDhcpOptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getDHCPOptions" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeDhcpOptions',
                'boto3': 'describe_dhcp_options',
                'cli': 'describe-dhcp-options'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcAttribute
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService" && gwtRequest['method'] == "getVpcAttributes") {
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2ux\.elasticconsole\.generated\.ElasticConsoleBackendGenerated\.MergedDescribeSubnets\?/g) && gwtRequest['method'] == "getVpcs") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeRouteTables
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService" && gwtRequest['method'] == "getRouteTables") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRouteTables',
                'boto3': 'describe_route_tables',
                'cli': 'describe-route-tables'
            },
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeDhcpOptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getDHCPOptions" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeDhcpOptions',
                'boto3': 'describe_dhcp_options',
                'cli': 'describe-dhcp-options'
            },
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeNetworkAcls
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getNetworkACLs" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeNetworkAcls',
                'boto3': 'describe_network_acls',
                'cli': 'describe-network-acls'
            },
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateVpc
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "createVpc" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::VPC',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });
        
        for (var resource_id in jsonRequestBody.ResourceIds) {
            reqParams.cfn['ResourceId'] = resource_id;
            reqParams.cfn['TrafficType'] = jsonRequestBody.TrafficType;
            reqParams.cfn['ResourceType'] = jsonRequestBody.ResourceType;
            reqParams.cfn['LogDestinationType'] = jsonRequestBody.LogDestinationType;
            reqParams.cfn['LogDestination'] = jsonRequestBody.LogDestination;
            reqParams.cfn['DeliverLogsPermissionArn'] = jsonRequestBody.DeliverLogsPermissionArn;

            tracked_resources.push({
                'logicalId': getResourceName('ec2', details.requestId),
                'region': region,
                'service': 'ec2',
                'type': 'AWS::EC2::FlowLog',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });
        }

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeInstances
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "modifyDHCPOptions" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService" && gwtRequest['method'] == "getInstancesForVPC" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeInstances',
                'boto3': 'describe_instances',
                'cli': 'describe-instances'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteVpc
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "deleteVpc" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.CreateRouteTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "createRouteTable" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::RouteTable',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeRouteTables
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getRouteTables" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRouteTables',
                'boto3': 'describe_route_tables',
                'cli': 'describe-route-tables'
            },
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::EgressOnlyInternetGateway',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::InternetGateway',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DeleteRouteTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "deleteRouteTable" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::NatGateway',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.CreateNetworkAcl
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "createNetworkACL" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::NetworkAcl',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DeleteNetworkAcl
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "deleteNetworkACL" && gwtRequest['service'] == "amazonaws.console.vpc.client.VpcConsoleService") {
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::CustomerGateway',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::VPNGateway',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:sqs:sqs.ListQueues
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonSQS$/g) && gwtRequest['service'] == "com.amazonaws.console.sqs.shared.services.AmazonSQSService" && gwtRequest['method'] == "listQueues") {

        outputs.push({
            'region': region,
            'service': 'sqs',
            'method': {
                'api': 'ListQueues',
                'boto3': 'list_queues',
                'cli': 'list-queues'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:sqs:kms.ListKeys
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonKMS$/g) && gwtRequest['method'] == "listKeys" && gwtRequest['service'] == "com.amazonaws.console.sqs.shared.services.AmazonKMSService") {

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'ListKeys',
                'boto3': 'list_keys',
                'cli': 'list-keys'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:sqs:sqs.DeleteQueue
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonSQS$/g) && gwtRequest['method'] == "createQueue" && gwtRequest['service'] == "com.amazonaws.console.sqs.shared.services.AmazonSQSService" && gwtRequest['method'] == "deleteQueue" && gwtRequest['service'] == "com.amazonaws.console.sqs.shared.services.AmazonSQSService") {
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::IAM::User',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.AttachUserPolicy
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/attachments$/g)) {
        reqParams.boto3['PolicyArn'] = jsonRequestBody.policyArn;
        reqParams.cli['--policy-arn'] = jsonRequestBody.policyArn;
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'AttachUserPolicy',
                'boto3': 'attach_user_policy',
                'cli': 'attach-user-policy'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.AddUserToGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/groups\/.+\/members$/g)) {
        reqParams.boto3['UserName'] = jsonRequestBody.userName;
        reqParams.cli['--user-name'] = jsonRequestBody.userName;
        reqParams.boto3['GroupName'] = /.+console\.aws\.amazon\.com\/iam\/api\/groups\/(.+)\//g.exec(details.url)[1];
        reqParams.cli['--group-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/groups\/(.+)\//g.exec(details.url)[1];

        reqParams.cfn['Users'] = [jsonRequestBody.userName];
        reqParams.cfn['GroupName'] = /.+console\.aws\.amazon\.com\/iam\/api\/groups\/(.+)\//g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'AddUserToGroup',
                'boto3': 'add_user_to_group',
                'cli': 'add-user-to-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::IAM::UserToGroupAddition',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.ListGroupsForUser
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/groups$/g)) {
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListGroupsForUser',
                'boto3': 'list_groups_for_user',
                'cli': 'list-groups-for-user'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:iam.ListAccessKeys
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/accessKeys$/g)) {
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListAccessKeys',
                'boto3': 'list_access_keys',
                'cli': 'list-access-keys'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:iam.GetLoginProfile
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/loginProfile$/g)) {
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'GetLoginProfile',
                'boto3': 'get_login_profile',
                'cli': 'get-login-profile'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:iam.CreateLoginProfile
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/loginProfile$/g)) {
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\//g.exec(details.url)[1];
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:iam.GetUser
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/[^/]+$/g)) {
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)$/g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)$/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'GetUser',
                'boto3': 'get_user',
                'cli': 'get-user'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:iam.DeleteUser
    if (details.method == "DELETE" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/[^/]+$/g)) {
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)$/g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)$/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'DeleteUser',
                'boto3': 'delete_user',
                'cli': 'delete-user'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.GetAccount
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.operation == "getAccount" && jsonRequestBody.method == "GET" && jsonRequestBody.path == "/account") {

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetAccount',
                'boto3': 'get_account',
                'cli': 'get-account'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetRestApis
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path == "/restapis") {
        reqParams.boto3['Limit'] = jsonRequestBody.params.limit;
        reqParams.cli['--limit'] = jsonRequestBody.params.limit;

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetRestApis',
                'boto3': 'get_rest_apis',
                'cli': 'get-rest-apis'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetRestApi
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+$/g)) {
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetRestApi',
                'boto3': 'get_rest_api',
                'cli': 'get-rest-api'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetAuthorizers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/authorizers$/g) && jsonRequestBody.method == "GET") {
        reqParams.boto3['Limit'] = jsonRequestBody.params.limit;
        reqParams.cli['--limit'] = jsonRequestBody.params.limit;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetAuthorizers',
                'boto3': 'get_authorizers',
                'cli': 'get-authorizers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetRequestValidators
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/requestvalidators$/g) && jsonRequestBody.method == "GET") {
        reqParams.boto3['Limit'] = jsonRequestBody.params.limit;
        reqParams.cli['--limit'] = jsonRequestBody.params.limit;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetRequestValidators',
                'boto3': 'get_request_validators',
                'cli': 'get-request-validators'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetDocumentationParts
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/documentation\/parts$/g)) {
        reqParams.boto3['Limit'] = jsonRequestBody.params.limit;
        reqParams.cli['--limit'] = jsonRequestBody.params.limit;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetDocumentationParts',
                'boto3': 'get_documentation_parts',
                'cli': 'get-documentation-parts'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetResources
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/resources$/g) && jsonRequestBody.method == "GET") {
        reqParams.boto3['Embed'] = jsonRequestBody.params.embed;
        reqParams.cli['--embed'] = jsonRequestBody.params.embed;
        reqParams.boto3['Limit'] = jsonRequestBody.params.limit;
        reqParams.cli['--limit'] = jsonRequestBody.params.limit;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetResources',
                'boto3': 'get_resources',
                'cli': 'get-resources'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetStages
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/stages$/g)) {
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetStages',
                'boto3': 'get_stages',
                'cli': 'get-stages'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetUsagePlans
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path == "/usageplans" && jsonRequestBody.method == "GET") {
        reqParams.boto3['Limit'] = jsonRequestBody.params.limit;
        reqParams.cli['--limit'] = jsonRequestBody.params.limit;

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetUsagePlans',
                'boto3': 'get_usage_plans',
                'cli': 'get-usage-plans'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.PutMethod
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/resources\/[a-zA-Z0-9]+\/methods\/[A-Z]+$/g) && jsonRequestBody.method == "PUT") {
        reqParams.boto3['AuthorizationType'] = jsonRequestBody.contentString.authorizationType;
        reqParams.cli['--authorization-type'] = jsonRequestBody.contentString.authorizationType;
        reqParams.boto3['RequestParameters'] = jsonRequestBody.contentString.requestParameters;
        reqParams.cli['--request-parameters'] = jsonRequestBody.contentString.requestParameters;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['ResourceId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--resource-id'] = jsonRequestBody.path.split("/")[4];
        reqParams.boto3['HttpMethod'] = jsonRequestBody.path.split("/")[6];
        reqParams.cli['--http-method'] = jsonRequestBody.path.split("/")[6];

        reqParams.cfn['AuthorizationType'] = jsonRequestBody.contentString.authorizationType;
        reqParams.cfn['RequestParameters'] = jsonRequestBody.contentString.requestParameters;
        reqParams.cfn['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cfn['ResourceId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cfn['HttpMethod'] = jsonRequestBody.path.split("/")[6];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'PutMethod',
                'boto3': 'put_method',
                'cli': 'put-method'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::Method',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.PutMethodResponse
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/resources\/[a-zA-Z0-9]+\/methods\/[A-Z]+\/responses\/[0-9]+$/g) && jsonRequestBody.method == "PUT") {
        reqParams.boto3['ResponseModels'] = jsonRequestBody.contentString.responseModels;
        reqParams.cli['--response-models'] = jsonRequestBody.contentString.responseModels;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['ResourceId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--resource-id'] = jsonRequestBody.path.split("/")[4];
        reqParams.boto3['HttpMethod'] = jsonRequestBody.path.split("/")[6];
        reqParams.cli['--http-method'] = jsonRequestBody.path.split("/")[6];
        reqParams.boto3['StatusCode'] = jsonRequestBody.path.split("/")[8];
        reqParams.cli['--status-code'] = jsonRequestBody.path.split("/")[8];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'PutMethodResponse',
                'boto3': 'put_method_response',
                'cli': 'put-method-response'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:lambda.ListFunctions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/lambda$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path == "/2015-03-31/functions/") {

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'ListFunctions',
                'boto3': 'list_functions',
                'cli': 'list-functions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.PutIntegration
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "PUT" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/resources\/[a-zA-Z0-9]+\/methods\/[A-Z]+\/integration$/g)) {
        reqParams.boto3['Type'] = jsonRequestBody.contentString.type;
        reqParams.cli['--type'] = jsonRequestBody.contentString.type;
        reqParams.boto3['RequestTemplates'] = jsonRequestBody.contentString.requestTemplates;
        reqParams.cli['--request-templates'] = jsonRequestBody.contentString.requestTemplates;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['ResourceId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--resource-id'] = jsonRequestBody.path.split("/")[4];
        reqParams.boto3['HttpMethod'] = jsonRequestBody.path.split("/")[6];
        reqParams.cli['--http-method'] = jsonRequestBody.path.split("/")[6];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'PutIntegration',
                'boto3': 'put_integration',
                'cli': 'put-integration'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.PutIntegrationResponse
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "PUT" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/resources\/[a-zA-Z0-9]+\/methods\/[A-Z]+\/integration\/responses\/[0-9]+$/g)) {
        reqParams.boto3['ResponseTemplates'] = jsonRequestBody.contentString.responseTemplates;
        reqParams.cli['--response-templates'] = jsonRequestBody.contentString.responseTemplates;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['ResourceId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--resource-id'] = jsonRequestBody.path.split("/")[4];
        reqParams.boto3['HttpMethod'] = jsonRequestBody.path.split("/")[6];
        reqParams.cli['--http-method'] = jsonRequestBody.path.split("/")[6];
        reqParams.boto3['StatusCode'] = jsonRequestBody.path.split("/")[9];
        reqParams.cli['--status-code'] = jsonRequestBody.path.split("/")[9];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'PutIntegrationResponse',
                'boto3': 'put_integration_response',
                'cli': 'put-integration-response'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.CreateDocumentationPart
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/documentation\/parts$/g) && jsonRequestBody.method == "POST") {
        reqParams.boto3['Properties'] = jsonRequestBody.contentString.properties;
        reqParams.cli['--properties'] = jsonRequestBody.contentString.properties;
        reqParams.boto3['Location'] = jsonRequestBody.contentString.location;
        reqParams.cli['--location'] = jsonRequestBody.contentString.location;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        reqParams.cfn['Properties'] = jsonRequestBody.contentString.properties;
        reqParams.cfn['Location'] = jsonRequestBody.contentString.location;
        reqParams.cfn['RestApiId'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'CreateDocumentationPart',
                'boto3': 'create_documentation_part',
                'cli': 'create-documentation-part'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::DocumentationPart',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.DeleteDocumentationPart
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "DELETE" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/documentation\/parts\/[a-zA-Z0-9]+$/g)) {
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['DocumentationPartId'] = jsonRequestBody.path.split("/")[5];
        reqParams.cli['--documentation-part-id'] = jsonRequestBody.path.split("/")[5];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'DeleteDocumentationPart',
                'boto3': 'delete_documentation_part',
                'cli': 'delete-documentation-part'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.DeleteMethod
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "DELETE" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/resources\/[a-zA-Z0-9]+\/methods\/[A-Z]+$/g)) {
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['ResourceId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--resource-id'] = jsonRequestBody.path.split("/")[4];
        reqParams.boto3['HttpMethod'] = jsonRequestBody.path.split("/")[6];
        reqParams.cli['--http-method'] = jsonRequestBody.path.split("/")[6];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'DeleteMethod',
                'boto3': 'delete_method',
                'cli': 'delete-method'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:cognito-idp.ListUserPools
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/cognito-idp$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path == "/" && jsonRequestBody.headers.X-Amz-Target == "AWSCognitoIdentityProviderService.ListUserPools") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.MaxResults;

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'ListUserPools',
                'boto3': 'list_user_pools',
                'cli': 'list-user-pools'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.CreateAuthorizer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/authorizers$/g)) {
        reqParams.boto3['Type'] = jsonRequestBody.contentString.type;
        reqParams.cli['--type'] = jsonRequestBody.contentString.type;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['AuthorizerUri'] = jsonRequestBody.contentString.authorizerUri;
        reqParams.cli['--authorizer-uri'] = jsonRequestBody.contentString.authorizerUri;
        reqParams.boto3['AuthorizerCredentials'] = jsonRequestBody.contentString.authorizerCredentials;
        reqParams.cli['--authorizer-credentials'] = jsonRequestBody.contentString.authorizerCredentials;
        reqParams.boto3['IdentityValidationExpression'] = jsonRequestBody.contentString.identityValidationExpression;
        reqParams.cli['--identity-validation-expression'] = jsonRequestBody.contentString.identityValidationExpression;
        reqParams.boto3['AuthorizerResultTtlInSeconds'] = jsonRequestBody.contentString.authorizerResultTtlInSeconds;
        reqParams.cli['--authorizer-result-ttl-in-seconds'] = jsonRequestBody.contentString.authorizerResultTtlInSeconds;
        reqParams.boto3['IdentitySource'] = jsonRequestBody.contentString.identitySource;
        reqParams.cli['--identity-source'] = jsonRequestBody.contentString.identitySource;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        reqParams.cfn['Type'] = jsonRequestBody.contentString.type;
        reqParams.cfn['Name'] = jsonRequestBody.contentString.name;
        reqParams.cfn['AuthorizerUri'] = jsonRequestBody.contentString.authorizerUri;
        reqParams.cfn['AuthorizerCredentials'] = jsonRequestBody.contentString.authorizerCredentials;
        reqParams.cfn['IdentityValidationExpression'] = jsonRequestBody.contentString.identityValidationExpression;
        reqParams.cfn['AuthorizerResultTtlInSeconds'] = jsonRequestBody.contentString.authorizerResultTtlInSeconds;
        reqParams.cfn['IdentitySource'] = jsonRequestBody.contentString.identitySource;
        reqParams.cfn['RestApiId'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'CreateAuthorizer',
                'boto3': 'create_authorizer',
                'cli': 'create-authorizer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::Authorizer',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.PutGatewayResponse
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "PUT" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/gatewayresponses\/[a-zA-Z0-9_]+$/g)) {
        reqParams.boto3['StatusCode'] = jsonRequestBody.contentString.statusCode;
        reqParams.cli['--status-code'] = jsonRequestBody.contentString.statusCode;
        reqParams.boto3['ResponseParameters'] = jsonRequestBody.contentString.responseParameters;
        reqParams.cli['--response-parameters'] = jsonRequestBody.contentString.responseParameters;
        reqParams.boto3['ResponseTemplates'] = jsonRequestBody.contentString.responseTemplates;
        reqParams.cli['--response-templates'] = jsonRequestBody.contentString.responseTemplates;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['ResponseType'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--response-type'] = jsonRequestBody.path.split("/")[4];

        reqParams.cfn['StatusCode'] = jsonRequestBody.contentString.statusCode;
        reqParams.cfn['ResponseParameters'] = jsonRequestBody.contentString.responseParameters;
        reqParams.cfn['ResponseTemplates'] = jsonRequestBody.contentString.responseTemplates;
        reqParams.cfn['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cfn['ResponseType'] = jsonRequestBody.path.split("/")[4];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'PutGatewayResponse',
                'boto3': 'put_gateway_response',
                'cli': 'put-gateway-response'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::GatewayResponse',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.CreateModel
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/models$/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['ContentType'] = jsonRequestBody.contentString.contentType;
        reqParams.cli['--content-type'] = jsonRequestBody.contentString.contentType;
        reqParams.boto3['Schema'] = jsonRequestBody.contentString.schema;
        reqParams.cli['--schema'] = jsonRequestBody.contentString.schema;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];

        reqParams.cfn['Name'] = jsonRequestBody.contentString.name;
        reqParams.cfn['ContentType'] = jsonRequestBody.contentString.contentType;
        reqParams.cfn['Schema'] = jsonRequestBody.contentString.schema;
        reqParams.cfn['RestApiId'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'CreateModel',
                'boto3': 'create_model',
                'cli': 'create-model'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::Model',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.DeleteModel
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "DELETE" && jsonRequestBody.path.match(/^\/restapis\/[a-zA-Z0-9]+\/models\/[a-zA-Z0-9]+$/g)) {
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['ModelName'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--model-name'] = jsonRequestBody.path.split("/")[4];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'DeleteModel',
                'boto3': 'delete_model',
                'cli': 'delete-model'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:cloudwatch.GetMetricStatistics
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/monitoring$/g) && jsonRequestBody.params.Action == "GetMetricStatistics") {
        reqParams.boto3['Namespace'] = jsonRequestBody.params.Namespace;
        reqParams.cli['--namespace'] = jsonRequestBody.params.Namespace;
        reqParams.boto3['StartTime'] = jsonRequestBody.params.StartTime;
        reqParams.cli['--start-time'] = jsonRequestBody.params.StartTime;
        reqParams.boto3['EndTime'] = jsonRequestBody.params.EndTime;
        reqParams.cli['--end-time'] = jsonRequestBody.params.EndTime;
        reqParams.boto3['Period'] = jsonRequestBody.params.Period;
        reqParams.cli['--period'] = jsonRequestBody.params.Period;
        reqParams.boto3['Unit'] = jsonRequestBody.params.Unit;
        reqParams.cli['--unit'] = jsonRequestBody.params.Unit;
        reqParams.boto3['MetricName'] = jsonRequestBody.params.MetricName;
        reqParams.cli['--metric-name'] = jsonRequestBody.params.MetricName;

        outputs.push({
            'region': region,
            'service': 'cloudwatch',
            'method': {
                'api': 'GetMetricStatistics',
                'boto3': 'get_metric_statistics',
                'cli': 'get-metric-statistics'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.CreateUsagePlan
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path == "/usageplans") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.description;
        reqParams.boto3['Throttle'] = jsonRequestBody.contentString.throttle;
        reqParams.cli['--throttle'] = jsonRequestBody.contentString.throttle;
        reqParams.boto3['Quota'] = jsonRequestBody.contentString.quota;
        reqParams.cli['--quota'] = jsonRequestBody.contentString.quota;

        reqParams.cfn['UsagePlanName'] = jsonRequestBody.contentString.name;
        reqParams.cfn['Description'] = jsonRequestBody.contentString.description;
        reqParams.cfn['Throttle'] = jsonRequestBody.contentString.throttle;
        reqParams.cfn['Quota'] = jsonRequestBody.contentString.quota;

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'CreateUsagePlan',
                'boto3': 'create_usage_plan',
                'cli': 'create-usage-plan'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::UsagePlan',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.GetStage
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.operation == "getStage") {
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['StageName'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--stage-name'] = jsonRequestBody.path.split("/")[4];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetStage',
                'boto3': 'get_stage',
                'cli': 'get-stage'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetDeployment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.operation == "getDeployment") {
        reqParams.boto3['Embed'] = jsonRequestBody.params.embed;
        reqParams.cli['--embed'] = jsonRequestBody.params.embed;
        reqParams.boto3['RestApiId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--rest-api-id'] = jsonRequestBody.path.split("/")[2];
        reqParams.boto3['DeploymentId'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--deployment-id'] = jsonRequestBody.path.split("/")[4];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetDeployment',
                'boto3': 'get_deployment',
                'cli': 'get-deployment'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.CreateApiKey
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path == "/apikeys" && jsonRequestBody.method == "POST") {
        reqParams.boto3['Enabled'] = jsonRequestBody.contentString.enabled;
        reqParams.cli['--enabled'] = jsonRequestBody.contentString.enabled;
        reqParams.boto3['GenerateDistinctId'] = jsonRequestBody.contentString.generateDistinctId;
        reqParams.cli['--generate-distinct-id'] = jsonRequestBody.contentString.generateDistinctId;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['Value'] = jsonRequestBody.contentString.value;
        reqParams.cli['--value'] = jsonRequestBody.contentString.value;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.description;

        reqParams.cfn['Enabled'] = jsonRequestBody.contentString.enabled;
        reqParams.cfn['GenerateDistinctId'] = jsonRequestBody.contentString.generateDistinctId;
        reqParams.cfn['Name'] = jsonRequestBody.contentString.name;
        reqParams.cfn['Description'] = jsonRequestBody.contentString.description;

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'CreateApiKey',
                'boto3': 'create_api_key',
                'cli': 'create-api-key'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::ApiKey',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.DeleteUsagePlan
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path.match(/^\/usageplans\/[a-zA-Z0-9]+$/g)) {
        reqParams.boto3['UsagePlanId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--usage-plan-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'DeleteUsagePlan',
                'boto3': 'delete_usage_plan',
                'cli': 'delete-usage-plan'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.GetApiKey
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path.match(/^\/apikeys\/[a-zA-Z0-9]+$/g)) {
        reqParams.boto3['IncludeValue'] = jsonRequestBody.params.includeValue;
        reqParams.cli['--include-value'] = jsonRequestBody.params.includeValue;
        reqParams.boto3['ApiKey'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--api-key'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetApiKey',
                'boto3': 'get_api_key',
                'cli': 'get-api-key'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.UpdateApiKey
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "PATCH" && jsonRequestBody.path.match(/^\/apikeys\/[a-zA-Z0-9]+$/g)) {
        reqParams.boto3['PatchOperations'] = jsonRequestBody.contentString.patchOperations;
        reqParams.cli['--patch-operations'] = jsonRequestBody.contentString.patchOperations;
        reqParams.boto3['ApiKey'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--api-key'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'UpdateApiKey',
                'boto3': 'update_api_key',
                'cli': 'update-api-key'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:acm.ListCertificates
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/acm$/g) && jsonRequestBody.headers.X-Amz-Target == "CertificateManager.ListCertificates") {

        outputs.push({
            'region': region,
            'service': 'acm',
            'method': {
                'api': 'ListCertificates',
                'boto3': 'list_certificates',
                'cli': 'list-certificates'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.GetDomainNames
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path == "/domainnames") {
        reqParams.boto3['Limit'] = jsonRequestBody.params.limit;
        reqParams.cli['--limit'] = jsonRequestBody.params.limit;

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'GetDomainNames',
                'boto3': 'get_domain_names',
                'cli': 'get-domain-names'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.CreateDomainName
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path == "/domainnames") {
        reqParams.boto3['DomainName'] = jsonRequestBody.contentString.domainName;
        reqParams.cli['--domain-name'] = jsonRequestBody.contentString.domainName;
        reqParams.boto3['CertificateArn'] = jsonRequestBody.contentString.certificateArn;
        reqParams.cli['--certificate-arn'] = jsonRequestBody.contentString.certificateArn;
        reqParams.boto3['EndpointConfiguration'] = jsonRequestBody.contentString.endpointConfiguration;
        reqParams.cli['--endpoint-configuration'] = jsonRequestBody.contentString.endpointConfiguration;

        reqParams.cfn['DomainName'] = jsonRequestBody.contentString.domainName;
        reqParams.cfn['CertificateArn'] = jsonRequestBody.contentString.certificateArn;
        reqParams.cfn['EndpointConfiguration'] = jsonRequestBody.contentString.endpointConfiguration;

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'CreateDomainName',
                'boto3': 'create_domain_name',
                'cli': 'create-domain-name'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::DomainName',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:apigateway.DeleteClientCertificate
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.method == "POST" && jsonRequestBody.path == "/clientcertificates" && jsonRequestBody.path == "/clientcertificates/oty57y" && jsonRequestBody.method == "DELETE") {
        reqParams.boto3['ClientCertificateId'] = jsonRequestBody.path.split("/")[2];
        reqParams.cli['--client-certificate-id'] = jsonRequestBody.path.split("/")[2];

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'DeleteClientCertificate',
                'boto3': 'delete_client_certificate',
                'cli': 'delete-client-certificate'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:apigateway:elbv2.DescribeLoadBalancers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/elbv2$/g) && jsonRequestBody.method == "GET" && jsonRequestBody.path == "/vpclinks" && jsonRequestBody.params.Action == "DescribeLoadBalancers") {

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeLoadBalancers',
                'boto3': 'describe_load_balancers',
                'cli': 'describe-load-balancers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:apigateway:apigateway.UpdateAccount
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/apigateway\/api\/apigateway$/g) && jsonRequestBody.path == "/account" && jsonRequestBody.method == "PATCH") {
        reqParams.boto3['PatchOperations'] = jsonRequestBody.contentString.patchOperations;
        reqParams.cli['--patch-operations'] = jsonRequestBody.contentString.patchOperations;

        outputs.push({
            'region': region,
            'service': 'apigateway',
            'method': {
                'api': 'UpdateAccount',
                'boto3': 'update_account',
                'cli': 'update-account'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::ApiGateway::Account',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cloudwatch:lambda.ListFunctions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListLambdaFunctions\//g)) {
        reqParams.boto3['MaxItems'] = jsonRequestBody.MaxItems;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxItems;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'ListFunctions',
                'boto3': 'list_functions',
                'cli': 'list-functions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:kinesis.ListStreams
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListKinesisStreams\//g)) {
        reqParams.boto3['Limit'] = jsonRequestBody.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.Limit;

        outputs.push({
            'region': region,
            'service': 'kinesis',
            'method': {
                'api': 'ListStreams',
                'boto3': 'list_streams',
                'cli': 'list-streams'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:sns.ListTopics
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListSNSTopics\//g)) {

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'ListTopics',
                'boto3': 'list_topics',
                'cli': 'list-topics'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:autoscaling.DescribeAutoScalingGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.DescribeAutoScalingGroups\//g)) {

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribeAutoScalingGroups',
                'boto3': 'describe_auto_scaling_groups',
                'cli': 'describe-auto-scaling-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:sqs.ListQueues
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListSQSQueues\//g)) {

        outputs.push({
            'region': region,
            'service': 'sqs',
            'method': {
                'api': 'ListQueues',
                'boto3': 'list_queues',
                'cli': 'list-queues'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:ecs.ListTaskDefinitionFamilies
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListTaskDefinitionFamilies\//g)) {

        outputs.push({
            'region': region,
            'service': 'ecs',
            'method': {
                'api': 'ListTaskDefinitionFamilies',
                'boto3': 'list_task_definition_families',
                'cli': 'list-task-definition-families'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:stepfunctions.ListStateMachines
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListStepFunctionsStateMachines\//g)) {
        reqParams.boto3['MaxResults'] = jsonRequestBody.MaxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.MaxResults;

        outputs.push({
            'region': region,
            'service': 'stepfunctions',
            'method': {
                'api': 'ListStateMachines',
                'boto3': 'list_state_machines',
                'cli': 'list-state-machines'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:ssm.ListDocuments
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListDocuments\//g)) {
        reqParams.boto3['MaxResults'] = jsonRequestBody.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxResults;
        reqParams.boto3['DocumentFilterList'] = jsonRequestBody.DocumentFilterList;
        reqParams.cli['--document-filter-list'] = jsonRequestBody.DocumentFilterList;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'ListDocuments',
                'boto3': 'list_documents',
                'cli': 'list-documents'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:firehose.ListDeliveryStreams
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListFirehoseDeliveryStreams\//g)) {
        reqParams.boto3['Limit'] = jsonRequestBody.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.Limit;

        outputs.push({
            'region': region,
            'service': 'firehose',
            'method': {
                'api': 'ListDeliveryStreams',
                'boto3': 'list_delivery_streams',
                'cli': 'list-delivery-streams'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:iam.ListRoles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListRoles\//g)) {
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:cloudtrail.DescribeTrails
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.DescribeTrails\//g)) {

        outputs.push({
            'region': region,
            'service': 'cloudtrail',
            'method': {
                'api': 'DescribeTrails',
                'boto3': 'describe_trails',
                'cli': 'describe-trails'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:lambda.ListVersionsByFunction
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListLambdaFunctionVersions\//g)) {
        reqParams.boto3['FunctionName'] = jsonRequestBody.FunctionName;
        reqParams.cli['--function-name'] = jsonRequestBody.FunctionName;
        reqParams.boto3['MaxItems'] = jsonRequestBody.MaxItems;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxItems;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'ListVersionsByFunction',
                'boto3': 'list_versions_by_function',
                'cli': 'list-versions-by-function'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:lambda.ListAliases
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListLambdaFunctionAliases\//g)) {
        reqParams.boto3['FunctionName'] = jsonRequestBody.FunctionName;
        reqParams.cli['--function-name'] = jsonRequestBody.FunctionName;
        reqParams.boto3['MaxItems'] = jsonRequestBody.MaxItems;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxItems;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'ListAliases',
                'boto3': 'list_aliases',
                'cli': 'list-aliases'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:events.PutRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.SaveRule\//g)) {
        reqParams.boto3['Name'] = jsonRequestBody.Rule.Name;
        reqParams.cli['--name'] = jsonRequestBody.Rule.Name;
        reqParams.boto3['State'] = jsonRequestBody.Rule.State;
        reqParams.cli['--state'] = jsonRequestBody.Rule.State;
        reqParams.boto3['Description'] = jsonRequestBody.Rule.Description;
        reqParams.cli['--description'] = jsonRequestBody.Rule.Description;
        reqParams.boto3['ScheduleExpression'] = jsonRequestBody.Rule.ScheduleExpression;
        reqParams.cli['--schedule-expression'] = jsonRequestBody.Rule.ScheduleExpression;
        reqParams.boto3['EventPattern'] = jsonRequestBody.Rule.EventPattern;
        reqParams.cli['--event-pattern'] = jsonRequestBody.Rule.EventPattern;

        reqParams.cfn['Name'] = jsonRequestBody.Rule.Name;
        reqParams.cfn['State'] = jsonRequestBody.Rule.State;
        reqParams.cfn['Description'] = jsonRequestBody.Rule.Description;
        reqParams.cfn['ScheduleExpression'] = jsonRequestBody.Rule.ScheduleExpression;
        reqParams.cfn['EventPattern'] = jsonRequestBody.Rule.EventPattern;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'PutRule',
                'boto3': 'put_rule',
                'cli': 'put-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('apigateway', details.requestId),
            'region': region,
            'service': 'apigateway',
            'type': 'AWS::Events::Rule',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cloudwatch:events.ListRules
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.ListRules\//g)) {
        reqParams.boto3['NextToken'] = jsonRequestBody.NextToken;
        reqParams.cli['--next-token'] = jsonRequestBody.NextToken;
        reqParams.boto3['NamePrefix'] = jsonRequestBody.NamePrefix;
        reqParams.cli['--name-prefix'] = jsonRequestBody.NamePrefix;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'ListRules',
                'boto3': 'list_rules',
                'cli': 'list-rules'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cloudwatch:events.DisableRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.DisableRule\//g)) {
        reqParams.boto3['Name'] = jsonRequestBody.Name;
        reqParams.cli['--name'] = jsonRequestBody.Name;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'DisableRule',
                'boto3': 'disable_rule',
                'cli': 'disable-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cloudwatch:events.EnableRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.EnableRule\//g)) {
        reqParams.boto3['Name'] = jsonRequestBody.Name;
        reqParams.cli['--name'] = jsonRequestBody.Name;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'EnableRule',
                'boto3': 'enable_rule',
                'cli': 'enable-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cloudwatch:events.DeleteRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\/data\/jetstream\.DeleteRule\//g)) {
        reqParams.boto3['Name'] = jsonRequestBody.Name;
        reqParams.cli['--name'] = jsonRequestBody.Name;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'DeleteRule',
                'boto3': 'delete_rule',
                'cli': 'delete-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:workspaces:ds.DescribeDirectories
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/workspaces\/workspaces\/SkyLightService$/g) && gwtRequest['method'] == "describeDirectories") {

        outputs.push({
            'region': region,
            'service': 'ds',
            'method': {
                'api': 'DescribeDirectories',
                'boto3': 'describe_directories',
                'cli': 'describe-directories'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:workspaces:workspaces.DescribeWorkspaceBundles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/workspaces\/workspaces\/SkyLightService$/g) && gwtRequest['method'] == "describeWorkspaceBundles") {

        outputs.push({
            'region': region,
            'service': 'workspaces',
            'method': {
                'api': 'DescribeWorkspaceBundles',
                'boto3': 'describe_workspace_bundles',
                'cli': 'describe-workspace-bundles'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:workspaces:kms.ListKeys
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/workspaces\/workspaces\/SkyLightService$/g) && gwtRequest['method'] == "listKeys") {

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'ListKeys',
                'boto3': 'list_keys',
                'cli': 'list-keys'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:workspaces:workspaces.DescribeWorkspaces
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/workspaces\/workspaces\/SkyLightService$/g) && gwtRequest['method'] == "describeWorkspaceImages") {

        outputs.push({
            'region': region,
            'service': 'workspaces',
            'method': {
                'api': 'DescribeWorkspaces',
                'boto3': 'describe_workspaces',
                'cli': 'describe-workspaces'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:workspaces:workspaces.CreateWorkspaces
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/workspaces\/workspaces\/SkyLightService$/g) && gwtRequest['method'] == "createRegistration") {
 
        // TODO: create directory here
        // getPipeSplitField(requestBody, 15) // email
        // getPipeSplitField(requestBody, 16) // first
        // getPipeSplitField(requestBody, 17) // last

        reqParams.boto3['Workspaces'] = {
            "Workspaces": [ 
                { 
                    "BundleId": getPipeSplitField(requestBody, 18),
                    "DirectoryId": "directoryid",
                    "UserName": getPipeSplitField(requestBody, 15)
                }
            ]
        }
        reqParams.cli['--workspaces'] = {
            "Workspaces": [ 
                { 
                    "BundleId": getPipeSplitField(requestBody, 18),
                    "DirectoryId": "directoryid",
                    "UserName": getPipeSplitField(requestBody, 15)
                }
            ]
        }

        reqParams.cfn['BundleId'] = getPipeSplitField(requestBody, 18);
        reqParams.cfn['UserName'] = getPipeSplitField(requestBody, 15);
        reqParams.cfn['DirectoryId'] = 'directoryid';

        outputs.push({
            'region': region,
            'service': 'workspaces',
            'method': {
                'api': 'CreateWorkspaces',
                'boto3': 'create_workspaces',
                'cli': 'create-workspaces'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('workspaces', details.requestId),
            'region': region,
            'service': 'workspaces',
            'type': 'AWS::WorkSpaces::Workspace',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:workspaces:workspaces.TerminateWorkspaces
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/workspaces\/workspaces\/SkyLightService$/g) && gwtRequest['method'] == "terminateWorkspaces") {
        reqParams.boto3['TerminateWorkspaceRequests'] = {
            'WorkspaceId': getPipeSplitField(requestBody, 12)
        };
        reqParams.cli['--terminate-workspace-requests'] = {
            'WorkspaceId': getPipeSplitField(requestBody, 12)
        };

        outputs.push({
            'region': region,
            'service': 'workspaces',
            'method': {
                'api': 'TerminateWorkspaces',
                'boto3': 'terminate_workspaces',
                'cli': 'terminate-workspaces'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:athena:athena.CreateNamedQuery
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/athena\/rpc\/query\/save$/g)) {
        reqParams.boto3['Database'] = jsonRequestBody['query-database'];
        reqParams.cli['--database'] = jsonRequestBody['query-database'];
        reqParams.boto3['QueryString'] = jsonRequestBody['query-query'];
        reqParams.cli['--query-string'] = jsonRequestBody['query-query'];
        reqParams.boto3['Description'] = jsonRequestBody['saveform-desc'];
        reqParams.cli['--description'] = jsonRequestBody['saveform-desc'];
        reqParams.boto3['Name'] = jsonRequestBody['saveform-name'];
        reqParams.cli['--name'] = jsonRequestBody['saveform-name'];

        reqParams.cfn['Database'] = jsonRequestBody['query-database'];
        reqParams.cfn['QueryString'] = jsonRequestBody['query-query'];
        reqParams.cfn['Description'] = jsonRequestBody['saveform-desc'];
        reqParams.cfn['Name'] = jsonRequestBody['saveform-name'];

        outputs.push({
            'region': region,
            'service': 'athena',
            'method': {
                'api': 'CreateNamedQuery',
                'boto3': 'create_named_query',
                'cli': 'create-named-query'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('athena', details.requestId),
            'region': region,
            'service': 'athena',
            'type': 'AWS::Athena::NamedQuery',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:appsync:appsync.CreateGraphqlApi
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "createGraphqlApi") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['AuthenticationType'] = jsonRequestBody.contentString.authenticationType;
        reqParams.cli['--authentication-type'] = jsonRequestBody.contentString.authenticationType;

        reqParams.cfn['Name'] = jsonRequestBody.contentString.name;
        reqParams.cfn['AuthenticationType'] = jsonRequestBody.contentString.authenticationType;

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'CreateGraphqlApi',
                'boto3': 'create_graphql_api',
                'cli': 'create-graphql-api'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('appsync', details.requestId),
            'region': region,
            'service': 'appsync',
            'type': 'AWS::AppSync::GraphQLApi',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:appsync:appsync.CreateApiKey
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "createApiKey") {
        reqParams.boto3['Description'] = jsonRequestBody.contentString.description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.description;
        reqParams.boto3['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--api-id'] = jsonRequestBody.path.split("/")[3];

        reqParams.cfn['Description'] = jsonRequestBody.contentString.description;
        reqParams.cfn['ApiId'] = jsonRequestBody.path.split("/")[3];

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'CreateApiKey',
                'boto3': 'create_api_key',
                'cli': 'create-api-key'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('appsync', details.requestId),
            'region': region,
            'service': 'appsync',
            'type': 'AWS::AppSync::ApiKey',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:appsync:dynamodb.CreateTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/dynamodb$/g) && jsonRequestBody.operation == "createTable") {
        reqParams.boto3['TableName'] = jsonRequestBody.contentString.TableName;
        reqParams.cli['--table-name'] = jsonRequestBody.contentString.TableName;
        reqParams.boto3['KeySchema'] = jsonRequestBody.contentString.KeySchema;
        reqParams.cli['--key-schema'] = jsonRequestBody.contentString.KeySchema;
        reqParams.boto3['LocalSecondaryIndexes'] = jsonRequestBody.contentString.LocalSecondaryIndexes;
        reqParams.cli['--local-secondary-indexes'] = jsonRequestBody.contentString.LocalSecondaryIndexes;
        reqParams.boto3['AttributeDefinitions'] = jsonRequestBody.contentString.AttributeDefinitions;
        reqParams.cli['--attribute-definitions'] = jsonRequestBody.contentString.AttributeDefinitions;
        reqParams.boto3['ProvisionedThroughput'] = jsonRequestBody.contentString.ProvisionedThroughput;
        reqParams.cli['--provisioned-throughput'] = jsonRequestBody.contentString.ProvisionedThroughput;

        reqParams.cfn['TableName'] = jsonRequestBody.contentString.TableName;
        reqParams.cfn['KeySchema'] = jsonRequestBody.contentString.KeySchema;
        reqParams.cfn['LocalSecondaryIndexes'] = jsonRequestBody.contentString.LocalSecondaryIndexes;
        reqParams.cfn['AttributeDefinitions'] = jsonRequestBody.contentString.AttributeDefinitions;
        reqParams.cfn['ProvisionedThroughput'] = jsonRequestBody.contentString.ProvisionedThroughput;

        outputs.push({
            'region': region,
            'service': 'dynamodb',
            'method': {
                'api': 'CreateTable',
                'boto3': 'create_table',
                'cli': 'create-table'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('dynamodb', details.requestId),
            'region': region,
            'service': 'dynamodb',
            'type': 'AWS::DynamoDB::Table',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:appsync:dynamodb.DescribeTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/dynamodb$/g) && jsonRequestBody.operation == "describeTable") {
        reqParams.boto3['TableName'] = jsonRequestBody.contentString.TableName;
        reqParams.cli['--table-name'] = jsonRequestBody.contentString.TableName;

        outputs.push({
            'region': region,
            'service': 'dynamodb',
            'method': {
                'api': 'DescribeTable',
                'boto3': 'describe_table',
                'cli': 'describe-table'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:appsync:appsync.StartSchemaCreation
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "startSchemaCreation") {
        reqParams.boto3['Definition'] = jsonRequestBody.contentString.definition;
        reqParams.cli['--definition'] = jsonRequestBody.contentString.definition;
        reqParams.boto3['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--api-id'] = jsonRequestBody.path.split("/")[3];

        reqParams.cfn['Definition'] = jsonRequestBody.contentString.definition;
        reqParams.cfn['ApiId'] = jsonRequestBody.path.split("/")[3];

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'StartSchemaCreation',
                'boto3': 'start_schema_creation',
                'cli': 'start-schema-creation'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('appsync', details.requestId),
            'region': region,
            'service': 'appsync',
            'type': 'AWS::AppSync::GraphQLSchema',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:appsync:appsync.GetSchemaCreationStatus
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "getSchemaCreationStatus") {
        reqParams.boto3['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--api-id'] = jsonRequestBody.path.split("/")[3];

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'GetSchemaCreationStatus',
                'boto3': 'get_schema_creation_status',
                'cli': 'get-schema-creation-status'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:appsync:appsync.CreateDataSource
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "createDataSource") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['Type'] = jsonRequestBody.contentString.type;
        reqParams.cli['--type'] = jsonRequestBody.contentString.type;
        reqParams.boto3['ServiceRoleArn'] = jsonRequestBody.contentString.serviceRoleArn;
        reqParams.cli['--service-role-arn'] = jsonRequestBody.contentString.serviceRoleArn;
        reqParams.boto3['DynamodbConfig'] = jsonRequestBody.contentString.dynamodbConfig;
        reqParams.cli['--dynamodb-config'] = jsonRequestBody.contentString.dynamodbConfig;
        reqParams.boto3['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--api-id'] = jsonRequestBody.path.split("/")[3];

        reqParams.cfn['Name'] = jsonRequestBody.contentString.name;
        reqParams.cfn['Type'] = jsonRequestBody.contentString.type;
        reqParams.cfn['ServiceRoleArn'] = jsonRequestBody.contentString.serviceRoleArn;
        reqParams.cfn['DynamoDBConfig'] = jsonRequestBody.contentString.dynamodbConfig;
        reqParams.cfn['ApiId'] = jsonRequestBody.path.split("/")[3];

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'CreateDataSource',
                'boto3': 'create_data_source',
                'cli': 'create-data-source'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('appsync', details.requestId),
            'region': region,
            'service': 'appsync',
            'type': 'AWS::AppSync::DataSource',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:appsync:appsync.CreateResolver
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "createResolver") {
        reqParams.boto3['FieldName'] = jsonRequestBody.contentString.fieldName;
        reqParams.cli['--field-name'] = jsonRequestBody.contentString.fieldName;
        reqParams.boto3['DataSourceName'] = jsonRequestBody.contentString.dataSourceName;
        reqParams.cli['--data-source-name'] = jsonRequestBody.contentString.dataSourceName;
        reqParams.boto3['RequestMappingTemplate'] = jsonRequestBody.contentString.requestMappingTemplate;
        reqParams.cli['--request-mapping-template'] = jsonRequestBody.contentString.requestMappingTemplate;
        reqParams.boto3['ResponseMappingTemplate'] = jsonRequestBody.contentString.responseMappingTemplate;
        reqParams.cli['--response-mapping-template'] = jsonRequestBody.contentString.responseMappingTemplate;
        reqParams.boto3['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--api-id'] = jsonRequestBody.path.split("/")[3];
        reqParams.boto3['TypeName'] = jsonRequestBody.path.split("/")[5];
        reqParams.cli['--type-name'] = jsonRequestBody.path.split("/")[5];

        reqParams.cfn['FieldName'] = jsonRequestBody.contentString.fieldName;
        reqParams.cfn['DataSourceName'] = jsonRequestBody.contentString.dataSourceName;
        reqParams.cfn['RequestMappingTemplate'] = jsonRequestBody.contentString.requestMappingTemplate;
        reqParams.cfn['ResponseMappingTemplate'] = jsonRequestBody.contentString.responseMappingTemplate;
        reqParams.cfn['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cfn['TypeName'] = jsonRequestBody.path.split("/")[5];

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'CreateResolver',
                'boto3': 'create_resolver',
                'cli': 'create-resolver'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('appsync', details.requestId),
            'region': region,
            'service': 'appsync',
            'type': 'AWS::AppSync::Resolver',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:appsync:appsync.ListResolvers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "listResolvers") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.params.maxResults;
        reqParams.boto3['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--api-id'] = jsonRequestBody.path.split("/")[3];
        reqParams.boto3['TypeName'] = jsonRequestBody.path.split("/")[5];
        reqParams.cli['--type-name'] = jsonRequestBody.path.split("/")[5];

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'ListResolvers',
                'boto3': 'list_resolvers',
                'cli': 'list-resolvers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:appsync:appsync.UpdateGraphqlApi
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "updateGraphqlApi") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['AuthenticationType'] = jsonRequestBody.contentString.authenticationType;
        reqParams.cli['--authentication-type'] = jsonRequestBody.contentString.authenticationType;
        reqParams.boto3['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--api-id'] = jsonRequestBody.path.split("/")[3];

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'UpdateGraphqlApi',
                'boto3': 'update_graphql_api',
                'cli': 'update-graphql-api'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:appsync:appsync.DeleteGraphqlApi
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/appsync\/api\/appsync$/g) && jsonRequestBody.operation == "deleteGraphqlApi") {
        reqParams.boto3['ApiId'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--api-id'] = jsonRequestBody.path.split("/")[3];

        outputs.push({
            'region': region,
            'service': 'appsync',
            'method': {
                'api': 'DeleteGraphqlApi',
                'boto3': 'delete_graphql_api',
                'cli': 'delete-graphql-api'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeLaunchTemplates
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DescribeLaunchTemplates\?/g)) {
        reqParams.boto3['LaunchTemplateNames'] = jsonRequestBody.LaunchTemplateNames;
        reqParams.cli['--launch-template-names'] = jsonRequestBody.LaunchTemplateNames;
        reqParams.boto3['MaxResults'] = jsonRequestBody.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxResults;
        reqParams.boto3['NextToken'] = jsonRequestBody.NextToken;
        reqParams.cli['--next-token'] = jsonRequestBody.NextToken;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeLaunchTemplates',
                'boto3': 'describe_launch_templates',
                'cli': 'describe-launch-templates'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.DescribeLoadBalancers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getLoadBalancersAutoUpdate\?/g)) {

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribeLoadBalancers',
                'boto3': 'describe_load_balancers',
                'cli': 'describe-load-balancers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.CreateLaunchConfiguration
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=CreateLaunchConfiguration\?/g)) {
        reqParams.boto3['UserData'] = jsonRequestBody.UserData;
        reqParams.cli['--user-data'] = jsonRequestBody.UserData;
        reqParams.boto3['ImageId'] = jsonRequestBody.ImageId;
        reqParams.cli['--image-id'] = jsonRequestBody.ImageId;
        reqParams.boto3['BlockDeviceMappings'] = jsonRequestBody.AutoScalingBlockDeviceMappings;
        reqParams.cli['--block-device-mappings'] = jsonRequestBody.AutoScalingBlockDeviceMappings;
        reqParams.boto3['EbsOptimized'] = jsonRequestBody.EbsOptimized;
        reqParams.cli['--ebs-optimized'] = jsonRequestBody.EbsOptimized;
        reqParams.boto3['IamInstanceProfile'] = jsonRequestBody.IamInstanceProfile;
        reqParams.cli['--iam-instance-profile'] = jsonRequestBody.IamInstanceProfile;
        reqParams.boto3['InstanceMonitoring'] = jsonRequestBody.InstanceMonitoring;
        reqParams.cli['--instance-monitoring'] = jsonRequestBody.InstanceMonitoring;
        reqParams.boto3['InstanceType'] = jsonRequestBody.InstanceType;
        reqParams.cli['--instance-type'] = jsonRequestBody.InstanceType;
        reqParams.boto3['KeyName'] = jsonRequestBody.KeyName;
        reqParams.cli['--key-name'] = jsonRequestBody.KeyName;
        reqParams.boto3['LaunchConfigurationName'] = jsonRequestBody.LaunchConfigurationName;
        reqParams.cli['--launch-configuration-name'] = jsonRequestBody.LaunchConfigurationName;
        reqParams.boto3['SecurityGroups'] = jsonRequestBody.SecurityGroups;
        reqParams.cli['--security-groups'] = jsonRequestBody.SecurityGroups;
        reqParams.boto3['AssociatePublicIpAddress'] = jsonRequestBody.AssociatePublicIpAddress;
        reqParams.cli['--associate-public-ip-address'] = jsonRequestBody.AssociatePublicIpAddress;

        reqParams.cfn['UserData'] = jsonRequestBody.UserData;
        reqParams.cfn['ImageId'] = jsonRequestBody.ImageId;
        reqParams.cfn['BlockDeviceMappings'] = jsonRequestBody.AutoScalingBlockDeviceMappings;
        reqParams.cfn['EbsOptimized'] = jsonRequestBody.EbsOptimized;
        reqParams.cfn['IamInstanceProfile'] = jsonRequestBody.IamInstanceProfile;
        reqParams.cfn['InstanceMonitoring'] = jsonRequestBody.InstanceMonitoring;
        reqParams.cfn['InstanceType'] = jsonRequestBody.InstanceType;
        reqParams.cfn['KeyName'] = jsonRequestBody.KeyName;
        reqParams.cfn['LaunchConfigurationName'] = jsonRequestBody.LaunchConfigurationName;
        reqParams.cfn['SecurityGroups'] = jsonRequestBody.SecurityGroups;
        reqParams.cfn['AssociatePublicIpAddress'] = jsonRequestBody.AssociatePublicIpAddress;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'CreateLaunchConfiguration',
                'boto3': 'create_launch_configuration',
                'cli': 'create-launch-configuration'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('autoscaling', details.requestId),
            'region': region,
            'service': 'autoscaling',
            'type': 'AWS::AutoScaling::LaunchConfiguration',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.DescribeLaunchConfigurations
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DescribeLaunchConfigurations\?/g)) {
        reqParams.boto3['LaunchConfigurationNames'] = jsonRequestBody.LaunchConfigurationNames;
        reqParams.cli['--launch-configuration-names'] = jsonRequestBody.LaunchConfigurationNames;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribeLaunchConfigurations',
                'boto3': 'describe_launch_configurations',
                'cli': 'describe-launch-configurations'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:elbv2.DescribeTargetGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DescribeTargetGroups\?/g)) {

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeTargetGroups',
                'boto3': 'describe_target_groups',
                'cli': 'describe-target-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.CreateAutoScalingGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=CreateAutoScalingGroup\?/g)) {
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.boto3['LaunchConfigurationName'] = jsonRequestBody.LaunchConfigurationName;
        reqParams.cli['--launch-configuration-name'] = jsonRequestBody.LaunchConfigurationName;
        reqParams.boto3['DesiredCapacity'] = jsonRequestBody.DesiredCapacity;
        reqParams.cli['--desired-capacity'] = jsonRequestBody.DesiredCapacity;
        reqParams.boto3['MinSize'] = jsonRequestBody.MinSize;
        reqParams.cli['--min-size'] = jsonRequestBody.MinSize;
        reqParams.boto3['MaxSize'] = jsonRequestBody.MaxSize;
        reqParams.cli['--max-size'] = jsonRequestBody.MaxSize;
        reqParams.boto3['HealthCheckGracePeriod'] = jsonRequestBody.HealthCheckGracePeriod;
        reqParams.cli['--health-check-grace-period'] = jsonRequestBody.HealthCheckGracePeriod;
        reqParams.boto3['Tags'] = jsonRequestBody.Tags;
        reqParams.cli['--tags'] = jsonRequestBody.Tags;
        reqParams.boto3['NewInstancesProtectedFromScaleIn'] = jsonRequestBody.NewInstancesProtectedFromScaleIn;
        reqParams.cli['--new-instances-protected-from-scale-in'] = jsonRequestBody.NewInstancesProtectedFromScaleIn;
        reqParams.boto3['ServiceLinkedRoleARN'] = jsonRequestBody.ServiceLinkedRoleARN;
        reqParams.cli['--service-linked-role-arn'] = jsonRequestBody.ServiceLinkedRoleARN;
        reqParams.boto3['VPCZoneIdentifier'] = jsonRequestBody.VPCZoneIdentifier;
        reqParams.cli['--vpc-zone-identifier'] = jsonRequestBody.VPCZoneIdentifier;

        reqParams.cfn['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cfn['LaunchConfigurationName'] = jsonRequestBody.LaunchConfigurationName;
        reqParams.cfn['DesiredCapacity'] = jsonRequestBody.DesiredCapacity;
        reqParams.cfn['MinSize'] = jsonRequestBody.MinSize;
        reqParams.cfn['MaxSize'] = jsonRequestBody.MaxSize;
        reqParams.cfn['HealthCheckGracePeriod'] = jsonRequestBody.HealthCheckGracePeriod;
        reqParams.cfn['Tags'] = jsonRequestBody.Tags;
        reqParams.cfn['ServiceLinkedRoleARN'] = jsonRequestBody.ServiceLinkedRoleARN;
        reqParams.cfn['VPCZoneIdentifier'] = jsonRequestBody.VPCZoneIdentifier;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'CreateAutoScalingGroup',
                'boto3': 'create_auto_scaling_group',
                'cli': 'create-auto-scaling-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('autoscaling', details.requestId),
            'region': region,
            'service': 'autoscaling',
            'type': 'AWS::AutoScaling::AutoScalingGroup',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.PutScalingPolicy
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=PutScalingPolicy\?/g)) {
        reqParams.boto3['PolicyName'] = jsonRequestBody.PolicyName;
        reqParams.cli['--policy-name'] = jsonRequestBody.PolicyName;
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.boto3['PolicyType'] = jsonRequestBody.PolicyType;
        reqParams.cli['--policy-type'] = jsonRequestBody.PolicyType;
        reqParams.boto3['TargetTrackingConfiguration'] = jsonRequestBody.TargetTrackingConfiguration;
        reqParams.cli['--target-tracking-configuration'] = jsonRequestBody.TargetTrackingConfiguration;
        reqParams.boto3['EstimatedInstanceWarmup'] = jsonRequestBody.EstimatedInstanceWarmup;
        reqParams.cli['--estimated-instance-warmup'] = jsonRequestBody.EstimatedInstanceWarmup;

        reqParams.cfn['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cfn['PolicyType'] = jsonRequestBody.PolicyType;
        reqParams.cfn['TargetTrackingConfiguration'] = jsonRequestBody.TargetTrackingConfiguration;
        reqParams.cfn['EstimatedInstanceWarmup'] = jsonRequestBody.EstimatedInstanceWarmup;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'PutScalingPolicy',
                'boto3': 'put_scaling_policy',
                'cli': 'put-scaling-policy'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('autoscaling', details.requestId),
            'region': region,
            'service': 'autoscaling',
            'type': 'AWS::AutoScaling::ScalingPolicy',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.PutNotificationConfiguration
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=PutNotificationConfiguration\?/g)) {
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.boto3['TopicARN'] = jsonRequestBody.TopicARN;
        reqParams.cli['--topic-arn'] = jsonRequestBody.TopicARN;
        reqParams.boto3['NotificationTypes'] = jsonRequestBody.NotificationTypes;
        reqParams.cli['--notification-types'] = jsonRequestBody.NotificationTypes;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'PutNotificationConfiguration',
                'boto3': 'put_notification_configuration',
                'cli': 'put-notification-configuration'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.DescribeScalingActivities
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DescribeScalingActivities\?/g)) {
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.boto3['NextToken'] = jsonRequestBody.NextToken;
        reqParams.cli['--next-token'] = jsonRequestBody.NextToken;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribeScalingActivities',
                'boto3': 'describe_scaling_activities',
                'cli': 'describe-scaling-activities'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.DescribePolicies
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DescribePolicies\?/g)) {
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribePolicies',
                'boto3': 'describe_policies',
                'cli': 'describe-policies'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.DescribeTags
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DescribeTags\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.Filters;
        reqParams.cli['--filters'] = jsonRequestBody.Filters;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribeTags',
                'boto3': 'describe_tags',
                'cli': 'describe-tags'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.DescribeScheduledActions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DescribeScheduledActions\?/g)) {
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribeScheduledActions',
                'boto3': 'describe_scheduled_actions',
                'cli': 'describe-scheduled-actions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.DescribeLifecycleHooks
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DescribeLifecycleHooks\?/g)) {
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribeLifecycleHooks',
                'boto3': 'describe_lifecycle_hooks',
                'cli': 'describe-lifecycle-hooks'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.DescribeNotificationConfigurations
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DescribeNotificationConfigurations\?/g)) {
        reqParams.boto3['AutoScalingGroupNames'] = jsonRequestBody.AutoScalingGroupNames;
        reqParams.cli['--auto-scaling-group-names'] = jsonRequestBody.AutoScalingGroupNames;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DescribeNotificationConfigurations',
                'boto3': 'describe_notification_configurations',
                'cli': 'describe-notification-configurations'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:autoscaling.DeleteLaunchConfiguration
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DeleteLaunchConfiguration\?/g)) {
        reqParams.boto3['LaunchConfigurationName'] = jsonRequestBody.LaunchConfigurationName;
        reqParams.cli['--launch-configuration-name'] = jsonRequestBody.LaunchConfigurationName;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DeleteLaunchConfiguration',
                'boto3': 'delete_launch_configuration',
                'cli': 'delete-launch-configuration'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.DeleteAutoScalingGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DeleteAutoScalingGroup\?/g)) {
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.boto3['ForceDelete'] = jsonRequestBody.ForceDelete;
        reqParams.cli['--force-delete'] = jsonRequestBody.ForceDelete;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DeleteAutoScalingGroup',
                'boto3': 'delete_auto_scaling_group',
                'cli': 'delete-auto-scaling-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.PutScheduledUpdateGroupAction
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=PutScheduledUpdateGroupAction\?/g)) {
        reqParams.boto3['ScheduledActionName'] = jsonRequestBody.ScheduledActionName;
        reqParams.cli['--scheduled-action-name'] = jsonRequestBody.ScheduledActionName;
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.boto3['MinSize'] = jsonRequestBody.MinSize;
        reqParams.cli['--min-size'] = jsonRequestBody.MinSize;
        reqParams.boto3['MaxSize'] = jsonRequestBody.MaxSize;
        reqParams.cli['--max-size'] = jsonRequestBody.MaxSize;
        reqParams.boto3['DesiredCapacity'] = jsonRequestBody.DesiredCapacity;
        reqParams.cli['--desired-capacity'] = jsonRequestBody.DesiredCapacity;
        reqParams.boto3['StartTime'] = jsonRequestBody.StartTime;
        reqParams.cli['--start-time'] = jsonRequestBody.StartTime;

        reqParams.cfn['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cfn['MinSize'] = jsonRequestBody.MinSize;
        reqParams.cfn['MaxSize'] = jsonRequestBody.MaxSize;
        reqParams.cfn['DesiredCapacity'] = jsonRequestBody.DesiredCapacity;
        reqParams.cfn['StartTime'] = jsonRequestBody.StartTime;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'PutScheduledUpdateGroupAction',
                'boto3': 'put_scheduled_update_group_action',
                'cli': 'put-scheduled-update-group-action'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('autoscaling', details.requestId),
            'region': region,
            'service': 'autoscaling',
            'type': 'AWS::AutoScaling::ScheduledAction',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.DeleteScheduledAction
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DeleteScheduledAction\?&/g)) {
        reqParams.boto3['ScheduledActionName'] = jsonRequestBody.ScheduledActionName;
        reqParams.cli['--scheduled-action-name'] = jsonRequestBody.ScheduledActionName;
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DeleteScheduledAction',
                'boto3': 'delete_scheduled_action',
                'cli': 'delete-scheduled-action'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.PutLifecycleHook
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=PutLifecycleHook\?/g)) {
        reqParams.boto3['LifecycleHookName'] = jsonRequestBody.LifecycleHookName;
        reqParams.cli['--lifecycle-hook-name'] = jsonRequestBody.LifecycleHookName;
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.boto3['HeartbeatTimeout'] = jsonRequestBody.HeartbeatTimeout;
        reqParams.cli['--heartbeat-timeout'] = jsonRequestBody.HeartbeatTimeout;
        reqParams.boto3['NotificationMetadata'] = jsonRequestBody.NotificationMetadata;
        reqParams.cli['--notification-metadata'] = jsonRequestBody.NotificationMetadata;
        reqParams.boto3['DefaultResult'] = jsonRequestBody.DefaultResult;
        reqParams.cli['--default-result'] = jsonRequestBody.DefaultResult;
        reqParams.boto3['LifecycleTransition'] = jsonRequestBody.LifecycleTransition;
        reqParams.cli['--lifecycle-transition'] = jsonRequestBody.LifecycleTransition;

        reqParams.cfn['LifecycleHookName'] = jsonRequestBody.LifecycleHookName;
        reqParams.cfn['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cfn['HeartbeatTimeout'] = jsonRequestBody.HeartbeatTimeout;
        reqParams.cfn['NotificationMetadata'] = jsonRequestBody.NotificationMetadata;
        reqParams.cfn['DefaultResult'] = jsonRequestBody.DefaultResult;
        reqParams.cfn['LifecycleTransition'] = jsonRequestBody.LifecycleTransition;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'PutLifecycleHook',
                'boto3': 'put_lifecycle_hook',
                'cli': 'put-lifecycle-hook'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('autoscaling', details.requestId),
            'region': region,
            'service': 'autoscaling',
            'type': 'AWS::AutoScaling::LifecycleHook',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:autoscaling.DeleteLifecycleHook
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/autoscaling\/acb\?call=DeleteLifecycleHook\?/g)) {
        reqParams.boto3['LifecycleHookName'] = jsonRequestBody.LifecycleHookName;
        reqParams.cli['--lifecycle-hook-name'] = jsonRequestBody.LifecycleHookName;
        reqParams.boto3['AutoScalingGroupName'] = jsonRequestBody.AutoScalingGroupName;
        reqParams.cli['--auto-scaling-group-name'] = jsonRequestBody.AutoScalingGroupName;

        outputs.push({
            'region': region,
            'service': 'autoscaling',
            'method': {
                'api': 'DeleteLifecycleHook',
                'boto3': 'delete_lifecycle_hook',
                'cli': 'delete-lifecycle-hook'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.DescribeComputeEnvironments
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "describecomputeenvironments") {

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'DescribeComputeEnvironments',
                'boto3': 'describe_compute_environments',
                'cli': 'describe-compute-environments'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:iam.ListRoles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/iam$/g) && jsonRequestBody.operation == "listRoles") {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListRoles',
                'boto3': 'list_roles',
                'cli': 'list-roles'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:batch.DescribeJobDefinitions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "describeJobDefinitions") {

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'DescribeJobDefinitions',
                'boto3': 'describe_job_definitions',
                'cli': 'describe-job-definitions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:iam.ListInstanceProfiles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/iam$/g) && jsonRequestBody.operation == "ListInstanceProfiles") {
        reqParams.boto3['MaxItems'] = jsonRequestBody.params.MaxItems;
        reqParams.cli['--max-items'] = jsonRequestBody.params.MaxItems;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListInstanceProfiles',
                'boto3': 'list_instance_profiles',
                'cli': 'list-instance-profiles'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/ec2$/g) && jsonRequestBody.operation == "DescribeVpcs") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:iam.ListInstanceProfiles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/iam$/g) && jsonRequestBody.operation == "ListInstanceProfiles") {
        reqParams.boto3['MaxItems'] = jsonRequestBody.params.MaxItems;
        reqParams.cli['--max-items'] = jsonRequestBody.params.MaxItems;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListInstanceProfiles',
                'boto3': 'list_instance_profiles',
                'cli': 'list-instance-profiles'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/ec2$/g) && jsonRequestBody.operation == "DescribeSubnets") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:ec2.DescribeSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/ec2$/g) && jsonRequestBody.operation == "DescribeSecurityGroups") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSecurityGroups',
                'boto3': 'describe_security_groups',
                'cli': 'describe-security-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:iam.AttachRolePolicy
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/iam$/g) && jsonRequestBody.operation == "AttachRolePolicy") {
        reqParams.boto3['PolicyArn'] = jsonRequestBody.params.PolicyArn;
        reqParams.cli['--policy-arn'] = jsonRequestBody.params.PolicyArn;
        reqParams.boto3['RoleName'] = jsonRequestBody.params.RoleName;
        reqParams.cli['--role-name'] = jsonRequestBody.params.RoleName;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'AttachRolePolicy',
                'boto3': 'attach_role_policy',
                'cli': 'attach-role-policy'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:iam.CreateInstanceProfile
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/iam$/g) && jsonRequestBody.operation == "CreateInstanceProfile") {
        reqParams.boto3['InstanceProfileName'] = jsonRequestBody.params.InstanceProfileName;
        reqParams.cli['--instance-profile-name'] = jsonRequestBody.params.InstanceProfileName;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'CreateInstanceProfile',
                'boto3': 'create_instance_profile',
                'cli': 'create-instance-profile'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:iam.AddRoleToInstanceProfile
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/iam$/g) && jsonRequestBody.operation == "AddRoleToInstanceProfile") {
        reqParams.boto3['InstanceProfileName'] = jsonRequestBody.params.InstanceProfileName;
        reqParams.cli['--instance-profile-name'] = jsonRequestBody.params.InstanceProfileName;
        reqParams.boto3['RoleName'] = jsonRequestBody.params.RoleName;
        reqParams.cli['--role-name'] = jsonRequestBody.params.RoleName;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'AddRoleToInstanceProfile',
                'boto3': 'add_role_to_instance_profile',
                'cli': 'add-role-to-instance-profile'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.CreateComputeEnvironment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "createcomputeenvironment") {
        reqParams.boto3['ComputeEnvironmentName'] = jsonRequestBody.contentString.computeEnvironmentName;
        reqParams.cli['--compute-environment-name'] = jsonRequestBody.contentString.computeEnvironmentName;
        reqParams.boto3['ComputeResources'] = jsonRequestBody.contentString.computeResources;
        reqParams.cli['--compute-resources'] = jsonRequestBody.contentString.computeResources;
        reqParams.boto3['ServiceRole'] = jsonRequestBody.contentString.serviceRole;
        reqParams.cli['--service-role'] = jsonRequestBody.contentString.serviceRole;
        reqParams.boto3['State'] = jsonRequestBody.contentString.state;
        reqParams.cli['--state'] = jsonRequestBody.contentString.state;
        reqParams.boto3['Type'] = jsonRequestBody.contentString.type;
        reqParams.cli['--type'] = jsonRequestBody.contentString.type;

        reqParams.cfn['ComputeEnvironmentName'] = jsonRequestBody.contentString.computeEnvironmentName;
        reqParams.cfn['ComputeResources'] = jsonRequestBody.contentString.computeResources;
        reqParams.cfn['ServiceRole'] = jsonRequestBody.contentString.serviceRole;
        reqParams.cfn['State'] = jsonRequestBody.contentString.state;
        reqParams.cfn['Type'] = jsonRequestBody.contentString.type;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'CreateComputeEnvironment',
                'boto3': 'create_compute_environment',
                'cli': 'create-compute-environment'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('batch', details.requestId),
            'region': region,
            'service': 'batch',
            'type': 'AWS::Batch::ComputeEnvironment',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.DescribeComputeEnvironments
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "describecomputeenvironments") {
        reqParams.boto3['ComputeEnvironments'] = jsonRequestBody.contentString.computeEnvironments;
        reqParams.cli['--compute-environments'] = jsonRequestBody.contentString.computeEnvironments;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'DescribeComputeEnvironments',
                'boto3': 'describe_compute_environments',
                'cli': 'describe-compute-environments'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:batch.CreateJobQueue
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "createjobqueue") {
        reqParams.boto3['ComputeEnvironmentOrder'] = jsonRequestBody.contentString.computeEnvironmentOrder;
        reqParams.cli['--compute-environment-order'] = jsonRequestBody.contentString.computeEnvironmentOrder;
        reqParams.boto3['JobQueueName'] = jsonRequestBody.contentString.jobQueueName;
        reqParams.cli['--job-queue-name'] = jsonRequestBody.contentString.jobQueueName;
        reqParams.boto3['Priority'] = jsonRequestBody.contentString.priority;
        reqParams.cli['--priority'] = jsonRequestBody.contentString.priority;
        reqParams.boto3['State'] = jsonRequestBody.contentString.state;
        reqParams.cli['--state'] = jsonRequestBody.contentString.state;

        reqParams.cfn['ComputeEnvironmentOrder'] = jsonRequestBody.contentString.computeEnvironmentOrder;
        reqParams.cfn['JobQueueName'] = jsonRequestBody.contentString.jobQueueName;
        reqParams.cfn['Priority'] = jsonRequestBody.contentString.priority;
        reqParams.cfn['State'] = jsonRequestBody.contentString.state;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'CreateJobQueue',
                'boto3': 'create_job_queue',
                'cli': 'create-job-queue'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('batch', details.requestId),
            'region': region,
            'service': 'batch',
            'type': 'AWS::Batch::JobQueue',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.RegisterJobDefinition
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "registerjobdefinition") {
        reqParams.boto3['ContainerProperties'] = jsonRequestBody.contentString.containerProperties;
        reqParams.cli['--container-properties'] = jsonRequestBody.contentString.containerProperties;
        reqParams.boto3['JobDefinitionName'] = jsonRequestBody.contentString.jobDefinitionName;
        reqParams.cli['--job-definition-name'] = jsonRequestBody.contentString.jobDefinitionName;
        reqParams.boto3['Parameters'] = jsonRequestBody.contentString.parameters;
        reqParams.cli['--parameters'] = jsonRequestBody.contentString.parameters;
        reqParams.boto3['Type'] = jsonRequestBody.contentString.type;
        reqParams.cli['--type'] = jsonRequestBody.contentString.type;

        reqParams.cfn['ContainerProperties'] = jsonRequestBody.contentString.containerProperties;
        reqParams.cfn['JobDefinitionName'] = jsonRequestBody.contentString.jobDefinitionName;
        reqParams.cfn['Parameters'] = jsonRequestBody.contentString.parameters;
        reqParams.cfn['Type'] = jsonRequestBody.contentString.type;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'RegisterJobDefinition',
                'boto3': 'register_job_definition',
                'cli': 'register-job-definition'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('batch', details.requestId),
            'region': region,
            'service': 'batch',
            'type': 'AWS::Batch::JobDefinition',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.SubmitJob
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "submitjob") {
        reqParams.boto3['JobDefinition'] = jsonRequestBody.contentString.jobDefinition;
        reqParams.cli['--job-definition'] = jsonRequestBody.contentString.jobDefinition;
        reqParams.boto3['JobName'] = jsonRequestBody.contentString.jobName;
        reqParams.cli['--job-name'] = jsonRequestBody.contentString.jobName;
        reqParams.boto3['JobQueue'] = jsonRequestBody.contentString.jobQueue;
        reqParams.cli['--job-queue'] = jsonRequestBody.contentString.jobQueue;
        reqParams.boto3['Parameters'] = jsonRequestBody.contentString.parameters;
        reqParams.cli['--parameters'] = jsonRequestBody.contentString.parameters;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'SubmitJob',
                'boto3': 'submit_job',
                'cli': 'submit-job'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.ListJobs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "listjobs") {
        reqParams.boto3['JobQueue'] = jsonRequestBody.contentString.jobQueue;
        reqParams.cli['--job-queue'] = jsonRequestBody.contentString.jobQueue;
        reqParams.boto3['JobStatus'] = jsonRequestBody.contentString.jobStatus;
        reqParams.cli['--job-status'] = jsonRequestBody.contentString.jobStatus;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'ListJobs',
                'boto3': 'list_jobs',
                'cli': 'list-jobs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:batch:batch.CancelJob
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "cancelJob") {
        reqParams.boto3['JobId'] = jsonRequestBody.contentString.jobId;
        reqParams.cli['--job-id'] = jsonRequestBody.contentString.jobId;
        reqParams.boto3['Reason'] = jsonRequestBody.contentString.reason;
        reqParams.cli['--reason'] = jsonRequestBody.contentString.reason;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'CancelJob',
                'boto3': 'cancel_job',
                'cli': 'cancel-job'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.DeleteComputeEnvironment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "deletecomputeenvironment") {
        reqParams.boto3['ComputeEnvironment'] = jsonRequestBody.contentString.computeEnvironment;
        reqParams.cli['--compute-environment'] = jsonRequestBody.contentString.computeEnvironment;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'DeleteComputeEnvironment',
                'boto3': 'delete_compute_environment',
                'cli': 'delete-compute-environment'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.UpdateComputeEnvironment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "updatecomputeenvironment") {
        reqParams.boto3['ComputeEnvironment'] = jsonRequestBody.contentString.computeEnvironment;
        reqParams.cli['--compute-environment'] = jsonRequestBody.contentString.computeEnvironment;
        reqParams.boto3['State'] = jsonRequestBody.contentString.state;
        reqParams.cli['--state'] = jsonRequestBody.contentString.state;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'UpdateComputeEnvironment',
                'boto3': 'update_compute_environment',
                'cli': 'update-compute-environment'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:batch:batch.DeregisterJobDefinition
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/batch\/api\/batch$/g) && jsonRequestBody.operation == "deregisterjobdefinition") {
        reqParams.boto3['JobDefinition'] = jsonRequestBody.contentString.jobDefinition;
        reqParams.cli['--job-definition'] = jsonRequestBody.contentString.jobDefinition;

        outputs.push({
            'region': region,
            'service': 'batch',
            'method': {
                'api': 'DeregisterJobDefinition',
                'boto3': 'deregister_job_definition',
                'cli': 'deregister-job-definition'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codedeploy:codedeploy.CreateApplication
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "createApplication") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;
        reqParams.boto3['ComputePlatform'] = jsonRequestBody.contentString.computePlatform;
        reqParams.cli['--compute-platform'] = jsonRequestBody.contentString.computePlatform;

        reqParams.cfn['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cfn['ComputePlatform'] = jsonRequestBody.contentString.computePlatform;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'CreateApplication',
                'boto3': 'create_application',
                'cli': 'create-application'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('codedeploy', details.requestId),
            'region': region,
            'service': 'codedeploy',
            'type': 'AWS::CodeDeploy::Application',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codedeploy:codedeploy.GetApplication
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "getApplication") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'GetApplication',
                'boto3': 'get_application',
                'cli': 'get-application'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.ListApplicationRevisions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "listApplicationRevisions") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;
        reqParams.boto3['SortBy'] = jsonRequestBody.contentString.sortBy;
        reqParams.cli['--sort-by'] = jsonRequestBody.contentString.sortBy;
        reqParams.boto3['SortOrder'] = jsonRequestBody.contentString.sortOrder;
        reqParams.cli['--sort-order'] = jsonRequestBody.contentString.sortOrder;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'ListApplicationRevisions',
                'boto3': 'list_application_revisions',
                'cli': 'list-application-revisions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.ListDeploymentGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "listDeploymentGroups") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'ListDeploymentGroups',
                'boto3': 'list_deployment_groups',
                'cli': 'list-deployment-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.ListDeploymentConfigs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "listDeploymentConfigs") {

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'ListDeploymentConfigs',
                'boto3': 'list_deployment_configs',
                'cli': 'list-deployment-configs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.CreateDeploymentGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "describeLoadBalancers" && jsonRequestBody.operation == "createDeploymentGroup") {
        reqParams.boto3['DeploymentConfigName'] = jsonRequestBody.contentString.deploymentConfigName;
        reqParams.cli['--deployment-config-name'] = jsonRequestBody.contentString.deploymentConfigName;
        reqParams.boto3['DeploymentStyle'] = jsonRequestBody.contentString.deploymentStyle;
        reqParams.cli['--deployment-style'] = jsonRequestBody.contentString.deploymentStyle;
        reqParams.boto3['AutoScalingGroups'] = jsonRequestBody.contentString.autoScalingGroups;
        reqParams.cli['--auto-scaling-groups'] = jsonRequestBody.contentString.autoScalingGroups;
        reqParams.boto3['Ec2TagSet'] = jsonRequestBody.contentString.ec2TagSet;
        reqParams.cli['--ec-2-tag-set'] = jsonRequestBody.contentString.ec2TagSet;
        reqParams.boto3['OnPremisesTagSet'] = jsonRequestBody.contentString.onPremisesTagSet;
        reqParams.cli['--on-premises-tag-set'] = jsonRequestBody.contentString.onPremisesTagSet;
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;
        reqParams.boto3['TriggerConfigurations'] = jsonRequestBody.contentString.triggerConfigurations;
        reqParams.cli['--trigger-configurations'] = jsonRequestBody.contentString.triggerConfigurations;
        reqParams.boto3['ServiceRoleArn'] = jsonRequestBody.contentString.serviceRoleArn;
        reqParams.cli['--service-role-arn'] = jsonRequestBody.contentString.serviceRoleArn;
        reqParams.boto3['AutoRollbackConfiguration'] = jsonRequestBody.contentString.autoRollbackConfiguration;
        reqParams.cli['--auto-rollback-configuration'] = jsonRequestBody.contentString.autoRollbackConfiguration;
        reqParams.boto3['DeploymentGroupName'] = jsonRequestBody.contentString.deploymentGroupName;
        reqParams.cli['--deployment-group-name'] = jsonRequestBody.contentString.deploymentGroupName;

        reqParams.cfn['DeploymentConfigName'] = jsonRequestBody.contentString.deploymentConfigName;
        reqParams.cfn['DeploymentStyle'] = jsonRequestBody.contentString.deploymentStyle;
        reqParams.cfn['AutoScalingGroups'] = jsonRequestBody.contentString.autoScalingGroups;
        reqParams.cfn['Ec2TagSet'] = jsonRequestBody.contentString.ec2TagSet;
        reqParams.cfn['OnPremisesInstanceTagSet'] = jsonRequestBody.contentString.onPremisesTagSet;
        reqParams.cfn['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cfn['TriggerConfigurations'] = jsonRequestBody.contentString.triggerConfigurations;
        reqParams.cfn['ServiceRoleArn'] = jsonRequestBody.contentString.serviceRoleArn;
        reqParams.cfn['AutoRollbackConfiguration'] = jsonRequestBody.contentString.autoRollbackConfiguration;
        reqParams.cfn['DeploymentGroupName'] = jsonRequestBody.contentString.deploymentGroupName;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'CreateDeploymentGroup',
                'boto3': 'create_deployment_group',
                'cli': 'create-deployment-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('codedeploy', details.requestId),
            'region': region,
            'service': 'codedeploy',
            'type': 'AWS::CodeDeploy::DeploymentGroup',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codedeploy:codedeploy.GetDeploymentGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "getDeploymentGroup") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;
        reqParams.boto3['DeploymentGroupName'] = jsonRequestBody.contentString.deploymentGroupName;
        reqParams.cli['--deployment-group-name'] = jsonRequestBody.contentString.deploymentGroupName;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'GetDeploymentGroup',
                'boto3': 'get_deployment_group',
                'cli': 'get-deployment-group'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.ListDeployments
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "listDeployments") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;
        reqParams.boto3['DeploymentGroupName'] = jsonRequestBody.contentString.deploymentGroupName;
        reqParams.cli['--deployment-group-name'] = jsonRequestBody.contentString.deploymentGroupName;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'ListDeployments',
                'boto3': 'list_deployments',
                'cli': 'list-deployments'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.ListDeploymentConfigs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "listDeploymentConfigs") {

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'ListDeploymentConfigs',
                'boto3': 'list_deployment_configs',
                'cli': 'list-deployment-configs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.BatchGetDeploymentGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "batchGetDeploymentGroups") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;
        reqParams.boto3['DeploymentGroupNames'] = jsonRequestBody.contentString.deploymentGroupNames;
        reqParams.cli['--deployment-group-names'] = jsonRequestBody.contentString.deploymentGroupNames;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'BatchGetDeploymentGroups',
                'boto3': 'batch_get_deployment_groups',
                'cli': 'batch-get-deployment-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.CreateDeployment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "createDeployment") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;
        reqParams.boto3['DeploymentGroupName'] = jsonRequestBody.contentString.deploymentGroupName;
        reqParams.cli['--deployment-group-name'] = jsonRequestBody.contentString.deploymentGroupName;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.description;
        reqParams.boto3['AutoRollbackConfiguration'] = jsonRequestBody.contentString.autoRollbackConfiguration;
        reqParams.cli['--auto-rollback-configuration'] = jsonRequestBody.contentString.autoRollbackConfiguration;
        reqParams.boto3['Revision'] = jsonRequestBody.contentString.revision;
        reqParams.cli['--revision'] = jsonRequestBody.contentString.revision;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'CreateDeployment',
                'boto3': 'create_deployment',
                'cli': 'create-deployment'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codedeploy:codedeploy.StopDeployment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "stopDeployment") {
        reqParams.boto3['AutoRollbackEnabled'] = jsonRequestBody.contentString.autoRollbackEnabled;
        reqParams.cli['--auto-rollback-enabled'] = jsonRequestBody.contentString.autoRollbackEnabled;
        reqParams.boto3['DeploymentId'] = jsonRequestBody.contentString.deploymentId;
        reqParams.cli['--deployment-id'] = jsonRequestBody.contentString.deploymentId;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'StopDeployment',
                'boto3': 'stop_deployment',
                'cli': 'stop-deployment'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codedeploy:codedeploy.CreateDeploymentConfig
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "createDeploymentConfig") {
        reqParams.boto3['ComputePlatform'] = jsonRequestBody.contentString.computePlatform;
        reqParams.cli['--compute-platform'] = jsonRequestBody.contentString.computePlatform;
        reqParams.boto3['DeploymentConfigName'] = jsonRequestBody.contentString.deploymentConfigName;
        reqParams.cli['--deployment-config-name'] = jsonRequestBody.contentString.deploymentConfigName;
        reqParams.boto3['MinimumHealthyHosts'] = jsonRequestBody.contentString.minimumHealthyHosts;
        reqParams.cli['--minimum-healthy-hosts'] = jsonRequestBody.contentString.minimumHealthyHosts;

        reqParams.cfn['DeploymentConfigName'] = jsonRequestBody.contentString.deploymentConfigName;
        reqParams.cfn['MinimumHealthyHosts'] = jsonRequestBody.contentString.minimumHealthyHosts;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'CreateDeploymentConfig',
                'boto3': 'create_deployment_config',
                'cli': 'create-deployment-config'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('codedeploy', details.requestId),
            'region': region,
            'service': 'codedeploy',
            'type': 'AWS::CodeDeploy::DeploymentConfig',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.DeleteDeploymentConfig
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "deleteDeploymentConfig") {
        reqParams.boto3['DeploymentConfigName'] = jsonRequestBody.contentString.deploymentConfigName;
        reqParams.cli['--deployment-config-name'] = jsonRequestBody.contentString.deploymentConfigName;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'DeleteDeploymentConfig',
                'boto3': 'delete_deployment_config',
                'cli': 'delete-deployment-config'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codedeploy:codedeploy.BatchGetDeployments
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "batchGetDeployments") {
        reqParams.boto3['DeploymentIds'] = jsonRequestBody.contentString.deploymentIds;
        reqParams.cli['--deployment-ids'] = jsonRequestBody.contentString.deploymentIds;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'BatchGetDeployments',
                'boto3': 'batch_get_deployments',
                'cli': 'batch-get-deployments'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codedeploy:codedeploy.DeleteApplication
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codedeploy$/g) && jsonRequestBody.operation == "deleteApplication") {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.contentString.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.contentString.applicationName;

        outputs.push({
            'region': region,
            'service': 'codedeploy',
            'method': {
                'api': 'DeleteApplication',
                'boto3': 'delete_application',
                'cli': 'delete-application'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codepipeline:codepipeline.ListActionTypes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codepipeline$/g) && jsonRequestBody.operation == "listActionTypes") {

        outputs.push({
            'region': region,
            'service': 'codepipeline',
            'method': {
                'api': 'ListActionTypes',
                'boto3': 'list_action_types',
                'cli': 'list-action-types'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codepipeline:codepipeline.ListPipelines
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codepipeline$/g) && jsonRequestBody.operation == "listPipelines") {

        outputs.push({
            'region': region,
            'service': 'codepipeline',
            'method': {
                'api': 'ListPipelines',
                'boto3': 'list_pipelines',
                'cli': 'list-pipelines'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codebuild:codebuild.ListProjects
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codebuild$/g) && jsonRequestBody.operation == "listProjects") {

        outputs.push({
            'region': region,
            'service': 'codebuild',
            'method': {
                'api': 'ListProjects',
                'boto3': 'list_projects',
                'cli': 'list-projects'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codecommit:codecommit.ListRepositories
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codecommit$/g) && jsonRequestBody.operation == "listRepositories") {

        outputs.push({
            'region': region,
            'service': 'codecommit',
            'method': {
                'api': 'ListRepositories',
                'boto3': 'list_repositories',
                'cli': 'list-repositories'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codebuild:codebuild.ListCuratedEnvironmentImages
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codebuild$/g) && jsonRequestBody.operation == "listCuratedEnvironmentImages") {

        outputs.push({
            'region': region,
            'service': 'codebuild',
            'method': {
                'api': 'ListCuratedEnvironmentImages',
                'boto3': 'list_curated_environment_images',
                'cli': 'list-curated-environment-images'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codebuild:codebuild.CreateProject
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codebuild$/g) && jsonRequestBody.operation == "createProject") {
        reqParams.boto3['TimeoutInMinutes'] = jsonRequestBody.contentString.timeoutInMinutes;
        reqParams.cli['--timeout-in-minutes'] = jsonRequestBody.contentString.timeoutInMinutes;
        reqParams.boto3['Artifacts'] = jsonRequestBody.contentString.artifacts;
        reqParams.cli['--artifacts'] = jsonRequestBody.contentString.artifacts;
        reqParams.boto3['Cache'] = jsonRequestBody.contentString.cache;
        reqParams.cli['--cache'] = jsonRequestBody.contentString.cache;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.description;
        reqParams.boto3['Environment'] = jsonRequestBody.contentString.environment;
        reqParams.cli['--environment'] = jsonRequestBody.contentString.environment;
        reqParams.boto3['ServiceRole'] = jsonRequestBody.contentString.serviceRole;
        reqParams.cli['--service-role'] = jsonRequestBody.contentString.serviceRole;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;
        reqParams.boto3['Source'] = jsonRequestBody.contentString.source;
        reqParams.cli['--source'] = jsonRequestBody.contentString.source;

        reqParams.cfn['TimeoutInMinutes'] = jsonRequestBody.contentString.timeoutInMinutes;
        reqParams.cfn['Artifacts'] = jsonRequestBody.contentString.artifacts;
        reqParams.cfn['Cache'] = jsonRequestBody.contentString.cache;
        reqParams.cfn['Description'] = jsonRequestBody.contentString.description;
        reqParams.cfn['Environment'] = jsonRequestBody.contentString.environment;
        reqParams.cfn['ServiceRole'] = jsonRequestBody.contentString.serviceRole;
        reqParams.cfn['Name'] = jsonRequestBody.contentString.name;
        reqParams.cfn['Source'] = jsonRequestBody.contentString.source;

        outputs.push({
            'region': region,
            'service': 'codebuild',
            'method': {
                'api': 'CreateProject',
                'boto3': 'create_project',
                'cli': 'create-project'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('codebuild', details.requestId),
            'region': region,
            'service': 'codebuild',
            'type': 'AWS::CodeBuild::Project',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codebuild:codebuild.BatchGetProjects
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codebuild$/g) && jsonRequestBody.operation == "batchGetProjects") {
        reqParams.boto3['Names'] = jsonRequestBody.contentString.names;
        reqParams.cli['--names'] = jsonRequestBody.contentString.names;

        outputs.push({
            'region': region,
            'service': 'codebuild',
            'method': {
                'api': 'BatchGetProjects',
                'boto3': 'batch_get_projects',
                'cli': 'batch-get-projects'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codepipeline:codepipeline.CreatePipeline
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codepipeline$/g) && jsonRequestBody.operation == "createPipeline") {
        reqParams.boto3['Pipeline'] = jsonRequestBody.contentString.pipeline;
        reqParams.cli['--pipeline'] = jsonRequestBody.contentString.pipeline;

        reqParams.cfn['ArtifactStore'] = {
            'Location': jsonRequestBody.contentString.pipeline.artifactStore.location,
            'Type': jsonRequestBody.contentString.pipeline.artifactStore.type
        };
        reqParams.cfn['RoleArn'] = jsonRequestBody.contentString.pipeline.roleArn;
        reqParams.cfn['Name'] = jsonRequestBody.contentString.pipeline.name;
        reqParams.cfn['Stages'] = jsonRequestBody.contentString.pipeline.stages;

        outputs.push({
            'region': region,
            'service': 'codepipeline',
            'method': {
                'api': 'CreatePipeline',
                'boto3': 'create_pipeline',
                'cli': 'create-pipeline'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('codepipeline', details.requestId),
            'region': region,
            'service': 'codepipeline',
            'type': 'AWS::CodePipeline::Pipeline',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codepipeline:codepipeline.GetPipeline
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codepipeline$/g) && jsonRequestBody.operation == "getPipeline") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;

        outputs.push({
            'region': region,
            'service': 'codepipeline',
            'method': {
                'api': 'GetPipeline',
                'boto3': 'get_pipeline',
                'cli': 'get-pipeline'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codepipeline:codepipeline.GetPipelineState
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codepipeline$/g) && jsonRequestBody.operation == "getPipelineState") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;

        outputs.push({
            'region': region,
            'service': 'codepipeline',
            'method': {
                'api': 'GetPipelineState',
                'boto3': 'get_pipeline_state',
                'cli': 'get-pipeline-state'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codepipeline:codepipeline.GetPipelineExecution
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codepipeline$/g) && jsonRequestBody.operation == "getPipelineExecution") {
        reqParams.boto3['PipelineExecutionId'] = jsonRequestBody.contentString.pipelineExecutionId;
        reqParams.cli['--pipeline-execution-id'] = jsonRequestBody.contentString.pipelineExecutionId;
        reqParams.boto3['PipelineName'] = jsonRequestBody.contentString.pipelineName;
        reqParams.cli['--pipeline-name'] = jsonRequestBody.contentString.pipelineName;

        outputs.push({
            'region': region,
            'service': 'codepipeline',
            'method': {
                'api': 'GetPipelineExecution',
                'boto3': 'get_pipeline_execution',
                'cli': 'get-pipeline-execution'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codepipeline:codepipeline.UpdatePipeline
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codepipeline$/g) && jsonRequestBody.operation == "updatePipeline") {
        reqParams.boto3['Pipeline'] = jsonRequestBody.contentString.pipeline;
        reqParams.cli['--pipeline'] = jsonRequestBody.contentString.pipeline;

        outputs.push({
            'region': region,
            'service': 'codepipeline',
            'method': {
                'api': 'UpdatePipeline',
                'boto3': 'update_pipeline',
                'cli': 'update-pipeline'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codepipeline:codepipeline.DeletePipeline
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codepipeline$/g) && jsonRequestBody.operation == "deletePipeline") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.name;

        outputs.push({
            'region': region,
            'service': 'codepipeline',
            'method': {
                'api': 'DeletePipeline',
                'boto3': 'delete_pipeline',
                'cli': 'delete-pipeline'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codecommit:codecommit.CreateRepository
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codecommit$/g) && jsonRequestBody.operation == "createRepository") {
        reqParams.boto3['RepositoryName'] = jsonRequestBody.contentString.repositoryName;
        reqParams.cli['--repository-name'] = jsonRequestBody.contentString.repositoryName;
        reqParams.boto3['RepositoryDescription'] = jsonRequestBody.contentString.repositoryDescription;
        reqParams.cli['--repository-description'] = jsonRequestBody.contentString.repositoryDescription;

        reqParams.cfn['RepositoryName'] = jsonRequestBody.contentString.repositoryName;
        reqParams.cfn['RepositoryDescription'] = jsonRequestBody.contentString.repositoryDescription;

        outputs.push({
            'region': region,
            'service': 'codecommit',
            'method': {
                'api': 'CreateRepository',
                'boto3': 'create_repository',
                'cli': 'create-repository'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('codecommit', details.requestId),
            'region': region,
            'service': 'codecommit',
            'type': 'AWS::CodeCommit::Repository',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:codecommit:codecommit.GetRepository
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codecommit$/g) && jsonRequestBody.operation == "getRepository") {
        reqParams.boto3['RepositoryName'] = jsonRequestBody.contentString.repositoryName;
        reqParams.cli['--repository-name'] = jsonRequestBody.contentString.repositoryName;

        outputs.push({
            'region': region,
            'service': 'codecommit',
            'method': {
                'api': 'GetRepository',
                'boto3': 'get_repository',
                'cli': 'get-repository'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codecommit:codecommit.ListRepositories
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codecommit$/g) && jsonRequestBody.operation == "listRepositories") {
        reqParams.boto3['SortBy'] = jsonRequestBody.contentString.sortBy;
        reqParams.cli['--sort-by'] = jsonRequestBody.contentString.sortBy;
        reqParams.boto3['Order'] = jsonRequestBody.contentString.order;
        reqParams.cli['--order'] = jsonRequestBody.contentString.order;

        outputs.push({
            'region': region,
            'service': 'codecommit',
            'method': {
                'api': 'ListRepositories',
                'boto3': 'list_repositories',
                'cli': 'list-repositories'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codecommit:codecommit.ListPullRequests
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codecommit$/g) && jsonRequestBody.operation == "listPullRequests") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.contentString.maxResults;
        reqParams.boto3['RepositoryName'] = jsonRequestBody.contentString.repositoryName;
        reqParams.cli['--repository-name'] = jsonRequestBody.contentString.repositoryName;
        reqParams.boto3['PullRequestStatus'] = jsonRequestBody.contentString.pullRequestStatus;
        reqParams.cli['--pull-request-status'] = jsonRequestBody.contentString.pullRequestStatus;

        outputs.push({
            'region': region,
            'service': 'codecommit',
            'method': {
                'api': 'ListPullRequests',
                'boto3': 'list_pull_requests',
                'cli': 'list-pull-requests'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:codecommit:codecommit.DeleteRepository
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/codesuite\/api\/codecommit$/g) && jsonRequestBody.operation == "deleteRepository") {
        reqParams.boto3['RepositoryName'] = jsonRequestBody.contentString.repositoryName;
        reqParams.cli['--repository-name'] = jsonRequestBody.contentString.repositoryName;

        outputs.push({
            'region': region,
            'service': 'codecommit',
            'method': {
                'api': 'DeleteRepository',
                'boto3': 'delete_repository',
                'cli': 'delete-repository'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.CreateProduct
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/product\?/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.name;
        reqParams.cli['--name'] = jsonRequestBody.name;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['Owner'] = jsonRequestBody.owner;
        reqParams.cli['--owner'] = jsonRequestBody.owner;
        reqParams.boto3['Distributor'] = jsonRequestBody.distributor;
        reqParams.cli['--distributor'] = jsonRequestBody.distributor;
        reqParams.boto3['SupportEmail'] = jsonRequestBody.supportEmail;
        reqParams.cli['--support-email'] = jsonRequestBody.supportEmail;
        reqParams.boto3['SupportUrl'] = jsonRequestBody.supportUrl;
        reqParams.cli['--support-url'] = jsonRequestBody.supportUrl;
        reqParams.boto3['SupportDescription'] = jsonRequestBody.supportDescription;
        reqParams.cli['--support-description'] = jsonRequestBody.supportDescription;
        reqParams.boto3['ProvisioningArtifactParameters'] = jsonRequestBody.provisioningArtifactParameters;
        reqParams.cli['--provisioning-artifact-parameters'] = jsonRequestBody.provisioningArtifactParameters;
        reqParams.boto3['Name'] = jsonRequestBody.provisioningArtifactParameters.name;
        reqParams.cli['--name'] = jsonRequestBody.provisioningArtifactParameters.name;
        reqParams.boto3['Description'] = jsonRequestBody.provisioningArtifactParameters.description;
        reqParams.cli['--description'] = jsonRequestBody.provisioningArtifactParameters.description;
        reqParams.boto3['ProductType'] = jsonRequestBody.productType;
        reqParams.cli['--product-type'] = jsonRequestBody.productType;
        reqParams.boto3['IdempotencyToken'] = jsonRequestBody.idempotencyToken;
        reqParams.cli['--idempotency-token'] = jsonRequestBody.idempotencyToken;

        reqParams.cfn['Name'] = jsonRequestBody.name;
        reqParams.cfn['Description'] = jsonRequestBody.description;
        reqParams.cfn['Owner'] = jsonRequestBody.owner;
        reqParams.cfn['Distributor'] = jsonRequestBody.distributor;
        reqParams.cfn['SupportEmail'] = jsonRequestBody.supportEmail;
        reqParams.cfn['SupportUrl'] = jsonRequestBody.supportUrl;
        reqParams.cfn['SupportDescription'] = jsonRequestBody.supportDescription;
        reqParams.cfn['ProvisioningArtifactParameters'] = jsonRequestBody.provisioningArtifactParameters;
        reqParams.cfn['Name'] = jsonRequestBody.provisioningArtifactParameters.name;
        reqParams.cfn['Description'] = jsonRequestBody.provisioningArtifactParameters.description;

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'CreateProduct',
                'boto3': 'create_product',
                'cli': 'create-product'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (jsonRequestBody.productType == "CLOUD_FORMATION_TEMPLATE") {
            tracked_resources.push({
                'logicalId': getResourceName('servicecatalog', details.requestId),
                'region': region,
                'service': 'servicecatalog',
                'type': 'AWS::ServiceCatalog::CloudFormationProduct',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });
        }

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.ListPortfolios
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/portfolio\/list\?/g)) {
        reqParams.boto3['PageSize'] = getUrlValue(details.url, 'pageSize');
        reqParams.cli['--page-size'] = getUrlValue(details.url, 'pageSize');

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'ListPortfolios',
                'boto3': 'list_portfolios',
                'cli': 'list-portfolios'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.CreatePortfolio
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/portfolio\?/g)) {
        reqParams.boto3['DisplayName'] = jsonRequestBody.displayName;
        reqParams.cli['--display-name'] = jsonRequestBody.displayName;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['ProviderName'] = jsonRequestBody.providerName;
        reqParams.cli['--provider-name'] = jsonRequestBody.providerName;
        reqParams.boto3['Tags'] = jsonRequestBody.tags;
        reqParams.cli['--tags'] = jsonRequestBody.tags;
        reqParams.boto3['IdempotencyToken'] = jsonRequestBody.idempotencyToken;
        reqParams.cli['--idempotency-token'] = jsonRequestBody.idempotencyToken;

        reqParams.cfn['DisplayName'] = jsonRequestBody.displayName;
        reqParams.cfn['Description'] = jsonRequestBody.description;
        reqParams.cfn['ProviderName'] = jsonRequestBody.providerName;
        reqParams.cfn['Tags'] = jsonRequestBody.tags;

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'CreatePortfolio',
                'boto3': 'create_portfolio',
                'cli': 'create-portfolio'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('servicecatalog', details.requestId),
            'region': region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::Portfolio',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.AssociateProductWithPortfolio
    if (details.method == "PUT" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/product\/portfolio\?/g)) {
        reqParams.boto3['PortfolioId'] = jsonRequestBody.portfolioId;
        reqParams.cli['--portfolio-id'] = jsonRequestBody.portfolioId;
        reqParams.boto3['ProductId'] = jsonRequestBody.productId;
        reqParams.cli['--product-id'] = jsonRequestBody.productId;
        reqParams.boto3['SourcePortfolioId'] = jsonRequestBody.sourcePortfolioId;
        reqParams.cli['--source-portfolio-id'] = jsonRequestBody.sourcePortfolioId;

        reqParams.cfn['PortfolioId'] = jsonRequestBody.portfolioId;
        reqParams.cfn['ProductId'] = jsonRequestBody.productId;
        reqParams.cfn['SourcePortfolioId'] = jsonRequestBody.sourcePortfolioId;

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'AssociateProductWithPortfolio',
                'boto3': 'associate_product_with_portfolio',
                'cli': 'associate-product-with-portfolio'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('servicecatalog', details.requestId),
            'region': region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::PortfolioProductAssociation',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.CreatePortfolioShare
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/portfolio\/share\?/g)) {
        reqParams.boto3['PortfolioId'] = jsonRequestBody.portfolioId;
        reqParams.cli['--portfolio-id'] = jsonRequestBody.portfolioId;
        reqParams.boto3['AccountId'] = jsonRequestBody.accountId;
        reqParams.cli['--account-id'] = jsonRequestBody.accountId;

        reqParams.cfn['PortfolioId'] = jsonRequestBody.portfolioId;
        reqParams.cfn['AccountId'] = jsonRequestBody.accountId;

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'CreatePortfolioShare',
                'boto3': 'create_portfolio_share',
                'cli': 'create-portfolio-share'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('servicecatalog', details.requestId),
            'region': region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::PortfolioShare',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.ListTagOptions
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/tagOption\/list\?/g)) {
        reqParams.boto3['PageSize'] = getUrlValue(details.url, 'pageSize');
        reqParams.cli['--page-size'] = getUrlValue(details.url, 'pageSize');

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'ListTagOptions',
                'boto3': 'list_tag_options',
                'cli': 'list-tag-options'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.CreateTagOption
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/tagOption\/create\?/g)) {
        reqParams.boto3['Key'] = jsonRequestBody.key;
        reqParams.cli['--key'] = jsonRequestBody.key;
        reqParams.boto3['Value'] = jsonRequestBody.value;
        reqParams.cli['--value'] = jsonRequestBody.value;

        reqParams.cfn['Key'] = jsonRequestBody.key;
        reqParams.cfn['Value'] = jsonRequestBody.value;

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'CreateTagOption',
                'boto3': 'create_tag_option',
                'cli': 'create-tag-option'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('servicecatalog', details.requestId),
            'region': region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::TagOption',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.DescribeTagOption
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/tagOption\/describe\?/g)) {
        reqParams.boto3['Id'] = getUrlValue(details.url, 'id');
        reqParams.cli['--id'] = getUrlValue(details.url, 'id');

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'DescribeTagOption',
                'boto3': 'describe_tag_option',
                'cli': 'describe-tag-option'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.AssociateTagOptionWithResource
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/tagOption\/associate\?/g)) {
        reqParams.boto3['ResourceId'] = jsonRequestBody.resourceId;
        reqParams.cli['--resource-id'] = jsonRequestBody.resourceId;
        reqParams.boto3['TagOptionId'] = jsonRequestBody.tagOptionId;
        reqParams.cli['--tag-option-id'] = jsonRequestBody.tagOptionId;

        reqParams.cfn['ResourceId'] = jsonRequestBody.resourceId;
        reqParams.cfn['TagOptionId'] = jsonRequestBody.tagOptionId;

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'AssociateTagOptionWithResource',
                'boto3': 'associate_tag_option_with_resource',
                'cli': 'associate-tag-option-with-resource'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('servicecatalog', details.requestId),
            'region': region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::TagOptionAssociation',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:servicecatalog:servicecatalog.AssociatePrincipalWithPortfolio
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/servicecatalog\/service\/portfolio\/principal\?/g)) {
        reqParams.boto3['PortfolioId'] = jsonRequestBody.portfolioId;
        reqParams.cli['--portfolio-id'] = jsonRequestBody.portfolioId;
        reqParams.boto3['PrincipalARN'] = jsonRequestBody.principalARN;
        reqParams.cli['--principal-arn'] = jsonRequestBody.principalARN;
        reqParams.boto3['PrincipalType'] = jsonRequestBody.principalType;
        reqParams.cli['--principal-type'] = jsonRequestBody.principalType;

        reqParams.cfn['PortfolioId'] = jsonRequestBody.portfolioId;
        reqParams.cfn['PrincipalARN'] = jsonRequestBody.principalARN;
        reqParams.cfn['PrincipalType'] = jsonRequestBody.principalType;

        outputs.push({
            'region': region,
            'service': 'servicecatalog',
            'method': {
                'api': 'AssociatePrincipalWithPortfolio',
                'boto3': 'associate_principal_with_portfolio',
                'cli': 'associate-principal-with-portfolio'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('servicecatalog', details.requestId),
            'region': region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::PortfolioPrincipalAssociation',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // manual:elasticache:ec2.DescribeSecurityGroups
    // manual:elasticache:elasticache.DescribeCacheClusters
    // manual:elasticache:elasticache.DescribeCacheEngineVersions
    // manual:elasticache:elasticache.DescribeCacheParameterGroups
    // manual:elasticache:elasticache.DescribeCacheSubnetGroups
    // manual:elasticache:ec2.DescribeVpcs
    // manual:elasticache:sns.ListTopics
    // manual:elasticache:ec2.DescribeSubnets
    // manual:elasticache:elasticache.CreateCacheSubnetGroup
    // manual:elasticache:elasticache.CreateCacheCluster
    // manual:elasticache:elasticache.DescribeReservedCacheNodes
    // manual:elasticache:elasticache.DescribeReplicationGroups
    // manual:elasticache:elasticache.DescribeSnapshots
    // manual:elasticache:elasticache.CreateCacheParameterGroup
    // manual:elasticache:ec2.DescribeAvailabilityZones
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/elasticache\/rpc$/g)) {
        for (var i in jsonRequestBody.actions) {
            var action = jsonRequestBody.actions[i];
            if (action['action'] == "EC2.DescribeSecurityGroupsDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSecurityGroups',
                        'boto3': 'describe_security_groups',
                        'cli': 'describe-security-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "amazon.acs.acsconsole.shared.CacheClusterContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'DescribeCacheClusters',
                        'boto3': 'describe_cache_clusters',
                        'cli': 'describe-cache-clusters'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "amazon.acs.acsconsole.shared.CacheEngineVersionContext.describeCacheEngineVersions") {
                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'DescribeCacheEngineVersions',
                        'boto3': 'describe_cache_engine_versions',
                        'cli': 'describe-cache-engine-versions'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "amazon.acs.acsconsole.shared.CacheParameterGroupContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'DescribeCacheParameterGroups',
                        'boto3': 'describe-cache-parameter_groups',
                        'cli': 'describe_cache_parameter_groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "amazon.acs.acsconsole.shared.CacheSubnetGroupContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'DescribeCacheSubnetGroups',
                        'boto3': 'describe_cache_subnet_groups',
                        'cli': 'describe-cache-engine-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.gwt.ec2.requestfactory.shared.Ec2Context.describeVpcs") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeVpcs',
                        'boto3': 'describe_vpcs',
                        'cli': 'describe-vpcs'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.gwt.sns.requestfactory.shared.SnsRequestContext.listTopicArnsWithLimitedRecords") {
                outputs.push({
                    'region': region,
                    'service': 'sns',
                    'method': {
                        'api': 'ListTopics',
                        'boto3': 'list_topics',
                        'cli': 'list-topics'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "EC2.DescribeSubnetsDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSubnets',
                        'boto3': 'describe_subnets',
                        'cli': 'describe-subnets'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "amazon.acs.acsconsole.shared.CacheSubnetGroupContext.create") {
                reqParams.boto3['CacheSubnetGroupName'] = action['parameters'][0]['cacheSubnetGroupName'];
                reqParams.cli['--cache-subnet-group-name'] = action['parameters'][0]['cacheSubnetGroupName'];
                reqParams.boto3['CacheSubnetGroupDescription'] = action['parameters'][0]['cacheSubnetGroupDescription'];
                reqParams.cli['--cache-subnet-group-description'] = action['parameters'][0]['cacheSubnetGroupDescription'];
                reqParams.boto3['SubnetIds'] = action['parameters'][0]['subnetIds'];
                reqParams.cli['--subnet-ids'] = action['parameters'][0]['subnetIds'];

                reqParams.cfn['CacheSubnetGroupName'] = action['parameters'][0]['cacheSubnetGroupName'];
                reqParams.cfn['Description'] = action['parameters'][0]['cacheSubnetGroupDescription'];
                reqParams.cfn['SubnetIds'] = action['parameters'][0]['subnetIds'];

                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'CreateCacheSubnetGroup',
                        'boto3': 'create_cache_subnet_group',
                        'cli': 'create-cache-subnet-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('elasticache', details.requestId),
                    'region': region,
                    'service': 'elasticache',
                    'type': 'AWS::ElastiCache::SubnetGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "amazon.acs.acsconsole.shared.CacheClusterContext.create") {
                reqParams.boto3['NumCacheNodes'] = action['parameters'][0]['numCacheNodes'];
                reqParams.cli['--num-cache-nodes'] = action['parameters'][0]['numCacheNodes'];
                reqParams.boto3['Port'] = action['parameters'][0]['port'];
                reqParams.cli['--port'] = action['parameters'][0]['port'];
                reqParams.boto3['CacheClusterId'] = action['parameters'][0]['cacheClusterId'];
                reqParams.cli['--cache-cluster-id'] = action['parameters'][0]['cacheClusterId'];
                reqParams.boto3['CacheNodeType'] = action['parameters'][0]['cacheNodeType'];
                reqParams.cli['--cache-node-type'] = action['parameters'][0]['cacheNodeType'];
                reqParams.boto3['CacheParameterGroupName'] = action['parameters'][0]['cacheParameterGroupName'];
                reqParams.cli['--cache-parameter-group-name'] = action['parameters'][0]['cacheParameterGroupName'];
                reqParams.boto3['CacheSubnetGroupName'] = action['parameters'][0]['cacheSubnetGroupName'];
                reqParams.cli['--cache-subnet-group-name'] = action['parameters'][0]['cacheSubnetGroupName'];
                reqParams.boto3['Engine'] = action['parameters'][0]['engine'];
                reqParams.cli['--engine'] = action['parameters'][0]['engine'];
                reqParams.boto3['EngineVersion'] = action['parameters'][0]['engineVersion'];
                reqParams.cli['--engine-version'] = action['parameters'][0]['engineVersion'];
                reqParams.boto3['NotificationTopicArn'] = action['parameters'][0]['notificationTopicArn'];
                reqParams.cli['--notification-topic-arn'] = action['parameters'][0]['notificationTopicArn'];
                reqParams.boto3['PreferredMaintenanceWindow'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.cli['--preferred-maintenance-window'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.boto3['PreferredAvailabilityZones'] = action['parameters'][0]['preferredAvailabilityZones'];
                reqParams.cli['--preferred-availability-zones'] = action['parameters'][0]['preferredAvailabilityZones'];
                reqParams.boto3['SecurityGroupIds'] = action['parameters'][0]['securityGroupIds'];
                reqParams.cli['--security-group-ids'] = action['parameters'][0]['securityGroupIds'];

                reqParams.cfn['NumCacheNodes'] = action['parameters'][0]['numCacheNodes'];
                reqParams.cfn['Port'] = action['parameters'][0]['port'];
                reqParams.cfn['ClusterName'] = action['parameters'][0]['cacheClusterId'];
                reqParams.cfn['CacheNodeType'] = action['parameters'][0]['cacheNodeType'];
                reqParams.cfn['CacheParameterGroupName'] = action['parameters'][0]['cacheParameterGroupName'];
                reqParams.cfn['CacheSubnetGroupName'] = action['parameters'][0]['cacheSubnetGroupName'];
                reqParams.cfn['Engine'] = action['parameters'][0]['engine'];
                reqParams.cfn['EngineVersion'] = action['parameters'][0]['engineVersion'];
                reqParams.cfn['NotificationTopicArn'] = action['parameters'][0]['notificationTopicArn'];
                reqParams.cfn['PreferredMaintenanceWindow'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.cfn['PreferredAvailabilityZones'] = action['parameters'][0]['preferredAvailabilityZones'];
                reqParams.cfn['VpcSecurityGroupIds'] = action['parameters'][0]['securityGroupIds'];

                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'CreateCacheCluster',
                        'boto3': 'create_cache_cluster',
                        'cli': 'create-cache-cluster'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('elasticache', details.requestId),
                    'region': region,
                    'service': 'elasticache',
                    'type': 'AWS::ElastiCache::CacheCluster',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "amazon.acs.acsconsole.shared.ReservedCacheNodeRequestContext.findAll") {
                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'DescribeReservedCacheNodes',
                        'boto3': 'describe_reserved_cache_nodes',
                        'cli': 'describe-reserved-cache-nodes'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "amazon.acs.acsconsole.shared.ReplicationGroupContext.paginatedList") {
                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'DescribeReplicationGroups',
                        'boto3': 'describe_replication_groups',
                        'cli': 'describe-replication-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "amazon.acs.acsconsole.shared.SnapshotContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'DescribeSnapshots',
                        'boto3': 'describe_snapshots',
                        'cli': 'describe-snapshots'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "amazon.acs.acsconsole.shared.CacheParameterGroupContext.create") {
                reqParams.boto3['CacheParameterGroupFamily'] = action['parameters'][0]['cacheParameterGroupFamily'];
                reqParams.cli['--cache-parameter-group-family'] = action['parameters'][0]['cacheParameterGroupFamily'];
                reqParams.boto3['CacheParameterGroupName'] = action['parameters'][0]['cacheParameterGroupName'];
                reqParams.cli['--cache-parameter-group-name'] = action['parameters'][0]['cacheParameterGroupName'];
                reqParams.boto3['Description'] = action['parameters'][0]['description'];
                reqParams.cli['--description'] = action['parameters'][0]['description'];

                reqParams.cfn['CacheParameterGroupFamily'] = action['parameters'][0]['cacheParameterGroupFamily'];
                reqParams.cfn['Description'] = action['parameters'][0]['description'];

                outputs.push({
                    'region': region,
                    'service': 'elasticache',
                    'method': {
                        'api': 'CreateCacheParameterGroup',
                        'boto3': 'create_cache_parameter_group',
                        'cli': 'create-cache-parameter-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('elasticache', details.requestId),
                    'region': region,
                    'service': 'elasticache',
                    'type': 'AWS::ElastiCache::ParameterGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "EC2.DescribeAvailabilityZonesDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeAvailabilityZones',
                        'boto3': 'describe_availability_zones',
                        'cli': 'describe-availability-zones'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            }
        }
        
        return {};
    }

    // autogen:glue:glue.GetDatabases
    // autogen:glue:s3.ListBuckets
    // autogen:glue:glue.CreateTable
    // autogen:glue:glue.GetCatalogImportStatus
    // autogen:glue:glue.GetTables
    // autogen:glue:glue.GetConnections
    // autogen:glue:glue.GetConnection
    // autogen:glue:rds.DescribeDBInstances
    // autogen:glue:glue.GetConnection
    // autogen:glue:ec2.DescribeVpcs
    // autogen:glue:ec2.DescribeSubnets
    // autogen:glue:ec2.DescribeSecurityGroups
    // autogen:glue:glue.CreateConnection
    // autogen:glue:glue.GetClassifiers
    // autogen:glue:glue.CreateClassifier
    // autogen:glue:glue.PutDataCatalogEncryptionSettings
    // autogen:glue:glue.GetDataCatalogEncryptionSettings
    // autogen:glue:glue.GetJobs
    // autogen:glue:glue.GetTriggers
    // autogen:glue:glue.GetSecurityConfigurations
    // autogen:glue:glue.CreateSecurityConfiguration
    // autogen:glue:glue.DeleteSecurityConfiguration
    // autogen:glue:glue.PutDataCatalogEncryptionSettings
    // autogen:glue:glue.DeleteClassifier
    // autogen:glue:glue.BatchDeleteConnection
    // autogen:glue:glue.BatchDeleteTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/glue\/rpc$/g)) {
        for (var i in jsonRequestBody.actions) {
            var action = jsonRequestBody.actions[i];
            if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getDatabases") {
                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetDatabases',
                        'boto3': 'get_databases',
                        'cli': 'get-databases'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AmazonS3Context.listBuckets") {
                outputs.push({
                    'region': region,
                    'service': 's3',
                    'method': {
                        'api': 'ListBuckets',
                        'boto3': 'list_buckets',
                        'cli': 'list-buckets'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.createTable") {
                reqParams.boto3['TableInput'] = action['parameters'][0]['tableInput'];
                reqParams.cli['--table-input'] = action['parameters'][0]['tableInput'];
                reqParams.boto3['DatabaseName'] = action['parameters'][0]['databaseName'];
                reqParams.cli['--database-name'] = action['parameters'][0]['databaseName'];

                reqParams.cfn['TableInput'] = action['parameters'][0]['tableInput'];
                reqParams.cfn['DatabaseName'] = action['parameters'][0]['databaseName'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'CreateTable',
                        'boto3': 'create_table',
                        'cli': 'create-table'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('glue', details.requestId),
                    'region': region,
                    'service': 'glue',
                    'type': 'AWS::Glue::Table',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getCatalogImportStatus") {
                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetCatalogImportStatus',
                        'boto3': 'get_catalog_import_status',
                        'cli': 'get-catalog-import-status'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AmazonDataCatalogContext.findObjects" && action['parameters'][0]['entity'] == "TABLE") {
                reqParams.boto3['CatalogId'] = action['parameters'][0]['catalogId'];
                reqParams.cli['--catalog-id'] = action['parameters'][0]['catalogId'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetTables',
                        'boto3': 'get_tables',
                        'cli': 'get-tables'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getConnections") {
                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetConnections',
                        'boto3': 'get_connections',
                        'cli': 'get-connections'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getConnection") {
                reqParams.boto3['Name'] = action['parameters'][0]['name'];
                reqParams.cli['--name'] = action['parameters'][0]['name'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetConnection',
                        'boto3': 'get_connection',
                        'cli': 'get-connection'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AmazonRDSContext.describeDBInstances") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBInstances',
                        'boto3': 'describe_db_instances',
                        'cli': 'describe-db-instances'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getConnection") {
                reqParams.boto3['Name'] = action['parameters'][0]['name'];
                reqParams.cli['--name'] = action['parameters'][0]['name'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetConnection',
                        'boto3': 'get_connection',
                        'cli': 'get-connection'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AmazonEC2Context.describeVpcs") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeVpcs',
                        'boto3': 'describe_vpcs',
                        'cli': 'describe-vpcs'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AmazonEC2Context.describeSubnets") {
                reqParams.boto3['Filters'] = action['parameters'][0]['filters'];
                reqParams.cli['--filters'] = action['parameters'][0]['filters'];

                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSubnets',
                        'boto3': 'describe_subnets',
                        'cli': 'describe-subnets'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AmazonEC2Context.describeSecurityGroups") {
                reqParams.boto3['Filters'] = action['parameters'][0]['filters'];
                reqParams.cli['--filters'] = action['parameters'][0]['filters'];

                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSecurityGroups',
                        'boto3': 'describe_security_groups',
                        'cli': 'describe-security-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.createConnection") {
                reqParams.boto3['ConnectionInput'] = jsonRequestBody.actions;
                reqParams.cli['--connection-input'] = jsonRequestBody.actions;

                reqParams.cfn['ConnectionInput'] = jsonRequestBody.actions;

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'CreateConnection',
                        'boto3': 'create_connection',
                        'cli': 'create-connection'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('glue', details.requestId),
                    'region': region,
                    'service': 'glue',
                    'type': 'AWS::Glue::Connection',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getClassifiers") {
                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetClassifiers',
                        'boto3': 'get_classifiers',
                        'cli': 'get-classifiers'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.createClassifier") {
                if ('jsonClassifier' in action['parameters'][0]) {
                    reqParams.boto3['JsonClassifier'] = action['parameters'][0]['jsonClassifier'];
                    reqParams.cli['--json-classifier'] = action['parameters'][0]['jsonClassifier'];
                    reqParams.cfn['JsonClassifier'] = action['parameters'][0]['jsonClassifier'];
                }
                if ('grokClassifier' in action['parameters'][0]) {
                    reqParams.boto3['GrokClassifier'] = action['parameters'][0]['grokClassifier'];
                    reqParams.cli['--grok-classifier'] = action['parameters'][0]['grokClassifier'];
                    reqParams.cfn['GrokClassifier'] = action['parameters'][0]['grokClassifier'];
                }
                if ('xmlClassifier' in action['parameters'][0]) {
                    reqParams.boto3['XMLClassifier'] = action['parameters'][0]['xmlClassifier'];
                    reqParams.cli['--xml-classifier'] = action['parameters'][0]['xmlClassifier'];
                    reqParams.cfn['XMLClassifier'] = action['parameters'][0]['xmlClassifier'];
                }

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'CreateClassifier',
                        'boto3': 'create_classifier',
                        'cli': 'create-classifier'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('glue', details.requestId),
                    'region': region,
                    'service': 'glue',
                    'type': 'AWS::Glue::Classifier',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getDataCatalogEncryptionSettings") {
                reqParams.boto3['CatalogId'] = action['parameters'][0]['catalogId'];
                reqParams.cli['--catalog-id'] = action['parameters'][0]['catalogId'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetDataCatalogEncryptionSettings',
                        'boto3': 'get_data_catalog_encryption_settings',
                        'cli': 'get-data-catalog-encryption-settings'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.putDataCatalogEncryptionSettings") {
                reqParams.boto3['DataCatalogEncryptionSettings'] = action['parameters'][0]['dataCatalogEncryptionSettings'];
                reqParams.cli['--data-catalog-encryption-settings'] = action['parameters'][0]['dataCatalogEncryptionSettings'];
                reqParams.boto3['CatalogId'] = action['parameters'][0]['catalogId'];
                reqParams.cli['--catalog-id'] = action['parameters'][0]['catalogId'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'PutDataCatalogEncryptionSettings',
                        'boto3': 'put_data_catalog_encryption_settings',
                        'cli': 'put-data-catalog-encryption-settings'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getJobs") {
                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetJobs',
                        'boto3': 'get_jobs',
                        'cli': 'get-jobs'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getTriggers") {
                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetTriggers',
                        'boto3': 'get_triggers',
                        'cli': 'get-triggers'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.getSecurityConfigurations") {
                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'GetSecurityConfigurations',
                        'boto3': 'get_security_configurations',
                        'cli': 'get-security-configurations'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.createSecurityConfiguration") {
                reqParams.boto3['EncryptionConfiguration'] = action['parameters'][0]['encryptionConfiguration'];
                reqParams.cli['--encryption-configuration'] = action['parameters'][0]['encryptionConfiguration'];
                reqParams.boto3['Name'] = action['parameters'][0]['name'];
                reqParams.cli['--name'] = action['parameters'][0]['name'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'CreateSecurityConfiguration',
                        'boto3': 'create_security_configuration',
                        'cli': 'create-security-configuration'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.deleteSecurityConfiguration") {
                reqParams.boto3['Name'] = action['parameters'][0]['name'];
                reqParams.cli['--name'] = action['parameters'][0]['name'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'DeleteSecurityConfiguration',
                        'boto3': 'delete_security_configuration',
                        'cli': 'delete-security-configuration'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.putDataCatalogEncryptionSettings") {
                reqParams.boto3['DataCatalogEncryptionSettings'] = action['parameters'][0]['dataCatalogEncryptionSettings'];
                reqParams.cli['--data-catalog-encryption-settings'] = action['parameters'][0]['dataCatalogEncryptionSettings'];
                reqParams.boto3['CatalogId'] = action['parameters'][0]['catalogId'];
                reqParams.cli['--catalog-id'] = action['parameters'][0]['catalogId'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'PutDataCatalogEncryptionSettings',
                        'boto3': 'put_data_catalog_encryption_settings',
                        'cli': 'put-data-catalog-encryption-settings'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.deleteClassifier") {
                reqParams.boto3['Name'] = action['parameters'][0]['name'];
                reqParams.cli['--name'] = action['parameters'][0]['name'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'DeleteClassifier',
                        'boto3': 'delete_classifier',
                        'cli': 'delete-classifier'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.batchDeleteConnection") {
                reqParams.boto3['ConnectionNameList'] = action['parameters'][0]['connectionNameList'];
                reqParams.cli['--connection-name-list'] = action['parameters'][0]['connectionNameList'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'BatchDeleteConnection',
                        'boto3': 'batch_delete_connection',
                        'cli': 'batch-delete-connection'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.glue.awssdk.shared.context.AWSGlueContext.batchDeleteTable") {
                reqParams.boto3['DatabaseName'] = action['parameters'][0]['databaseName'];
                reqParams.cli['--database-name'] = action['parameters'][0]['databaseName'];
                reqParams.boto3['TablesToDelete'] = action['parameters'][0]['tablesToDelete'];
                reqParams.cli['--tables-to-delete'] = action['parameters'][0]['tablesToDelete'];

                outputs.push({
                    'region': region,
                    'service': 'glue',
                    'method': {
                        'api': 'BatchDeleteTable',
                        'boto3': 'batch_delete_table',
                        'cli': 'batch-delete-table'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            }
        }

        return {};
    }

    // autogen:rds:rds.DescribeDBSecurityGroups
    // autogen:rds:kms.DescribeKey
    // autogen:rds:ec2.DescribeSecurityGroups
    // autogen:rds:ec2.DescribeVpcs
    // autogen:rds:rds.DescribeDBParameterGroups
    // autogen:rds:rds.DescribeDBClusterParameterGroups
    // autogen:rds:rds.DescribeDBSubnetGroups
    // autogen:rds:ec2.DescribeSecurityGroups
    // autogen:rds:rds.CreateDBInstance
    // autogen:rds:rds.DescribeEvents
    // autogen:rds:rds.DescribeDBLogFiles
    // autogen:rds:rds.DescribeDBClusters
    // autogen:rds:ec2.DescribeSecurityGroups
    // autogen:rds:rds.DescribeOptionGroups
    // autogen:rds:rds.DescribeDBSnapshots
    // autogen:rds:rds.DescribeDBSnapshots
    // autogen:rds:rds.DescribeDBClusterSnapshots
    // autogen:rds:rds.DescribeReservedDBInstances
    // autogen:rds:rds.DescribeDBSubnetGroups
    // autogen:rds:ec2.DescribeAvailabilityZones
    // autogen:rds:rds.CreateDBSubnetGroup
    // autogen:rds:rds.DescribeDBParameterGroups
    // autogen:rds:rds.CreateDBParameterGroup
    // autogen:rds:rds.CreateOptionGroup
    // autogen:rds:sns.ListTopics
    // autogen:rds:rds.CreateEventSubscription
    // autogen:rds:rds.DescribeEventSubscriptions
    // autogen:rds:rds.StopDBCluster
    // autogen:rds:rds.CreateDBClusterParameterGroup
    // autogen:rds:rds.StartDBCluster
    // autogen:rds:rds.DeleteDBInstance
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/rds\/rpc$/g)) {
        for (var i in jsonRequestBody.actions) {
            var action = jsonRequestBody.actions[i];
            if (action['action'] == "com.amazonaws.console.rds.shared.DbSecurityGroupContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBSecurityGroups',
                        'boto3': 'describe_db_security_groups',
                        'cli': 'describe-db-security-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.gwt.trent.requestfactory.shared.TrentRequestContext.describeKey") {
                reqParams.boto3['KeyId'] = action['parameters'][0]['keyId'];
                reqParams.cli['--key-id'] = action['parameters'][0]['keyId'];
        
                outputs.push({
                    'region': region,
                    'service': 'kms',
                    'method': {
                        'api': 'DescribeKey',
                        'boto3': 'describe_key',
                        'cli': 'describe-key'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "EC2.DescribeSecurityGroupsDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSecurityGroups',
                        'boto3': 'describe_security_groups',
                        'cli': 'describe-security-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "EC2.DescribeVpcsDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeVpcs',
                        'boto3': 'describe_vpcs',
                        'cli': 'describe-vpcs'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbParamGroupContext.findDbParameterGroups") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBParameterGroups',
                        'boto3': 'describe_db_parameter_groups',
                        'cli': 'describe-db-parameter-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbParamGroupContext.listDbClusterParameterGroups") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBClusterParameterGroups',
                        'boto3': 'describe_db_cluster_parameter_groups',
                        'cli': 'describe-db-cluster-parameter-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DBSubnetGroupContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBSubnetGroups',
                        'boto3': 'describe_db_subnet_groups',
                        'cli': 'describe-db-subnet-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "EC2.DescribeSecurityGroupsDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSecurityGroups',
                        'boto3': 'describe_security_groups',
                        'cli': 'describe-security-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbInstanceContext.create") {
                reqParams.boto3['AutoMinorVersionUpgrade'] = action['parameters'][0]['autoMinorVersionUpgrade'];
                reqParams.cli['--auto-minor-version-upgrade'] = action['parameters'][0]['autoMinorVersionUpgrade'];
                reqParams.boto3['CopyTagsToSnapshot'] = action['parameters'][0]['copyTagsToSnapshot'];
                reqParams.cli['--copy-tags-to-snapshot'] = action['parameters'][0]['copyTagsToSnapshot'];
                reqParams.boto3['DeletionProtection'] = action['parameters'][0]['deletionProtection'];
                reqParams.cli['--deletion-protection'] = action['parameters'][0]['deletionProtection'];
                reqParams.boto3['MultiAZ'] = action['parameters'][0]['multiAZ'];
                reqParams.cli['--multi-az'] = action['parameters'][0]['multiAZ'];
                reqParams.boto3['PubliclyAccessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.cli['--publicly-accessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.boto3['StorageEncrypted'] = action['parameters'][0]['storageEncrypted'];
                reqParams.cli['--storage-encrypted'] = action['parameters'][0]['storageEncrypted'];
                reqParams.boto3['AllocatedStorage'] = action['parameters'][0]['allocatedStorage'];
                reqParams.cli['--allocated-storage'] = action['parameters'][0]['allocatedStorage'];
                reqParams.boto3['BackupRetentionPeriod'] = action['parameters'][0]['backupRetentionPeriod'];
                reqParams.cli['--backup-retention-period'] = action['parameters'][0]['backupRetentionPeriod'];
                reqParams.boto3['Iops'] = action['parameters'][0]['iops'];
                reqParams.cli['--iops'] = action['parameters'][0]['iops'];
                reqParams.boto3['MonitoringInterval'] = action['parameters'][0]['monitoringInterval'];
                reqParams.cli['--monitoring-interval'] = action['parameters'][0]['monitoringInterval'];
                reqParams.boto3['Port'] = action['parameters'][0]['port'];
                reqParams.cli['--port'] = action['parameters'][0]['port'];
                reqParams.boto3['PromotionTier'] = action['parameters'][0]['promotionTier'];
                reqParams.cli['--promotion-tier'] = action['parameters'][0]['promotionTier'];
                reqParams.boto3['AvailabilityZone'] = action['parameters'][0]['availabilityZone'];
                reqParams.cli['--availability-zone'] = action['parameters'][0]['availabilityZone'];
                reqParams.boto3['DBInstanceClass'] = action['parameters'][0]['DBInstanceClass'];
                reqParams.cli['--db-instance-class'] = action['parameters'][0]['DBInstanceClass'];
                reqParams.boto3['DBInstanceIdentifier'] = action['parameters'][0]['DBInstanceIdentifier'];
                reqParams.cli['--db-instance-identifier'] = action['parameters'][0]['DBInstanceIdentifier'];
                reqParams.boto3['DBName'] = action['parameters'][0]['DBName'];
                reqParams.cli['--db-name'] = action['parameters'][0]['DBName'];
                reqParams.boto3['DBParameterGroupName'] = action['parameters'][0]['DBParameterGroupName'];
                reqParams.cli['--db-parameter-group-name'] = action['parameters'][0]['DBParameterGroupName'];
                reqParams.boto3['DBSubnetGroupName'] = action['parameters'][0]['DBSubnetGroupName'];
                reqParams.cli['--db-subnet-group-name'] = action['parameters'][0]['DBSubnetGroupName'];
                reqParams.boto3['DBClusterIdentifier'] = action['parameters'][0]['dbClusterIdentifier'];
                reqParams.cli['--db-cluster-identifier'] = action['parameters'][0]['dbClusterIdentifier'];
                reqParams.boto3['Engine'] = action['parameters'][0]['engine'];
                reqParams.cli['--engine'] = action['parameters'][0]['engine'];
                reqParams.boto3['EngineVersion'] = action['parameters'][0]['engineVersion'];
                reqParams.cli['--engine-version'] = action['parameters'][0]['engineVersion'];
                reqParams.boto3['LicenseModel'] = action['parameters'][0]['licenseModel'];
                reqParams.cli['--license-model'] = action['parameters'][0]['licenseModel'];
                reqParams.boto3['MasterUserPassword'] = action['parameters'][0]['masterUserPassword'];
                reqParams.cli['--master-user-password'] = action['parameters'][0]['masterUserPassword'];
                reqParams.boto3['MasterUsername'] = action['parameters'][0]['masterUsername'];
                reqParams.cli['--master-username'] = action['parameters'][0]['masterUsername'];
                reqParams.boto3['MonitoringRoleArn'] = action['parameters'][0]['monitoringRoleArn'];
                reqParams.cli['--monitoring-role-arn'] = action['parameters'][0]['monitoringRoleArn'];
                reqParams.boto3['OptionGroupName'] = action['parameters'][0]['optionGroupName'];
                reqParams.cli['--option-group-name'] = action['parameters'][0]['optionGroupName'];
                reqParams.boto3['PreferredMaintenanceWindow'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.cli['--preferred-maintenance-window'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.boto3['StorageType'] = action['parameters'][0]['storageType'];
                reqParams.cli['--storage-type'] = action['parameters'][0]['storageType'];
                reqParams.boto3['EnableCloudwatchLogsExports'] = action['parameters'][0]['enableCloudwatchLogsExports'];
                reqParams.cli['--enable-cloudwatch-logs-exports'] = action['parameters'][0]['enableCloudwatchLogsExports'];
                reqParams.boto3['VpcSecurityGroupIds'] = action['parameters'][0]['vpcSecurityGroupIds'];
                reqParams.cli['--vpc-security-group-ids'] = action['parameters'][0]['vpcSecurityGroupIds'];

                reqParams.cfn['AutoMinorVersionUpgrade'] = action['parameters'][0]['autoMinorVersionUpgrade'];
                reqParams.cfn['CopyTagsToSnapshot'] = action['parameters'][0]['copyTagsToSnapshot'];
                reqParams.cfn['MultiAZ'] = action['parameters'][0]['multiAZ'];
                reqParams.cfn['PubliclyAccessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.cfn['StorageEncrypted'] = action['parameters'][0]['storageEncrypted'];
                reqParams.cfn['AllocatedStorage'] = action['parameters'][0]['allocatedStorage'];
                reqParams.cfn['BackupRetentionPeriod'] = action['parameters'][0]['backupRetentionPeriod'];
                reqParams.cfn['Iops'] = action['parameters'][0]['iops'];
                reqParams.cfn['MonitoringInterval'] = action['parameters'][0]['monitoringInterval'];
                reqParams.cfn['Port'] = action['parameters'][0]['port'];
                reqParams.cfn['AvailabilityZone'] = action['parameters'][0]['availabilityZone'];
                reqParams.cfn['DBInstanceClass'] = action['parameters'][0]['DBInstanceClass'];
                reqParams.cfn['DBInstanceIdentifier'] = action['parameters'][0]['DBInstanceIdentifier'];
                reqParams.cfn['DBName'] = action['parameters'][0]['DBName'];
                reqParams.cfn['DBParameterGroupName'] = action['parameters'][0]['DBParameterGroupName'];
                reqParams.cfn['DBSubnetGroupName'] = action['parameters'][0]['DBSubnetGroupName'];
                reqParams.cfn['DBClusterIdentifier'] = action['parameters'][0]['dbClusterIdentifier'];
                reqParams.cfn['Engine'] = action['parameters'][0]['engine'];
                reqParams.cfn['EngineVersion'] = action['parameters'][0]['engineVersion'];
                reqParams.cfn['LicenseModel'] = action['parameters'][0]['licenseModel'];
                reqParams.cfn['MasterUserPassword'] = action['parameters'][0]['masterUserPassword'];
                reqParams.cfn['MasterUsername'] = action['parameters'][0]['masterUsername'];
                reqParams.cfn['MonitoringRoleArn'] = action['parameters'][0]['monitoringRoleArn'];
                reqParams.cfn['OptionGroupName'] = action['parameters'][0]['optionGroupName'];
                reqParams.cfn['PreferredMaintenanceWindow'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.cfn['StorageType'] = action['parameters'][0]['storageType'];
                reqParams.cfn['VPCSecurityGroups'] = action['parameters'][0]['vpcSecurityGroupIds'];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'CreateDBInstance',
                        'boto3': 'create_db_instance',
                        'cli': 'create-db-instance'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('rds', details.requestId),
                    'region': region,
                    'service': 'rds',
                    'type': 'AWS::RDS::DBInstance',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.rds.shared.EventContext.findEvents") {
                reqParams.boto3['Duration'] = action['parameters'][0]['duration'];
                reqParams.cli['--duration'] = action['parameters'][0]['duration'];
                reqParams.boto3['MaxRecords'] = action['parameters'][0]['maxRecords'];
                reqParams.cli['--max-records'] = action['parameters'][0]['maxRecords'];
                reqParams.boto3['SourceIdentifier'] = action['parameters'][0]['sourceIdentifier'];
                reqParams.cli['--source-identifier'] = action['parameters'][0]['sourceIdentifier'];
                reqParams.boto3['SourceType'] = action['parameters'][0]['sourceType'];
                reqParams.cli['--source-type'] = action['parameters'][0]['sourceType'];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeEvents',
                        'boto3': 'describe_events',
                        'cli': 'describe-events'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DBLogFileContext.list") {
                reqParams.boto3['DBInstanceIdentifier'] = action['parameters'][0];
                reqParams.cli['--db-instance-identifier'] = action['parameters'][0];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBLogFiles',
                        'boto3': 'describe_db_log_files',
                        'cli': 'describe-db-log-files'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DBSnapshotContext.findByDbClusterIdentifier") {
                reqParams.boto3['DBClusterIdentifier'] = action['parameters'][0];
                reqParams.cli['--db-cluster-identifier'] = action['parameters'][0];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBClusters',
                        'boto3': 'describe_db_clusters',
                        'cli': 'describe-db-clusters'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.gwt.ec2.requestfactory.shared.Ec2Context.describeSecurityGroups") {
                reqParams.boto3['GroupIds'] = action['parameters'][0]['groupIds'];
                reqParams.cli['--group-ids'] = action['parameters'][0]['groupIds'];
        
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSecurityGroups',
                        'boto3': 'describe_security_groups',
                        'cli': 'describe-security-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.OptionGroupContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeOptionGroups',
                        'boto3': 'describe_option_groups',
                        'cli': 'describe-option-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DBSnapshotContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBSnapshots',
                        'boto3': 'describe_db_snapshots',
                        'cli': 'describe-db-snapshots'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DBSnapshotContext.describeDBSnapshotsResult") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBSnapshots',
                        'boto3': 'describe_db_snapshots',
                        'cli': 'describe-db-snapshots'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DBSnapshotContext.describeDBClusterSnapshotsResult") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBClusterSnapshots',
                        'boto3': 'describe_db_cluster_snapshots',
                        'cli': 'describe-db-cluster-snapshots'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.ReservedDBInstanceContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeReservedDBInstances',
                        'boto3': 'describe_reserved_db_instances',
                        'cli': 'describe-reserved-db-instances'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DBSubnetGroupContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBSubnetGroups',
                        'boto3': 'describe_db_subnet_groups',
                        'cli': 'describe-db-subnet-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "EC2.DescribeAvailabilityZonesDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeAvailabilityZones',
                        'boto3': 'describe_availability_zones',
                        'cli': 'describe-availability-zones'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DBSubnetGroupContext.create") {
                reqParams.boto3['DBSubnetGroupDescription'] = action['parameters'][0]['DBSubnetGroupDescription'];
                reqParams.cli['--db-subnet-group-description'] = action['parameters'][0]['DBSubnetGroupDescription'];
                reqParams.boto3['DBSubnetGroupName'] = action['parameters'][0]['DBSubnetGroupName'];
                reqParams.cli['--db-subnet-group-name'] = action['parameters'][0]['DBSubnetGroupName'];
                reqParams.boto3['SubnetIds'] = action['parameters'][0]['subnetIds'];
                reqParams.cli['--subnet-ids'] = action['parameters'][0]['subnetIds'];

                reqParams.cfn['DBSubnetGroupDescription'] = action['parameters'][0]['DBSubnetGroupDescription'];
                reqParams.cfn['DBSubnetGroupName'] = action['parameters'][0]['DBSubnetGroupName'];
                reqParams.cfn['SubnetIds'] = action['parameters'][0]['subnetIds'];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'CreateDBSubnetGroup',
                        'boto3': 'create_db_subnet_group',
                        'cli': 'create-db-subnet-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('rds', details.requestId),
                    'region': region,
                    'service': 'rds',
                    'type': 'AWS::RDS::DBSubnetGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbParamGroupContext.findDbParameterGroups") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBParameterGroups',
                        'boto3': 'describe_db_parameter_groups',
                        'cli': 'describe-db-parameter-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbParamGroupContext.createDbParameterGroup") {
                reqParams.boto3['DBParameterGroupFamily'] = action['parameters'][0];
                reqParams.cli['--db-parameter-group-family'] = action['parameters'][0];
                reqParams.boto3['DBParameterGroupName'] = action['parameters'][1];
                reqParams.cli['--db-parameter-group-name'] = action['parameters'][1];
                reqParams.boto3['Description'] = action['parameters'][2];
                reqParams.cli['--description'] = action['parameters'][2];

                reqParams.cfn['Family'] = action['parameters'][0];
                reqParams.cfn['Description'] = action['parameters'][2];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'CreateDBParameterGroup',
                        'boto3': 'create_db_parameter_group',
                        'cli': 'create-db-parameter-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('rds', details.requestId),
                    'region': region,
                    'service': 'rds',
                    'type': 'AWS::RDS::DBParameterGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.rds.shared.OptionGroupContext.create") {
                reqParams.boto3['EngineName'] = action['parameters'][0]['engineName'];
                reqParams.cli['--engine-name'] = action['parameters'][0]['engineName'];
                reqParams.boto3['MajorEngineVersion'] = action['parameters'][0]['majorEngineVersion'];
                reqParams.cli['--major-engine-version'] = action['parameters'][0]['majorEngineVersion'];
                reqParams.boto3['OptionGroupDescription'] = action['parameters'][0]['optionGroupDescription'];
                reqParams.cli['--option-group-description'] = action['parameters'][0]['optionGroupDescription'];
                reqParams.boto3['OptionGroupName'] = action['parameters'][0]['optionGroupName'];
                reqParams.cli['--option-group-name'] = action['parameters'][0]['optionGroupName'];

                reqParams.cfn['EngineName'] = action['parameters'][0]['engineName'];
                reqParams.cfn['MajorEngineVersion'] = action['parameters'][0]['majorEngineVersion'];
                reqParams.cfn['OptionGroupDescription'] = action['parameters'][0]['optionGroupDescription'];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'CreateOptionGroup',
                        'boto3': 'create_option_group',
                        'cli': 'create-option-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('rds', details.requestId),
                    'region': region,
                    'service': 'rds',
                    'type': 'AWS::RDS::OptionGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.gwt.sns.requestfactory.shared.SnsRequestContext.listTopicArns") {
                outputs.push({
                    'region': region,
                    'service': 'sns',
                    'method': {
                        'api': 'ListTopics',
                        'boto3': 'list_topics',
                        'cli': 'list-topics'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.EventSubscriptionContext.create") {
                reqParams.boto3['Enabled'] = action['parameters'][0]['enabled'];
                reqParams.cli['--enabled'] = action['parameters'][0]['enabled'];
                reqParams.boto3['SnsTopicArn'] = action['parameters'][0]['snsTopicArn'];
                reqParams.cli['--sns-topic-arn'] = action['parameters'][0]['snsTopicArn'];
                reqParams.boto3['SourceType'] = action['parameters'][0]['sourceType'];
                reqParams.cli['--source-type'] = action['parameters'][0]['sourceType'];
                reqParams.boto3['SubscriptionName'] = action['parameters'][0]['subscriptionName'];
                reqParams.cli['--subscription-name'] = action['parameters'][0]['subscriptionName'];
                reqParams.boto3['EventCategories'] = action['parameters'][0]['eventCategories'];
                reqParams.cli['--event-categories'] = action['parameters'][0]['eventCategories'];
                reqParams.boto3['SourceIds'] = action['parameters'][0]['sourceIds'];
                reqParams.cli['--source-ids'] = action['parameters'][0]['sourceIds'];

                reqParams.cfn['Enabled'] = action['parameters'][0]['enabled'];
                reqParams.cfn['SnsTopicArn'] = action['parameters'][0]['snsTopicArn'];
                reqParams.cfn['SourceType'] = action['parameters'][0]['sourceType'];
                reqParams.cfn['EventCategories'] = action['parameters'][0]['eventCategories'];
                reqParams.cfn['SourceIds'] = action['parameters'][0]['sourceIds'];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'CreateEventSubscription',
                        'boto3': 'create_event_subscription',
                        'cli': 'create-event-subscription'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('rds', details.requestId),
                    'region': region,
                    'service': 'rds',
                    'type': 'AWS::RDS::EventSubscription',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.rds.shared.EventSubscriptionContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeEventSubscriptions',
                        'boto3': 'describe_event_subscriptions',
                        'cli': 'describe-event-subscriptions'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbCContext.stopDBCluster") {
                reqParams.boto3['DBClusterIdentifier'] = action['parameters'][0];
                reqParams.cli['--db-cluster-identifier'] = action['parameters'][0];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'StopDBCluster',
                        'boto3': 'stop_db_cluster',
                        'cli': 'stop-db-cluster'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbParamGroupContext.createDbClusterParameterGroup") {
                reqParams.boto3['DBParameterGroupFamily'] = action['parameters'][0];
                reqParams.cli['--db-parameter-group-family'] = action['parameters'][0];
                reqParams.boto3['DBClusterParameterGroupName'] = action['parameters'][1];
                reqParams.cli['--db-cluster-parameter-group-name'] = action['parameters'][1];
                reqParams.boto3['Description'] = action['parameters'][2];
                reqParams.cli['--description'] = action['parameters'][2];

                reqParams.cfn['Family'] = action['parameters'][0];
                reqParams.cfn['Description'] = action['parameters'][2];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'CreateDBClusterParameterGroup',
                        'boto3': 'create_db_cluster_parameter_group',
                        'cli': 'create-db-cluster-parameter-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('rds', details.requestId),
                    'region': region,
                    'service': 'rds',
                    'type': 'AWS::RDS::DBClusterParameterGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbCContext.startDBCluster") {
                reqParams.boto3['DBClusterIdentifier'] = action['parameters'][0];
                reqParams.cli['--db-cluster-identifier'] = action['parameters'][0];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'StartDBCluster',
                        'boto3': 'start_db_cluster',
                        'cli': 'start-db-cluster'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.rds.shared.DbInstanceContext.delete") {
                reqParams.boto3['SkipFinalSnapshot'] = action['parameters'][0]['skipFinalSnapshot'];
                reqParams.cli['--skip-final-snapshot'] = action['parameters'][0]['skipFinalSnapshot'];
                reqParams.boto3['DBInstanceIdentifier'] = action['parameters'][0]['DBInstanceIdentifier'];
                reqParams.cli['--db-instance-identifier'] = action['parameters'][0]['DBInstanceIdentifier'];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DeleteDBInstance',
                        'boto3': 'delete_db_instance',
                        'cli': 'delete-db-instance'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            }                     
            
        }

        return {};
    }
       
    // autogen:lambda:lambda.ListFunctions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=listFunctions&/g)) {

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'ListFunctions',
                'boto3': 'list_functions',
                'cli': 'list-functions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:iam.ListRoles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=listRoles&/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListRoles',
                'boto3': 'list_roles',
                'cli': 'list-roles'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:iam.ListRoles
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=listRoles&/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListRoles',
                'boto3': 'list_roles',
                'cli': 'list-roles'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=listVpcs&/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:lambda.GetFunctionConfiguration
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=getFunctionConfiguration&/g)) {
        reqParams.boto3['FunctionName'] = jsonRequestBody.functionName;
        reqParams.cli['--function-name'] = jsonRequestBody.functionName;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'GetFunctionConfiguration',
                'boto3': 'get_function_configuration',
                'cli': 'get-function-configuration'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:lambda.GetFunction
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=getFunctionCode&/g)) {
        reqParams.boto3['FunctionName'] = jsonRequestBody.functionName;
        reqParams.cli['--function-name'] = jsonRequestBody.functionName;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'GetFunction',
                'boto3': 'get_function',
                'cli': 'get-function'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:lambda.ListTags
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=listTags&/g)) {
        reqParams.boto3['Resource'] = jsonRequestBody.functionName;
        reqParams.cli['--resource'] = jsonRequestBody.functionName;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'ListTags',
                'boto3': 'list_tags',
                'cli': 'list-tags'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:iam.GetRole
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=getRole&/g)) {
        reqParams.boto3['RoleName'] = jsonRequestBody.roleName;
        reqParams.cli['--role-name'] = jsonRequestBody.roleName;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'GetRole',
                'boto3': 'get_role',
                'cli': 'get-role'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:kms.ListKeys
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=listKmsKeys&/g)) {

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'ListKeys',
                'boto3': 'list_keys',
                'cli': 'list-keys'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:lambda.CreateAlias
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=createAlias&/g)) {
        reqParams.boto3['FunctionName'] = jsonRequestBody.functionName;
        reqParams.cli['--function-name'] = jsonRequestBody.functionName;
        reqParams.boto3['Name'] = jsonRequestBody.name;
        reqParams.cli['--name'] = jsonRequestBody.name;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['FunctionVersion'] = jsonRequestBody.functionVersion;
        reqParams.cli['--function-version'] = jsonRequestBody.functionVersion;

        reqParams.cfn['FunctionName'] = jsonRequestBody.functionName;
        reqParams.cfn['Name'] = jsonRequestBody.name;
        reqParams.cfn['Description'] = jsonRequestBody.description;
        reqParams.cfn['FunctionVersion'] = jsonRequestBody.functionVersion;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'CreateAlias',
                'boto3': 'create_alias',
                'cli': 'create-alias'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('lambda', details.requestId),
            'region': region,
            'service': 'lambda',
            'type': 'AWS::Lambda::Alias',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:lambda:lambda.GetAlias
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=getAlias&/g)) {
        reqParams.boto3['FunctionName'] = jsonRequestBody.functionName;
        reqParams.cli['--function-name'] = jsonRequestBody.functionName;
        reqParams.boto3['Name'] = jsonRequestBody.name;
        reqParams.cli['--name'] = jsonRequestBody.name;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'GetAlias',
                'boto3': 'get_alias',
                'cli': 'get-alias'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:lambda:lambda.DeleteFunction
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=deleteFunction&/g)) {
        reqParams.boto3['FunctionName'] = jsonRequestBody.functionName;
        reqParams.cli['--function-name'] = jsonRequestBody.functionName;
        reqParams.boto3['Qualifier'] = jsonRequestBody.qualifier;
        reqParams.cli['--qualifier'] = jsonRequestBody.qualifier;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'DeleteFunction',
                'boto3': 'delete_function',
                'cli': 'delete-function'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:lambda:lambda.PublishVersion
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/lambda\/services\/ajax\?operation=publishVersion&/g)) {
        reqParams.boto3['FunctionName'] = jsonRequestBody.payload.functionName;
        reqParams.cli['--function-name'] = jsonRequestBody.payload.functionName;
        reqParams.boto3['Description'] = jsonRequestBody.payload.description;
        reqParams.cli['--description'] = jsonRequestBody.payload.description;

        reqParams.cfn['FunctionName'] = jsonRequestBody.payload.functionName;
        reqParams.cfn['Description'] = jsonRequestBody.payload.description;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'PublishVersion',
                'boto3': 'publish_version',
                'cli': 'publish-version'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('lambda', details.requestId),
            'region': region,
            'service': 'lambda',
            'type': 'AWS::Lambda::Version',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }
 
    // autogen:lambda:lambda.CreateFunction
    if (details.method == "POST" && details.url.match(/.+lambda\.[a-z0-9-]+\.amazonaws\.com\/2015\-03\-31\/functions$/g)) {
        reqParams.boto3['Code'] = jsonRequestBody.Code;
        reqParams.cli['--code'] = jsonRequestBody.Code;
        reqParams.boto3['Description'] = jsonRequestBody.Description;
        reqParams.cli['--description'] = jsonRequestBody.Description;
        reqParams.boto3['FunctionName'] = jsonRequestBody.FunctionName;
        reqParams.cli['--function-name'] = jsonRequestBody.FunctionName;
        reqParams.boto3['Handler'] = jsonRequestBody.Handler;
        reqParams.cli['--handler'] = jsonRequestBody.Handler;
        reqParams.boto3['MemorySize'] = jsonRequestBody.MemorySize;
        reqParams.cli['--memory-size'] = jsonRequestBody.MemorySize;
        reqParams.boto3['Role'] = jsonRequestBody.Role;
        reqParams.cli['--role'] = jsonRequestBody.Role;
        reqParams.boto3['Runtime'] = jsonRequestBody.Runtime;
        reqParams.cli['--runtime'] = jsonRequestBody.Runtime;
        reqParams.boto3['Timeout'] = jsonRequestBody.Timeout;
        reqParams.cli['--timeout'] = jsonRequestBody.Timeout;
        reqParams.boto3['DeadLetterConfig'] = jsonRequestBody.DeadLetterConfig;
        reqParams.cli['--dead-letter-config'] = jsonRequestBody.DeadLetterConfig;
        reqParams.boto3['KMSKeyArn'] = jsonRequestBody.KMSKeyArn;
        reqParams.cli['--kms-key-arn'] = jsonRequestBody.KMSKeyArn;
        reqParams.boto3['TracingConfig'] = jsonRequestBody.TracingConfig;
        reqParams.cli['--tracing-config'] = jsonRequestBody.TracingConfig;

        reqParams.cfn['Code'] = jsonRequestBody.Code;
        reqParams.cfn['Description'] = jsonRequestBody.Description;
        reqParams.cfn['FunctionName'] = jsonRequestBody.FunctionName;
        reqParams.cfn['Handler'] = jsonRequestBody.Handler;
        reqParams.cfn['MemorySize'] = jsonRequestBody.MemorySize;
        reqParams.cfn['Role'] = jsonRequestBody.Role;
        reqParams.cfn['Runtime'] = jsonRequestBody.Runtime;
        reqParams.cfn['Timeout'] = jsonRequestBody.Timeout;
        reqParams.cfn['DeadLetterConfig'] = jsonRequestBody.DeadLetterConfig;
        reqParams.cfn['KmsKeyArn'] = jsonRequestBody.KMSKeyArn;
        reqParams.cfn['TracingConfig'] = jsonRequestBody.TracingConfig;

        outputs.push({
            'region': region,
            'service': 'lambda',
            'method': {
                'api': 'CreateFunction',
                'boto3': 'create_function',
                'cli': 'create-function'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('lambda', details.requestId),
            'region': region,
            'service': 'lambda',
            'type': 'AWS::Lambda::Function',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:es:es.ListDomainNames
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "ListDomainNames") {

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'ListDomainNames',
                'boto3': 'list_domain_names',
                'cli': 'list-domain-names'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:es.ListElasticsearchVersions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "ListElasticsearchVersions") {

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'ListElasticsearchVersions',
                'boto3': 'list_elasticsearch_versions',
                'cli': 'list-elasticsearch-versions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:es.ListElasticsearchInstanceTypes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "listElasticsearchInstanceTypes") {

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'ListElasticsearchInstanceTypes',
                'boto3': 'list_elasticsearch_instance_types',
                'cli': 'list-elasticsearch-instance-types'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:kms.DescribeKey
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/kms$/g) && jsonRequestBody.operation == "DescribeKey") {
        reqParams.boto3['KeyId'] = jsonRequestBody.contentString.KeyId;
        reqParams.cli['--key-id'] = jsonRequestBody.contentString.KeyId;

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'DescribeKey',
                'boto3': 'describe_key',
                'cli': 'describe-key'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/ec2$/g) && jsonRequestBody.operation == "DescribeVpcs") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:iam.GetRole
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/iam$/g) && jsonRequestBody.operation == "GetRole") {
        reqParams.boto3['RoleName'] = jsonRequestBody.params.RoleName;
        reqParams.cli['--role-name'] = jsonRequestBody.params.RoleName;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'GetRole',
                'boto3': 'get_role',
                'cli': 'get-role'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/ec2$/g) && jsonRequestBody.operation == "DescribeSubnets") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:ec2.DescribeSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/ec2$/g) && jsonRequestBody.operation == "DescribeSecurityGroups") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSecurityGroups',
                'boto3': 'describe_security_groups',
                'cli': 'describe-security-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:es.CreateElasticsearchDomain
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "CreateElasticsearchDomain") {
        reqParams.boto3['ElasticsearchClusterConfig'] = jsonRequestBody.contentString.ElasticsearchClusterConfig;
        reqParams.cli['--elasticsearch-cluster-config'] = jsonRequestBody.contentString.ElasticsearchClusterConfig;
        reqParams.boto3['EBSOptions'] = jsonRequestBody.contentString.EBSOptions;
        reqParams.cli['--ebs-options'] = jsonRequestBody.contentString.EBSOptions;
        reqParams.boto3['EncryptionAtRestOptions'] = jsonRequestBody.contentString.EncryptionAtRestOptions;
        reqParams.cli['--encryption-at-rest-options'] = jsonRequestBody.contentString.EncryptionAtRestOptions;
        reqParams.boto3['SnapshotOptions'] = jsonRequestBody.contentString.SnapshotOptions;
        reqParams.cli['--snapshot-options'] = jsonRequestBody.contentString.SnapshotOptions;
        reqParams.boto3['VPCOptions'] = jsonRequestBody.contentString.VPCOptions;
        reqParams.cli['--vpc-options'] = jsonRequestBody.contentString.VPCOptions;
        reqParams.boto3['AdvancedOptions'] = jsonRequestBody.contentString.AdvancedOptions;
        reqParams.cli['--advanced-options'] = jsonRequestBody.contentString.AdvancedOptions;
        reqParams.boto3['CognitoOptions'] = jsonRequestBody.contentString.CognitoOptions;
        reqParams.cli['--cognito-options'] = jsonRequestBody.contentString.CognitoOptions;
        reqParams.boto3['NodeToNodeEncryptionOptions'] = jsonRequestBody.contentString.NodeToNodeEncryptionOptions;
        reqParams.cli['--node-to-node-encryption-options'] = jsonRequestBody.contentString.NodeToNodeEncryptionOptions;
        reqParams.boto3['DomainName'] = jsonRequestBody.contentString.DomainName;
        reqParams.cli['--domain-name'] = jsonRequestBody.contentString.DomainName;
        reqParams.boto3['ElasticsearchVersion'] = jsonRequestBody.contentString.ElasticsearchVersion;
        reqParams.cli['--elasticsearch-version'] = jsonRequestBody.contentString.ElasticsearchVersion;
        reqParams.boto3['AccessPolicies'] = jsonRequestBody.contentString.AccessPolicies;
        reqParams.cli['--access-policies'] = jsonRequestBody.contentString.AccessPolicies;

        reqParams.cfn['ElasticsearchClusterConfig'] = jsonRequestBody.contentString.ElasticsearchClusterConfig;
        reqParams.cfn['EBSOptions'] = jsonRequestBody.contentString.EBSOptions;
        reqParams.cfn['EncryptionAtRestOptions'] = jsonRequestBody.contentString.EncryptionAtRestOptions;
        reqParams.cfn['SnapshotOptions'] = jsonRequestBody.contentString.SnapshotOptions;
        reqParams.cfn['VPCOptions'] = jsonRequestBody.contentString.VPCOptions;
        reqParams.cfn['AdvancedOptions'] = jsonRequestBody.contentString.AdvancedOptions;
        reqParams.cfn['DomainName'] = jsonRequestBody.contentString.DomainName;
        reqParams.cfn['ElasticsearchVersion'] = jsonRequestBody.contentString.ElasticsearchVersion;
        reqParams.cfn['AccessPolicies'] = jsonRequestBody.contentString.AccessPolicies;

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'CreateElasticsearchDomain',
                'boto3': 'create_elasticsearch_domain',
                'cli': 'create-elasticsearch-domain'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('es', details.requestId),
            'region': region,
            'service': 'es',
            'type': 'AWS::Elasticsearch::Domain',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:es:es.DescribeElasticsearchDomain
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "DescribeElasticsearchDomain") {
        reqParams.boto3['DomainName'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--domain-name'] = jsonRequestBody.path.split("/")[4];

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'DescribeElasticsearchDomain',
                'boto3': 'describe_elasticsearch_domain',
                'cli': 'describe-elasticsearch-domain'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:es.GetUpgradeStatus
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "GetUpgradeStatus") {
        reqParams.boto3['DomainName'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--domain-name'] = jsonRequestBody.path.split("/")[4];

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'GetUpgradeStatus',
                'boto3': 'get_upgrade_status',
                'cli': 'get-upgrade-status'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:es.GetCompatibleElasticsearchVersions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "GetCompatibleElasticsearchVersions") {
        reqParams.boto3['DomainName'] = jsonRequestBody.params.domainName;
        reqParams.cli['--domain-name'] = jsonRequestBody.params.domainName;

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'GetCompatibleElasticsearchVersions',
                'boto3': 'get_compatible_elasticsearch_versions',
                'cli': 'get-compatible-elasticsearch-versions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:es.GetUpgradeHistory
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "GetUpgradeHistory") {
        reqParams.boto3['DomainName'] = jsonRequestBody.path.split("/")[3];
        reqParams.cli['--domain-name'] = jsonRequestBody.path.split("/")[3];

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'GetUpgradeHistory',
                'boto3': 'get_upgrade_history',
                'cli': 'get-upgrade-history'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:es.DeleteElasticsearchDomain
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "DeleteElasticsearchDomain") {
        reqParams.boto3['DomainName'] = jsonRequestBody.path.split("/")[4];
        reqParams.cli['--domain-name'] = jsonRequestBody.path.split("/")[4];

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'DeleteElasticsearchDomain',
                'boto3': 'delete_elasticsearch_domain',
                'cli': 'delete-elasticsearch-domain'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:es:es.DescribeReservedElasticsearchInstances
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "DescribeReservedElasticsearchInstances") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.params.maxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.params.maxResults;

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'DescribeReservedElasticsearchInstances',
                'boto3': 'describe_reserved_elasticsearch_instances',
                'cli': 'describe-reserved-elasticsearch-instances'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:es:es.DescribeElasticsearchDomains
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/es\/api\/es$/g) && jsonRequestBody.operation == "DescribeElasticsearchDomains") {
        reqParams.boto3['DomainNames'] = jsonRequestBody.contentString.DomainNames;
        reqParams.cli['--domain-names'] = jsonRequestBody.contentString.DomainNames;

        outputs.push({
            'region': region,
            'service': 'es',
            'method': {
                'api': 'DescribeElasticsearchDomains',
                'boto3': 'describe_elasticsearch_domains',
                'cli': 'describe-elasticsearch-domains'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:sns:sns.ListTopics
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sns\/v2\/ListTopics$/g)) {

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'ListTopics',
                'boto3': 'list_topics',
                'cli': 'list-topics'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:sns:sns.ListSubscriptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sns\/v2\/ListSubscriptions$/g)) {

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'ListSubscriptions',
                'boto3': 'list_subscriptions',
                'cli': 'list-subscriptions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:sns:sns.CreateTopic
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sns\/v2\/CreateTopic$/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.topicName;
        reqParams.cli['--name'] = jsonRequestBody.topicName;

        reqParams.cfn['TopicName'] = jsonRequestBody.topicName;

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'CreateTopic',
                'boto3': 'create_topic',
                'cli': 'create-topic'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('sns', details.requestId),
            'region': region,
            'service': 'sns',
            'type': 'AWS::SNS::Topic',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:sns:sns.SetTopicAttributes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sns\/v2\/SetTopicAttributes$/g)) {
        reqParams.boto3['TopicArn'] = jsonRequestBody.topicArn;
        reqParams.cli['--topic-arn'] = jsonRequestBody.topicArn;
        reqParams.boto3['AttributeName'] = jsonRequestBody.attributeName;
        reqParams.cli['--attribute-name'] = jsonRequestBody.attributeName;
        reqParams.boto3['AttributeValue'] = jsonRequestBody.attributeValue;
        reqParams.cli['--attribute-value'] = jsonRequestBody.attributeValue;

        if (jsonRequestBody.attributeName == "Policy") {
            reqParams.cfn['PolicyDocument'] = jsonRequestBody.attributeValue;
            reqParams.cfn['Topics'] = [jsonRequestBody.topicArn];

            tracked_resources.push({
                'logicalId': getResourceName('sns', details.requestId),
                'region': region,
                'service': 'sns',
                'type': 'AWS::SNS::TopicPolicy',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });
        }

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'SetTopicAttributes',
                'boto3': 'set_topic_attributes',
                'cli': 'set-topic-attributes'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:sns:sns.DeleteTopic
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sns\/v2\/DeleteTopic$/g)) {
        reqParams.boto3['TopicArn'] = jsonRequestBody.topicArn;
        reqParams.cli['--topic-arn'] = jsonRequestBody.topicArn;

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'DeleteTopic',
                'boto3': 'delete_topic',
                'cli': 'delete-topic'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:sns:sns.ListPlatformApplications
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sns\/v2\/ListPlatformApplications$/g)) {
        reqParams.boto3['NextToken'] = jsonRequestBody.nextToken;
        reqParams.cli['--next-token'] = jsonRequestBody.nextToken;

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'ListPlatformApplications',
                'boto3': 'list_platform_applications',
                'cli': 'list-platform-applications'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:sns:sns.Subscribe
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sns\/v2\/Subscribe$/g)) {
        reqParams.boto3['TopicArn'] = jsonRequestBody.topicArn;
        reqParams.cli['--topic-arn'] = jsonRequestBody.topicArn;
        reqParams.boto3['Endpoint'] = jsonRequestBody.endpoint;
        reqParams.cli['--endpoint'] = jsonRequestBody.endpoint;
        reqParams.boto3['Protocol'] = jsonRequestBody.protocol;
        reqParams.cli['--protocol'] = jsonRequestBody.protocol;

        reqParams.cfn['TopicArn'] = jsonRequestBody.topicArn;
        reqParams.cfn['Endpoint'] = jsonRequestBody.endpoint;
        reqParams.cfn['Protocol'] = jsonRequestBody.protocol;

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'Subscribe',
                'boto3': 'subscribe',
                'cli': 'subscribe'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('sns', details.requestId),
            'region': region,
            'service': 'sns',
            'type': 'AWS::SNS::Subscription',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:sns:sns.GetTopicAttributes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sns\/v2\/GetTopicAttributes$/g)) {
        reqParams.boto3['TopicArn'] = jsonRequestBody.topicArn;
        reqParams.cli['--topic-arn'] = jsonRequestBody.topicArn;

        outputs.push({
            'region': region,
            'service': 'sns',
            'method': {
                'api': 'GetTopicAttributes',
                'boto3': 'get_topic_attributes',
                'cli': 'get-topic-attributes'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ds:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/directoryservicev2\/api\/ec2$/g) && jsonRequestBody.operation == "describeVpcs") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ds:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/directoryservicev2\/api\/ec2$/g) && jsonRequestBody.operation == "describeSubnets") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ds:ds.CreateDirectory
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/directoryservicev2\/api\/galaxy$/g) && jsonRequestBody.operation == "CreateDirectory") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['Password'] = jsonRequestBody.contentString.Password;
        reqParams.cli['--password'] = jsonRequestBody.contentString.Password;
        reqParams.boto3['ShortName'] = jsonRequestBody.contentString.ShortName;
        reqParams.cli['--short-name'] = jsonRequestBody.contentString.ShortName;
        reqParams.boto3['Size'] = jsonRequestBody.contentString.Type;
        reqParams.cli['--size'] = jsonRequestBody.contentString.Type;
        reqParams.boto3['VpcSettings'] = jsonRequestBody.contentString.VpcSettings;
        reqParams.cli['--vpc-settings'] = jsonRequestBody.contentString.VpcSettings;

        reqParams.cfn['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cfn['Password'] = jsonRequestBody.contentString.Password;
        reqParams.cfn['ShortName'] = jsonRequestBody.contentString.ShortName;
        reqParams.cfn['Size'] = jsonRequestBody.contentString.Type;
        reqParams.cfn['VpcSettings'] = jsonRequestBody.contentString.VpcSettings;

        outputs.push({
            'region': region,
            'service': 'ds',
            'method': {
                'api': 'CreateDirectory',
                'boto3': 'create_directory',
                'cli': 'create-directory'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ds', details.requestId),
            'region': region,
            'service': 'ds',
            'type': 'AWS::DirectoryService::SimpleAD',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ds:ds.DescribeDirectories
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/directoryservicev2\/api\/galaxy$/g) && jsonRequestBody.operation == "DescribeDirectories") {
        reqParams.boto3['DirectoryIds'] = jsonRequestBody.contentString.DirectoryIds;
        reqParams.cli['--directory-ids'] = jsonRequestBody.contentString.DirectoryIds;

        outputs.push({
            'region': region,
            'service': 'ds',
            'method': {
                'api': 'DescribeDirectories',
                'boto3': 'describe_directories',
                'cli': 'describe-directories'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ds:ds.DeleteDirectory
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/directoryservicev2\/api\/galaxy$/g) && jsonRequestBody.operation == "DeleteDirectory") {
        reqParams.boto3['DirectoryId'] = jsonRequestBody.contentString.DirectoryId;
        reqParams.cli['--directory-id'] = jsonRequestBody.contentString.DirectoryId;

        outputs.push({
            'region': region,
            'service': 'ds',
            'method': {
                'api': 'DeleteDirectory',
                'boto3': 'delete_directory',
                'cli': 'delete-directory'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ds:ds.CreateMicrosoftAD
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/directoryservicev2\/api\/galaxy$/g) && jsonRequestBody.operation == "CreateMicrosoftAD") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['Password'] = jsonRequestBody.contentString.Password;
        reqParams.cli['--password'] = jsonRequestBody.contentString.Password;
        reqParams.boto3['ShortName'] = jsonRequestBody.contentString.ShortName;
        reqParams.cli['--short-name'] = jsonRequestBody.contentString.ShortName;
        reqParams.boto3['Edition'] = jsonRequestBody.contentString.Edition;
        reqParams.cli['--edition'] = jsonRequestBody.contentString.Edition;
        reqParams.boto3['VpcSettings'] = jsonRequestBody.contentString.VpcSettings;
        reqParams.cli['--vpc-settings'] = jsonRequestBody.contentString.VpcSettings;

        reqParams.cfn['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cfn['Password'] = jsonRequestBody.contentString.Password;
        reqParams.cfn['ShortName'] = jsonRequestBody.contentString.ShortName;
        reqParams.cfn['Edition'] = jsonRequestBody.contentString.Edition;
        reqParams.cfn['VpcSettings'] = jsonRequestBody.contentString.VpcSettings;

        outputs.push({
            'region': region,
            'service': 'ds',
            'method': {
                'api': 'CreateMicrosoftAD',
                'boto3': 'create_microsoft_ad',
                'cli': 'create-microsoft-ad'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ds', details.requestId),
            'region': region,
            'service': 'ds',
            'type': 'AWS::DirectoryService::MicrosoftAD',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcClassicLinkDnsSupport
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=callSdk_com\.amazonaws\.services\.ec2\.AmazonEC2Client_describeVpcClassicLinkDnsSupport\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcClassicLinkDnsSupport',
                'boto3': 'describe_vpc_classic_link_dns_support',
                'cli': 'describe-vpc-classic-link-dns-support'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2ux\.elasticconsole\.generated\.ElasticConsoleBackendGenerated\.MergedDescribeSubnets\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeVpcs\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeAvailabilityZones
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeAvailabilityZones\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeAvailabilityZones',
                'boto3': 'describe_availability_zones',
                'cli': 'describe-availability-zones'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateSubnet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateSubnet\?/g)) {
        reqParams.boto3['VpcId'] = jsonRequestBody.VpcId;
        reqParams.cli['--vpc-id'] = jsonRequestBody.VpcId;
        reqParams.boto3['CidrBlock'] = jsonRequestBody.CidrBlock;
        reqParams.cli['--cidr-block'] = jsonRequestBody.CidrBlock;
        reqParams.boto3['AvailabilityZone'] = jsonRequestBody.AvailabilityZone;
        reqParams.cli['--availability-zone'] = jsonRequestBody.AvailabilityZone;
        reqParams.boto3['Ipv6CidrBlock'] = jsonRequestBody.Ipv6CidrBlock;
        reqParams.cli['--ipv-6-cidr-block'] = jsonRequestBody.Ipv6CidrBlock;

        reqParams.cfn['VpcId'] = jsonRequestBody.VpcId;
        reqParams.cfn['CidrBlock'] = jsonRequestBody.CidrBlock;
        reqParams.cfn['AvailabilityZone'] = jsonRequestBody.AvailabilityZone;
        reqParams.cfn['Ipv6CidrBlock'] = jsonRequestBody.Ipv6CidrBlock;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateSubnet',
                'boto3': 'create_subnet',
                'cli': 'create-subnet'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::Subnet',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeNatGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=getNatGatewayUnsupportedZones\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeNatGateways',
                'boto3': 'describe_nat_gateways',
                'cli': 'describe-nat-gateways'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeInstances
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeInstances\?/g)) {
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeNetworkInterfaces
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeNetworkInterfaces\?/g)) {
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcEndpoints
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=callSdk_com\.amazonaws\.services\.ec2\.AmazonEC2Client_describeVpcEndpoints\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.request.filters;
        reqParams.cli['--filters'] = jsonRequestBody.request.filters;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcEndpoints',
                'boto3': 'describe_vpc_endpoints',
                'cli': 'describe-vpc-endpoints'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeEgressOnlyInternetGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=callSdk_com\.amazonaws\.services\.ec2\.AmazonEC2Client_describeEgressOnlyInternetGateways\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeEgressOnlyInternetGateways',
                'boto3': 'describe_egress_only_internet_gateways',
                'cli': 'describe-egress-only-internet-gateways'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DeleteNatGateway
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\?call=callSdk_com\.amazonaws\.services\.ec2\.AmazonEC2Client_deleteNatGateway\?/g)) {
        reqParams.boto3['NatGatewayId'] = jsonRequestBody.request.natGatewayId;
        reqParams.cli['--nat-gateway-id'] = jsonRequestBody.request.natGatewayId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteNatGateway',
                'boto3': 'delete_nat_gateway',
                'cli': 'delete-nat-gateway'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.CreateVpc
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "createVpc") {
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::VPC',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getVpcs") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeDhcpOptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getDHCPOptions") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeDhcpOptions',
                'boto3': 'describe_dhcp_options',
                'cli': 'describe-dhcp-options'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcAttribute
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getVpcAttributes") {
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
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeRouteTables
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getRouteTables") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRouteTables',
                'boto3': 'describe_route_tables',
                'cli': 'describe-route-tables'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateRouteTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "createRouteTable") {
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::RouteTable',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeNetworkAcls
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "createDHCPOption" && gwtRequest['method'] == "getNetworkACLs") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeNetworkAcls',
                'boto3': 'describe_network_acls',
                'cli': 'describe-network-acls'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateNetworkAcl
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "createNetworkACL") {
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
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::NetworkAcl',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DeleteNetworkAcl
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "modifyIngressRulesForNetworkACL" && gwtRequest['method'] == "deleteNetworkACL") {
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DeleteRouteTable
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "deleteRouteTable") {
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeSubnets\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.Filters;
        reqParams.cli['--filters'] = jsonRequestBody.Filters;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getSubnets") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // manual:ec2:ec2.CreateNetworkAclEntry
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && (gwtRequest['method'] == "modifyIngressRulesForNetworkACL" || gwtRequest['method'] == "modifyEgressRulesForNetworkACL")) {
        for (var i=0; i<gwtRequest.args[2].value.value.length; i++) {
            var reqParams = {
                'boto3': {},
                'go': {},
                'cfn': {},
                'cli': {}
            };
            
            if (gwtRequest['method'] == "modifyIngressRulesForNetworkACL") {
                reqParams.boto3['Egress'] = false;
                reqParams.cli['--ingress'] = null;
                reqParams.cfn['Egress'] = false;
            } else {
                reqParams.boto3['Egress'] = true;
                reqParams.cli['--egress'] = null;
                reqParams.cfn['Egress'] = true;
            }
            
            reqParams.boto3['NetworkAclId'] = gwtRequest.args[1].value;
            reqParams.cli['--network-acl-id'] = gwtRequest.args[1].value;
            reqParams.cfn['NetworkAclId'] = gwtRequest.args[1].value;
            
            reqParams.boto3['RuleNumber'] = gwtRequest.args[2].value.value[i].ruleId;
            reqParams.cli['--rule-number'] = gwtRequest.args[2].value.value[i].ruleId;
            reqParams.cfn['RuleNumber'] = gwtRequest.args[2].value.value[i].ruleId;
            
            reqParams.boto3['Protocol'] = gwtRequest.args[2].value.value[i].protocol;
            reqParams.cli['--protocol'] = gwtRequest.args[2].value.value[i].protocol;
            reqParams.cfn['Protocol'] = gwtRequest.args[2].value.value[i].protocol;
            
            if (gwtRequest.args[2].value.value[i].portStart > 0) { // don't set ICMP PortRange
                reqParams.boto3['PortRange'] = {
                    'From': gwtRequest.args[2].value.value[i].portStart,
                    'To': gwtRequest.args[2].value.value[i].portEnd
                };
                reqParams.cli['--port-range'] = {
                    'From': gwtRequest.args[2].value.value[i].portStart,
                    'To': gwtRequest.args[2].value.value[i].portEnd
                };
                reqParams.cfn['PortRange'] = {
                    'From': gwtRequest.args[2].value.value[i].portStart,
                    'To': gwtRequest.args[2].value.value[i].portEnd
                };
            }
            
            reqParams.boto3['CidrBlock'] = gwtRequest.args[2].value.value[i].cidr.value[0].value;
            reqParams.cli['--cidr-block'] = gwtRequest.args[2].value.value[i].cidr.value[0].value;
            reqParams.cfn['CidrBlock'] = gwtRequest.args[2].value.value[i].cidr.value[0].value;

            reqParams.boto3['RuleAction'] = gwtRequest.args[2].value.value[i].action;
            reqParams.cli['--rule-action'] = gwtRequest.args[2].value.value[i].action;
            reqParams.cfn['RuleAction'] = gwtRequest.args[2].value.value[i].action;

            if (reqParams.boto3['RuleNumber'] != 32767) { // ignore default rule
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'CreateNetworkAclEntry',
                        'boto3': 'create_network_acl_entry',
                        'cli': 'create-network-acl-entry'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('ec2', details.requestId),
                    'region': region,
                    'service': 'ec2',
                    'type': 'AWS::EC2::NetworkAclEntry',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });
            }
        }

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.AssociateDhcpOptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "modifyDHCPOptions") {
        reqParams.boto3['VpcId'] = getPipeSplitField(requestBody, 17);
        reqParams.cli['--vpc-id'] = getPipeSplitField(requestBody, 17);
        reqParams.boto3['DhcpOptionsId'] = getPipeSplitField(requestBody, 18);
        reqParams.cli['--dhcp-options-id'] = getPipeSplitField(requestBody, 18);

        reqParams.cfn['VpcId'] = getPipeSplitField(requestBody, 17);
        reqParams.cfn['DhcpOptionsId'] = getPipeSplitField(requestBody, 18);

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'AssociateDhcpOptions',
                'boto3': 'associate_dhcp_options',
                'cli': 'associate-dhcp-options'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::VPCDHCPOptionsAssociation',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeNatGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vpc\/VpcConsoleService$/g) && gwtRequest['method'] == "getNatGateways") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeNatGateways',
                'boto3': 'describe_nat_gateways',
                'cli': 'describe-nat-gateways'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.AssociateVpcCidrBlock
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.AssociateVpcCidrBlock\?/g)) {
        reqParams.boto3['VpcId'] = jsonRequestBody.vpcId;
        reqParams.cli['--vpc-id'] = jsonRequestBody.vpcId;
        reqParams.boto3['CidrBlock'] = jsonRequestBody.cidrBlock;
        reqParams.cli['--cidr-block'] = jsonRequestBody.cidrBlock;
        reqParams.boto3['AmazonProvidedIpv6CidrBlock'] = jsonRequestBody.amazonProvidedIpv6CidrBlock;
        reqParams.cli['--amazon-provided-ipv-6-cidr-block'] = jsonRequestBody.amazonProvidedIpv6CidrBlock;

        reqParams.cfn['VpcId'] = jsonRequestBody.vpcId;
        reqParams.cfn['CidrBlock'] = jsonRequestBody.cidrBlock;
        reqParams.cfn['AmazonProvidedIpv6CidrBlock'] = jsonRequestBody.amazonProvidedIpv6CidrBlock;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'AssociateVpcCidrBlock',
                'boto3': 'associate_vpc_cidr_block',
                'cli': 'associate-vpc-cidr-block'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::VPCCidrBlock',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elbv2.DescribeLoadBalancers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2GetLoadBalancers\?/g)) {

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeLoadBalancers',
                'boto3': 'describe_load_balancers',
                'cli': 'describe-load-balancers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeInternetGateways
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getInternetGateways\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeInternetGateways',
                'boto3': 'describe_internet_gateways',
                'cli': 'describe-internet-gateways'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeRouteTables
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getRouteTables\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.filters;
        reqParams.cli['--filters'] = jsonRequestBody.filters;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRouteTables',
                'boto3': 'describe_route_tables',
                'cli': 'describe-route-tables'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:acm.ListCertificates
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=listAcmCertificates\?/g)) {
        reqParams.boto3['CertificateStatuses'] = jsonRequestBody.CertificateStatusList;
        reqParams.cli['--certificate-statuses'] = jsonRequestBody.CertificateStatusList;

        outputs.push({
            'region': region,
            'service': 'acm',
            'method': {
                'api': 'ListCertificates',
                'boto3': 'list_certificates',
                'cli': 'list-certificates'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:iam.ListServerCertificates
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=listServerCertificates\?/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListServerCertificates',
                'boto3': 'list_server_certificates',
                'cli': 'list-server-certificates'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:elbv2.DescribeSSLPolicies
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DescribeSSLPolicies\?/g)) {

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeSSLPolicies',
                'boto3': 'describe_ssl_policies',
                'cli': 'describe-ssl-policies'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:elbv2.DescribeAccountLimits
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getAccountLimits\?/g)) {

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeAccountLimits',
                'boto3': 'describe_account_limits',
                'cli': 'describe-account-limits'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeInstances
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getMergedInstanceListAutoUpdate\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeInstances',
                'boto3': 'describe_instances',
                'cli': 'describe-instances'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getSecurityGroupsAutoUpdate\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSecurityGroups',
                'boto3': 'describe_security_groups',
                'cli': 'describe-security-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:elbv2.CreateLoadBalancer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2CreateLoadBalancer\?/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.name;
        reqParams.cli['--name'] = jsonRequestBody.name;
        reqParams.boto3['Scheme'] = jsonRequestBody.scheme;
        reqParams.cli['--scheme'] = jsonRequestBody.scheme;
        reqParams.boto3['SecurityGroups'] = jsonRequestBody.securityGroups;
        reqParams.cli['--security-groups'] = jsonRequestBody.securityGroups;
        reqParams.boto3['Subnets'] = jsonRequestBody.subnets;
        reqParams.cli['--subnets'] = jsonRequestBody.subnets;
        reqParams.boto3['Tags'] = jsonRequestBody.tags;
        reqParams.cli['--tags'] = jsonRequestBody.tags;
        reqParams.boto3['IpAddressType'] = jsonRequestBody.ipAddressType;
        reqParams.cli['--ip-address-type'] = jsonRequestBody.ipAddressType;
        reqParams.boto3['Type'] = jsonRequestBody.type;
        reqParams.cli['--type'] = jsonRequestBody.type;

        reqParams.cfn['Name'] = jsonRequestBody.name;
        reqParams.cfn['Scheme'] = jsonRequestBody.scheme;
        reqParams.cfn['SecurityGroups'] = jsonRequestBody.securityGroups;
        reqParams.cfn['Subnets'] = jsonRequestBody.subnets;
        reqParams.cfn['Tags'] = jsonRequestBody.tags;
        reqParams.cfn['IpAddressType'] = jsonRequestBody.ipAddressType;
        reqParams.cfn['Type'] = jsonRequestBody.type;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'CreateLoadBalancer',
                'boto3': 'create_load_balancer',
                'cli': 'create-load-balancer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elbv2.CreateTargetGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2CreateTargetGroup\?/g)) {
        reqParams.boto3['HealthCheckIntervalSeconds'] = jsonRequestBody.HealthCheckIntervalSeconds;
        reqParams.cli['--health-check-interval-seconds'] = jsonRequestBody.HealthCheckIntervalSeconds;
        reqParams.boto3['HealthCheckPath'] = jsonRequestBody.HealthCheckPath;
        reqParams.cli['--health-check-path'] = jsonRequestBody.HealthCheckPath;
        reqParams.boto3['HealthCheckProtocol'] = jsonRequestBody.HealthCheckProtocol;
        reqParams.cli['--health-check-protocol'] = jsonRequestBody.HealthCheckProtocol;
        reqParams.boto3['HealthCheckTimeoutSeconds'] = jsonRequestBody.HealthCheckTimeoutSeconds;
        reqParams.cli['--health-check-timeout-seconds'] = jsonRequestBody.HealthCheckTimeoutSeconds;
        reqParams.boto3['HealthyThresholdCount'] = jsonRequestBody.HealthyThresholdCount;
        reqParams.cli['--healthy-threshold-count'] = jsonRequestBody.HealthyThresholdCount;
        reqParams.boto3['Matcher'] = jsonRequestBody.Matcher;
        reqParams.cli['--matcher'] = jsonRequestBody.Matcher;
        reqParams.boto3['Name'] = jsonRequestBody.Name;
        reqParams.cli['--name'] = jsonRequestBody.Name;
        reqParams.boto3['Port'] = jsonRequestBody.Port;
        reqParams.cli['--port'] = jsonRequestBody.Port;
        reqParams.boto3['Protocol'] = jsonRequestBody.Protocol;
        reqParams.cli['--protocol'] = jsonRequestBody.Protocol;
        reqParams.boto3['TargetType'] = jsonRequestBody.targetType;
        reqParams.cli['--target-type'] = jsonRequestBody.targetType;
        reqParams.boto3['UnhealthyThresholdCount'] = jsonRequestBody.UnhealthyThresholdCount;
        reqParams.cli['--unhealthy-threshold-count'] = jsonRequestBody.UnhealthyThresholdCount;
        reqParams.boto3['VpcId'] = jsonRequestBody.VpcId;
        reqParams.cli['--vpc-id'] = jsonRequestBody.VpcId;

        reqParams.cfn['HealthCheckIntervalSeconds'] = jsonRequestBody.HealthCheckIntervalSeconds;
        reqParams.cfn['HealthCheckPath'] = jsonRequestBody.HealthCheckPath;
        reqParams.cfn['HealthCheckProtocol'] = jsonRequestBody.HealthCheckProtocol;
        reqParams.cfn['HealthCheckTimeoutSeconds'] = jsonRequestBody.HealthCheckTimeoutSeconds;
        reqParams.cfn['HealthyThresholdCount'] = jsonRequestBody.HealthyThresholdCount;
        reqParams.cfn['Matcher'] = jsonRequestBody.Matcher;
        reqParams.cfn['Name'] = jsonRequestBody.Name;
        reqParams.cfn['Port'] = jsonRequestBody.Port;
        reqParams.cfn['Protocol'] = jsonRequestBody.Protocol;
        reqParams.cfn['TargetType'] = jsonRequestBody.targetType;
        reqParams.cfn['UnhealthyThresholdCount'] = jsonRequestBody.UnhealthyThresholdCount;
        reqParams.cfn['VpcId'] = jsonRequestBody.VpcId;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'CreateTargetGroup',
                'boto3': 'create_target_group',
                'cli': 'create-target-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elbv2.CreateListener
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2CreateListener\?/g)) {
        reqParams.boto3['Port'] = jsonRequestBody.port;
        reqParams.cli['--port'] = jsonRequestBody.port;
        reqParams.boto3['Protocol'] = jsonRequestBody.protocol;
        reqParams.cli['--protocol'] = jsonRequestBody.protocol;
        reqParams.boto3['LoadBalancerArn'] = jsonRequestBody.loadBalancerArn;
        reqParams.cli['--load-balancer-arn'] = jsonRequestBody.loadBalancerArn;
        reqParams.boto3['DefaultActions'] = jsonRequestBody.defaultActions;
        reqParams.cli['--default-actions'] = jsonRequestBody.defaultActions;

        reqParams.cfn['Port'] = jsonRequestBody.port;
        reqParams.cfn['Protocol'] = jsonRequestBody.protocol;
        reqParams.cfn['LoadBalancerArn'] = jsonRequestBody.loadBalancerArn;
        reqParams.cfn['DefaultActions'] = jsonRequestBody.defaultActions;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'CreateListener',
                'boto3': 'create_listener',
                'cli': 'create-listener'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::ElasticLoadBalancingV2::Listener',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elbv2.DescribeLoadBalancers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2GetLoadBalancers\?/g)) {

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeLoadBalancers',
                'boto3': 'describe_load_balancers',
                'cli': 'describe-load-balancers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:elbv2.DescribeLoadBalancerAttributes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DescribeLoadBalancerAttributes\?/g)) {
        reqParams.boto3['LoadBalancerArn'] = jsonRequestBody.loadBalancerArn;
        reqParams.cli['--load-balancer-arn'] = jsonRequestBody.loadBalancerArn;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeLoadBalancerAttributes',
                'boto3': 'describe_load_balancer_attributes',
                'cli': 'describe-load-balancer-attributes'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:config.DescribeConfigurationRecorders
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=describeConfigurationRecorders\?/g)) {

        outputs.push({
            'region': region,
            'service': 'config',
            'method': {
                'api': 'DescribeConfigurationRecorders',
                'boto3': 'describe_configuration_recorders',
                'cli': 'describe-configuration-recorders'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:waf-regional.GetWebACLForResource
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=getWebACLForResource\?/g)) {
        reqParams.boto3['ResourceArn'] = jsonRequestBody.resourceArn;
        reqParams.cli['--resource-arn'] = jsonRequestBody.resourceArn;

        outputs.push({
            'region': region,
            'service': 'waf-regional',
            'method': {
                'api': 'GetWebACLForResource',
                'boto3': 'get_web_acl_for_resource',
                'cli': 'get-web-acl-for-resource'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:elbv2.DescribeRules
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DescribeRules\?/g)) {
        reqParams.boto3['ListenerArn'] = jsonRequestBody.listenerArn;
        reqParams.cli['--listener-arn'] = jsonRequestBody.listenerArn;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeRules',
                'boto3': 'describe_rules',
                'cli': 'describe-rules'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:elbv2.DescribeListeners
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DescribeListeners\?/g)) {
        reqParams.boto3['LoadBalancerArn'] = jsonRequestBody.loadBalancerArn;
        reqParams.cli['--load-balancer-arn'] = jsonRequestBody.loadBalancerArn;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DescribeListeners',
                'boto3': 'describe_listeners',
                'cli': 'describe-listeners'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:elbv2.CreateRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2CreateRule\?/g)) {
        reqParams.boto3['Conditions'] = jsonRequestBody.conditions;
        reqParams.cli['--conditions'] = jsonRequestBody.conditions;
        reqParams.boto3['Actions'] = jsonRequestBody.actions;
        reqParams.cli['--actions'] = jsonRequestBody.actions;

        reqParams.cfn['Conditions'] = jsonRequestBody.conditions;
        reqParams.cfn['Actions'] = jsonRequestBody.actions;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'CreateRule',
                'boto3': 'create_rule',
                'cli': 'create-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::ElasticLoadBalancingV2::ListenerRule',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elbv2.DeleteRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DeleteRule\?/g)) {
        reqParams.boto3['RuleArn'] = jsonRequestBody.ruleArn;
        reqParams.cli['--rule-arn'] = jsonRequestBody.ruleArn;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DeleteRule',
                'boto3': 'delete_rule',
                'cli': 'delete-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elbv2.DeleteListener
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DeleteListener\?/g)) {
        reqParams.boto3['ListenerArn'] = jsonRequestBody.listenerArn;
        reqParams.cli['--listener-arn'] = jsonRequestBody.listenerArn;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DeleteListener',
                'boto3': 'delete_listener',
                'cli': 'delete-listener'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elbv2.DeleteLoadBalancer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DeleteLoadBalancer\?/g)) {
        reqParams.boto3['LoadBalancerArn'] = jsonRequestBody.loadBalancerArn;
        reqParams.cli['--load-balancer-arn'] = jsonRequestBody.loadBalancerArn;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DeleteLoadBalancer',
                'boto3': 'delete_load_balancer',
                'cli': 'delete-load-balancer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elbv2.DeleteTargetGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=elbV2DeleteTargetGroup\?/g)) {
        reqParams.boto3['TargetGroupArn'] = jsonRequestBody.targetGroupArn;
        reqParams.cli['--target-group-arn'] = jsonRequestBody.targetGroupArn;

        outputs.push({
            'region': region,
            'service': 'elbv2',
            'method': {
                'api': 'DeleteTargetGroup',
                'boto3': 'delete_target_group',
                'cli': 'delete-target-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elb.CreateLoadBalancer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=createLoadBalancer\?/g)) {
        reqParams.boto3['LoadBalancerName'] = jsonRequestBody.loadBalancerName;
        reqParams.cli['--load-balancer-name'] = jsonRequestBody.loadBalancerName;
        reqParams.boto3['Scheme'] = jsonRequestBody.scheme;
        reqParams.cli['--scheme'] = jsonRequestBody.scheme;
        reqParams.boto3['Tags'] = jsonRequestBody.tags;
        reqParams.cli['--tags'] = jsonRequestBody.tags;
        reqParams.boto3['Listeners'] = jsonRequestBody.listeners;
        reqParams.cli['--listeners'] = jsonRequestBody.listeners;
        reqParams.boto3['SecurityGroups'] = jsonRequestBody.securityGroups;
        reqParams.cli['--security-groups'] = jsonRequestBody.securityGroups;
        reqParams.boto3['Subnets'] = jsonRequestBody.subnets;
        reqParams.cli['--subnets'] = jsonRequestBody.subnets;

        reqParams.cfn['LoadBalancerName'] = jsonRequestBody.loadBalancerName;
        reqParams.cfn['Scheme'] = jsonRequestBody.scheme;
        reqParams.cfn['Tags'] = jsonRequestBody.tags;
        reqParams.cfn['Listeners'] = jsonRequestBody.listeners;
        reqParams.cfn['SecurityGroups'] = jsonRequestBody.securityGroups;
        reqParams.cfn['Subnets'] = jsonRequestBody.subnets;

        outputs.push({
            'region': region,
            'service': 'elb',
            'method': {
                'api': 'CreateLoadBalancer',
                'boto3': 'create_load_balancer',
                'cli': 'create-load-balancer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::ElasticLoadBalancing::LoadBalancer',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elb.ConfigureHealthCheck
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=configureHealthCheck\?/g)) {
        reqParams.boto3['HealthCheck'] = jsonRequestBody.healthCheck;
        reqParams.cli['--health-check'] = jsonRequestBody.healthCheck;
        reqParams.boto3['LoadBalancerName'] = jsonRequestBody.loadBalancerName;
        reqParams.cli['--load-balancer-name'] = jsonRequestBody.loadBalancerName;

        outputs.push({
            'region': region,
            'service': 'elb',
            'method': {
                'api': 'ConfigureHealthCheck',
                'boto3': 'configure_health_check',
                'cli': 'configure-health-check'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elb.ModifyLoadBalancerAttributes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=modifyLoadBalancerAttributes\?/g)) {
        reqParams.boto3['LoadBalancerName'] = jsonRequestBody.loadBalancerName;
        reqParams.cli['--load-balancer-name'] = jsonRequestBody.loadBalancerName;
        var attributes = {};
        if (jsonRequestBody.crossZone) {
            attributes['CrossZoneLoadBalancing'] = {
                'Enabled': jsonRequestBody.crossZone
            };
        }
        if (jsonRequestBody.connectionDraining) {
            attributes['ConnectionDraining'] = {
                'Enabled': jsonRequestBody.connectionDraining.enabled,
                'Timeout': jsonRequestBody.connectionDraining.timeout
            }
        }
        
        reqParams.boto3['LoadBalancerAttributes'] = attributes;
        reqParams.cli['--load-balancer-attributes'] = attributes;

        outputs.push({
            'region': region,
            'service': 'elb',
            'method': {
                'api': 'ModifyLoadBalancerAttributes',
                'boto3': 'modify_load_balancer_attributes',
                'cli': 'modify-load-balancer-attributes'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // manual:cloudwatch:logs.CreateLogGroup
    // manual:cloudwatch:logs.CreateLogStream
    // manual:cloudwatch:logs.PutMetricFilter
    // manual:cloudwatch:logs.PutSubscriptionFilter
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cloudwatch\/CloudWatch\//g)) {
        if (jsonRequestBody.I && jsonRequestBody.I[0] && jsonRequestBody.I[0]["O"] && jsonRequestBody.I[0]["O"] == "wuLyBG8jCdQ61w9bK2g4kaSdI4Q") {
            reqParams.boto3['LogGroupName'] = jsonRequestBody.I[0]["P"][0];
            reqParams.cli['--log-group-name'] = jsonRequestBody.I[0]["P"][0];

            reqParams.cfn['LogGroupName'] = jsonRequestBody.I[0]["P"][0];

            outputs.push({
                'region': region,
                'service': 'logs',
                'method': {
                    'api': 'CreateLogGroup',
                    'boto3': 'create_log_group',
                    'cli': 'create-log-group'
                },
                'options': reqParams,
                'requestDetails': details
            });

            tracked_resources.push({
                'logicalId': getResourceName('logs', details.requestId),
                'region': region,
                'service': 'logs',
                'type': 'AWS::Logs::LogGroup',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });

            if (blocking) {
                notifyBlocked();
                return {cancel: true};
            }
        } else if (jsonRequestBody.I && jsonRequestBody.I[0] && jsonRequestBody.I[0]["O"] && jsonRequestBody.I[0]["O"] == "bDg0Lbt_pKcqOJ8vSNZWGQW7Rfk=") {
            reqParams.boto3['LogGroupName'] = jsonRequestBody.I[0]["P"][0];
            reqParams.cli['--log-group-name'] = jsonRequestBody.I[0]["P"][0];
            reqParams.boto3['LogStreamName'] = jsonRequestBody.I[0]["P"][1];
            reqParams.cli['--log-stream-name'] = jsonRequestBody.I[0]["P"][1];

            reqParams.cfn['LogGroupName'] = jsonRequestBody.I[0]["P"][0];
            reqParams.cfn['LogStreamName'] = jsonRequestBody.I[0]["P"][1];
    
            outputs.push({
                'region': region,
                'service': 'logs',
                'method': {
                    'api': 'CreateLogStream',
                    'boto3': 'create_log_stream',
                    'cli': 'create-log-stream'
                },
                'options': reqParams,
                'requestDetails': details
            });

            tracked_resources.push({
                'logicalId': getResourceName('logs', details.requestId),
                'region': region,
                'service': 'logs',
                'type': 'AWS::Logs::LogStream',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });

            if (blocking) {
                notifyBlocked();
                return {cancel: true};
            }
        } else if (jsonRequestBody.I && jsonRequestBody.I[0] && jsonRequestBody.I[0]["O"] && jsonRequestBody.I[0]["O"] == "w3zy8wcdTk4$qD2iBc81AziNanc=") {
            reqParams.boto3['LogGroupName'] = jsonRequestBody.I[0]["P"][0];
            reqParams.cli['--log-group-name'] = jsonRequestBody.I[0]["P"][0];
            reqParams.boto3['FilterName'] = jsonRequestBody.I[0]["P"][1];
            reqParams.cli['--filter-name'] = jsonRequestBody.I[0]["P"][1];
            reqParams.boto3['FilterPattern'] = jsonRequestBody.I[0]["P"][2];
            reqParams.cli['--filter-pattern'] = jsonRequestBody.I[0]["P"][2];
            reqParams.boto3['MetricTransformations'] = jsonRequestBody.O[0]["P"];
            reqParams.cli['--metric-transformations'] = jsonRequestBody.O[0]["P"];

            reqParams.cfn['LogGroupName'] = jsonRequestBody.I[0]["P"][0];
            reqParams.cfn['FilterPattern'] = jsonRequestBody.I[0]["P"][2];
            reqParams.cfn['MetricTransformations'] = jsonRequestBody.O[0]["P"];
    
            outputs.push({
                'region': region,
                'service': 'logs',
                'method': {
                    'api': 'PutMetricFilter',
                    'boto3': 'put_metric_filter',
                    'cli': 'put-metric-filter'
                },
                'options': reqParams,
                'requestDetails': details
            });

            tracked_resources.push({
                'logicalId': getResourceName('logs', details.requestId),
                'region': region,
                'service': 'logs',
                'type': 'AWS::Logs::MetricFilter',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });

            if (blocking) {
                notifyBlocked();
                return {cancel: true};
            }
        } else if (jsonRequestBody.I && jsonRequestBody.I[0] && jsonRequestBody.I[0]["O"] && jsonRequestBody.I[0]["O"] == "lRd9M18y9YlzeZbi97CtbWseYDE=") {
            reqParams.boto3['DestinationArn'] = jsonRequestBody.O[0]["P"]["destinationArn"];
            reqParams.cli['--destination-arn'] = jsonRequestBody.O[0]["P"]["destinationArn"];
            reqParams.boto3['FilterName'] = jsonRequestBody.O[0]["P"]["filterName"];
            reqParams.cli['--filter-name'] = jsonRequestBody.O[0]["P"]["filterName"];
            reqParams.boto3['FilterPattern'] = jsonRequestBody.O[0]["P"]["filterPattern"];
            reqParams.cli['--filter-pattern'] = jsonRequestBody.O[0]["P"]["filterPattern"];
            reqParams.boto3['LogGroupName'] = jsonRequestBody.O[0]["P"]["logGroupName"];
            reqParams.cli['--log-group-name'] = jsonRequestBody.O[0]["P"]["logGroupName"];
            reqParams.boto3['RoleArn'] = jsonRequestBody.O[0]["P"]["roleArn"];
            reqParams.cli['--role-arn'] = jsonRequestBody.O[0]["P"]["roleArn"];

            reqParams.cfn['DestinationArn'] = jsonRequestBody.O[0]["P"]["destinationArn"];
            reqParams.cfn['FilterPattern'] = jsonRequestBody.O[0]["P"]["filterPattern"];
            reqParams.cfn['LogGroupName'] = jsonRequestBody.O[0]["P"]["logGroupName"];
            reqParams.cfn['RoleArn'] = jsonRequestBody.O[0]["P"]["roleArn"];
    
            outputs.push({
                'region': region,
                'service': 'logs',
                'method': {
                    'api': 'PutSubscriptionFilter',
                    'boto3': 'put_subscription_filter',
                    'cli': 'put-subscription-filter'
                },
                'options': reqParams,
                'requestDetails': details
            });

            tracked_resources.push({
                'logicalId': getResourceName('logs', details.requestId),
                'region': region,
                'service': 'logs',
                'type': 'AWS::Logs::SubscriptionFilter',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });

            if (blocking) {
                notifyBlocked();
                return {cancel: true};
            }
        }
        
        return {};
    }

    // autogen:sqs:sqs.CreateQueue
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonSQS$/g) && gwtRequest['method'] == "createQueue") {
        reqParams.boto3['QueueName'] = getPipeSplitField(requestBody, 12);
        reqParams.cli['--queue-name'] = getPipeSplitField(requestBody, 12);

        reqParams.cfn['QueueName'] = getPipeSplitField(requestBody, 12);

        outputs.push({
            'region': region,
            'service': 'sqs',
            'method': {
                'api': 'CreateQueue',
                'boto3': 'create_queue',
                'cli': 'create-queue'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('sqs', details.requestId),
            'region': region,
            'service': 'sqs',
            'type': 'AWS::SQS::Queue',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:sqs:sqs.GetQueueAttributes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonSQS$/g) && gwtRequest['method'] == "getQueueAttributes") {
        reqParams.boto3['QueueUrl'] = getPipeSplitField(requestBody, 11);
        reqParams.cli['--queue-url'] = getPipeSplitField(requestBody, 11);
        reqParams.boto3['AttributeNames'] = getPipeSplitField(requestBody, 14);
        reqParams.cli['--attribute-names'] = getPipeSplitField(requestBody, 14);

        outputs.push({
            'region': region,
            'service': 'sqs',
            'method': {
                'api': 'GetQueueAttributes',
                'boto3': 'get_queue_attributes',
                'cli': 'get-queue-attributes'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:sqs:sqs.SetQueueAttributes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonSQS$/g) && gwtRequest['method'] == "setQueueAttributes" && getPipeSplitField(requestBody, 13) == "Policy") {
        reqParams.boto3['QueueUrl'] = getPipeSplitField(requestBody, 11);
        reqParams.cli['--queue-url'] = getPipeSplitField(requestBody, 11);
        reqParams.boto3['Attributes'] = {
            'Policy': getPipeSplitField(requestBody, 14)
        };
        reqParams.cli['--attributes'] = {
            'Policy': getPipeSplitField(requestBody, 14)
        };

        reqParams.cfn['Queues'] = [getPipeSplitField(requestBody, 11)];
        reqParams.cfn['PolicyDocument'] = getPipeSplitField(requestBody, 14);

        outputs.push({
            'region': region,
            'service': 'sqs',
            'method': {
                'api': 'SetQueueAttributes',
                'boto3': 'set_queue_attributes',
                'cli': 'set-queue-attributes'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('sqs', details.requestId),
            'region': region,
            'service': 'sqs',
            'type': 'AWS::SQS::QueuePolicy',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:sqs:sqs.DeleteQueue
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/sqs\/sqsconsole\/AmazonSQS$/g)) {
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
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:route53:route53.GetHostedZoneCount
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/route53\/route53console\/route53$/g) && gwtRequest['method'] == "getHostedZoneCount") {

        outputs.push({
            'region': region,
            'service': 'route53',
            'method': {
                'api': 'GetHostedZoneCount',
                'boto3': 'get_hosted_zone_count',
                'cli': 'get-hosted-zone-count'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:route53:route53.ListHostedZones
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/route53\/route53console\/route53$/g) && gwtRequest['method'] == "listHostedZones") {
        reqParams.boto3['MaxItems'] = getPipeSplitField(requestBody, 10);
        reqParams.cli['--max-items'] = getPipeSplitField(requestBody, 10);

        outputs.push({
            'region': region,
            'service': 'route53',
            'method': {
                'api': 'ListHostedZones',
                'boto3': 'list_hosted_zones',
                'cli': 'list-hosted-zones'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:route53:route53.CreateHostedZone
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/route53\/route53console\/route53$/g) && gwtRequest['method'] == "createPrivateHostedZone") {
        reqParams.boto3['Name'] = getPipeSplitField(requestBody, 11);
        reqParams.cli['--name'] = getPipeSplitField(requestBody, 11);
        reqParams.boto3['HostedZoneConfig'] = {
            'Comment': getPipeSplitField(requestBody, 12)
        };
        reqParams.cli['--hosted-zone-config'] = {
            'Comment': getPipeSplitField(requestBody, 12)
        };
        reqParams.boto3['VPC'] = getPipeSplitField(requestBody, 15);
        reqParams.cli['--vpc'] = getPipeSplitField(requestBody, 15);
        reqParams.boto3['CallerReference'] = getPipeSplitField(requestBody, 16);
        reqParams.cli['--caller-reference'] = getPipeSplitField(requestBody, 16);

        reqParams.cfn['Name'] = getPipeSplitField(requestBody, 11);
        reqParams.cfn['HostedZoneConfig'] = {
            'Comment': getPipeSplitField(requestBody, 12)
        };
        reqParams.cfn['VPCs'] = [getPipeSplitField(requestBody, 15)];

        outputs.push({
            'region': region,
            'service': 'route53',
            'method': {
                'api': 'CreateHostedZone',
                'boto3': 'create_hosted_zone',
                'cli': 'create-hosted-zone'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('route53', details.requestId),
            'region': region,
            'service': 'route53',
            'type': 'AWS::Route53::HostedZone',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:route53:route53.CreateHostedZone
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/route53\/route53console\/route53$/g) && gwtRequest['method'] == "createPublicHostedZone") {
        reqParams.boto3['Name'] = getPipeSplitField(requestBody, 10);
        reqParams.cli['--name'] = getPipeSplitField(requestBody, 10);
        reqParams.boto3['HostedZoneConfig'] = {
            'Comment': getPipeSplitField(requestBody, 11)
        };
        reqParams.cli['--hosted-zone-config'] = {
            'Comment': getPipeSplitField(requestBody, 11)
        };
        reqParams.boto3['CallerReference'] = getPipeSplitField(requestBody, 12);
        reqParams.cli['--caller-reference'] = getPipeSplitField(requestBody, 12);

        reqParams.cfn['Name'] = getPipeSplitField(requestBody, 10);
        reqParams.cfn['HostedZoneConfig'] = {
            'Comment': getPipeSplitField(requestBody, 11)
        };

        outputs.push({
            'region': region,
            'service': 'route53',
            'method': {
                'api': 'CreateHostedZone',
                'boto3': 'create_hosted_zone',
                'cli': 'create-hosted-zone'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('route53', details.requestId),
            'region': region,
            'service': 'route53',
            'type': 'AWS::Route53::HostedZone',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }


    // autogen:route53:route53.ListGeoLocations
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/route53\/route53console\/route53$/g) && gwtRequest['method'] == "listGeoLocationDetails") {

        outputs.push({
            'region': region,
            'service': 'route53',
            'method': {
                'api': 'ListGeoLocations',
                'boto3': 'list_geo_locations',
                'cli': 'list-geo-locations'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:route53:route53.ListHealthChecks
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/route53\/route53console\/route53$/g) && gwtRequest['method'] == "listHealthChecks") {

        outputs.push({
            'region': region,
            'service': 'route53',
            'method': {
                'api': 'ListHealthChecks',
                'boto3': 'list_health_checks',
                'cli': 'list-health-checks'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:route53:route53.DeleteHostedZone
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/route53\/route53console\/route53$/g) && gwtRequest['method'] == "deleteHostedZone") {
        reqParams.boto3['Id'] = getPipeSplitField(requestBody, 10);
        reqParams.cli['--id'] = getPipeSplitField(requestBody, 10);

        outputs.push({
            'region': region,
            'service': 'route53',
            'method': {
                'api': 'DeleteHostedZone',
                'boto3': 'delete_hosted_zone',
                'cli': 'delete-hosted-zone'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:ec2.DescribeAvailabilityZones
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/list\-availability\-zones\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeAvailabilityZones',
                'boto3': 'describe_availability_zones',
                'cli': 'describe-availability-zones'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:opsworks:ec2.DescribeVpcs
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/list\-vpcs\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcs',
                'boto3': 'describe_vpcs',
                'cli': 'describe-vpcs'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:opsworks:ec2.DescribeSubnets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/list\-subnets\?/g)) {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSubnets',
                'boto3': 'describe_subnets',
                'cli': 'describe-subnets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:opsworks:opsworks.CreateStack
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/create\-stack\?/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.Name;
        reqParams.cli['--name'] = jsonRequestBody.Name;
        reqParams.boto3['DefaultOs'] = jsonRequestBody.DefaultOs;
        reqParams.cli['--default-os'] = jsonRequestBody.DefaultOs;
        reqParams.boto3['DefaultRootDeviceType'] = jsonRequestBody.DefaultRootDeviceType;
        reqParams.cli['--default-root-device-type'] = jsonRequestBody.DefaultRootDeviceType;
        reqParams.boto3['HostnameTheme'] = jsonRequestBody.HostnameTheme;
        reqParams.cli['--hostname-theme'] = jsonRequestBody.HostnameTheme;
        reqParams.boto3['UseCustomCookbooks'] = jsonRequestBody.UseCustomCookbooks;
        reqParams.cli['--use-custom-cookbooks'] = jsonRequestBody.UseCustomCookbooks;
        reqParams.boto3['CustomJson'] = jsonRequestBody.CustomJson;
        reqParams.cli['--custom-json'] = jsonRequestBody.CustomJson;
        reqParams.boto3['UseOpsworksSecurityGroups'] = jsonRequestBody.UseOpsworksSecurityGroups;
        reqParams.cli['--use-opsworks-security-groups'] = jsonRequestBody.UseOpsworksSecurityGroups;
        reqParams.boto3['ConfigurationManager'] = jsonRequestBody.ConfigurationManager;
        reqParams.cli['--configuration-manager'] = jsonRequestBody.ConfigurationManager;
        reqParams.boto3['Name'] = jsonRequestBody.ConfigurationManager.Name;
        reqParams.cli['--name'] = jsonRequestBody.ConfigurationManager.Name;
        reqParams.boto3['Attributes'] = jsonRequestBody.Attributes;
        reqParams.cli['--attributes'] = jsonRequestBody.Attributes;
        reqParams.boto3['Region'] = jsonRequestBody.Region;
        reqParams.cli['--region'] = jsonRequestBody.Region;
        reqParams.boto3['CustomCookbooksSource'] = jsonRequestBody.CustomCookbooksSource;
        reqParams.cli['--custom-cookbooks-source'] = jsonRequestBody.CustomCookbooksSource;
        reqParams.boto3['VpcId'] = jsonRequestBody.VpcId;
        reqParams.cli['--vpc-id'] = jsonRequestBody.VpcId;
        reqParams.boto3['DefaultSshKeyName'] = jsonRequestBody.DefaultSshKeyName;
        reqParams.cli['--default-ssh-key-name'] = jsonRequestBody.DefaultSshKeyName;
        reqParams.boto3['DefaultSubnetId'] = jsonRequestBody.DefaultSubnetId;
        reqParams.cli['--default-subnet-id'] = jsonRequestBody.DefaultSubnetId;
        reqParams.boto3['ServiceRoleArn'] = jsonRequestBody.ServiceRoleArn;
        reqParams.cli['--service-role-arn'] = jsonRequestBody.ServiceRoleArn;
        reqParams.boto3['DefaultInstanceProfileArn'] = jsonRequestBody.DefaultInstanceProfileArn;
        reqParams.cli['--default-instance-profile-arn'] = jsonRequestBody.DefaultInstanceProfileArn;
        reqParams.boto3['AgentVersion'] = jsonRequestBody.AgentVersion;
        reqParams.cli['--agent-version'] = jsonRequestBody.AgentVersion;

        reqParams.cfn['Name'] = jsonRequestBody.Name;
        reqParams.cfn['DefaultOs'] = jsonRequestBody.DefaultOs;
        reqParams.cfn['DefaultRootDeviceType'] = jsonRequestBody.DefaultRootDeviceType;
        reqParams.cfn['HostnameTheme'] = jsonRequestBody.HostnameTheme;
        reqParams.cfn['UseCustomCookbooks'] = jsonRequestBody.UseCustomCookbooks;
        reqParams.cfn['CustomJson'] = jsonRequestBody.CustomJson;
        reqParams.cfn['UseOpsworksSecurityGroups'] = jsonRequestBody.UseOpsworksSecurityGroups;
        reqParams.cfn['ConfigurationManager'] = jsonRequestBody.ConfigurationManager;
        reqParams.cfn['Name'] = jsonRequestBody.ConfigurationManager.Name;
        reqParams.cfn['Attributes'] = jsonRequestBody.Attributes;
        reqParams.cfn['CustomCookbooksSource'] = jsonRequestBody.CustomCookbooksSource;
        reqParams.cfn['VpcId'] = jsonRequestBody.VpcId;
        reqParams.cfn['DefaultSshKeyName'] = jsonRequestBody.DefaultSshKeyName;
        reqParams.cfn['DefaultSubnetId'] = jsonRequestBody.DefaultSubnetId;
        reqParams.cfn['ServiceRoleArn'] = jsonRequestBody.ServiceRoleArn;
        reqParams.cfn['DefaultInstanceProfileArn'] = jsonRequestBody.DefaultInstanceProfileArn;
        reqParams.cfn['AgentVersion'] = jsonRequestBody.AgentVersion;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'CreateStack',
                'boto3': 'create_stack',
                'cli': 'create-stack'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('opsworks', details.requestId),
            'region': region,
            'service': 'opsworks',
            'type': 'AWS::OpsWorks::Stack',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.CreateApp
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/create\-app\?/g)) {
        reqParams.boto3['StackId'] = jsonRequestBody.StackId;
        reqParams.cli['--stack-id'] = jsonRequestBody.StackId;
        reqParams.boto3['Name'] = jsonRequestBody.Name;
        reqParams.cli['--name'] = jsonRequestBody.Name;
        reqParams.boto3['Type'] = jsonRequestBody.Type;
        reqParams.cli['--type'] = jsonRequestBody.Type;
        reqParams.boto3['AppSource'] = jsonRequestBody.AppSource;
        reqParams.cli['--app-source'] = jsonRequestBody.AppSource;
        reqParams.boto3['EnableSsl'] = jsonRequestBody.EnableSsl;
        reqParams.cli['--enable-ssl'] = jsonRequestBody.EnableSsl;
        reqParams.boto3['Attributes'] = jsonRequestBody.Attributes;
        reqParams.cli['--attributes'] = jsonRequestBody.Attributes;
        reqParams.boto3['Domains'] = jsonRequestBody.Domains;
        reqParams.cli['--domains'] = jsonRequestBody.Domains;
        reqParams.boto3['Environment'] = jsonRequestBody.Environment;
        reqParams.cli['--environment'] = jsonRequestBody.Environment;
        reqParams.boto3['DataSources'] = jsonRequestBody.DataSources;
        reqParams.cli['--data-sources'] = jsonRequestBody.DataSources;

        reqParams.cfn['StackId'] = jsonRequestBody.StackId;
        reqParams.cfn['Name'] = jsonRequestBody.Name;
        reqParams.cfn['Type'] = jsonRequestBody.Type;
        reqParams.cfn['AppSource'] = jsonRequestBody.AppSource;
        reqParams.cfn['EnableSsl'] = jsonRequestBody.EnableSsl;
        reqParams.cfn['Attributes'] = jsonRequestBody.Attributes;
        reqParams.cfn['Domains'] = jsonRequestBody.Domains;
        reqParams.cfn['Environment'] = jsonRequestBody.Environment;
        reqParams.cfn['DataSources'] = jsonRequestBody.DataSources;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'CreateApp',
                'boto3': 'create_app',
                'cli': 'create-app'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('opsworks', details.requestId),
            'region': region,
            'service': 'opsworks',
            'type': 'AWS::OpsWorks::App',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.CreateLayer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/create\-layer\?/g)) {
        reqParams.boto3['StackId'] = jsonRequestBody.StackId;
        reqParams.cli['--stack-id'] = jsonRequestBody.StackId;
        reqParams.boto3['Type'] = jsonRequestBody.Type;
        reqParams.cli['--type'] = jsonRequestBody.Type;
        reqParams.boto3['Name'] = jsonRequestBody.Name;
        reqParams.cli['--name'] = jsonRequestBody.Name;
        reqParams.boto3['Shortname'] = jsonRequestBody.Shortname;
        reqParams.cli['--shortname'] = jsonRequestBody.Shortname;
        reqParams.boto3['AutoAssignPublicIps'] = jsonRequestBody.AutoAssignPublicIps;
        reqParams.cli['--auto-assign-public-ips'] = jsonRequestBody.AutoAssignPublicIps;
        reqParams.boto3['Attributes'] = jsonRequestBody.Attributes;
        reqParams.cli['--attributes'] = jsonRequestBody.Attributes;
        reqParams.boto3['UseEbsOptimizedInstances'] = jsonRequestBody.UseEbsOptimizedInstances;
        reqParams.cli['--use-ebs-optimized-instances'] = jsonRequestBody.UseEbsOptimizedInstances;
        reqParams.boto3['AutoAssignElasticIps'] = jsonRequestBody.AutoAssignElasticIps;
        reqParams.cli['--auto-assign-elastic-ips'] = jsonRequestBody.AutoAssignElasticIps;
        reqParams.boto3['CustomRecipes'] = jsonRequestBody.CustomRecipes;
        reqParams.cli['--custom-recipes'] = jsonRequestBody.CustomRecipes;
        reqParams.boto3['EnableAutoHealing'] = jsonRequestBody.EnableAutoHealing;
        reqParams.cli['--enable-auto-healing'] = jsonRequestBody.EnableAutoHealing;

        reqParams.cfn['StackId'] = jsonRequestBody.StackId;
        reqParams.cfn['Type'] = jsonRequestBody.Type;
        reqParams.cfn['Name'] = jsonRequestBody.Name;
        reqParams.cfn['Shortname'] = jsonRequestBody.Shortname;
        reqParams.cfn['AutoAssignPublicIps'] = jsonRequestBody.AutoAssignPublicIps;
        reqParams.cfn['Attributes'] = jsonRequestBody.Attributes;
        reqParams.cfn['AutoAssignElasticIps'] = jsonRequestBody.AutoAssignElasticIps;
        reqParams.cfn['CustomRecipes'] = jsonRequestBody.CustomRecipes;
        reqParams.cfn['EnableAutoHealing'] = jsonRequestBody.EnableAutoHealing;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'CreateLayer',
                'boto3': 'create_layer',
                'cli': 'create-layer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('opsworks', details.requestId),
            'region': region,
            'service': 'opsworks',
            'type': 'AWS::OpsWorks::Layer',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.CreateInstance
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/create\-instance\?/g)) {
        reqParams.boto3['StackId'] = jsonRequestBody.StackId;
        reqParams.cli['--stack-id'] = jsonRequestBody.StackId;
        reqParams.boto3['LayerIds'] = jsonRequestBody.LayerIds;
        reqParams.cli['--layer-ids'] = jsonRequestBody.LayerIds;
        reqParams.boto3['Hostname'] = jsonRequestBody.Hostname;
        reqParams.cli['--hostname'] = jsonRequestBody.Hostname;
        reqParams.boto3['Os'] = jsonRequestBody.Os;
        reqParams.cli['--os'] = jsonRequestBody.Os;
        reqParams.boto3['SshKeyName'] = jsonRequestBody.SshKeyName;
        reqParams.cli['--ssh-key-name'] = jsonRequestBody.SshKeyName;
        reqParams.boto3['RootDeviceType'] = jsonRequestBody.RootDeviceType;
        reqParams.cli['--root-device-type'] = jsonRequestBody.RootDeviceType;
        reqParams.boto3['Architecture'] = jsonRequestBody.Architecture;
        reqParams.cli['--architecture'] = jsonRequestBody.Architecture;
        reqParams.boto3['BlockDeviceMappings'] = jsonRequestBody.BlockDeviceMappings;
        reqParams.cli['--block-device-mappings'] = jsonRequestBody.BlockDeviceMappings;
        reqParams.boto3['InstanceType'] = jsonRequestBody.InstanceType;
        reqParams.cli['--instance-type'] = jsonRequestBody.InstanceType;

        reqParams.cfn['StackId'] = jsonRequestBody.StackId;
        reqParams.cfn['LayerIds'] = jsonRequestBody.LayerIds;
        reqParams.cfn['Hostname'] = jsonRequestBody.Hostname;
        reqParams.cfn['Os'] = jsonRequestBody.Os;
        reqParams.cfn['SshKeyName'] = jsonRequestBody.SshKeyName;
        reqParams.cfn['RootDeviceType'] = jsonRequestBody.RootDeviceType;
        reqParams.cfn['Architecture'] = jsonRequestBody.Architecture;
        reqParams.cfn['BlockDeviceMappings'] = jsonRequestBody.BlockDeviceMappings;
        reqParams.cfn['InstanceType'] = jsonRequestBody.InstanceType;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'CreateInstance',
                'boto3': 'create_instance',
                'cli': 'create-instance'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('opsworks', details.requestId),
            'region': region,
            'service': 'opsworks',
            'type': 'AWS::OpsWorks::Instance',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.DescribeLayers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/describe\-layers\?region=ap\-southeast\-2$/g)) {
        reqParams.boto3['StackId'] = jsonRequestBody.StackId;
        reqParams.cli['--stack-id'] = jsonRequestBody.StackId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'DescribeLayers',
                'boto3': 'describe_layers',
                'cli': 'describe-layers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:opsworks:opsworks.UpdateLayer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/update\-layer\?/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.Name;
        reqParams.cli['--name'] = jsonRequestBody.Name;
        reqParams.boto3['Shortname'] = jsonRequestBody.Shortname;
        reqParams.cli['--shortname'] = jsonRequestBody.Shortname;
        reqParams.boto3['AutoAssignPublicIps'] = jsonRequestBody.AutoAssignPublicIps;
        reqParams.cli['--auto-assign-public-ips'] = jsonRequestBody.AutoAssignPublicIps;
        reqParams.boto3['Attributes'] = jsonRequestBody.Attributes;
        reqParams.cli['--attributes'] = jsonRequestBody.Attributes;
        reqParams.boto3['UseEbsOptimizedInstances'] = jsonRequestBody.UseEbsOptimizedInstances;
        reqParams.cli['--use-ebs-optimized-instances'] = jsonRequestBody.UseEbsOptimizedInstances;
        reqParams.boto3['CustomInstanceProfileArn'] = jsonRequestBody.CustomInstanceProfileArn;
        reqParams.cli['--custom-instance-profile-arn'] = jsonRequestBody.CustomInstanceProfileArn;
        reqParams.boto3['AutoAssignElasticIps'] = jsonRequestBody.AutoAssignElasticIps;
        reqParams.cli['--auto-assign-elastic-ips'] = jsonRequestBody.AutoAssignElasticIps;
        reqParams.boto3['CloudWatchLogsConfiguration'] = jsonRequestBody.CloudWatchLogsConfiguration;
        reqParams.cli['--cloud-watch-logs-configuration'] = jsonRequestBody.CloudWatchLogsConfiguration;
        reqParams.boto3['CustomRecipes'] = jsonRequestBody.CustomRecipes;
        reqParams.cli['--custom-recipes'] = jsonRequestBody.CustomRecipes;
        reqParams.boto3['CustomSecurityGroupIds'] = jsonRequestBody.CustomSecurityGroupIds;
        reqParams.cli['--custom-security-group-ids'] = jsonRequestBody.CustomSecurityGroupIds;
        reqParams.boto3['EnableAutoHealing'] = jsonRequestBody.EnableAutoHealing;
        reqParams.cli['--enable-auto-healing'] = jsonRequestBody.EnableAutoHealing;
        reqParams.boto3['LayerId'] = jsonRequestBody.LayerId;
        reqParams.cli['--layer-id'] = jsonRequestBody.LayerId;
        reqParams.boto3['LifecycleEventConfiguration'] = jsonRequestBody.LifecycleEventConfiguration;
        reqParams.cli['--lifecycle-event-configuration'] = jsonRequestBody.LifecycleEventConfiguration;
        reqParams.boto3['Packages'] = jsonRequestBody.Packages;
        reqParams.cli['--packages'] = jsonRequestBody.Packages;
        reqParams.boto3['VolumeConfigurations'] = jsonRequestBody.VolumeConfigurations;
        reqParams.cli['--volume-configurations'] = jsonRequestBody.VolumeConfigurations;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'UpdateLayer',
                'boto3': 'update_layer',
                'cli': 'update-layer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.RegisterVolume
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/register\-volume\?/g)) {
        reqParams.boto3['Ec2VolumeId'] = jsonRequestBody.Ec2VolumeId;
        reqParams.cli['--ec-2-volume-id'] = jsonRequestBody.Ec2VolumeId;
        reqParams.boto3['StackId'] = jsonRequestBody.StackId;
        reqParams.cli['--stack-id'] = jsonRequestBody.StackId;

        reqParams.cfn['Ec2VolumeId'] = jsonRequestBody.Ec2VolumeId;
        reqParams.cfn['StackId'] = jsonRequestBody.StackId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'RegisterVolume',
                'boto3': 'register_volume',
                'cli': 'register-volume'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('opsworks', details.requestId),
            'region': region,
            'service': 'opsworks',
            'type': 'AWS::OpsWorks::Volume',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.DescribeVolumes
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/describe\-volumes\?/g)) {
        reqParams.boto3['StackId'] = jsonRequestBody.StackId;
        reqParams.cli['--stack-id'] = jsonRequestBody.StackId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'DescribeVolumes',
                'boto3': 'describe_volumes',
                'cli': 'describe-volumes'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:opsworks:opsworks.CreateUserProfile
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/create\-user\-profile\?/g)) {
        reqParams.boto3['IamUserArn'] = jsonRequestBody.IamUserArn;
        reqParams.cli['--iam-user-arn'] = jsonRequestBody.IamUserArn;
        reqParams.boto3['SshPublicKey'] = jsonRequestBody.SshPublicKey;
        reqParams.cli['--ssh-public-key'] = jsonRequestBody.SshPublicKey;
        reqParams.boto3['AllowSelfManagement'] = jsonRequestBody.AllowSelfManagement;
        reqParams.cli['--allow-self-management'] = jsonRequestBody.AllowSelfManagement;

        reqParams.cfn['IamUserArn'] = jsonRequestBody.IamUserArn;
        reqParams.cfn['SshPublicKey'] = jsonRequestBody.SshPublicKey;
        reqParams.cfn['AllowSelfManagement'] = jsonRequestBody.AllowSelfManagement;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'CreateUserProfile',
                'boto3': 'create_user_profile',
                'cli': 'create-user-profile'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('opsworks', details.requestId),
            'region': region,
            'service': 'opsworks',
            'type': 'AWS::OpsWorks::UserProfile',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.DescribeElasticLoadBalancers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/list\-elastic\-load\-balancers\?/g)) {
        reqParams.boto3['StackId'] = jsonRequestBody.StackId;
        reqParams.cli['--stack-id'] = jsonRequestBody.StackId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'DescribeElasticLoadBalancers',
                'boto3': 'describe_elastic_load_balancers',
                'cli': 'describe-elastic-load-balancers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:opsworks:opsworks.AttachElasticLoadBalancer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/attach\-elastic\-load\-balancer\?/g)) {
        reqParams.boto3['ElasticLoadBalancerName'] = jsonRequestBody.ElasticLoadBalancerName;
        reqParams.cli['--elastic-load-balancer-name'] = jsonRequestBody.ElasticLoadBalancerName;
        reqParams.boto3['LayerId'] = jsonRequestBody.LayerId;
        reqParams.cli['--layer-id'] = jsonRequestBody.LayerId;

        reqParams.cfn['ElasticLoadBalancerName'] = jsonRequestBody.ElasticLoadBalancerName;
        reqParams.cfn['LayerId'] = jsonRequestBody.LayerId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'AttachElasticLoadBalancer',
                'boto3': 'attach_elastic_load_balancer',
                'cli': 'attach-elastic-load-balancer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('opsworks', details.requestId),
            'region': region,
            'service': 'opsworks',
            'type': 'AWS::OpsWorks::ElasticLoadBalancerAttachment',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.DeleteInstance
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/delete\-instance\?/g)) {
        reqParams.boto3['InstanceId'] = jsonRequestBody.InstanceId;
        reqParams.cli['--instance-id'] = jsonRequestBody.InstanceId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'DeleteInstance',
                'boto3': 'delete_instance',
                'cli': 'delete-instance'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:elb.DeleteLoadBalancer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/ec2\/ecb\?call=deleteLoadBalancer\?/g)) {
        reqParams.boto3['LoadBalancerName'] = jsonRequestBody.loadBalancerName;
        reqParams.cli['--load-balancer-name'] = jsonRequestBody.loadBalancerName;

        outputs.push({
            'region': region,
            'service': 'elb',
            'method': {
                'api': 'DeleteLoadBalancer',
                'boto3': 'delete_load_balancer',
                'cli': 'delete-load-balancer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.DetachElasticLoadBalancer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/detach\-elastic\-load\-balancer\?/g)) {
        reqParams.boto3['ElasticLoadBalancerName'] = jsonRequestBody.ElasticLoadBalancerName;
        reqParams.cli['--elastic-load-balancer-name'] = jsonRequestBody.ElasticLoadBalancerName;
        reqParams.boto3['LayerId'] = jsonRequestBody.LayerId;
        reqParams.cli['--layer-id'] = jsonRequestBody.LayerId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'DetachElasticLoadBalancer',
                'boto3': 'detach_elastic_load_balancer',
                'cli': 'detach-elastic-load-balancer'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:opsworks:opsworks.DeleteLayer
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/delete\-layer\?/g)) {
        reqParams.boto3['LayerId'] = jsonRequestBody.LayerId;
        reqParams.cli['--layer-id'] = jsonRequestBody.LayerId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'DeleteLayer',
                'boto3': 'delete_layer',
                'cli': 'delete-layer'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.DeleteApp
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/delete\-app\?/g)) {
        reqParams.boto3['AppId'] = jsonRequestBody.AppId;
        reqParams.cli['--app-id'] = jsonRequestBody.AppId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'DeleteApp',
                'boto3': 'delete_app',
                'cli': 'delete-app'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:opsworks:opsworks.DeleteStack
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/opsworks\/s\/delete\-stack\?/g)) {
        reqParams.boto3['StackId'] = jsonRequestBody.StackId;
        reqParams.cli['--stack-id'] = jsonRequestBody.StackId;

        outputs.push({
            'region': region,
            'service': 'opsworks',
            'method': {
                'api': 'DeleteStack',
                'boto3': 'delete_stack',
                'cli': 'delete-stack'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:redshift:ec2.DescribeSecurityGroups
    // autogen:redshift:ec2.DescribeAddresses
    // autogen:redshift:redshift.DescribeClusterParameterGroups
    // autogen:redshift:redshift.DescribeClusterSubnetGroups
    // autogen:redshift:ec2.DescribeVpcs
    // autogen:redshift:sns.ListTopics
    // autogen:redshift:redshift.CreateCluster
    // autogen:redshift:redshift.CreateClusterParameterGroup
    // autogen:redshift:redshift.CreateClusterSubnetGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/redshift\/rpc$/g)) {
        for (var i in jsonRequestBody.actions) {
            var action = jsonRequestBody.actions[i];
            if (action['action'] == "EC2.DescribeSecurityGroupsDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSecurityGroups',
                        'boto3': 'describe_security_groups',
                        'cli': 'describe-security-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "EC2.DescribeAddressesDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeAddresses',
                        'boto3': 'describe_addresses',
                        'cli': 'describe-addresses'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.cookiemonster.shared.ParamGroupContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'redshift',
                    'method': {
                        'api': 'DescribeClusterParameterGroups',
                        'boto3': 'describe_cluster_parameter_groups',
                        'cli': 'describe-cluster-parameter-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.cookiemonster.shared.ClusterSubnetGroupContext.list") {
                outputs.push({
                    'region': region,
                    'service': 'redshift',
                    'method': {
                        'api': 'DescribeClusterSubnetGroups',
                        'boto3': 'describe_cluster_subnet_groups',
                        'cli': 'describe-cluster-subnet-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "EC2.DescribeVpcsDefault") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeVpcs',
                        'boto3': 'describe_vpcs',
                        'cli': 'describe-vpcs'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.cookiemonster.shared.RedshiftSnsContext.listTopicsWithMaxRecords") {
                outputs.push({
                    'region': region,
                    'service': 'sns',
                    'method': {
                        'api': 'ListTopics',
                        'boto3': 'list_topics',
                        'cli': 'list-topics'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.cookiemonster.shared.ClusterContext.create") {
                reqParams.boto3['AllowVersionUpgrade'] = action['parameters'][0]['allowVersionUpgrade'];
                reqParams.cli['--allow-version-upgrade'] = action['parameters'][0]['allowVersionUpgrade'];
                reqParams.boto3['Encrypted'] = action['parameters'][0]['encrypted'];
                reqParams.cli['--encrypted'] = action['parameters'][0]['encrypted'];
                reqParams.boto3['EnhancedVpcRouting'] = action['parameters'][0]['enhancedVpcRouting'];
                reqParams.cli['--enhanced-vpc-routing'] = action['parameters'][0]['enhancedVpcRouting'];
                reqParams.boto3['PubliclyAccessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.cli['--publicly-accessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.boto3['AutomatedSnapshotRetentionPeriod'] = action['parameters'][0]['automatedSnapshotRetentionPeriod'];
                reqParams.cli['--automated-snapshot-retention-period'] = action['parameters'][0]['automatedSnapshotRetentionPeriod'];
                reqParams.boto3['NumberOfNodes'] = action['parameters'][0]['numberOfNodes'];
                reqParams.cli['--number-of-nodes'] = action['parameters'][0]['numberOfNodes'];
                reqParams.boto3['Port'] = action['parameters'][0]['port'];
                reqParams.cli['--port'] = action['parameters'][0]['port'];
                reqParams.boto3['AvailabilityZone'] = action['parameters'][0]['availabilityZone'];
                reqParams.cli['--availability-zone'] = action['parameters'][0]['availabilityZone'];
                reqParams.boto3['ClusterIdentifier'] = action['parameters'][0]['clusterIdentifier'];
                reqParams.cli['--cluster-identifier'] = action['parameters'][0]['clusterIdentifier'];
                reqParams.boto3['ClusterType'] = action['parameters'][0]['clusterType'];
                reqParams.cli['--cluster-type'] = action['parameters'][0]['clusterType'];
                reqParams.boto3['ClusterVersion'] = action['parameters'][0]['clusterVersion'];
                reqParams.cli['--cluster-version'] = action['parameters'][0]['clusterVersion'];
                reqParams.boto3['DBName'] = action['parameters'][0]['DBName'];
                reqParams.cli['--db-name'] = action['parameters'][0]['DBName'];
                reqParams.boto3['KmsKeyId'] = action['parameters'][0]['kmsKeyId'];
                reqParams.cli['--kms-key-id'] = action['parameters'][0]['kmsKeyId'];
                reqParams.boto3['MaintenanceTrackName'] = action['parameters'][0]['maintenanceTrackName'];
                reqParams.cli['--maintenance-track-name'] = action['parameters'][0]['maintenanceTrackName'];
                reqParams.boto3['MasterUserPassword'] = action['parameters'][0]['masterUserPassword'];
                reqParams.cli['--master-user-password'] = action['parameters'][0]['masterUserPassword'];
                reqParams.boto3['MasterUsername'] = action['parameters'][0]['masterUsername'];
                reqParams.cli['--master-username'] = action['parameters'][0]['masterUsername'];
                reqParams.boto3['NodeType'] = action['parameters'][0]['nodeType'];
                reqParams.cli['--node-type'] = action['parameters'][0]['nodeType'];
                reqParams.boto3['IamRoles'] = action['parameters'][0]['iamRoles'];
                reqParams.cli['--iam-roles'] = action['parameters'][0]['iamRoles'];
                reqParams.boto3['VpcSecurityGroupIds'] = action['parameters'][0]['vpcSecurityGroupIds'];
                reqParams.cli['--vpc-security-group-ids'] = action['parameters'][0]['vpcSecurityGroupIds'];

                reqParams.cfn['AllowVersionUpgrade'] = action['parameters'][0]['allowVersionUpgrade'];
                reqParams.cfn['Encrypted'] = action['parameters'][0]['encrypted'];
                reqParams.cfn['PubliclyAccessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.cfn['AutomatedSnapshotRetentionPeriod'] = action['parameters'][0]['automatedSnapshotRetentionPeriod'];
                reqParams.cfn['NumberOfNodes'] = action['parameters'][0]['numberOfNodes'];
                reqParams.cfn['Port'] = action['parameters'][0]['port'];
                reqParams.cfn['AvailabilityZone'] = action['parameters'][0]['availabilityZone'];
                reqParams.cfn['ClusterIdentifier'] = action['parameters'][0]['clusterIdentifier'];
                reqParams.cfn['ClusterType'] = action['parameters'][0]['clusterType'];
                reqParams.cfn['ClusterVersion'] = action['parameters'][0]['clusterVersion'];
                reqParams.cfn['DBName'] = action['parameters'][0]['DBName'];
                reqParams.cfn['KmsKeyId'] = action['parameters'][0]['kmsKeyId'];
                reqParams.cfn['MasterUserPassword'] = action['parameters'][0]['masterUserPassword'];
                reqParams.cfn['MasterUsername'] = action['parameters'][0]['masterUsername'];
                reqParams.cfn['NodeType'] = action['parameters'][0]['nodeType'];
                reqParams.cfn['IamRoles'] = action['parameters'][0]['iamRoles'];
                reqParams.cfn['VpcSecurityGroupIds'] = action['parameters'][0]['vpcSecurityGroupIds'];
        
                outputs.push({
                    'region': region,
                    'service': 'redshift',
                    'method': {
                        'api': 'CreateCluster',
                        'boto3': 'create_cluster',
                        'cli': 'create-cluster'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('redshift', details.requestId),
                    'region': region,
                    'service': 'redshift',
                    'type': 'AWS::Redshift::Cluster',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.cookiemonster.shared.ParamGroupContext.createClusterParameterGroup") {
                reqParams.boto3['Description'] = action['parameters'][0]['description'];
                reqParams.cli['--description'] = action['parameters'][0]['description'];
                reqParams.boto3['ParameterGroupFamily'] = action['parameters'][0]['parameterGroupFamily'];
                reqParams.cli['--parameter-group-family'] = action['parameters'][0]['parameterGroupFamily'];
                reqParams.boto3['ParameterGroupName'] = action['parameters'][0]['parameterGroupName'];
                reqParams.cli['--parameter-group-name'] = action['parameters'][0]['parameterGroupName'];

                reqParams.cfn['Description'] = action['parameters'][0]['description'];
                reqParams.cfn['ParameterGroupFamily'] = action['parameters'][0]['parameterGroupFamily'];
        
                outputs.push({
                    'region': region,
                    'service': 'redshift',
                    'method': {
                        'api': 'CreateClusterParameterGroup',
                        'boto3': 'create_cluster_parameter_group',
                        'cli': 'create-cluster-parameter-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('redshift', details.requestId),
                    'region': region,
                    'service': 'redshift',
                    'type': 'AWS::Redshift::ClusterParameterGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.cookiemonster.shared.ClusterSubnetGroupContext.create") {
                reqParams.boto3['ClusterSubnetGroupName'] = action['parameters'][0]['clusterSubnetGroupName'];
                reqParams.cli['--cluster-subnet-group-name'] = action['parameters'][0]['clusterSubnetGroupName'];
                reqParams.boto3['Description'] = action['parameters'][0]['description'];
                reqParams.cli['--description'] = action['parameters'][0]['description'];
                reqParams.boto3['SubnetIds'] = action['parameters'][0]['subnetIds'];
                reqParams.cli['--subnet-ids'] = action['parameters'][0]['subnetIds'];

                reqParams.cfn['Description'] = action['parameters'][0]['description'];
                reqParams.cfn['SubnetIds'] = action['parameters'][0]['subnetIds'];
        
                outputs.push({
                    'region': region,
                    'service': 'redshift',
                    'method': {
                        'api': 'CreateClusterSubnetGroup',
                        'boto3': 'create_cluster_subnet_group',
                        'cli': 'create-cluster-subnet-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('redshift', details.requestId),
                    'region': region,
                    'service': 'redshift',
                    'type': 'AWS::Redshift::ClusterSubnetGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            }
        }
    }

    // autogen:waf:waf.ListIPSets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListIPSets") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListIPSets',
                'boto3': 'list_ip_sets',
                'cli': 'list-ip-sets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListSqlInjectionMatchSets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListSqlInjectionMatchSets") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListSqlInjectionMatchSets',
                'boto3': 'list_sql_injection_match_sets',
                'cli': 'list-sql-injection-match-sets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListSizeConstraintSets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListSizeConstraintSets") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListSizeConstraintSets',
                'boto3': 'list_size_constraint_sets',
                'cli': 'list-size-constraint-sets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListXssMatchSets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListXssMatchSets") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListXssMatchSets',
                'boto3': 'list_xss_match_sets',
                'cli': 'list-xss-match-sets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListGeoMatchSets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListGeoMatchSets") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListGeoMatchSets',
                'boto3': 'list_geo_match_sets',
                'cli': 'list-geo-match-sets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListByteMatchSets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListByteMatchSets") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListByteMatchSets',
                'boto3': 'list_byte_match_sets',
                'cli': 'list-byte-match-sets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListRegexMatchSets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListRegexMatchSets") {
        reqParams.boto3['NextMarker'] = jsonRequestBody.content.NextMarker;
        reqParams.cli['--next-marker'] = jsonRequestBody.content.NextMarker;
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListRegexMatchSets',
                'boto3': 'list_regex_match_sets',
                'cli': 'list-regex-match-sets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.GetChangeToken
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.GetChangeToken") {

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'GetChangeToken',
                'boto3': 'get_change_token',
                'cli': 'get-change-token'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.CreateXssMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.CreateXssMatchSet") {
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        reqParams.cfn['Name'] = jsonRequestBody.content.Name;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'CreateXssMatchSet',
                'boto3': 'create_xss_match_set',
                'cli': 'create-xss-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('waf', details.requestId),
            'region': region,
            'service': 'waf',
            'type': 'AWS::WAF::XssMatchSet',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.UpdateXssMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.UpdateXssMatchSet") {
        reqParams.boto3['XssMatchSetId'] = jsonRequestBody.content.XssMatchSetId;
        reqParams.cli['--xss-match-set-id'] = jsonRequestBody.content.XssMatchSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;
        reqParams.boto3['Updates'] = jsonRequestBody.content.Updates;
        reqParams.cli['--updates'] = jsonRequestBody.content.Updates;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'UpdateXssMatchSet',
                'boto3': 'update_xss_match_set',
                'cli': 'update-xss-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.CreateIPSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.CreateIPSet") {
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        reqParams.cfn['Name'] = jsonRequestBody.content.Name;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'CreateIPSet',
                'boto3': 'create_ip_set',
                'cli': 'create-ip-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('waf', details.requestId),
            'region': region,
            'service': 'waf',
            'type': 'AWS::WAF::IPSet',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.UpdateIPSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.UpdateIPSet") {
        reqParams.boto3['IPSetId'] = jsonRequestBody.content.IPSetId;
        reqParams.cli['--ip-set-id'] = jsonRequestBody.content.IPSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;
        reqParams.boto3['Updates'] = jsonRequestBody.content.Updates;
        reqParams.cli['--updates'] = jsonRequestBody.content.Updates;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'UpdateIPSet',
                'boto3': 'update_ip_set',
                'cli': 'update-ip-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.CreateSizeConstraintSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.CreateSizeConstraintSet") {
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        reqParams.cfn['Name'] = jsonRequestBody.content.Name;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'CreateSizeConstraintSet',
                'boto3': 'create_size_constraint_set',
                'cli': 'create-size-constraint-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('waf', details.requestId),
            'region': region,
            'service': 'waf',
            'type': 'AWS::WAF::SizeConstraintSet',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.UpdateSizeConstraintSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.UpdateSizeConstraintSet") {
        reqParams.boto3['SizeConstraintSetId'] = jsonRequestBody.content.SizeConstraintSetId;
        reqParams.cli['--size-constraint-set-id'] = jsonRequestBody.content.SizeConstraintSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;
        reqParams.boto3['Updates'] = jsonRequestBody.content.Updates;
        reqParams.cli['--updates'] = jsonRequestBody.content.Updates;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'UpdateSizeConstraintSet',
                'boto3': 'update_size_constraint_set',
                'cli': 'update-size-constraint-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.ListRules
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListRules") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListRules',
                'boto3': 'list_rules',
                'cli': 'list-rules'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListRateBasedRules
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListRateBasedRules") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListRateBasedRules',
                'boto3': 'list_rate_based_rules',
                'cli': 'list-rate-based-rules'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListSubscribedRuleGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListSubscribedRuleGroups") {

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListSubscribedRuleGroups',
                'boto3': 'list_subscribed_rule_groups',
                'cli': 'list-subscribed-rule-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.ListRuleGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.ListRuleGroups") {
        reqParams.boto3['Limit'] = jsonRequestBody.content.Limit;
        reqParams.cli['--limit'] = jsonRequestBody.content.Limit;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'ListRuleGroups',
                'boto3': 'list_rule_groups',
                'cli': 'list-rule-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:waf:waf.CreateSqlInjectionMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.CreateSqlInjectionMatchSet") {
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        reqParams.cfn['Name'] = jsonRequestBody.content.Name;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'CreateSqlInjectionMatchSet',
                'boto3': 'create_sql_injection_match_set',
                'cli': 'create-sql-injection-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('waf', details.requestId),
            'region': region,
            'service': 'waf',
            'type': 'AWS::WAF::SqlInjectionMatchSet',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.UpdateSqlInjectionMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.UpdateSqlInjectionMatchSet") {
        reqParams.boto3['SqlInjectionMatchSetId'] = jsonRequestBody.content.SqlInjectionMatchSetId;
        reqParams.cli['--sql-injection-match-set-id'] = jsonRequestBody.content.SqlInjectionMatchSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;
        reqParams.boto3['Updates'] = jsonRequestBody.content.Updates;
        reqParams.cli['--updates'] = jsonRequestBody.content.Updates;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'UpdateSqlInjectionMatchSet',
                'boto3': 'update_sql_injection_match_set',
                'cli': 'update-sql-injection-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.CreateRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.CreateRule") {
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;
        reqParams.boto3['MetricName'] = jsonRequestBody.content.MetricName;
        reqParams.cli['--metric-name'] = jsonRequestBody.content.MetricName;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        reqParams.cfn['Name'] = jsonRequestBody.content.Name;
        reqParams.cfn['MetricName'] = jsonRequestBody.content.MetricName;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'CreateRule',
                'boto3': 'create_rule',
                'cli': 'create-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('waf', details.requestId),
            'region': region,
            'service': 'waf',
            'type': 'AWS::WAF::Rule',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.UpdateRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.UpdateRule") {
        reqParams.boto3['RuleId'] = jsonRequestBody.content.RuleId;
        reqParams.cli['--rule-id'] = jsonRequestBody.content.RuleId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;
        reqParams.boto3['Updates'] = jsonRequestBody.content.Updates;
        reqParams.cli['--updates'] = jsonRequestBody.content.Updates;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'UpdateRule',
                'boto3': 'update_rule',
                'cli': 'update-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.CreateWebACL
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.CreateWebACL") {
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;
        reqParams.boto3['MetricName'] = jsonRequestBody.content.MetricName;
        reqParams.cli['--metric-name'] = jsonRequestBody.content.MetricName;
        reqParams.boto3['DefaultAction'] = jsonRequestBody.content.DefaultAction;
        reqParams.cli['--default-action'] = jsonRequestBody.content.DefaultAction;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        reqParams.cfn['Name'] = jsonRequestBody.content.Name;
        reqParams.cfn['MetricName'] = jsonRequestBody.content.MetricName;
        reqParams.cfn['DefaultAction'] = jsonRequestBody.content.DefaultAction;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'CreateWebACL',
                'boto3': 'create_web_acl',
                'cli': 'create-web-acl'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('waf', details.requestId),
            'region': region,
            'service': 'waf',
            'type': 'AWS::WAF::WebACL',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.UpdateWebACL
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.UpdateWebACL") {
        reqParams.boto3['WebACLId'] = jsonRequestBody.content.WebACLId;
        reqParams.cli['--web-acl-id'] = jsonRequestBody.content.WebACLId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;
        reqParams.boto3['Updates'] = jsonRequestBody.content.Updates;
        reqParams.cli['--updates'] = jsonRequestBody.content.Updates;
        reqParams.boto3['DefaultAction'] = jsonRequestBody.content.DefaultAction;
        reqParams.cli['--default-action'] = jsonRequestBody.content.DefaultAction;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'UpdateWebACL',
                'boto3': 'update_web_acl',
                'cli': 'update-web-acl'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.DeleteXssMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.DeleteXssMatchSet") {
        reqParams.boto3['XssMatchSetId'] = jsonRequestBody.content.XssMatchSetId;
        reqParams.cli['--xss-match-set-id'] = jsonRequestBody.content.XssMatchSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'DeleteXssMatchSet',
                'boto3': 'delete_xss_match_set',
                'cli': 'delete-xss-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.DeleteIPSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.DeleteIPSet") {
        reqParams.boto3['IPSetId'] = jsonRequestBody.content.IPSetId;
        reqParams.cli['--ip-set-id'] = jsonRequestBody.content.IPSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'DeleteIPSet',
                'boto3': 'delete_ip_set',
                'cli': 'delete-ip-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.DeleteSizeConstraintSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.DeleteSizeConstraintSet") {
        reqParams.boto3['SizeConstraintSetId'] = jsonRequestBody.content.SizeConstraintSetId;
        reqParams.cli['--size-constraint-set-id'] = jsonRequestBody.content.SizeConstraintSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'DeleteSizeConstraintSet',
                'boto3': 'delete_size_constraint_set',
                'cli': 'delete-size-constraint-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.DeleteSqlInjectionMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.DeleteSqlInjectionMatchSet") {
        reqParams.boto3['SqlInjectionMatchSetId'] = jsonRequestBody.content.SqlInjectionMatchSetId;
        reqParams.cli['--sql-injection-match-set-id'] = jsonRequestBody.content.SqlInjectionMatchSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'DeleteSqlInjectionMatchSet',
                'boto3': 'delete_sql_injection_match_set',
                'cli': 'delete-sql-injection-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.DeleteRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.DeleteRule") {
        reqParams.boto3['RuleId'] = jsonRequestBody.content.RuleId;
        reqParams.cli['--rule-id'] = jsonRequestBody.content.RuleId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'DeleteRule',
                'boto3': 'delete_rule',
                'cli': 'delete-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.CreateByteMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.CreateByteMatchSet") {
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        reqParams.cfn['Name'] = jsonRequestBody.content.Name;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'CreateByteMatchSet',
                'boto3': 'create_byte_match_set',
                'cli': 'create-byte-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('waf', details.requestId),
            'region': region,
            'service': 'waf',
            'type': 'AWS::WAF::ByteMatchSet',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.UpdateByteMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.UpdateByteMatchSet") {
        reqParams.boto3['ByteMatchSetId'] = jsonRequestBody.content.ByteMatchSetId;
        reqParams.cli['--byte-match-set-id'] = jsonRequestBody.content.ByteMatchSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;
        reqParams.boto3['Updates'] = jsonRequestBody.content.Updates;
        reqParams.cli['--updates'] = jsonRequestBody.content.Updates;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'UpdateByteMatchSet',
                'boto3': 'update_byte_match_set',
                'cli': 'update-byte-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:waf:waf.DeleteByteMatchSet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/waf\/api\/waf$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSWAF_20150824.DeleteByteMatchSet") {
        reqParams.boto3['ByteMatchSetId'] = jsonRequestBody.content.ByteMatchSetId;
        reqParams.cli['--byte-match-set-id'] = jsonRequestBody.content.ByteMatchSetId;
        reqParams.boto3['ChangeToken'] = jsonRequestBody.content.ChangeToken;
        reqParams.cli['--change-token'] = jsonRequestBody.content.ChangeToken;

        outputs.push({
            'region': region,
            'service': 'waf',
            'method': {
                'api': 'DeleteByteMatchSet',
                'boto3': 'delete_byte_match_set',
                'cli': 'delete-byte-match-set'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:inspector:inspector.DescribeCrossAccountAccessRole
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/DescribeCrossAccountAccessRole$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.DescribeCrossAccountAccessRole") {

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'DescribeCrossAccountAccessRole',
                'boto3': 'describe_cross_account_access_role',
                'cli': 'describe-cross-account-access-role'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:inspector.ListAssessmentTargets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/ListAssessmentTargets$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.ListAssessmentTargets") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.content.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.content.maxResults;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'ListAssessmentTargets',
                'boto3': 'list_assessment_targets',
                'cli': 'list-assessment-targets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:inspector.ListRulesPackages
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/ListRulesPackages$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.ListRulesPackages") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.content.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.content.maxResults;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'ListRulesPackages',
                'boto3': 'list_rules_packages',
                'cli': 'list-rules-packages'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:inspector.DescribeRulesPackages
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/DescribeRulesPackages$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.DescribeRulesPackages") {
        reqParams.boto3['RulesPackageArns'] = jsonRequestBody.content.rulesPackageArns;
        reqParams.cli['--rules-package-arns'] = jsonRequestBody.content.rulesPackageArns;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'DescribeRulesPackages',
                'boto3': 'describe_rules_packages',
                'cli': 'describe-rules-packages'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:inspector.RegisterCrossAccountAccessRole
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/RegisterCrossAccountAccessRole$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.RegisterCrossAccountAccessRole") {
        reqParams.boto3['RoleArn'] = jsonRequestBody.content.roleArn;
        reqParams.cli['--role-arn'] = jsonRequestBody.content.roleArn;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'RegisterCrossAccountAccessRole',
                'boto3': 'register_cross_account_access_role',
                'cli': 'register-cross-account-access-role'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:inspector:inspector.CreateAssessmentTarget
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/CreateAssessmentTarget$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.CreateAssessmentTarget") {
        reqParams.boto3['AssessmentTargetName'] = jsonRequestBody.content.assessmentTargetName;
        reqParams.cli['--assessment-target-name'] = jsonRequestBody.content.assessmentTargetName;

        reqParams.cfn['AssessmentTargetName'] = jsonRequestBody.content.assessmentTargetName;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'CreateAssessmentTarget',
                'boto3': 'create_assessment_target',
                'cli': 'create-assessment-target'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('inspector', details.requestId),
            'region': region,
            'service': 'inspector',
            'type': 'AWS::Inspector::AssessmentTarget',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:inspector:inspector.ListAssessmentTargets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/ListAssessmentTargets$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.ListAssessmentTargets") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.content.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.content.maxResults;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'ListAssessmentTargets',
                'boto3': 'list_assessment_targets',
                'cli': 'list-assessment-targets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:inspector.CreateAssessmentTemplate
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/CreateAssessmentTemplate$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.CreateAssessmentTemplate") {
        reqParams.boto3['AssessmentTemplateName'] = jsonRequestBody.content.assessmentTemplateName;
        reqParams.cli['--assessment-template-name'] = jsonRequestBody.content.assessmentTemplateName;
        reqParams.boto3['AssessmentTargetArn'] = jsonRequestBody.content.assessmentTargetArn;
        reqParams.cli['--assessment-target-arn'] = jsonRequestBody.content.assessmentTargetArn;
        reqParams.boto3['DurationInSeconds'] = jsonRequestBody.content.durationInSeconds;
        reqParams.cli['--duration-in-seconds'] = jsonRequestBody.content.durationInSeconds;
        reqParams.boto3['RulesPackageArns'] = jsonRequestBody.content.rulesPackageArns;
        reqParams.cli['--rules-package-arns'] = jsonRequestBody.content.rulesPackageArns;

        reqParams.cfn['AssessmentTemplateName'] = jsonRequestBody.content.assessmentTemplateName;
        reqParams.cfn['AssessmentTargetArn'] = jsonRequestBody.content.assessmentTargetArn;
        reqParams.cfn['DurationInSeconds'] = jsonRequestBody.content.durationInSeconds;
        reqParams.cfn['RulesPackageArns'] = jsonRequestBody.content.rulesPackageArns;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'CreateAssessmentTemplate',
                'boto3': 'create_assessment_template',
                'cli': 'create-assessment-template'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('inspector', details.requestId),
            'region': region,
            'service': 'inspector',
            'type': 'AWS::Inspector::AssessmentTemplate',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:inspector:inspector.DescribeAssessmentTargets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/DescribeAssessmentTargets$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.DescribeAssessmentTargets") {
        reqParams.boto3['AssessmentTargetArns'] = jsonRequestBody.content.assessmentTargetArns;
        reqParams.cli['--assessment-target-arns'] = jsonRequestBody.content.assessmentTargetArns;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'DescribeAssessmentTargets',
                'boto3': 'describe_assessment_targets',
                'cli': 'describe-assessment-targets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:inspector.ListAssessmentTemplates
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/ListAssessmentTemplates$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.ListAssessmentTemplates") {
        reqParams.boto3['AssessmentTargetArns'] = jsonRequestBody.content.assessmentTargetArns;
        reqParams.cli['--assessment-target-arns'] = jsonRequestBody.content.assessmentTargetArns;
        reqParams.boto3['MaxResults'] = jsonRequestBody.content.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.content.maxResults;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'ListAssessmentTemplates',
                'boto3': 'list_assessment_templates',
                'cli': 'list-assessment-templates'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:events.PutRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/events\-proxy$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSEvents.PutRule") {
        reqParams.boto3['Description'] = jsonRequestBody.content.Description;
        reqParams.cli['--description'] = jsonRequestBody.content.Description;
        reqParams.boto3['ScheduleExpression'] = jsonRequestBody.content.ScheduleExpression;
        reqParams.cli['--schedule-expression'] = jsonRequestBody.content.ScheduleExpression;
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'PutRule',
                'boto3': 'put_rule',
                'cli': 'put-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:inspector:events.PutTargets
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/events\-proxy$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSEvents.PutTargets") {
        reqParams.boto3['Rule'] = jsonRequestBody.content.Rule;
        reqParams.cli['--rule'] = jsonRequestBody.content.Rule;
        reqParams.boto3['Targets'] = jsonRequestBody.content.Targets;
        reqParams.cli['--targets'] = jsonRequestBody.content.Targets;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'PutTargets',
                'boto3': 'put_targets',
                'cli': 'put-targets'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:inspector:events.ListRuleNamesByTarget
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/events\-proxy$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSEvents.ListRuleNamesByTarget") {
        reqParams.boto3['TargetArn'] = jsonRequestBody.content.TargetArn;
        reqParams.cli['--target-arn'] = jsonRequestBody.content.TargetArn;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'ListRuleNamesByTarget',
                'boto3': 'list_rule_names_by_target',
                'cli': 'list-rule-names-by-target'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:events.DescribeRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/events\-proxy$/g) && jsonRequestBody.headers.X-Amz-Target == "AWSEvents.DescribeRule") {
        reqParams.boto3['Name'] = jsonRequestBody.content.Name;
        reqParams.cli['--name'] = jsonRequestBody.content.Name;

        outputs.push({
            'region': region,
            'service': 'events',
            'method': {
                'api': 'DescribeRule',
                'boto3': 'describe_rule',
                'cli': 'describe-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:inspector.ListEventSubscriptions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/ListEventSubscriptions$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.ListEventSubscriptions") {
        reqParams.boto3['ResourceArn'] = jsonRequestBody.content.resourceArn;
        reqParams.cli['--resource-arn'] = jsonRequestBody.content.resourceArn;
        reqParams.boto3['MaxResults'] = jsonRequestBody.content.maxResults;
        reqParams.cli['--max-results'] = jsonRequestBody.content.maxResults;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'ListEventSubscriptions',
                'boto3': 'list_event_subscriptions',
                'cli': 'list-event-subscriptions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:inspector:inspector.CreateResourceGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/inspector\/service\/CreateResourceGroup$/g) && jsonRequestBody.headers.X-Amz-Target == "com.amazonaws.inspector.v20160216.InspectorService.CreateResourceGroup") {
        reqParams.boto3['ResourceGroupTags'] = jsonRequestBody.content.resourceGroupTags;
        reqParams.cli['--resource-group-tags'] = jsonRequestBody.content.resourceGroupTags;

        reqParams.cfn['ResourceGroupTags'] = jsonRequestBody.content.resourceGroupTags;

        outputs.push({
            'region': region,
            'service': 'inspector',
            'method': {
                'api': 'CreateResourceGroup',
                'boto3': 'create_resource_group',
                'cli': 'create-resource-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('inspector', details.requestId),
            'region': region,
            'service': 'inspector',
            'type': 'AWS::Inspector::ResourceGroup',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // manual:budgets:budgets.CreateBudget
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/billing\/budgets\/v1\/budgetsV2\/budget\/create?$/g)) {
        reqParams.boto3['Budget'] = jsonRequestBody.budget;
        reqParams.cli['--budget'] = jsonRequestBody.budget;
        reqParams.boto3['NotificationWithSubscribersList'] = jsonRequestBody.notificationWithSubscribersList;
        reqParams.cli['--notification-with-subscribers-list'] = jsonRequestBody.notificationWithSubscribersList;

        reqParams.cfn['Budget'] = jsonRequestBody.budget;
        reqParams.cfn['NotificationsWithSubscribers'] = jsonRequestBody.notificationWithSubscribersList;

        outputs.push({
            'region': region,
            'service': 'budgets',
            'method': {
                'api': 'CreateBudget',
                'boto3': 'create_budget',
                'cli': 'create-budget'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('budgets', details.requestId),
            'region': region,
            'service': 'budgets',
            'type': 'AWS::Budgets::Budget',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:acm:acm-pca.ListCertificateAuthorities
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/acm\/ajax\/list_certificate_authorities\.json$/g)) {

        outputs.push({
            'region': region,
            'service': 'acm-pca',
            'method': {
                'api': 'ListCertificateAuthorities',
                'boto3': 'list_certificate_authorities',
                'cli': 'list-certificate-authorities'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:acm:acm.RequestCertificate
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/acm\/ajax\/request_cert\.json$/g)) {
        reqParams.boto3['DomainName'] = jsonRequestBody.domain_name[0];
        reqParams.cli['--domain-name'] = jsonRequestBody.domain_name[0];
        reqParams.boto3['SubjectAlternativeNames'] = jsonRequestBody['domains[]'];
        reqParams.cli['--subject-alternative-names'] = jsonRequestBody['domains[]'];
        reqParams.boto3['ValidationMethod'] = jsonRequestBody.validation_method[0];
        reqParams.cli['--validation-method'] = jsonRequestBody.validation_method[0];

        reqParams.cfn['DomainName'] = jsonRequestBody.domain_name[0];
        reqParams.cfn['SubjectAlternativeNames'] = jsonRequestBody['domains[]'];
        reqParams.cfn['ValidationMethod'] = jsonRequestBody.validation_method[0];

        outputs.push({
            'region': region,
            'service': 'acm',
            'method': {
                'api': 'RequestCertificate',
                'boto3': 'request_certificate',
                'cli': 'request-certificate'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('acm', details.requestId),
            'region': region,
            'service': 'acm',
            'type': 'AWS::CertificateManager::Certificate',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:acm:acm.DescribeCertificate
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/acm\/ajax\/describe_cert\.json\?/g)) {
        reqParams.boto3['CertificateArn'] = getUrlValue(details.url, 'arn');
        reqParams.cli['--certificate-arn'] = getUrlValue(details.url, 'arn');

        outputs.push({
            'region': region,
            'service': 'acm',
            'method': {
                'api': 'DescribeCertificate',
                'boto3': 'describe_certificate',
                'cli': 'describe-certificate'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.ListUserPools
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/pool\?/g)) {
        reqParams.boto3['NextToken'] = getUrlValue(details.url, 'next_token');
        reqParams.cli['--next-token'] = getUrlValue(details.url, 'next_token');
        reqParams.boto3['MaxResults'] = getUrlValue(details.url, 'max_results');
        reqParams.cli['--max-items'] = getUrlValue(details.url, 'max_results');

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'ListUserPools',
                'boto3': 'list_user_pools',
                'cli': 'list-user-pools'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cognito-idp:iam.ListRoles
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/iam\/roles\?$/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListRoles',
                'boto3': 'list_roles',
                'cli': 'list-roles'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cognito-idp:pinpoint.GetApps
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/pinpoint\/appIds\?/g)) {
        reqParams.boto3['PageSize'] = getUrlValue(details.url, 'pageSize');
        reqParams.cli['--page-size'] = getUrlValue(details.url, 'pageSize');

        outputs.push({
            'region': region,
            'service': 'pinpoint',
            'method': {
                'api': 'GetApps',
                'boto3': 'get_apps',
                'cli': 'get-apps'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cognito-idp:acm.ListCertificates
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/acm\/listCertificates\?/g)) {

        outputs.push({
            'region': region,
            'service': 'acm',
            'method': {
                'api': 'ListCertificates',
                'boto3': 'list_certificates',
                'cli': 'list-certificates'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.CreateUserPool
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/pool$/g)) {
        var pools = JSON.parse(jsonRequestBody.pool);
        for (var i=0; i<pools.length; i++) {
            reqParams.boto3['PoolName'] = pools[i].name;
            reqParams.cli['--pool-name'] = pools[i].name;
            reqParams.boto3['Policies'] = {
                'PasswordPolicy': {
                    'MinimumLength': pools[i].passPolicyMinLength,
                    'RequireUppercase': pools[i].passPolicyRequireUppercase,
                    'RequireLowercase': pools[i].passPolicyRequireLowercase,
                    'RequireNumbers': pools[i].passPolicyRequireNumbers,
                    'RequireSymbols': pools[i].passPolicyRequireSymbols
                }
            };
            reqParams.cli['--policies'] = {
                'PasswordPolicy': {
                    'MinimumLength': pools[i].passPolicyMinLength,
                    'RequireUppercase': pools[i].passPolicyRequireUppercase,
                    'RequireLowercase': pools[i].passPolicyRequireLowercase,
                    'RequireNumbers': pools[i].passPolicyRequireNumbers,
                    'RequireSymbols': pools[i].passPolicyRequireSymbols
                }
            };
            reqParams.boto3['AutoVerifiedAttributes'] = [];
            reqParams.cli['--auto-verified-attributes'] = [];
            if (pools[i].verifySMS == false) {
                reqParams.boto3['AutoVerifiedAttributes'].push("phone_number");
                reqParams.cli['--auto-verified-attributes'].push("phone_number");
            }
            if (pools[i].verifyEmail == false) {
                reqParams.boto3['AutoVerifiedAttributes'].push("email");
                reqParams.cli['--auto-verified-attributes'].push("email");
            }
            reqParams.boto3['AliasAttributes'] = pools[i].aliasAttributes;
            reqParams.cli['--alias-attributes'] = pools[i].aliasAttributes;
            reqParams.boto3['UsernameAttributes'] = pools[i].usernameAttributes;
            reqParams.cli['--username-attributes'] = pools[i].usernameAttributes;
            reqParams.boto3['SmsVerificationMessage'] = pools[i].smsVerificationMessage;
            reqParams.cli['--sms-verification-message'] = pools[i].smsVerificationMessage;
            reqParams.boto3['EmailVerificationMessage'] = pools[i].emailVerificationMessage;
            reqParams.cli['--email-verification-message'] = pools[i].emailVerificationMessage;
            reqParams.boto3['EmailVerificationSubject'] = pools[i].emailVerificationSubject;
            reqParams.cli['--email-verification-subject'] = pools[i].emailVerificationSubject;
            reqParams.boto3['VerificationMessageTemplate'] = {
                'SmsMessage': pools[i].smsVerificationMessage,
                'EmailMessage': pools[i].emailVerificationMessage,
                'EmailSubject': pools[i].emailVerificationSubject,
                'EmailMessageByLink': pools[i].emailVerificationMessageByLink,
                'EmailSubjectByLink': pools[i].emailVerificationSubjectByLink,
                'DefaultEmailOption': pools[i].defaultEmailOption
            };
            reqParams.cli['--verification-message-template'] = {
                'SmsMessage': pools[i].smsVerificationMessage,
                'EmailMessage': pools[i].emailVerificationMessage,
                'EmailSubject': pools[i].emailVerificationSubject,
                'EmailMessageByLink': pools[i].emailVerificationMessageByLink,
                'EmailSubjectByLink': pools[i].emailVerificationSubjectByLink,
                'DefaultEmailOption': pools[i].defaultEmailOption
            };
            reqParams.boto3['MfaConfiguration'] = pools[i].mfaEnabledLevel;
            reqParams.cli['--mfa-configuration'] = pools[i].mfaEnabledLevel;
            reqParams.boto3['DeviceConfiguration'] = {
                'ChallengeRequiredOnNewDevice': pools[i].challengeRequiredOnNewDevice,
                'DeviceOnlyRememberedOnUserPrompt': pools[i].deviceOnlyRememberedOnUserPrompt
            };
            reqParams.cli['--device-configuration'] = {
                'ChallengeRequiredOnNewDevice': pools[i].challengeRequiredOnNewDevice,
                'DeviceOnlyRememberedOnUserPrompt': pools[i].deviceOnlyRememberedOnUserPrompt
            };
            reqParams.boto3['EmailConfiguration'] = {
                'SourceArn': pools[i].fromEmailAddressArn,
                'ReplyToEmailAddress': pools[i].replyToEmailAddress
            };
            reqParams.cli['--email-configuration'] = {
                'SourceArn': pools[i].fromEmailAddressArn,
                'ReplyToEmailAddress': pools[i].replyToEmailAddress
            };
            reqParams.boto3['SmsConfiguration'] = {
                'SnsCallerArn': pools[i].snsCallerArn,
                'ExternalId': pools[i].externalId
            };
            reqParams.cli['--sms-configuration'] = {
                'SnsCallerArn': pools[i].snsCallerArn,
                'ExternalId': pools[i].externalId
            };
            reqParams.boto3['UserPoolTags'] = {};
            reqParams.cli['--user-pool-tags'] = {};
            for (var j=0; j<pools[i].userpoolTags.length; j++) {
                reqParams.boto3['UserPoolTags'][pools[i].userpoolTags[j].tagName] = pools[i].userpoolTags[j].tagValue;
                reqParams.cli['--user-pool-tags'][pools[i].userpoolTags[j].tagName] = pools[i].userpoolTags[j].tagValue;
            }
            reqParams.boto3['AdminCreateUserConfig'] = {
                'AllowAdminCreateUserOnly': pools[i].allowAdminCreateUserOnly,
                'UnusedAccountValidityDays': pools[i].adminCreateUserUnusedAccountValidityDays
            };
            reqParams.cli['--admin-create-user-config'] = {
                'AllowAdminCreateUserOnly': pools[i].allowAdminCreateUserOnly,
                'UnusedAccountValidityDays': pools[i].adminCreateUserUnusedAccountValidityDays
            };
            reqParams.boto3['Schema'] = [];
            reqParams.cli['--schema'] = [];
            for (var j=0; j<pools[i].customAttributes.length; j++) {
                reqParams.boto3['Schema'].push({
                    'Name': pools[i].customAttributes[j].name,
                    'AttributeDataType': pools[i].customAttributes[j].dataType,
                    'Mutable': pools[i].customAttributes[j].mutable,
                    'NumberAttributeConstraints': {
                        'MinValue': pools[i].customAttributes[j].numMinValue,
                        'MaxValue': pools[i].customAttributes[j].numMaxValue
                    },
                    'StringAttributeConstraints': {
                        'MinLength': pools[i].customAttributes[j].strMinLength,
                        'MaxLength': pools[i].customAttributes[j].strMaxLength
                    }
                });
                reqParams.cli['--schema'].push({
                    'Name': pools[i].customAttributes[j].name,
                    'AttributeDataType': pools[i].customAttributes[j].dataType,
                    'Mutable': pools[i].customAttributes[j].mutable,
                    'NumberAttributeConstraints': {
                        'MinValue': pools[i].customAttributes[j].numMinValue,
                        'MaxValue': pools[i].customAttributes[j].numMaxValue
                    },
                    'StringAttributeConstraints': {
                        'MinLength': pools[i].customAttributes[j].strMinLength,
                        'MaxLength': pools[i].customAttributes[j].strMaxLength
                    }
                });
            }

            reqParams.cfn['AdminCreateUserConfig'] = reqParams.boto3['AdminCreateUserConfig'];
            reqParams.cfn['AliasAttributes'] = pools[i].aliasAttributes;
            reqParams.cfn['AutoVerifiedAttributes'] = reqParams.boto3['AutoVerifiedAttributes'];
            reqParams.cfn['DeviceConfiguration'] = reqParams.boto3['DeviceConfiguration'];
            reqParams.cfn['EmailConfiguration'] = reqParams.boto3['EmailConfiguration'];
            reqParams.cfn['EmailVerificationMessage'] = pools[i].emailVerificationMessage;
            reqParams.cfn['EmailVerificationSubject'] = pools[i].emailVerificationSubject;
            reqParams.cfn['MfaConfiguration'] = pools[i].mfaEnabledLevel;
            reqParams.cfn['Policies'] = reqParams.boto3['Policies'];
            reqParams.cfn['Schema'] = reqParams.boto3['Schema'];
            reqParams.cfn['SmsConfiguration'] = reqParams.boto3['SmsConfiguration'];
            reqParams.cfn['SmsVerificationMessage'] = pools[i].smsVerificationMessage;
            reqParams.cfn['UsernameAttributes'] = pools[i].usernameAttributes;
            reqParams.cfn['UserPoolName'] = pools[i].name;
            reqParams.cfn['UserPoolTags'] = reqParams.boto3['UserPoolTags'];

            outputs.push({
                'region': region,
                'service': 'cognito-idp',
                'method': {
                    'api': 'CreateUserPool',
                    'boto3': 'create_user_pool',
                    'cli': 'create-user-pool'
                },
                'options': reqParams,
                'requestDetails': details
            });

            tracked_resources.push({
                'logicalId': getResourceName('cognito-idp', details.requestId),
                'region': region,
                'service': 'cognito-idp',
                'type': 'AWS::Cognito::UserPool',
                'options': reqParams,
                'requestDetails': details,
                'was_blocked': blocking
            });

            for (var j=0; j<pools[i].userPoolClients.length; j++) {
                reqParams = {
                    'boto3': {},
                    'go': {},
                    'cfn': {},
                    'cli': {}
                };

                // TODO
            }

            if (blocking) {
                notifyBlocked();
                return {cancel: true};
            }
        }
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.SetUserPoolMfaConfig
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/pool\/mfaConfig$/g)) {
        reqParams.boto3['UserPoolId'] = jsonRequestBody.id[0];
        reqParams.cli['--user-pool-id'] = jsonRequestBody.id[0];
        reqParams.boto3['SmsMfaConfiguration'] = {
            'SmsAuthenticationMessage': jsonRequestBody.smsVerificationMessage[0],
            'SmsConfiguration': {
                'SnsCallerArn': jsonRequestBody.snsCallerArn[0],
                'ExternalId': jsonRequestBody.externalId[0]
            }
        };
        reqParams.cli['--sms-mfa-configuration'] = {
            'SmsAuthenticationMessage': jsonRequestBody.smsVerificationMessage[0],
            'SmsConfiguration': {
                'SnsCallerArn': jsonRequestBody.snsCallerArn[0],
                'ExternalId': jsonRequestBody.externalId[0]
            }
        };
        reqParams.boto3['SoftwareTokenMfaConfiguration'] = {
            'Enabled': jsonRequestBody.softwareToken[0]
        };
        reqParams.cli['--software-token-mfa-configuration'] = {
            'Enabled': jsonRequestBody.softwareToken[0]
        };
        reqParams.boto3['MfaConfiguration'] = jsonRequestBody.userPoolMfa[0];
        reqParams.cli['--mfa-configuration'] = jsonRequestBody.userPoolMfa[0];

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'SetUserPoolMfaConfig',
                'boto3': 'set_user_pool_mfa_config',
                'cli': 'set-user-pool-mfa-config'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.ListUsers
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/user\?/g)) {
        reqParams.boto3['UserPoolId'] = getUrlValue(details.url, 'id');
        reqParams.cli['--user-pool-id'] = getUrlValue(details.url, 'id');
        reqParams.boto3['Limit'] = getUrlValue(details.url, 'maxResults');
        reqParams.cli['--limit'] = getUrlValue(details.url, 'maxResults');

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'ListUsers',
                'boto3': 'list_users',
                'cli': 'list-users'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.ListGroups
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/group\?id=us\-west\-2_mswODcnxC&maxResults=60$/g)) {
        reqParams.boto3['UserPoolId'] = getUrlValue(details.url, 'id');
        reqParams.cli['--user-pool-id'] = getUrlValue(details.url, 'id');
        reqParams.boto3['Limit'] = getUrlValue(details.url, 'maxResults');
        reqParams.cli['--limit'] = getUrlValue(details.url, 'maxResults');

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'ListGroups',
                'boto3': 'list_groups',
                'cli': 'list-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.ListUserPoolClients
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/pool\/client\?/g)) {
        reqParams.boto3['UserPoolId'] = getUrlValue(details.url, 'id');
        reqParams.cli['--user-pool-id'] = getUrlValue(details.url, 'id');
        reqParams.boto3['MaxResults'] = getUrlValue(details.url, 'max_results');
        reqParams.cli['--max-items'] = getUrlValue(details.url, 'max_results');
        reqParams.boto3['NextToken'] = getUrlValue(details.url, 'next_token');
        reqParams.cli['--next-token'] = getUrlValue(details.url, 'next_token');

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'ListUserPoolClients',
                'boto3': 'list_user_pool_clients',
                'cli': 'list-user-pool-clients'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.AdminCreateUser
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/user$/g)) {
        reqParams.boto3['UserAttributes'] = [];
        reqParams.cli['--user-attributes'] = [];
        reqParams.boto3['UserAttributes'].push({
            "Name": "email",
            "Value": jsonRequestBody.email[0]
        });
        reqParams.cli['--user-attributes'].push({
            "Name": "email",
            "Value": jsonRequestBody.email[0]
        });
        reqParams.boto3['UserAttributes'].push({
            "Name": "phone_number",
            "Value": jsonRequestBody.phoneNumber[0]
        });
        reqParams.cli['--user-attributes'].push({
            "Name": "phone_number",
            "Value": jsonRequestBody.phoneNumber[0]
        });
        if (jsonRequestBody.emailVerified[0] == "true") {
            reqParams.boto3['UserAttributes'].push({
                "Name": "email_verified",
                "Value": true
            });
            reqParams.cli['--user-attributes'].push({
                "Name": "email_verified",
                "Value": true
            });
        }
        if (jsonRequestBody.phoneNumberVerified[0] == "true") {
            reqParams.boto3['UserAttributes'].push({
                "Name": "phone_number_verified",
                "Value": true
            });
            reqParams.cli['--user-attributes'].push({
                "Name": "phone_number_verified",
                "Value": true
            });
        }
        reqParams.boto3['ForceAliasCreation'] = (jsonRequestBody.forceAliasCreation[0] == "true");
        reqParams.cli['--force-alias-creation'] = (jsonRequestBody.forceAliasCreation[0] == "true");
        reqParams.boto3['UserPoolId'] = jsonRequestBody.poolId[0];
        reqParams.cli['--user-pool-id'] = jsonRequestBody.poolId[0];
        reqParams.boto3['DesiredDeliveryMediums'] = [];
        reqParams.cli['--desired-delivery-mediums'] = [];
        if (jsonRequestBody.sendEmail[0] == "true") {
            reqParams.boto3['DesiredDeliveryMediums'].push("EMAIL");
            reqParams.cli['--desired-delivery-mediums'].push("EMAIL");
        }
        if (jsonRequestBody.sendSMS[0] == "true") {
            reqParams.boto3['DesiredDeliveryMediums'].push("SMS");
            reqParams.cli['--desired-delivery-mediums'].push("SMS");
        }
        reqParams.boto3['TemporaryPassword'] = jsonRequestBody.tempPassword[0];
        reqParams.cli['--temporary-password'] = jsonRequestBody.tempPassword[0];
        reqParams.boto3['Username'] = jsonRequestBody.username[0];
        reqParams.cli['--username'] = jsonRequestBody.username[0];

        reqParams.cfn['UserAttributes'] = reqParams.boto3['UserAttributes'];
        reqParams.cfn['ForceAliasCreation'] = (jsonRequestBody.forceAliasCreation[0] == "true");
        reqParams.cfn['UserPoolId'] = jsonRequestBody.poolId[0];
        reqParams.cfn['DesiredDeliveryMediums'] = reqParams.boto3['DesiredDeliveryMediums'];
        reqParams.cfn['Username'] = jsonRequestBody.username[0];

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'AdminCreateUser',
                'boto3': 'admin_create_user',
                'cli': 'admin-create-user'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('cognito-idp', details.requestId),
            'region': region,
            'service': 'cognito-idp',
            'type': 'AWS::Cognito::UserPoolUser',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.CreateGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/group$/g)) {
        var groupJSON = JSON.parse(jsonRequestBody.groupJSONString[0]);
        reqParams.boto3['GroupName'] = groupJSON['groupName'];
        reqParams.cli['--group-name'] = groupJSON['groupName'];
        reqParams.boto3['Description'] = groupJSON['description'];
        reqParams.cli['--description'] = groupJSON['description'];
        reqParams.boto3['RoleArn'] = groupJSON['roleARN'];
        reqParams.cli['--role-arn'] = groupJSON['roleARN'];
        reqParams.boto3['Precedence'] = groupJSON['precedence'];
        reqParams.cli['--precedence'] = groupJSON['precedence'];
        reqParams.boto3['UserPoolId'] = jsonRequestBody.id[0];
        reqParams.cli['--user-pool-id'] = jsonRequestBody.id[0];

        reqParams.cfn['GroupName'] = groupJSON['groupName'];
        reqParams.cfn['Description'] = groupJSON['description'];
        reqParams.cfn['RoleArn'] = groupJSON['roleARN'];
        reqParams.cfn['Precedence'] = groupJSON['precedence'];
        reqParams.cfn['UserPoolId'] = jsonRequestBody.id[0];

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'CreateGroup',
                'boto3': 'create_group',
                'cli': 'create-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('cognito-idp', details.requestId),
            'region': region,
            'service': 'cognito-idp',
            'type': 'AWS::Cognito::UserPoolGroup',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.AdminAddUserToGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/group\/user$/g)) {
        reqParams.boto3['GroupName'] = jsonRequestBody.groupName[0];
        reqParams.cli['--group-name'] = jsonRequestBody.groupName[0];
        reqParams.boto3['UserPoolId'] = jsonRequestBody.id[0];
        reqParams.cli['--user-pool-id'] = jsonRequestBody.id[0];
        reqParams.boto3['Username'] = jsonRequestBody.username[0];
        reqParams.cli['--username'] = jsonRequestBody.username[0];

        reqParams.cfn['GroupName'] = jsonRequestBody.groupName[0];
        reqParams.cfn['UserPoolId'] = jsonRequestBody.id[0];
        reqParams.cfn['Username'] = jsonRequestBody.username[0];

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'AdminAddUserToGroup',
                'boto3': 'admin_add_user_to_group',
                'cli': 'admin-add-user-to-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('cognito-idp', details.requestId),
            'region': region,
            'service': 'cognito-idp',
            'type': 'AWS::Cognito::UserPoolUserToGroupAttachment',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cognito-idp:cognito-idp.CreateUserPoolClient
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/signin\/pool\/client$/g)) {
        var clientJSON = JSON.parse(jsonRequestBody.client[0]);
        reqParams.boto3['UserPoolId'] = jsonRequestBody.id[0];
        reqParams.cli['--user-pool-id'] = jsonRequestBody.id[0];
        reqParams.boto3['ClientName'] = clientJSON['name'];
        reqParams.cli['--client-name'] = clientJSON['name'];
        reqParams.boto3['ExplicitAuthFlows'] = [];
        reqParams.cli['--explicit-auth-flows'] = [];
        if (clientJSON['explicitAdminAuthEnabled']) {
            reqParams.boto3['ExplicitAuthFlows'].push("ADMIN_NO_SRP_AUTH");
            reqParams.cli['--explicit-auth-flows'].push("ADMIN_NO_SRP_AUTH");
        }
        if (clientJSON['customAuthFlowOnly']) {
            reqParams.boto3['ExplicitAuthFlows'].push("CUSTOM_AUTH_FLOW_ONLY");
            reqParams.cli['--explicit-auth-flows'].push("CUSTOM_AUTH_FLOW_ONLY");
        }
        if (clientJSON['userPasswordAuth']) {
            reqParams.boto3['ExplicitAuthFlows'].push("USER_PASSWORD_AUTH");
            reqParams.cli['--explicit-auth-flows'].push("USER_PASSWORD_AUTH");
        }
        reqParams.boto3['GenerateSecret'] = clientJSON['generateSecret'];
        reqParams.cli['--generate-secret'] = clientJSON['generateSecret'];
        reqParams.boto3['ReadAttributes'] = clientJSON['readAttributes'];
        reqParams.cli['--read-attributes'] = clientJSON['readAttributes'];
        reqParams.boto3['RefreshTokenValidity'] = clientJSON['refreshTokenValidity'];
        reqParams.cli['--refresh-token-validity'] = clientJSON['refreshTokenValidity'];
        reqParams.boto3['WriteAttributes'] = clientJSON['writeAttributes'];
        reqParams.cli['--write-attributes'] = clientJSON['writeAttributes'];

        reqParams.cfn['UserPoolId'] = jsonRequestBody.id[0];
        reqParams.cfn['ClientName'] = clientJSON['name'];
        reqParams.cfn['ExplicitAuthFlows'] = reqParams.boto3['ExplicitAuthFlows'];
        reqParams.cfn['GenerateSecret'] = clientJSON['generateSecret'];
        reqParams.cfn['ReadAttributes'] = clientJSON['readAttributes'];
        reqParams.cfn['RefreshTokenValidity'] = clientJSON['refreshTokenValidity'];
        reqParams.cfn['WriteAttributes'] = clientJSON['writeAttributes'];

        outputs.push({
            'region': region,
            'service': 'cognito-idp',
            'method': {
                'api': 'CreateUserPoolClient',
                'boto3': 'create_user_pool_client',
                'cli': 'create-user-pool-client'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('cognito-idp', details.requestId),
            'region': region,
            'service': 'cognito-idp',
            'type': 'AWS::Cognito::UserPoolClient',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:cognito-identity:cognito-identity.CreateIdentityPool
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/cognito\/data\/pool$/g)) {
        reqParams.boto3['DeveloperProviderName'] = jsonRequestBody.developerProviderName[0];
        reqParams.cli['--developer-provider-name'] = jsonRequestBody.developerProviderName[0];
        reqParams.boto3['AllowUnauthenticatedIdentities'] = jsonRequestBody.enableUnauth[0];
        reqParams.cli['--allow-unauthenticated-identities'] = jsonRequestBody.enableUnauth[0];
        reqParams.boto3['IdentityPoolName'] = jsonRequestBody.name[0];
        reqParams.cli['--identity-pool-name'] = jsonRequestBody.name[0];
        reqParams.boto3['OpenIdConnectProviderARNs'] = jsonRequestBody.oidcProviderArnsString[0];
        reqParams.cli['--open-id-connect-provider-ar-ns'] = jsonRequestBody.oidcProviderArnsString[0];
        reqParams.boto3['SamlProviderARNs'] = jsonRequestBody.samlProviderArnsString[0];
        reqParams.cli['--saml-provider-ar-ns'] = jsonRequestBody.samlProviderArnsString[0];

        reqParams.cfn['DeveloperProviderName'] = jsonRequestBody.developerProviderName[0];
        reqParams.cfn['AllowUnauthenticatedIdentities'] = jsonRequestBody.enableUnauth[0];
        reqParams.cfn['IdentityPoolName'] = jsonRequestBody.name[0];
        reqParams.cfn['OpenIdConnectProviderARNs'] = jsonRequestBody.oidcProviderArnsString[0];
        reqParams.cfn['SamlProviderARNs'] = jsonRequestBody.samlProviderArnsString[0];

        outputs.push({
            'region': region,
            'service': 'cognito-identity',
            'method': {
                'api': 'CreateIdentityPool',
                'boto3': 'create_identity_pool',
                'cli': 'create-identity-pool'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('cognito-identity', details.requestId),
            'region': region,
            'service': 'cognito-identity',
            'type': 'AWS::Cognito::IdentityPool',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:config:config.DescribeConfigurationAggregators
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/aggregators\/describeConfigurationAggregators\?/g)) {

        outputs.push({
            'region': region,
            'service': 'config',
            'method': {
                'api': 'DescribeConfigurationAggregators',
                'boto3': 'describe_configuration_aggregators',
                'cli': 'describe-configuration-aggregators'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:config:config.PutConfigurationAggregator
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/aggregators\/putConfigurationAggregator\?/g)) {
        reqParams.boto3['ConfigurationAggregatorName'] = jsonRequestBody.configurationAggregatorName;
        reqParams.cli['--configuration-aggregator-name'] = jsonRequestBody.configurationAggregatorName;
        reqParams.boto3['AccountAggregationSources'] = jsonRequestBody.accountAggregationSources;
        reqParams.cli['--account-aggregation-sources'] = jsonRequestBody.accountAggregationSources;
        reqParams.boto3['OrganizationAggregationSource'] = jsonRequestBody.organizationAggregationSource;
        reqParams.cli['--organization-aggregation-source'] = jsonRequestBody.organizationAggregationSource;

        reqParams.cfn['ConfigurationAggregatorName'] = jsonRequestBody.configurationAggregatorName;
        reqParams.cfn['AccountAggregationSources'] = jsonRequestBody.accountAggregationSources;
        reqParams.cfn['OrganizationAggregationSource'] = jsonRequestBody.organizationAggregationSource;

        outputs.push({
            'region': region,
            'service': 'config',
            'method': {
                'api': 'PutConfigurationAggregator',
                'boto3': 'put_configuration_aggregator',
                'cli': 'put-configuration-aggregator'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('config', details.requestId),
            'region': region,
            'service': 'config',
            'type': 'AWS::Config::ConfigurationAggregator',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:config:config.PutConfigRule
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/config\/service\/configRule\?/g)) {
        reqParams.boto3['ConfigRule'] = {
            'ConfigRuleName': jsonRequestBody.configRuleName,
            'Description': jsonRequestBody.description,
            'Scope': jsonRequestBody.scope,
            'Source': jsonRequestBody.source,
            'InputParameters': JSON.stringify(jsonRequestBody.inputParameters),
            'MaximumExecutionFrequency': jsonRequestBody.maximumExecutionFrequency // jsonRequestBody.source.sourceDetails[0].maximumExecutionFrequency?
        };
        reqParams.cli['--config-rule'] = {
            'ConfigRuleName': jsonRequestBody.configRuleName,
            'Description': jsonRequestBody.description,
            'Scope': jsonRequestBody.scope,
            'Source': jsonRequestBody.source,
            'InputParameters': JSON.stringify(jsonRequestBody.inputParameters),
            'MaximumExecutionFrequency': jsonRequestBody.maximumExecutionFrequency // jsonRequestBody.source.sourceDetails[0].maximumExecutionFrequency?
        };

        reqParams.cfn['ConfigRuleName'] = jsonRequestBody.configRuleName;
        reqParams.cfn['Description'] = jsonRequestBody.description;
        reqParams.cfn['InputParameters'] = jsonRequestBody.inputParameters;
        reqParams.cfn['MaximumExecutionFrequency'] = jsonRequestBody.maximumExecutionFrequency;
        reqParams.cfn['Scope'] = jsonRequestBody.scope;
        reqParams.cfn['Source'] = jsonRequestBody.source;

        outputs.push({
            'region': region,
            'service': 'config',
            'method': {
                'api': 'PutConfigRule',
                'boto3': 'put_config_rule',
                'cli': 'put-config-rule'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('config', details.requestId),
            'region': region,
            'service': 'config',
            'type': 'AWS::Config::ConfigRule',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.ListDocuments
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "listDocuments") {
        reqParams.boto3['Filters'] = jsonRequestBody.contentString.Filters;
        reqParams.cli['--filters'] = jsonRequestBody.contentString.Filters;
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.MaxResults;
 
        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'ListDocuments',
                'boto3': 'list_documents',
                'cli': 'list-documents'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ssm.CreateDocument
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "createDocument") {
        reqParams.boto3['Content'] = jsonRequestBody.contentString.Content;
        reqParams.cli['--content'] = jsonRequestBody.contentString.Content;
        reqParams.boto3['DocumentType'] = jsonRequestBody.contentString.DocumentType;
        reqParams.cli['--document-type'] = jsonRequestBody.contentString.DocumentType;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['DocumentFormat'] = jsonRequestBody.contentString.DocumentFormat;
        reqParams.cli['--document-format'] = jsonRequestBody.contentString.DocumentFormat;

        reqParams.cfn['Content'] = jsonRequestBody.contentString.Content;
        reqParams.cfn['DocumentType'] = jsonRequestBody.contentString.DocumentType;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'CreateDocument',
                'boto3': 'create_document',
                'cli': 'create-document'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ssm', details.requestId),
            'region': region,
            'service': 'ssm',
            'type': 'AWS::SSM::Document',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.DescribeDocumentPermission
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "describeDocumentPermission") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['PermissionType'] = jsonRequestBody.contentString.PermissionType;
        reqParams.cli['--permission-type'] = jsonRequestBody.contentString.PermissionType;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'DescribeDocumentPermission',
                'boto3': 'describe_document_permission',
                'cli': 'describe-document-permission'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ssm.DeleteDocument
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "deleteDocument") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'DeleteDocument',
                'boto3': 'delete_document',
                'cli': 'delete-document'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.DescribeParameters
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "describeParameters") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'DescribeParameters',
                'boto3': 'describe_parameters',
                'cli': 'describe-parameters'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ssm.PutParameter
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "putParameter") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.Description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.Description;
        reqParams.boto3['Value'] = jsonRequestBody.contentString.Value;
        reqParams.cli['--value'] = jsonRequestBody.contentString.Value;
        reqParams.boto3['Type'] = jsonRequestBody.contentString.Type;
        reqParams.cli['--type'] = jsonRequestBody.contentString.Type;

        reqParams.cfn['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cfn['Description'] = jsonRequestBody.contentString.Description;
        reqParams.cfn['Value'] = jsonRequestBody.contentString.Value;
        reqParams.cfn['Type'] = jsonRequestBody.contentString.Type;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'PutParameter',
                'boto3': 'put_parameter',
                'cli': 'put-parameter'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ssm', details.requestId),
            'region': region,
            'service': 'ssm',
            'type': 'AWS::SSM::Parameter',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.DeleteParameters
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "deleteParameters") {
        reqParams.boto3['Names'] = jsonRequestBody.contentString.Names;
        reqParams.cli['--names'] = jsonRequestBody.contentString.Names;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'DeleteParameters',
                'boto3': 'delete_parameters',
                'cli': 'delete-parameters'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.DescribeMaintenanceWindows
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "describeMaintenanceWindows") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'DescribeMaintenanceWindows',
                'boto3': 'describe_maintenance_windows',
                'cli': 'describe-maintenance-windows'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ssm.CreateMaintenanceWindow
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "createMaintenanceWindow") {
        reqParams.boto3['AllowUnassociatedTargets'] = jsonRequestBody.contentString.AllowUnassociatedTargets;
        reqParams.cli['--allow-unassociated-targets'] = jsonRequestBody.contentString.AllowUnassociatedTargets;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['Schedule'] = jsonRequestBody.contentString.Schedule;
        reqParams.cli['--schedule'] = jsonRequestBody.contentString.Schedule;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.Description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.Description;
        reqParams.boto3['Duration'] = jsonRequestBody.contentString.Duration;
        reqParams.cli['--duration'] = jsonRequestBody.contentString.Duration;
        reqParams.boto3['Cutoff'] = jsonRequestBody.contentString.Cutoff;
        reqParams.cli['--cutoff'] = jsonRequestBody.contentString.Cutoff;

        reqParams.cfn['AllowUnassociatedTargets'] = jsonRequestBody.contentString.AllowUnassociatedTargets;
        reqParams.cfn['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cfn['Schedule'] = jsonRequestBody.contentString.Schedule;
        reqParams.cfn['Description'] = jsonRequestBody.contentString.Description;
        reqParams.cfn['Duration'] = jsonRequestBody.contentString.Duration;
        reqParams.cfn['Cutoff'] = jsonRequestBody.contentString.Cutoff;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'CreateMaintenanceWindow',
                'boto3': 'create_maintenance_window',
                'cli': 'create-maintenance-window'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ssm', details.requestId),
            'region': region,
            'service': 'ssm',
            'type': 'AWS::SSM::MaintenanceWindow',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.DescribePatchBaselines
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "describePatchBaselines") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'DescribePatchBaselines',
                'boto3': 'describe_patch_baselines',
                'cli': 'describe-patch-baselines'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ssm.RegisterTargetWithMaintenanceWindow
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "registerTargetWithMaintenanceWindow") {
        reqParams.boto3['ResourceType'] = jsonRequestBody.contentString.ResourceType;
        reqParams.cli['--resource-type'] = jsonRequestBody.contentString.ResourceType;
        reqParams.boto3['Targets'] = jsonRequestBody.contentString.Targets;
        reqParams.cli['--targets'] = jsonRequestBody.contentString.Targets;
        reqParams.boto3['WindowId'] = jsonRequestBody.contentString.WindowId;
        reqParams.cli['--window-id'] = jsonRequestBody.contentString.WindowId;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.Description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.Description;

        reqParams.cfn['ResourceType'] = jsonRequestBody.contentString.ResourceType;
        reqParams.cfn['Targets'] = jsonRequestBody.contentString.Targets;
        reqParams.cfn['WindowId'] = jsonRequestBody.contentString.WindowId;
        reqParams.cfn['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cfn['Description'] = jsonRequestBody.contentString.Description;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'RegisterTargetWithMaintenanceWindow',
                'boto3': 'register_target_with_maintenance_window',
                'cli': 'register-target-with-maintenance-window'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ssm', details.requestId),
            'region': region,
            'service': 'ssm',
            'type': 'AWS::SSM::MaintenanceWindowTarget',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.DeleteMaintenanceWindow
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "deleteMaintenanceWindow") {
        reqParams.boto3['WindowId'] = jsonRequestBody.contentString.WindowId;
        reqParams.cli['--window-id'] = jsonRequestBody.contentString.WindowId;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'DeleteMaintenanceWindow',
                'boto3': 'delete_maintenance_window',
                'cli': 'delete-maintenance-window'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.CreatePatchBaseline
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "createPatchBaseline") {
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['OperatingSystem'] = jsonRequestBody.contentString.OperatingSystem;
        reqParams.cli['--operating-system'] = jsonRequestBody.contentString.OperatingSystem;
        reqParams.boto3['ApprovalRules'] = jsonRequestBody.contentString.ApprovalRules;
        reqParams.cli['--approval-rules'] = jsonRequestBody.contentString.ApprovalRules;
        reqParams.boto3['Description'] = jsonRequestBody.contentString.Description;
        reqParams.cli['--description'] = jsonRequestBody.contentString.Description;
        reqParams.boto3['ApprovedPatches'] = jsonRequestBody.contentString.ApprovedPatches;
        reqParams.cli['--approved-patches'] = jsonRequestBody.contentString.ApprovedPatches;
        reqParams.boto3['RejectedPatches'] = jsonRequestBody.contentString.RejectedPatches;
        reqParams.cli['--rejected-patches'] = jsonRequestBody.contentString.RejectedPatches;
        reqParams.boto3['ApprovedPatchesComplianceLevel'] = jsonRequestBody.contentString.ApprovedPatchesComplianceLevel;
        reqParams.cli['--approved-patches-compliance-level'] = jsonRequestBody.contentString.ApprovedPatchesComplianceLevel;

        reqParams.cfn['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cfn['OperatingSystem'] = jsonRequestBody.contentString.OperatingSystem;
        reqParams.cfn['ApprovalRules'] = jsonRequestBody.contentString.ApprovalRules;
        reqParams.cfn['Description'] = jsonRequestBody.contentString.Description;
        reqParams.cfn['ApprovedPatches'] = jsonRequestBody.contentString.ApprovedPatches;
        reqParams.cfn['RejectedPatches'] = jsonRequestBody.contentString.RejectedPatches;
        reqParams.cfn['ApprovedPatchesComplianceLevel'] = jsonRequestBody.contentString.ApprovedPatchesComplianceLevel;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'CreatePatchBaseline',
                'boto3': 'create_patch_baseline',
                'cli': 'create-patch-baseline'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ssm', details.requestId),
            'region': region,
            'service': 'ssm',
            'type': 'AWS::SSM::PatchBaseline',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.ListResourceDataSync
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "listResourceDataSync") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'ListResourceDataSync',
                'boto3': 'list_resource_data_sync',
                'cli': 'list-resource-data-sync'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ec2.DescribeRegions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ec2$/g) && jsonRequestBody.operation == "describeRegions") {

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeRegions',
                'boto3': 'describe_regions',
                'cli': 'describe-regions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ssm.CreateResourceDataSync
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "createResourceDataSync") {
        reqParams.boto3['SyncName'] = jsonRequestBody.contentString.SyncName;
        reqParams.cli['--sync-name'] = jsonRequestBody.contentString.SyncName;
        reqParams.boto3['S3Destination'] = jsonRequestBody.contentString.S3Destination;
        reqParams.cli['--s3-destination'] = jsonRequestBody.contentString.S3Destination;

        reqParams.cfn['SyncName'] = jsonRequestBody.contentString.SyncName;
        reqParams.cfn['BucketName'] = jsonRequestBody.contentString.S3Destination.BucketName;
        reqParams.cfn['BucketPrefix'] = jsonRequestBody.contentString.S3Destination.Prefix;
        reqParams.cfn['SyncFormat'] = jsonRequestBody.contentString.S3Destination.SyncFormat;
        reqParams.cfn['BucketRegion'] = jsonRequestBody.contentString.S3Destination.Region;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'CreateResourceDataSync',
                'boto3': 'create_resource_data_sync',
                'cli': 'create-resource-data-sync'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ssm', details.requestId),
            'region': region,
            'service': 'ssm',
            'type': 'AWS::SSM::ResourceDataSync',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.GetInventorySchema
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "getInventorySchema") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'GetInventorySchema',
                'boto3': 'get_inventory_schema',
                'cli': 'get-inventory-schema'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ssm.CreateAssociation
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "createAssociation") {
        reqParams.boto3['AssociationName'] = jsonRequestBody.contentString.AssociationName;
        reqParams.cli['--association-name'] = jsonRequestBody.contentString.AssociationName;
        reqParams.boto3['ScheduleExpression'] = jsonRequestBody.contentString.ScheduleExpression;
        reqParams.cli['--schedule-expression'] = jsonRequestBody.contentString.ScheduleExpression;
        reqParams.boto3['Targets'] = jsonRequestBody.contentString.Targets;
        reqParams.cli['--targets'] = jsonRequestBody.contentString.Targets;
        reqParams.boto3['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cli['--name'] = jsonRequestBody.contentString.Name;
        reqParams.boto3['Parameters'] = jsonRequestBody.contentString.Parameters;
        reqParams.cli['--parameters'] = jsonRequestBody.contentString.Parameters;
        reqParams.boto3['OutputLocation'] = jsonRequestBody.contentString.OutputLocation;
        reqParams.cli['--output-location'] = jsonRequestBody.contentString.OutputLocation;

        reqParams.cfn['AssociationName'] = jsonRequestBody.contentString.AssociationName;
        reqParams.cfn['ScheduleExpression'] = jsonRequestBody.contentString.ScheduleExpression;
        reqParams.cfn['Targets'] = jsonRequestBody.contentString.Targets;
        reqParams.cfn['Name'] = jsonRequestBody.contentString.Name;
        reqParams.cfn['Parameters'] = jsonRequestBody.contentString.Parameters;
        reqParams.cfn['OutputLocation'] = jsonRequestBody.contentString.OutputLocation;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'CreateAssociation',
                'boto3': 'create_association',
                'cli': 'create-association'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ssm', details.requestId),
            'region': region,
            'service': 'ssm',
            'type': 'AWS::SSM::Association',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ssm:ssm.ListAssociations
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "listAssociations") {
        reqParams.boto3['MaxResults'] = jsonRequestBody.contentString.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.contentString.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'ListAssociations',
                'boto3': 'list_associations',
                'cli': 'list-associations'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ssm:ssm.DeleteAssociation
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/systems\-manager\/api\/ssm$/g) && jsonRequestBody.operation == "deleteAssociation") {
        reqParams.boto3['AssociationId'] = jsonRequestBody.contentString.AssociationId;
        reqParams.cli['--association-id'] = jsonRequestBody.contentString.AssociationId;

        outputs.push({
            'region': region,
            'service': 'ssm',
            'method': {
                'api': 'DeleteAssociation',
                'boto3': 'delete_association',
                'cli': 'delete-association'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:gamelift:gamelift.CreateBuild
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/gamelift\/home\/api\/builds\?/g)) {
        reqParams.boto3['Name'] = getUrlValue(details.url, 'sampleBuildName');
        reqParams.cli['--name'] = getUrlValue(details.url, 'sampleBuildName');

        reqParams.cfn['Name'] = getUrlValue(details.url, 'sampleBuildName');

        outputs.push({
            'region': region,
            'service': 'gamelift',
            'method': {
                'api': 'CreateBuild',
                'boto3': 'create_build',
                'cli': 'create-build'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('gamelift', details.requestId),
            'region': region,
            'service': 'gamelift',
            'type': 'AWS::GameLift::Build',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:gamelift:gamelift.ListFleets
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/gamelift\/home\/api\/fleets$/g)) {

        outputs.push({
            'region': region,
            'service': 'gamelift',
            'method': {
                'api': 'ListFleets',
                'boto3': 'list_fleets',
                'cli': 'list-fleets'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:gamelift:gamelift.CreateFleet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/gamelift\/home\/api\/fleets$/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.name;
        reqParams.cli['--name'] = jsonRequestBody.name;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['MetricGroups'] = jsonRequestBody.metricGroups;
        reqParams.cli['--metric-groups'] = jsonRequestBody.metricGroups;
        reqParams.boto3['EC2InstanceType'] = jsonRequestBody.ec2InstanceType;
        reqParams.cli['--ec2-instance-type'] = jsonRequestBody.ec2InstanceType;
        reqParams.boto3['BuildId'] = jsonRequestBody.buildId;
        reqParams.cli['--build-id'] = jsonRequestBody.buildId;
        reqParams.boto3['ServerLaunchPath'] = jsonRequestBody.serverLaunchPath;
        reqParams.cli['--server-launch-path'] = jsonRequestBody.serverLaunchPath;
        reqParams.boto3['ServerLaunchParameters'] = jsonRequestBody.serverLaunchParameters;
        reqParams.cli['--server-launch-parameters'] = jsonRequestBody.serverLaunchParameters;
        reqParams.boto3['EC2InboundPermissions'] = jsonRequestBody.ec2InboundPermissions;
        reqParams.cli['--ec2-inbound-permissions'] = jsonRequestBody.ec2InboundPermissions;

        reqParams.cfn['Name'] = jsonRequestBody.name;
        reqParams.cfn['Description'] = jsonRequestBody.description;
        reqParams.cfn['EC2InstanceType'] = jsonRequestBody.ec2InstanceType;
        reqParams.cfn['BuildId'] = jsonRequestBody.buildId;
        reqParams.cfn['ServerLaunchPath'] = jsonRequestBody.serverLaunchPath;
        reqParams.cfn['ServerLaunchParameters'] = jsonRequestBody.serverLaunchParameters;
        reqParams.cfn['EC2InboundPermissions'] = jsonRequestBody.ec2InboundPermissions;

        outputs.push({
            'region': region,
            'service': 'gamelift',
            'method': {
                'api': 'CreateFleet',
                'boto3': 'create_fleet',
                'cli': 'create-fleet'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('gamelift', details.requestId),
            'region': region,
            'service': 'gamelift',
            'type': 'AWS::GameLift::Fleet',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:gamelift:gamelift.PutScalingPolicy
    if (details.method == "PUT" && details.url.match(/.+console\.aws\.amazon\.com\/gamelift\/home\/api\/fleets\/.+\/scaling\-policies$/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.name;
        reqParams.cli['--name'] = jsonRequestBody.name;
        reqParams.boto3['FleetId'] = jsonRequestBody.fleetId;
        reqParams.cli['--fleet-id'] = jsonRequestBody.fleetId;
        reqParams.boto3['ScalingAdjustmentType'] = jsonRequestBody.scalingAdjustmentType;
        reqParams.cli['--scaling-adjustment-type'] = jsonRequestBody.scalingAdjustmentType;
        reqParams.boto3['ScalingAdjustment'] = jsonRequestBody.scalingAdjustment;
        reqParams.cli['--scaling-adjustment'] = jsonRequestBody.scalingAdjustment;
        reqParams.boto3['EvaluationPeriods'] = jsonRequestBody.evaluationPeriods;
        reqParams.cli['--evaluation-periods'] = jsonRequestBody.evaluationPeriods;
        reqParams.boto3['Threshold'] = jsonRequestBody.threshold;
        reqParams.cli['--threshold'] = jsonRequestBody.threshold;
        reqParams.boto3['ComparisonOperator'] = jsonRequestBody.comparisonOperator;
        reqParams.cli['--comparison-operator'] = jsonRequestBody.comparisonOperator;
        reqParams.boto3['MetricName'] = jsonRequestBody.metricName;
        reqParams.cli['--metric-name'] = jsonRequestBody.metricName;

        outputs.push({
            'region': region,
            'service': 'gamelift',
            'method': {
                'api': 'PutScalingPolicy',
                'boto3': 'put_scaling_policy',
                'cli': 'put-scaling-policy'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:gamelift:gamelift.DescribeFleetAttributes
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/gamelift\/home\/api\/fleets\/describe\-fleet\-attributes\/params\?/g)) {
        reqParams.boto3['FleetIds'] = getUrlValue(details.url, 'fleetIds');
        reqParams.cli['--fleet-ids'] = getUrlValue(details.url, 'fleetIds');

        outputs.push({
            'region': region,
            'service': 'gamelift',
            'method': {
                'api': 'DescribeFleetAttributes',
                'boto3': 'describe_fleet_attributes',
                'cli': 'describe-fleet-attributes'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:gamelift:gamelift.CreateAlias
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/gamelift\/home\/api\/aliases$/g)) {
        reqParams.boto3['Name'] = jsonRequestBody.name;
        reqParams.cli['--name'] = jsonRequestBody.name;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['RoutingStrategy'] = {
            'Type': jsonRequestBody.type,
            'FleetId': jsonRequestBody.fleetId
        };
        reqParams.cli['--routing-strategy'] = {
            'Type': jsonRequestBody.type,
            'FleetId': jsonRequestBody.fleetId
        };

        reqParams.cfn['Name'] = jsonRequestBody.name;
        reqParams.cfn['Description'] = jsonRequestBody.description;
        reqParams.cfn['RoutingStrategy'] = reqParams.boto3['RoutingStrategy'];

        outputs.push({
            'region': region,
            'service': 'gamelift',
            'method': {
                'api': 'CreateAlias',
                'boto3': 'create_alias',
                'cli': 'create-alias'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('gamelift', details.requestId),
            'region': region,
            'service': 'gamelift',
            'type': 'AWS::GameLift::Alias',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:gamelift:gamelift.DeleteBuild
    if (details.method == "DELETE" && details.url.match(/.+console\.aws\.amazon\.com\/gamelift\/home\/api\/builds\/build\-/g)) {
        reqParams.boto3['BuildId'] = /.+console\.aws\.amazon\.com\/gamelift\/home\/api\/builds\/(.+)$/g.exec(details.url)[1];
        reqParams.cli['--build-id'] = /.+console\.aws\.amazon\.com\/gamelift\/home\/api\/builds\/(.+)$/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'gamelift',
            'method': {
                'api': 'DeleteBuild',
                'boto3': 'delete_build',
                'cli': 'delete-build'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:gamelift:gamelift.DeleteAlias
    if (details.method == "DELETE" && details.url.match(/.+console\.aws\.amazon\.com\/gamelift\/home\/api\/aliases\/alias\-/g)) {
        reqParams.boto3['AliasId'] = /.+console\.aws\.amazon\.com\/gamelift\/home\/api\/aliases\/(.+)$/g.exec(details.url)[1];
        reqParams.cli['--alias-id'] = /.+console\.aws\.amazon\.com\/gamelift\/home\/api\/aliases\/(.+)$/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'gamelift',
            'method': {
                'api': 'DeleteAlias',
                'boto3': 'delete_alias',
                'cli': 'delete-alias'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:kinesis:kinesis.DescribeLimits
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/kinesis\/proxy$/g) && jsonRequestBody.operation == "DescribeLimits") {

        outputs.push({
            'region': region,
            'service': 'kinesis',
            'method': {
                'api': 'DescribeLimits',
                'boto3': 'describe_limits',
                'cli': 'describe-limits'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:kinesis:kinesis.CreateStream
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/kinesis\/proxy$/g) && jsonRequestBody.operation == "CreateStream") {
        reqParams.boto3['StreamName'] = jsonRequestBody.content.StreamName;
        reqParams.cli['--stream-name'] = jsonRequestBody.content.StreamName;
        reqParams.boto3['ShardCount'] = jsonRequestBody.content.ShardCount;
        reqParams.cli['--shard-count'] = jsonRequestBody.content.ShardCount;

        reqParams.cfn['Name'] = jsonRequestBody.content.StreamName;
        reqParams.cfn['ShardCount'] = jsonRequestBody.content.ShardCount;

        outputs.push({
            'region': region,
            'service': 'kinesis',
            'method': {
                'api': 'CreateStream',
                'boto3': 'create_stream',
                'cli': 'create-stream'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('kinesis', details.requestId),
            'region': region,
            'service': 'kinesis',
            'type': 'AWS::Kinesis::Stream',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:kinesis:kinesis.ListStreams
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/kinesis\/proxy$/g) && jsonRequestBody.operation == "ListStreams") {

        outputs.push({
            'region': region,
            'service': 'kinesis',
            'method': {
                'api': 'ListStreams',
                'boto3': 'list_streams',
                'cli': 'list-streams'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:kinesis:kinesis.DescribeStreamSummary
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/kinesis\/proxy$/g) && jsonRequestBody.operation == "DescribeStreamSummary") {
        reqParams.boto3['StreamName'] = jsonRequestBody.content.StreamName;
        reqParams.cli['--stream-name'] = jsonRequestBody.content.StreamName;

        outputs.push({
            'region': region,
            'service': 'kinesis',
            'method': {
                'api': 'DescribeStreamSummary',
                'boto3': 'describe_stream_summary',
                'cli': 'describe-stream-summary'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:kinesis:kinesis.ListStreamConsumers
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/kinesis\/proxy$/g) && jsonRequestBody.operation == "ListStreamConsumers") {
        reqParams.boto3['StreamARN'] = jsonRequestBody.content.StreamARN;
        reqParams.cli['--stream-arn'] = jsonRequestBody.content.StreamARN;

        outputs.push({
            'region': region,
            'service': 'kinesis',
            'method': {
                'api': 'ListStreamConsumers',
                'boto3': 'list_stream_consumers',
                'cli': 'list-stream-consumers'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:kinesis:kinesis.DeleteStream
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/kinesis\/proxy$/g) && jsonRequestBody.operation == "DeleteStream") {
        reqParams.boto3['StreamName'] = jsonRequestBody.content.StreamName;
        reqParams.cli['--stream-name'] = jsonRequestBody.content.StreamName;
        reqParams.boto3['EnforceConsumerDeletion'] = jsonRequestBody.content.EnforceConsumerDeletion;
        reqParams.cli['--enforce-consumer-deletion'] = jsonRequestBody.content.EnforceConsumerDeletion;

        outputs.push({
            'region': region,
            'service': 'kinesis',
            'method': {
                'api': 'DeleteStream',
                'boto3': 'delete_stream',
                'cli': 'delete-stream'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:firehose:firehose.ListDeliveryStreams
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/firehose\/proxy$/g) && jsonRequestBody.operation == "ListDeliveryStreams") {

        outputs.push({
            'region': region,
            'service': 'firehose',
            'method': {
                'api': 'ListDeliveryStreams',
                'boto3': 'list_delivery_streams',
                'cli': 'list-delivery-streams'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:firehose:s3.HeadBucket
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/firehose\/s3\-proxy$/g) && jsonRequestBody.operation == "HeadBucket") {
        reqParams.boto3['Bucket'] = jsonRequestBody.path;
        reqParams.cli['--bucket'] = jsonRequestBody.path;

        outputs.push({
            'region': region,
            'service': 's3',
            'method': {
                'api': 'HeadBucket',
                'boto3': 'head_bucket',
                'cli': 'head-bucket'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:firehose:logs.DescribeLogGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/firehose\/logs\-proxy$/g) && jsonRequestBody.operation == "DescribeLogGroups") {
        reqParams.boto3['LogGroupNamePrefix'] = jsonRequestBody.content.logGroupNamePrefix;
        reqParams.cli['--log-group-name-prefix'] = jsonRequestBody.content.logGroupNamePrefix;

        outputs.push({
            'region': region,
            'service': 'logs',
            'method': {
                'api': 'DescribeLogGroups',
                'boto3': 'describe_log_groups',
                'cli': 'describe-log-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:firehose:logs.CreateLogGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/firehose\/logs\-proxy$/g) && jsonRequestBody.operation == "CreateLogGroup") {
        reqParams.boto3['LogGroupName'] = jsonRequestBody.content.logGroupName;
        reqParams.cli['--log-group-name'] = jsonRequestBody.content.logGroupName;

        outputs.push({
            'region': region,
            'service': 'logs',
            'method': {
                'api': 'CreateLogGroup',
                'boto3': 'create_log_group',
                'cli': 'create-log-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:firehose:logs.CreateLogStream
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/firehose\/logs\-proxy$/g) && jsonRequestBody.operation == "CreateLogStream") {
        reqParams.boto3['LogGroupName'] = jsonRequestBody.content.logGroupName;
        reqParams.cli['--log-group-name'] = jsonRequestBody.content.logGroupName;
        reqParams.boto3['LogStreamName'] = jsonRequestBody.content.logStreamName;
        reqParams.cli['--log-stream-name'] = jsonRequestBody.content.logStreamName;

        outputs.push({
            'region': region,
            'service': 'logs',
            'method': {
                'api': 'CreateLogStream',
                'boto3': 'create_log_stream',
                'cli': 'create-log-stream'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:firehose:firehose.CreateDeliveryStream
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/firehose\/proxy$/g) && jsonRequestBody.operation == "CreateDeliveryStream") {
        reqParams.boto3['DeliveryStreamName'] = jsonRequestBody.content.DeliveryStreamName;
        reqParams.cli['--delivery-stream-name'] = jsonRequestBody.content.DeliveryStreamName;
        reqParams.boto3['DeliveryStreamType'] = jsonRequestBody.content.DeliveryStreamType;
        reqParams.cli['--delivery-stream-type'] = jsonRequestBody.content.DeliveryStreamType;
        reqParams.boto3['ExtendedS3DestinationConfiguration'] = jsonRequestBody.content.ExtendedS3DestinationConfiguration;
        reqParams.cli['--extended-s3-destination-configuration'] = jsonRequestBody.content.ExtendedS3DestinationConfiguration;

        reqParams.cfn['DeliveryStreamName'] = jsonRequestBody.content.DeliveryStreamName;
        reqParams.cfn['DeliveryStreamType'] = jsonRequestBody.content.DeliveryStreamType;
        reqParams.cfn['ExtendedS3DestinationConfiguration'] = jsonRequestBody.content.ExtendedS3DestinationConfiguration;
        
        outputs.push({
            'region': region,
            'service': 'firehose',
            'method': {
                'api': 'CreateDeliveryStream',
                'boto3': 'create_delivery_stream',
                'cli': 'create-delivery-stream'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('firehose', details.requestId),
            'region': region,
            'service': 'firehose',
            'type': 'AWS::KinesisFirehose::DeliveryStream',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:firehose:firehose.DeleteDeliveryStream
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/firehose\/proxy$/g) && jsonRequestBody.operation == "DeleteDeliveryStream") {
        reqParams.boto3['DeliveryStreamName'] = jsonRequestBody.content.DeliveryStreamName;
        reqParams.cli['--delivery-stream-name'] = jsonRequestBody.content.DeliveryStreamName;

        outputs.push({
            'region': region,
            'service': 'firehose',
            'method': {
                'api': 'DeleteDeliveryStream',
                'boto3': 'delete_delivery_stream',
                'cli': 'delete-delivery-stream'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // Internal Note: Last addition to return values here

    // autogen:ec2:ec2.DeleteSubnet
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DeleteSubnet\?/g)) {
        reqParams.boto3['SubnetId'] = jsonRequestBody.SubnetId;
        reqParams.cli['--subnet-id'] = jsonRequestBody.SubnetId;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteSubnet',
                'boto3': 'delete_subnet',
                'cli': 'delete-subnet'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DescribeSecurityGroups
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeSecurityGroups\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.filters;
        reqParams.cli['--filters'] = jsonRequestBody.filters;
        reqParams.boto3['MaxResults'] = jsonRequestBody.__metaData.count;
        reqParams.cli['--max-items'] = jsonRequestBody.__metaData.count;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeSecurityGroups',
                'boto3': 'describe_security_groups',
                'cli': 'describe-security-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribeVpcEndpointServices
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribeVpcEndpointServices\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.Filters;
        reqParams.cli['--filters'] = jsonRequestBody.Filters;
        reqParams.boto3['MaxResults'] = jsonRequestBody.MaxResults;
        reqParams.cli['--max-items'] = jsonRequestBody.MaxResults;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribeVpcEndpointServices',
                'boto3': 'describe_vpc_endpoint_services',
                'cli': 'describe-vpc-endpoint-services'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.DescribePrefixLists
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DescribePrefixLists\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.Filters;
        reqParams.cli['--filters'] = jsonRequestBody.Filters;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DescribePrefixLists',
                'boto3': 'describe_prefix_lists',
                'cli': 'describe-prefix-lists'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:ec2:ec2.CreateVpcEndpoint
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.CreateVpcEndpoint\?/g)) {
        reqParams.boto3['ServiceName'] = jsonRequestBody.ServiceName;
        reqParams.cli['--service-name'] = jsonRequestBody.ServiceName;
        reqParams.boto3['VpcEndpointType'] = jsonRequestBody.VpcEndpointType;
        reqParams.cli['--vpc-endpoint-type'] = jsonRequestBody.VpcEndpointType;
        reqParams.boto3['VpcId'] = jsonRequestBody.VpcId;
        reqParams.cli['--vpc-id'] = jsonRequestBody.VpcId;
        reqParams.boto3['SubnetIds'] = jsonRequestBody.SubnetIds;
        reqParams.cli['--subnet-ids'] = jsonRequestBody.SubnetIds;
        reqParams.boto3['PrivateDnsEnabled'] = jsonRequestBody.PrivateDnsEnabled;
        reqParams.cli['--private-dns-enabled'] = jsonRequestBody.PrivateDnsEnabled;
        reqParams.boto3['SecurityGroupIds'] = jsonRequestBody.SecurityGroupIds;
        reqParams.cli['--security-group-ids'] = jsonRequestBody.SecurityGroupIds;

        reqParams.cfn['ServiceName'] = jsonRequestBody.ServiceName;
        reqParams.cfn['VpcEndpointType'] = jsonRequestBody.VpcEndpointType;
        reqParams.cfn['VpcId'] = jsonRequestBody.VpcId;
        reqParams.cfn['SubnetIds'] = jsonRequestBody.SubnetIds;
        reqParams.cfn['PrivateDnsEnabled'] = jsonRequestBody.PrivateDnsEnabled;
        reqParams.cfn['SecurityGroupIds'] = jsonRequestBody.SecurityGroupIds;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'CreateVpcEndpoint',
                'boto3': 'create_vpc_endpoint',
                'cli': 'create-vpc-endpoint'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('ec2', details.requestId),
            'region': region,
            'service': 'ec2',
            'type': 'AWS::EC2::VPCEndpoint',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:ec2:ec2.DeleteVpcEndpoints
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/vpc\/vcb\/elastic\/\?call=com\.amazonaws\.ec2\.AmazonEC2\.DeleteVpcEndpoints\?/g)) {
        reqParams.boto3['VpcEndpointIds'] = jsonRequestBody.VpcEndpointIds;
        reqParams.cli['--vpc-endpoint-ids'] = jsonRequestBody.VpcEndpointIds;

        outputs.push({
            'region': region,
            'service': 'ec2',
            'method': {
                'api': 'DeleteVpcEndpoints',
                'boto3': 'delete_vpc_endpoints',
                'cli': 'delete-vpc-endpoints'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:kms.ListKeys
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/encryptionKeys\/listEncryptionKeys\?/g)) {

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'ListKeys',
                'boto3': 'list_keys',
                'cli': 'list-keys'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:iam.ListUsers
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/users$/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListUsers',
                'boto3': 'list_users',
                'cli': 'list-users'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:iam.ListRoles
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/roles$/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListRoles',
                'boto3': 'list_roles',
                'cli': 'list-roles'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:kms.CreateKey
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/encryptionKeys\/createKey$/g)) {
        reqParams.boto3['Description'] = jsonRequestBody.keyDescription[0];
        reqParams.cli['--description'] = jsonRequestBody.keyDescription[0];
        reqParams.boto3['Origin'] = jsonRequestBody.origin[0];
        reqParams.cli['--origin'] = jsonRequestBody.origin[0];
        reqParams.boto3['Policy'] = jsonRequestBody.policy[0];
        reqParams.cli['--policy'] = jsonRequestBody.policy[0];
        reqParams.boto3['Tags'] = jsonRequestBody.tags[0];
        reqParams.cli['--tags'] = jsonRequestBody.tags[0];

        reqParams.cfn['Description'] = jsonRequestBody.keyDescription[0];
        reqParams.cfn['KeyPolicy'] = jsonRequestBody.policy[0];
        reqParams.cfn['Tags'] = jsonRequestBody.tags[0];

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'CreateKey',
                'boto3': 'create_key',
                'cli': 'create-key'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('kms', details.requestId),
            'region': region,
            'service': 'kms',
            'type': 'AWS::KMS::Key',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }

        /* -- TODO
        if (Array.isArray(jsonRequestBody.keyAlias)) {
            reqParams.boto3['AliasName'] = jsonRequestBody.keyAlias[0];
            reqParams.cli['--alias-name'] = jsonRequestBody.keyAlias[0];
            reqParams.boto3['TargetKeyId'] = "???";
            reqParams.cli['--target-key-id'] = "???";

            outputs.push({
                'region': region,
                'service': 'kms',
                'method': {
                    'api': 'CreateAlias',
                    'boto3': 'create_alias',
                    'cli': 'create-alias'
                },
                'options': reqParams,
                'requestDetails': details
            });
        }
        */
        
        return {};
    }

    // autogen:iam:kms.GetKeyPolicy
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/encryptionKeys\/getKeyPolicy\?/g)) {
        reqParams.boto3['KeyId'] = getUrlValue(details.url, 'keyId');
        reqParams.cli['--key-id'] = getUrlValue(details.url, 'keyId');

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'GetKeyPolicy',
                'boto3': 'get_key_policy',
                'cli': 'get-key-policy'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:kms.ListResourceTags
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/encryptionKeys\/listResourceTags\?/g)) {
        reqParams.boto3['KeyId'] = getUrlValue(details.url, 'keyId');
        reqParams.cli['--key-id'] = getUrlValue(details.url, 'keyId');

        outputs.push({
            'region': region,
            'service': 'kms',
            'method': {
                'api': 'ListResourceTags',
                'boto3': 'list_resource_tags',
                'cli': 'list-resource-tags'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:kms.ScheduleKeyDeletion
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/encryptionKeys\/scheduleKeyDeletion$/g)) {
        jsonRequestBody.keyIdList.forEach(keyId => {
            reqParams.boto3['KeyId'] = keyId;
            reqParams.cli['--key-id'] = keyId;
            reqParams.boto3['PendingWindowInDays'] = jsonRequestBody.pendingWindowInDays[0];
            reqParams.cli['--pending-window-in-days'] = jsonRequestBody.pendingWindowInDays[0];
    
            outputs.push({
                'region': region,
                'service': 'kms',
                'method': {
                    'api': 'ScheduleKeyDeletion',
                    'boto3': 'schedule_key_deletion',
                    'cli': 'schedule-key-deletion'
                },
                'options': reqParams,
                'requestDetails': details
            });
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.CreateGroup
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/groups\/createGroup$/g)) {
        reqParams.boto3['GroupName'] = jsonRequestBody.groupName[0];
        reqParams.cli['--group-name'] = jsonRequestBody.groupName[0];

        reqParams.cfn['GroupName'] = jsonRequestBody.groupName[0];
        if (jsonRequestBody['policies[]'] && jsonRequestBody['policies[]'].length) {
            reqParams.cfn['Policies'] = jsonRequestBody['policies[]'];
        }

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'CreateGroup',
                'boto3': 'create_group',
                'cli': 'create-group'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('iam', details.requestId),
            'region': region,
            'service': 'iam',
            'type': 'AWS::IAM::Group',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (jsonRequestBody['policies[]'] && jsonRequestBody['policies[]'].length) {
            jsonRequestBody['policies[]'].forEach(policy => {
                var reqParams = {
                    'boto3': {},
                    'go': {},
                    'cfn': {},
                    'cli': {}
                };

                reqParams.boto3['GroupName'] = jsonRequestBody.groupName[0];
                reqParams.cli['--group-name'] = jsonRequestBody.groupName[0];
                reqParams.boto3['PolicyArn'] = jsonRequestBody.groupName[0];
                reqParams.cli['--policy-arn'] = jsonRequestBody.groupName[0];

                outputs.push({
                    'region': region,
                    'service': 'iam',
                    'method': {
                        'api': 'AttachGroupPolicy',
                        'boto3': 'attach_group_policy',
                        'cli': 'attach-group-policy'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            });
        }

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.ListGroups
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/service\/groups$/g)) {

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListGroups',
                'boto3': 'list_groups',
                'cli': 'list-groups'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iam:iam.CreateRole
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/roles$/g)) {
        reqParams.boto3['RoleName'] = jsonRequestBody.name;
        reqParams.cli['--role-name'] = jsonRequestBody.name;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['AssumeRolePolicyDocument'] = jsonRequestBody.trustPolicyDocument;
        reqParams.cli['--assume-role-policy-document'] = jsonRequestBody.trustPolicyDocument;

        reqParams.cfn['RoleName'] = jsonRequestBody.name;
        reqParams.cfn['AssumeRolePolicyDocument'] = jsonRequestBody.trustPolicyDocument;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'CreateRole',
                'boto3': 'create_role',
                'cli': 'create-role'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('iam', details.requestId),
            'region': region,
            'service': 'iam',
            'type': 'AWS::IAM::Role',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.CreateInstanceProfile
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/roles\/.+\/instanceProfiles$/g)) {
        reqParams.boto3['InstanceProfileName'] = /.+console\.aws\.amazon\.com\/iam\/api\/roles\/(.+)\/instanceProfiles$/g.exec(details.url)[1];
        reqParams.cli['--instance-profile-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/roles\/(.+)\/instanceProfiles$/g.exec(details.url)[1];

        reqParams.cfn['InstanceProfileName'] = /.+console\.aws\.amazon\.com\/iam\/api\/roles\/(.+)\/instanceProfiles$/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'CreateInstanceProfile',
                'boto3': 'create_instance_profile',
                'cli': 'create-instance-profile'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('iam', details.requestId),
            'region': region,
            'service': 'iam',
            'type': 'AWS::IAM::InstanceProfile',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.AttachRolePolicy
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/roles\/.+\/attachments$/g)) {
        reqParams.boto3['PolicyArn'] = jsonRequestBody.policyArn;
        reqParams.cli['--policy-arn'] = jsonRequestBody.policyArn;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'AttachRolePolicy',
                'boto3': 'attach_role_policy',
                'cli': 'attach-role-policy'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.CreatePolicy
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/policies\/create$/g)) {
        reqParams.boto3['PolicyName'] = jsonRequestBody.policyName;
        reqParams.cli['--policy-name'] = jsonRequestBody.policyName;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['PolicyDocument'] = jsonRequestBody.policyDocument;
        reqParams.cli['--policy-document'] = jsonRequestBody.policyDocument;

        reqParams.cfn['ManagedPolicyName'] = jsonRequestBody.policyName;
        reqParams.cfn['Description'] = jsonRequestBody.description;
        reqParams.cfn['PolicyDocument'] = jsonRequestBody.policyDocument;

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'CreatePolicy',
                'boto3': 'create_policy',
                'cli': 'create-policy'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('iam', details.requestId),
            'region': region,
            'service': 'iam',
            'type': 'AWS::IAM::ManagedPolicy',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.DeletePolicy
    if (details.method == "DELETE" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/policies\/.+$/g)) {
        reqParams.boto3['PolicyArn'] = /.+console\.aws\.amazon\.com\/iam\/api\/policies\/(.+)$/g.exec(details.url)[1];
        reqParams.cli['--policy-arn'] = /.+console\.aws\.amazon\.com\/iam\/api\/policies\/(.+)$/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'DeletePolicy',
                'boto3': 'delete_policy',
                'cli': 'delete-policy'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.DeleteAccessKey
    if (details.method == "DELETE" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/accessKeys\/.+$/g)) {
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\/accessKeys\/.+$/g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\/accessKeys\/.+$/g.exec(details.url)[1];
        reqParams.boto3['AccessKeyId'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/accessKeys\/(.+)$/g.exec(details.url)[1];
        reqParams.cli['--access-key-id'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/accessKeys\/(.+)$/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'DeleteAccessKey',
                'boto3': 'delete_access_key',
                'cli': 'delete-access-key'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iam:iam.ListAccessKeys
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iam\/api\/users\/.+\/accessKeys$/g)) {
        reqParams.boto3['UserName'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\/accessKeys$/g.exec(details.url)[1];
        reqParams.cli['--user-name'] = /.+console\.aws\.amazon\.com\/iam\/api\/users\/(.+)\/accessKeys$/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'iam',
            'method': {
                'api': 'ListAccessKeys',
                'boto3': 'list_access_keys',
                'cli': 'list-access-keys'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:dms:dms.DescribeReplicationSubnetGroups
    // autogen:dms:ec2.DescribeVpcs
    // autogen:dms:ec2.DescribeSubnets
    // autogen:dms:iam.GetRole
    // autogen:dms:dms.CreateReplicationSubnetGroup
    // autogen:dms:dms.DeleteReplicationSubnetGroup
    // autogen:dms:dms.DescribeReplicationInstances
    // autogen:dms:dms.DescribeOrderableReplicationInstances
    // autogen:dms:dms.DescribeAccountAttributes
    // autogen:dms:ec2.DescribeAvailabilityZones
    // autogen:dms:ec2.DescribeSecurityGroups
    // autogen:dms:kms.DescribeKey
    // autogen:dms:dms.CreateReplicationInstance
    // autogen:dms:dms.DescribeReplicationInstanceTaskLogs
    // autogen:dms:dms.DeleteReplicationInstance
    // autogen:dms:dms.DescribeCertificates
    // autogen:dms:dms.ImportCertificate
    // autogen:dms:dms.DescribeEndpoints
    // autogen:dms:dms.DescribeConnections
    // autogen:dms:rds.DescribeDBInstances
    // autogen:dms:dms.DescribeEndpointTypes
    // autogen:dms:dms.CreateEndpoint
    // autogen:dms:dms.DescribeSchemas
    // autogen:dms:dms.DescribeRefreshSchemasStatus
    // autogen:dms:dms.DeleteEndpoint
    // autogen:dms:dms.DescribeEventSubscriptions
    // autogen:dms:sns.ListTopics
    // autogen:dms:dms.DescribeEventCategories
    // autogen:dms:dms.CreateEventSubscription
    // autogen:dms:dms.DeleteEventSubscription
    // autogen:dms:dms.RefreshSchemas
    // autogen:dms:dms.CreateReplicationTask
    // autogen:dms:dms.DescribeTableStatistics
    // autogen:dms:dms.DescribeReplicationTaskAssessmentResults
    // autogen:dms:dms.DeleteReplicationTask
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/dms\/rpc$/g)) {
        for (var i in jsonRequestBody.actions) {
            var action = jsonRequestBody.actions[i];
            if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeReplicationSubnetGroups") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeReplicationSubnetGroups',
                        'boto3': 'describe_replication_subnet_groups',
                        'cli': 'describe-replication-subnet-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AmazonEC2Context.describeVpcs") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeVpcs',
                        'boto3': 'describe_vpcs',
                        'cli': 'describe-vpcs'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AmazonEC2Context.describeSubnets") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSubnets',
                        'boto3': 'describe_subnets',
                        'cli': 'describe-subnets'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AmazonIdentityManagementContext.getRole") {
                reqParams.boto3['RoleName'] = action['parameters'][0]['roleName'];
                reqParams.cli['--role-name'] = action['parameters'][0]['roleName'];

                outputs.push({
                    'region': region,
                    'service': 'iam',
                    'method': {
                        'api': 'GetRole',
                        'boto3': 'get_role',
                        'cli': 'get-role'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.createReplicationSubnetGroup") {
                reqParams.boto3['ReplicationSubnetGroupDescription'] = action['parameters'][0]['replicationSubnetGroupDescription'];
                reqParams.cli['--replication-subnet-group-description'] = action['parameters'][0]['replicationSubnetGroupDescription'];
                reqParams.boto3['ReplicationSubnetGroupIdentifier'] = action['parameters'][0]['replicationSubnetGroupIdentifier'];
                reqParams.cli['--replication-subnet-group-identifier'] = action['parameters'][0]['replicationSubnetGroupIdentifier'];
                reqParams.boto3['SubnetIds'] = action['parameters'][0]['subnetIds'];
                reqParams.cli['--subnet-ids'] = action['parameters'][0]['subnetIds'];

                reqParams.cfn['ReplicationSubnetGroupDescription'] = action['parameters'][0]['replicationSubnetGroupDescription'];
                reqParams.cfn['ReplicationSubnetGroupIdentifier'] = action['parameters'][0]['replicationSubnetGroupIdentifier'];
                reqParams.cfn['SubnetIds'] = action['parameters'][0]['subnetIds'];

                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'CreateReplicationSubnetGroup',
                        'boto3': 'create_replication_subnet_group',
                        'cli': 'create-replication-subnet-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('dms', details.requestId),
                    'region': region,
                    'service': 'dms',
                    'type': 'AWS::DMS::ReplicationSubnetGroup',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.deleteReplicationSubnetGroup") {
                reqParams.boto3['ReplicationSubnetGroupIdentifier'] = action['parameters'][0]['replicationSubnetGroupIdentifier'];
                reqParams.cli['--replication-subnet-group-identifier'] = action['parameters'][0]['replicationSubnetGroupIdentifier'];

                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DeleteReplicationSubnetGroup',
                        'boto3': 'delete_replication_subnet_group',
                        'cli': 'delete-replication-subnet-group'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeReplicationInstances") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeReplicationInstances',
                        'boto3': 'describe_replication_instances',
                        'cli': 'describe-replication-instances'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeOrderableReplicationInstances") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeOrderableReplicationInstances',
                        'boto3': 'describe_orderable_replication_instances',
                        'cli': 'describe-orderable-replication-instances'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeAccountAttributes") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeAccountAttributes',
                        'boto3': 'describe_account_attributes',
                        'cli': 'describe-account-attributes'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AmazonEC2Context.describeAvailabilityZones") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeAvailabilityZones',
                        'boto3': 'describe_availability_zones',
                        'cli': 'describe-availability-zones'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AmazonEC2Context.describeSecurityGroups") {
                outputs.push({
                    'region': region,
                    'service': 'ec2',
                    'method': {
                        'api': 'DescribeSecurityGroups',
                        'boto3': 'describe_security_groups',
                        'cli': 'describe-security-groups'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSKMSContext.describeKey") {
                reqParams.boto3['KeyId'] = action['parameters'][0]['keyId'];
                reqParams.cli['--key-id'] = action['parameters'][0]['keyId'];
        
                outputs.push({
                    'region': region,
                    'service': 'kms',
                    'method': {
                        'api': 'DescribeKey',
                        'boto3': 'describe_key',
                        'cli': 'describe-key'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.createReplicationInstance") {
                reqParams.boto3['AutoMinorVersionUpgrade'] = action['parameters'][0]['autoMinorVersionUpgrade'];
                reqParams.cli['--auto-minor-version-upgrade'] = action['parameters'][0]['autoMinorVersionUpgrade'];
                reqParams.boto3['PubliclyAccessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.cli['--publicly-accessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.boto3['AllocatedStorage'] = action['parameters'][0]['allocatedStorage'];
                reqParams.cli['--allocated-storage'] = action['parameters'][0]['allocatedStorage'];
                reqParams.boto3['AvailabilityZone'] = action['parameters'][0]['availabilityZone'];
                reqParams.cli['--availability-zone'] = action['parameters'][0]['availabilityZone'];
                reqParams.boto3['EngineVersion'] = action['parameters'][0]['engineVersion'];
                reqParams.cli['--engine-version'] = action['parameters'][0]['engineVersion'];
                reqParams.boto3['PreferredMaintenanceWindow'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.cli['--preferred-maintenance-window'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.boto3['ReplicationInstanceClass'] = action['parameters'][0]['replicationInstanceClass'];
                reqParams.cli['--replication-instance-class'] = action['parameters'][0]['replicationInstanceClass'];
                reqParams.boto3['ReplicationInstanceIdentifier'] = action['parameters'][0]['replicationInstanceIdentifier'];
                reqParams.cli['--replication-instance-identifier'] = action['parameters'][0]['replicationInstanceIdentifier'];
                reqParams.boto3['ReplicationSubnetGroupIdentifier'] = action['parameters'][0]['replicationSubnetGroupIdentifier'];
                reqParams.cli['--replication-subnet-group-identifier'] = action['parameters'][0]['replicationSubnetGroupIdentifier'];
                reqParams.boto3['Tags'] = action['parameters'][0]['tags'];
                reqParams.cli['--tags'] = action['parameters'][0]['tags'];
                reqParams.boto3['VpcSecurityGroupIds'] = action['parameters'][0]['vpcSecurityGroupIds'];
                reqParams.cli['--vpc-security-group-ids'] = action['parameters'][0]['vpcSecurityGroupIds'];

                reqParams.cfn['AutoMinorVersionUpgrade'] = action['parameters'][0]['autoMinorVersionUpgrade'];
                reqParams.cfn['PubliclyAccessible'] = action['parameters'][0]['publiclyAccessible'];
                reqParams.cfn['AllocatedStorage'] = action['parameters'][0]['allocatedStorage'];
                reqParams.cfn['AvailabilityZone'] = action['parameters'][0]['availabilityZone'];
                reqParams.cfn['EngineVersion'] = action['parameters'][0]['engineVersion'];
                reqParams.cfn['PreferredMaintenanceWindow'] = action['parameters'][0]['preferredMaintenanceWindow'];
                reqParams.cfn['ReplicationInstanceClass'] = action['parameters'][0]['replicationInstanceClass'];
                reqParams.cfn['ReplicationInstanceIdentifier'] = action['parameters'][0]['replicationInstanceIdentifier'];
                reqParams.cfn['ReplicationSubnetGroupIdentifier'] = action['parameters'][0]['replicationSubnetGroupIdentifier'];
                reqParams.cfn['Tags'] = action['parameters'][0]['tags'];
                reqParams.cfn['VpcSecurityGroupIds'] = action['parameters'][0]['vpcSecurityGroupIds'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'CreateReplicationInstance',
                        'boto3': 'create_replication_instance',
                        'cli': 'create-replication-instance'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('dms', details.requestId),
                    'region': region,
                    'service': 'dms',
                    'type': 'AWS::DMS::ReplicationInstance',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeReplicationInstanceTaskLogs") {
                reqParams.boto3['MaxRecords'] = action['parameters'][0]['maxRecords'];
                reqParams.cli['--max-records'] = action['parameters'][0]['maxRecords'];
                reqParams.boto3['ReplicationInstanceArn'] = action['parameters'][0]['replicationInstanceArn'];
                reqParams.cli['--replication-instance-arn'] = action['parameters'][0]['replicationInstanceArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeReplicationInstanceTaskLogs',
                        'boto3': 'describe_replication_instance_task_logs',
                        'cli': 'describe-replication-instance-task-logs'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.deleteReplicationInstance") {
                reqParams.boto3['ReplicationInstanceArn'] = action['parameters'][0]['replicationInstanceArn'];
                reqParams.cli['--replication-instance-arn'] = action['parameters'][0]['replicationInstanceArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DeleteReplicationInstance',
                        'boto3': 'delete_replication_instance',
                        'cli': 'delete-replication-instance'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeCertificates") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeCertificates',
                        'boto3': 'describe_certificates',
                        'cli': 'describe-certificates'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.shared.DMSServiceContext.importNewCertificate") {
                reqParams.boto3['CertificateIdentifier'] = action['parameters'][0]['certificateIdentifier'];
                reqParams.cli['--certificate-identifier'] = action['parameters'][0]['certificateIdentifier'];
                reqParams.boto3['CertificatePem'] = action['parameters'][0]['certificatePem'];
                reqParams.cli['--certificate-pem'] = action['parameters'][0]['certificatePem'];

                reqParams.cfn['CertificateIdentifier'] = action['parameters'][0]['certificateIdentifier'];
                reqParams.cfn['CertificatePem'] = action['parameters'][0]['certificatePem'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'ImportCertificate',
                        'boto3': 'import_certificate',
                        'cli': 'import-certificate'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('dms', details.requestId),
                    'region': region,
                    'service': 'dms',
                    'type': 'AWS::DMS::Certificate',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeEndpoints") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeEndpoints',
                        'boto3': 'describe_endpoints',
                        'cli': 'describe-endpoints'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeConnections") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeConnections',
                        'boto3': 'describe_connections',
                        'cli': 'describe-connections'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AmazonRDSContext.describeDBInstances") {
                reqParams.boto3['MaxRecords'] = action['parameters'][0]['maxRecords'];
                reqParams.cli['--max-records'] = action['parameters'][0]['maxRecords'];
        
                outputs.push({
                    'region': region,
                    'service': 'rds',
                    'method': {
                        'api': 'DescribeDBInstances',
                        'boto3': 'describe_db_instances',
                        'cli': 'describe-db-instances'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeEndpointTypes") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeEndpointTypes',
                        'boto3': 'describe_endpoint_types',
                        'cli': 'describe-endpoint-types'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.createEndpoint") {
                reqParams.boto3['Port'] = action['parameters'][0]['port'];
                reqParams.cli['--port'] = action['parameters'][0]['port'];
                reqParams.boto3['EndpointIdentifier'] = action['parameters'][0]['endpointIdentifier'];
                reqParams.cli['--endpoint-identifier'] = action['parameters'][0]['endpointIdentifier'];
                reqParams.boto3['EndpointType'] = action['parameters'][0]['endpointType'];
                reqParams.cli['--endpoint-type'] = action['parameters'][0]['endpointType'];
                reqParams.boto3['EngineName'] = action['parameters'][0]['engineName'];
                reqParams.cli['--engine-name'] = action['parameters'][0]['engineName'];
                reqParams.boto3['KmsKeyId'] = action['parameters'][0]['kmsKeyId'];
                reqParams.cli['--kms-key-id'] = action['parameters'][0]['kmsKeyId'];
                reqParams.boto3['Password'] = action['parameters'][0]['password'];
                reqParams.cli['--password'] = action['parameters'][0]['password'];
                reqParams.boto3['ServerName'] = action['parameters'][0]['serverName'];
                reqParams.cli['--server-name'] = action['parameters'][0]['serverName'];
                reqParams.boto3['SslMode'] = action['parameters'][0]['sslMode'];
                reqParams.cli['--ssl-mode'] = action['parameters'][0]['sslMode'];
                reqParams.boto3['Username'] = action['parameters'][0]['username'];
                reqParams.cli['--username'] = action['parameters'][0]['username'];

                reqParams.cfn['Port'] = action['parameters'][0]['port'];
                reqParams.cfn['EndpointIdentifier'] = action['parameters'][0]['endpointIdentifier'];
                reqParams.cfn['EndpointType'] = action['parameters'][0]['endpointType'];
                reqParams.cfn['EngineName'] = action['parameters'][0]['engineName'];
                reqParams.cfn['KmsKeyId'] = action['parameters'][0]['kmsKeyId'];
                reqParams.cfn['Password'] = action['parameters'][0]['password'];
                reqParams.cfn['ServerName'] = action['parameters'][0]['serverName'];
                reqParams.cfn['SslMode'] = action['parameters'][0]['sslMode'];
                reqParams.cfn['Username'] = action['parameters'][0]['username'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'CreateEndpoint',
                        'boto3': 'create_endpoint',
                        'cli': 'create-endpoint'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('dms', details.requestId),
                    'region': region,
                    'service': 'dms',
                    'type': 'AWS::DMS::Endpoint',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeSchemas") {
                reqParams.boto3['EndpointArn'] = action['parameters'][0]['endpointArn'];
                reqParams.cli['--endpoint-arn'] = action['parameters'][0]['endpointArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeSchemas',
                        'boto3': 'describe_schemas',
                        'cli': 'describe-schemas'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeRefreshSchemasStatus") {
                reqParams.boto3['EndpointArn'] = action['parameters'][0]['endpointArn'];
                reqParams.cli['--endpoint-arn'] = action['parameters'][0]['endpointArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeRefreshSchemasStatus',
                        'boto3': 'describe_refresh_schemas_status',
                        'cli': 'describe-refresh-schemas-status'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.deleteEndpoint") {
                reqParams.boto3['EndpointArn'] = action['parameters'][0]['endpointArn'];
                reqParams.cli['--endpoint-arn'] = action['parameters'][0]['endpointArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DeleteEndpoint',
                        'boto3': 'delete_endpoint',
                        'cli': 'delete-endpoint'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeEventSubscriptions") {
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeEventSubscriptions',
                        'boto3': 'describe_event_subscriptions',
                        'cli': 'describe-event-subscriptions'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AmazonSNSContext.listTopics") {
                outputs.push({
                    'region': region,
                    'service': 'sns',
                    'method': {
                        'api': 'ListTopics',
                        'boto3': 'list_topics',
                        'cli': 'list-topics'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeEventCategories") {
                reqParams.boto3['SourceType'] = action['parameters'][0]['sourceType'];
                reqParams.cli['--source-type'] = action['parameters'][0]['sourceType'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeEventCategories',
                        'boto3': 'describe_event_categories',
                        'cli': 'describe-event-categories'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.createEventSubscription") {
                reqParams.boto3['Enabled'] = action['parameters'][0]['enabled'];
                reqParams.cli['--enabled'] = action['parameters'][0]['enabled'];
                reqParams.boto3['SnsTopicArn'] = action['parameters'][0]['snsTopicArn'];
                reqParams.cli['--sns-topic-arn'] = action['parameters'][0]['snsTopicArn'];
                reqParams.boto3['SourceType'] = action['parameters'][0]['sourceType'];
                reqParams.cli['--source-type'] = action['parameters'][0]['sourceType'];
                reqParams.boto3['SubscriptionName'] = action['parameters'][0]['subscriptionName'];
                reqParams.cli['--subscription-name'] = action['parameters'][0]['subscriptionName'];
                reqParams.boto3['EventCategories'] = action['parameters'][0]['eventCategories'];
                reqParams.cli['--event-categories'] = action['parameters'][0]['eventCategories'];

                reqParams.cfn['Enabled'] = action['parameters'][0]['enabled'];
                reqParams.cfn['SnsTopicArn'] = action['parameters'][0]['snsTopicArn'];
                reqParams.cfn['SourceType'] = action['parameters'][0]['sourceType'];
                reqParams.cfn['SubscriptionName'] = action['parameters'][0]['subscriptionName'];
                reqParams.cfn['EventCategories'] = action['parameters'][0]['eventCategories'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'CreateEventSubscription',
                        'boto3': 'create_event_subscription',
                        'cli': 'create-event-subscription'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('dms', details.requestId),
                    'region': region,
                    'service': 'dms',
                    'type': 'AWS::DMS::EventSubscription',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.deleteEventSubscription") {
                reqParams.boto3['SubscriptionName'] = action['parameters'][0]['subscriptionName'];
                reqParams.cli['--subscription-name'] = action['parameters'][0]['subscriptionName'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DeleteEventSubscription',
                        'boto3': 'delete_event_subscription',
                        'cli': 'delete-event-subscription'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.refreshSchemas") {
                reqParams.boto3['EndpointArn'] = action['parameters'][0]['endpointArn'];
                reqParams.cli['--endpoint-arn'] = action['parameters'][0]['endpointArn'];
                reqParams.boto3['ReplicationInstanceArn'] = action['parameters'][0]['replicationInstanceArn'];
                reqParams.cli['--replication-instance-arn'] = action['parameters'][0]['replicationInstanceArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'RefreshSchemas',
                        'boto3': 'refresh_schemas',
                        'cli': 'refresh-schemas'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.createReplicationTask") {
                reqParams.boto3['MigrationType'] = action['parameters'][0]['migrationType'];
                reqParams.cli['--migration-type'] = action['parameters'][0]['migrationType'];
                reqParams.boto3['ReplicationInstanceArn'] = action['parameters'][0]['replicationInstanceArn'];
                reqParams.cli['--replication-instance-arn'] = action['parameters'][0]['replicationInstanceArn'];
                reqParams.boto3['ReplicationTaskIdentifier'] = action['parameters'][0]['replicationTaskIdentifier'];
                reqParams.cli['--replication-task-identifier'] = action['parameters'][0]['replicationTaskIdentifier'];
                reqParams.boto3['ReplicationTaskSettings'] = action['parameters'][0]['replicationTaskSettings'];
                reqParams.cli['--replication-task-settings'] = action['parameters'][0]['replicationTaskSettings'];
                reqParams.boto3['SourceEndpointArn'] = action['parameters'][0]['sourceEndpointArn'];
                reqParams.cli['--source-endpoint-arn'] = action['parameters'][0]['sourceEndpointArn'];
                reqParams.boto3['TableMappings'] = action['parameters'][0]['tableMappings'];
                reqParams.cli['--table-mappings'] = action['parameters'][0]['tableMappings'];
                reqParams.boto3['TargetEndpointArn'] = action['parameters'][0]['targetEndpointArn'];
                reqParams.cli['--target-endpoint-arn'] = action['parameters'][0]['targetEndpointArn'];

                reqParams.cfn['MigrationType'] = action['parameters'][0]['migrationType'];
                reqParams.cfn['ReplicationInstanceArn'] = action['parameters'][0]['replicationInstanceArn'];
                reqParams.cfn['ReplicationTaskIdentifier'] = action['parameters'][0]['replicationTaskIdentifier'];
                reqParams.cfn['ReplicationTaskSettings'] = action['parameters'][0]['replicationTaskSettings'];
                reqParams.cfn['SourceEndpointArn'] = action['parameters'][0]['sourceEndpointArn'];
                reqParams.cfn['TableMappings'] = action['parameters'][0]['tableMappings'];
                reqParams.cfn['TargetEndpointArn'] = action['parameters'][0]['targetEndpointArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'CreateReplicationTask',
                        'boto3': 'create_replication_task',
                        'cli': 'create-replication-task'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                tracked_resources.push({
                    'logicalId': getResourceName('dms', details.requestId),
                    'region': region,
                    'service': 'dms',
                    'type': 'AWS::DMS::ReplicationTask',
                    'options': reqParams,
                    'requestDetails': details,
                    'was_blocked': blocking
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeTableStatistics") {
                reqParams.boto3['MaxRecords'] = action['parameters'][0]['maxRecords'];
                reqParams.cli['--max-records'] = action['parameters'][0]['maxRecords'];
                reqParams.boto3['ReplicationTaskArn'] = action['parameters'][0]['replicationTaskArn'];
                reqParams.cli['--replication-task-arn'] = action['parameters'][0]['replicationTaskArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeTableStatistics',
                        'boto3': 'describe_table_statistics',
                        'cli': 'describe-table-statistics'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.describeReplicationTaskAssessmentResults") {
                reqParams.boto3['MaxRecords'] = action['parameters'][0]['maxRecords'];
                reqParams.cli['--max-records'] = action['parameters'][0]['maxRecords'];
                reqParams.boto3['ReplicationTaskArn'] = action['parameters'][0]['replicationTaskArn'];
                reqParams.cli['--replication-task-arn'] = action['parameters'][0]['replicationTaskArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DescribeReplicationTaskAssessmentResults',
                        'boto3': 'describe_replication_task_assessment_results',
                        'cli': 'describe-replication-task-assessment-results'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });
            } else if (action['action'] == "com.amazonaws.console.dms.awssdk.shared.context.AWSDatabaseMigrationServiceContext.deleteReplicationTask") {
                reqParams.boto3['ReplicationTaskArn'] = action['parameters'][0]['replicationTaskArn'];
                reqParams.cli['--replication-task-arn'] = action['parameters'][0]['replicationTaskArn'];
        
                outputs.push({
                    'region': region,
                    'service': 'dms',
                    'method': {
                        'api': 'DeleteReplicationTask',
                        'boto3': 'delete_replication_task',
                        'cli': 'delete-replication-task'
                    },
                    'options': reqParams,
                    'requestDetails': details
                });

                if (blocking) {
                    notifyBlocked();
                    return {cancel: true};
                }
            }
        }
    }

    // autogen:elasticbeanstalk:elasticbeanstalk.DescribeApplicationVersions
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/applications\/versions\?/g)) {

        outputs.push({
            'region': region,
            'service': 'elasticbeanstalk',
            'method': {
                'api': 'DescribeApplicationVersions',
                'boto3': 'describe_application_versions',
                'cli': 'describe-application-versions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:elasticbeanstalk:elasticbeanstalk.ListPlatformVersions
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/platforms\/list\?/g)) {
        reqParams.boto3['Filters'] = jsonRequestBody.filters;
        reqParams.cli['--filters'] = jsonRequestBody.filters;

        outputs.push({
            'region': region,
            'service': 'elasticbeanstalk',
            'method': {
                'api': 'ListPlatformVersions',
                'boto3': 'list_platform_versions',
                'cli': 'list-platform-versions'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:elasticbeanstalk:elasticbeanstalk.CreateApplication
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/applications\?/g)) {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.applicationName;

        reqParams.cfn['ApplicationName'] = jsonRequestBody.applicationName;

        outputs.push({
            'region': region,
            'service': 'elasticbeanstalk',
            'method': {
                'api': 'CreateApplication',
                'boto3': 'create_application',
                'cli': 'create-application'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('elasticbeanstalk', details.requestId),
            'region': region,
            'service': 'elasticbeanstalk',
            'type': 'AWS::ElasticBeanstalk::Application',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:elasticbeanstalk:elasticbeanstalk.CreateEnvironment
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/environments\?/g)) {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.applicationName;
        reqParams.boto3['EnvironmentName'] = jsonRequestBody.environmentName;
        reqParams.cli['--environment-name'] = jsonRequestBody.environmentName;
        reqParams.boto3['OptionSettings'] = jsonRequestBody.optionSettings;
        reqParams.cli['--option-settings'] = jsonRequestBody.optionSettings;
        reqParams.boto3['OptionsToRemove'] = jsonRequestBody.optionsToRemove;
        reqParams.cli['--options-to-remove'] = jsonRequestBody.optionsToRemove;
        reqParams.boto3['PlatformArn'] = jsonRequestBody.platformArn;
        reqParams.cli['--platform-arn'] = jsonRequestBody.platformArn;
        reqParams.boto3['Tags'] = jsonRequestBody.tags;
        reqParams.cli['--tags'] = jsonRequestBody.tags;
        reqParams.boto3['Tier'] = jsonRequestBody.tier;
        reqParams.cli['--tier'] = jsonRequestBody.tier;
        reqParams.boto3['VersionLabel'] = jsonRequestBody.versionLabel;
        reqParams.cli['--version-label'] = jsonRequestBody.versionLabel;

        reqParams.cfn['ApplicationName'] = jsonRequestBody.applicationName;
        reqParams.cfn['EnvironmentName'] = jsonRequestBody.environmentName;
        reqParams.cfn['OptionSettings'] = jsonRequestBody.optionSettings;
        reqParams.cfn['PlatformArn'] = jsonRequestBody.platformArn;
        reqParams.cfn['Tags'] = jsonRequestBody.tags;
        reqParams.cfn['Tier'] = jsonRequestBody.tier;
        reqParams.cfn['VersionLabel'] = jsonRequestBody.versionLabel;

        outputs.push({
            'region': region,
            'service': 'elasticbeanstalk',
            'method': {
                'api': 'CreateEnvironment',
                'boto3': 'create_environment',
                'cli': 'create-environment'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('elasticbeanstalk', details.requestId),
            'region': region,
            'service': 'elasticbeanstalk',
            'type': 'AWS::ElasticBeanstalk::Environment',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:elasticbeanstalk:elasticbeanstalk.CreateApplicationVersion
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/applications\/versions\?/g)) {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.applicationName;
        reqParams.boto3['VersionLabel'] = jsonRequestBody.versionLabel;
        reqParams.cli['--version-label'] = jsonRequestBody.versionLabel;
        reqParams.boto3['SourceBundle'] = jsonRequestBody.sourceBundle;
        reqParams.cli['--source-bundle'] = jsonRequestBody.sourceBundle;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;

        reqParams.cfn['ApplicationName'] = jsonRequestBody.applicationName;
        reqParams.cfn['SourceBundle'] = jsonRequestBody.sourceBundle;
        reqParams.cfn['Description'] = jsonRequestBody.description;

        outputs.push({
            'region': region,
            'service': 'elasticbeanstalk',
            'method': {
                'api': 'CreateApplicationVersion',
                'boto3': 'create_application_version',
                'cli': 'create-application-version'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('elasticbeanstalk', details.requestId),
            'region': region,
            'service': 'elasticbeanstalk',
            'type': 'AWS::ElasticBeanstalk::ApplicationVersion',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:elasticbeanstalk:elasticbeanstalk.CreateConfigurationTemplate
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/applications\/configurationTemplate\?/g)) {
        reqParams.boto3['ApplicationName'] = jsonRequestBody.applicationName;
        reqParams.cli['--application-name'] = jsonRequestBody.applicationName;
        reqParams.boto3['Description'] = jsonRequestBody.description;
        reqParams.cli['--description'] = jsonRequestBody.description;
        reqParams.boto3['EnvironmentId'] = jsonRequestBody.environmentId;
        reqParams.cli['--environment-id'] = jsonRequestBody.environmentId;
        reqParams.boto3['TemplateName'] = jsonRequestBody.templateName;
        reqParams.cli['--template-name'] = jsonRequestBody.templateName;

        reqParams.cfn['ApplicationName'] = jsonRequestBody.applicationName;
        reqParams.cfn['Description'] = jsonRequestBody.description;
        reqParams.cfn['EnvironmentId'] = jsonRequestBody.environmentId;
        reqParams.cfn['SourceConfiguration'] = {
            'ApplicationName': jsonRequestBody.applicationName,
            'TemplateName': jsonRequestBody.templateName
        };

        outputs.push({
            'region': region,
            'service': 'elasticbeanstalk',
            'method': {
                'api': 'CreateConfigurationTemplate',
                'boto3': 'create_configuration_template',
                'cli': 'create-configuration-template'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('elasticbeanstalk', details.requestId),
            'region': region,
            'service': 'elasticbeanstalk',
            'type': 'AWS::ElasticBeanstalk::ConfigurationTemplate',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:elasticbeanstalk:elasticbeanstalk.DeleteApplicationVersion
    if (details.method == "DELETE" && details.url.match(/.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/applications\/versions\?/g)) {
        reqParams.boto3['ApplicationName'] = getUrlValue(details.url, 'applicationName');
        reqParams.cli['--application-name'] = getUrlValue(details.url, 'applicationName');
        reqParams.boto3['DeleteSourceBundle'] = getUrlValue(details.url, 'deleteSourceBundle');
        reqParams.cli['--delete-source-bundle'] = getUrlValue(details.url, 'deleteSourceBundle');
        reqParams.boto3['VersionLabel'] = getUrlValue(details.url, 'versionLabel');
        reqParams.cli['--version-label'] = getUrlValue(details.url, 'versionLabel');

        outputs.push({
            'region': region,
            'service': 'elasticbeanstalk',
            'method': {
                'api': 'DeleteApplicationVersion',
                'boto3': 'delete_application_version',
                'cli': 'delete-application-version'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:elasticbeanstalk:elasticbeanstalk.DeleteEnvironmentConfiguration
    if (details.method == "DELETE" && details.url.match(/.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/environments\//g)) {
        reqParams.boto3['EnvironmentName'] = /.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/environments\/(.+)\?/g.exec(details.url)[1];
        reqParams.cli['--environment-name'] = /.+console\.aws\.amazon\.com\/elasticbeanstalk\/service\/environments\/(.+)\?/g.exec(details.url)[1];

        outputs.push({
            'region': region,
            'service': 'elasticbeanstalk',
            'method': {
                'api': 'DeleteEnvironmentConfiguration',
                'boto3': 'delete_environment_configuration',
                'cli': 'delete-environment-configuration'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iot:iot.ListThings
    if (details.method == "GET" && details.url.match(/.+console\.aws\.amazon\.com\/iot\/api\/thing\?/g)) {

        outputs.push({
            'region': region,
            'service': 'iot',
            'method': {
                'api': 'ListThings',
                'boto3': 'list_things',
                'cli': 'list-things'
            },
            'options': reqParams,
            'requestDetails': details
        });
        
        return {};
    }

    // autogen:iot:iot.CreateThingType
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iot\/api\/thingType$/g)) {
        reqParams.boto3['ThingTypeName'] = jsonRequestBody.thingTypeName;
        reqParams.cli['--thing-type-name'] = jsonRequestBody.thingTypeName;
        reqParams.boto3['ThingTypeProperties'] = jsonRequestBody.thingTypeProperties;
        reqParams.cli['--thing-type-properties'] = jsonRequestBody.thingTypeProperties;

        outputs.push({
            'region': region,
            'service': 'iot',
            'method': {
                'api': 'CreateThingType',
                'boto3': 'create_thing_type',
                'cli': 'create-thing-type'
            },
            'options': reqParams,
            'requestDetails': details
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

    // autogen:iot:iot.CreateThing
    if (details.method == "POST" && details.url.match(/.+console\.aws\.amazon\.com\/iot\/api\/provision\/thing$/g)) {
        reqParams.boto3['AttributePayload'] = jsonRequestBody.templateBody.Resources.Thing.Properties.AttributePayload;
        reqParams.cli['--attribute-payload'] = jsonRequestBody.templateBody.Resources.Thing.Properties.AttributePayload;
        reqParams.boto3['ThingTypeName'] = jsonRequestBody.templateBody.Resources.Thing.Properties.ThingTypeName;
        reqParams.cli['--thing-type-name'] = jsonRequestBody.templateBody.Resources.Thing.Properties.ThingTypeName;
        reqParams.boto3['ThingName'] = jsonRequestBody.templateBody.Resources.Thing.Properties.ThingName;
        reqParams.cli['--thing-name'] = jsonRequestBody.templateBody.Resources.Thing.Properties.ThingName;

        reqParams.cfn['AttributePayload'] = jsonRequestBody.templateBody.Resources.Thing.Properties.AttributePayload;
        reqParams.cfn['ThingName'] = jsonRequestBody.templateBody.Resources.Thing.Properties.ThingName;

        outputs.push({
            'region': region,
            'service': 'iot',
            'method': {
                'api': 'CreateThing',
                'boto3': 'create_thing',
                'cli': 'create-thing'
            },
            'options': reqParams,
            'requestDetails': details
        });

        tracked_resources.push({
            'logicalId': getResourceName('iot', details.requestId),
            'region': region,
            'service': 'iot',
            'type': 'AWS::IoT::Thing',
            'options': reqParams,
            'requestDetails': details,
            'was_blocked': blocking
        });

        if (blocking) {
            notifyBlocked();
            return {cancel: true};
        }
        
        return {};
    }

}
