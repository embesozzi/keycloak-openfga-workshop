# Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)
This repository contains a PoC implemented with [Keycloak](https://www.keycloak.org/) integrated with [OpenFGA](https://openfga.dev/) on demostrating how to apply fine-grained access control in a high performance and flexible authorization.

The PoC uses a Keycloak custom extension [keycloak-openfga-event-listener](https://github.com/embesozzi/keycloak-openfga-event-listener) which:
1. listens to the Keycloak events: 
   * User Role Assignment
   * User Group Assignment
   * Role to Role Assignment 
   * User Group Assignment 
2. translates this event to an OpenFGA tuple
3. publishes the event to the OpenFGA Solution

This workshop is based the following article [Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)](https://embesozzi.medium.com/keycloak-integration-with-openfga-based-on-zanzibar-for-fine-grained-authorization-at-scale-d3376de00f9a). You will find there full details about the authorization architecture guidelines and involved components.

Nevertheless, here is the overview of the components:

![solution-architecture](doc/images/solution-architecture.png)

## Components
The following components are running as containers:

* Core 
    * Keycloak is configured with custom extension openga-events to send the events to a Kafka Cluster (Point A)
    * OpenFGA is configured with the Keycloak Authorization Model in the store called "keycloak" (Point C)
    * Kakfa Cluster for handling the events
    * Kafka consumer `kafka-consumer-openfga` was configured to send the events to the OpenFGA solution with the SDK (Point B)
* Apps:
    * Product catalog web application `oidc-store-app` is integrated with Keycloak to authenticate the users
    * API product catalog `oidc-openfga-api` is protected by OAuth and it utilizes the OpenFGA SDK to enforce relationship-based access control (ReBAC)

## Prerequisites

 * Install Git, [Docker](https://www.docker.com/get-docker) and [Docker Compose](https://docs.docker.com/compose/install/#install-compose) in order to run the steps provided in the next section<br>

## Use Case Overview

As an example, we will implement an Product Catalog web application that has the following requirements:
* Only authenticated user with MFA can access to the application
* Product can be viewed by their Analyst
* Product can be edited by their Admin
* Global Admin users can view or edit any Product

More details are described in the [article](https://embesozzi.medium.com/keycloak-integration-with-openfga-based-on-zanzibar-for-fine-grained-authorization-at-scale-d3376de00f9a)

## Getting Started

1. Clone this repository
    ````bash
    git clone https://github.com/embesozzi/keycloak-openfga-workshops
    cd keycloak-openfga-workshops
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

    | Component                 |  URI                          |  Username   | Password    |
    | ------------------------- |:-----------------------------:|:-----------:|:-----------:|
    | Keycloak Admin            |   http://keycloak:8081        |  admin      |  passwords  |
    | OpenFGA Playground        |   http://localhost:3000       |             |             |
    | OpenFGA API               |   http://localhost:8080       |             |             |
    | Store Portal              |   http://store:9090           |             |             |
    | Store API                 |   http://store-api:9091       |             |             |


## Post configuration steps

### OpenFGA
1. Import the OpenFGA authorization schema for Keycloak just running the following commands:
``` bash
cd openfga
./import.sh
```
2. As the result you will in OpenFGA Playground the following OpenFGA Authorization Model:

![openfga-keycloak-authorization-model](doc/images/openfga-authz-model.png)

### Keycloak
1. Enable OpenFGA Event listener extension in Keycloak

    * Open administration console
    * Choose realm
    * Go to Events
    * Open `Config` tab and add `openfga-events` to Event Listeners.

2. Create the OAuth Public Client for the Store Application

    * Open administration console
    * Choose `master` realm
    * Click Clients in the menu -> Create client
    * Complete the Client ID and Client Name: `portal` with scopes: `openid profile` -> Next -> Save
    * Complete Access settings: 
        * Valid redirect URIs: `http://store:9090/callback`
        * Web origins: `http://store:9090`
    * Click Save.

3. Restart the apps (containers: `store-oidc-app` and `store-openfga-api`)

## Test cases
You can follow the test cases described in the article [Keycloak integration with OpenFGA (based on Zanzibar) for Fine-Grained Authorization at Scale (ReBAC)](https://embesozzi.medium.com/keycloak-integration-with-openfga-based-on-zanzibar-for-fine-grained-authorization-at-scale-d3376de00f9a)

In the article you will see an example of the keycloak Role and Group model and how the API is protecting the services based on the OpenFGA authorization model.
