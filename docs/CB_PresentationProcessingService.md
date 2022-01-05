# Cookbook: Presentation Processing Service (PPS)

<a href="https://stromdao.de/" target="_blank" title="STROMDAO - Digital Energy Infrastructure"><img src="../static/stromdao.png" align="right" height="85px" hspace="30px" vspace="30px"></a>

If a presentation is received a Presentation Processing Service might be called to process its content and derive further activity.

The strength of Node-RED is to process events and route them. However general CRUD operations or even business processes sometimes get hard to model out. This is the place where a PPS steps in.  It takes presented data and decorates it with whatever is needed to continue with the original flow without having to implement all the processing there. Usage of PPS allows separating key management and SmartContractTX related functions with business rules of another domain or entity.

In general, the PPS is a micro-service interface that listens to HTTP-POST requests coming from a SmartContractTX. The SmartContractTX will include a JWT-DID signed by itself in the request body in a field called `jwt`. By doing this the micro-service could ensure the origin sending node (SmartContractTX) and integrity of the data.  

## Use Case

TicketA is an agent for event tickets. Alice wants to visit a particular event and needs a ticket. She sends a presentation with the order intent to TicketA where a PresentationProcessingService is used to assign the ticket Alice for the event and provides a presentation back to Alice.

### Step 1: Create Intent

Add a SmartContractTX Node for Alice. If not setup, create a Connection, Contract, DID Resolver without any particular configuration (leave default settings).

![Sample Output](../static/cb_pps_1.png)

Add an Inject Node which provides as `msg.payload` a JSON Object:

```Javascript
{
    "presentation": {
        "event": "Mega Concert"
    }
}
```

![Sample Output](../static/cb_pps_2.png)

You might add a Debug-Node to the third Output of Alice to quickly test the result.

Flow: https://gist.github.com/zoernert/b388a58d3b1e16bf6504f478e1e3dbe2

If you click now on the Inject button you will see a JWT in the Debug Console. You might quickly check its content using [jwt.io](https://jwt.io).

### Step 2: Add TicketA Node

As the Buy Ticket Intent should be processed by TicketA we will create a second SmartContractTX Node for TicketA and wire the third output of Alice with the Input of it. The configuration settings of this SmartContractTX Node are again all default.

![Sample Output](../static/cb_pps_3.png)

You might add a Debug-Node to the fourth Output of TicketA to see the effect of the PPS later.

### Step 3: Implement PPS  

In the real world, you would not do this in Node-RED and we will only do a kind of a mock-up to illustrate the usage of a PPS. So what our PPS will do is count the number of tickets sold per event and provide the sequence number (counter) and the owner (here Alice) back in its result.

As a PPS receives an HTTP-Post call, we use a `http-in` Node and configure it:

![Sample Output](../static/cb_pps_4.png)

The output of this node gets wired to the input of a new SmartContractTX for the PPS. We use this to not have to care about all the ID or JWT related stuff.

Set our PPS Service (it should listen on `http://localhost:1880/eventPPS`) in TicketA node.

![Sample Output](../static/cb_pps_5.png)

Flow: https://gist.github.com/zoernert/c444b15c918f07dfb2bde0cb3b2e86dc

If you do a test run, you might quickly figure out that only the Debug node attached to the PPS produces an output. This is because our PPS does not return anything at the moment.

### Step 4: Business Process

As mentioned previously this is a stupid a hell function.

```Javascript
let visitorsCount = flow.get(msg.payload.presentation.event.replace(' ','_'));

if((typeof visitorsCount == 'undefined') || (visitorsCount == null)) visitorsCount=0;

visitorsCount++;

flow.set(msg.payload.presentation.event.replace(' ','_'),visitorsCount);

msg.payload = {
    presentation: {
        ticketForId:msg.payload.presentation._issuer,
        visitorNo:visitorsCount
    }
}
return msg;
```

Finally add an HTTP-Out Responds and connect it to the output of our function.

![Sample Output](../static/cb_pps_6.png)

This is nice! But we want a ticket to forward to Alice. In order to do this, we could trigger an action on the `TicketA` SmartContractTX node that it generates a new presentation to forward to Alice as a receipt.

### Step 5: Event Ticket as Decentralised Identity / Verifiable Presentation

Modify the msg.payload of the function to add an action:

```Javascript
...
msg.payload = {
    _action: 'inject',
    presentation: {
        ticketForId:msg.payload.presentation._issuer,
        visitorNo:visitorsCount
    }
}
...
```

This will trigger an internal step of the SmartContractTX to handle the PPS responds as a new message. As it is a message as we used it in the first step, a new presentation (JWT/DID) will be issued signed with the key of TicketA.

![Sample Output](../static/cb_pps_7.png)

Flow: https://gist.github.com/zoernert/5cf058d1d79ad332c236a10b39240735

## Conslusion

As a result of the Ticket-Buy-Intent a digitaly signed ticket is waved. It is in JWT format and looks like:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE2NDEzOTE3NjAsInByZXNlbnRhdGlvbiI6eyJ0aWNrZXRGb3JJZCI6ImRpZDpldGhyOjB4MDI3YTQ2MmIyN2Q1MWRkYzZkZDZjMzc1ZmU0MDZmNzI4NzU1NmY2ZjUwZjg5N2E0MDBlNmMyMjFkMmUyYTJjMmFhIiwidmlzaXRvck5vIjoxNn0sImlzcyI6ImRpZDpldGhyOjB4MDIxMjQ4NDZkMzYxN2QyZjI3NzY3ZjEwNDc4YjY0OGM0YTNkZWVkYmQ3ZGZjNWZkMWJmZjEzN2Q0NTY3NmY5ZTg1In0.hf5Mw_MnYBCDNSHKWxC6pHGU98SLXmjnSTjVyBXgqt6MphXzgPcqKyIMjfm4hdeRIpYqYKcEOwoPxDwnzj9ZSwA
```

It ensures that the ownership (=Alices Identity) and the issuers ownership (=TicketA). So the person checking the ticket at the concert could digitaly check that it is a valid ticket and allow entry to Alice.
