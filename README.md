# Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)
This repository contains a PoC implemented with [Keycloak](https://www.keycloak.org/) integrated with [OpenFGA](https://openfga.dev/) on demostrating how to apply fine-grained access (FGA) control in a high performance and flexible authorization.

In this version of the PoC we have a direct integration between the Access Manager platform and the OpenFGA solution thanks to the use of the [OpenFGA Java SDK](https://github.com/openfga/java-sdk) to publish the events.

This workshop is based the following article [Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)](https://embesozzi.medium.com/keycloak-integration-with-openfga-based-on-zanzibar-for-fine-grained-authorization-at-scale-d3376de00f9a). You will find there full details about the authorization architecture guidelines and involved components.

In the new version 🔥, I aimed to continue improving the authorization architecture and provide an agnostic approach for exposing and protecting APIs following best practices such as Policy as Code (PaC), decoupling authorization, and low-code authorization. Therefore, I added an identity-aware API gateway, Apache APISIX, as an API sidecar to the authorization architecture to enforce authorization and decouple it from the backend. The gateway uses a plugin I developed called [authz-openfga](https://github.com/embesozzi/apisix-authz-openfga) that supports Relationship-Based Access Control (ReBAC) policies because it's integrated with OpenFGA platform. The details are explained in the following article [Mastering Access Control: Implementing Low-Code Authorization Based on ReBAC and Decoupling Pattern](https://medium.com/@embesozzi/mastering-access-control-implementing-low-code-authorization-based-on-rebac-and-decoupling-pattern-f6f54f70115e).

## Authorization Framework (New)

The following diagram illustrates the solution architecture of this workshop:

<p align="center">
  <img width="90%" height="90%" src="doc/images/workshop-docker-environment.png">
</p>

* Core:
    * Keycloak is responsible for handling the authentication with the standard OpenID Connect and manages user access with its Role Model.
    * Keycloak is configured with a new custom extension ❤️: [keycloak-openfga-event-publisher](https://github.com/embesozzi/keycloak-openfga-event-publisher)
      * Listens to the Keycloak events (User Role Assignment, Role to Role Assignment, etc).
      * Parses this event into an OpenFGA tuple key based on the [Keycloak Authorization Schema](model.dsl).
      * Publishes them to OpenFGA over HTTP using the [OpenFGA Java SDK](https://github.com/openfga/java-sdk).
    * OpenFGA is responsible for applying fine-grained access control. The OpenFGA service answers authorization checks by determining whether a relationship exists between an object and a user.
* Other components
    * Store Web Application is integrated with Keycloak by OpenID Connect
    * Store Authorization Gateway exposes and protects the Store API with ReBAC policies integrated with the OpenFGA Platform (Protection at API Gateway)🔥.

You can also have Store OpenFGA API is protected by OAuth 2.0 and it utilizes the OpenFGA SDK for FGA as example (Protection at API Level).


Another cool feature of custom extension is its capability to discover the OpenFGA authorization model and determine which events are handled. This gives you the flexibility to choose your authorization model, whether it’s RBAC, GBAC, or both 🙌.

# How to install?
## Prerequisites

 * Install Git, [Docker](https://www.docker.com/get-docker) and [Docker Compose](https://docs.docker.com/compose/install/#install-compose) in order to run the steps provided in the next section<br>

## Deploy the PoC

1. Clone this repository
    ````bash
    git clone https://github.com/embesozzi/keycloak-openfga-workshop
    cd keycloak-openfga-workshop
    ````

2. Execute following Docker Compose command to start the deployment

   ```sh
   docker-compose -f docker-compose.yml -f docker-compose-apps.yml -f docker-compose-openfga.yml -f docker-compose-import.yml up
   ```

3. To be able to use this environment, you need to add this line to your local HOSTS file:

   ```sh
   127.0.0.1  keycloak openfga store store-openfga-api store-authz-gateway
   ```

4. Access the following web UIs using URLs bellow via a web browser.

    | Component                 |  URI                          |  Credential               | Image     |
    | ------------------------- |:-----------------------------:|:-------------------------:|:-----------:
    | Keycloak Console          |   http://keycloak:8081        |  admin / password         | quay.io/keycloak/keycloak:25.0.1 |
    | OpenFGA Playground        |   http://localhost:3000/playground  |                     | openfga/openfga:v1.5.5           | 
    | Store Portal              |   http://store:9090           |                           | Custom image                   |
     | Store Authorization Gateway              |   http://store-authz-gateway:9080           |                           | Custom image based Apache APISIX Gateway                   |
    | Store OpenFGA API                 |   http://store-openfga:9091       |                           | Custom image                   |

## Review configuration (optional)

>
> In this new version of the workshop, we automatically import all the required configurations into the Keycloak and OpenFGA platforms 😄 🪄
>
### Keycloak Platform
- You will find that the OpenFGA Event Listener 'openfga-events-publisher' extension in Keycloak is enabled.

    * [Administration console](http://keycloak:8081) > Realm settings > `openfga-events-publisher`   

    <img src="doc/images/kc-admin-events.png" width="80%" height="80%">

- The following roles and demo users have already been created in Keycloak.

    ![users](doc/images/users.png)

    The password for all the users is `demo1234!`

### OpenFGA Platform
- You will see the following OpenFGA Authorization Model in the [OpenFGA Playground Console](http://localhost:3000/playground) and the Tuples tab:

  <img src="doc/images/openfga-tuples.png" width="80%" height="80%">

- Once the workshop is deployed, the Keycloak OpenFGA Event Publisher extension proceeds to send these events over HTTP to the OpenFGA solution. Here, all tuples are stored.

    | User                      |  Relation                     |  Object               | 
    | ------------------------- |:-----------------------------:|:---------------------:|
    | role:admin-catalog        |   parent                      |  role:view-product    |
    | role:analyst-catalog      |   parent                      |  role:view-product    |
    | role:admin-catalog        |   parent                      |  role:edit-product    |
    | user:paula                |   assignee                    |  role:analyst-catalog |
    | user:richard              |   assignee                    |  role:admin-catalog   |


    The users are identified by the value of the claim sub.

## Test cases
As an example, we will implement an Product Catalog web application that has the following requirements:
* Only authenticated user can access to the application
* Product can be viewed by their Analyst
* Product can be edited by their Admin
* Global Admin users can view or edit any Product

You can follow the test cases described in the [Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)](https://embesozzi.medium.com/keycloak-integration-with-openfga-based-on-zanzibar-for-fine-grained-authorization-at-scale-d3376de00f9a).

And the article [Mastering Access Control: Implementing Low-Code Authorization Based on ReBAC and Decoupling Pattern](https://medium.com/@embesozzi/mastering-access-control-implementing-low-code-authorization-based-on-rebac-and-decoupling-pattern-f6f54f70115e).

Nevertheless, the use cases are detailed below:

### Use case 1: Access to the Store for managing products as an Analyst (Paula)

1. Access to the [store web application](http://store:9090) store web application and proceed to login with Paula (paula / demo1234!) in Keycloak.
    
    <img src="doc/images/tc-store-login.png" width="80%" height="80%">

2. Keycloak will return the id_token and the access token to the application

3. The Store web application will show the product catalog

    3.1. The app will call the product API sending the access token in the Authorization header

    3.2. The API will apply the following steps:

    3.3. It will validate the token following the OAuth 2.0 standard and it will extract the claim sub to identify the user

    3.4. Then it will call the OpenFGA API to check if the user has the view-product role with the relationship assignee

    3.5. OpenFGA will return the response “allowed”

    3.6. The API will return the product information and the Store web app will show the product catalog to the user
    
    <img src="doc/images/tc1-view-products-success.png" width="80%" height="80%">

4. Try to publish a product by clicking the button "Publish" but you will see that Paula is not allowed

    4.1. The app will call the product API sending the access token in the Authorization header

    4.2. The API will apply the following steps:

    4.3. It will validate the token following the OAuth 2.0 standard and it will extract the claim sub to identify the user

    4.4. Then it will call the OpenFGA API to check if the user has the edit-product role with the relationship assignee

    4.5. OpenFGA will return the response “denied”

    <img src="doc/images/tc1-publish-product-denied.png" width="80%" height="80%">    

### Use case 2: Access to the Store for managing products as an Admin (Richard)

1. Access to the [store web application](http://store:9090) store web application and proceed to login with Richard (richard / demo1234!) in Keycloak.
    
    <img src="doc/images/tc-store-login.png" width="80%" height="80%">

2. Keycloak will return the id_token and the access token to the application

3. The store web application will show the product catalog

    <img src="doc/images/tc-2-view-products-success.png" width="80%" height="80%">

4. Try to publish a product by clicking the button "Publish" but you will see that Richard is allowed

    <img src="doc/images/tc-2-publish-product-success.png" width="80%" height="80%">


### Use case 3:  Access to the Store for managing products as an Regular User (Peter)

1. Access to the [store web application](http://store:9090) store web application and proceed to login with Peter (peter / demo1234!) in Keycloak.
    
    <img src="doc/images/tc-store-login.png" width="80%" height="80%">

2. Keycloak will return the id_token and the access token to the application

3. The store web application will try to the products show but the user is not allowed

    <img src="doc/images/tc-3-view-products-denied.png" width="80%" height="80%">
