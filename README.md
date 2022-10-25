# Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)
This repository contains a PoC implemented with [Keycloak](https://www.keycloak.org/) integrated with [OpenFGA](https://openfga.dev/) on demostrating how to apply fine-grained access control in a high performance and flexible authorization.

This workshop is based the following article [Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)](https://embesozzi.medium.com/keycloak-integration-with-openfga-based-on-zanzibar-for-fine-grained-authorization-at-scale-d3376de00f9a). You will find there full details about the authorization architecture guidelines and involved components.


## Authorization Framework

The following diagram illustrates the solution architecture of this workshop:

<p align="center">
  <img width="70%" height="70%" src="doc/images/solution-architecture.png">
</p>

* Core:

    * Keycloak (A) is responsible for handling the authentication with the standard OpenID Connect and is managing the user access with his Role Model

    * Keycloak is configure with a custom extension (B) [keycloak-openfga-event-listener](https://github.com/embesozzi/keycloak-openfga-event-listener) which listens to the Keycloak events (User Role Assignment, Role to Role Assignment, etc), parses this event into an OpenFGA tuple based on the [Keycloak Authz Schema](openfga/keycloak-authorization-model.json) and publishes the event to Kakfa Cluster (C)

    * Kakfa OpenFGA Consumer (D) that using the OpenFGA SDK will publish the tuples to the OpenFGA Solution

    * OpenFGA (E) is responsible for applying fine-grained access control. The OpenFGA service answers authorization checks by determining whether a relationship exists between an object and a user

* Other components

    * Store Web Application is integrated with Keycloak by OpenID Connect

    * Store API is protected by OAuth 2.0 and it utilizes the OpenFGA SDK for FGA

So far we don’t have an official Java SDK OpenFGA client to publish the authorization tuples. This is why I decided to use an Apache Kafka cluster for managing the events. Nevertheless, the extension is prepared for the future to use an http client for publishing the events.

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
   docker-compose -f docker-compose.yml -f docker-compose-apps.yml up
   ```

3. To be able to use this environment, you need to add this line to your local HOSTS file:

   ```sh
   127.0.0.1  keycloak openfga store store-api
   ```

4. Access the following web UIs using URLs bellow via a web browser.

    | Component                 |  URI                          |  Username   | Password    |  Image     |
    | ------------------------- |:-----------------------------:|:-----------:|:-----------:|:-----------:
    | Keycloak Console          |   http://keycloak:8081        |  admin      |  password   | quay.io/keycloak/keycloak:19.0.2 |
    | OpenFGA Playground        |   http://localhost:3000       |             |             | openfga/openfga:latest           | 
    | OpenFGA API               |   http://localhost:8080       |             |             | confluentinc/cp-zookeeper:7.2.2<br />confluentinc/cp-kafka:7.2.2|
    | Store Portal              |   http://store:9090           |             |             | Custom image                   |
    | Store API                 |   http://store-api:9091       |             |             | Custom image                   |


## Post configuration steps

### OpenFGA
1. Import the [OpenFGA authorization schema for Keycloak](openfga/keycloak-authorization-model.json):
    ```bash
    cd openfga
    ./import.sh
    ```
2. As the result you will see the following OpenFGA Authorization Model in the [OpenFGA Playground Console](http://localhost:8080) :

    ![openfga-keycloak-authorization-model](doc/images/openfga-authz-model.png)

### Keycloak
1. Enable the Keycloak OpenFGA Event Listener extension in Keycloak:

    * Open [administration console](http://keycloak:8081)
    * Choose realm
    * Realm settings
    * Select `Events` tab and add `openfga-events` to Event Listeners.

    <img src="doc/images/kc-admin-events.png" width="80%" height="80%">

2. Proceed to initialize the PoC:

    Execute the following [script](keycloak/initialize-poc.sh) to initialize the PoC:

    ```bash
    docker exec keycloak /bin/bash /opt/keycloak/initialize-poc.sh
    ```

    This script will create the OAuth Clients and the following Users and Role Model:

    ![users](doc/images/users.png)

    The password for all the users is `demo1234!`

    Once these steps are finished, the Keycloak OpenFGA Event Listener extension has to proceed to publish these events to the Kafka topic called “openfga-topic”. Then, the Kafka consumer has published those events to the OpenGFA store using the SDK. Here are all tuples stored.

    | User                      |  Relation                     |  Object               | 
    | ------------------------- |:-----------------------------:|:---------------------:|
    | role:admin-catalog        |   parent                      |  role:view-product    |
    | group:global-admin        |   parent_group                |  role:admin-catalog   |
    | role:analyst-catalog      |   parent                      |  role:view-product    |
    | role:admin-catalog        |   parent                      |  role:view-product    |
    | role:admin-catalog        |   parent                      |  role:edit-product    |
    | paula                     |   assignee                    |  role:analyst-catalog |
    | richard                   |   assignee                    |  role:admin-catalog   |


3. Restart the apps (containers: `store-oidc-app` and `store-openfga-api`)

## Test cases
As an example, we will implement an Product Catalog web application that has the following requirements:
* Only authenticated user with MFA can access to the application
* Product can be viewed by their Analyst
* Product can be edited by their Admin
* Global Admin users can view or edit any Product

You can follow the test cases described in the [Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)](https://embesozzi.medium.com/keycloak-integration-with-openfga-based-on-zanzibar-for-fine-grained-authorization-at-scale-d3376de00f9a).