# Yep, it's a code generator for the code generator :)

import sys, inspect
import pkgutil, pprint, json

import troposphere

print("Manual Actions:\n")

__all__ = []
for loader, module_name, is_pkg in  pkgutil.walk_packages(troposphere.__path__):
    if module_name != "dynamodb2":
        __all__.append('troposphere.' + module_name)
        _module = loader.find_module('troposphere.' + module_name).load_module('troposphere.' + module_name)
        globals()[module_name] = _module

        clsmembers = inspect.getmembers(sys.modules['troposphere.' + module_name], inspect.isclass)

        for name, clstype in clsmembers:
            if hasattr(clstype, 'resource_type'):
                if clstype.resource_type.startswith("AWS::"):
                        if clstype.resource_type.split("::")[1].lower() != module_name:
                            print(clstype.resource_type + " -> module name should be mapped to: " + module_name)
                        if clstype.resource_type.split("::")[2] != name:
                            print(clstype.resource_type + " isn't -> AWS::" + module_name + "::" + name)
                else:
                    print("Non-standard type in " + module_name + " -> " + clstype.resource_type)
        
#####
print("\n#############\n")
#####

fulloutputmap = {}

# Arbituary list mappings
arbituary_list_mappings = {
    'autoscaling.AutoScalingGroup:AvailabilityZones': False,
    'autoscaling.AutoScalingGroup:LoadBalancerNames': False,
    'autoscaling.AutoScalingGroup:VPCZoneIdentifier': False,
    'autoscaling.LaunchConfiguration:BlockDeviceMappings': 'BlockDeviceMapping',
    'autoscaling.LaunchConfiguration:SecurityGroups': False,
    'autoscaling.MetricsCollection:Metrics': False,
    'autoscaling.NotificationConfigurations:NotificationTypes': False,
    'autoscaling.Trigger:Dimensions': False,
    'awslambda.VPCConfig:SecurityGroupIds': False,
    'awslambda.VPCConfig:SubnetIds': False,
    'cloudformation.InitService:files': False,
    'cloudformation.InitService:sources': False,
    'cloudformation.InitService:commands': False,
    'cloudfront.DefaultCacheBehavior:TrustedSigners': False,
    'cloudfront.DistributionConfig:Aliases': False,
    'cloudfront.DistributionConfig:Origins': 'Origin',
    'ec2.DHCPOptions:DomainNameServers': False,
    'ec2.DHCPOptions:NetbiosNameServers': False,
    'ec2.DHCPOptions:NtpServers': False,
    'ec2.Instance:BlockDeviceMappings': 'BlockDeviceMapping',
    'ec2.Instance:SecurityGroupIds': False,
    'ec2.Instance:SecurityGroups': False,
    'ec2.Instance:Volumes': 'MountPoint',
    'ec2.LaunchTemplateData:SecurityGroups': False,
    'ec2.LaunchTemplateData:SecurityGroupIds': False,
    'ec2.NetworkInterface:GroupSet': False,
    'ec2.SecurityGroup:SecurityGroupEgress': 'SecurityGroupRule',
    'ec2.SecurityGroup:SecurityGroupIngress': 'SecurityGroupRule',
    'ecs.AwsvpcConfiguration:SecurityGroups': False,
    'ecs.AwsvpcConfiguration:Subnets': False,
    'elasticache.ReplicationGroup:NodeGroupConfiguration': 'NodeGroupConfiguration',
    'elasticache.SubnetGroup:SubnetIds': False,
    'elasticloadbalancing.Listener:PolicyNames': False,
    'elasticloadbalancing.LoadBalancer:AppCookieStickinessPolicy': 'AppCookieStickinessPolicy',
    'elasticloadbalancing.LoadBalancer:AvailabilityZones': False,
    'elasticloadbalancing.LoadBalancer:Instances': False,
    'elasticloadbalancing.LoadBalancer:LBCookieStickinessPolicy': 'LBCookieStickinessPolicy',
    'elasticloadbalancing.LoadBalancer:Listeners': 'Listener',
    'elasticloadbalancing.LoadBalancer:Policies': 'Policy',
    'elasticloadbalancing.LoadBalancer:SecurityGroups': False,
    'elasticloadbalancing.LoadBalancer:Subnets': False,
    'elasticloadbalancing.Policy:InstancePorts': False,
    'elasticloadbalancing.Policy:LoadBalancerPorts': False,
    'elasticloadbalancingv2.LoadBalancer:SecurityGroups': False,
    'elasticloadbalancingv2.LoadBalancer:Subnets': False,
    'iam.InstanceProfile:Roles': False,
    'iam.UserToGroupAddition:Users': False,
    'rds.DBInstance:DBSecurityGroups': False,
    'rds.DBSecurityGroup:DBSecurityGroupIngress': 'RDSSecurityGroup',
    'rds.DBSubnetGroup:SubnetIds': False,
    'redshift.Cluster:ClusterSecurityGroups': False,
    'redshift.Cluster:VpcSecurityGroupIds': False,
    'redshift.ClusterSubnetGroup:SubnetIds': False,
    'route53.BaseRecordSet:ResourceRecords': False,
    'route53.RecordSet:ResourceRecords': False,
    'route53.RecordSetGroup:RecordSets': 'RecordSet',
    'route53.RecordSetType:ResourceRecords': False,
    'serverless.S3Event:Events': False,
    'serverless.VPCConfig:SecurityGroupIds': False,
    'serverless.VPCConfig:SubnetIds': False,
    'sns.TopicPolicy:Topics': False,
    'sqs.QueuePolicy:Queues': False,
    'template_generator.Parameter:AllowedValues': False
}

for loader, module_name, is_pkg in  pkgutil.walk_packages(troposphere.__path__):
    if module_name != "dynamodb2":
        clsmembers = inspect.getmembers(sys.modules['troposphere.' + module_name], inspect.isclass)

        outputmap = {}

        for name, clstype in clsmembers:
            if hasattr(clstype, 'props'):
                for k,v in clstype.props.items():
                    if isinstance(v[0], list):
                        if hasattr(v[0][0], '__module__'):
                            if v[0][0].__module__.startswith("troposphere." + module_name):
                                if v[0][0].__name__[0] == v[0][0].__name__[0].upper():
                                    if hasattr(clstype, 'resource_type') and clstype.resource_type.startswith("AWS::"):
                                        outputmap[module_name + "." + k] = v[0][0].__name__
                                    else:
                                        outputmap[name + "." + k] = v[0][0].__name__
                                    #print(module_name + "." + k + " = list of : " + str("{0}.{1}".format(v[0][0].__module__,v[0][0].__name__)))
                    elif v[0] == list:
                        if module_name + "." + name + ":" + k in arbituary_list_mappings.keys():
                            if arbituary_list_mappings[module_name + "." + name + ":" + k]:
                                outputmap[module_name + "." + k] = arbituary_list_mappings[module_name + "." + name + ":" + k]
                        else:
                            print("Unknown arbituary list: " + module_name + "." + name + ":" + k)
                    else:
                        if hasattr(v[0], '__module__'):
                            if v[0].__module__.startswith("troposphere." + module_name):
                                if v[0].__name__[0] == v[0].__name__[0].upper():
                                    if hasattr(clstype, 'resource_type') and clstype.resource_type.startswith("AWS::"):
                                        outputmap[module_name + "." + k] = v[0].__name__
                                    else:
                                        outputmap[name + "." + k] = v[0].__name__
                                    #print(module_name + "." + k + " = " + "{0}.{1}".format(v[0].__module__,v[0].__name__))

        for i in range(5):
            for k,v in outputmap.copy().items():
                if k[0] == k[0].upper():
                    findclass = k.split(".")[0]
                    for k2,v2 in outputmap.copy().items():
                        if v2 == findclass:
                            try:
                                del outputmap[k]
                                outputmap[k2 + "." + k.split(".")[1]] = v
                            except:
                                pass

        # Exceptions - should still resolve with partial
        for k,v in outputmap.copy().items():
            if k[0] == k[0].upper():
                print("Cannot resolve full path for property in " + module_name + ": " + k)

        fulloutputmap = {**outputmap, **fulloutputmap}

print("\n#####\n")

print(json.dumps(fulloutputmap, indent=4, sort_keys=True))
