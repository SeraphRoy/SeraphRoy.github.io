---
layout: post
title: "SDN Introduction"
date: 2017-06-08 16:48
categories: SDN Cloud
tags: SDN Cloud
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## Software Defined Networking and The Cloud

Cloud computing (as it is defined today) depends on the ability to provision an IP network that reaches all of the resources a user wishes to employ. The challenge, however, is that this network must be provisioned and ultimately deprovisioned (decommissioned) dynamically and the "normal" IP management protocols were not designed for dynamic reconfiguration. The main goals for IP, when it was designed, were routing robustness and delivery determinism (including reliable delivery). Because latencies were so high and connectivity to intermittent, the protocols were designed to react slowly so that transient changes in the network did not cause instability.

Fiber-based networks (which are more reliable, lower latency and higher bandwidth than wire networks) introduced the possibility of implementing dynamic network reconfiguration without sacrificing network stability. In particular, it became possible to use table-driven forwarding rules at the link level.

Before this time, IP defined network routes at layer 3 -- the network routing level. Link level protocols were "stateless" in that they need only manage the transfer of data between two fixed end points. The "state" defining the end points doesn't change (or it can be rebuilt using a broadcast via ARP). Thus all information pertaining to a route that data must take as it traverses the network was originally confined to Layer 3\. This information is managed in a per-hop "routing table" that indicates the point-to-point network link that data must take to make its next hop.

With ATM and SONET, however, table-driven link-level protocols made it possible for an abstract "network link" to be implemented as a routed "path" across intermediate link nodes. These original technology-specific protocols eventually informed a standard for such link-level state management called [MPLS](http://en.wikipedia.org/wiki/Multiprotocol_Label_Switching).

<!--more-->

## OpenFlow

Like most techniques in networking, the idea of manipulating layer 2 network state is not unique. MPLS defines "label based routing" as a methodology for doing a table look up in the switch to determine where a packet is going based on a tag (or label) in the packet. Since it is a layer 2 protocol, it can (and usually does) rewrite the tag before the packet egresses based on the "path" through the layer 2 network that the packet needs to take (the table specifies the output port and the next tag).

Turns out that "normal" IP network switches implement some of this functionality as well. First, it is important to understand the difference between a router and a switch.

*   **router**: examines the destination address of a packet and determines the next link to use for the packet. Morally, all Linux systems are routers since they implement Layer 3 routing although the next link is often either the transport layer (if the packet is inbound and addressed to the host) or some network interface to which the host is connected (for outbound packets).
*   **switch**: examines the destination address in a layer 2 packet (called a MAC address) and determines the next port to which the packet should be sent.

If you stare at these two definitions for a minute you still might come away thinking that a router and a switch dot he same thing: route inbound packets to an outbound interface based on destination address. From an engineering perspective this conceptual similarity is accurate. However, architecturally they are different.

For IP, a _router_ must implement a "longest-prefix-match" algorithm to determine the outbound network interface. IP addresses come in classes and, of course, IP address ranges can be subnetted. Thus the job of the router is to find the "best" (longest) match between prefixes in its routing tables and the destination address. Indeed, the original motivation for MPLS and its predecessors was that longest-prefix-match was too complex to implement in an ASIC. Today's routers use more complex ASICs and do the routing entirely in hardware, but originally, routing was a software activity.

A switch does not implement hierarchical addressing. In fact, originally (and for so called "dumb" switches today) there was no table look up at layer 2\. In a switch, a packet that came in on a port was sent unceremoniously to all other ports. Since the switch was stateless, it couldn't "know" which outbound port a packet should use so it simply sent it to all of them.

_Managed Switches_, however, are smarter (and more scalable) than their dumb counter parts. They pay attention to ARP broadcasts and record MAC address-port mappings in forwarding tables. Because the MAC address is not hierarchical (it is strictly point to point), a switch need not implement longest-prefix-match and thus the table management is very fast and cheap to implement in hardware.

Switch tables are managed internally using only local information. That is, because a switch is theoretically between two end points of a link, it need not consult with other switches when it builds its tables (say to avoid routing loops). However, it wasn't long before network architects discovered that manipulating these tables via a control interface could prove useful (say because a spanning tree algorithm was malfunctioning).

[OpenFlow](http://en.wikipedia.org/wiki/OpenFlow) is a standard control protocol for managing forwarding table information at layer 2\. Instead of allowing the internal switch logic to build and rebuild its tables, OpenFlow specifies that each switch has a controller (one controller can serve many switches) that is responsible for managing the switches tables.

The advantage of OpenFlow is that the controller is programmable meaning that it can implement policies that determine what table updates to send the switches it controls. For example, it is possible to implement Access Control Lists for MAC address forwarding that change dynamically. The model is that a switch will forward packets using its hardware and tables if there is a table match. If there is not, it will contact the controller and ask for a table entry for the packet. Thus, by keeping an ACL and invalidating switch tables when it changes, an OpenFlow controller can implement policy in the layer 2 path.

The disadvantage of this approach is that the controller's logic (at least some portion of it) may need to be executed while the packet is in flight. Unless pre-computed tables are loaded into the switches, the typical interaction is for a packet is to contact the controller the first time it sees a packet with a MAC address it doesn't recognize (i.e. for which there is no table entry) to get a table entry. This table initialization address a performance overhead to the initial packet reception since the controller is a software entity and may be remote from the switch.

Another perceived disadvantage of OpenFlow is the possibility for layer 2 network chaos. Switch table entries are no longer strictly based on local information. If all switches are controlled by a single controller, the controller can keep the tables consistent, but in a scaled network setting, controllers may need to agree on policies to prevent loops, partitions, etc. Great care must be taken if this agreement is not transactional.

## SDN

An this point in the cloud SDN story, some debate has arisen. Some proponents of SDN believe that OpenFlow is software defined networking. That is, using policies specified in software run by the OpenFlow controllers, it is possible to provision and decommission virtual networks (based on ACLs that are installed dynamically) linking together cloud resources. Others maintain that OpenFlow is merely an interface through which other SDN services implement policy.

The basis for this latter argument is in the notion that once switch behavior can be programmed, it is possible to implement different isolated network architectures over the same physical hardware. To see why this architectural control is important, consider the problem of provisioning a network for a set of VM's in a cloud. For the purposes of illustration, I'll use the AWS nomenclature in the following example.

Recall that when a user creates one or more instances they are assigned to a security group that corresponds to an isolated layer 3 and layer 2 network between the VMs. If there is just one VM, it is the only host in the security group. The security group also specifies firewall rules that describe layer 3 routing into and out of the group. All VMs inside the group communicate as if the network were physically dedicated to them.

Using "normal" networking protocols (i.e. without OpenFlow and/or SDN) creating a security group involves the following steps:

*   Create an isolated layer 2 network that the hosts running the VMs can access.
*   In a layer 3 router that is also on this isolated layer 2 network, create and install a layer 3 routing table entry that forwards packets traversing the security group boundary to a firewall.
*   Create and install firewall rules that describe access controls for the security group.
*   Attach the VMs at their respective hosts to the layer 2 network.
*   Set the default routes in the VMs to the router with the routing tables for the security group.

Depending on the networking equipment that is used to connect the VMs to the router and the router to the firewall, there are several implementation options available. The easiest and most compatible with standard off-the-shelf networking components using VLAN truncking between the hosts running the VMs and the router. Each security group corresponds to a separate VLAN. Hosts must be able to pass packets tagged with different VLANs and must also be responsible for ensuring that VLAN-tagged packets are delivered only to the correctly specified VM. The router must also be trunked and must logically sit on all VLANs. That takes care of layer 2\.

For layer 3, each security group gets its own subnet. The router must allow the cloud to install and remove layer 3 routes corresponding to different subnets as security groups are created and destroyed.

With SDN, however, it is possible to define these functions in terms of a new network architecture. Rather than defining a relationship between security groups, VLANs, and IP routes, the SDN-controlled network can define "roles" for different programmable components (presumably using a combination of open flow and layer 3 route control) in the network.

For example, it is possible to build a layer 3 network between VMs that does not use an intermediate router. Instead, each host becomes an "edge router" that can send packets to a layer 2 network that sets up secure "circuits" between edge routers. In this model, each host hosting a VM maintains a routing table entry for the security group that correspond to a network or subnet. The layer 2 network, then, accepts commands from the cloud to set up a set of virtual circuits (implemented using switch forwarding tables) between all pairs of hosts participating in a security group. When a VM routes a packet, it goes to the host first (to make sure the VM isn't spoofing its layer 3 address) and then the host forwards the packet to the layer 2 circuit switch.

The advantage of this approach is that there need not be a centralized router that is programmed with routing table entries. The disadvantage is that the layer 3 edge routers and the virtual circuit set up and tear down must be coordinated.

## Thoughts on SDN and Cloud

For the purposes of cloud computing it is not clear whether one approach is significantly more powerful than the other. Indeed, it is possible to implement edge routers using standard networks and Linux machines. It is also possible to implement layer 2/layer 3 provisioning using a router and VLANs with SDN.

However, the proponents of SDN point out that architecturally the cloud is implementing a limited form of software defined networking when it provisions security groups. There is a controller (the cloud) that implements policy (isolated layer 2/layer 3 network and firewall rules) using programmable network devices (hosts for VLANs, router, and firewall device). They reason that these activities are independent of cloud computing (cloud computing is a special case) and thus should be implemented as their own service that the cloud uses.

The scalability of the approach is also an argument that gets made although far less convincingly. Many SDN papers hypothesize a new hierarchical separation of concerns for The Internet. The reasoning is that the current approach relies on a consistent set of layer 2/3 protocols **everywhere** the Internet is to go. If The Internet were designed as a common set of "core" protocols (say the current IP protocols) and edge routers that can tunnel new protocols through the core, innovations in networking will be possible. It is true that an overlay approach using tunnels is more flexible. The feature of The Internet that is most compelling, however, is its ability to remain stable at a global scale. It is not at all clear that the additional flexibility offered by SDN will scale to Internet sizes.
